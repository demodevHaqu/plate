/**
 * @file product-card.tsx
 * @description 상품 카드 컴포넌트
 *
 * 이 컴포넌트는 상품 정보를 카드 형태로 표시합니다.
 *
 * 주요 기능:
 * 1. 상품 이미지, 이름, 설명, 가격 표시
 * 2. 결제하기 버튼
 *
 * @dependencies
 * - @/components/ui/card: ShadCN Card 컴포넌트
 * - @/components/ui/button: ShadCN Button 컴포넌트
 * - @/types/payment: Product 타입
 */

"use client";

import Link from "next/link";
import { Product } from "@/types/payment";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  // 금액 포맷팅
  const formattedPrice = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(product.price);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        {product.image_url && (
          <div className="aspect-square relative mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.image_url}
              alt={product.name}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <CardTitle>{product.name}</CardTitle>
        {product.description && (
          <CardDescription>{product.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-2xl font-bold">{formattedPrice}</p>
      </CardContent>
      <CardFooter>
        <Link href={`/checkout/${product.id}`} className="w-full">
          <Button className="w-full" size="lg">
            결제하기
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

