# 토스페이먼츠 올인원 초기화

## 🎯 목적
토스페이먼츠 결제 시스템을 한 번에 완전히 설정합니다. 환경 설정부터 결제 페이지, 검증 API까지 모든 것을 자동으로 생성합니다.

## 📋 사전 요구사항
- [ ] Next.js 프로젝트가 초기화되어 있음
- [ ] Git이 설정되어 있음 (`.env.local`이 `.gitignore`에 포함되어야 함)
- [ ] 토스페이먼츠 계정이 있음 (테스트 키 발급 가능)

## 🚀 실행 내용
이 커맨드는 다음을 자동으로 생성합니다:

1. **환경 변수 설정** (`.env.local.example`)
2. **타입 정의** (`src/types/payment.ts`)
3. **유틸리티 함수** (`src/utils/tosspayments/`)
4. **결제 페이지** (`src/app/checkout/[productId]/page.tsx`)
5. **성공/실패 페이지** (이미 있으면 업데이트)
6. **검증 API** (`src/app/api/payment/verify/route.ts`)
7. **패키지 설치** (`@tosspayments/payment-widget-sdk`)

## ✅ 생성될 파일 목록

```
프로젝트 루트/
├── .env.local.example              # 환경 변수 템플릿
├── src/
│   ├── types/
│   │   └── payment.ts              # 결제 관련 타입 정의
│   ├── utils/
│   │   └── tosspayments/
│   │       ├── config.ts           # 토스페이먼츠 설정
│   │       ├── client.ts           # 클라이언트 유틸리티
│   │       └── server.ts           # 서버 유틸리티
│   ├── actions/
│   │   └── payment.ts              # 서버 액션 (이미 있으면 건너뛰기)
│   ├── app/
│   │   ├── checkout/
│   │   │   └── [productId]/
│   │   │       └── page.tsx        # 결제 페이지
│   │   ├── payment/
│   │   │   ├── success/
│   │   │   │   └── page.tsx        # 성공 페이지 (업데이트)
│   │   │   └── fail/
│   │   │       └── page.tsx        # 실패 페이지 (업데이트)
│   │   └── api/
│   │       └── payment/
│   │           └── verify/
│   │               └── route.ts    # 결제 검증 API
│   └── components/
│       └── payment/
│           ├── PaymentWidget.tsx   # 결제 위젯 컴포넌트
│           └── PaymentSummary.tsx  # 결제 요약 컴포넌트
└── package.json                    # 의존성 추가
```

## 🔧 구현 지침

### 단계 1: 프로젝트 분석
1. 기존 파일 존재 여부 확인
2. 프로젝트 구조 파악 (App Router vs Pages Router)
3. TypeScript 사용 여부 확인

### 단계 2: 환경 설정
1. `.env.local.example` 파일 생성:
```bash
# 토스페이먼츠 API 키
# 개발자센터에서 발급: https://developers.tosspayments.com
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXXXXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXXXXX
NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY=test_gck_XXXXXXXXXXXXX

# 프로덕션에서는 'test_' 접두사 제거
# NEXT_PUBLIC_TOSS_CLIENT_KEY=live_ck_XXXXXXXXXXXXX
# TOSS_SECRET_KEY=live_sk_XXXXXXXXXXXXX
```

2. 사용자에게 안내 메시지:
```
⚠️  중요: .env.local 파일을 생성하고 토스페이먼츠 API 키를 입력하세요.
📝 .env.local.example을 복사하여 .env.local을 만들고 실제 키를 입력하세요.
🔑 테스트 키 발급: https://developers.tosspayments.com
```

### 단계 3: 타입 정의 생성
`src/types/payment.ts` 파일 생성 - **반드시 @toss-payments.mdc 규칙 참조**

