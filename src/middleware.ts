/**
 * @file middleware.ts
 * @description Clerk 인증 미들웨어 설정 파일
 *
 * 이 파일은 Next.js 애플리케이션의 Clerk 인증 미들웨어를 정의합니다.
 * 보호된 경로에 대한 인증을 강제하고, 공개 경로는 인증 없이 접근 가능합니다.
 *
 * 주요 기능:
 * 1. 보호된 경로에 대한 인증 강제
 * 2. 공개 경로 정의
 * 3. Clerk 세션 자동 관리
 *
 * 구현 로직:
 * - clerkMiddleware를 사용하여 Clerk 인증 통합
 * - isProtectedRoute로 인증 필요 경로 정의
 * - isPublicRoute로 공개 경로 정의
 * - auth.protect()로 인증되지 않은 접근 차단
 *
 * @dependencies
 * - @clerk/nextjs/server
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 인증이 필요한 보호된 경로 정의
const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/dashboard(.*)",
  // 추가 보호 경로를 여기에 추가
]);

// 공개 경로 정의 (인증 없이 접근 가능)
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/products(.*)",      // 상품 목록
  "/checkout(.*)",      // 결제 주문서
  "/payment(.*)",       // 결제 성공/실패
]);

export default clerkMiddleware(async (auth, req) => {
  // 보호된 경로에 대한 인증 강제
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js 내부 파일 및 정적 파일 제외
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // API 라우트 항상 실행
    "/(api|trpc)(.*)",
  ],
};
