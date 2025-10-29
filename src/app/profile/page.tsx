/**
 * @file page.tsx
 * @description 사용자 프로필 페이지 컴포넌트 (Clerk 기반)
 *
 * 이 파일은 Clerk로 인증된 사용자의 프로필 정보를 표시하는 페이지를 정의합니다.
 * 인증된 사용자만 접근 가능한 보호된 라우트로 구현되어 있습니다.
 *
 * 주요 기능:
 * 1. Clerk 사용자 인증 상태 확인 및 리다이렉트 처리
 * 2. 사용자 이메일 및 이름 표시
 * 3. 사용자 ID 및 가입일 표시
 * 4. 네비게이션 바 통합
 *
 * @dependencies
 * - next/navigation
 * - @clerk/nextjs/server
 * - @/components/ui/button
 * - @/components/ui/card
 * - @/components/nav
 */

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Navbar } from "@/components/nav";

/**
 * 사용자 프로필 페이지 (보호된 라우트)
 *
 * 미들웨어에서 인증을 강제하지만,
 * 서버 컴포넌트에서도 사용자 정보 확인
 */
export default async function Profile() {
  const user = await currentUser();

  // 미들웨어를 통과했더라도 한 번 더 확인
  if (!user) {
    redirect("/login");
  }

  // Clerk User 객체에서 정보 추출
  const email = user.emailAddresses[0]?.emailAddress || "이메일 없음";
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim() || "이름 미설정";
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleString("ko-KR")
    : "알 수 없음";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="container mx-auto py-6 px-4 sm:px-6 sm:py-8 flex-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">프로필</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-xl sm:text-2xl">프로필 정보</CardTitle>
            <CardDescription className="text-sm">
              현재 로그인한 사용자 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                이메일
              </p>
              <p className="text-base sm:text-lg truncate">{email}</p>
            </div>

            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                이름
              </p>
              <p className="text-base sm:text-lg">{fullName}</p>
            </div>

            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                사용자 ID
              </p>
              <p className="text-base sm:text-lg truncate">{user.id}</p>
            </div>

            <div className="bg-muted/20 p-3 sm:p-4 rounded-md">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                가입일
              </p>
              <p className="text-base sm:text-lg">{createdAt}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center sm:text-left">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              홈으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
