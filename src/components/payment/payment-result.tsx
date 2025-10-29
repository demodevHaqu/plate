/**
 * @file payment-result.tsx
 * @description 결제 결과 표시 컴포넌트
 *
 * 이 컴포넌트는 결제 성공/실패 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 결제 성공 정보 표시
 * 2. 결제 상세 정보 표시
 * 3. 홈으로 돌아가기 버튼
 *
 * @dependencies
 * - @/components/ui/card: ShadCN Card 컴포넌트
 * - @/components/ui/button: ShadCN Button 컴포넌트
 * - @/types/payment: TossPaymentResponse 타입
 */

"use client";

import Link from "next/link";
import { TossPaymentResponse } from "@/types/payment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

interface PaymentResultProps {
  payment: TossPaymentResponse;
}

export function PaymentResult({ payment }: PaymentResultProps) {
  // 금액 포맷팅
  const formattedAmount = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(payment.totalAmount);

  // 날짜 포맷팅
  const formattedDate = new Date(payment.approvedAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // 결제수단 이름 변환
  const paymentMethodName = {
    카드: "신용/체크카드",
    가상계좌: "가상계좌",
    계좌이체: "계좌이체",
    휴대폰: "휴대폰 결제",
    상품권: "상품권",
    간편결제: "간편결제",
  }[payment.method] || payment.method;

  return (
    <div className="space-y-6">
      {/* 성공 아이콘 */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">결제가 완료되었습니다</h2>
        <p className="text-muted-foreground">
          주문이 정상적으로 처리되었습니다.
        </p>
      </div>

      {/* 결제 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>결제 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">주문명</span>
              <span className="font-medium">{payment.orderName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 금액</span>
              <span className="font-bold text-lg text-primary">
                {formattedAmount}
              </span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-muted-foreground">결제수단</span>
              <span>{paymentMethodName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">주문번호</span>
              <span className="text-sm font-mono">{payment.orderId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">결제 승인 시간</span>
              <span className="text-sm">{formattedDate}</span>
            </div>

            {/* 카드 결제 상세 */}
            {payment.card && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">카드번호</span>
                  <span className="text-sm font-mono">
                    {payment.card.number}
                  </span>
                </div>
                {payment.card.installmentPlanMonths > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">할부</span>
                    <span>{payment.card.installmentPlanMonths}개월</span>
                  </div>
                )}
              </>
            )}

            {/* 가상계좌 상세 */}
            {payment.virtualAccount && (
              <>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">입금 계좌</span>
                  <span className="text-sm font-mono">
                    {payment.virtualAccount.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예금주</span>
                  <span>{payment.virtualAccount.customerName}</span>
                </div>
              </>
            )}
          </div>

          {/* 영수증 보기 */}
          {payment.receipt?.url && (
            <div className="pt-4">
              <a
                href={payment.receipt.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full">
                  영수증 보기
                </Button>
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Link href="/products" className="flex-1">
          <Button variant="outline" className="w-full">
            상품 목록으로
          </Button>
        </Link>
        <Link href="/" className="flex-1">
          <Button className="w-full">홈으로</Button>
        </Link>
      </div>
    </div>
  );
}

