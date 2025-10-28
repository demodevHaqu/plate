# 토스페이먼츠 Cursor 커맨드 가이드

이 디렉토리에는 토스페이먼츠 결제 시스템을 빠르고 일관되게 구축할 수 있는 Cursor 커맨드들이 포함되어 있습니다.

## 📚 커맨드 목록

| 커맨드 | 목적 | 사용 시기 |
|--------|------|-----------|
| `/toss-init` | 올인원 초기화 | 처음 시작할 때, 모든 것을 한 번에 설정 |
| `/toss-setup` | 환경 설정 | 환경 변수와 기본 설정만 필요할 때 |
| `/toss-checkout` | 결제 페이지 생성 | 결제 UI가 필요할 때 |
| `/toss-verify` | 결제 검증 API | 서버 측 검증이 필요할 때 |

## 🚀 빠른 시작

### 방법 1: 올인원 초기화 (권장 - 초보자용)

모든 설정을 한 번에 완료:

```
/toss-init
```

이 커맨드는 다음을 자동으로 수행합니다:
- ✅ 환경 변수 템플릿 생성
- ✅ 패키지 설치
- ✅ 타입 정의 생성
- ✅ 유틸리티 함수 생성
- ✅ 결제 페이지 생성
- ✅ 검증 API 생성

### 방법 2: 단계별 설정 (권장 - 학습용)

각 단계를 이해하며 구축:

```bash
# 1단계: 환경 설정
/toss-setup

# 2단계: 결제 페이지 생성
/toss-checkout

# 3단계: 결제 검증 API 생성
/toss-verify
```

## 📖 사용 가이드

### 1️⃣ 사전 준비

커맨드를 사용하기 전에:

1. **토스페이먼츠 계정 생성**
   - https://developers.tosspayments.com 접속
   - 회원가입 및 로그인

2. **테스트 API 키 발급**
   - 개발자센터 → API 키 발급
   - 클라이언트 키, 시크릿 키, 위젯 클라이언트 키

3. **프로젝트 확인**
   - Next.js 프로젝트가 초기화되어 있어야 함
   - App Router 사용 (Pages Router는 지원하지 않음)

### 2️⃣ 커맨드 실행

Cursor 채팅창에서 `/`를 입력하면 자동완성으로 커맨드가 표시됩니다.

**예시**:
```
/toss-init
```

### 3️⃣ 환경 변수 설정

`.env.local` 파일에 API 키 입력:

```bash
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_XXXXXXXXXXXXX
TOSS_SECRET_KEY=test_sk_XXXXXXXXXXXXX
NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY=test_gck_XXXXXXXXXXXXX
```

### 4️⃣ 테스트

개발 서버를 실행하고 테스트:

```bash
npm run dev
```

브라우저에서 접속:
- 결제 페이지: `http://localhost:3000/checkout/test-product`
- 테스트 카드: `4330123456789012`

## 🎯 사용 시나리오

### 시나리오 1: 완전 초보자

**목표**: 최대한 빠르게 결제 기능 구현

```bash
/toss-init
```

→ 환경 변수만 입력하면 바로 테스트 가능!

---

### 시나리오 2: 학습하며 구현

**목표**: 각 단계를 이해하며 학습

```bash
# 1. 환경 설정 이해
/toss-setup

# 2. 결제 UI 구현 이해
/toss-checkout

# 3. 서버 검증 이해
/toss-verify
```

→ 각 단계마다 코드를 확인하고 이해할 수 있음

---

### 시나리오 3: 기존 프로젝트에 추가

**목표**: 이미 있는 프로젝트에 결제 기능 추가

```bash
# 먼저 환경 설정
/toss-setup

# 원하는 페이지만 추가
/toss-checkout

# 검증 API 추가
/toss-verify
```

→ 필요한 부분만 선택적으로 구현

---

### 시나리오 4: 커스터마이징

**목표**: 특정 부분만 수정하고 싶음

각 커맨드는 독립적으로 실행 가능하므로, 필요한 부분만 재생성할 수 있습니다.

