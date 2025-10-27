# Supabase Auth → Clerk 마이그레이션 완벽 가이드

> **프로젝트**: Next.js 15 + Supabase Boilerplate
> **목표**: Supabase Auth를 Clerk 인증으로 전환하면서 Supabase 데이터베이스는 유지
> **작성일**: 2025-01-27
> **난이도**: ⭐⭐⭐ (중급)
> **예상 소요 시간**: 4-6시간

---

## 📋 목차

1. [개요](#개요)
2. [현재 프로젝트 분석](#현재-프로젝트-분석)
3. [마이그레이션 아키텍처](#마이그레이션-아키텍처)
4. [Phase 1: 환경 준비 및 Clerk 설정](#phase-1-환경-준비-및-clerk-설정)
5. [Phase 2: Clerk 통합 및 Supabase 연결](#phase-2-clerk-통합-및-supabase-연결)
6. [Phase 3: 인증 컴포넌트 마이그레이션](#phase-3-인증-컴포넌트-마이그레이션)
7. [Phase 4: 서버 컴포넌트 및 API 마이그레이션](#phase-4-서버-컴포넌트-및-api-마이그레이션)
8. [Phase 5: 테스트 및 검증](#phase-5-테스트-및-검증)
9. [Phase 6: 정리 및 최적화](#phase-6-정리-및-최적화)
10. [롤백 계획](#롤백-계획)
11. [FAQ 및 트러블슈팅](#faq-및-트러블슈팅)

---

## 개요

### 🎯 마이그레이션 목적

현재 프로젝트는 **Supabase Auth**를 사용하여 인증을 처리하고 있습니다. 이를 **Clerk**로 전환하여 다음과 같은 이점을 얻습니다:

- ✅ 사전 구축된 UI 컴포넌트로 개발 시간 단축
- ✅ 소셜 로그인 통합 간소화
- ✅ MFA, 조직 관리 등 고급 기능
- ✅ 더 나은 사용자 경험 및 커스터마이징
- ✅ Supabase 데이터베이스는 그대로 유지하면서 RLS 보안 활용

### 🏗️ 통합 방식

- **Clerk**: 사용자 인증 및 세션 관리 담당
- **Supabase**: 데이터베이스 접근 제어 (RLS) 담당
- **통합 방법**: Clerk JWT 토큰을 Supabase 클라이언트에 전달

---

## 현재 프로젝트 분석

### 📊 인증 관련 파일 구조

```
src/
├── actions/
│   └── auth.ts                    # 서버 액션 (login, signup, sendMagicLink)
├── app/
│   ├── layout.tsx                 # AuthProvider 적용
│   ├── login/
│   │   └── page.tsx              # 로그인/회원가입 페이지
│   ├── profile/
│   │   └── page.tsx              # 인증 필요 페이지
│   └── auth/
│       ├── callback/
│       │   └── route.ts          # OAuth 콜백 처리
│       └── error/
│           └── page.tsx          # 인증 에러 페이지
├── components/
│   ├── auth/
│   │   ├── auth-provider.tsx     # 인증 상태 전역 관리
│   │   ├── buttons.tsx           # 로그인/로그아웃 버튼
│   │   ├── login-form.tsx        # 로그인 폼
│   │   └── signup-form.tsx       # 회원가입 폼
│   └── nav/
│       └── user-nav.tsx          # 사용자 프로필 메뉴
├── middleware.ts                  # Supabase 세션 업데이트
├── types/
│   └── auth.ts                   # 인증 관련 타입 정의
└── utils/
    └── supabase/
        ├── client.ts             # 브라우저 클라이언트
        ├── server.ts             # 서버 클라이언트
        ├── middleware.ts         # 미들웨어 유틸
        └── storage.ts            # 스토리지 유틸
```

### 🔍 주요 인증 흐름

**현재 Supabase Auth 흐름:**

```
1. 사용자 로그인 → LoginForm
2. login() 서버 액션 호출 → src/actions/auth.ts
3. supabase.auth.signInWithPassword()
4. AuthProvider.onAuthStateChange 이벤트 감지
5. user 상태 업데이트 → 전역 상태 관리
6. middleware.ts에서 모든 요청에 세션 업데이트
7. 보호된 라우트 접근 시 서버에서 getUser() 확인
```

**마이그레이션 후 Clerk 흐름:**

```
1. 사용자 로그인 → Clerk <SignIn /> 컴포넌트
2. Clerk에서 인증 처리
3. Clerk useUser() 훅으로 사용자 상태 관리
4. Clerk JWT 토큰을 Supabase 클라이언트에 전달
5. Supabase RLS 정책이 JWT 검증
6. Clerk 미들웨어로 보호된 라우트 관리
```

### 📦 현재 사용 중인 Supabase Auth 기능

- ✅ 이메일/비밀번호 로그인
- ✅ 이메일/비밀번호 회원가입
- ✅ 매직 링크 (OTP) 로그인
- ✅ OAuth (카카오, Google)
- ✅ 세션 관리
- ✅ 인증 상태 구독 (onAuthStateChange)
- ✅ 보호된 라우트 (middleware)

---

## 마이그레이션 아키텍처

### 🔄 Before & After

#### Before (Supabase Auth)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ Login
       ▼
┌──────────────────┐
│  Supabase Auth   │ ◄─── 인증 처리
└──────┬───────────┘
       │ JWT Token
       ▼
┌──────────────────┐
│ Supabase Client  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   PostgreSQL     │ ◄─── RLS 정책
│   + RLS          │
└──────────────────┘
```

#### After (Clerk + Supabase)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ Login
       ▼
┌──────────────────┐
│      Clerk       │ ◄─── 인증 처리
└──────┬───────────┘
       │ JWT Token (with role claim)
       ▼
┌──────────────────┐
│ Supabase Client  │ ◄─── Clerk 토큰 사용
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│   PostgreSQL     │ ◄─── RLS 정책 (Clerk JWT 검증)
│   + RLS          │
└──────────────────┘
```

### 🔑 핵심 통합 포인트

1. **Clerk JWT 토큰 설정**: `role: "authenticated"` claim 추가
2. **Supabase 클라이언트 수정**: Clerk 토큰을 Authorization 헤더에 추가
3. **RLS 정책 활용**: `auth.jwt()` 함수로 Clerk claims 검증
4. **미들웨어 교체**: Supabase 세션 업데이트 → Clerk 인증 미들웨어

---

## Phase 1: 환경 준비 및 Clerk 설정

### 📅 예상 소요 시간: 30분

### 1.1 Clerk 계정 생성 및 애플리케이션 설정

#### 단계별 가이드

**1. Clerk Dashboard 접속**

```bash
# 브라우저에서 열기
https://dashboard.clerk.com
```

**2. 새 애플리케이션 생성**

- "Add application" 클릭
- Application name: `nextjs-supabase-app` (또는 원하는 이름)
- **중요**: "How will your users sign in?" 에서 다음 선택:
  - ✅ Email
  - ✅ Google (선택사항)
  - ✅ OAuth providers (카카오는 수동 추가 필요)

**3. API Keys 복사**

Dashboard → Configure → API Keys에서:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 실행 파일

`.env.local` 파일 생성 또는 업데이트:

```bash
# .env.local

# ==========================================
# Clerk 환경 변수
# ==========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsueW91cmFwcC5jb20k
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXX

# Clerk 리다이렉트 URL 설정
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ==========================================
# 기존 Supabase 환경 변수 (유지)
# ==========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ==========================================
# 기타 환경 변수
# ==========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 1.2 Clerk Session Token 커스터마이징

Supabase와 통합하려면 Clerk JWT에 `role` claim을 추가해야 합니다.

#### Clerk Dashboard 설정

**1. Dashboard → Configure → Sessions 이동**

**2. "Customize session token" 클릭**

**3. 다음 JSON 입력:**

```json
{
  "role": "authenticated",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address}}",
  "metadata": "{{user.public_metadata}}"
}
```

**설명:**
- `role: "authenticated"`: Supabase RLS에서 인증된 사용자로 인식
- `sub`: Clerk 사용자 ID (Supabase의 `auth.uid()`와 동일하게 사용)
- `email`: 사용자 이메일 (필요시 RLS 정책에 활용)
- `metadata`: 추가 사용자 데이터 (조직 ID, 역할 등)

**4. "Save" 클릭**

### 1.3 Supabase config.toml 설정

Supabase 프로젝트에 Clerk를 third-party auth provider로 등록합니다.

#### 파일 수정

**파일**: `supabase/config.toml`

**수정 내용:**

```toml
# 기존 설정 유지 후 아래 내용 추가

# ==========================================
# Third-Party Auth: Clerk
# ==========================================
[auth.third_party.clerk]
enabled = true
# Clerk Dashboard → Configure → Domains에서 확인
# 예: your-app-12345.clerk.accounts.dev
domain = "your-app.clerk.accounts.dev"
```

**⚠️ 주의사항:**
- `domain`은 반드시 Clerk Dashboard에서 확인한 정확한 도메인 사용
- 프로덕션 환경에서는 커스텀 도메인 설정 가능

### 1.4 패키지 설치

```bash
pnpm add @clerk/nextjs
```

**패키지 설명:**
- `@clerk/nextjs`: Next.js 15 App Router 지원 Clerk SDK
- React Server Components 및 Server Actions 지원

### 1.5 Clerk 한국어 로컬라이제이션 (선택사항)

Clerk UI를 한국어로 표시하려면:

```bash
pnpm add @clerk/localizations
```

---

## Phase 2: Clerk 통합 및 Supabase 연결

### 📅 예상 소요 시간: 1시간

### 2.1 Root Layout에 ClerkProvider 추가

Clerk Provider를 애플리케이션 최상위에 추가합니다.

#### 파일 수정

**파일**: `src/app/layout.tsx`

**Before:**

```typescript
import { AuthProvider } from "@/components/auth/auth-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
        <Analytics />
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </body>
    </html>
  );
}
```

**After:**

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={koKR}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-primary text-primary-foreground hover:bg-primary/90',
          card: 'shadow-md',
        },
      }}
    >
      <html lang="ko" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Analytics />
          <WebsiteJsonLd />
          <OrganizationJsonLd />
        </body>
      </html>
    </ClerkProvider>
  );
}
```

**변경 사항:**
- ✅ `ClerkProvider`로 전체 앱 감싸기
- ✅ `koKR` 로컬라이제이션 적용
- ✅ Tailwind 테마에 맞춰 appearance 커스터마이징
- ✅ `AuthProvider` 제거 (Clerk가 대체)

**추가 imports:**

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'
```

**삭제할 import:**

```typescript
import { AuthProvider } from "@/components/auth/auth-provider"; // 삭제
```

### 2.2 Supabase 클라이언트에 Clerk 토큰 통합

Supabase 클라이언트가 Clerk JWT 토큰을 사용하도록 수정합니다.

#### 2.2.1 브라우저 클라이언트 수정

**파일**: `src/utils/supabase/client.ts`

**Before:**

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";

export const createBrowserSupabaseClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
```

**After:**

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useAuth, useSession } from "@clerk/nextjs";

/**
 * Clerk 인증과 통합된 Supabase 브라우저 클라이언트 생성
 *
 * 사용 방법:
 * const supabase = useSupabaseClient();
 * const { data } = await supabase.from('table').select();
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: async () => {
          const token = await getToken({ template: "supabase" });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
}

/**
 * 레거시 지원을 위한 별칭 (기존 코드와 호환성 유지)
 * @deprecated useSupabaseClient()를 사용하세요
 */
export const createBrowserSupabaseClient = useSupabaseClient;
```

**변경 사항:**
- ✅ `useAuth()` 훅으로 Clerk 토큰 가져오기
- ✅ `global.headers`에 Authorization 헤더 추가
- ✅ 함수명을 `useSupabaseClient`로 변경 (React Hook 컨벤션)
- ✅ 레거시 지원을 위한 별칭 유지

**⚠️ 중요:**
- `getToken({ template: "supabase" })`는 Clerk에서 설정한 커스텀 claim을 포함한 JWT 반환
- 이 훅은 클라이언트 컴포넌트에서만 사용 가능

#### 2.2.2 서버 클라이언트 수정

**파일**: `src/utils/supabase/server.ts`

**Before:**

```typescript
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options, maxAge: 0 });
        },
      },
    },
  );
}
```

**After:**

```typescript
"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

