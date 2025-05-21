import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { useLocation } from "wouter";
import { useTimeStore } from "@/lib/store";

interface HeaderProps {
  currentMonth: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  username?: string;
}

export default function Header({ onToday, username = "사용자" }: HeaderProps) {
  const [, navigate] = useLocation();
  const { setCurrentUserId } = useTimeStore();
  
  const handleLogout = () => {
    // 로그아웃 시 현재 사용자 ID를 null로 설정
    setCurrentUserId(null);
    // Clear user from local storage
    localStorage.removeItem("user");
    // Redirect to login page using wouter navigation
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold text-gray-900">시간 관리</h1>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onToday}>
            오늘
          </Button>
          <div className="px-3 py-1 text-sm font-medium text-gray-700 border-l border-gray-200">
            {username}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="로그아웃">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
