/**
 * @file navbar.tsx
 * @description 메인 네비게이션 바 컴포넌트
 *
 * 이 컴포넌트는 반응형 디자인에 맞게 데스크탑과 모바일 뷰를 통합합니다.
 * - 모바일: 햄버거 메뉴와 로고만 표시
 * - 데스크탑: 전체 네비게이션 메뉴와 사용자 정보 표시
 */

"use client";

import Link from "next/link";
import { MobileMenu } from "./mobile-menu";
import DesktopMenu from "./desktop-menu";
import {
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";

export function Navbar() {
  return (
    <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
      <div className="container mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <MobileMenu />
          <Link href="/" className="text-2xl font-bold">
            보일러플레이트
          </Link>
        </div>

        {/* 데스크탑 메뉴 */}
        <div className="flex items-center gap-4">
          <DesktopMenu />

          {/* Clerk 인증 버튼들 */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-muted-foreground hover:text-primary">
                로그인
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium">
                회원가입
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                },
              }}
            />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}
