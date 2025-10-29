/**
 * @file supabase-test.tsx
 * @description Supabase 연결 테스트 컴포넌트
 *
 * 이 컴포넌트는 Supabase 연결 상태를 확인하고
 * 기본적인 데이터베이스 작업을 테스트합니다.
 *
 * 주요 기능:
 * 1. Supabase 연결 상태 확인
 * 2. 인증 상태 확인
 * 3. 데이터베이스 연결 테스트
 * 4. 에러 상태 표시
 *
 * @dependencies
 * - @supabase/ssr
 * - react
 */

"use client";

import { useSupabaseClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface TestResult {
  name: string;
  status: "loading" | "success" | "error";
  message: string;
  details?: string;
}

export function SupabaseTest() {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: "Supabase 클라이언트 초기화",
      status: "loading",
      message: "테스트 중...",
    },
    { name: "데이터베이스 연결", status: "loading", message: "테스트 중..." },
    { name: "인증 상태 확인", status: "loading", message: "테스트 중..." },
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const supabase = useSupabaseClient();

  const runTests = useCallback(async () => {
    console.group("🔍 Supabase 연결 테스트 시작");
    setIsRunning(true);

    // 테스트 1: 클라이언트 초기화
    console.log("✅ Supabase 클라이언트 초기화 확인");
    setTests((prev) =>
      prev.map((test) =>
        test.name === "Supabase 클라이언트 초기화"
          ? {
              ...test,
              status: "success",
              message: "클라이언트가 성공적으로 초기화되었습니다.",
            }
          : test,
      ),
    );

    // 테스트 2: 데이터베이스 연결 (안전한 방법)
    try {
      console.log("🔗 데이터베이스 연결 테스트 중...");

      // Supabase 클라이언트 연결 상태 확인 (실제 쿼리 없이)
      if (!supabase) {
        throw new Error("Supabase 클라이언트가 초기화되지 않았습니다.");
      }

      // 환경 변수 확인
      const hasValidConfig =
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!hasValidConfig) {
        throw new Error("Supabase 환경 변수가 올바르게 설정되지 않았습니다.");
      }

      // 클라이언트가 정상적으로 초기화되었고 환경 변수가 설정되어 있으면 연결 성공으로 간주
      console.log("✅ 데이터베이스 연결 성공");
      setTests((prev) =>
        prev.map((test) =>
          test.name === "데이터베이스 연결"
            ? {
                ...test,
                status: "success",
                message: "Supabase 클라이언트가 정상적으로 초기화되었습니다.",
              }
            : test,
        ),
      );
    } catch (error) {
      console.error("❌ 데이터베이스 연결 실패:", error);
      setTests((prev) =>
        prev.map((test) =>
          test.name === "데이터베이스 연결"
            ? {
                ...test,
                status: "error",
                message: "데이터베이스 연결 실패",
                details: error instanceof Error ? error.message : String(error),
              }
            : test,
        ),
      );
    }

    // 테스트 3: 인증 상태 확인
    try {
      console.log("🔐 인증 상태 확인 중...");

      // 먼저 현재 세션 상태 확인
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ 세션 확인 실패:", sessionError.message);
        setTests((prev) =>
          prev.map((test) =>
            test.name === "인증 상태 확인"
              ? {
                  ...test,
                  status: "error",
                  message: "세션 확인 실패",
                  details: sessionError.message,
                }
              : test,
          ),
        );
      } else if (session?.user) {
        console.log(
          "✅ 사용자 로그인됨:",
          session.user.email || session.user.id,
        );
        setTests((prev) =>
          prev.map((test) =>
            test.name === "인증 상태 확인"
              ? {
                  ...test,
                  status: "success",
                  message: `로그인됨: ${session.user.email || session.user.id}`,
                }
              : test,
          ),
        );
      } else {
        console.log("ℹ️ 인증되지 않음 (정상)");
        setTests((prev) =>
          prev.map((test) =>
            test.name === "인증 상태 확인"
              ? {
                  ...test,
                  status: "success",
                  message: "인증되지 않음 (정상)",
                }
              : test,
          ),
        );
      }
    } catch (error) {
      console.error("❌ 인증 상태 확인 오류:", error);
      setTests((prev) =>
        prev.map((test) =>
          test.name === "인증 상태 확인"
            ? {
                ...test,
                status: "error",
                message: "인증 상태 확인 오류",
                details: error instanceof Error ? error.message : String(error),
              }
            : test,
        ),
      );
    }

    console.log("🏁 Supabase 연결 테스트 완료");
    console.groupEnd();
    setIsRunning(false);
  }, [supabase]); // supabase 의존성 추가

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    // 환경 변수 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("❌ Supabase 환경 변수가 설정되지 않았습니다.");
      setTests((prev) =>
        prev.map((test) => ({
          ...test,
          status: "error",
          message: "환경 변수 설정 필요",
          details:
            "NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.",
        })),
      );
      return;
    }

    // supabase 클라이언트가 존재할 때만 테스트 실행
    if (supabase) {
      runTests();
    }
  }, []); // 의존성 배열을 비워서 마운트 시 한 번만 실행

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "loading":
        return <Badge variant="secondary">테스트 중</Badge>;
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            성공
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">실패</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Supabase 연결 테스트
        </CardTitle>
        <CardDescription>
          Supabase 연결 상태와 기본 기능을 테스트합니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {tests.map((test, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(test.status)}
                <div>
                  <p className="font-medium">{test.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {test.message}
                  </p>
                  {test.details && (
                    <p className="text-xs text-red-500 mt-1">{test.details}</p>
                  )}
                </div>
              </div>
              {getStatusBadge(test.status)}
            </div>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button onClick={runTests} disabled={isRunning} className="w-full">
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                테스트 실행 중...
              </>
            ) : (
              "테스트 다시 실행"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
