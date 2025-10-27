# Clerk + Supabase 통합 완료 보고서

## 📋 프로젝트 정보

- **프로젝트**: Next.js 15 + Supabase Boilerplate
- **인증 시스템**: Supabase Auth → Clerk 마이그레이션
- **작업 날짜**: 2025-10-27
- **Clerk Domain**: `humorous-mudfish-33.clerk.accounts.dev`
- **Supabase Project ID**: `zhinmaazdshoscnxnpqo`

---

## ✅ 완료된 작업

### 1. Clerk 계정 및 애플리케이션 설정
- [x] Clerk Dashboard에서 새 애플리케이션 생성
- [x] API 키 발급 (Publishable Key, Secret Key)
- [x] 소셜 로그인 설정 (Google 등)

### 2. 환경 변수 설정
**파일**: `.env.local`

```env
# Clerk 환경 변수
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_aHVtb3JvdXMtbXVkZmlzaC0zMy5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_ZqEF0jRb5ZgJlX0HTbiKEu9Xo2b9QfKuUsCBU1Rkc4

# Clerk 리다이렉트 URL
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase 환경 변수
NEXT_PUBLIC_SUPABASE_URL="https://zhinmaazdshoscnxnpqo.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
NEXT_PUBLIC_STORAGE_BUCKET="test-bucket"
```

### 3. Clerk Session Token 커스터마이징
**Clerk Dashboard → Configure → Sessions → Customize session token**

**Template Name**: `__session`

**Claims JSON**:
```json
{
  "role": "authenticated"
}
```

**설명**: Supabase RLS 정책에서 `role: "authenticated"` claim을 인식하도록 설정

### 4. Supabase Third-Party Auth 설정
**Supabase Dashboard → Authentication → Providers → Third Party Auth**

- [x] Clerk Provider 추가
- [x] Domain 설정: `https://humorous-mudfish-33.clerk.accounts.dev`
- [x] JWKS 자동 연동 (Supabase가 자동으로 처리)

**로컬 개발 설정**: `supabase/config.toml`
```toml
[auth.third_party.clerk]
enabled = true
domain = "humorous-mudfish-33.clerk.accounts.dev"
```

### 5. 패키지 설치
```bash
pnpm add @clerk/nextjs @clerk/localizations
```

**설치된 버전**:
- `@clerk/nextjs`: 최신 버전
- `@clerk/localizations`: 한국어 지원

---

## 🔧 코드 수정 사항

### 1. Layout에 ClerkProvider 추가
**파일**: `src/app/layout.tsx`

```tsx
import { ClerkProvider } from '@clerk/nextjs';
import { koKR } from '@clerk/localizations';

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          card: "shadow-md",
        },
      }}
    >
      <html lang="ko" suppressHydrationWarning>
        <body>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
```

### 2. Supabase 브라우저 클라이언트 수정
**파일**: `src/utils/supabase/client.ts`

**변경 내용**:
- Clerk의 `useAuth` 훅 사용
- `getToken()`으로 JWT 토큰 가져오기 (템플릿 파라미터 제거)
- `Authorization` 헤더에 토큰 추가

```typescript
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          const token = await getToken(); // 템플릿 파라미터 없음!

          const headers = new Headers(options?.headers || {});
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}
```

### 3. Supabase 서버 클라이언트 수정
**파일**: `src/utils/supabase/server.ts`

**변경 내용**:
- Clerk의 `auth()` 함수 사용
- 서버 측에서도 동일하게 JWT 토큰 주입

```typescript
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: { /* ... */ },
      global: {
        fetch: async (url: RequestInfo | URL, options: RequestInit = {}) => {
          const token = await getToken(); // 템플릿 파라미터 없음!

          const headers = new Headers(options?.headers || {});
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }

          return fetch(url, { ...options, headers });
        },
      },
    }
  );
}
```

### 4. 미들웨어 교체
**파일**: `src/middleware.ts`

**변경 전**: Supabase 세션 기반 미들웨어
**변경 후**: Clerk 미들웨어

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/dashboard(.*)",
]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

### 5. AuthProvider 수정
**파일**: `src/components/auth/auth-provider.tsx`

**변경 내용**: Clerk의 `useUser` 훅을 래핑

```typescript
"use client";

import { createContext, useContext } from "react";
import { useUser } from "@clerk/nextjs";
import type { User } from "@clerk/nextjs/server";

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

export const useAuth = () => useContext(AuthContext);

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
```

### 6. 로그인 페이지를 Catch-all 라우트로 변경
**변경 전**: `src/app/login/page.tsx`
**변경 후**: `src/app/login/[[...sign-in]]/page.tsx`

