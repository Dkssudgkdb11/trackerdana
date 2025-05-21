import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DayEntry } from '@/types';

interface TimeStoreState {
  // 각 사용자별 entries를 저장하는 객체
  userEntries: Record<string, Record<string, DayEntry>>;
  // 현재 로그인한 사용자 ID
  currentUserId: string | null;
  // 특정 사용자 ID 설정
  setCurrentUserId: (userId: string | null) => void;
  // 현재 사용자의 특정 날짜 데이터 설정
  setEntry: (date: string, entry: DayEntry) => void;
  // 현재 사용자의 특정 날짜 데이터 삭제
  deleteEntry: (date: string) => void;
  // 현재 사용자의 모든 데이터 삭제
  clearCurrentUserEntries: () => void;
  // 모든 사용자의 모든 데이터 삭제
  clearAllEntries: () => void;
  // 현재 사용자의 모든 entries 조회
  getCurrentUserEntries: () => Record<string, DayEntry>;
}

// 사용자별로 데이터를 분리해서 저장하는 store
export const useTimeStore = create<TimeStoreState>()(
  persist(
    (set, get) => ({
      userEntries: {},
      currentUserId: null,
      
      setCurrentUserId: (userId: string | null) => 
        set({ currentUserId: userId }),
      
      setEntry: (date: string, entry: DayEntry) => 
        set((state) => {
          // 현재 사용자 ID가 없으면 아무 작업도 하지 않음
          if (!state.currentUserId) return state;
          
          // 현재 사용자의 entries 가져오기 (없으면 빈 객체 생성)
          const userEntries = state.userEntries[state.currentUserId] || {};
          
          return {
            userEntries: {
              ...state.userEntries,
              [state.currentUserId]: {
                ...userEntries,
                [date]: entry
              }
            }
          };
        }),
      
      deleteEntry: (date: string) => 
        set((state) => {
          // 현재 사용자 ID가 없으면 아무 작업도 하지 않음
          if (!state.currentUserId) return state;
          
          // 현재 사용자의 entries가 없으면 아무 작업도 하지 않음
          if (!state.userEntries[state.currentUserId]) return state;
          
          const newUserEntries = { ...state.userEntries[state.currentUserId] };
          delete newUserEntries[date];
          
          return {
            userEntries: {
              ...state.userEntries,
              [state.currentUserId]: newUserEntries
            }
          };
        }),
      
      clearCurrentUserEntries: () => 
        set((state) => {
          // 현재 사용자 ID가 없으면 아무 작업도 하지 않음
          if (!state.currentUserId) return state;
          
          const newUserEntries = { ...state.userEntries };
          newUserEntries[state.currentUserId] = {};
          
          return { userEntries: newUserEntries };
        }),
      
      clearAllEntries: () => set({ userEntries: {} }),
      
      getCurrentUserEntries: () => {
        const state = get();
        // 현재 사용자 ID가 없거나 해당 사용자의 entries가 없으면 빈 객체 반환
        if (!state.currentUserId || !state.userEntries[state.currentUserId]) {
          return {};
        }
        return state.userEntries[state.currentUserId];
      },
    }),
    {
      name: 'time-tracker-storage',
    }
  )
);
