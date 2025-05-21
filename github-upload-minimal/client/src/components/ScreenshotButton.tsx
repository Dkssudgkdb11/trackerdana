import { Button } from "./ui/button";
import { useState } from "react";
import { toPng } from "html-to-image";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ScreenshotButtonProps {
  targetRef: React.RefObject<HTMLElement>;
  filename?: string;
}

export default function ScreenshotButton({ 
  targetRef, 
  filename = "calendar-screenshot.png" 
}: ScreenshotButtonProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const captureScreenshot = async () => {
    if (!targetRef.current) {
      toast({
        title: "오류",
        description: "스크린샷을 캡처할 요소를 찾을 수 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCapturing(true);

      // Store original styles
      const element = targetRef.current;
      const originalWidth = element.style.width;
      const originalMaxWidth = element.style.maxWidth;
      const originalOverflow = element.style.overflow;

      // Set fixed width for consistent screenshot size
      element.style.width = "600px";
      element.style.maxWidth = "600px";
      element.style.overflow = "hidden";

      // Take screenshot
      const dataUrl = await toPng(element, { cacheBust: true });

      // Reset to original styles
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
      element.style.overflow = originalOverflow;

      // Create download link
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();

      toast({
        title: "스크린샷 저장 완료",
        description: "캘린더 스크린샷이 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "스크린샷 오류",
        description: "스크린샷 생성 중 문제가 발생했습니다.",
        variant: "destructive",
      });
      console.error("Screenshot error:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button 
      onClick={captureScreenshot}
      disabled={isCapturing}
      variant="outline"
      size="sm"
      className="flex items-center gap-1"
    >
      <Download className="h-4 w-4" />
      {isCapturing ? "캡처 중..." : "이미지로 저장"}
    </Button>
  );
}