예: 결제 페이지만 다시 생성
```bash
/toss-checkout
```

## 📁 생성되는 파일 구조

```
프로젝트 루트/
├── .env.local.example              # 환경 변수 템플릿
├── .env.local                      # 실제 환경 변수 (자동 생성 안됨)
├── src/
│   ├── types/
│   │   └── payment.ts              # 결제 타입 정의
│   ├── utils/
│   │   └── tosspayments/
│   │       ├── config.ts           # 설정
│   │       ├── client.ts           # 클라이언트 유틸리티
│   │       └── server.ts           # 서버 유틸리티
│   ├── components/
│   │   └── payment/
│   │       ├── PaymentWidget.tsx   # 결제 위젯
│   │       ├── PaymentSummary.tsx  # 결제 요약
│   │       └── PaymentLoading.tsx  # 로딩 UI
│   ├── app/
│   │   ├── checkout/
│   │   │   └── [productId]/
│   │   │       └── page.tsx        # 결제 페이지
│   │   ├── payment/
│   │   │   ├── success/
│   │   │   │   └── page.tsx        # 성공 페이지
│   │   │   └── fail/
│   │   │       └── page.tsx        # 실패 페이지
│   │   └── api/
│   │       └── payment/
│   │           ├── verify/
│   │           │   └── route.ts    # 검증 API
│   │           └── webhook/
│   │               └── route.ts    # 웹훅 핸들러
│   └── actions/
│       └── payment.ts              # 서버 액션 (선택사항)
└── package.json                    # 의존성 추가
```

## ⚙️ 커맨드 상세 설명

### `/toss-init` - 올인원 초기화

**장점**:
- ✅ 가장 빠른 설정
- ✅ 모든 파일 자동 생성
- ✅ 일관된 구조

**단점**:
- ❌ 기존 파일 덮어쓰기 가능성
- ❌ 커스터마이징 제한적

**추천 대상**: 처음 시작하는 초보자

---

### `/toss-setup` - 환경 설정

**생성 파일**:
- `.env.local.example`
- `src/types/payment.ts`
- `src/utils/tosspayments/*`

**장점**:
- ✅ 환경 설정 집중
- ✅ 다른 커맨드의 기초

**추천 대상**: 단계별로 학습하고 싶은 사람

---

### `/toss-checkout` - 결제 페이지

**생성 파일**:
- `src/components/payment/*`
- `src/app/checkout/[productId]/page.tsx`
- `src/app/payment/success/page.tsx` (업데이트)
- `src/app/payment/fail/page.tsx` (업데이트)

**장점**:
- ✅ 완전한 결제 UI
- ✅ 재사용 가능한 컴포넌트

**추천 대상**: UI 구현에 집중하고 싶은 사람

---

### `/toss-verify` - 결제 검증 API

**생성 파일**:
- `src/app/api/payment/verify/route.ts`
- `src/app/api/payment/webhook/route.ts`

**장점**:
- ✅ 보안 강화
- ✅ 사기 방지

**추천 대상**: 서버 측 검증이 필요한 모든 사람 (필수!)

## 🔐 보안 가이드

### 반드시 지켜야 할 규칙

1. **환경 변수 관리**
   ```bash
   # ✅ 올바른 방법
   .env.local 파일 사용
   .gitignore에 포함

   # ❌ 절대 금지
   코드에 하드코딩
   Git에 커밋
   ```

2. **키 사용 구분**
   ```typescript
   // ✅ 클라이언트에서 사용 가능
   NEXT_PUBLIC_TOSS_CLIENT_KEY
   NEXT_PUBLIC_TOSS_WIDGET_CLIENT_KEY

   // ❌ 서버에서만 사용 (절대 클라이언트 노출 금지)
   TOSS_SECRET_KEY
   ```

3. **결제 금액 검증**
   ```typescript
   // ✅ 서버에서 검증
   const orderFromDB = await getOrder(orderId);
   if (orderFromDB.amount !== receivedAmount) {
     throw new Error('금액 불일치');
   }

   // ❌ 클라이언트 금액 신뢰하지 않기
   ```

