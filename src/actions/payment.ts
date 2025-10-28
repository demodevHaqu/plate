/**
 * @file payment.ts
 * @description 결제 관련 서버 액션
 *
 * 이 파일은 결제 처리를 위한 서버 액션들을 정의합니다.
 *
 * 주요 기능:
 * 1. createTemporaryOrder: 결제 요청 전 임시 주문 생성 (데이터 검증용)
 * 2. confirmPaymentAction: 결제 승인 처리
 * 3. cancelPaymentAction: 결제 취소 처리
 * 4. getPaymentHistory: 사용자 결제 내역 조회
 *
 * 핵심 구현 로직:
 * - Supabase를 통한 데이터 저장/조회
 * - 토스페이먼츠 API를 통한 결제 승인/취소
 * - 데이터 무결성 검증
 *
 * @dependencies
 * - @/utils/supabase/server: Supabase 서버 클라이언트
 * - @/utils/tosspayments/server: 토스페이먼츠 API 호출
 * - @/types/payment: 결제 관련 타입
 */

"use server";

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { confirmPayment, cancelPayment } from "@/utils/tosspayments/server";
import {
  PaymentConfirmResult,
  TemporaryOrder,
  Payment,
} from "@/types/payment";

/**
 * 임시 주문 생성 (결제 요청 전 데이터 저장)
 * @param order - 임시 주문 정보
 * @returns 성공 여부
 */
export async function createTemporaryOrder(
  order: TemporaryOrder
): Promise<{ success: boolean; error?: string }> {
  console.group("📝 임시 주문 생성");
  console.log("주문 정보:", order);

  try {
    const supabase = await createServerSupabaseClient();

    // 상품 존재 여부 확인
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("*")
      .eq("id", order.productId)
      .single();

    if (productError || !product) {
      console.error("❌ 상품을 찾을 수 없습니다:", productError);
      console.groupEnd();
      return { success: false, error: "상품을 찾을 수 없습니다." };
    }

    // 금액 검증
    if (product.price !== order.amount) {
      console.error("❌ 상품 가격과 주문 금액이 일치하지 않습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "상품 가격과 주문 금액이 일치하지 않습니다.",
      };
    }

    // 임시 주문 데이터 저장
    const { error: insertError } = await supabase.from("payments").insert({
      order_id: order.orderId,
      amount: order.amount,
      product_id: order.productId,
      user_id: order.userId || null,
      status: "PENDING",
      payment_key: "temp_" + order.orderId, // 임시 payment_key
    });

    if (insertError) {
      console.error("❌ 임시 주문 저장 실패:", insertError);
      console.groupEnd();
      return { success: false, error: "임시 주문 저장에 실패했습니다." };
    }

    console.log("✅ 임시 주문 생성 완료");
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("❌ 임시 주문 생성 중 오류:", error);
    console.groupEnd();
    return {
      success: false,
      error: "임시 주문 생성 중 오류가 발생했습니다.",
    };
  }
}

/**
 * 결제 승인 처리
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param orderId - 주문 ID
 * @param amount - 결제 금액
 * @returns 결제 승인 결과
 */
