# 💳 토스페이먼츠 결제 시스템 가이드

이 문서는 Next.js + Supabase 보일러플레이트에 통합된 토스페이먼츠 결제 시스템의 상세 가이드입니다.

## 📋 목차

1. [개요](#개요)
2. [아키텍처](#아키텍처)
3. [설정 가이드](#설정-가이드)
4. [파일 구조](#파일-구조)
5. [데이터 플로우](#데이터-플로우)
6. [커스터마이징](#커스터마이징)
7. [트러블슈팅](#트러블슈팅)
8. [FAQ](#faq)

---

## 개요

### 연동 방식: API 개별 연동 (결제창)

이 보일러플레이트는 **토스페이먼츠 API 개별 연동** 방식을 사용합니다.

#### API 개별 연동 vs 결제위젯

| 구분 | API 개별 연동 (이 보일러플레이트) | 결제위젯 |
|------|----------------------------------|---------|
| **사업자 등록** | 불필요 (테스트 즉시 가능) | 필요 |
| **UI 형태** | 결제창 팝업 | 통합 UI (iframe) |
| **결제수단 선택** | 결제창 내부에서 선택 | 페이지 내 UI에서 선택 |
| **클라이언트 키 형식** | `test_ck_...` / `live_ck_...` | `test_gck_...` / `live_gck_...` |
| **시크릿 키 형식** | `test_sk_...` / `live_sk_...` | `test_gsk_...` / `live_gsk_...` |
| **커스터마이징** | 제한적 (결제창 내부 UI는 고정) | 높음 (페이지 UI 자유롭게 구성) |
| **적합한 사용 사례** | 빠른 프로토타입, MVP, 테스트 | 프로덕션 서비스, 브랜딩 중요 |

> 💡 **왜 API 개별 연동을 선택했나요?**
> - 사업자 등록 없이 누구나 즉시 테스트 가능
> - 보일러플레이트 특성상 빠른 시작이 중요
> - 추후 결제위젯으로 쉽게 마이그레이션 가능

### 지원 기능

- ✅ 카드 결제 (국내/해외)
- ✅ 가상계좌
- ✅ 계좌이체
- ✅ 간편결제 (토스페이, 카카오페이 등)
- ✅ 결제 승인/취소
- ✅ 임시 주문 생성 (데이터 검증)
- ✅ 회원/비회원 결제
- ✅ 결제 내역 조회

---

## 아키텍처

### 시스템 구조

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   브라우저   │ ───> │   Next.js    │ ───> │  Supabase   │
│  (클라이언트) │ <─── │  (서버 액션)  │ <─── │  (데이터베이스)│
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ 토스페이먼츠 SDK │   │ 토스페이먼츠 API  │
│  (결제창 호출)   │   │   (결제 승인)    │
└─────────────────┘   └──────────────────┘
```

### 데이터베이스 스키마

#### `products` 테이블
상품 정보를 저장합니다.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### `payments` 테이블
결제 정보를 저장합니다.

```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_key TEXT NOT NULL UNIQUE,      -- 토스페이먼츠 결제 키
  order_id TEXT NOT NULL UNIQUE,          -- 주문 ID
  amount INTEGER NOT NULL,                -- 결제 금액
  status TEXT NOT NULL DEFAULT 'PENDING', -- PENDING | DONE | CANCELED
  product_id UUID REFERENCES products(id),
  user_id UUID REFERENCES auth.users(id), -- Clerk 사용자 ID (nullable for guest)
  payment_method TEXT,                    -- 결제 수단
  approved_at TIMESTAMP WITH TIME ZONE,   -- 승인 시각
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### RLS (Row Level Security) 정책

#### `products` 테이블
```sql
-- 모든 사용자가 상품 조회 가능
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);
```

#### `payments` 테이블
```sql
-- 자신의 결제 내역만 조회 가능 (비회원은 user_id가 NULL)
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

-- 임시 주문 생성 가능 (모든 사용자)
CREATE POLICY "Anyone can create temporary orders" ON payments
  FOR INSERT WITH CHECK (true);

-- 서버만 결제 정보 업데이트 가능 (결제 승인/취소)
CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'service_role');
```

---

## 설정 가이드

### 1단계: 토스페이먼츠 가입 및 키 발급

#### 1-1. 개발자센터 가입

1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 또는 로그인
3. 상단의 "상점 관리자" 클릭 (처음 접속 시 자동 생성됨)

#### 1-2. API 키 확인

1. 좌측 사이드바에서 **"API 키"** 클릭
2. **"API 개별 연동 키"** 섹션 찾기
3. 다음 키를 확인:
   - **클라이언트 키**: `test_ck_...` (중간에 `ck` 포함)
   - **시크릿 키**: `test_sk_...` (중간에 `sk` 포함)

> ⚠️ **주의**: "결제위젯 연동 키" 섹션의 키(`gck_`/`gsk_`)가 아닙니다!

#### 1-3. 키 형식 확인

올바른 키 형식인지 확인하세요:

```bash
# ✅ 올바른 API 개별 연동 키
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_OAQ92ydOvPE12rBQm7BKa3E6YR8j"
TOSS_SECRET_KEY="test_sk_YZ1aOwX7K8m8z0KbAoLB9Rqmbo70"

# ❌ 잘못된 결제위젯 연동 키 (사용 불가)
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_gck_..."  # gck는 결제위젯 전용
TOSS_SECRET_KEY="test_gsk_..."  # gsk는 결제위젯 전용
```

### 2단계: 환경 변수 설정

`.env.local` 파일에 발급받은 키를 추가:

```bash
# 토스페이먼츠 API 개별 연동 키
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."
```

### 3단계: Supabase 마이그레이션 실행

#### 방법 1: Supabase CLI 사용 (권장)

```bash
# 프로젝트 루트에서 실행
npx supabase db push
```

#### 방법 2: Supabase Dashboard 사용

1. [Supabase Dashboard](https://supabase.com/dashboard) → 프로젝트 선택
2. 좌측 메뉴에서 **"SQL Editor"** 클릭
3. 다음 파일들을 순서대로 복사하여 실행:
   - `supabase/migrations/20250128000000_create_payment_tables.sql`
   - `supabase/migrations/20250128000001_fix_payment_rls_policies.sql`

### 4단계: 샘플 데이터 확인

마이그레이션 실행 후 `products` 테이블에 샘플 상품이 자동으로 생성됩니다:

- 토스 티셔츠 (10,000원)
- 토스 후드티 (50,000원)
- 토스 맨투맨 (100,000원)

Supabase Dashboard의 **Table Editor**에서 확인 가능합니다.

### 5단계: 개발 서버 실행 및 테스트

```bash
# 개발 서버 시작
pnpm dev

# 브라우저에서 접속
open http://localhost:3000/products
```

---

## 파일 구조

### 디렉토리 구조

```
src/
├── actions/
│   └── payment.ts                 # 결제 서버 액션 (승인, 취소, 조회)
├── app/
│   ├── products/                  # 상품 목록 페이지
│   │   └── page.tsx
│   ├── checkout/[productId]/      # 결제 주문서 페이지
│   │   └── page.tsx
│   └── payment/                   # 결제 결과 페이지
│       ├── success/
│       │   └── page.tsx           # 결제 성공
│       └── fail/
│           └── page.tsx           # 결제 실패
├── components/
│   └── payment/                   # 결제 관련 컴포넌트
│       ├── product-card.tsx       # 상품 카드 UI
│       ├── checkout-form.tsx      # 결제창 호출 폼
│       └── payment-result.tsx     # 결제 결과 표시
├── types/
│   └── payment.ts                 # 결제 관련 타입 정의
└── utils/
    └── tosspayments/              # 토스페이먼츠 유틸리티
        ├── client.ts              # SDK 초기화 (클라이언트)
        ├── server.ts              # API 호출 (서버)
        └── constants.ts           # 상수 정의 (URL 등)

supabase/
└── migrations/
    ├── 20250128000000_create_payment_tables.sql      # 테이블 생성
    └── 20250128000001_fix_payment_rls_policies.sql   # RLS 정책 수정
```

### 주요 파일 설명

#### `src/actions/payment.ts`
서버 액션으로 결제 승인, 취소, 조회를 처리합니다.

```typescript
// 주요 함수
export async function createTemporaryOrder(...) // 임시 주문 생성
export async function confirmPaymentAction(...) // 결제 승인
export async function cancelPaymentAction(...)  // 결제 취소
export async function getPaymentDetailsAction(...) // 결제 조회
```

#### `src/utils/tosspayments/client.ts`
클라이언트에서 SDK 초기화 및 결제창 호출을 담당합니다.

```typescript
// 주요 함수
export async function initializePaymentWindow(customerKey) // 결제창 초기화
export function generateOrderId()       // 주문 ID 생성
export function generateCustomerKey()   // Customer Key 생성
```

#### `src/utils/tosspayments/server.ts`
서버에서 토스페이먼츠 API 호출을 담당합니다.

```typescript
// 주요 함수
export async function confirmPayment(...)  // 결제 승인 API
export async function cancelPayment(...)   // 결제 취소 API
export async function getPayment(...)      // 결제 조회 API
```

---

## 데이터 플로우

### 결제 프로세스

```
1. 사용자가 /products 페이지에서 상품 선택
   ↓
2. /checkout/[productId] 페이지로 이동
   ↓
3. CheckoutForm 컴포넌트가 SDK 초기화
   ↓
4. 사용자가 "결제하기" 버튼 클릭
   ↓
5. 서버 액션: createTemporaryOrder() 호출
   - Supabase에 임시 주문 생성 (status: PENDING)
   ↓
6. 토스페이먼츠 결제창 팝업 열림
   ↓
7. 사용자가 결제 수단 선택 및 결제 진행
   ↓
8-a. 결제 성공 → /payment/success로 리다이렉트
     - 서버 액션: confirmPaymentAction() 호출
     - 토스페이먼츠 API로 결제 승인 요청
     - Supabase 업데이트 (status: DONE)
     ↓
8-b. 결제 실패 → /payment/fail로 리다이렉트
     - 실패 사유 표시
```

### 코드 플로우 (상세)

#### 1. 결제 초기화 (`checkout-form.tsx`)

```typescript
// 1. SDK 로드 및 결제창 인스턴스 생성
const payment = await initializePaymentWindow(customerKey);

// 2. 임시 주문 생성 (서버 액션)
const result = await createTemporaryOrder({
  orderId,
  productId,
  amount,
  userId,
});

// 3. 결제창 호출
await payment.requestPayment({
  method: "CARD",  // 결제 수단
  amount: { currency: "KRW", value: 10000 },
  orderId,
  orderName: "상품명",
  successUrl: "http://localhost:3000/payment/success",
  failUrl: "http://localhost:3000/payment/fail",
});
```

#### 2. 결제 승인 (`/payment/success/page.tsx`)

```typescript
// 1. URL 파라미터에서 결제 정보 추출
const { paymentKey, orderId, amount } = searchParams;

// 2. 서버 액션으로 결제 승인 요청
const result = await confirmPaymentAction({
  paymentKey,
  orderId,
  amount: Number(amount),
});

// 3. 결과 표시
if (result.success) {
  // 결제 성공 UI 표시
} else {
  // 에러 메시지 표시
}
```

---

## 커스터마이징

### 1. 상품 추가/수정

#### 방법 1: Supabase Dashboard 사용

1. Supabase Dashboard → Table Editor → `products` 테이블
2. "Insert row" 버튼 클릭
3. 상품 정보 입력:
   - `name`: 상품명
   - `description`: 상품 설명
   - `price`: 가격 (정수, 원 단위)
   - `image_url`: 이미지 URL (선택)

#### 방법 2: SQL 직접 실행

```sql
INSERT INTO products (name, description, price, image_url)
VALUES (
  '새로운 상품',
  '상품 설명',
  30000,
  'https://example.com/image.jpg'
);
```

### 2. 결제 수단 변경

`src/components/payment/checkout-form.tsx` 파일에서 결제 수단을 변경할 수 있습니다:

```typescript
await paymentRef.current.requestPayment({
  method: "CARD",  // 여기를 변경
  // ...
});
```

**지원하는 결제 수단**:
- `CARD`: 카드 결제
- `VIRTUAL_ACCOUNT`: 가상계좌
- `TRANSFER`: 계좌이체
- `MOBILE_PHONE`: 휴대폰 결제
- `GIFT_CERTIFICATE`: 상품권 결제

### 3. 결제 UI 커스터마이징

#### 상품 카드 UI 수정
`src/components/payment/product-card.tsx` 파일을 수정하세요.

#### 결제 주문서 UI 수정
`src/components/payment/checkout-form.tsx` 파일을 수정하세요.

#### 결제 결과 UI 수정
`src/components/payment/payment-result.tsx` 파일을 수정하세요.

### 4. 결제 성공/실패 URL 변경

`src/utils/tosspayments/constants.ts` 파일에서 URL을 변경할 수 있습니다:

```typescript
export const PAYMENT_SUCCESS_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/success`;
export const PAYMENT_FAIL_URL = `${process.env.NEXT_PUBLIC_SITE_URL}/payment/fail`;
```

### 5. 회원 결제 구현

현재는 비회원 결제를 기본으로 지원합니다. 회원 결제를 구현하려면:

```typescript
// 1. Clerk에서 사용자 ID 가져오기
import { auth } from "@clerk/nextjs/server";

export default async function CheckoutPage({ params }: Props) {
  const { userId } = await auth();  // Clerk 사용자 ID

  // 2. CheckoutForm에 userId 전달
  return <CheckoutForm product={product} userId={userId} />;
}
```

`userId`가 있으면 `payments` 테이블의 `user_id` 컬럼에 저장됩니다.

---

## 트러블슈팅

### 문제 1: "결제위젯 연동 키의 클라이언트 키로 SDK를 연동해주세요" 에러

**원인**: 결제위젯 연동 키(`gck_`/`gsk_`)를 사용했습니다.

**해결 방법**:
1. 토스페이먼츠 개발자센터 → API 키
2. **"API 개별 연동 키"** 섹션에서 키 확인
3. 클라이언트 키 중간에 `ck` 포함 확인
4. `.env.local` 업데이트 후 서버 재시작

```bash
# ✅ 올바른 키
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_ck_..."
TOSS_SECRET_KEY="test_sk_..."

# ❌ 잘못된 키
NEXT_PUBLIC_TOSS_CLIENT_KEY="test_gck_..."  # gck는 결제위젯 전용!
```

### 문제 2: "new row violates row-level security policy" 에러

**원인**: Supabase RLS 정책이 올바르게 설정되지 않았습니다.

**해결 방법**:
1. 마이그레이션 파일 재실행:
```bash
npx supabase db push
```

2. 또는 Supabase Dashboard SQL Editor에서 직접 실행:
```sql
-- supabase/migrations/20250128000001_fix_payment_rls_policies.sql 내용 복사
```

### 문제 3: 결제창이 열리지 않음

**원인**: 팝업 차단기가 활성화되어 있습니다.

**해결 방법**:
1. 브라우저 주소창 오른쪽의 팝업 차단 아이콘 클릭
2. "항상 허용" 선택
3. 페이지 새로고침

### 문제 4: 환경 변수가 적용되지 않음

**원인**: 환경 변수 변경 후 서버를 재시작하지 않았습니다.

**해결 방법**:
```bash
# 개발 서버 중지 (Ctrl + C)
# 다시 시작
pnpm dev
```

### 문제 5: "SUPABASE_SERVICE_ROLE이 설정되지 않았습니다" 에러

**원인**: 결제 승인/취소 시 필요한 서비스 롤 키가 설정되지 않았습니다.

**해결 방법**:
1. Supabase Dashboard → Project Settings → API
2. `service_role` 키 복사
3. `.env.local`에 추가:
```bash
SUPABASE_SERVICE_ROLE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
4. 서버 재시작

---

## FAQ

### Q1. 테스트 결제 시 실제 금액이 청구되나요?

**A**: 아니요. 테스트 키(`test_ck_`/`test_sk_`)를 사용하는 경우 실제 결제가 발생하지 않습니다. 토스페이먼츠 대시보드에서 테스트 결제 내역을 확인할 수 있습니다.

### Q2. 프로덕션 배포 시 무엇을 변경해야 하나요?

**A**: 다음 단계를 따르세요:

1. **토스페이먼츠 계약**:
   - [토스페이먼츠 상점 관리자](https://dashboard.tosspayments.com/)에서 전자결제 신청
   - 사업자 등록증 제출 및 심사 (영업일 기준 1-2일 소요)

2. **프로덕션 키 발급**:
   - 심사 완료 후 프로덕션 키 자동 발급
   - `live_ck_...` / `live_sk_...` 형식

3. **환경 변수 업데이트**:
   ```bash
   # 프로덕션 환경 변수
   NEXT_PUBLIC_TOSS_CLIENT_KEY="live_ck_..."
   TOSS_SECRET_KEY="live_sk_..."
   NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
   ```

4. **테스트 결제**:
   - 소액 테스트 결제 진행 (실제 결제 발생)
   - 결제 승인/취소 플로우 검증

### Q3. 결제위젯으로 마이그레이션할 수 있나요?

**A**: 예, 가능합니다. 다음을 변경하세요:

1. 토스페이먼츠 개발자센터에서 **결제위젯 연동 키** 발급
2. `src/utils/tosspayments/client.ts` 수정:
   ```typescript
   // 기존: API 개별 연동
   const payment = tossPayments.payment({ customerKey });

   // 변경: 결제위젯
   const widgets = tossPayments.widgets({ customerKey });
   await widgets.setAmount({ currency: "KRW", value: amount });
   await widgets.renderPaymentMethods({ selector: "#payment-method" });
   ```
3. `src/components/payment/checkout-form.tsx`에서 UI 렌더링 로직 추가

자세한 가이드는 [토스페이먼츠 공식 문서](https://docs.tosspayments.com/reference/widget-sdk)를 참고하세요.

### Q4. 다른 결제 서비스로 변경할 수 있나요?

**A**: 예, 가능합니다. 다음 디렉토리/파일을 수정하세요:

- `src/utils/tosspayments/` → `src/utils/[다른PG사]/`
- `src/actions/payment.ts` → API 호출 로직 변경
- `src/components/payment/` → UI 컴포넌트 수정

### Q5. 정기결제(빌링)를 지원하나요?

**A**: 현재 보일러플레이트는 일반 결제만 지원합니다. 정기결제를 구현하려면:

1. 토스페이먼츠 빌링 키 발급 API 연동
2. Supabase에 `billing_keys` 테이블 추가
3. 정기 결제 스케줄링 구현 (Supabase Edge Functions 또는 Vercel Cron Jobs)

자세한 구현 방법은 [토스페이먼츠 빌링 가이드](https://docs.tosspayments.com/guides/billing)를 참고하세요.

### Q6. 환불은 어떻게 처리하나요?

**A**: 결제 취소 기능이 이미 구현되어 있습니다:

```typescript
import { cancelPaymentAction } from "@/actions/payment";

// 전액 취소
await cancelPaymentAction({
  paymentKey: "payment-key",
  cancelReason: "고객 요청",
});

// 부분 취소
await cancelPaymentAction({
  paymentKey: "payment-key",
  cancelReason: "부분 환불",
  cancelAmount: 5000,  // 부분 취소 금액
});
```

관리자 페이지에서 이 함수를 호출하면 환불 처리가 가능합니다.

### Q7. 결제 실패 시 자동 재시도가 가능한가요?

**A**: 현재 보일러플레이트는 수동 재시도만 지원합니다. 자동 재시도를 구현하려면:

1. `/payment/fail` 페이지에 "다시 시도" 버튼 추가
2. 이전 주문 정보를 세션 또는 Supabase에 저장
3. 버튼 클릭 시 동일한 주문으로 결제창 재호출

---

## 추가 리소스

- [토스페이먼츠 공식 문서](https://docs.tosspayments.com/)
- [토스페이먼츠 API 레퍼런스](https://docs.tosspayments.com/reference)
- [토스페이먼츠 개발자센터](https://developers.tosspayments.com/)
- [토스페이먼츠 상점 관리자](https://dashboard.tosspayments.com/)
- [Supabase 공식 문서](https://supabase.com/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)

---

## 문의 및 지원

- **GitHub Issues**: [프로젝트 저장소](https://github.com/your-username/nextjs-supabase-boilerplate/issues)
- **토스페이먼츠 고객센터**: https://www.tosspayments.com/support

---

**마지막 업데이트**: 2025-01-28
