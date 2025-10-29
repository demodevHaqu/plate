/**
 * @file client.ts
 * @description Clerk 인증과 통합된 Supabase 클라이언트 초기화 유틸리티
 *
 * 이 파일은 클라이언트 측에서 Clerk JWT 토큰을 사용하여 Supabase 서비스에 접근하기 위한
 * 브라우저 클라이언트를 생성합니다.
 *
 * 주요 기능:
 * 1. 브라우저 환경에서 Supabase 클라이언트 인스턴스 생성
 * 2. Clerk JWT 토큰을 Authorization 헤더에 추가
 * 3. 환경 변수를 통한 Supabase URL 및 익명 키 설정
 *
 * 구현 로직:
 * - @supabase/ssr 패키지의 createBrowserClient 함수를 사용하여 클라이언트 생성
 * - Clerk의 useAuth 훅을 통해 JWT 토큰 획득
 * - 토큰을 Authorization 헤더에 추가하여 Supabase RLS 정책과 통합
 *
 * @dependencies
 * - @supabase/ssr
 * - @clerk/nextjs
 */

"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useAuth } from "@clerk/nextjs";

/**
 * Clerk 인증과 통합된 Supabase 브라우저 클라이언트 생성
 *
 * 사용 방법:
 * ```tsx
 * const supabase = useSupabaseClient();
 * const { data } = await supabase.from('table').select();
 * ```
 *
 * @returns Clerk JWT 토큰이 통합된 Supabase 클라이언트
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          const token = await getToken();

          const headers = new Headers(options?.headers || {});
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    },
  );
}

/**
 * 레거시 지원: Supabase 브라우저 클라이언트 생성 (Clerk 토큰 없음)
 *
 * 이 함수는 React 컴포넌트 외부에서 사용할 수 있지만,
 * Clerk 토큰이 포함되지 않으므로 공개 버킷이나 인증이 필요없는
 * 작업에만 사용하세요.
 *
 * React 컴포넌트 내부에서는 useSupabaseClient()를 사용하세요.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
