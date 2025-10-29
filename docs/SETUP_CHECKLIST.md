# ✅ Next.js + Supabase 보일러플레이트 설정 체크리스트

이 체크리스트를 따라하면 10-15분 내에 전체 시스템을 설정하고 실행할 수 있습니다.

---

## 📦 사전 준비 (2분)

- [ ] **Node.js 18.17.0 이상** 설치 확인
  ```bash
  node --version  # v18.17.0 이상이어야 함
  ```

- [ ] **pnpm 8.0.0 이상** 설치
  ```bash
  # pnpm이 없다면 설치
  npm install -g pnpm

  # 버전 확인
  pnpm --version  # v8.0.0 이상이어야 함
  ```

- [ ] **Git** 설치 확인
  ```bash
  git --version
  ```

---

## 🚀 1단계: 프로젝트 설정 (2분)

- [ ] **저장소 클론**
  ```bash
  git clone https://github.com/your-username/nextjs-supabase-boilerplate.git my-project
  cd my-project
  ```

- [ ] **의존성 설치**
  ```bash
  pnpm install
  ```

- [ ] **환경 변수 파일 생성**
  ```bash
  cp .env.example .env.local
  ```

---

## 🔐 2단계: Clerk 설정 (3분)

### 2-1. Clerk 계정 및 애플리케이션 생성

