import { queryClient } from "./queryClient";
import { DayEntry } from "@/types";
import { useTimeStore } from "./store";

/**
 * 넷플리파이 정적 호스팅을 위한 클라이언트 전용 API
 * 모든 데이터는 로컬 스토리지에 저장되며 서버 없이도 동작합니다.
 */

export const timeEntryApi = {
  // 특정 월의 모든 항목 가져오기
  async getMonthEntries(year: number, month: number): Promise<Record<string, DayEntry>> {
    try {
      // 현재 사용자의 모든 항목 가져오기
      const entries = useTimeStore.getState().getCurrentUserEntries();
      
      // 해당 월에 해당하는 항목만 필터링
      const filteredEntries: Record<string, DayEntry> = {};
      Object.entries(entries).forEach(([date, entry]) => {
        const entryDate = new Date(date);
        if (entryDate.getFullYear() === year && entryDate.getMonth() + 1 === month) {
          filteredEntries[date] = entry;
        }
      });
      
      return filteredEntries;
    } catch (error) {
      console.error("Error fetching month entries:", error);
      return {};
    }
  },
  
  // 특정 날짜의 항목 가져오기
  async getDateEntry(date: string): Promise<DayEntry | null> {
    try {
      const entries = useTimeStore.getState().getCurrentUserEntries();
      return entries[date] || null;
    } catch (error) {
      console.error("Error fetching date entry:", error);
      return null;
    }
  },
  
  // 항목 저장하기
  async saveEntry(date: string, entry: DayEntry): Promise<void> {
    try {
      // 항목 저장
      useTimeStore.getState().setEntry(date, entry);
      
      // 캐시 무효화
      const dateObj = new Date(date);
      queryClient.invalidateQueries({ 
        queryKey: [`time-entries-${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`] 
      });
    } catch (error) {
      console.error("Error saving entry:", error);
      throw error;
    }
  },
  
  // 항목 삭제하기
  async deleteEntry(date: string): Promise<void> {
    try {
      // 항목 삭제
      useTimeStore.getState().deleteEntry(date);
      
      // 캐시 무효화
      const dateObj = new Date(date);
      queryClient.invalidateQueries({ 
        queryKey: [`time-entries-${dateObj.getFullYear()}-${dateObj.getMonth() + 1}`] 
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      throw error;
    }
  }
};