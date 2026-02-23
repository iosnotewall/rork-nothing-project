import { useCallback, useEffect, useState, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';

export interface AppState {
  goal: string;
  gapScore: number;
  products: string[];
  routineTime: string;
  userName: string;
  currentStreak: number;
  longestStreak: number;
  totalDaysTaken: number;
  lastCheckedIn: string | null;
  checkInHistory: string[];
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  frequency: number;
  friction: string;
  energyLevel: number;
  commitmentLevel: string;
  missedDoses: number;
}

const DEFAULT_STATE: AppState = {
  goal: '',
  gapScore: 0,
  products: [],
  routineTime: '08:00',
  userName: '',
  currentStreak: 0,
  longestStreak: 0,
  totalDaysTaken: 0,
  lastCheckedIn: null,
  checkInHistory: [],
  onboardingComplete: false,
  notificationsEnabled: false,
  frequency: 0,
  friction: '',
  energyLevel: 0,
  commitmentLevel: '',
  missedDoses: 0,
};

const STORAGE_KEY = 'ivb_app_state';

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const queryClient = useQueryClient();

  const stateQuery = useQuery({
    queryKey: ['appState'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return { ...DEFAULT_STATE, ...JSON.parse(stored) } as AppState;
        } catch {
          return DEFAULT_STATE;
        }
      }
      return DEFAULT_STATE;
    },
    staleTime: Infinity,
    initialData: DEFAULT_STATE,
  });

  const saveMutation = useMutation({
    mutationFn: async (newState: AppState) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    },
  });

  useEffect(() => {
    if (stateQuery.data) {
      setState(stateQuery.data);
    }
  }, [stateQuery.data]);

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => {
      const next = { ...prev, ...updates };
      saveMutation.mutate(next);
      return next;
    });
  }, [saveMutation]);

  const checkIn = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setState(prev => {
      if (prev.lastCheckedIn === today) return prev;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      const isConsecutive = prev.lastCheckedIn === yesterdayStr;
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;
      const newLongest = Math.max(prev.longestStreak, newStreak);

      const next: AppState = {
        ...prev,
        lastCheckedIn: today,
        checkInHistory: [...prev.checkInHistory, today],
        currentStreak: newStreak,
        longestStreak: newLongest,
        totalDaysTaken: prev.totalDaysTaken + 1,
      };
      saveMutation.mutate(next);
      return next;
    });
  }, [saveMutation]);

  const isCheckedInToday = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return state.lastCheckedIn === today;
  }, [state.lastCheckedIn]);

  const currentDay = useMemo(() => {
    if (state.checkInHistory.length === 0) return 1;
    return state.totalDaysTaken + (isCheckedInToday ? 0 : 1);
  }, [state.totalDaysTaken, state.checkInHistory.length, isCheckedInToday]);

  return {
    ...state,
    isLoading: stateQuery.isLoading,
    updateState,
    checkIn,
    isCheckedInToday,
    currentDay,
  };
});
