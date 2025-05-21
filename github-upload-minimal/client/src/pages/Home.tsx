import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Calendar from "@/components/Calendar";
import DailyEntryModal from "@/components/DailyEntryModal";
import Statistics from "@/components/Statistics";
import ScreenshotButton from "@/components/ScreenshotButton";
import ExportButton from "@/components/ExportButton";
import { Button } from "@/components/ui/button";
import { DayEntry } from "@/types";
import { useTimeStore } from "@/lib/store";
import { LogOut } from "lucide-react";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();
  
  // 사용자별 스토어 함수들
  const { 
    getCurrentUserEntries, 
    setEntry, 
    setCurrentUserId 
  } = useTimeStore();
  
  // 현재 사용자의 항목들 가져오기
  const entries = getCurrentUserEntries();
  
  // Check for authenticated user
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (!userJson) {
      navigate("/login");
      return;
    }
    
    try {
      const userData = JSON.parse(userJson);
      setUser(userData);
      // 사용자 ID를 스토어에 설정
      setCurrentUserId(String(userData.id));
    } catch (error) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate, setCurrentUserId]);

  // Handle monthly navigation
  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  // Handle date selection
  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  // Handle entry save
  const handleSaveEntry = (date: string, entry: DayEntry) => {
    setEntry(date, entry);
  };
  
  // We don't need this anymore as logout is handled in the Header component
  // const handleLogout = () => {
  //   localStorage.removeItem("user");
  //   navigate("/login");
  // };

  // If not authenticated, don't render anything
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header 
        currentMonth={currentMonth}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
        username={user.username}
      />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 flex flex-col space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">근무 시간 관리</h1>
          <div>
            <ScreenshotButton targetRef={calendarRef} filename={`근무시간-${currentMonth.getFullYear()}년-${currentMonth.getMonth()+1}월.png`} />
          </div>
        </div>
        
        <div ref={calendarRef}>
          <Calendar 
            currentMonth={currentMonth}
            entries={entries}
            onDateClick={handleDateClick}
            onPreviousMonth={handlePreviousMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
          />
          
          <Statistics 
            entries={entries}
            currentMonth={currentMonth}
          />
        </div>
      </main>
      
      {selectedDate && (
        <DailyEntryModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          date={selectedDate}
          entry={entries[selectedDate] || null}
          onSave={handleSaveEntry}
        />
      )}
    </div>
  );
}
