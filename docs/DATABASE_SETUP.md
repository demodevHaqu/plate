# 🗄️ 데이터베이스 설정 가이드

이 문서는 결제 시스템에 필요한 Supabase 데이터베이스 테이블을 생성하는 방법을 안내합니다.

## 📋 목차

1. [개요](#개요)
2. [필요한 테이블](#필요한-테이블)
3. [설정 방법](#설정-방법)
4. [마이그레이션 파일 직접 생성](#마이그레이션-파일-직접-생성)
5. [검증 방법](#검증-방법)

---

## 개요

결제 시스템을 사용하려면 다음 두 개의 테이블이 필요합니다:

1. **`products`**: 결제 가능한 상품 정보
2. **`payments`**: 결제 내역 및 상태

이 가이드는 두 가지 방법을 제공합니다:
- **방법 1**: Supabase Dashboard에서 SQL 직접 실행 (빠르고 간단)
- **방법 2**: 마이그레이션 파일 생성 후 Supabase CLI로 적용 (버전 관리 가능)

---

## 필요한 테이블

### 1. `products` 테이블

상품 정보를 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| `id` | UUID | 상품 고유 ID | PRIMARY KEY, AUTO |
| `name` | TEXT | 상품명 | NOT NULL |
| `description` | TEXT | 상품 설명 | NULLABLE |
| `price` | INTEGER | 가격 (원 단위) | NOT NULL, >= 0 |
| `image_url` | TEXT | 이미지 URL | NULLABLE |
| `created_at` | TIMESTAMPTZ | 생성 시각 | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | 수정 시각 | DEFAULT now() |

### 2. `payments` 테이블

결제 내역을 저장하는 테이블입니다.

| 컬럼명 | 타입 | 설명 | 제약조건 |
|--------|------|------|----------|
| `id` | UUID | 결제 고유 ID | PRIMARY KEY, AUTO |
| `payment_key` | TEXT | 토스페이먼츠 결제 키 | UNIQUE, NOT NULL |
| `order_id` | TEXT | 주문 ID | UNIQUE, NOT NULL |
| `amount` | INTEGER | 결제 금액 | NOT NULL, >= 0 |
| `status` | TEXT | 결제 상태 | ENUM: PENDING, DONE, CANCELED |
| `product_id` | UUID | 상품 ID | FK → products(id) |
| `user_id` | TEXT | 사용자 ID (Clerk) | NULLABLE |
| `payment_method` | TEXT | 결제 수단 | NULLABLE |
| `approved_at` | TIMESTAMPTZ | 승인 시각 | NULLABLE |
| `created_at` | TIMESTAMPTZ | 생성 시각 | DEFAULT now() |
| `updated_at` | TIMESTAMPTZ | 수정 시각 | DEFAULT now() |

---

## 설정 방법

### 방법 1: Supabase Dashboard에서 SQL 직접 실행 (권장)

가장 빠르고 간단한 방법입니다.

#### Step 1: Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴에서 **"SQL Editor"** 클릭

#### Step 2: SQL 스크립트 실행

아래 SQL 스크립트를 복사하여 SQL Editor에 붙여넣고 실행하세요.

```sql
-- ============================================
-- 1. Products 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 상품을 조회할 수 있음
CREATE POLICY "Anyone can view products"
  ON public.products
  FOR SELECT
  USING (true);

-- RLS 정책: 인증된 사용자만 상품을 관리할 수 있음
CREATE POLICY "Authenticated users can manage products"
  ON public.products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);

-- 업데이트 시간 자동 갱신 함수 (이미 존재하지 않을 경우에만 생성)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 업데이트 트리거
DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 샘플 데이터 삽입
INSERT INTO public.products (name, description, price, image_url) VALUES
  ('프리미엄 플랜', '모든 기능을 사용할 수 있는 프리미엄 플랜입니다.', 29900, null),
  ('스탠다드 플랜', '기본 기능을 사용할 수 있는 스탠다드 플랜입니다.', 14900, null),
  ('베이직 플랜', '무료 체험용 베이직 플랜입니다.', 0, null)
ON CONFLICT DO NOTHING;

-- ============================================
-- 2. Payments 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_key TEXT UNIQUE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('PENDING', 'DONE', 'CANCELED')),
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  user_id TEXT,
  payment_method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 결제 내역만 조회 가능
CREATE POLICY "Users can view own payments"
  ON public.payments
  FOR SELECT
  USING (
    auth.uid()::text = user_id
    OR user_id IS NULL  -- 비회원 결제 허용
  );

-- RLS 정책: 모든 사용자가 임시 주문 생성 가능
CREATE POLICY "Anyone can create temporary orders"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

-- RLS 정책: 인증된 사용자만 결제 정보 수정 가능
CREATE POLICY "Authenticated users can update payments"
  ON public.payments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS payments_user_id_idx ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS payments_order_id_idx ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS payments_payment_key_idx ON public.payments(payment_key);
CREATE INDEX IF NOT EXISTS payments_status_idx ON public.payments(status);
CREATE INDEX IF NOT EXISTS payments_created_at_idx ON public.payments(created_at DESC);

-- 업데이트 트리거
DROP TRIGGER IF EXISTS set_payments_updated_at ON public.payments;
CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 완료 메시지
SELECT 'Database tables created successfully!' as message;
```

#### Step 3: 실행 결과 확인

SQL 실행 후 하단에 `Database tables created successfully!` 메시지가 표시되면 성공입니다.

---

### 방법 2: Supabase CLI 사용 (마이그레이션 파일)

버전 관리가 필요하거나 팀 작업 시 권장하는 방법입니다.

#### Step 1: 마이그레이션 파일 생성

프로젝트 루트에서 다음 명령어를 실행하세요:

```bash
# 마이그레이션 디렉토리 생성 (이미 있다면 생략)
mkdir -p supabase/migrations

# 타임스탬프 기반 마이그레이션 파일 생성
# 형식: YYYYMMDDHHMMSS_description.sql
```

#### Step 2: 마이그레이션 파일 작성

`supabase/migrations/` 디렉토리에 새 파일을 생성합니다.

**파일명 예시**: `20241028120000_create_payment_tables.sql`

파일 내용은 **방법 1**의 SQL 스크립트와 동일합니다.

#### Step 3: Supabase CLI로 마이그레이션 적용

```bash
# Supabase CLI 설치 (아직 설치하지 않았다면)
npm install -g supabase

# Supabase 프로젝트와 연결
npx supabase link --project-ref YOUR_PROJECT_ID

# 마이그레이션 실행
npx supabase db push
```

> **주의**: `YOUR_PROJECT_ID`는 Supabase Dashboard → Project Settings → General에서 확인할 수 있습니다.

---

## 마이그레이션 파일 직접 생성

Supabase CLI 없이 로컬에서 마이그레이션 파일을 직접 생성하는 방법입니다.

### Step 1: 현재 날짜/시간 확인

마이그레이션 파일명에 사용할 타임스탬프를 생성합니다:

```bash
# macOS/Linux
date +"%Y%m%d%H%M%S"

# 출력 예시: 20241028120000
```

### Step 2: 마이그레이션 파일 생성

```bash
# 프로젝트 루트에서 실행
touch supabase/migrations/$(date +"%Y%m%d%H%M%S")_create_payment_tables.sql
```

### Step 3: 파일 내용 작성

생성된 파일에 **방법 1**의 SQL 스크립트를 복사하여 붙여넣습니다.

### Step 4: Git에 커밋

```bash
git add supabase/migrations/
git commit -m "feat: add payment database schema"
```

---

## 검증 방법

테이블이 올바르게 생성되었는지 확인하는 방법입니다.

### 1. Supabase Dashboard에서 확인

1. Supabase Dashboard → **Table Editor** 클릭
2. 좌측 사이드바에서 `products`, `payments` 테이블 확인
3. 샘플 데이터가 `products` 테이블에 3개 있는지 확인

### 2. SQL로 확인

SQL Editor에서 다음 쿼리를 실행하세요:

```sql
-- 테이블 존재 여부 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'payments');

-- 샘플 상품 확인
SELECT * FROM public.products;

-- 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

**예상 결과**:
- 첫 번째 쿼리: `products`, `payments` 두 행 반환
- 두 번째 쿼리: 3개의 샘플 상품 반환
- 세 번째 쿼리: 7개의 컬럼 정보 반환

### 3. 애플리케이션에서 확인

개발 서버를 실행하고 브라우저에서 확인:

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000/products` 접속 → 3개의 샘플 상품이 표시되면 성공!

---

## 자주 묻는 질문

### Q1. 마이그레이션 파일을 수정할 수 있나요?

**A**: 이미 적용된 마이그레이션은 수정하지 마세요. 대신 새로운 마이그레이션 파일을 생성하세요.

```bash
# 예시: 컬럼 추가
touch supabase/migrations/$(date +"%Y%m%d%H%M%S")_add_discount_to_products.sql
```

```sql
-- 새 마이그레이션 파일 내용
ALTER TABLE public.products
ADD COLUMN discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);
```

### Q2. 테이블을 삭제하고 싶어요.

**A**: Supabase Dashboard 또는 SQL로 삭제할 수 있습니다:

```sql
-- 주의: 모든 데이터가 삭제됩니다!
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
```

삭제 후 **방법 1** 또는 **방법 2**를 다시 실행하여 재생성하세요.

### Q3. RLS 정책을 비활성화할 수 있나요?

**A**: 개발/테스트 환경에서만 임시로 비활성화할 수 있습니다:

```sql
-- 주의: 보안 취약점 발생 가능!
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments DISABLE ROW LEVEL SECURITY;
```

프로덕션 환경에서는 절대 비활성화하지 마세요!

### Q4. 기존 데이터를 유지하면서 테이블 구조를 변경할 수 있나요?

**A**: 예, `ALTER TABLE` 명령어를 사용하세요:

```sql
-- 컬럼 추가
ALTER TABLE public.products
ADD COLUMN stock INTEGER DEFAULT 0;

-- 컬럼 타입 변경
ALTER TABLE public.products
ALTER COLUMN description TYPE VARCHAR(500);

-- 컬럼 삭제 (주의!)
ALTER TABLE public.products
DROP COLUMN image_url;
```

### Q5. 다른 개발자와 마이그레이션을 공유하려면?

**A**: Git에 마이그레이션 파일을 커밋하세요:

```bash
git add supabase/migrations/
git commit -m "feat: add payment database schema"
git push
```

다른 개발자는 다음 명령어로 적용:

```bash
git pull
npx supabase db push
```

---

## 다음 단계

데이터베이스 설정이 완료되었다면:

1. ✅ [결제 시스템 설정 가이드](./PAYMENT.md) - 토스페이먼츠 연동
2. ✅ [README](../README.md) - 전체 보일러플레이트 설정

---

**마지막 업데이트**: 2024-10-28