## 🧪 테스트 가이드

### 1. 개발 환경 테스트

**테스트 카드 번호**:
```
성공: 4330123456789012
실패 (잔액부족): 4330123456789014
실패 (한도초과): 4330123456789015
```

**테스트 시나리오**:
1. 결제 페이지 접속: `/checkout/test-product`
2. 테스트 카드 입력
3. 결제 진행
4. 성공 페이지 확인
5. 데이터베이스 확인

### 2. 프로덕션 배포 전 체크리스트

- [ ] 프로덕션 API 키로 변경 (`live_` 접두사)
- [ ] HTTPS 사용 확인
- [ ] 웹훅 URL 프로덕션 도메인으로 변경
- [ ] 에러 로깅 시스템 설정
- [ ] 결제 성공률 모니터링 설정

## 📚 추가 리소스

### 공식 문서
- 토스페이먼츠 공식 문서: https://docs.tosspayments.com
- 결제위젯 가이드: https://docs.tosspayments.com/guides/v2/payment-widget
- API 레퍼런스: https://docs.tosspayments.com/reference

### 프로젝트 규칙
- `.cursor/rules/toss-payments.mdc` - 코드 생성 규칙

### 커뮤니티
- 토스페이먼츠 개발자 포럼
- GitHub Issues

## 🆘 문제 해결

### 자주 묻는 질문 (FAQ)

**Q: 커맨드가 보이지 않아요**
A: Cursor를 재시작하거나 `/` 입력 후 새로고침하세요.

**Q: 파일이 생성되지 않아요**
A: Cursor 채팅창에서 AI가 실제로 파일을 생성했는지 확인하세요.

**Q: 결제위젯이 로드되지 않아요**
A:
1. `.env.local`에 API 키가 올바른지 확인
2. 개발 서버 재시작 (`npm run dev`)
3. 브라우저 콘솔에서 에러 확인

**Q: 결제 검증이 실패해요**
A:
1. 시크릿 키가 올바른지 확인
2. API 엔드포인트가 접근 가능한지 확인
3. 서버 로그에서 에러 메시지 확인

### 디버깅 팁

1. **환경 변수 확인**
   ```typescript
   // 개발 환경에서만 실행
   console.log('Client Key:', process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY?.substring(0, 10));
   console.log('Secret Key:', process.env.TOSS_SECRET_KEY ? '✅' : '❌');
   ```

2. **네트워크 요청 확인**
   - 브라우저 개발자 도구 → Network 탭
   - 토스페이먼츠 API 호출 확인

3. **서버 로그 확인**
   - 터미널에서 서버 로그 확인
   - API 에러 메시지 확인

## 🎓 학습 경로

### 초급 (처음 시작)
1. `/toss-init` 실행
2. 생성된 코드 읽어보기
3. 테스트 결제 진행
4. 공식 문서 읽기

### 중급 (이해하며 구현)
1. `/toss-setup` → 환경 설정 이해
2. `/toss-checkout` → UI 구현 이해
3. `/toss-verify` → 서버 검증 이해
4. 코드 커스터마이징

### 고급 (마스터)
1. 각 커맨드의 코드 분석
2. `.cursor/rules/toss-payments.mdc` 규칙 이해
3. 자신만의 커맨드 만들기
4. 팀에 최적화된 워크플로우 구축

## 🤝 기여하기

이 커맨드들을 개선하고 싶다면:

1. `.cursor/commands/toss-payments/` 디렉토리의 마크다운 파일 수정
2. 변경사항 테스트
3. Pull Request 생성

## 📝 라이선스

이 커맨드들은 MIT 라이선스로 제공됩니다.

---

**만든 사람**: Next.js + Supabase 보일러플레이트 프로젝트
**버전**: 1.0.0
**최종 업데이트**: 2025-10-28

**피드백 환영**: 문제가 있거나 개선 아이디어가 있다면 이슈를 생성해주세요!