**이유**: Clerk의 `<SignIn />` 컴포넌트는 catch-all 라우트를 요구함

```typescript
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen p-4 sm:p-12 bg-muted/10">
      <SignIn
        appearance={{ /* Tailwind 스타일링 */ }}
        routing="path"
        path="/login"
        signUpUrl="/login"
        fallbackRedirectUrl="/"
        signUpFallbackRedirectUrl="/"
      />
    </div>
  );
}
```

### 7. UserNav 컴포넌트 수정
**파일**: `src/components/nav/user-nav.tsx`

**변경 내용**:
- Clerk의 `useUser` 훅 직접 사용 (AuthProvider 대신)
- `UserButton` 컴포넌트로 프로필 드롭다운 제공

```typescript
"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function UserNav() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
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
```

### 8. 프로필 페이지 수정
**파일**: `src/app/profile/page.tsx`

**변경 내용**: Clerk의 `currentUser()` 사용

```typescript
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function Profile() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.emailAddresses[0]?.emailAddress || "이메일 없음";
  const fullName = `${user.firstName} ${user.lastName}`.trim() || "이름 미설정";
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleString("ko-KR")
    : "알 수 없음";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* 사용자 정보 표시 */}
    </div>
  );
}
```

---

## 🧪 테스트 결과

### ✅ 성공한 테스트

1. **회원가입**
   - ✅ Google 소셜 로그인 성공
   - ✅ 이메일/비밀번호 회원가입 가능
   - ✅ 이메일 인증 프로세스 정상

2. **로그인/로그아웃**
   - ✅ 로그인 페이지 정상 작동 (catch-all 라우트)
   - ✅ 로그인 후 자동 리다이렉트
   - ✅ UserButton 클릭 시 드롭다운 메뉴 표시
   - ✅ 로그아웃 기능 정상 작동

3. **보호된 라우트**
   - ✅ 로그인 상태에서 `/profile` 접근 가능
   - ✅ 로그아웃 상태에서 `/profile` 접근 시 자동으로 `/login`으로 리다이렉트
   - ✅ 미들웨어 인증 보호 정상 작동

4. **사용자 정보 표시**
   - ✅ 프로필 페이지에서 Clerk 사용자 정보 올바르게 표시
   - ✅ 이메일, 이름, 사용자 ID, 가입일 모두 정상

5. **UI/UX**
   - ✅ 한국어 localization 적용
   - ✅ Tailwind CSS 스타일링 정상
   - ✅ 다크 모드 지원
   - ✅ 반응형 디자인 정상

### ⚠️ 미해결 이슈

#### 1. Supabase RLS 정책 검증 실패

**증상**:
```json
{
  "success": false,
  "clerkUserId": "user_34eDg6UDukHLPCCEnJCTsZZ7Sj4",
  "clerkTokenPresent": true,
  "decodedToken": {
    "exp": 1761567085,
    "iat": 1761567025,
    "iss": "https://humorous-mudfish-33.clerk.accounts.dev",
    "role": "authenticated",
    "sub": "user_34eDg6UDukHLPCCEnJCTsZZ7Sj4"
  },
  "supabaseError": "Auth session missing!",
  "message": "Clerk 토큰은 있지만 Supabase 인증 실패"
}
```

**분석**:
- ✅ Clerk JWT 토큰이 올바르게 생성됨
- ✅ 토큰에 `role: "authenticated"` claim 포함됨
- ✅ Issuer가 올바른 Clerk domain
- ❌ Supabase가 토큰을 인식하지 못함

**시도한 해결 방법**:
1. ✅ Supabase Dashboard에서 Third-Party Auth 추가 (Clerk)
2. ✅ Domain 설정: `https://humorous-mudfish-33.clerk.accounts.dev`
3. ✅ `getToken({ template: "__session" })` → `getToken()`으로 변경 (2025년 방식)
4. ❌ 여전히 "Auth session missing!" 에러 발생

**가능한 원인**:
1. **JWKS 전파 시간**: Supabase가 Clerk JWKS를 가져오는데 시간이 더 필요할 수 있음 (최대 10-15분)
2. **추가 설정 필요**: Supabase Dashboard의 다른 설정이 필요할 수 있음
3. **토큰 형식 불일치**: Supabase가 기대하는 토큰 형식과 실제 토큰이 다를 수 있음
4. **환경 변수 누락**: 추가 환경 변수가 필요할 수 있음

