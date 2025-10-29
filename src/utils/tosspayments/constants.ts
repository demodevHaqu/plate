/**
 * @file constants.ts
 * @description 토스페이먼츠 관련 상수 정의
 *
 * 이 파일은 결제 시스템에서 사용되는 상수들을 정의합니다.
 *
 * 주요 상수:
 * 1. TOSS_PAYMENTS_BASE_URL: 토스페이먼츠 API 기본 URL
 * 2. PAYMENT_SUCCESS_URL: 결제 성공 시 리다이렉트 URL
 * 3. PAYMENT_FAIL_URL: 결제 실패 시 리다이렉트 URL
 *
 * @dependencies
 * - 없음
 */

// 토스페이먼츠 API 기본 URL
export const TOSS_PAYMENTS_BASE_URL = "https://api.tosspayments.com/v1";

// 결제 성공/실패 리다이렉트 URL
export const PAYMENT_SUCCESS_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment/success`;
export const PAYMENT_FAIL_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/payment/fail`;

// 결제 상태
export const PAYMENT_STATUS = {
  PENDING: "PENDING",
  DONE: "DONE",
  CANCELED: "CANCELED",
} as const;

