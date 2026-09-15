import { NextResponse } from "next/server";

import { getCounts } from "@/lib/clicks";

// 클릭 수는 매 요청마다 최신 값을 읽어야 하므로 캐시하지 않는다.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getCounts());
  } catch (error) {
    console.error("[clicks] 클릭 수 조회 실패:", error);
    return NextResponse.json(
      { error: "클릭 수를 불러오지 못했습니다." },
      { status: 503 },
    );
  }
}