**테스트 API**: `src/app/api/test-auth/route.ts`
```typescript
// Clerk 인증 상태 확인 → Supabase auth.getUser() 호출
// 현재 "Auth session missing!" 에러 반환
```

---

## 🎯 다음 단계

### 즉시 해결이 필요한 작업

1. **Supabase JWT 검증 문제 해결**
   - [ ] Supabase Dashboard에서 JWKS 설정 재확인
   - [ ] Clerk Dashboard에서 Supabase Integration 설정 확인
   - [ ] 더 긴 전파 시간 대기 (15-30분)
   - [ ] Supabase 공식 문서 재확인
   - [ ] Supabase Support에 문의

2. **대안 접근 방법 검토**
   - [ ] `accessToken` 콜백 방식으로 변경 시도
   - [ ] Supabase CLI로 JWT Secret 수동 추가 시도
   - [ ] 로컬 Supabase 개발 환경에서 먼저 테스트

### 마이그레이션 완료 후 작업

3. **커스텀 Auth 컴포넌트 정리**
   - [ ] `src/components/auth/buttons.tsx` 백업
   - [ ] `src/app/auth/` 디렉토리 정리
   - [ ] 사용하지 않는 Supabase Auth 코드 제거

4. **문서 업데이트**
   - [ ] `README.md` 업데이트 (Clerk 설정 방법 추가)
   - [ ] 환경 변수 설정 가이드 추가
   - [ ] 개발자 온보딩 문서 작성

5. **테스트 코드 작성**
   - [ ] 인증 플로우 E2E 테스트
   - [ ] RLS 정책 통합 테스트
   - [ ] 미들웨어 보호 테스트

---

## 📚 참고 자료

### 공식 문서
- [Supabase + Clerk Integration](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk Session Tokens](https://clerk.com/docs/backend-requests/handling/manual-jwt)

### 주요 변경 사항 (2025년 기준)
- ✅ Third-Party Auth 네이티브 통합 사용
- ✅ JWT Template 대신 기본 세션 토큰 사용
- ✅ JWKS 자동 페칭 (수동 설정 불필요)
- ❌ `template: "__session"` 파라미터는 deprecated

### 환경 변수 체크리스트
```env
# Clerk (필수)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (선택)
SUPABASE_SERVICE_ROLE=
NEXT_PUBLIC_STORAGE_BUCKET=
```

---

## 💡 교훈 및 개선 사항

### 잘된 점
1. **체계적인 마이그레이션**: 단계별로 진행하여 각 변경 사항을 검증
2. **한국어 지원**: `@clerk/localizations` 사용으로 UX 향상
3. **Catch-all 라우트**: Clerk 요구사항에 맞춰 라우트 구조 변경
4. **서버/클라이언트 분리**: Supabase 클라이언트를 명확하게 분리

### 개선이 필요한 점
1. **JWKS 통합 시간**: 설정 전파 시간이 예상보다 김
2. **디버깅 도구 부족**: Supabase JWT 검증 상태를 확인할 방법 필요
3. **문서 업데이트**: 공식 문서가 최신 상태가 아닐 수 있음

### 향후 고려사항
1. **백업 인증 방법**: Clerk 장애 시 대체 인증 방법 필요
2. **사용자 데이터 동기화**: Clerk ↔ Supabase 사용자 정보 동기화 전략
3. **비용 최적화**: Clerk MAU와 Supabase Auth API 호출 비용 모니터링

---

## 📝 작업 이력

| 날짜 | 작업 | 상태 | 비고 |
|------|------|------|------|
| 2025-10-27 | Clerk 계정 생성 | ✅ 완료 | - |
| 2025-10-27 | 환경 변수 설정 | ✅ 완료 | - |
| 2025-10-27 | Session Token 커스터마이징 | ✅ 완료 | `role: "authenticated"` 추가 |
| 2025-10-27 | Supabase Third-Party Auth 설정 | ✅ 완료 | - |
| 2025-10-27 | 패키지 설치 | ✅ 완료 | @clerk/nextjs, @clerk/localizations |
| 2025-10-27 | 코드 수정 (8개 파일) | ✅ 완료 | - |
| 2025-10-27 | 인증 기능 테스트 | ✅ 완료 | 회원가입/로그인/로그아웃 성공 |
| 2025-10-27 | 보호된 라우트 테스트 | ✅ 완료 | 미들웨어 정상 작동 |
| 2025-10-27 | Supabase RLS 검증 | ⚠️ 진행 중 | "Auth session missing!" 이슈 |

---

**작성일**: 2025-10-27
**작성자**: Claude Code Agent
**문서 버전**: 1.0
