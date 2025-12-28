
import { WorkoutFormat, ReadinessState, ReadinessLevel } from './types';
import { FORMAT_PERCENTAGES, READINESS_ADJUSTMENTS } from './constants';

/**
 * DETERMINATION DE L'AJUSTEMENT DU JOUR
 * On prend le niveau le plus bas parmi les 3 indicateurs pour être conservateur.
 */
export const getDailyMultiplier = (state: ReadinessState): number => {
  const levels: ReadinessLevel[] = [state.sleep, state.form, state.motivation];
  
  if (levels.includes('POOR')) return READINESS_ADJUSTMENTS['POOR'];
  if (levels.includes('MEDIUM')) return READINESS_ADJUSTMENTS['MEDIUM'];
  return READINESS_ADJUSTMENTS['GOOD'];
};

/**
 * CALCUL DE LA CHARGE
 * Formule: 1RM * %Format * MultiplicateurEtat
 * Arrondi: au 2.5kg inférieur (conservateur)
 */
export const calculateLoad = (oneRM: number, format: WorkoutFormat, multiplier: number): number => {
  const basePercentage = FORMAT_PERCENTAGES[format];
  const rawLoad = oneRM * basePercentage * multiplier;
  
  // Arrondi à 2.5kg (ex: 82.3 -> 80, 84.9 -> 82.5)
  // On utilise floor pour rester conservateur comme demandé
  return Math.floor(rawLoad / 2.5) * 2.5;
};
