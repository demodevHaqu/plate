/**
 * @file page.tsx
 * @description 결제 성공 페이지
 *
 * 이 페이지는 결제 인증 성공 후 결제를 승인하고 결과를 표시합니다.
 *
 * 주요 기능:
 * 1. 쿼리 파라미터에서 결제 정보 추출
 * 2. 데이터 검증 (금액, 주문번호)
 * 3. 결제 승인 API 호출
 * 4. 결제 결과 표시
 *
 * 핵심 구현 로직:
 * - searchParams에서 paymentKey, orderId, amount 추출
 * - 서버 액션을 통한 결제 승인 처리
 * - 에러 처리
 *
 * @dependencies
 * - @/actions/payment: 결제 서버 액션
 * - @/components/payment/payment-result: 결제 결과 컴포넌트
 */

import { redirect } from "next/navigation";
import { confirmPaymentAction } from "@/actions/payment";
import { PaymentResult } from "@/components/payment/payment-result";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "결제 완료",
  description: "결제가 완료되었습니다.",
  noIndex: true,
});

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    paymentKey?: string;
    orderId?: string;
    amount?: string;
  }>;
}

export default async function PaymentSuccessPage({
  searchParams,
}: PaymentSuccessPageProps) {
  const params = await searchParams;
  const { paymentKey, orderId, amount } = params;

  console.group("✅ 결제 성공 페이지");
  console.log("결제 키:", paymentKey);
  console.log("주문 ID:", orderId);
  console.log("금액:", amount);

  // 필수 파라미터 확인
  if (!paymentKey || !orderId || !amount) {
    console.error("❌ 필수 파라미터 누락");
    console.groupEnd();
    redirect("/payment/fail?message=잘못된 요청입니다");
  }

  // 금액 파싱
  const parsedAmount = parseInt(amount, 10);
  if (isNaN(parsedAmount)) {
    console.error("❌ 잘못된 금액 형식");
    console.groupEnd();
    redirect("/payment/fail?message=잘못된 금액 정보입니다");
  }

  // 결제 승인 처리
  const result = await confirmPaymentAction(paymentKey, orderId, parsedAmount);

  if (!result.success || !result.payment) {
    console.error("❌ 결제 승인 실패:", result.error);
    console.groupEnd();

    const errorMessage = encodeURIComponent(
      result.error || "결제 승인에 실패했습니다"
    );
    const errorCode = result.errorCode ? `&code=${result.errorCode}` : "";
    redirect(`/payment/fail?message=${errorMessage}${errorCode}`);
  }

  console.log("✅ 결제 승인 완료");
  console.groupEnd();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <PaymentResult payment={result.payment} />
      </div>
    </div>
  );
}

