/**
 * @file client.ts
 * @description 토스페이먼츠 클라이언트 초기화 유틸리티 (API 개별 연동 - 결제창)
 *
 * 이 파일은 클라이언트 측에서 토스페이먼츠 SDK를 초기화하는 함수를 제공합니다.
 *
 * 주요 기능:
 * 1. loadTossPayments: 토스페이먼츠 SDK를 동적으로 로드하고 초기화
 * 2. initializePaymentWindow: 결제창(Payment Window) 초기화
 *
 * 핵심 구현 로직:
 * - Script 태그를 동적으로 추가하여 SDK 로드
 * - Promise 기반의 비동기 로딩
 * - 중복 로딩 방지
 * - API 개별 연동 키(ck_) 사용
 *
 * @dependencies
 * - @tosspayments/tosspayments-sdk
 */

"use client";

import { loadTossPayments } from "@tosspayments/tosspayments-sdk";

// 토스페이먼츠 SDK 로드 및 결제창 초기화 함수
export async function initializePaymentWindow(customerKey: string) {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error(
      "토스페이먼츠 클라이언트 키가 설정되지 않았습니다. NEXT_PUBLIC_TOSS_CLIENT_KEY 환경 변수를 확인하세요."
    );
  }

  try {
    // SDK 로드
    const tossPayments = await loadTossPayments(clientKey);

    // 결제창 인스턴스 생성 (API 개별 연동)
    const payment = tossPayments.payment({ customerKey });

    return payment;
  } catch (error) {
    console.error("토스페이먼츠 SDK 로드 실패:", error);
    throw new Error("토스페이먼츠 SDK를 로드할 수 없습니다.");
  }
}

// 고유한 주문 ID 생성 함수
export function generateOrderId(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `ORDER_${timestamp}_${randomStr}`;
}

// 고유한 customer key 생성 함수 (비회원 결제용)
export function generateCustomerKey(): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `CUSTOMER_${timestamp}_${randomStr}`;
}

