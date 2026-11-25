import { useContext } from 'react';
import { LearningContext } from '../contexts/LearningContext';
export function useLearning() { const state = useContext(LearningContext); if (!state) throw new Error('useLearning requires LearningProvider'); return state; }
