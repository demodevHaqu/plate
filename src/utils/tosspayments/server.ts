/**
 * @file server.ts
 * @description 토스페이먼츠 서버 측 API 호출 유틸리티
 *
 * 이 파일은 서버에서 토스페이먼츠 API를 호출하는 함수들을 제공합니다.
 *
 * 주요 기능:
 * 1. confirmPayment: 결제 승인 API 호출
 * 2. cancelPayment: 결제 취소 API 호출
 * 3. getPayment: 결제 조회 API 호출
 *
 * 핵심 구현 로직:
 * - 시크릿 키를 Base64로 인코딩하여 인증 헤더 생성
 * - fetch API를 사용한 HTTP 요청
 * - 에러 처리 및 응답 파싱
 *
 * @dependencies
 * - 없음 (Node.js fetch API 사용)
 */

import {
  TossPaymentConfirmRequest,
  TossPaymentResponse,
  TossPaymentError,
} from "@/types/payment";
import { TOSS_PAYMENTS_BASE_URL } from "./constants";

// 시크릿 키를 Base64로 인코딩
function getAuthorizationHeader(): string {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "토스페이먼츠 시크릿 키가 설정되지 않았습니다. TOSS_SECRET_KEY 환경 변수를 확인하세요."
    );
  }

  // 시크릿 키 뒤에 콜론을 붙이고 Base64 인코딩
  const encodedKey = Buffer.from(`${secretKey}:`).toString("base64");
  return `Basic ${encodedKey}`;
}

/**
 * 결제 승인 API 호출
 * @param request - 결제 승인 요청 데이터
 * @returns 결제 승인 결과
 */
export async function confirmPayment(
  request: TossPaymentConfirmRequest
): Promise<TossPaymentResponse> {
  console.group("🔵 토스페이먼츠 결제 승인 요청");
  console.log("요청 데이터:", request);

  try {
    const response = await fetch(
      `${TOSS_PAYMENTS_BASE_URL}/payments/confirm`,
      {
        method: "POST",
        headers: {
          Authorization: getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error = data as TossPaymentError;
      console.error("❌ 결제 승인 실패:", error);
      console.groupEnd();
      throw new Error(error.message || "결제 승인에 실패했습니다.");
    }

    console.log("✅ 결제 승인 성공:", data);
    console.groupEnd();

    return data as TossPaymentResponse;
  } catch (error) {
    console.error("❌ 결제 승인 중 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 결제 취소 API 호출
 * @param paymentKey - 결제 키
 * @param cancelReason - 취소 사유
 * @param cancelAmount - 취소 금액 (부분 취소 시 사용, 선택)
 * @returns 결제 취소 결과
 */
export async function cancelPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
): Promise<TossPaymentResponse> {
  console.group("🔴 토스페이먼츠 결제 취소 요청");
  console.log("결제 키:", paymentKey);
  console.log("취소 사유:", cancelReason);
  console.log("취소 금액:", cancelAmount || "전액");

  try {
    const body: Record<string, unknown> = {
      cancelReason,
    };

    if (cancelAmount !== undefined) {
      body.cancelAmount = cancelAmount;
    }

    const response = await fetch(
      `${TOSS_PAYMENTS_BASE_URL}/payments/${paymentKey}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: getAuthorizationHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error = data as TossPaymentError;
      console.error("❌ 결제 취소 실패:", error);
      console.groupEnd();
      throw new Error(error.message || "결제 취소에 실패했습니다.");
    }

    console.log("✅ 결제 취소 성공:", data);
    console.groupEnd();

    return data as TossPaymentResponse;
  } catch (error) {
    console.error("❌ 결제 취소 중 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

/**
 * 결제 조회 API 호출
 * @param paymentKey - 결제 키
 * @returns 결제 정보
 */
export async function getPayment(
  paymentKey: string
): Promise<TossPaymentResponse> {
  console.group("🔍 토스페이먼츠 결제 조회 요청");
  console.log("결제 키:", paymentKey);

  try {
    const response = await fetch(
      `${TOSS_PAYMENTS_BASE_URL}/payments/${paymentKey}`,
      {
        method: "GET",
        headers: {
          Authorization: getAuthorizationHeader(),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const error = data as TossPaymentError;
      console.error("❌ 결제 조회 실패:", error);
      console.groupEnd();
      throw new Error(error.message || "결제 조회에 실패했습니다.");
    }

    console.log("✅ 결제 조회 성공:", data);
    console.groupEnd();

    return data as TossPaymentResponse;
  } catch (error) {
    console.error("❌ 결제 조회 중 오류 발생:", error);
    console.groupEnd();
    throw error;
  }
}

