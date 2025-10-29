# 토스페이먼츠 결제 페이지 생성

## 🎯 목적
토스페이먼츠 결제위젯을 통합한 결제 페이지를 생성합니다. 사용자가 상품을 선택하고 결제를 완료할 수 있는 완전한 UI를 구현합니다.

## 📋 사전 요구사항
- [ ] `/toss-setup` 커맨드 실행 완료 (환경 설정 완료)
- [ ] `.env.local`에 API 키 입력 완료
- [ ] `@tosspayments/payment-widget-sdk` 패키지 설치됨
- [ ] 타입 정의 파일이 생성되어 있음

## 🚀 실행 내용
이 커맨드는 다음을 생성합니다:

1. **결제 위젯 컴포넌트** - 재사용 가능한 React 컴포넌트
2. **결제 페이지** - 동적 라우트로 상품별 결제
3. **결제 요약 컴포넌트** - 주문 정보 표시
4. **성공 페이지 업데이트** - 결제 검증 로직 포함
5. **실패 페이지 업데이트** - 에러 핸들링

## ✅ 생성될 파일

```
src/
├── components/
│   └── payment/
│       ├── PaymentWidget.tsx       # 결제위젯 컴포넌트
│       ├── PaymentSummary.tsx      # 결제 요약 컴포넌트
│       └── PaymentLoading.tsx      # 로딩 UI
├── app/
│   ├── checkout/
│   │   └── [productId]/
│   │       └── page.tsx            # 결제 페이지
│   └── payment/
│       ├── success/
│       │   └── page.tsx            # 성공 페이지 (업데이트)
│       └── fail/
│           └── page.tsx            # 실패 페이지 (업데이트)
└── hooks/
    └── usePaymentWidget.ts         # 결제위젯 커스텀 훅 (선택사항)
```

## 🔧 구현 지침

### 단계 1: 결제 위젯 컴포넌트 생성

`src/components/payment/PaymentWidget.tsx` 생성:

**주의**: @toss-payments.mdc 규칙 파일의 "결제위젯 통합" 섹션을 **반드시** 참조하세요.

컴포넌트에 포함되어야 할 기능:
- ✅ 결제위젯 초기화 (`loadPaymentWidget`)
- ✅ 결제수단 UI 렌더링 (`renderPaymentMethods`)
- ✅ 이용약관 체크박스 렌더링 (`renderAgreement`)
- ✅ 결제 요청 처리 (`requestPayment`)
- ✅ 에러 핸들링 (사용자 친화적 메시지)
- ✅ 로딩 상태 관리

**Props 인터페이스**:
```typescript
interface PaymentWidgetProps {
  amount: number;              // 결제 금액
  orderId: string;             // 주문 ID
  orderName: string;           // 주문명
  customerName?: string;       // 고객명
  customerEmail?: string;      // 고객 이메일
  customerPhone?: string;      // 고객 전화번호
  onSuccess?: () => void;      // 성공 콜백
  onError?: (error: any) => void; // 에러 콜백
}
```

### 단계 2: 결제 요약 컴포넌트 생성

`src/components/payment/PaymentSummary.tsx` 생성:

결제 전 사용자에게 보여줄 주문 요약 정보:
- 상품명 및 가격
- 수량
- 총 결제 금액
- 할인 정보 (있는 경우)
- 배송비 (있는 경우)

### 단계 3: 로딩 컴포넌트 생성

`src/components/payment/PaymentLoading.tsx` 생성:

결제위젯 로딩 중 표시할 UI:
- 스켈레톤 UI 또는 로딩 스피너
- "결제 정보를 불러오는 중입니다..." 메시지

### 단계 4: 결제 페이지 생성

`src/app/checkout/[productId]/page.tsx` 생성:

**중요**: 기존 파일이 있는지 확인하고, 있으면 사용자에게 다음을 물어보세요:
```
⚠️  경고: /checkout/[productId]/page.tsx 파일이 이미 존재합니다.
덮어쓰시겠습니까? (y/N)
```