- [ ] [Clerk Dashboard](https://dashboard.clerk.com) 접속 및 회원가입/로그인
- [ ] "Create Application" 버튼 클릭
- [ ] Application 이름 입력 (예: `my-awesome-app`)
- [ ] 인증 방법 선택:
  - [ ] Email (권장)
  - [ ] Google (선택사항)
  - [ ] 기타 OAuth 제공자 (선택사항)

### 2-2. Clerk API 키 복사

- [ ] Clerk Dashboard → **Configure → API Keys** 이동
- [ ] 다음 키를 복사:
  - [ ] `Publishable Key` (pk_test_...)
  - [ ] `Secret Key` (sk_test_...)
- [ ] `.env.local` 파일에 키 입력:
  ```bash
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
  CLERK_SECRET_KEY="sk_test_..."
  ```

### 2-3. Clerk Session Token 커스터마이징 (Supabase 통합용)

- [ ] Clerk Dashboard → **Configure → Sessions** 이동
- [ ] "Customize session token" 버튼 클릭
- [ ] 다음 JSON 입력:
  ```json
  {
    "role": "authenticated"
  }
  ```
- [ ] "Save" 버튼 클릭

### 2-4. Clerk 도메인 확인

- [ ] Clerk Dashboard 상단에서 애플리케이션 도메인 확인
  - 형식: `your-app-name.clerk.accounts.dev`
- [ ] 이 도메인을 메모장에 복사 (다음 단계에서 사용)

---

## 💾 3단계: Supabase 설정 (4분)

### 3-1. Supabase 프로젝트 생성

- [ ] [Supabase Dashboard](https://supabase.com/dashboard) 접속
- [ ] "New Project" 클릭
- [ ] 프로젝트 정보 입력:
  - [ ] 프로젝트 이름
  - [ ] 데이터베이스 비밀번호 (안전하게 보관!)
  - [ ] 리전 선택 (한국: Northeast Asia (Seoul))
- [ ] "Create new project" 클릭 (약 2분 소요)

### 3-2. Supabase API 키 복사

- [ ] 프로젝트 생성 완료 후 **Settings → API** 이동
- [ ] 다음 정보 복사:
  - [ ] `Project URL` (https://xxxxx.supabase.co)
  - [ ] `anon public` key
  - [ ] `service_role` key
- [ ] `.env.local` 파일에 키 입력:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
  NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
  SUPABASE_SERVICE_ROLE="eyJhbGc..."  # 선택사항, 결제 기능 사용 시 필요
  ```

### 3-3. Clerk + Supabase 통합 설정

- [ ] Supabase Dashboard → **Authentication → Providers** 이동
- [ ] "Third-Party Auth" 섹션에서 "Add Provider" 클릭
- [ ] **"Clerk"** 선택
- [ ] **Clerk Domain** 입력 (2-4단계에서 복사한 도메인):
  ```
  your-app-name.clerk.accounts.dev
  ```
- [ ] "Save" 버튼 클릭

### 3-4. Supabase 로컬 설정 (config.toml)

- [ ] `supabase/config.toml` 파일 열기
- [ ] `[auth.third_party.clerk]` 섹션에서 `domain` 값 변경:
  ```toml
  [auth.third_party.clerk]
  enabled = true
  domain = "your-app-name.clerk.accounts.dev"  # 2-4단계 도메인으로 변경
  ```

### 3-5. Supabase Storage 버킷 생성 (파일 업로드용)

- [ ] Supabase Dashboard → **Storage** 이동
- [ ] "Create a new bucket" 클릭
- [ ] 버킷 이름 입력 (예: `avatars` 또는 `uploads`)
- [ ] "Public bucket" 체크 (공개 파일 업로드용)
- [ ] "Create bucket" 클릭
- [ ] `.env.local` 파일에 버킷 이름 추가:
  ```bash
  NEXT_PUBLIC_STORAGE_BUCKET="your_bucket_name"
  ```

---

## 💳 4단계: 토스페이먼츠 설정 (2분)

### 4-1. 토스페이먼츠 가입 및 키 발급

- [ ] [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 가입/로그인
- [ ] 좌측 사이드바에서 **"API 키"** 클릭
- [ ] **"API 개별 연동 키"** 섹션 찾기 (결제위젯 연동 키 아님!)
- [ ] 다음 키 확인:
  - [ ] 클라이언트 키: `test_ck_...` (중간에 `ck` 포함 확인)
  - [ ] 시크릿 키: `test_sk_...` (중간에 `sk` 포함 확인)

### 4-2. 토스페이먼츠 환경 변수 설정

- [ ] `.env.local` 파일에 키 입력:
  ```bash
  NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
  TOSS_SECRET_KEY="test_sk_..."
  ```

> ⚠️ **중요**: `gck_`/`gsk_`로 시작하는 결제위젯 연동 키가 아닌, `ck_`/`sk_`로 시작하는 API 개별 연동 키를 사용해야 합니다!

### 4-3. 결제 테이블 마이그레이션

- [ ] Supabase Dashboard → **SQL Editor** 이동
- [ ] "New Query" 클릭
- [ ] `supabase/migrations/20250128000000_create_payment_tables.sql` 파일 내용 복사하여 실행
- [ ] `supabase/migrations/20250128000001_fix_payment_rls_policies.sql` 파일 내용 복사하여 실행

**또는 CLI 사용 (권장)**:
```bash
npx supabase db push
```

---

## 🎨 5단계: SEO 및 사이트 정보 커스터마이징 (1분)

- [ ] `src/utils/seo/constants.ts` 파일 열기
- [ ] 사이트 정보 수정:
  ```typescript
  export const siteConfig = {
    name: "Your App Name",  // 앱 이름으로 변경
    description: "Your app description",
    keywords: [
      "Next.js",
      "Supabase",
      // 프로젝트 관련 키워드 추가
    ],
    twitterHandle: "@yourhandle",  // 트위터 핸들로 변경
  };
  ```

---

## 🎯 6단계: 개발 서버 실행 및 테스트 (1분)

### 6-1. 개발 서버 시작

- [ ] 다음 명령어 실행:
  ```bash
  pnpm dev
  ```

### 6-2. 브라우저에서 접속

- [ ] 브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 6-3. 기능 테스트

- [ ] **홈페이지** 로딩 확인
- [ ] **로그인/회원가입** 테스트 (`/login`)
  - [ ] 이메일 회원가입 시도
  - [ ] 로그인 성공 확인
- [ ] **프로필 페이지** 접근 (`/profile`)
  - [ ] 사용자 정보 표시 확인
- [ ] **파일 업로드** 테스트 (홈페이지)
  - [ ] 파일 선택 및 업로드
  - [ ] 업로드된 파일 목록 확인
- [ ] **상품 목록** 페이지 (`/products`)
  - [ ] 샘플 상품 3개 표시 확인
- [ ] **결제 테스트**
  - [ ] 상품 선택 후 "결제하기" 클릭
  - [ ] 결제창 팝업 확인
  - [ ] 테스트 카드 정보 입력 (임의 값 가능)
  - [ ] 결제 성공 페이지 확인
- [ ] **다크 모드** 전환 테스트
  - [ ] 네비게이션 바의 테마 전환 버튼 클릭

---

## ⚠️ 배포 전 최종 체크리스트

배포하기 전에 다음을 반드시 확인하세요:

### 보안 체크

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `.env.local` 파일이 Git에 커밋되지 않았는지 확인
  ```bash
  git status  # .env.local이 표시되지 않아야 함
  ```
- [ ] `CLERK_SECRET_KEY`, `SUPABASE_SERVICE_ROLE`, `TOSS_SECRET_KEY` 등 민감한 키가 코드에 하드코딩되지 않았는지 확인

### 설정 체크

- [ ] `supabase/config.toml`의 Clerk domain을 **자신의 도메인**으로 변경했는지 확인
- [ ] `src/utils/seo/constants.ts`의 사이트 정보를 **자신의 정보**로 변경했는지 확인
- [ ] `.env.local`의 모든 플레이스홀더(`your_...`)를 **실제 값**으로 교체했는지 확인

### 프로덕션 준비 (배포 시)

- [ ] Clerk에서 프로덕션 키 발급 (테스트 키 → 프로덕션 키)
- [ ] 토스페이먼츠 전자결제 신청 및 프로덕션 키 발급
  - [ ] 사업자 등록증 제출
  - [ ] 심사 완료 대기 (1-2일)
  - [ ] 프로덕션 키 (`live_ck_...` / `live_sk_...`) 확인
- [ ] Supabase 프로젝트의 RLS 정책이 올바르게 설정되었는지 확인
- [ ] 프로덕션 환경 변수 설정 (Vercel, Netlify 등)
- [ ] `NEXT_PUBLIC_SITE_URL`을 프로덕션 도메인으로 변경
  ```bash
  NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
  ```

---

## 🎉 완료!

모든 체크리스트를 완료했다면 이제 개발을 시작할 준비가 완료되었습니다!

### 다음 단계

- 📚 **문서 읽기**:
  - [`README.md`](./README.md): 전체 개요 및 고급 설정
  - [`docs/PAYMENT.md`](./docs/PAYMENT.md): 토스페이먼츠 결제 시스템 상세 가이드

- 🛠️ **커스터마이징**:
  - 상품 추가/수정
  - UI 스타일 변경
  - 추가 기능 구현

- 🚀 **배포**:
  - [Vercel](https://vercel.com/)에 배포 (권장)
  - [Netlify](https://www.netlify.com/)에 배포
  - 기타 호스팅 서비스

### 문제 해결

문제가 발생하면 다음을 확인하세요:

1. **에러 로그 확인**: 터미널 및 브라우저 콘솔 확인
2. **환경 변수 재확인**: `.env.local` 파일의 모든 값이 올바른지 확인
3. **서버 재시작**: 환경 변수 변경 후 `pnpm dev` 재실행
4. **트러블슈팅 가이드**: [`docs/PAYMENT.md`](./docs/PAYMENT.md#트러블슈팅) 참고
5. **GitHub Issues**: [프로젝트 저장소](https://github.com/your-username/nextjs-supabase-boilerplate/issues)에 이슈 등록

---

**설정 시간**: 약 12-15분
**마지막 업데이트**: 2025-01-28