/**
 * Clerk 인증과 통합된 Supabase 서버 클라이언트 생성
 *
 * 사용 방법:
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from('table').select();
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  const { getToken } = await auth();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server Component에서 호출 시 쿠키 설정 불가 (무시)
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // Server Component에서 호출 시 쿠키 삭제 불가 (무시)
          }
        },
      },
      global: {
        headers: async () => {
          const token = await getToken({ template: "supabase" });
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
      },
    }
  );
}

/**
 * 관리자 권한 Supabase 클라이언트 (Service Role)
 * RLS 정책 우회 - 신뢰할 수 있는 서버 환경에서만 사용
 */
export async function createServerSupabaseAdminClient() {
  const cookieStore = await cookies();

  if (!process.env.SUPABASE_SERVICE_ROLE) {
    throw new Error(
      "Environment variable SUPABASE_SERVICE_ROLE is required for admin client",
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // 무시
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // 무시
          }
        },
      },
    }
  );
}
```

**변경 사항:**
- ✅ `auth()` 함수로 Clerk 서버 인증 정보 가져오기
- ✅ `global.headers`에 Authorization 헤더 추가
- ✅ try-catch로 Server Component에서 쿠키 설정 오류 처리
- ✅ Admin 클라이언트는 그대로 유지 (Service Role 사용)

**⚠️ 주의:**
- 서버 컴포넌트에서는 `auth()` 사용
- 서버 액션/API 라우트에서는 `auth()` 사용
- Clerk 토큰이 없으면 익명 사용자로 처리 (RLS 정책에서 거부됨)

### 2.3 미들웨어 교체

Supabase 세션 업데이트 미들웨어를 Clerk 인증 미들웨어로 교체합니다.

#### 파일 수정

**파일**: `src/middleware.ts`

**Before:**

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**After:**

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// 인증이 필요한 보호된 경로 정의
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/dashboard(.*)',
  // 추가 보호 경로를 여기에 추가
])

// 공개 경로 정의 (인증 없이 접근 가능)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // 보호된 경로에 대한 인증 강제
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Next.js 내부 파일 및 정적 파일 제외
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // API 라우트 항상 실행
    '/(api|trpc)(.*)',
  ],
}
```

