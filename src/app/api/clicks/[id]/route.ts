import { NextResponse } from "next/server";

import { registerClick } from "@/lib/clicks";
import { TRACKED_IDS } from "@/lib/links";

export const dynamic = "force-dynamic";

/**
 * 방문자를 구분할 키. Vercel은 x-forwarded-for에 클라이언트 IP를 넣어 준다.
 * 헤더가 없으면(로컬 등) 하나로 묶이므로, 그 환경에서는 사실상 전체가 1회로 집계된다.
 */
function visitorKeyOf(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export async function POST(
  request: Request,
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
    const { count, counted } = await registerClick(id, visitorKeyOf(request));
    return NextResponse.json({ id, count, counted });
  } catch (error) {
    console.error(`[clicks] '${id}' 클릭 수 증가 실패:`, error);
    return NextResponse.json(
      { error: "클릭 수를 저장하지 못했습니다." },
      { status: 503 },
    );
  }
}
