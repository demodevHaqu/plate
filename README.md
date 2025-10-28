# Next.js + Supabase 보일러플레이트

최신 Next.js와 Supabase를 활용한 풀스택 개발을 위한 보일러플레이트입니다.

## 주요 기능

- 🔐 **Clerk Authentication**: 현대적인 인증 시스템 (이메일/비밀번호, OAuth, 매직 링크 지원)
- 💾 **Supabase Storage**: 파일 업로드 및 관리
- 🔗 **Clerk + Supabase 통합**: Clerk JWT 토큰을 통한 Supabase RLS 검증
- 💳 **토스페이먼츠 결제**: API 개별 연동(결제창 방식)을 활용한 결제 시스템 (카드, 가상계좌, 계좌이체 등)
- 🏗️ **Next.js 앱 라우터**: 최신 Next.js 앱 라우터 구조 사용
- 🎨 **ShadcnUI + TailwindCSS**: 현대적이고 커스터마이징 가능한 UI 컴포넌트
- 🌓 **다크 모드**: 사용자 선호에 따른 테마 전환 지원
- 📱 **반응형 디자인**: 모바일부터 데스크탑까지 최적화된 UI
- 🔍 **SEO 최적화**: 메타데이터, 구조화된 데이터, sitemap.xml, robots.txt 자동 생성
- 📝 **서버 액션**: Next.js 서버 액션을 활용한 폼 처리 및 파일 업로드
- 🔒 **보호된 라우트**: 인증 상태에 따른 라우트 보호 구현
- 🌏 **한국어 지원**: Clerk 한국어 UI 완벽 지원

## 기술 스택

- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/) (Authentication)
- [Supabase](https://supabase.com/) (Database, Storage, RLS)
- [토스페이먼츠](https://www.tosspayments.com/) (Payment)
- [TailwindCSS](https://tailwindcss.com/)
- [ShadcnUI](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Lucide Icons](https://lucide.dev/)

## 🚀 빠른 시작 (Quick Start)

### 사전 요구사항

- Node.js 18.17.0 이상
- pnpm 8.0.0 이상

### Step 1: 저장소 클론 및 의존성 설치

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/nextjs-supabase-boilerplate.git my-project
cd my-project

# 2. 의존성 설치
pnpm install
```

### Step 2: Clerk 설정

#### 2.1 Clerk 계정 생성 및 애플리케이션 설정

1. [Clerk Dashboard](https://dashboard.clerk.com)에 접속하여 계정을 생성합니다.
2. "Create Application" 버튼을 클릭합니다.
3. Application 이름을 입력합니다 (예: `my-awesome-app`).
4. 사용할 인증 방법을 선택합니다:
   - ✅ Email (권장)
   - ✅ Google (선택사항)
   - ✅ 기타 OAuth 제공자 (필요시)

#### 2.2 Clerk API 키 복사

1. Clerk Dashboard → Configure → API Keys로 이동합니다.
2. 다음 두 키를 복사해둡니다:
   - `Publishable Key` (pk_test_...)
   - `Secret Key` (sk_test_...)

#### 2.3 Clerk Session Token 커스터마이징

**중요**: Supabase와 통합하려면 Clerk JWT에 `role` claim을 추가해야 합니다.

1. Clerk Dashboard → Configure → Sessions로 이동합니다.
2. "Customize session token" 버튼을 클릭합니다.
3. 다음 JSON을 입력합니다:

```json
{
  "role": "authenticated"
}
```

4. "Save" 버튼을 클릭합니다.

#### 2.4 Clerk 도메인 확인

Clerk Dashboard 상단에서 애플리케이션 도메인을 확인합니다.
- 형식: `your-app-name.clerk.accounts.dev`
- 이 도메인은 나중에 Supabase 설정에서 사용됩니다.

### Step 3: Supabase 설정

#### 3.1 Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard)에 접속합니다.
2. "New Project"를 클릭합니다.
3. 프로젝트 이름, 데이터베이스 비밀번호, 리전을 설정합니다.
4. 프로젝트 생성을 기다립니다 (약 2분 소요).

#### 3.2 Supabase API 키 복사

1. 프로젝트 생성 후 Settings → API로 이동합니다.
2. 다음 정보를 복사해둡니다:
   - `Project URL` (https://xxxxx.supabase.co)
   - `anon public` key
   - `service_role` key (선택사항, 관리자 권한 필요 시)

#### 3.3 Supabase Third-Party Auth 설정

**중요**: Clerk JWT를 Supabase에서 인식하도록 설정합니다.

1. Supabase Dashboard → Authentication → Providers로 이동합니다.
2. "Third-Party Auth" 섹션에서 "Add Provider"를 클릭합니다.
3. "Clerk"를 선택합니다.
4. **Clerk Domain**을 입력합니다 (Step 2.4에서 확인한 도메인):
   ```
   your-app-name.clerk.accounts.dev
   ```
5. "Save" 버튼을 클릭합니다.

#### 3.4 Supabase 로컬 설정 (supabase/config.toml)

`supabase/config.toml` 파일을 열고 다음 설정을 수정합니다:

```toml
[auth.third_party.clerk]
enabled = true
domain = "your-app-name.clerk.accounts.dev"  # Step 2.4에서 확인한 도메인으로 변경
```

#### 3.5 Supabase Storage 버킷 생성

1. Supabase Dashboard → Storage로 이동합니다.
2. "Create a new bucket"을 클릭합니다.
3. 버킷 이름을 입력합니다 (예: `avatars` 또는 `uploads`).
4. "Public bucket"을 체크합니다 (공개 파일 업로드용).
5. "Create bucket"을 클릭합니다.

### Step 4: 데이터베이스 설정

결제 시스템을 사용하려면 데이터베이스 테이블을 생성해야 합니다.

**📖 상세 가이드**: [데이터베이스 설정 가이드](./docs/DATABASE_SETUP.md)

#### 빠른 설정 (Supabase Dashboard 사용)

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속 → 프로젝트 선택
2. 좌측 메뉴에서 **"SQL Editor"** 클릭
3. [데이터베이스 설정 가이드](./docs/DATABASE_SETUP.md)의 SQL 스크립트를 복사하여 실행

실행 후 다음 테이블이 생성됩니다:
- ✅ `products` - 상품 정보
- ✅ `payments` - 결제 내역

### Step 5: 환경 변수 설정

1. `.env.example` 파일을 `.env.local`로 복사합니다:

```bash
cp .env.example .env.local
```

2. `.env.local` 파일을 열고 다음 값들을 입력합니다:

```
# Clerk API Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://project_id.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
NEXT_PUBLIC_STORAGE_BUCKET="your_storage_bucket_name"

# Site Configuration
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# 토스페이먼츠 Configuration (API 개별 연동)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."  # API 개별 연동 키 (ck 포함)
TOSS_SECRET_KEY="test_sk_..."  # API 개별 연동 시크릿 키 (sk 포함)

# Supabase Admin (Optional)
SUPABASE_SERVICE_ROLE="your_supabase_service_role"
SUPABASE_DB_PASSWORD="your_supabase_db_password"
```

**필수 환경 변수:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk 공개 키
- `CLERK_SECRET_KEY`: Clerk 비밀 키
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 익명 키
- `NEXT_PUBLIC_STORAGE_BUCKET`: Supabase 스토리지 버킷 이름 (예: `test-bucket`)
- `NEXT_PUBLIC_SITE_URL`: 배포할 사이트 URL (개발 시 `http://localhost:3000`)
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 토스페이먼츠 클라이언트 키 (API 개별 연동, test_ck_...)
- `TOSS_SECRET_KEY`: 토스페이먼츠 시크릿 키 (API 개별 연동, test_sk_...)

**선택적 환경 변수:**
- `SUPABASE_SERVICE_ROLE`: Supabase 서비스 롤 키 (관리자 권한)

**⚠️ 중요: `SUPABASE_SERVICE_ROLE` 사용 시 주의사항**

`SUPABASE_SERVICE_ROLE` 키는 Supabase 프로젝트의 모든 데이터에 접근하고 모든 RLS(Row Level Security) 정책을 우회할 수 있는 관리자 권한 키입니다.
이 키는 다음과 같은 경우에만 매우 신중하게 사용해야 합니다:

- 서버 측 로직 (예: Next.js 서버 액션, API 라우트)
- 보안된 서버리스 함수
- 데이터베이스 마이그레이션 또는 관리 스크립트

**절대로 클라이언트 측 코드나 브라우저 환경에 이 키를 노출해서는 안 됩니다.**
보안 침해 시 심각한 데이터 유출 및 조작이 발생할 수 있습니다.
일반적인 사용자 데이터 접근에는 항상 익명 키(`NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 사용하고 RLS 정책을 통해 데이터 접근을 제어하세요.

- `SUPABASE_DB_PASSWORD`: Supabase 데이터베이스 비밀번호
- `SUPABASE_PROJECT_ID`: Supabase 프로젝트 ID (타입 생성용)

### Step 6: 토스페이먼츠 설정 (선택사항)

결제 기능을 사용하려면 토스페이먼츠 API 키가 필요합니다.

**📖 상세 가이드**: [토스페이먼츠 결제 시스템 가이드](./docs/PAYMENT.md)

#### 빠른 설정

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속 및 회원가입
2. 좌측 사이드바 → **"API 키"** 클릭
3. **"API 개별 연동 키"** 섹션에서 키 확인:
   - 클라이언트 키: `test_ck_...` (중간에 `ck` 포함)
   - 시크릿 키: `test_sk_...` (중간에 `sk` 포함)
4. `.env.local` 파일에 키 추가:
   ```bash
   NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
   TOSS_SECRET_KEY="test_sk_..."
   ```

> ⚠️ **주의**: "결제위젯 연동 키"(`gck_`/`gsk_`)가 아닌 **"API 개별 연동 키"**(`ck_`/`sk_`)를 사용해야 합니다!

### Step 7: SEO 및 사이트 정보 커스터마이징

**파일**: `src/utils/seo/constants.ts`

```typescript
export const siteConfig = {
  name: "Your App Name",  // 앱 이름으로 변경
  description: "Your app description",
  keywords: [
    "Next.js",
    "Supabase",
    "Boilerplate",
    // 프로젝트 관련 키워드 추가
  ],
  twitterHandle: "@yourhandle",  // 트위터 핸들로 변경
};
```

### Step 8: 개발 서버 실행

```bash
pnpm dev
```

이제 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하여 애플리케이션을 확인할 수 있습니다.

---

## ⚠️ 배포 전 체크리스트

보일러플레이트를 프로덕션에 배포하거나 Git에 푸시하기 전에 다음을 확인하세요:

### 보안 체크

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.local` 파일이 Git에 커밋되지 않았는지 확인
  ```bash
  git status  # .env.local이 표시되지 않아야 함
  ```
- [ ] `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE` 등 민감한 키가 코드에 하드코딩되지 않았는지 확인
- [ ] 공개 저장소인 경우 모든 민감 정보가 제거되었는지 재확인

### 설정 체크

- [ ] `supabase/config.toml`의 Clerk domain을 **자신의 도메인**으로 변경했는지 확인
  ```toml
  [auth.third_party.clerk]
  enabled = true
  domain = "your-app-name.clerk.accounts.dev"  # 본인 도메인으로 변경 필수!
  ```
- [ ] `src/utils/seo/constants.ts`의 사이트 정보를 **자신의 정보**로 변경했는지 확인
- [ ] `.env.local`의 모든 플레이스홀더(`your_...`)를 **실제 값**으로 교체했는지 확인
- [ ] Supabase Storage 버킷이 생성되고 `NEXT_PUBLIC_STORAGE_BUCKET`에 올바른 이름이 설정되었는지 확인

### 기능 테스트

- [ ] 로그인/회원가입이 정상 작동하는지 테스트
- [ ] 로그아웃 기능이 정상 작동하는지 테스트
- [ ] 보호된 라우트(`/profile`)가 인증되지 않은 사용자를 차단하는지 확인
- [ ] 파일 업로드 기능이 정상 작동하는지 테스트 (Supabase Storage)
- [ ] 다크 모드 전환이 정상 작동하는지 확인
- [ ] 결제 기능 테스트 (토스페이먼츠 연동 시)
  - [ ] 상품 목록 페이지 (`/products`) 접속 확인
  - [ ] 결제 프로세스 정상 작동 확인
  - [ ] 결제 성공/실패 처리 확인

### 프로덕션 준비

- [ ] Clerk에서 프로덕션 키 발급 (테스트 키 → 프로덕션 키)
- [ ] Supabase 프로젝트의 RLS 정책이 올바르게 설정되었는지 확인
- [ ] 프로덕션 환경 변수 설정 (Vercel, Netlify 등)
- [ ] `NEXT_PUBLIC_SITE_URL`을 프로덕션 도메인으로 변경
- [ ] 토스페이먼츠 프로덕션 키 발급 및 설정 (결제 사용 시)
  - [ ] 전자결제 신청 및 사업자 등록증 제출
  - [ ] `test_ck_` → `live_ck_`, `test_sk_` → `live_sk_`로 변경

---

## 🔧 고급 설정

### Clerk Third-Party Auth (로컬 vs 프로덕션)

**로컬 개발 환경**:
`supabase/config.toml` 파일에서 설정합니다 (Step 3.4 참조).

**프로덕션 환경**:
Supabase Dashboard → Authentication → Providers → Third-Party Auth에서 Clerk를 활성화하고 도메인을 설정합니다.

### Supabase Storage 설정 (상세)

스토리지 버킷 생성은 Step 3.5에서 다루었습니다. 추가 설정이 필요한 경우:

1. Supabase Dashboard → Storage로 이동합니다.
2. 생성한 버킷을 선택합니다.
3. (선택 사항) 스토리지 정책(Policies)을 설정하여 파일 접근 권한을 세밀하게 제어할 수 있습니다.

**기본 설정**: 공개 버킷은 모든 사용자가 파일을 읽을 수 있습니다. 파일 업로드 및 삭제는 보일러플레이트의 서버 액션을 통해 처리됩니다.

## 스토리지 보안 고려사항 (Storage Security Considerations)

이 보일러플레이트는 Supabase Storage를 사용하여 파일 업로드 및 관리를 지원합니다. 기본 설정에서는 편의를 위해 공개(public) 버킷을 사용하도록 안내하고 있습니다. 공개 버킷은 버킷 내의 모든 객체에 대해 공개적인 읽기 접근을 허용합니다.

### 공개 버킷의 의미

- **읽기 접근**: 버킷이 공개로 설정되면, 해당 버킷 내 파일의 URL을 아는 사람은 누구나 파일을 읽거나 다운로드할 수 있습니다. 인증이나 추가적인 권한 확인이 필요하지 않습니다.
- **쓰기/삭제 접근**: 이 보일러플레이트에서는 파일 업로드, 수정, 삭제는 인증된 사용자에 한해 서버 액션(`src/actions/storage.ts`)을 통해서만 이루어지도록 구현되어 있습니다. 이는 직접적인 클라이언트 측 쓰기 접근을 방지하여 기본적인 보안을 제공합니다.

### 스토리지 접근 제어 강화 (RLS 정책 활용)

모든 사용자에게 파일을 공개하고 싶지 않거나, 사용자별 또는 조건별로 파일 접근 권한을 세밀하게 제어해야 하는 경우 Supabase의 RLS(Row Level Security) 정책을 스토리지에 적용해야 합니다.

**RLS 정책을 사용하면 다음과 같은 규칙을 설정할 수 있습니다:**

- 사용자는 자신의 파일만 보거나 다운로드할 수 있습니다.
- 특정 역할을 가진 사용자만 특정 폴더의 파일에 접근할 수 있습니다.
- 특정 조건을 만족하는 파일만 공개적으로 접근 가능하게 설정할 수 있습니다.

**RLS 정책 설정 방법:**

1.  **버킷을 비공개(private)로 설정**: Supabase 대시보드에서 해당 스토리지 버킷의 "Public access"를 비활성화합니다.
2.  **스토리지 정책(Policies) 생성**: Supabase 대시보드의 "Storage" > "Policies" 섹션에서 테이블에 RLS 정책을 설정하듯이 스토리지 객체에 대한 정책을 작성합니다.

    - `storage.objects` 테이블에 대해 `SELECT`, `INSERT`, `UPDATE`, `DELETE` 권한에 대한 정책을 정의할 수 있습니다.
    - 예를 들어, 사용자가 자신의 `user_id`와 일치하는 폴더 내의 파일만 읽을 수 있도록 하려면 `SELECT` 정책을 다음과 같이 설정할 수 있습니다:
      ```sql
      -- 사용자는 자신의 user_id와 이름이 같은 폴더 내의 파일만 볼 수 있습니다.
      CREATE POLICY "User can view own files"
      ON storage.objects FOR SELECT
      USING ( auth.uid()::text = (storage.foldername(name))[1] );
      -- 참고: 위 정책은 파일 경로의 첫 번째 폴더 이름이 user_id와 같다고 가정합니다.
      -- 예: /user_id_123/image.png
      ```
    - 파일 업로드 시 `INSERT` 정책은 사용자가 특정 경로에만 업로드하도록 제한할 수 있습니다.
      ```sql
      -- 사용자는 자신의 user_id와 이름이 같은 폴더에만 파일을 업로드할 수 있습니다.
      CREATE POLICY "User can upload to own folder"
      ON storage.objects FOR INSERT
      WITH CHECK ( auth.uid()::text = (storage.foldername(name))[1] );
      ```

3.  **서버 액션 확인**: `src/actions/storage.ts`의 파일 관련 로직(특히 파일 URL 생성 또는 접근)이 비공개 버킷 및 RLS 정책과 호환되는지 확인해야 할 수 있습니다. 예를 들어, 비공개 파일에 접근하려면 Supabase 클라이언트에서 `createSignedUrl`과 같은 함수를 사용하여 특정 시간 동안만 유효한 URL을 생성해야 할 수 있습니다. 이 보일러플레이트의 `src/utils/supabase/storage.ts`에 있는 `getPublicUrl`은 공개 버킷을 가정하므로, 비공개 버킷 사용 시에는 `createSignedUrl` 등으로 대체해야 합니다.

**자세한 정보는 Supabase 공식 문서를 참고하세요:**

- [Supabase Storage 접근 제어](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage RLS 정책 예시](https://supabase.com/docs/guides/storage/security/rls-policies-examples)

애플리케이션의 요구사항에 맞춰 스토리지 보안 설정을 적절히 구성하는 것이 중요합니다.

## 데이터베이스 타입 생성 (Type Generation)

이 보일러플레이트는 Supabase 데이터베이스 스키마로부터 TypeScript 타입을 생성하여 코드 안정성과 개발자 경험을 향상시키는 기능을 제공합니다. 생성된 타입은 `src/types/database.types.ts` 파일에 저장됩니다.

### 1. Supabase CLI 설치 및 로그인

아직 Supabase CLI를 설치하지 않았다면, 다음 명령어로 설치하세요:

```bash
pnpm install supabase --save-dev
```

또는 전역으로 설치할 수 있습니다:

```bash
pnpm install -g supabase
```

설치 후 Supabase에 로그인합니다:

```bash
pnpx supabase login
```

### 2. 프로젝트 ID 확인 및 설정

Supabase 프로젝트 대시보드에서 프로젝트 ID를 확인하세요. (URL이 `https://<project_id>.supabase.co` 형식인 경우 `<project_id>` 부분입니다.)

`package.json` 파일의 `scripts` 섹션에 있는 `supabase:types` 명령어를 수정하여 `YOUR_PROJECT_ID_HERE` 부분을 실제 프로젝트 ID로 변경해야 합니다.

예시:

```json
// package.json
"scripts": {
  // ... 다른 스크립트들 ...
  "supabase:types": "supabase gen types typescript --project-id 실제프로젝트ID > src/types/database.types.ts"
},
```

또는, 환경 변수 `SUPABASE_PROJECT_ID`를 설정하고 스크립트를 다음과 같이 수정할 수도 있습니다:
`"supabase:types": "supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts"`

### 3. 타입 생성 실행

다음 명령어를 실행하여 데이터베이스 타입을 생성합니다:

```bash
pnpm supabase:types
```

(또는 `npm run supabase:types` / `yarn supabase:types`)

이 명령어는 `src/types/database.types.ts` 파일을 Supabase 데이터베이스 스키마를 기반으로 덮어씁니다.
데이터베이스 스키마 변경 시 (테이블, 컬럼, 함수 등 추가/수정) 이 명령어를 다시 실행하여 타입을 최신 상태로 유지하세요.

### 4. 생성된 타입 활용

생성된 타입은 Supabase 클라이언트와 함께 사용하여 쿼리 결과 및 입력에 대한 타입 안전성을 확보할 수 있습니다.

```typescript
// 예시: Supabase 클라이언트와 타입 함께 사용하기
import { createServerSupabaseClient } from "@/utils/supabase/server";
import type { Database } from "@/types/database.types"; // 생성된 타입 import

async function getUserProfile(userId: string) {
  const supabase = await createServerSupabaseClient(); // 타입 지정은 createServerSupabaseClient<Database>() 와 같이 가능
  const { data, error } = await supabase
    .from("profiles") // 'profiles' 테이블이 있다고 가정
    .select("*")
    .eq("id", userId)
    .single<Database["public"]["Tables"]["profiles"]["Row"]>(); // Row 타입 사용

  if (error) throw error;
  return data;
}
```

이와 같이 타입을 활용하면 개발 중 실수를 줄이고 자동 완성을 통해 생산성을 높일 수 있습니다.
`src/types/schema.ts`의 Zod 스키마와 함께 사용하거나, Zod 스키마를 생성된 DB 타입으로부터 파생시키는 방법도 고려할 수 있습니다.

## 프로젝트 구조

```
src/
├── actions/                # Next.js 서버 액션 (auth.ts, storage.ts)
├── app/                    # Next.js 앱 라우터
│   ├── auth/               # 인증 관련 라우트 (callback, error)
│   ├── login/              # 로그인 페이지 (layout.tsx, page.tsx)
│   ├── profile/            # 프로필 페이지 (layout.tsx, page.tsx)
│   ├── globals.css         # 전역 스타일
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 홈페이지 (파일 업로드/리스트)
│   ├── favicon.ico         # 파비콘
│   ├── manifest.ts         # PWA 매니페스트
│   ├── not-found.tsx       # 404 페이지
│   ├── robots.ts           # robots.txt 생성
│   └── sitemap.ts          # sitemap.xml 생성
├── components/             # 재사용 가능한 컴포넌트
│   ├── auth/               # 인증 UI 컴포넌트 (buttons.tsx 등)
│   ├── nav/                # 네비게이션 컴포넌트 (navbar.tsx 등)
│   ├── seo/                # SEO 관련 컴포넌트 (JsonLd.tsx)
│   ├── storage/            # 스토리지 관련 UI 컴포넌트
│   │   ├── file-uploader.tsx # 파일 업로드 컴포넌트
│   │   └── file-list.tsx     # 파일 목록 컴포넌트
│   └── ui/                 # Shadcn UI 컴포넌트 (button.tsx, input.tsx 등)
├── hooks/                  # 커스텀 훅 (use-mobile.ts)
├── lib/                    # 라이브러리 유틸리티 (utils.ts - Shadcn)
├── middleware.ts           # Next.js 미들웨어 (라우트 보호)
├── types/                  # TypeScript 타입 정의 (schema.ts)
└── utils/                  # 유틸리티 함수
    ├── seo/                # SEO 유틸리티 (constants.ts, metadata.ts)
    └── supabase/           # Supabase 클라이언트 (client.ts, server.ts, middleware.ts, storage.ts)
```

## 주요 기능 사용법

## 라우트 보호

`src/middleware.ts`는 Clerk 미들웨어를 사용하여 라우트 보호를 처리합니다.
인증되지 않은 사용자가 보호된 경로에 접근하려고 하면 Clerk 로그인 페이지로 리디렉션됩니다.

보호할 경로는 `src/middleware.ts` 파일의 `isProtectedRoute` 매처를 수정하여 설정할 수 있습니다:

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/profile(.*)",
  "/dashboard(.*)",
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

기본적으로 `/profile` 경로가 보호 설정되어 있습니다.
경로 패턴에 `(.*)` 를 추가하면 하위 경로도 모두 보호됩니다.

### 인증 컴포넌트

로그인 및 회원가입 기능은 Clerk에서 제공하는 사전 구축된 컴포넌트를 사용합니다:

- `src/app/login/[[...sign-in]]/page.tsx`: Clerk SignIn 컴포넌트 (로그인/회원가입)
- `src/components/nav/user-nav.tsx`: Clerk UserButton 컴포넌트 (사용자 프로필 메뉴)

Clerk는 이메일/비밀번호, OAuth (Google, GitHub 등), 매직 링크 등 다양한 인증 방법을 지원합니다.
Clerk Dashboard에서 원하는 인증 방법을 활성화할 수 있습니다.

### 파일 업로드 및 관리

파일 업로드 및 목록 표시는 홈페이지(`src/app/page.tsx`)에서 처리됩니다.

- `src/components/storage/file-uploader.tsx`: 파일 업로드를 위한 UI 컴포넌트입니다. `src/app/page.tsx`에서 사용됩니다.
- `src/components/storage/file-list.tsx`: 업로드된 파일 목록을 표시하기 위한 UI 컴포넌트입니다. `src/app/page.tsx`에서 사용됩니다.
- 파일 업로드는 `src/actions/storage.ts` 서버 액션을 사용합니다.
- Supabase Storage 유틸리티는 `src/utils/supabase/storage.ts`에 있습니다.

### 토스페이먼츠 결제 연동

이 보일러플레이트는 **토스페이먼츠 API 개별 연동(결제창 방식)**을 사용한 결제 시스템을 포함하고 있습니다.

> 💡 **API 개별 연동 vs 결제위젯**
> - **API 개별 연동**: 사업자 등록 없이 테스트 가능, 결제창이 팝업으로 열림
> - **결제위젯**: 사업자 등록 필요, 통합 UI 제공
>
> 이 보일러플레이트는 누구나 쉽게 테스트할 수 있도록 **API 개별 연동 방식**을 채택했습니다.

#### 🚀 Cursor 커맨드로 빠르게 시작하기

Cursor IDE를 사용한다면, 토스페이먼츠 통합을 더욱 빠르고 쉽게 구축할 수 있습니다!

**방법 1: 올인원 초기화 (권장)**
```
/toss-init
```
모든 설정을 한 번에 완료합니다 (환경 변수, 타입 정의, 결제 페이지, 검증 API 등).

**방법 2: 단계별 설정 (학습용)**
```
/toss-setup      # 1. 환경 설정
/toss-checkout   # 2. 결제 페이지 생성
/toss-verify     # 3. 결제 검증 API 생성
```

각 커맨드의 자세한 사용법은 [`.cursor/commands/toss-payments/README.md`](.cursor/commands/toss-payments/README.md)를 참고하세요.

> 💡 **커맨드 활용 팁**
> - Cursor 채팅창에서 `/`를 입력하면 사용 가능한 커맨드 목록이 표시됩니다
> - 각 커맨드는 `@toss-payments.mdc` 규칙을 기반으로 코드를 생성합니다
> - 생성된 코드는 토스페이먼츠 공식 가이드의 베스트 프랙티스를 따릅니다

#### 1단계: 토스페이먼츠 API 키 발급

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)에 가입/로그인
2. **API 키** 메뉴로 이동
3. **API 개별 연동 키** 섹션에서 키 확인
   - 클라이언트 키: `test_ck_...` (중간에 `ck` 포함)
   - 시크릿 키: `test_sk_...` (중간에 `sk` 포함)

> ⚠️ **중요**: 결제위젯 연동 키(`gck_`/`gsk_`)가 아닌 **API 개별 연동 키**(`ck_`/`sk_`)를 사용해야 합니다.

#### 2단계: 환경 변수 설정

`.env.local` 파일에 발급받은 키를 추가:

```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
```

#### 3단계: 데이터베이스 마이그레이션

결제 관련 테이블을 생성:

```bash
# Supabase에 마이그레이션 적용
npx supabase db push
```

또는 Supabase Dashboard의 SQL Editor에서 다음 파일들을 순서대로 실행:
- `supabase/migrations/20250128000000_create_payment_tables.sql`
- `supabase/migrations/20250128000001_fix_payment_rls_policies.sql`

#### 주요 기능

1. **상품 목록 페이지** (`/products`)
   - Supabase에서 상품 목록 조회
   - 반응형 그리드 레이아웃
   - 각 상품에 "결제하기" 버튼

2. **결제 주문서 페이지** (`/checkout/[productId]`)
   - 토스페이먼츠 결제창 호출 (API 개별 연동)
   - 다양한 결제수단 지원 (카드, 가상계좌, 계좌이체 등)
   - 결제 전 임시 주문 생성 (데이터 검증)
   - 결제창은 새 창(팝업)으로 열림

3. **결제 성공/실패 페이지** (`/payment/success`, `/payment/fail`)
   - 결제 승인 처리
   - 결제 결과 표시
   - 상세 정보 및 영수증 링크

#### 주요 파일 구조

```
src/
├── actions/
│   └── payment.ts              # 결제 서버 액션 (승인, 취소, 조회)
├── app/
│   ├── products/               # 상품 목록 페이지
│   ├── checkout/[productId]/   # 결제 주문서 페이지
│   └── payment/                # 결제 성공/실패 페이지
├── components/
│   └── payment/                # 결제 관련 컴포넌트
│       ├── product-card.tsx
│       ├── checkout-form.tsx
│       └── payment-result.tsx
├── types/
│   └── payment.ts              # 결제 관련 타입 정의
└── utils/
    └── tosspayments/           # 토스페이먼츠 유틸리티
        ├── client.ts           # SDK 초기화
        ├── server.ts           # API 호출
        └── constants.ts        # 상수 정의
```

#### 테스트 방법

1. 개발 서버 실행:
```bash
pnpm dev
```

2. `/products` 페이지로 이동하여 상품 목록 확인

3. 원하는 상품의 "결제하기" 버튼 클릭

4. 결제수단 선택 및 테스트 정보 입력
   - **테스트 환경**이므로 실제 결제가 발생하지 않습니다
   - 모든 결제수단을 자유롭게 테스트할 수 있습니다
   - 카드 정보는 임의의 값을 입력해도 됩니다

5. 결제 완료 후 성공 페이지에서 결과 확인

#### 커스터마이징

- **상품 추가**: Supabase Dashboard에서 `products` 테이블에 데이터 추가
- **결제 UI 커스터마이징**: `src/components/payment/checkout-form.tsx` 수정
- **결제 플로우 수정**: `src/actions/payment.ts`의 서버 액션 수정

#### 프로덕션 배포 시 주의사항

프로덕션에 배포하기 전에 다음을 확인하세요:

1. **토스페이먼츠 계약**
   - [토스페이먼츠 대시보드](https://dashboard.tosspayments.com)에서 계약 진행
   - 테스트 키를 프로덕션 키로 교체

2. **환경 변수 업데이트**
   - `NEXT_PUBLIC_TOSS_CLIENT_KEY`: 프로덕션 클라이언트 키
   - `TOSS_SECRET_KEY`: 프로덕션 시크릿 키
   - `NEXT_PUBLIC_SITE_URL`: 실제 도메인

3. **결제 테스트**
   - 프로덕션 환경에서 소액 테스트 결제 진행
   - 결제 승인/취소 플로우 검증

### SEO 최적화

`src/utils/seo` 디렉토리의 유틸리티 함수를 사용하여 페이지별 메타데이터를 설정할 수 있습니다.

```typescript
// 페이지 메타데이터 설정 예시
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "페이지 제목",
  description: "페이지 설명",
  noIndex: false, // 검색 엔진 색인 여부
});
```

## Vercel 배포

이 프로젝트는 [Vercel](https://vercel.com/)에 쉽게 배포할 수 있습니다.

1. GitHub 저장소를 Vercel에 연결합니다.
2. 환경 변수를 설정합니다. (`.env` 파일 내용 참고)
3. 배포를 시작합니다.

## 고급 기능 (Advanced Features)

### MCP(Model Context Protocol) 설정

이 섹션은 AI 기반 개발 도구와의 통합을 위한 고급 설정입니다. 대부분의 사용자에게는 필요하지 않을 수 있습니다.

이 프로젝트는 AI 기반 개발 도구를 위한 MCP 서버 설정을 포함하고 있습니다. 다음 MCP 서버들이 사전 구성되어 있습니다:

- **Sequential Thinking**: 복잡한 문제 해결을 위한 단계적 사고 지원
- **Context7**: 라이브러리 및 프레임워크 문서 검색
- **Playwright**: 브라우저 자동화 및 E2E 테스트
- **Supabase**: Supabase 데이터베이스 및 스토리지 관리
- **토스페이먼츠**: 결제 연동 가이드 및 API 문서 (v1/v2 지원)

#### Cursor IDE 설정

`.cursor/mcp.json` 파일에서 MCP 서버 설정을 확인할 수 있습니다:

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "bun x",
      "args": ["@modelcontextprotocol/server-sequential-thinking"]
    },
    "context7": {
      "command": "bun x",
      "args": ["@upstash/context7-mcp"]
    },
    "playwright": {
      "command": "bun x",
      "args": ["@playwright/mcp@latest"]
    },
    "supabase": {
      "command": "bun x",
      "args": ["@supabase/mcp-server-supabase@latest", "--access-token", "your_supabase_access_token"]
    },
    "tosspayments": {
      "command": "npx",
      "args": ["-y", "@tosspayments/integration-guide-mcp@latest"]
    }
  }
}
```

#### VS Code 설정

`.vscode/mcp.json` 파일도 함께 제공됩니다. VS Code 사용자는 이 파일을 사용할 수 있습니다.

#### 토스페이먼츠 MCP 서버

토스페이먼츠 MCP 서버는 다음 기능을 제공합니다:

- `get-v2-documents`: v2 API 문서 조회 (기본값)
- `get-v1-documents`: v1 API 문서 조회 (명시적 요청 시)
- `document-by-id`: 특정 문서 ID로 전체 내용 조회

**사용 예시:**
- "토스페이먼츠 결제창 연동 방법 알려줘"
- "토스페이먼츠 v2 카드 결제 구현 코드 생성해줘"
- "토스페이먼츠 정기결제 API 스펙 보여줘"

AI 코드 어시스턴트가 토스페이먼츠의 공식 문서를 참조하여 더 정확한 결제 연동 코드를 생성합니다.

#### Supabase MCP 서버 설정

Supabase MCP 서버를 사용하려면 `your_supabase_access_token`을 실제 액세스 토큰으로 변경해야 합니다.

**보안 주의**: Supabase 액세스 토큰은 민감한 정보입니다. 이 토큰은 Supabase 프로젝트에 대한 광범위한 접근 권한을 부여할 수 있으므로 안전하게 관리해야 하며, 공개 저장소나 클라이언트 측 코드에 직접 포함해서는 안 됩니다.
