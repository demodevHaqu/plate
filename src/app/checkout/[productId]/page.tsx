/**
 * @file page.tsx
 * @description 결제 주문서 페이지
 *
 * 이 페이지는 상품 정보를 조회하고 결제위젯을 렌더링합니다.
 *
 * 주요 기능:
 * 1. 동적 라우트로 상품 ID 받기
 * 2. 서버 컴포넌트에서 상품 정보 조회
 * 3. 클라이언트 컴포넌트로 결제위젯 렌더링
 * 4. 주문 요약 정보 표시
 *
 * 핵심 구현 로직:
 * - Supabase에서 상품 정보 조회
 * - 서버 컴포넌트와 클라이언트 컴포넌트 분리
 * - 404 처리
 *
 * @dependencies
 * - @/utils/supabase/server: Supabase 서버 클라이언트
 * - @/components/payment/checkout-form: 결제 폼 컴포넌트
 * - @/types/payment: Product 타입
 */

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Product } from "@/types/payment";
import { CheckoutForm } from "@/components/payment/checkout-form";
import { Card, CardContent } from "@/components/ui/card";
import { createMetadata } from "@/utils/seo/metadata";
import { Separator } from "@/components/ui/separator";

interface CheckoutPageProps {
  params: Promise<{
    productId: string;
  }>;
}

export async function generateMetadata({ params }: CheckoutPageProps) {
  const { productId } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (!product) {
    return createMetadata({
      title: "상품을 찾을 수 없습니다",
    });
  }

  return createMetadata({
    title: `${product.name} - 결제`,
    description: `${product.name} 상품을 결제합니다.`,
  });
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productId } = await params;

  console.group("🛒 결제 주문서 페이지 렌더링");
  console.log("상품 ID:", productId);

  const supabase = await createServerSupabaseClient();

  // 상품 정보 조회
  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();

  if (error || !product) {
    console.error("❌ 상품 조회 실패:", error);
    console.groupEnd();
    notFound();
  }

  console.log("✅ 상품 조회 완료:", product.name);

  // 사용자 정보 조회 (선택)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("사용자:", user ? user.id : "비회원");
  console.groupEnd();

  const typedProduct = product as Product;

  // 금액 포맷팅
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(typedProduct.price);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">주문서</h1>
          <p className="text-muted-foreground">
            상품 정보를 확인하고 결제를 진행하세요.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 상품 정보 */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">주문 상품</h2>

                <div className="space-y-4">
                  {typedProduct.image_url && (
                    <div className="aspect-square relative overflow-hidden rounded-lg bg-gray-100">
                      <img
                        src={typedProduct.image_url}
                        alt={typedProduct.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-lg">
                      {typedProduct.name}
                    </h3>
                    {typedProduct.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {typedProduct.description}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">상품 금액</span>
                      <span>{formattedPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">배송비</span>
                      <span>무료</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>총 결제 금액</span>
                    <span className="text-primary">{formattedPrice}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 결제 폼 */}
          <div>
            <Card>
              <CardContent className="p-6">
                <CheckoutForm product={typedProduct} userId={user?.id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

