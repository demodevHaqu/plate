/**
 * @file page.tsx
 * @description 결제 실패 페이지
 *
 * 이 페이지는 결제 실패 시 사용자에게 에러 정보를 표시합니다.
 *
 * 주요 기능:
 * 1. 쿼리 파라미터에서 에러 정보 추출
 * 2. 에러 메시지 표시
 * 3. 다시 시도 버튼
 *
 * @dependencies
 * - @/components/ui/card: ShadCN Card 컴포넌트
 * - @/components/ui/button: ShadCN Button 컴포넌트
 */

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { createMetadata } from "@/utils/seo/metadata";

export const metadata = createMetadata({
  title: "결제 실패",
  description: "결제에 실패했습니다.",
  noIndex: true,
});

interface PaymentFailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
    orderId?: string;
  }>;
}

export default async function PaymentFailPage({
  searchParams,
}: PaymentFailPageProps) {
  const params = await searchParams;
  const { code, message, orderId } = params;

  console.group("❌ 결제 실패 페이지");
  console.log("에러 코드:", code);
  console.log("에러 메시지:", message);
  console.log("주문 ID:", orderId);
  console.groupEnd();

  // 에러 메시지 디코딩
  const decodedMessage = message
    ? decodeURIComponent(message)
    : "결제에 실패했습니다.";

  // 에러 코드별 사용자 친화적 메시지
  const errorMessages: Record<string, string> = {
    PAY_PROCESS_CANCELED: "결제가 취소되었습니다.",
    PAY_PROCESS_ABORTED: "결제가 중단되었습니다.",
    REJECT_CARD_COMPANY: "카드사에서 결제를 거부했습니다.",
    NOT_FOUND_PAYMENT_SESSION: "결제 시간이 만료되었습니다.",
    FORBIDDEN_REQUEST: "잘못된 요청입니다.",
    UNAUTHORIZED_KEY: "인증 오류가 발생했습니다.",
    AMOUNT_MISMATCH: "결제 금액이 일치하지 않습니다.",
  };

  const userFriendlyMessage = code ? errorMessages[code] || decodedMessage : decodedMessage;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* 실패 아이콘 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">결제에 실패했습니다</h2>
            <p className="text-muted-foreground">
              결제 처리 중 문제가 발생했습니다.
            </p>
          </div>

          {/* 에러 정보 */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <h3 className="font-semibold mb-2">오류 내용</h3>
                <p className="text-muted-foreground">{userFriendlyMessage}</p>
              </div>

              {code && (
                <div>
                  <h3 className="font-semibold mb-2">오류 코드</h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    {code}
                  </p>
                </div>
              )}

              {orderId && (
                <div>
                  <h3 className="font-semibold mb-2">주문번호</h3>
                  <p className="text-sm font-mono text-muted-foreground">
                    {orderId}
                  </p>
                </div>
              )}

              <div className="pt-4 space-y-2">
                <h3 className="font-semibold mb-2">해결 방법</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {code === "REJECT_CARD_COMPANY" && (
                    <>
                      <li>• 카드 정보가 정확한지 확인해주세요.</li>
                      <li>• 카드 한도를 확인해주세요.</li>
                      <li>• 다른 카드로 시도해주세요.</li>
                    </>
                  )}
                  {code === "NOT_FOUND_PAYMENT_SESSION" && (
                    <>
                      <li>• 결제 시간이 초과되었습니다.</li>
                      <li>• 처음부터 다시 시도해주세요.</li>
                    </>
                  )}
                  {!code && (
                    <>
                      <li>• 입력하신 정보를 다시 확인해주세요.</li>
                      <li>• 잠시 후 다시 시도해주세요.</li>
                      <li>• 문제가 지속되면 고객센터로 문의해주세요.</li>
                    </>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 액션 버튼 */}
          <div className="flex gap-3">
            <Link href="/products" className="flex-1">
              <Button className="w-full">다시 시도</Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                홈으로
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

