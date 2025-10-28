# 토스페이먼츠 결제 검증 API 생성

## 🎯 목적
서버 측에서 결제를 검증하는 API를 생성합니다. 이는 결제 사기를 방지하고 데이터 무결성을 보장하는 필수 단계입니다.

## 📋 사전 요구사항
- [ ] `/toss-setup` 커맨드 실행 완료
- [ ] `.env.local`에 `TOSS_SECRET_KEY` 입력됨
- [ ] 결제 타입 정의 (`src/types/payment.ts`) 생성됨
- [ ] 서버 유틸리티 (`src/utils/tosspayments/server.ts`) 생성됨

## 🚀 실행 내용
이 커맨드는 다음을 생성합니다:

1. **결제 검증 API 라우트** - `/api/payment/verify`
2. **결제 승인 API 라우트** - `/api/payment/confirm`
3. **결제 조회 API 라우트** - `/api/payment/[paymentKey]` (선택사항)
4. **웹훅 핸들러** - `/api/payment/webhook` (가상계좌용)
5. **데이터베이스 연동 코드** - Supabase 예시

## ✅ 생성될 파일

```
src/
└── app/
    └── api/
        └── payment/
            ├── verify/
            │   └── route.ts          # 결제 검증 API
            ├── confirm/
            │   └── route.ts          # 결제 승인 API (대체 방법)
            ├── [paymentKey]/
            │   └── route.ts          # 결제 조회 API
            └── webhook/
                └── route.ts          # 웹훅 핸들러
```

## 🔧 구현 지침

### 단계 1: 결제 검증 API 생성

`src/app/api/payment/verify/route.ts` 생성:

**중요**: @toss-payments.mdc 규칙 파일의 "서버 측 결제 검증" 섹션을 **반드시** 참조하세요.

**API 플로우**:
```
1. 클라이언트로부터 paymentKey, orderId, amount 받기
2. 입력값 검증
3. 토스페이먼츠 API 호출 (결제 승인)
4. 응답 검증 (금액, 주문ID 일치 확인)
5. 데이터베이스에 저장
6. 클라이언트에 응답 반환
```

**필수 검증 항목**:
- ✅ `paymentKey` 존재 여부
- ✅ `orderId` 존재 여부 및 형식
- ✅ `amount` 존재 여부 및 숫자 타입
- ✅ 결제 금액이 주문 금액과 일치하는지
- ✅ 중복 결제가 아닌지
- ✅ 주문이 유효한 상태인지

**보안 체크**:
- ✅ 시크릿 키는 서버에서만 사용
- ✅ Basic 인증 헤더 올바르게 생성
- ✅ HTTPS 사용 (프로덕션)
- ✅ Rate limiting 적용 (선택사항)

**에러 처리**:
```typescript
try {
  // 결제 승인 로직
} catch (error) {
  // 토스페이먼츠 API 에러
  if (error.code === 'INVALID_REQUEST') {
    return NextResponse.json({ error: '잘못된 요청입니다' }, { status: 400 });
  }

  // 네트워크 에러
  if (error.code === 'NETWORK_ERROR') {
    return NextResponse.json({ error: '네트워크 오류가 발생했습니다' }, { status: 503 });
  }

  // 기타 에러
  return NextResponse.json({ error: '결제 처리 중 오류가 발생했습니다' }, { status: 500 });
}
```

### 단계 2: 데이터베이스 연동

결제 정보를 데이터베이스에 저장:

**Supabase 예시**:
```typescript
const { data, error } = await supabase
  .from('payments')
  .insert({
    payment_key: paymentData.paymentKey,
    order_id: paymentData.orderId,
    amount: paymentData.totalAmount,
    status: paymentData.status,
    method: paymentData.method,
    approved_at: paymentData.approvedAt,
    customer_name: paymentData.customerName,
    // ... 기타 필드
  });
```

**테이블 스키마 예시**:
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_key TEXT UNIQUE NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  method TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  customer_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 단계 3: 결제 승인 API (대체 방법)

`src/app/api/payment/confirm/route.ts` 생성 (선택사항):

일부 시나리오에서는 `verify`와 `confirm`을 분리할 수 있습니다:
- `verify`: 결제 정보 확인만
- `confirm`: 실제 승인 처리

일반적으로는 `verify` 하나로 충분합니다.

### 단계 4: 결제 조회 API

`src/app/api/payment/[paymentKey]/route.ts` 생성:

특정 결제 정보를 조회하는 API:

```typescript
// GET /api/payment/{paymentKey}
export async function GET(
  request: NextRequest,
  { params }: { params: { paymentKey: string } }
) {
  // 1. 인증 확인 (사용자가 해당 결제 정보를 볼 권한이 있는지)
  // 2. 데이터베이스에서 결제 정보 조회
  // 3. 필요시 토스페이먼츠 API로 최신 정보 가져오기
  // 4. 응답 반환
}
```

