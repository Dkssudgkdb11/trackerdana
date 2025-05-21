import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useTimeStore } from "@/lib/store";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { setCurrentUserId } = useTimeStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 사용자 ID 생성 - 실제로는 사용자 이름의 해시값이나 UUID를 사용하는 것이 좋습니다.
      // 여기서는 사용자 이름을 기반으로 간단한 해시 함수를 사용합니다.
      const userId = String(
        username
          .split('')
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      );
      
      // 간단한 로그인 처리: 실제 인증 없이 로컬 스토리지에 사용자 정보 저장
      const user = {
        id: userId,
        username: username,
        name: username,
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem("user", JSON.stringify(user));
      
      // 사용자 ID를 스토어에 설정
      setCurrentUserId(userId);
      
      toast({
        title: "로그인 성공",
        description: "로그인되었습니다.",
      });
      
      // 로그인 후 홈페이지로 이동
      navigate("/");
    } catch (error) {
      toast({
        title: "오류",
        description: "로그인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md shadow-lg">
        <form onSubmit={handleLogin}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              시간 관리 시스템
            </CardTitle>
            <CardDescription className="text-center">
              시간 관리 시스템에 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">아이디</Label>
              <Input
                id="username"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                * 테스트 목적으로 어떤 아이디/비밀번호나 입력하면 로그인됩니다
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}