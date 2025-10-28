/**
 * @file page.tsx
 * @description 상품 목록 페이지
 *
 * 이 페이지는 Supabase에서 상품 목록을 조회하여 표시합니다.
 *
 * 주요 기능:
 * 1. 상품 목록 조회 (서버 컴포넌트)
 * 2. 상품 카드 렌더링
 * 3. 반응형 그리드 레이아웃
 *
 * 핵심 구현 로직:
 * - Supabase에서 상품 데이터 조회
 * - 서버 컴포넌트로 구현하여 SSR 지원
 * - 에러 처리 및 빈 상태 처리
 *
 * @dependencies
 * - @/utils/supabase/server: Supabase 서버 클라이언트
 * - @/components/payment/product-card: 상품 카드 컴포넌트
 * - @/types/payment: Product 타입
 */

import { createServerSupabaseClient } from "@/utils/supabase/server";
import { Product } from "@/types/payment";
import { ProductCard } from "@/components/payment/product-card";
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "상품 목록",
  description: "토스페이먼츠 결제 데모 - 상품 목록을 확인하고 결제해보세요.",
});

export default async function ProductsPage() {
  console.group("📦 상품 목록 페이지 렌더링");

  const supabase = await createServerSupabaseClient();

  // 상품 목록 조회
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("❌ 상품 조회 실패:", error);
    console.groupEnd();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">오류 발생</h1>
          <p className="text-muted-foreground">
            상품을 불러오는 중 오류가 발생했습니다.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    console.log("📭 상품이 없습니다.");
    console.groupEnd();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">상품이 없습니다</h1>
          <p className="text-muted-foreground">
            아직 등록된 상품이 없습니다.
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ 상품 조회 완료:", products.length, "개");
  console.groupEnd();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">상품 목록</h1>
        <p className="text-muted-foreground">
          원하는 상품을 선택하고 결제해보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product as Product} />
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h2 className="text-xl font-bold mb-2">💡 테스트 안내</h2>
        <p className="text-sm text-muted-foreground">
          이 페이지는 토스페이먼츠 결제 연동 데모입니다. 테스트 키를
          사용하므로 실제 결제가 이루어지지 않습니다.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>• 모든 결제수단을 테스트할 수 있습니다.</li>
          <li>
            • 카드번호는 실제 카드가 아닌 테스트 카드 정보를 사용하세요.
          </li>
          <li>• 결제 승인 후 데이터베이스에 결제 내역이 저장됩니다.</li>
        </ul>
      </div>
    </div>
  );
}