### 단계 5: 웹훅 핸들러 생성

`src/app/api/payment/webhook/route.ts` 생성:

가상계좌 입금 알림 등을 받기 위한 웹훅:

**주의**: 토스페이먼츠 개발자센터에서 웹훅 URL 등록 필요
- URL: `https://your-domain.com/api/payment/webhook`
- 이벤트: `PAYMENT_STATUS_CHANGED`

**웹훅 처리 플로우**:
```
1. 웹훅 데이터 수신
2. 서명 검증 (보안)
3. 이벤트 타입 확인
4. 결제 상태 업데이트
5. 사용자에게 알림 발송 (이메일, 푸시 등)
6. 200 응답 반환
```

**이벤트 타입**:
- `PAYMENT_STATUS_CHANGED`: 결제 상태 변경 (가상계좌 입금 등)
- `BILLING_KEY_ISSUED`: 빌링키 발급
- `TRANSACTION_STATUS_CHANGED`: 거래 상태 변경

## 💡 중요 포인트

### 보안 필수 사항

**1. 금액 검증**
```typescript
// 클라이언트로부터 받은 금액을 절대 신뢰하지 마세요!
const orderFromDB = await getOrder(orderId);

if (orderFromDB.amount !== Number(amount)) {
  throw new Error('금액 불일치 - 사기 시도 가능성');
}
```

**2. 중복 결제 방지**
```typescript
// 동일한 orderId로 이미 처리된 결제가 있는지 확인
const existingPayment = await supabase
  .from('payments')
  .select('*')
  .eq('order_id', orderId)
  .single();

if (existingPayment) {
  return NextResponse.json(
    { error: '이미 처리된 주문입니다' },
    { status: 400 }
  );
}
```

**3. 멱등성 보장**
```typescript
// 같은 요청이 여러 번 와도 한 번만 처리되도록
const idempotencyKey = `payment-${orderId}-${Date.now()}`;

const response = await fetch(
  'https://api.tosspayments.com/v1/payments/confirm',
  {
    headers: {
      'Idempotency-Key': idempotencyKey,
      // ... 기타 헤더
    },
  }
);
```

**4. 시크릿 키 보호**
```typescript
// ✅ 올바른 사용
const secretKey = process.env.TOSS_SECRET_KEY;
if (!secretKey) {
  throw new Error('TOSS_SECRET_KEY is not configured');
}

// ❌ 절대 금지
const secretKey = 'test_sk_XXXXXXXXXXXXX'; // 하드코딩 금지!
```

### 에러 처리 베스트 프랙티스

**사용자 친화적 메시지**:
```typescript
const ERROR_MESSAGES = {
  INVALID_REQUEST: '잘못된 요청입니다. 다시 시도해주세요.',
  INVALID_CARD_NUMBER: '유효하지 않은 카드번호입니다.',
  NOT_ENOUGH_BALANCE: '잔액이 부족합니다.',
  EXCEED_MAX_AMOUNT: '결제 가능 금액을 초과했습니다.',
  UNAUTHORIZED: '인증에 실패했습니다.',
  NOT_FOUND: '존재하지 않는 결제입니다.',
  INTERNAL_ERROR: '결제 처리 중 오류가 발생했습니다. 고객센터로 문의해주세요.',
};
```

**에러 로깅**:
```typescript
// 프로덕션에서는 Sentry, LogRocket 등 사용
console.error('Payment verification failed:', {
  orderId,
  amount,
  error: error.message,
  timestamp: new Date().toISOString(),
});
```

### 데이터베이스 트랜잭션

결제 처리는 원자적으로 수행되어야 합니다:

```typescript
// Supabase 트랜잭션 예시
const { error } = await supabase.rpc('process_payment', {
  p_order_id: orderId,
  p_payment_key: paymentKey,
  p_amount: amount,
  // ... 기타 파라미터
});

if (error) throw error;
```

## 📚 참고 문서
- 결제 승인 API: https://docs.tosspayments.com/reference#tag/payment/operation/confirm-payment
- 웹훅 가이드: https://docs.tosspayments.com/guides/v2/webhook
- 에러 코드: https://docs.tosspayments.com/codes/enum-codes
- API 인증: https://docs.tosspayments.com/reference/using-api/authorization
- 프로젝트 규칙: @.cursor/rules/toss-payments.mdc

## ✅ 완료 후 체크리스트

### API 생성 확인
- [ ] `/api/payment/verify/route.ts` 파일이 생성됨
- [ ] `/api/payment/webhook/route.ts` 파일이 생성됨
- [ ] 데이터베이스 연동 코드가 작성됨

