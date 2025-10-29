/**
 * @file checkout-form.tsx
 * @description 결제 주문서 폼 컴포넌트 (클라이언트 컴포넌트) - API 개별 연동
 *
 * 이 컴포넌트는 토스페이먼츠 결제창(Payment Window)을 사용하여 결제 요청을 처리합니다.
 *
 * 주요 기능:
 * 1. 토스페이먼츠 SDK 초기화 (API 개별 연동)
 * 2. 결제창 호출 (Redirect 방식)
 * 3. 결제 요청 처리
 * 4. 임시 주문 생성 (서버 액션 호출)
 *
 * 핵심 구현 로직:
 * - useEffect를 사용한 SDK 로딩
 * - 결제 전 서버에 임시 주문 데이터 저장
 * - 결제 성공/실패 URL 설정
 * - 결제창 Redirect 방식으로 결제 진행
 *
 * @dependencies
 * - @tosspayments/tosspayments-sdk: 토스페이먼츠 SDK
 * - @/utils/tosspayments/client: SDK 초기화 함수
 * - @/actions/payment: 서버 액션
 * - @/types/payment: Product 타입
 */

"use client";

import { useEffect, useRef, useState } from "react";
import {
  initializePaymentWindow,
  generateOrderId,
  generateCustomerKey,
} from "@/utils/tosspayments/client";
import {
  PAYMENT_SUCCESS_URL,
  PAYMENT_FAIL_URL,
} from "@/utils/tosspayments/constants";
import { createTemporaryOrder } from "@/actions/payment";
import { Product } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { TossPaymentsPayment } from "@tosspayments/tosspayments-sdk";

interface CheckoutFormProps {
  product: Product;
  userId?: string;
}

export function CheckoutForm({ product, userId }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const paymentRef = useRef<TossPaymentsPayment | null>(null);
  const customerKeyRef = useRef<string>("");

  // 토스페이먼츠 SDK 초기화 (결제창)
  useEffect(() => {
    async function initializePayment() {
      console.group("🎨 결제창 SDK 초기화");

      try {
        // Customer key 생성 (비회원 결제용)
        const customerKey = userId || generateCustomerKey();
        customerKeyRef.current = customerKey;
        console.log("Customer Key:", customerKey);

        // 결제창 인스턴스 생성 (API 개별 연동)
        const payment = await initializePaymentWindow(customerKey);
        console.log("✅ SDK 로드 완료");

        paymentRef.current = payment;
        setIsLoading(false);

        console.log("✅ 결제창 초기화 완료");
        console.groupEnd();
      } catch (error) {
        console.error("❌ 결제창 초기화 실패:", error);
        console.groupEnd();

        toast.error("결제 준비 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    }

    initializePayment();
  }, [userId]);

  // 결제 요청 처리 (결제창 방식)
  async function handlePayment() {
    if (!paymentRef.current || isProcessing) {
      return;
    }

    console.group("💳 결제 요청 처리 (결제창)");
    setIsProcessing(true);

    try {
      // 주문 ID 생성
      const orderId = generateOrderId();

      console.log("주문 ID:", orderId);
      console.log("상품 ID:", product.id);
      console.log("금액:", product.price);

      // 임시 주문 생성 (데이터 검증용)
      const result = await createTemporaryOrder({
        orderId,
        productId: product.id,
        amount: product.price,
        userId,
      });

      if (!result.success) {
        console.error("❌ 임시 주문 생성 실패:", result.error);
        toast.error(result.error || "주문 생성에 실패했습니다.");
        setIsProcessing(false);
        console.groupEnd();
        return;
      }

      console.log("✅ 임시 주문 생성 완료");

      // 결제 요청 (결제창 Redirect 방식)
      await paymentRef.current.requestPayment({
        method: "CARD", // 카드 결제 (CARD, VIRTUAL_ACCOUNT, TRANSFER 등 선택 가능)
        amount: {
          currency: "KRW",
          value: product.price,
        },
        orderId,
        orderName: product.name,
        successUrl: PAYMENT_SUCCESS_URL,
        failUrl: PAYMENT_FAIL_URL,
        customerEmail: "customer@example.com",
        customerName: "고객",
      });

      console.log("✅ 결제창 호출 완료");
      console.groupEnd();
    } catch (error) {
      console.error("❌ 결제 요청 중 오류:", error);
      console.groupEnd();

      toast.error("결제 요청 중 오류가 발생했습니다.");
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* 상품 정보 */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">주문 상품</h2>
        <div className="space-y-2">
          <p className="text-lg font-semibold">{product.name}</p>
          <p className="text-muted-foreground">{product.description}</p>
          <p className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("ko-KR", {
              style: "currency",
              currency: "KRW",
            }).format(product.price)}
          </p>
        </div>
      </div>

      {/* 결제 수단 안내 */}
      <div className="p-6 border rounded-lg">
        <h2 className="text-xl font-bold mb-4">결제 수단</h2>
        <p className="text-muted-foreground">
          결제하기 버튼을 클릭하면 토스페이먼츠 결제창이 열립니다.
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          카드, 가상계좌, 계좌이체 등 다양한 결제 수단을 선택할 수 있습니다.
        </p>
      </div>

      {/* 결제하기 버튼 */}
      <Button
        onClick={handlePayment}
        disabled={isLoading || isProcessing}
        className="w-full"
        size="lg"
      >
        {isLoading
          ? "결제 준비 중..."
          : isProcessing
            ? "결제창 호출 중..."
            : `${new Intl.NumberFormat("ko-KR", {
                style: "currency",
                currency: "KRW",
              }).format(product.price)} 결제하기`}
      </Button>

      {/* 테스트 안내 */}
      <div className="p-4 bg-muted rounded-lg text-sm">
        <p className="font-semibold mb-2">💡 테스트 결제 안내</p>
        <ul className="space-y-1 text-muted-foreground">
          <li>• 테스트 환경으로 실제 결제가 이루어지지 않습니다.</li>
          <li>• 결제창에서 다양한 결제 수단을 선택할 수 있습니다.</li>
          <li>• 카드 결제 테스트 시 아무 카드번호나 입력하면 가능합니다.</li>
          <li>• API 개별 연동 방식으로 구현되었습니다.</li>
        </ul>
      </div>
    </div>
  );
}