export async function confirmPaymentAction(
  paymentKey: string,
  orderId: string,
  amount: number
): Promise<PaymentConfirmResult> {
  console.group("💳 결제 승인 처리");
  console.log("결제 키:", paymentKey);
  console.log("주문 ID:", orderId);
  console.log("금액:", amount);

  try {
    const supabase = await createServerSupabaseClient();

    // 임시 주문 조회
    const { data: tempPayment, error: tempError } = await supabase
      .from("payments")
      .select("*")
      .eq("order_id", orderId)
      .single();

    if (tempError || !tempPayment) {
      console.error("❌ 주문을 찾을 수 없습니다:", tempError);
      console.groupEnd();
      return {
        success: false,
        error: "주문을 찾을 수 없습니다.",
      };
    }

    // 금액 검증
    if (tempPayment.amount !== amount) {
      console.error("❌ 결제 금액이 일치하지 않습니다.");
      console.groupEnd();
      return {
        success: false,
        error: "결제 금액이 일치하지 않습니다.",
        errorCode: "AMOUNT_MISMATCH",
      };
    }

    // 토스페이먼츠 결제 승인 API 호출
    const paymentResult = await confirmPayment({
      paymentKey,
      orderId,
      amount,
    });

    // 결제 정보 업데이트
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        payment_key: paymentKey,
        status: "DONE",
        payment_method: paymentResult.method,
        approved_at: paymentResult.approvedAt,
      })
      .eq("order_id", orderId);

    if (updateError) {
      console.error("❌ 결제 정보 업데이트 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        error: "결제 정보 업데이트에 실패했습니다.",
      };
    }

    console.log("✅ 결제 승인 완료");
    console.groupEnd();

    return {
      success: true,
      payment: paymentResult,
    };
  } catch (error) {
    console.error("❌ 결제 승인 중 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "결제 승인에 실패했습니다.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 결제 취소 처리
 * @param paymentKey - 토스페이먼츠 결제 키
 * @param cancelReason - 취소 사유
 * @returns 결제 취소 결과
 */
export async function cancelPaymentAction(
  paymentKey: string,
  cancelReason: string
): Promise<{ success: boolean; error?: string }> {
  console.group("🔙 결제 취소 처리");
  console.log("결제 키:", paymentKey);
  console.log("취소 사유:", cancelReason);

  try {
    const supabase = await createServerSupabaseClient();

    // 결제 정보 조회
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_key", paymentKey)
      .single();

    if (paymentError || !payment) {
      console.error("❌ 결제를 찾을 수 없습니다:", paymentError);
      console.groupEnd();
      return { success: false, error: "결제를 찾을 수 없습니다." };
    }

    // 이미 취소된 결제인지 확인
    if (payment.status === "CANCELED") {
      console.error("❌ 이미 취소된 결제입니다.");
      console.groupEnd();
      return { success: false, error: "이미 취소된 결제입니다." };
    }

    // 토스페이먼츠 결제 취소 API 호출
    await cancelPayment(paymentKey, cancelReason);

    // 결제 상태 업데이트
    const { error: updateError } = await supabase
      .from("payments")
      .update({
        status: "CANCELED",
      })
      .eq("payment_key", paymentKey);

    if (updateError) {
      console.error("❌ 결제 상태 업데이트 실패:", updateError);
      console.groupEnd();
      return {
        success: false,
        error: "결제 상태 업데이트에 실패했습니다.",
      };
    }

    console.log("✅ 결제 취소 완료");
    console.groupEnd();

    return { success: true };
  } catch (error) {
    console.error("❌ 결제 취소 중 오류:", error);
    console.groupEnd();

    const errorMessage =
      error instanceof Error ? error.message : "결제 취소에 실패했습니다.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 사용자 결제 내역 조회
 * @param userId - 사용자 ID (선택)
 * @returns 결제 내역 목록
 */
export async function getPaymentHistory(
  userId?: string
): Promise<{ success: boolean; payments?: Payment[]; error?: string }> {
  console.group("📋 결제 내역 조회");
  console.log("사용자 ID:", userId || "비회원");

  try {
    const supabase = await createServerSupabaseClient();

    let query = supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data: payments, error } = await query;

    if (error) {
      console.error("❌ 결제 내역 조회 실패:", error);
      console.groupEnd();
      return { success: false, error: "결제 내역 조회에 실패했습니다." };
    }

    console.log("✅ 결제 내역 조회 완료:", payments?.length || 0, "건");
    console.groupEnd();

    return { success: true, payments: payments as Payment[] };
  } catch (error) {
    console.error("❌ 결제 내역 조회 중 오류:", error);
    console.groupEnd();

    return {
      success: false,
      error: "결제 내역 조회 중 오류가 발생했습니다.",
    };
  }
}