### 보안 검증
- [ ] 시크릿 키가 환경 변수로 관리됨
- [ ] 결제 금액이 서버에서 검증됨
- [ ] 중복 결제 방지 로직이 있음
- [ ] 에러가 안전하게 처리됨

### 기능 테스트
- [ ] API 엔드포인트에 접근 가능
- [ ] 결제 승인이 정상 작동
- [ ] 에러 케이스가 올바르게 처리됨
- [ ] 데이터베이스에 정보가 저장됨

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] API 응답 타입이 정의됨
- [ ] 에러 핸들링이 포괄적임

## 🚀 다음 단계

### 1. 성공 페이지와 연동
성공 페이지에서 이 API를 호출하도록 수정:

```typescript
// src/app/payment/success/page.tsx
const response = await fetch('/api/payment/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ paymentKey, orderId, amount }),
});
```

### 2. 웹훅 URL 등록
토스페이먼츠 개발자센터에서:
1. 로그인
2. 설정 → 웹훅 설정
3. URL 입력: `https://your-domain.com/api/payment/webhook`
4. 이벤트 선택: `PAYMENT_STATUS_CHANGED`
5. 저장

### 3. 테스트 시나리오 실행
1. 결제 페이지에서 결제 진행
2. 성공 페이지로 리다이렉트
3. 검증 API 호출 확인
4. 데이터베이스에 저장 확인
5. 웹훅 수신 확인 (가상계좌)

### 4. 모니터링 설정
- 에러 로그 모니터링
- 결제 성공률 추적
- API 응답 시간 측정

## 🎓 학습 포인트

이 단계에서 배우는 것:
- ✅ 서버 측 검증의 중요성
- ✅ API 보안 베스트 프랙티스
- ✅ 에러 핸들링 패턴
- ✅ 데이터베이스 트랜잭션
- ✅ 웹훅 구현 방법

## 🔧 문제 해결

### 결제 승인 API 호출 실패
**증상**: 401 Unauthorized 에러
**원인**: 시크릿 키가 잘못되었거나 인증 헤더가 올바르지 않음
**해결**:
1. `.env.local`의 `TOSS_SECRET_KEY` 확인
2. Base64 인코딩 확인: `Buffer.from(secretKey + ':').toString('base64')`
3. Authorization 헤더 형식: `Basic {encodedKey}`

### 금액 불일치 에러
**증상**: "Payment data mismatch" 에러
**원인**: 클라이언트에서 보낸 금액과 서버의 금액이 다름
**해결**:
1. 주문 생성 시 금액을 데이터베이스에 저장
2. 검증 시 데이터베이스의 금액과 비교
3. 부동소수점 문제 주의 (정수로 처리)

### 웹훅이 수신되지 않음
**증상**: 가상계좌 입금 후 알림이 오지 않음
**원인**: 웹훅 URL이 접근 불가능하거나 등록되지 않음
**해결**:
1. 웹훅 URL이 HTTPS인지 확인 (로컬은 ngrok 사용)
2. 개발자센터에서 웹훅이 등록되었는지 확인
3. 엔드포인트가 200 응답을 반환하는지 확인
4. 방화벽이 토스페이먼츠 IP를 허용하는지 확인

### 데이터베이스 저장 실패
**증상**: 결제는 성공했으나 DB에 저장되지 않음
**원인**: 데이터베이스 연결 문제 또는 스키마 불일치
**해결**:
1. 데이터베이스 연결 상태 확인
2. 테이블 스키마가 올바른지 확인
3. 필수 필드가 모두 포함되었는지 확인
4. 타입 캐스팅이 올바른지 확인

## 🔐 프로덕션 배포 체크리스트

프로덕션 배포 전 반드시 확인:

### 환경 설정
- [ ] 프로덕션 API 키로 변경 (`live_ck_`, `live_sk_`)
- [ ] HTTPS 사용 (HTTP는 차단됨)
- [ ] 웹훅 URL이 프로덕션 도메인으로 등록됨

### 보안
- [ ] 시크릿 키가 안전하게 관리됨
- [ ] Rate limiting 적용
- [ ] CORS 설정 확인
- [ ] SQL Injection 방지

### 모니터링
- [ ] 에러 로그 시스템 설정
- [ ] 결제 성공률 대시보드
- [ ] 알림 시스템 (Slack, 이메일 등)

### 테스트
- [ ] 통합 테스트 통과
- [ ] 부하 테스트 완료
- [ ] 보안 스캔 완료

---

**참고**: 이 API는 결제 시스템의 핵심입니다.
반드시 @toss-payments.mdc 규칙을 따르고, 충분히 테스트한 후 배포하세요.
