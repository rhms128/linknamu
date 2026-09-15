import { NextResponse } from "next/server";

import { TRACKED_IDS } from "@/lib/links";
import { getClicksCollection } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  if (!TRACKED_IDS.includes(id)) {
    return NextResponse.json(
      { error: "알 수 없는 링크입니다." },
      { status: 400 },
    );
  }

  try {
    const collection = await getClicksCollection();
    // 문서가 없으면 만들면서 1로 시작한다.
    const doc = await collection.findOneAndUpdate(
      { _id: id },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" },
    );

    return NextResponse.json({ id, count: doc?.count ?? 1 });
  } catch (error) {
    console.error(`[clicks] '${id}' 클릭 수 증가 실패:`, error);
    return NextResponse.json(
      { error: "클릭 수를 저장하지 못했습니다." },
      { status: 503 },
    );
  }
}