**변경 사항:**
- ✅ `clerkMiddleware` 사용
- ✅ `isProtectedRoute`로 인증 필요 경로 정의
- ✅ `isPublicRoute`로 공개 경로 정의
- ✅ `auth.protect()`로 인증되지 않은 접근 차단
- ✅ matcher 패턴은 Clerk 권장 설정 사용

**동작 방식:**
- 보호된 경로 접근 시 → 인증 확인 → 미인증 시 `/login`으로 리다이렉트
- 공개 경로는 인증 없이 접근 가능
- Clerk가 자동으로 세션 관리

**📝 보호 경로 추가 예시:**

```typescript
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/dashboard(.*)',
  '/settings(.*)',
  '/admin(.*)',
])
```

---

## Phase 3: 인증 컴포넌트 마이그레이션

### 📅 예상 소요 시간: 1.5시간

### 3.1 AuthProvider 교체

Supabase AuthProvider를 Clerk 기반으로 교체합니다.

#### 파일 수정

**파일**: `src/components/auth/auth-provider.tsx`

**Before (129줄):**

```typescript
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { createBrowserSupabaseClient } from "@/utils/supabase/client";
import { type User } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUser: async () => null,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // ... Supabase 로직
}
```

**After:**

```typescript
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
```

**변경 사항:**
- ✅ Supabase 로직 완전 제거
- ✅ Clerk의 `useUser()` 훅 사용
- ✅ `isSignedIn` 상태 추가 (명시적 인증 확인)
- ✅ 기존 API 유지 (`useAuth()` 훅)
- ✅ `refreshUser()` 제거 (Clerk가 자동 관리)

**타입 변경:**
- `User` 타입: `@supabase/supabase-js` → `@clerk/nextjs/server`
- `isLoading`: Supabase 커스텀 로직 → Clerk `!isLoaded`

### 3.2 로그인 페이지 교체

커스텀 로그인 폼을 Clerk의 사전 구축 컴포넌트로 교체합니다.

#### 파일 수정

**파일**: `src/app/login/page.tsx`

**Before (99줄):**

```typescript
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { SignupForm } from "@/components/auth/signup-form";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  // ... 로그인/회원가입 폼 렌더링
}
```

**After:**

```typescript
import { SignIn } from "@clerk/nextjs";

/**
 * 로그인/회원가입 통합 페이지
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
        afterSignInUrl="/"
        afterSignUpUrl="/"
      />
    </div>
  );
}
```

