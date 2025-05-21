import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { useTimeStore } from "./store";

/**
 * 넷플리파이 정적 호스팅을 위한 클라이언트 전용 코드
 * API 호출 대신 로컬 스토리지를 사용합니다.
 */

// 호환성을 위해 유지하는 함수
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// 로컬 스토리지 기반의 API 요청 함수
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // 실제 API 호출은 하지 않고 로컬 스토리지에 저장된 데이터만 사용
  console.log(`API 요청 (메서드: ${method}, URL: ${url})`);
  
  // 응답 객체 생성 (모의 응답)
  const mockResponse = new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
  
  return mockResponse;
}

// 쿼리 함수 타입 정의
type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  () =>
  async ({ queryKey }) => {
    // 쿼리키에서 타입과 매개변수 해석
    const queryPath = queryKey[0] as string;
    
    // 시간 데이터 관련 쿼리인 경우 로컬 스토리지에서 가져옴
    if (queryPath.includes('time-entries')) {
      return useTimeStore.getState().getCurrentUserEntries();
    }
    
    // 기본값 반환
    return {};
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
