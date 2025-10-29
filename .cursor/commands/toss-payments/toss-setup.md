# 토스페이먼츠 환경 설정

## 🎯 목적
토스페이먼츠 결제를 위한 기본 환경을 설정합니다. API 키 설정, 패키지 설치, 기본 타입 정의를 생성합니다.

## 📋 사전 요구사항
- [ ] Next.js 프로젝트가 초기화되어 있음
- [ ] npm 또는 yarn이 설치되어 있음
- [ ] 토스페이먼츠 개발자센터 계정 (테스트 키 발급용)

## 🚀 실행 내용
이 커맨드는 다음을 수행합니다:

1. **환경 변수 템플릿 생성** - `.env.local.example`
2. **패키지 설치** - `@tosspayments/payment-widget-sdk`
3. **타입 정의 파일 생성** - `src/types/payment.ts`
4. **유틸리티 함수 생성** - `src/utils/tosspayments/`
5. **설정 가이드 출력** - 다음 단계 안내

## ✅ 생성될 파일

```
프로젝트 루트/
├── .env.local.example              # 환경 변수 템플릿
├── src/
│   ├── types/
│   │   └── payment.ts              # 결제 타입 정의
│   └── utils/
│       └── tosspayments/
│           ├── config.ts           # 토스페이먼츠 설정
│           ├── client.ts           # 클라이언트 유틸리티
│           └── server.ts           # 서버 유틸리티
└── package.json                    # 의존성 추가됨
```

## 🔧 구현 지침

### 단계 1: 환경 변수 템플릿 생성

`.env.local.example` 파일을 생성하세요:

```bash
# ==========================================
# 토스페이먼츠 API 키
# ==========================================
# 개발자센터에서 발급: https://developers.tosspayments.com
#
# 테스트 환경 (Sandbox)
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXXXXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXXXXX
NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY=test_gck_XXXXXXXXXXXXX

# 프로덕션 환경 (Live)
# 실제 서비스 시 아래 키를 사용하고 'test_' 키는 주석 처리
# NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_XXXXXXXXXXXXX
# TOSS_SECRET_KEY=live_sk_XXXXXXXXXXXXX
# NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY=live_gck_XXXXXXXXXXXXX

# ==========================================
# 보안 주의사항
# ==========================================
# ⚠️  절대 커밋하지 마세요!
# ⚠️  TOSS_SECRET_KEY는 서버에서만 사용
# ⚠️  NEXT_PUBLIC_으로 시작하는 키만 클라이언트에서 사용 가능
```

**중요**: 사용자에게 다음 메시지 출력:
```
✅ 환경 변수 템플릿이 생성되었습니다!

📋 다음 단계:
1. .env.local.example을 복사하여 .env.local 생성
   cp .env.local.example .env.local

2. 토스페이먼츠 개발자센터에서 API 키 발급
   https://developers.tosspayments.com

3. .env.local에 발급받은 키 입력

⚠️  중요: .env.local은 절대 Git에 커밋하지 마세요!
```

### 단계 2: .gitignore 확인

`.gitignore`에 다음이 포함되어 있는지 확인:
```
.env.local
.env*.local
```

없으면 추가하세요.

### 단계 3: 패키지 설치

다음 명령어를 실행하도록 안내:
```bash
npm install @tosspayments/payment-widget-sdk
```

또는 yarn을 사용하는 경우:
```bash
yarn add @tosspayments/payment-widget-sdk
```

### 단계 4: 타입 정의 파일 생성

`src/types/payment.ts` 파일을 생성하세요.

**주의**: @toss-payments.mdc 규칙 파일을 참조하여 최신 타입 정의를 사용하세요.

다음 타입들을 정의해야 합니다:
- `PaymentRequest` - 결제 요청 정보
- `PaymentResult` - 결제 결과 정보
- `PaymentVerification` - 결제 검증 정보
- `BillingKeyRequest` - 빌링키 요청 정보
- `PaymentError` - 에러 정보
- 토스페이먼츠 API 응답 타입들

### 단계 5: 설정 파일 생성

`src/utils/tosspayments/config.ts` 생성:

이 파일에는 다음이 포함되어야 합니다:
- 환경 변수 검증
- API 엔드포인트 URL
- 타임아웃 설정
- 에러 메시지 정의

### 단계 6: 클라이언트 유틸리티 생성

`src/utils/tosspayments/client.ts` 생성:

다음 함수들을 포함:
- `loadPaymentWidget()` - 결제위젯 로드
- `generateOrderId()` - 주문 ID 생성
- `formatAmount()` - 금액 포맷팅
- 기타 클라이언트 측 헬퍼 함수

### 단계 7: 서버 유틸리티 생성

`src/utils/tosspayments/server.ts` 생성:

