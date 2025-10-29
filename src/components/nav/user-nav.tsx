/**
 * @file user-nav.tsx
 * @description Clerk 기반 사용자 프로필 메뉴 컴포넌트
 *
 * 이 컴포넌트는 사용자 인증 상태에 따라 로그인 버튼 또는
 * Clerk UserButton (프로필 드롭다운)을 표시합니다.
 */

"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

/**
 * 사용자 네비게이션 컴포넌트
 *
 * - 로그인 전: 로그인 버튼 표시
 * - 로그인 후: Clerk UserButton (프로필 이미지 + 드롭다운)
 */
export default function UserNav() {
  const { isSignedIn, isLoaded } = useUser();
  const [mounted, setMounted] = useState(false);

  // 클라이언트에서만 마운트 상태를 true로 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 서버 사이드에서는 항상 로딩 상태를 표시하여 Hydration Mismatch 방지
  if (!mounted || !isLoaded) {
    return <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />;
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <Button>로그인</Button>
      </SignInButton>
    );
  }

  return (
    <UserButton
      afterSignOutUrl="/"
      appearance={{
        elements: {
          avatarBox: "h-10 w-10",
          userButtonPopoverCard: "shadow-lg",
        },
      }}
    />
  );
}