**변경 사항:**
- ✅ 99줄 → 37줄 (62줄 감소, 63% 코드 감소)
- ✅ 커스텀 폼 로직 완전 제거
- ✅ Clerk 사전 구축 UI 사용
- ✅ Tailwind 테마와 일치하도록 스타일링
- ✅ 다크 모드 자동 지원
- ✅ 회원가입 자동 통합 (별도 페이지 불필요)

**Clerk SignIn Props 설명:**

| Prop | 값 | 설명 |
|------|---|------|
| `routing` | `"path"` | URL 경로 기반 라우팅 |
| `path` | `"/login"` | 로그인 페이지 경로 |
| `signUpUrl` | `"/login"` | 회원가입 URL (같은 페이지) |
| `afterSignInUrl` | `"/"` | 로그인 후 리다이렉트 |
| `afterSignUpUrl` | `"/"` | 회원가입 후 리다이렉트 |

**✨ 자동 제공 기능:**
- 이메일/비밀번호 로그인
- 소셜 로그인 (설정한 provider)
- 비밀번호 재설정
- 이메일 인증
- 회원가입 자동 전환
- 폼 유효성 검사
- 에러 메시지
- 로딩 상태

### 3.3 UserNav 컴포넌트 수정

사용자 프로필 메뉴를 Clerk 기반으로 수정합니다.

#### 파일 수정

**파일**: `src/components/nav/user-nav.tsx`

**Before:**

```typescript
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LogoutButton } from "@/components/auth/buttons";
import { useAuth } from "@/components/auth/auth-provider";

export default function UserNav() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Link href="/login">
        <Button>로그인</Button>
      </Link>
    );
  }

  const userInitials = user.email ? user.email[0].toUpperCase() : "U";

  return (
    <DropdownMenu>
      {/* 커스텀 드롭다운 메뉴 */}
    </DropdownMenu>
  );
}
```

**After (옵션 1: Clerk UserButton 사용 - 권장):**

```typescript
"use client";

import { UserButton, SignInButton } from "@clerk/nextjs";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * 사용자 네비게이션 컴포넌트
 *
 * - 로그인 전: 로그인 버튼 표시
 * - 로그인 후: Clerk UserButton (프로필 이미지 + 드롭다운)
 */
export default function UserNav() {
  const { isSignedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
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

**After (옵션 2: 커스텀 드롭다운 유지):**

```typescript
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function UserNav() {
  const { user, isSignedIn, isLoading } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!isSignedIn || !user) {
    return (
      <Link href="/login">
        <Button>로그인</Button>
      </Link>
    );
  }

  // Clerk User 객체에서 정보 가져오기
  const userEmail = user.emailAddresses[0]?.emailAddress || "사용자";
  const userInitials = userEmail[0].toUpperCase();
  const userImage = user.imageUrl;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userImage} alt={userEmail} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">내 계정</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="p-0 focus:bg-transparent">
            <Button
              variant="ghost"
              className="px-2 py-1.5 w-full justify-start h-8 font-normal"
              asChild
            >
              <Link href="/profile">프로필</Link>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="p-0 focus:bg-transparent">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="px-2 py-1.5 w-full justify-start h-8 font-normal"
          >
            로그아웃
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

**변경 사항 (옵션 1):**
- ✅ Clerk의 `UserButton` 사용 (가장 간단)
- ✅ `SignInButton`로 모달 로그인 지원
- ✅ 로딩 상태 처리
- ✅ 자동 프로필 이미지, 드롭다운 메뉴

**변경 사항 (옵션 2):**
- ✅ 기존 UI 유지
- ✅ Clerk User 타입에 맞춰 수정
- ✅ `user.emailAddresses[0]?.emailAddress` 사용
- ✅ `useClerk()` 훅으로 `signOut()` 호출
- ✅ `user.imageUrl` 사용

**권장:** 옵션 1 (UserButton) - 유지보수 부담 감소

### 3.4 Auth Buttons 제거 또는 백업

기존 커스텀 버튼 컴포넌트는 더 이상 필요하지 않습니다.

#### 파일 작업

**옵션 1: 파일 삭제**

```bash
rm src/components/auth/buttons.tsx
rm src/components/auth/login-form.tsx
rm src/components/auth/signup-form.tsx
rm src/components/auth/password-requirements.tsx
```

**옵션 2: 백업 (권장)**

```bash
mkdir -p src/components/auth/_backup
mv src/components/auth/buttons.tsx src/components/auth/_backup/
mv src/components/auth/login-form.tsx src/components/auth/_backup/
mv src/components/auth/signup-form.tsx src/components/auth/_backup/
mv src/components/auth/password-requirements.tsx src/components/auth/_backup/
```

**남겨둘 파일:**
- ✅ `src/components/auth/auth-provider.tsx` (Clerk 기반으로 수정됨)

---

## Phase 4: 서버 컴포넌트 및 API 마이그레이션

### 📅 예상 소요 시간: 1시간

### 4.1 프로필 페이지 수정

서버 컴포넌트에서 Clerk 인증을 사용하도록 수정합니다.

#### 파일 수정

**파일**: `src/app/profile/page.tsx`

**Before:**

```typescript
"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
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

export default async function Profile() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto py-6 px-4 sm:px-6 sm:py-8 flex-1">
        {/* 사용자 정보 표시 */}
        <p className="text-base sm:text-lg truncate">{user.email}</p>
      </div>
    </div>
  );
}
```

**After:**

```typescript
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
```