다음 함수들을 포함:
- `verifyPayment()` - 결제 검증
- `confirmPayment()` - 결제 승인
- `cancelPayment()` - 결제 취소
- `getPaymentDetails()` - 결제 상세 조회
- API 호출 헬퍼 함수

**보안**: 이 파일은 서버에서만 사용되므로 시크릿 키 사용 가능

## 💡 중요 포인트

### 보안 체크리스트
- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] 시크릿 키(`TOSS_SECRET_KEY`)는 서버 코드에서만 사용
- [ ] 클라이언트 키(`NEXT_PUBLIC_*`)만 브라우저에 노출
- [ ] API 키가 코드에 하드코딩되지 않음

### 환경 변수 네이밍
```typescript
// ✅ 올바른 사용
const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;  // 클라이언트
const secretKey = process.env.TOSS_SECRET_KEY;              // 서버만

// ❌ 잘못된 사용
const secretKey = process.env.NEXT_PUBLIC_TOSS_SECRET_KEY;  // 노출 위험!
```

### 타입 안정성
- 모든 환경 변수는 타입 체크 필요
- undefined 체크 추가
- 런타임 검증 구현

### 에러 처리
- 환경 변수 누락 시 명확한 에러 메시지
- 개발 환경에서만 상세 에러 출력
- 프로덕션에서는 민감한 정보 숨기기

## 📚 참고 문서
- 토스페이먼츠 개발자센터: https://developers.tosspayments.com
- API 키 발급 가이드: https://docs.tosspayments.com/reference/using-api/api-keys
- 환경 설정 가이드: https://docs.tosspayments.com/guides/v2/get-started/environment
- 프로젝트 규칙: @.cursor/rules/toss-payments.mdc

## ✅ 완료 후 체크리스트

### 파일 생성 확인
- [ ] `.env.local.example` 파일이 생성됨
- [ ] `.env.local` 파일이 생성되고 키가 입력됨
- [ ] `src/types/payment.ts` 파일이 생성됨
- [ ] `src/utils/tosspayments/config.ts` 파일이 생성됨
- [ ] `src/utils/tosspayments/client.ts` 파일이 생성됨
- [ ] `src/utils/tosspayments/server.ts` 파일이 생성됨

### 보안 확인
- [ ] `.gitignore`에 `.env.local`이 포함됨
- [ ] 시크릿 키가 코드에 하드코딩되지 않음
- [ ] 환경 변수가 올바르게 네이밍됨

### 패키지 확인
- [ ] `@tosspayments/payment-widget-sdk`가 설치됨
- [ ] `package.json`에 의존성이 추가됨
- [ ] `node_modules/@tosspayments` 디렉토리가 존재함

### 코드 품질
- [ ] TypeScript 컴파일 에러가 없음
- [ ] ESLint 경고가 없음
- [ ] 모든 타입이 올바르게 정의됨

## 🚀 다음 단계

환경 설정이 완료되었다면 다음을 진행하세요:

### 1. API 키 테스트
다음 코드로 환경 변수가 올바르게 로드되는지 확인:

```typescript
// 개발 환경에서만 실행
console.log('Client Key:', process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.substring(0, 10) + '...');
console.log('Secret Key:', process.env.TOSS_SECRET_KEY ? '✅ Loaded' : '❌ Missing');
```

### 2. 결제 페이지 생성
```
/toss-checkout
```

### 3. 결제 검증 API 생성
```
/toss-verify
```

### 4. 전체 시스템 한 번에 설정하려면
```
/toss-init
```

## 🎓 학습 포인트

이 단계에서 배우는 것:
- ✅ 환경 변수를 안전하게 관리하는 방법
- ✅ 클라이언트/서버 분리의 중요성
- ✅ TypeScript로 타입 안정성 확보하기
- ✅ API 키 보안 베스트 프랙티스

## 🔧 문제 해결

### 환경 변수가 로드되지 않는 경우
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 파일 이름이 정확한지 확인 (`.env.local.example`이 아님)
3. 개발 서버를 재시작 (`npm run dev` 재실행)
4. Next.js는 서버 시작 시 환경 변수를 로드함

### 타입 에러가 발생하는 경우
1. `tsconfig.json`에서 `src/types` 경로가 포함되어 있는지 확인
2. IDE를 재시작하여 타입 캐시 갱신
3. `npm run type-check` 또는 `tsc --noEmit` 실행

### 패키지 설치 실패
1. Node.js 버전 확인 (14.x 이상 권장)
2. npm 캐시 클리어: `npm cache clean --force`
3. `node_modules` 삭제 후 재설치: `rm -rf node_modules && npm install`

---

**참고**: 모든 코드는 @toss-payments.mdc 규칙을 따라 생성됩니다.
