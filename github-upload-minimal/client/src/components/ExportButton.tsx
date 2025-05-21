import { Button } from "./ui/button";
import { FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ExportButtonProps {
  year: number;
  month: number;
  userId: number;
}

export default function ExportButton({ year, month, userId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportToExcel = async () => {
    try {
      setIsExporting(true);
      
      // Get auth token from localStorage
      const userJson = localStorage.getItem("user");
      if (!userJson) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      const user = JSON.parse(userJson);
      const token = user.token;
      
      if (!token) {
        toast({
          title: "인증 오류",
          description: "세션이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        return;
      }

      // Create filename with month name
      const monthNames = [
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월"
      ];
      const fileName = `근무시간-${year}년-${monthNames[month - 1]}.xlsx`;
      
      // Fetch Excel file
      const response = await fetch(
        `/api/export/month?userId=${userId}&year=${year}&month=${month}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("엑셀 내보내기 실패");
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "내보내기 완료",
        description: "엑셀 파일이 다운로드되었습니다.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "내보내기 오류",
        description: "엑셀 파일 생성 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToExcel}
      disabled={isExporting}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? "생성 중..." : "엑셀로 내보내기"}
    </Button>
  );
}