**변경 사항:**
- ✅ `createServerSupabaseClient()` → `currentUser()` 사용
- ✅ `user.email` → `user.emailAddresses[0]?.emailAddress`
- ✅ `user.id` → Clerk user ID (UUID)
- ✅ `user.firstName`, `user.lastName` 추가
- ✅ `user.createdAt` 사용
- ✅ "use server" 지시문 제거 (필요 없음)

**Clerk User 객체 주요 필드:**

```typescript
{
  id: string;                           // 사용자 고유 ID
  emailAddresses: EmailAddress[];       // 이메일 배열
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;                     // 프로필 이미지
  createdAt: number;                    // 생성 타임스탬프
  updatedAt: number;
  publicMetadata: Record<string, any>;  // 공개 메타데이터
}
```

### 4.2 Auth Callback 라우트 제거

Clerk는 자체 OAuth 콜백을 처리하므로 커스텀 라우트가 필요 없습니다.

#### 파일 작업

**삭제:**

```bash
rm -rf src/app/auth/callback
```

**또는 백업:**

```bash
mkdir -p src/app/auth/_backup
mv src/app/auth/callback src/app/auth/_backup/
```

**Clerk 자동 처리:**
- OAuth 리다이렉트: `https://your-app.clerk.accounts.dev/v1/oauth_callback`
- 이메일 인증: Clerk Dashboard에서 설정한 redirect URL 사용

### 4.3 Server Actions 제거 또는 백업

`src/actions/auth.ts`의 로그인/회원가입 액션은 Clerk가 대체합니다.

#### 파일 작업

**파일**: `src/actions/auth.ts`

**옵션 1: 파일 삭제**

```bash
rm src/actions/auth.ts
```

**옵션 2: 백업 (권장)**

```bash
mkdir -p src/actions/_backup
mv src/actions/auth.ts src/actions/_backup/auth.ts.supabase
```

**남아있는 Supabase 기능:**
- ✅ `src/actions/storage.ts` - Supabase Storage 사용 (유지)
- ✅ `src/utils/supabase/storage.ts` - Storage 유틸 (유지)

**Clerk 대체 기능:**
- ❌ `login()` → Clerk SignIn 컴포넌트
- ❌ `signup()` → Clerk SignUp 컴포넌트
- ❌ `sendMagicLink()` → Clerk 이메일 인증
- ✅ Storage 관련 로직은 그대로 사용 가능 (Supabase Storage 유지)

### 4.4 Auth Error 페이지 수정

Clerk 인증 에러에 맞춰 에러 페이지를 수정합니다.

#### 파일 수정

**파일**: `src/app/auth/error/page.tsx`

**Before:**

```typescript
export default function AuthError() {
  return (
    <div>
      <h1>인증 오류</h1>
      <p>Supabase 인증 중 문제가 발생했습니다.</p>
    </div>
  );
}
```

**After:**

```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

/**
 * Clerk 인증 에러 페이지
 *
 * 발생 가능한 에러:
 * - 이메일 인증 실패
 * - OAuth 콜백 실패
 * - 세션 만료
 */
export default function AuthError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMessage = searchParams.error || "알 수 없는 오류가 발생했습니다.";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-muted/10">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-2xl">인증 오류</CardTitle>
          </div>
          <CardDescription>
            로그인 중 문제가 발생했습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 p-4 rounded-md border border-destructive/20">
            <p className="text-sm text-destructive">{errorMessage}</p>
          </div>

          <div className="space-y-2">
            <Link href="/login" className="block">
              <Button className="w-full">다시 로그인하기</Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full">
                홈으로 돌아가기
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**변경 사항:**
- ✅ `searchParams`로 에러 메시지 받기
- ✅ UI 개선 (Card, Icon 추가)
- ✅ 재시도 버튼 추가

---

## Phase 5: 테스트 및 검증

### 📅 예상 소요 시간: 1시간

### 5.1 개발 서버 실행

```bash
pnpm dev
```

**확인 사항:**
- ✅ 컴파일 에러 없음
- ✅ 타입 에러 없음
- ✅ 미들웨어 정상 작동

### 5.2 기능 테스트 체크리스트

#### 5.2.1 인증 흐름 테스트

**테스트 케이스:**

| 기능 | 테스트 방법 | 예상 결과 | 상태 |
|------|-------------|-----------|------|
| 로그인 페이지 접속 | `/login` 이동 | Clerk SignIn UI 표시 | ⬜ |
| 이메일 회원가입 | 이메일/비밀번호 입력 | 이메일 인증 안내 | ⬜ |
| 이메일 인증 | 이메일 링크 클릭 | 로그인 완료 후 홈 | ⬜ |
| 로그인 | 이메일/비밀번호 입력 | 홈으로 리다이렉트 | ⬜ |
| 로그아웃 | UserNav → 로그아웃 | 로그인 페이지로 이동 | ⬜ |
| 보호된 라우트 | 비로그인 상태에서 `/profile` 접속 | `/login`으로 리다이렉트 | ⬜ |
| 로그인 후 프로필 | 로그인 후 `/profile` 접속 | 사용자 정보 표시 | ⬜ |

#### 5.2.2 Supabase 통합 테스트

**Supabase RLS 정책 확인:**

```sql
-- SQL 에디터에서 실행
-- 현재 JWT claims 확인
SELECT auth.jwt();

-- 결과에 Clerk claims가 포함되어야 함:
-- {
--   "role": "authenticated",
--   "sub": "user_...",
--   "email": "user@example.com"
-- }
```

**테스트 케이스:**

| 기능 | 테스트 방법 | 예상 결과 | 상태 |
|------|-------------|-----------|------|
| Clerk 토큰 전달 | 로그인 후 Supabase 쿼리 실행 | JWT에 `role: authenticated` 포함 | ⬜ |
| RLS 정책 적용 | 비로그인 상태에서 protected 테이블 조회 | 접근 거부 | ⬜ |
| 인증된 쿼리 | 로그인 후 protected 테이블 조회 | 데이터 조회 성공 | ⬜ |

**예시 코드 (테스트용):**

```typescript
// src/app/test-supabase/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { createServerSupabaseClient } from "@/utils/supabase/server";