페이지 구조:
```typescript
// 1. 상품 정보 가져오기 (서버 컴포넌트에서)
// 2. 사용자 인증 확인 (Clerk 또는 Supabase)
// 3. 주문 ID 생성
// 4. PaymentWidget 컴포넌트 렌더링
// 5. PaymentSummary 컴포넌트 렌더링
```

**페이지 기능**:
- 동적 라우트로 상품 ID 받기
- 상품 정보 조회 (데이터베이스 또는 Props)
- 사용자 인증 상태 확인
- 결제위젯 표시
- 주문 요약 정보 표시

### 단계 5: 성공 페이지 업데이트

`src/app/payment/success/page.tsx` 업데이트:

**기존 파일 확인**: 파일이 이미 있으면 병합하거나 개선하세요.

페이지 기능:
- URL 파라미터에서 `paymentKey`, `orderId`, `amount` 추출
- 서버에 결제 검증 API 호출 (`/api/payment/verify`)
- 검증 성공 시 성공 UI 표시
- 검증 실패 시 에러 처리
- 주문 상세 정보 표시

**중요**: 반드시 서버 측 검증을 수행해야 합니다!

### 단계 6: 실패 페이지 업데이트

`src/app/payment/fail/page.tsx` 업데이트:

페이지 기능:
- URL 파라미터에서 에러 정보 추출
- 에러 코드에 따른 사용자 친화적 메시지 표시
- 재시도 버튼 제공
- 고객센터 연락처 안내

### 단계 7: 커스텀 훅 생성 (선택사항)

`src/hooks/usePaymentWidget.ts` 생성:

결제위젯 로직을 재사용하기 위한 커스텀 훅:
```typescript
function usePaymentWidget(config: PaymentWidgetConfig) {
  // 위젯 초기화
  // 결제 요청
  // 에러 핸들링
  // 반환: { isLoading, error, requestPayment }
}
```

## 💡 중요 포인트

### 사용자 경험 (UX)
- ✅ 로딩 상태를 명확하게 표시
- ✅ 에러 메시지는 사용자 친화적으로
- ✅ 결제 버튼 중복 클릭 방지
- ✅ 뒤로가기 버튼 처리
- ✅ 모바일 반응형 디자인

### 보안
- ✅ 결제 금액은 서버에서 검증
- ✅ 주문 ID는 예측 불가능하게 생성
- ✅ HTTPS 사용 (프로덕션)
- ✅ XSS, CSRF 방지

### 에러 처리
```typescript
// 결제위젯 로드 실패
// 결제 요청 실패
// 네트워크 에러
// 타임아웃
// 사용자 취소
```

각 에러 상황에 대한 적절한 메시지와 복구 방법 제공

### 접근성 (Accessibility)
- ✅ 키보드 네비게이션 지원
- ✅ 스크린 리더 지원 (ARIA 레이블)
- ✅ 충분한 색상 대비
- ✅ 포커스 표시

## 📱 모바일 최적화

### 반응형 디자인
```css
/* 모바일 우선 접근 */
.payment-container {
  padding: 1rem;
}

/* 태블릿 */
@media (min-width: 768px) {
  .payment-container {
    max-width: 600px;
    margin: 0 auto;
  }
}

/* 데스크톱 */
@media (min-width: 1024px) {
  .payment-container {
    max-width: 800px;
  }
}
```

### 터치 최적화
- 버튼 크기: 최소 44x44px
- 충분한 터치 영역
- 스크롤 성능 최적화

## 🎨 UI/UX 가이드라인

### 결제 페이지 레이아웃
```
┌─────────────────────────────────┐
│         헤더 (뒤로가기)          │
├─────────────────────────────────┤
│                                 │
│      주문 상품 정보              │
│      (이미지, 이름, 가격)        │
│                                 │
├─────────────────────────────────┤
│                                 │
│      결제 금액 요약              │
│      - 상품 금액: 50,000원      │
│      - 배송비: 3,000원          │
│      - 총 결제액: 53,000원      │
│                                 │
├─────────────────────────────────┤
│                                 │
│      결제 수단 선택              │
│      (결제위젯 영역)             │
│                                 │
├─────────────────────────────────┤
│                                 │
│      이용약관 동의               │
│      (체크박스)                  │
│                                 │
├─────────────────────────────────┤
│                                 │
│      [ 결제하기 ]                │
│                                 │
└─────────────────────────────────┘
```

