/**
 * @file page.tsx
 * @description Clerk 기반 로그인/회원가입 페이지 (Catch-all 라우트)
 *
 * 이 파일은 Clerk의 사전 구축된 SignIn 컴포넌트를 사용하여
 * 로그인 및 회원가입 기능을 제공합니다.
 *
 * 주요 기능:
 * - 이메일/비밀번호 로그인
 * - 소셜 로그인 (Google 등)
 * - 회원가입 자동 전환
 * - 비밀번호 재설정
 * - 이메일 인증
 *
 * @dependencies
 * - @clerk/nextjs
 */

import { SignIn } from "@clerk/nextjs";

/**
 * 로그인/회원가입 통합 페이지 (Catch-all 라우트)
 *
 * Clerk의 SignIn 컴포넌트를 사용하여 다음 기능 제공:
 * - 이메일/비밀번호 로그인
 * - 소셜 로그인 (Google, 카카오 등)
 * - 회원가입 (자동 전환)
 * - 비밀번호 재설정
 * - 이메일 인증
 */
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-12 bg-muted/10">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-md w-full max-w-screen-sm",
            headerTitle: "text-2xl sm:text-3xl",
            headerSubtitle: "text-base sm:text-lg",
            formButtonPrimary:
              "bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg",
            formFieldInput: "h-12",
            footerActionLink: "text-primary hover:text-primary/90",
            // 다크 모드 지원
            logoBox: "dark:brightness-100",
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/login"
        fallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