export default async function TestSupabasePage() {
  const user = await currentUser();
  const supabase = await createServerSupabaseClient();

  // 테스트 쿼리 (예: profiles 테이블)
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(5);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase 통합 테스트</h1>

      <div className="space-y-4">
        <div>
          <h2 className="font-semibold">Clerk User:</h2>
          <pre className="bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="font-semibold">Supabase Query Result:</h2>
          {error ? (
            <p className="text-destructive">Error: {error.message}</p>
          ) : (
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
```

#### 5.2.3 브라우저 테스트

**다양한 환경에서 테스트:**

- ✅ Chrome (최신)
- ✅ Safari (최신)
- ✅ Firefox (최신)
- ✅ 모바일 Safari (iOS)
- ✅ Chrome Mobile (Android)

**확인 사항:**
- 쿠키 설정 정상
- 로그인 상태 유지
- 리다이렉트 정상
- 세션 만료 처리

### 5.3 성능 및 보안 검증

#### 5.3.1 성능 검증

```bash
# Lighthouse 점수 확인
npm run build
npm run start

# Chrome DevTools → Lighthouse → Generate report
```

**목표:**
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

#### 5.3.2 보안 검증

**체크리스트:**

- ✅ 환경 변수 `.env.local`에만 저장 (Git 제외)
- ✅ `CLERK_SECRET_KEY` 노출 방지
- ✅ `SUPABASE_SERVICE_ROLE` 서버에서만 사용
- ✅ RLS 정책 활성화 확인
- ✅ HTTPS 사용 (프로덕션)

---

## Phase 6: 정리 및 최적화

### 📅 예상 소요 시간: 30분

### 6.1 불필요한 파일 정리

#### 삭제할 파일 목록

```bash
# Supabase Auth 관련 파일 삭제
rm -rf src/components/auth/_backup     # 백업 파일
rm -rf src/actions/_backup              # 백업 파일
rm -rf src/app/auth/_backup             # 백업 파일

# 또는 모든 백업 보관 (나중에 참고용)
# 삭제하지 않고 _backup 디렉토리에 보관
```

#### 유지할 파일

```
src/
├── components/
│   └── auth/
│       └── auth-provider.tsx          # Clerk 기반으로 수정됨
├── utils/
│   └── supabase/
│       ├── client.ts                  # Clerk 통합됨
│       ├── server.ts                  # Clerk 통합됨
│       ├── middleware.ts              # 사용하지 않지만 보관 가능
│       └── storage.ts                 # Supabase Storage 사용
└── actions/
    └── storage.ts                     # Supabase Storage 사용
```

### 6.2 타입 정의 업데이트

#### 파일 수정

**파일**: `src/types/auth.ts`

**Before:**

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

export const signupSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
  password: z
    .string()
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
});

export const magicLinkSchema = z.object({
  email: z.string().email("유효한 이메일을 입력해주세요."),
});
```

**After:**

```typescript
import type { User } from "@clerk/nextjs/server";

/**
 * Clerk User 타입 재정의
 * 필요시 확장 가능
 */
export type AuthUser = User;

/**
 * 인증 상태 타입
 */
export interface AuthState {
  user: User | null | undefined;
  isLoading: boolean;
  isSignedIn: boolean | undefined;
}

/**
 * 사용자 메타데이터 타입 (Clerk publicMetadata)
 */
export interface UserMetadata {
  role?: "admin" | "user";
  organizationId?: string;
  preferences?: Record<string, any>;
}
```

**변경 사항:**
- ✅ Zod 스키마 제거 (Clerk가 처리)
- ✅ Clerk User 타입 정의 추가
- ✅ AuthState 인터페이스 추가
- ✅ UserMetadata 타입 추가 (향후 확장용)

### 6.3 환경 변수 문서화

#### 파일 생성

**파일**: `.env.example`

```bash
# ==========================================
# Clerk 환경 변수
# ==========================================
# Clerk Dashboard → API Keys에서 발급
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Clerk 리다이렉트 URL 설정
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# ==========================================
# Supabase 환경 변수
# ==========================================
# Supabase Dashboard → Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (서버에서만 사용, 절대 노출 금지!)
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Project ID (타입 생성용)
SUPABASE_PROJECT_ID=xxx

# ==========================================
# 사이트 설정
# ==========================================
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 6.4 README 업데이트

#### 파일 수정

**파일**: `README.md`

추가할 섹션:

```markdown
## 🔐 인증 시스템

이 프로젝트는 **Clerk**를 사용하여 사용자 인증을 처리하고, **Supabase**를 데이터베이스 및 스토리지로 사용합니다.

### Clerk + Supabase 통합

- **Clerk**: 사용자 로그인, 회원가입, 세션 관리
- **Supabase**: PostgreSQL 데이터베이스, Row-Level Security, Storage

### 환경 변수 설정

1. `.env.example`을 `.env.local`로 복사
2. Clerk API 키 발급 (https://dashboard.clerk.com)
3. Supabase 프로젝트 생성 (https://supabase.com)
4. 환경 변수 입력

### Clerk Session Token 설정

Supabase와 통합하려면 Clerk JWT에 `role` claim 추가 필요:

1. Clerk Dashboard → Configure → Sessions
2. "Customize session token" 클릭
3. 다음 JSON 입력:

\`\`\`json
{
  "role": "authenticated",
  "sub": "{{user.id}}"
}
\`\`\`

### Supabase Third-Party Auth 설정

`supabase/config.toml`:

\`\`\`toml
[auth.third_party.clerk]
enabled = true
domain = "your-app.clerk.accounts.dev"
\`\`\`

### 보호된 라우트 추가

`src/middleware.ts`에서 경로 추가:

\`\`\`typescript
const isProtectedRoute = createRouteMatcher([
  '/profile(.*)',
  '/dashboard(.*)',
  '/your-route(.*)',  // 추가
])
\`\`\`
```

### 6.5 Git Commit

변경 사항을 커밋합니다.

```bash
git add .
git commit -m "feat: migrate from Supabase Auth to Clerk

- Add Clerk authentication integration
- Update Supabase clients to use Clerk JWT tokens
- Replace custom auth forms with Clerk components
- Update middleware to use Clerk authentication
- Maintain Supabase database and storage functionality

BREAKING CHANGE: Authentication system migrated to Clerk"
```

---

## 롤백 계획

만약 마이그레이션 중 문제가 발생하면 다음 단계로 롤백할 수 있습니다.

### 🔄 즉시 롤백 (Git)

```bash
# 마지막 커밋 취소
git reset --hard HEAD~1

# 또는 특정 커밋으로 되돌리기
git log  # 커밋 해시 확인
git reset --hard <commit-hash>

# 패키지 재설치
pnpm install

# 개발 서버 재시작
pnpm dev
```

### 🔄 단계별 롤백

#### 1. Clerk Provider 제거

**파일**: `src/app/layout.tsx`

```typescript
// ClerkProvider 제거
import { AuthProvider } from "@/components/auth/auth-provider";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>  {/* Supabase 기반 */}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### 2. 미들웨어 복원

**파일**: `src/middleware.ts`

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

#### 3. 백업 파일 복원

```bash
# 백업한 파일들 복원
cp -r src/components/auth/_backup/* src/components/auth/
cp -r src/actions/_backup/* src/actions/
cp -r src/app/auth/_backup/* src/app/auth/
```

#### 4. Clerk 패키지 제거

```bash
pnpm remove @clerk/nextjs @clerk/localizations
```

---

## FAQ 및 트러블슈팅

### ❓ 자주 묻는 질문

#### Q1: 기존 Supabase 사용자 데이터는 어떻게 되나요?

**A:** Clerk로 마이그레이션하면 기존 Supabase Auth 사용자는 **별도로 마이그레이션이 필요**합니다.

**옵션 1: 사용자 재등록**
- 사용자에게 Clerk로 새로 회원가입 요청
- 간단하지만 사용자 불편

**옵션 2: 데이터 마이그레이션 (고급)**
- Supabase Auth 사용자를 Clerk로 마이그레이션
- Clerk API를 사용하여 사용자 생성
- 비밀번호는 재설정 링크 발송

```typescript
// 예시 마이그레이션 스크립트 (서버에서만 실행)
import { clerkClient } from '@clerk/nextjs/server';
import { createServerSupabaseAdminClient } from '@/utils/supabase/server';

async function migrateUsers() {
  const supabase = await createServerSupabaseAdminClient();

  // Supabase에서 모든 사용자 가져오기
  const { data: users } = await supabase.auth.admin.listUsers();

  for (const user of users.users) {
    try {
      // Clerk에 사용자 생성
      await clerkClient.users.createUser({
        emailAddress: [user.email!],
        // 비밀번호는 재설정 링크 발송
        skipPasswordRequirement: true,
      });

      console.log(`Migrated: ${user.email}`);
    } catch (error) {
      console.error(`Failed to migrate ${user.email}:`, error);
    }
  }
}
```

#### Q2: Supabase Storage는 계속 사용할 수 있나요?

**A:** 네! Supabase Storage는 독립적으로 사용 가능합니다.

```typescript
// Storage는 Clerk 토큰과 함께 정상 작동
const supabase = useSupabaseClient();
const { data, error } = await supabase
  .storage
  .from('avatars')
  .upload('user123.png', file);
```

**RLS 정책도 Clerk JWT로 검증됩니다:**

```sql
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.jwt()->>'sub'
);
```

#### Q3: Clerk 무료 플랜 제한은?

**A:** Clerk 무료 플랜:
- ✅ 월 10,000 활성 사용자 (MAU)
- ✅ 무제한 소셜 로그인
- ✅ 이메일/SMS OTP
- ✅ 다크 모드, 커스터마이징
- ❌ 조직 기능 (유료)
- ❌ SAML SSO (유료)

**비용:**
- 10,000 MAU 이후: $25/월 + 추가 사용자당 $0.02

#### Q4: 다국어 지원은?

**A:** Clerk는 40개 이상 언어 지원:

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { koKR } from '@clerk/localizations'

<ClerkProvider localization={koKR}>
  {children}
</ClerkProvider>
```

**지원 언어:**
- 한국어 (`koKR`)
- 영어 (`enUS`)
- 일본어 (`jaJP`)
- 중국어 (`zhCN`, `zhTW`)
- 기타 40개 언어

#### Q5: Clerk UI 커스터마이징은?

**A:** `appearance` prop으로 완전 커스터마이징 가능:

```typescript
<SignIn
  appearance={{
    layout: {
      socialButtonsPlacement: "bottom",
      socialButtonsVariant: "iconButton",
    },
    variables: {
      colorPrimary: "#3b82f6",
      colorBackground: "#ffffff",
      colorText: "#000000",
    },
    elements: {
      formButtonPrimary: "bg-blue-500 hover:bg-blue-600",
      card: "shadow-xl",
      headerTitle: "text-3xl font-bold",
      socialButtonsBlockButton: "border-2",
    },
  }}
/>
```

### 🔧 트러블슈팅

#### 문제 1: "Invalid JWT" 에러

**증상:**
```
Error: Invalid JWT: Missing required claim 'role'
```

**원인:** Clerk Session Token에 `role` claim이 없음

**해결:**
1. Clerk Dashboard → Configure → Sessions
2. "Customize session token" 확인
3. `{ "role": "authenticated" }` 포함 확인
4. 브라우저 쿠키 삭제 후 재로그인

#### 문제 2: Supabase RLS 정책 실패

**증상:**
```
Error: new row violates row-level security policy
```

**원인:** RLS 정책이 Clerk JWT를 인식하지 못함

**해결:**
1. `supabase/config.toml` 확인:
   ```toml
   [auth.third_party.clerk]
   enabled = true
   domain = "correct-domain.clerk.accounts.dev"
   ```
2. Supabase 프로젝트 재시작 (필요시)
3. JWT claims 확인:
   ```sql
   SELECT auth.jwt();
   ```

#### 문제 3: 무한 리다이렉트 루프

**증상:**
- `/login` ↔ `/` 무한 반복

**원인:** 미들웨어 설정 오류

**해결:**
1. `src/middleware.ts` 확인:
   ```typescript
   const isPublicRoute = createRouteMatcher([
     '/',
     '/login(.*)',  // 로그인 페이지는 공개
   ])
   ```
2. `isProtectedRoute`와 `isPublicRoute` 겹치지 않도록 설정

#### 문제 4: "Hydration mismatch" 에러

**증상:**
```
Error: Hydration failed because the initial UI does not match
what was rendered on the server.
```

**원인:** 서버/클라이언트 불일치 (주로 `useAuth()` 사용 시)

**해결:**
```typescript
// ❌ 잘못된 사용
export default function Component() {
  const { user } = useAuth();
  return <div>{user?.email}</div>;  // SSR/CSR 불일치
}

// ✅ 올바른 사용
export default function Component() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return <div>{user?.emailAddresses[0]?.emailAddress}</div>;
}
```

#### 문제 5: TypeScript 타입 에러

**증상:**
```typescript
Property 'email' does not exist on type 'User'
```

**원인:** Clerk User 타입 구조가 Supabase와 다름

**해결:**
```typescript
// ❌ Supabase User
user.email

// ✅ Clerk User
user.emailAddresses[0]?.emailAddress
```

**Clerk User 타입 참고:**
```typescript
{
  id: string;
  emailAddresses: EmailAddress[];
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;
}
```

---

## 📚 참고 자료

### 공식 문서

- [Clerk 공식 문서](https://clerk.com/docs)
- [Clerk + Next.js 가이드](https://clerk.com/docs/quickstarts/nextjs)
- [Supabase Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk + Supabase 통합 가이드](https://clerk.com/docs/integrations/databases/supabase)

### 유용한 링크

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Clerk Localization](https://clerk.com/docs/components/customization/localization)
- [Clerk Appearance Customization](https://clerk.com/docs/components/customization/overview)
- [Supabase RLS with Clerk](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ 최종 체크리스트

마이그레이션 완료 전 최종 확인:

### Phase 1: 환경 준비
- [ ] Clerk 계정 생성 및 앱 설정
- [ ] `.env.local` 환경 변수 설정
- [ ] Clerk Session Token에 `role: "authenticated"` 추가
- [ ] `supabase/config.toml`에 Clerk 설정 추가
- [ ] `pnpm add @clerk/nextjs` 설치

### Phase 2: Clerk 통합
- [ ] `src/app/layout.tsx`에 `ClerkProvider` 추가
- [ ] `src/utils/supabase/client.ts` Clerk 토큰 통합
- [ ] `src/utils/supabase/server.ts` Clerk 토큰 통합
- [ ] `src/middleware.ts` Clerk 미들웨어로 교체

### Phase 3: 컴포넌트 마이그레이션
- [ ] `src/components/auth/auth-provider.tsx` Clerk로 교체
- [ ] `src/app/login/page.tsx` Clerk SignIn 사용
- [ ] `src/components/nav/user-nav.tsx` Clerk UserButton 사용
- [ ] 커스텀 auth 컴포넌트 백업/삭제

### Phase 4: 서버 마이그레이션
- [ ] `src/app/profile/page.tsx` `currentUser()` 사용
- [ ] `src/app/auth/callback` 삭제
- [ ] `src/actions/auth.ts` 백업/삭제
- [ ] `src/app/auth/error/page.tsx` 업데이트

### Phase 5: 테스트
- [ ] 회원가입 테스트
- [ ] 로그인 테스트
- [ ] 로그아웃 테스트
- [ ] 보호된 라우트 테스트
- [ ] Supabase 쿼리 테스트
- [ ] RLS 정책 검증

### Phase 6: 정리
- [ ] 백업 파일 정리
- [ ] `src/types/auth.ts` 업데이트
- [ ] `.env.example` 생성
- [ ] `README.md` 업데이트
- [ ] Git commit

---

## 🎉 마이그레이션 완료!

축하합니다! Supabase Auth에서 Clerk로 성공적으로 마이그레이션했습니다.

**다음 단계:**
1. 프로덕션 배포 전 충분한 테스트
2. Clerk 프로덕션 키 발급
3. 환경 변수 프로덕션 설정
4. 사용자 마이그레이션 (필요시)
5. 모니터링 설정

**문의 및 지원:**
- Clerk Discord: https://clerk.com/discord
- Supabase Discord: https://discord.supabase.com
- GitHub Issues: (프로젝트 저장소)

---

**작성자**: Migration Guide Generator
**버전**: 1.0
**최종 업데이트**: 2025-01-27
