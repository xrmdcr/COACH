
import React, { useState, useEffect } from 'react';
import { WorkoutSession, ReadinessState, Exercise, WorkoutFormat } from './types';
import { getDailyMultiplier, calculateLoad } from './logic';

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center flex-1 py-3 transition-all ${active ? 'text-blue-500 scale-105' : 'text-zinc-600'}`}
  >
    <span className="text-2xl mb-1">{icon}</span>
    <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
  </button>
);

const ReadinessButton: React.FC<{ label: string; active: boolean; onClick: () => void; color: string }> = ({ label, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-5 px-1 rounded-2xl font-black transition-all border-2 text-base ${
      active ? `${color} border-white shadow-lg text-white` : 'bg-zinc-900 border-zinc-800 text-zinc-600'
    }`}
  >
    {label}
  </button>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<'SESSIONS' | 'PROFILE' | 'READINESS' | 'WORKOUT' | 'SESSION_EDITOR'>('SESSIONS');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [editingSession, setEditingSession] = useState<Partial<WorkoutSession> | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'IDLE' | 'SAVING' | 'SAVED'>('IDLE');
  
  const [readiness, setReadiness] = useState<ReadinessState>({
    sleep: 'GOOD',
    form: 'GOOD',
    motivation: 'GOOD',
  });

  useEffect(() => {
    const savedEx = localStorage.getItem('loadmaster_exercises');
    const savedSes = localStorage.getItem('loadmaster_sessions');
    
    if (savedEx) {
      setExercises(JSON.parse(savedEx));
    } else {
      setExercises([
        { id: '1', name: 'Développé Couché', oneRM: 0 },
        { id: '2', name: 'Squat', oneRM: 0 },
        { id: '3', name: 'Deadlift', oneRM: 0 },
        { id: '4', name: 'Tractions', oneRM: 0 },
        { id: '5', name: 'Dips', oneRM: 0 },
      ]);
      setIsOnboarding(true);
      setScreen('PROFILE');
    }
    if (savedSes) setSessions(JSON.parse(savedSes));
  }, []);

  useEffect(() => {
    if (exercises.length > 0) localStorage.setItem('loadmaster_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    if (sessions.length > 0) localStorage.setItem('loadmaster_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const startWorkout = (session: WorkoutSession) => {
    setSelectedSession(session);
    setScreen('READINESS');
  };

  const saveSession = () => {
    if (!editingSession || !editingSession.id) return;
    
    const sessionToSave = {
      ...editingSession,
      name: editingSession.name || 'Sans titre',
      exercises: editingSession.exercises || []
    } as WorkoutSession;

    setSessions(prev => {
      const exists = prev.find(s => s.id === sessionToSave.id);
      if (exists) {
        return prev.map(s => s.id === sessionToSave.id ? sessionToSave : s);
      }
      return [...prev, sessionToSave];
    });
    setScreen('SESSIONS');
    setEditingSession(null);
  };

  const handleManualSaveRecords = () => {
    setSaveStatus('SAVING');
    localStorage.setItem('loadmaster_exercises', JSON.stringify(exercises));
    setTimeout(() => {
      setSaveStatus('SAVED');
      setTimeout(() => setSaveStatus('IDLE'), 2000);
    }, 500);
  };

  const removeExerciseFromSession = (idx: number) => {
    if (!editingSession) return;
    const upd = [...(editingSession.exercises || [])];
    upd.splice(idx, 1);
    setEditingSession({...editingSession, exercises: upd});
  };

  const formatDisplay = (format: WorkoutFormat) => {
    if (format === 'SPEED') return '6x3';
    return format;
  };

  const renderHeader = (title: string, subtitle?: string) => (
    <header className="px-6 pt-12 pb-6 bg-black border-b border-zinc-900 shrink-0">
      <h1 className="text-3xl font-black tracking-tighter italic text-white uppercase leading-none">{title}</h1>
      {subtitle && <p className="text-blue-500 font-black text-[10px] uppercase tracking-[0.2em] mt-2">{subtitle}</p>}
    </header>
  );

  const renderWorkout = () => {
    if (!selectedSession) return null;
    const multiplier = getDailyMultiplier(readiness);
    const adj = Math.round((multiplier - 1) * 100);

    return (
      <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
        <header className="px-6 pt-12 pb-6 bg-zinc-950 border-b border-zinc-900 shrink-0 flex justify-between items-center">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-black text-white italic uppercase leading-none truncate">{selectedSession.name}</h1>
            <div className={`inline-block mt-2 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${adj < 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30' : 'bg-green-500/10 text-green-500 border border-green-500/30'}`}>
              {adj === 0 ? 'NOMINAL' : `ADAPTÉ ${adj}%`}
            </div>
          </div>
          <button 
            onClick={() => {
               setScreen('SESSIONS');
               setSelectedSession(null);
            }}
            className="ml-4 px-5 py-3 bg-zinc-900 text-zinc-200 font-bold text-[11px] rounded-xl border border-zinc-800 active:bg-zinc-700 cursor-pointer"
          >
            QUITTER
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-6 pb-40">
          {selectedSession.exercises.map((se, i) => {
            const ex = exercises.find(e => e.id === se.exerciseId);
            const load = ex ? calculateLoad(ex.oneRM, se.format, multiplier) : 0;
            return (
              <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] flex justify-between items-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-blue-600"></div>
                <div className="flex-1 min-w-0 pr-4">
                  <p className="text-zinc-600 text-[8px] font-black uppercase tracking-widest mb-1 truncate">{ex?.name || 'Inconnu'}</p>
                  <p className="text-2xl font-black text-white italic">{formatDisplay(se.format)}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white tabular-nums tracking-tighter">{load}</span>
                    <span className="text-lg font-black text-blue-500 italic uppercase leading-none">kg</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black via-black to-transparent z-[110]">
          <button 
            onClick={() => {
              setScreen('SESSIONS');
              setSelectedSession(null);
            }} 
            className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl shadow-2xl active:bg-zinc-200 cursor-pointer block text-center uppercase"
          >
            SÉANCE TERMINÉE
          </button>
        </div>
      </div>
    );
  };

  const renderReadiness = () => (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
      {renderHeader("Check-in", "ÉTAT PHYSIOLOGIQUE DU JOUR")}
      <div className="flex-1 px-6 space-y-10 overflow-y-auto pt-6 pb-32">
        {(['sleep', 'form', 'motivation'] as const).map((type) => (
          <section key={type}>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4 text-center">{type === 'sleep' ? 'Sommeil' : type === 'form' ? 'Forme' : 'Motivation'}</p>
            <div className="flex gap-2">
              <ReadinessButton label="BAS" active={readiness[type] === 'POOR'} color="bg-red-700" onClick={() => setReadiness({...readiness, [type]: 'POOR'})} />
              <ReadinessButton label="OK" active={readiness[type] === 'MEDIUM'} color="bg-zinc-800" onClick={() => setReadiness({...readiness, [type]: 'MEDIUM'})} />
              <ReadinessButton label="TOP" active={readiness[type] === 'GOOD'} color="bg-green-700" onClick={() => setReadiness({...readiness, [type]: 'GOOD'})} />
            </div>
          </section>
        ))}
      </div>
      <div className="p-6 pb-12">
        <button 
          onClick={() => setScreen('WORKOUT')}
          className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xl shadow-xl active:bg-blue-500 cursor-pointer"
        >
          CALCULER LES CHARGES
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-black text-white flex flex-col font-inter overflow-hidden relative">
      <main className="flex-1 relative overflow-hidden">
        {screen === 'SESSIONS' && (
          <div className="flex flex-col h-full bg-black">
            {renderHeader("Mes Séances", `${sessions.length} PROGRAMMÉES`)}
            <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-4 pb-32">
              {sessions.map((s) => (
                <div key={s.id} className="relative active:scale-[0.98] transition-transform">
                  <button 
                    onClick={() => startWorkout(s)}
                    className="w-full bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] text-left shadow-lg cursor-pointer"
                  >
                    <h3 className="text-xl font-black text-white leading-tight pr-12">{s.name}</h3>
                    <p className="text-zinc-500 text-[9px] font-black uppercase mt-2 tracking-widest">{s.exercises.length} EXERCICES</p>
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditingSession(s); setScreen('SESSION_EDITOR'); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center text-zinc-500 bg-black/40 rounded-full border border-zinc-800 cursor-pointer"
                  >
                    <span className="text-lg">⚙️</span>
                  </button>
                </div>
              ))}
              <button 
                onClick={() => { setEditingSession({ id: Date.now().toString(), name: '', exercises: [] }); setScreen('SESSION_EDITOR'); }}
                className="w-full py-6 rounded-[2rem] border-2 border-dashed border-zinc-900 text-zinc-700 font-black uppercase tracking-[0.2em] text-[10px] active:bg-zinc-900 cursor-pointer"
              >
                + AJOUTER UNE SÉANCE
              </button>
            </div>
          </div>
        )}

        {screen === 'PROFILE' && (
          <div className="flex flex-col h-full bg-black relative">
            {renderHeader("Records", "MAXIMUMS 1RM")}
            <div className="flex-1 overflow-y-auto px-6 space-y-4 pt-4 pb-48">
              {exercises.map((ex) => (
                <div key={ex.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-[1.8rem] flex items-center gap-4">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">EXERCICE</span>
                    <input 
                      value={ex.name}
                      onChange={e => setExercises(exercises.map(item => item.id === ex.id ? {...item, name: e.target.value} : item))}
                      className="bg-transparent text-white font-black text-lg outline-none focus:text-blue-400 truncate w-full"
                    />
                  </div>
                  <div className="flex flex-col items-end w-[120px] shrink-0">
                    <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">CHARGE (KG)</span>
                    <div className="flex items-center w-full bg-black border border-zinc-800 rounded-xl px-3 py-2">
                      <input 
                        type="number"
                        inputMode="decimal"
                        value={ex.oneRM || ''}
                        placeholder="0"
                        onChange={e => setExercises(exercises.map(item => item.id === ex.id ? {...item, oneRM: parseFloat(e.target.value) || 0} : item))}
                        className="bg-transparent text-blue-500 font-black text-xl w-full text-right outline-none tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setExercises([...exercises, { id: Date.now().toString(), name: 'Nouveau', oneRM: 0 }])}
                className="w-full py-5 text-zinc-600 font-black border border-zinc-800 rounded-[1.8rem] text-[9px] uppercase tracking-widest active:bg-zinc-900 cursor-pointer"
              >
                + AJOUTER UN EXERCICE
              </button>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-12 bg-gradient-to-t from-black via-black to-transparent z-40">
              {isOnboarding ? (
                <button 
                  onClick={() => setIsOnboarding(false)} 
                  className="w-full bg-white text-black py-6 rounded-[2rem] font-black text-xl shadow-2xl cursor-pointer uppercase"
                >
                  VALIDER MES RECORDS
                </button>
              ) : (
                <button 
                  onClick={handleManualSaveRecords}
                  disabled={saveStatus !== 'IDLE'}
                  className={`w-full py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all active:scale-95 cursor-pointer uppercase flex items-center justify-center gap-3 ${
                    saveStatus === 'SAVED' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                  }`}
                >
                  {saveStatus === 'IDLE' && 'SAUVEGARDER LES RECORDS'}
                  {saveStatus === 'SAVING' && (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      ENREGISTREMENT...
                    </span>
                  )}
                  {saveStatus === 'SAVED' && 'RECORDS ENREGISTRÉS !'}
                </button>
              )}
            </div>
          </div>
        )}

        {screen === 'READINESS' && renderReadiness()}
        {screen === 'WORKOUT' && renderWorkout()}
        {screen === 'SESSION_EDITOR' && editingSession && (
          <div className="fixed inset-0 bg-black z-[100] flex flex-col overflow-hidden">
             {renderHeader("Édition", "VOTRE PROGRAMME")}
             <div className="flex-1 overflow-y-auto px-6 space-y-6 pt-4 pb-40">
               <div className="space-y-1">
                 <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">Nom de la séance</label>
                 <input 
                  placeholder="Ex: Push Heavy"
                  value={editingSession.name}
                  onChange={e => setEditingSession({...editingSession, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-[1.5rem] text-lg font-black outline-none focus:border-blue-500"
                 />
               </div>

               {(editingSession.exercises || []).length === 0 ? (
                 <div className="py-20 text-center space-y-4">
                   <div className="text-4xl opacity-20 grayscale filter">🏋️‍♂️</div>
                   <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] px-12 leading-relaxed">
                     Votre séance est vide.<br/>Ajoutez votre premier exercice ci-dessous.
                   </p>
                 </div>
               ) : (
                 (editingSession.exercises || []).map((se, idx) => (
                   <div key={idx} className="bg-zinc-900 p-5 rounded-[1.8rem] border border-zinc-800 space-y-4">
                      <div className="flex gap-2">
                        <select 
                          value={se.exerciseId}
                          onChange={e => {
                            const upd = [...(editingSession.exercises || [])];
                            upd[idx].exerciseId = e.target.value;
                            setEditingSession({...editingSession, exercises: upd});
                          }}
                          className="flex-1 bg-black text-white font-black p-4 rounded-xl border border-zinc-800 outline-none appearance-none"
                        >
                          <option value="">Choisir l'exercice...</option>
                          {exercises.map(ex => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
                        </select>
                        <button 
                          onClick={() => removeExerciseFromSession(idx)}
                          className="w-14 h-14 shrink-0 flex items-center justify-center bg-red-950/20 text-red-500 border border-red-900/30 rounded-xl active:scale-95 transition-transform"
                        >
                          <span className="text-xl">🗑️</span>
                        </button>
                      </div>
                      <div className="flex gap-1">
                        {(['4x5', '3x5', '3x3', '1rep', 'SPEED'] as WorkoutFormat[]).map(f => (
                          <button key={f} onClick={() => {
                            const upd = [...(editingSession.exercises || [])];
                            upd[idx].format = f;
                            setEditingSession({...editingSession, exercises: upd});
                          }} className={`flex-1 py-2 text-[8px] font-black rounded-lg transition-all ${se.format === f ? 'bg-blue-600 text-white shadow-lg' : 'bg-black text-zinc-600 active:bg-zinc-800'}`}>{formatDisplay(f)}</button>
                        ))}
                      </div>
                   </div>
                 ))
               )}
               <button 
                onClick={() => setEditingSession({...editingSession, exercises: [...(editingSession.exercises || []), { exerciseId: exercises[0]?.id || '', format: '4x5' }]})}
                className="w-full py-5 text-zinc-600 font-black border border-zinc-800 border-dashed rounded-[1.8rem] text-[9px] uppercase tracking-widest cursor-pointer active:bg-zinc-900"
               >+ AJOUTER UN EXERCICE</button>
             </div>
             <div className="shrink-0 p-6 bg-zinc-950 border-t border-zinc-900 flex gap-4 safe-area-bottom">
                <button onClick={() => setScreen('SESSIONS')} className="flex-1 bg-zinc-900 text-zinc-500 py-4 rounded-xl font-black text-xs uppercase cursor-pointer">Annuler</button>
                <button onClick={saveSession} className="flex-[2] bg-blue-600 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg cursor-pointer">Enregistrer</button>
             </div>
          </div>
        )}
      </main>

      {(screen === 'SESSIONS' || screen === 'PROFILE') && !isOnboarding && (
        <nav className="h-20 bg-zinc-950 border-t border-zinc-900 flex items-center px-8 shrink-0 safe-area-bottom z-50">
          <NavButton label="SÉANCES" icon="⚡" active={screen === 'SESSIONS'} onClick={() => setScreen('SESSIONS')} />
          <div className="w-[1px] h-8 bg-zinc-900 mx-4 opacity-50"></div>
          <NavButton label="RECORDS" icon="🏆" active={screen === 'PROFILE'} onClick={() => setScreen('PROFILE')} />
        </nav>
      )}
    </div>
  );
};

export default App;