### 컬러 팔레트 (예시)
```typescript
const colors = {
  primary: '#3182F6',      // 토스 블루
  success: '#15A869',      // 성공
  error: '#F04438',        // 에러
  warning: '#F79009',      // 경고
  background: '#F9FAFB',   // 배경
  text: '#191F28',         // 텍스트
};
```

## 📚 참고 문서
- 결제위젯 가이드: https://docs.tosspayments.com/guides/v2/payment-widget
- 결제위젯 SDK: https://docs.tosspayments.com/reference/widget-sdk
- 에러 코드: https://docs.tosspayments.com/codes/enum-codes
- 디자인 가이드: https://docs.tosspayments.com/guides/v2/payment-widget/admin
- 프로젝트 규칙: @.cursor/rules/toss-payments.mdc

## ✅ 완료 후 체크리스트

### 컴포넌트 생성
- [ ] `PaymentWidget.tsx` 컴포넌트가 생성됨
- [ ] `PaymentSummary.tsx` 컴포넌트가 생성됨
- [ ] `PaymentLoading.tsx` 컴포넌트가 생성됨

### 페이지 생성/업데이트
- [ ] `/checkout/[productId]` 페이지가 생성됨
- [ ] `/payment/success` 페이지가 업데이트됨
- [ ] `/payment/fail` 페이지가 업데이트됨

### 기능 테스트
- [ ] 개발 서버 실행 (`npm run dev`)
- [ ] `/checkout/test-product` 접속 가능
- [ ] 결제위젯이 정상적으로 로드됨
- [ ] 결제수단이 표시됨
- [ ] 이용약관 체크박스가 표시됨
- [ ] 결제 버튼이 작동함

### UI/UX 확인
- [ ] 모바일에서 정상 작동
- [ ] 로딩 상태가 명확히 표시됨
- [ ] 에러 메시지가 친화적임
- [ ] 키보드 네비게이션 가능

### 코드 품질
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음
- [ ] 컴포넌트 props가 올바르게 타입 정의됨
- [ ] 주석이 적절히 추가됨

## 🚀 다음 단계

결제 페이지 생성이 완료되었다면:

### 1. 결제 검증 API 생성
```
/toss-verify
```
결제 성공 후 서버에서 결제를 검증하는 API를 생성하세요.

### 2. 테스트 진행
1. 개발 서버 실행: `npm run dev`
2. 결제 페이지 접속: `http://localhost:3000/checkout/test-product`
3. 테스트 카드 사용: `4330123456789012`
4. 결제 프로세스 확인

### 3. 실제 상품 연동
데이터베이스에서 상품 정보를 가져오도록 수정:
```typescript
// 예시: Supabase
const { data: product } = await supabase
  .from('products')
  .select('*')
  .eq('id', productId)
  .single();
```

## 🎓 학습 포인트

이 단계에서 배우는 것:
- ✅ React 컴포넌트 설계 (재사용성)
- ✅ 상태 관리 (로딩, 에러)
- ✅ 비동기 처리 (async/await)
- ✅ 사용자 경험 설계
- ✅ 에러 핸들링 패턴

## 🔧 문제 해결

### 결제위젯이 로드되지 않는 경우
1. 환경 변수 확인: `console.log(process.env.NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY)`
2. 네트워크 탭에서 에러 확인
3. 브라우저 콘솔에서 에러 메시지 확인
4. CDN 접속 가능한지 확인

### 결제 버튼이 작동하지 않는 경우
1. `requestPayment` 함수가 호출되는지 확인
2. 필수 파라미터가 모두 전달되는지 확인
3. 이용약관 동의가 되었는지 확인
4. 네트워크 에러가 있는지 확인

### 타입 에러가 발생하는 경우
1. `@tosspayments/payment-widget-sdk` 타입 정의 확인
2. Props 인터페이스가 올바른지 확인
3. `tsconfig.json` 설정 확인

---

**참고**: 모든 코드는 @toss-payments.mdc 규칙을 따라 생성되며,
토스페이먼츠 공식 가이드의 베스트 프랙티스를 준수합니다.
