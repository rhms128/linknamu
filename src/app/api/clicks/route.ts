import { NextResponse } from "next/server";

import { TRACKED_IDS, ZERO_COUNTS, type Counts } from "@/lib/links";
import { getClicksCollection } from "@/lib/mongodb";

// 클릭 수는 매 요청마다 최신 값을 읽어야 하므로 캐시하지 않는다.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const collection = await getClicksCollection();
    const docs = await collection
      .find({ _id: { $in: TRACKED_IDS } })
      .toArray();

    // 아직 눌린 적 없는 링크도 0으로 채워 항상 같은 모양으로 응답한다.
    const counts: Counts = { ...ZERO_COUNTS };
    for (const doc of docs) {
      counts[doc._id] = doc.count;
    }

    return NextResponse.json(counts);
  } catch (error) {
    console.error("[clicks] 클릭 수 조회 실패:", error);
    return NextResponse.json(
      { error: "클릭 수를 불러오지 못했습니다." },
      { status: 503 },
    );
  }
}
