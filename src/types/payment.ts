/**
 * @file payment.ts
 * @description 토스페이먼츠 결제 관련 타입 정의
 *
 * 이 파일은 결제 시스템에서 사용되는 모든 타입을 정의합니다.
 *
 * 주요 타입:
 * 1. Product: 상품 정보
 * 2. Payment: 결제 정보
 * 3. TossPaymentResponse: 토스페이먼츠 API 응답
 * 4. PaymentStatus: 결제 상태
 *
 * @dependencies
 * - 없음 (순수 타입 정의)
 */

// 결제 상태 타입
export type PaymentStatus = "PENDING" | "DONE" | "CANCELED";

// 상품 타입
export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  created_at: string;
}

// 결제 타입
export interface Payment {
  id: string;
  payment_key: string;
  order_id: string;
  amount: number;
  status: PaymentStatus;
  product_id: string | null;
  user_id: string | null;
  payment_method: string | null;
  approved_at: string | null;
  created_at: string;
}

// 토스페이먼츠 결제 승인 요청 타입
export interface TossPaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

// 토스페이먼츠 API 응답 타입 (간소화 버전)
export interface TossPaymentResponse {
  mId: string;
  version: string;
  paymentKey: string;
  orderId: string;
  orderName: string;
  currency: string;
  method: string;
  status: string;
  requestedAt: string;
  approvedAt: string;
  totalAmount: number;
  balanceAmount: number;
  suppliedAmount: number;
  vat: number;
  taxFreeAmount: number;
  card?: {
    issuerCode: string;
    acquirerCode: string;
    number: string;
    installmentPlanMonths: number;
    isInterestFree: boolean;
    approveNo: string;
    cardType: string;
    ownerType: string;
    acquireStatus: string;
    amount: number;
  };
  virtualAccount?: {
    accountNumber: string;
    accountType: string;
    bankCode: string;
    customerName: string;
    dueDate: string;
    expired: boolean;
    settlementStatus: string;
    refundStatus: string;
  };
  transfer?: {
    bankCode: string;
    settlementStatus: string;
  };
  easyPay?: {
    provider: string;
    amount: number;
    discountAmount: number;
  };
  receipt?: {
    url: string;
  };
  checkout?: {
    url: string;
  };
  failure?: {
    code: string;
    message: string;
  };
}

// 토스페이먼츠 에러 응답 타입
export interface TossPaymentError {
  code: string;
  message: string;
}

// 결제 요청 결과 타입
export interface PaymentConfirmResult {
  success: boolean;
  payment?: TossPaymentResponse;
  error?: string;
  errorCode?: string;
}

// 임시 주문 생성 데이터 타입
export interface TemporaryOrder {
  orderId: string;
  productId: string;
  amount: number;
  userId?: string;
}

