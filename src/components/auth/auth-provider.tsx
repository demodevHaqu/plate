/**
 * @file auth-provider.tsx
 * @description Clerk 기반 인증 상태 관리를 위한 컨텍스트 프로바이더
 *
 * 이 컴포넌트는 Clerk 인증 상태를 전역적으로 관리하고 공유하기 위한
 * React 컨텍스트 프로바이더입니다.
 *
 * 주요 기능:
 * 1. 사용자 인증 상태 저장 및 제공
 * 2. Clerk의 useUser 훅을 래핑하여 기존 API와 호환성 유지
 * 3. 로딩 상태 관리
 *
 * 구현 로직:
 * - 클라이언트 컴포넌트로 구현 ('use client' 지시문)
 * - Clerk의 useUser 훅을 사용하여 인증 상태 관리
 * - AuthContext를 통한 상태 공유
 * - useAuth 훅을 통한 인증 컨텍스트 접근 편의성 제공
 *
 * @dependencies
 * - react
 * - @clerk/nextjs
 */

"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";

/**
 * Clerk 기반 인증 컨텍스트 타입
 */
type AuthContextType = {
  user: User | null | undefined;
  isLoading: boolean;
  isSignedIn: boolean | undefined;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isSignedIn: undefined,
});

/**
 * 인증 상태를 가져오는 커스텀 훅
 *
 * @example
 * const { user, isLoading, isSignedIn } = useAuth();
 *
 * if (isLoading) return <div>로딩 중...</div>;
 * if (!isSignedIn) return <div>로그인이 필요합니다</div>;
 * return <div>안녕하세요, {user.emailAddresses[0]?.emailAddress}</div>;
 */
export const useAuth = () => useContext(AuthContext);

/**
 * Clerk 인증 상태를 전역으로 제공하는 Provider
 *
 * Clerk의 useUser 훅을 래핑하여 기존 AuthProvider API와 호환성 유지
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded, isSignedIn } = useUser();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: !isLoaded,
        isSignedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