### 단계 4: 유틸리티 함수 생성
`src/utils/tosspayments/` 디렉토리에 다음 파일들 생성:
- `config.ts`: 환경 변수 및 설정
- `client.ts`: 클라이언트 측 유틸리티
- `server.ts`: 서버 측 유틸리티 (결제 검증, API 호출)

### 단계 5: 패키지 설치
다음 명령어를 실행하도록 안내:
```bash
npm install @tosspayments/payment-widget-sdk
```

### 단계 6: 컴포넌트 생성
`src/components/payment/` 디렉토리에 재사용 가능한 컴포넌트 생성

### 단계 7: 페이지 생성
- 결제 페이지 (`/checkout/[productId]`)
- 성공 페이지 (업데이트 또는 생성)
- 실패 페이지 (업데이트 또는 생성)

### 단계 8: API 라우트 생성
`src/app/api/payment/verify/route.ts` - 서버 측 결제 검증

### 단계 9: 기존 파일과의 통합
- `src/actions/payment.ts`가 있으면 건너뛰기
- 없으면 서버 액션 파일 생성

## 💡 중요 포인트

### 보안
- ✅ `.env.local`이 `.gitignore`에 포함되어 있는지 확인
- ✅ 시크릿 키는 절대 클라이언트 코드에 노출하지 않기
- ✅ 결제 금액은 반드시 서버에서 검증

### 기존 코드 보호
- 기존 파일이 있으면 백업 또는 병합 제안
- 중복 코드 방지
- 기존 프로젝트 구조 존중

### 타입 안정성
- 모든 코드는 TypeScript로 작성
- `any` 타입 사용 최소화
- 토스페이먼츠 API 응답 타입 정의

## 📚 참고 문서
- 토스페이먼츠 공식 문서: https://docs.tosspayments.com
- 결제위젯 가이드: https://docs.tosspayments.com/guides/v2/payment-widget
- LLM 통합 가이드: https://docs.tosspayments.com/guides/v2/get-started/llms-guide
- 프로젝트 규칙: @.cursor/rules/toss-payments.mdc

## ✅ 완료 후 체크리스트

설정 완료 후 다음을 확인하세요:

### 환경 설정
- [ ] `.env.local` 파일이 생성되었고 API 키가 입력됨
- [ ] `.env.local`이 `.gitignore`에 포함됨
- [ ] 패키지가 설치됨 (`node_modules/@tosspayments` 존재)

### 파일 생성
- [ ] 타입 정의 파일이 생성됨
- [ ] 유틸리티 함수들이 생성됨
- [ ] 결제 페이지가 생성됨
- [ ] 성공/실패 페이지가 업데이트됨
- [ ] 검증 API가 생성됨

### 코드 품질
- [ ] TypeScript 에러가 없음
- [ ] ESLint 경고가 없음
- [ ] 모든 import가 해결됨

### 테스트 준비
- [ ] 개발 서버가 정상 실행됨 (`npm run dev`)
- [ ] `/checkout/test-product` 페이지 접근 가능
- [ ] 결제 위젯이 로드됨

## 🚀 다음 단계

초기화가 완료되었다면:

1. **테스트 키 설정**: `.env.local`에 테스트 키 입력
2. **개발 서버 실행**: `npm run dev`
3. **결제 테스트**: `/checkout/test-product` 접속
4. **테스트 카드 사용**: `4330123456789012`
5. **결제 프로세스 확인**: 결제 → 성공 → 검증

더 자세한 테스트를 원하시면:
```
/toss-test
```

## 🎓 학습 리소스

단계별로 학습하고 싶다면:
- `/toss-setup` - 환경 설정만 이해하기
- `/toss-checkout` - 결제 페이지만 만들기
- `/toss-verify` - 검증 로직만 구현하기

---

**참고**: 이 커맨드는 @toss-payments.mdc 규칙을 기반으로 모든 파일을 생성합니다.
코드를 생성하기 전에 해당 규칙 파일을 참조하여 최신 베스트 프랙티스를 따르세요.
