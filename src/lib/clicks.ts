import { createHash, randomBytes } from "node:crypto";

import { ZERO_COUNTS, type Counts, TRACKED_IDS } from "./links";
import {
  getClicksCollection,
  getMetaCollection,
  getVisitsCollection,
} from "./mongodb";

/** 같은 방문자의 같은 링크 클릭을 이 시간 동안 한 번만 집계한다. */
const DEDUP_WINDOW_SECONDS = 60 * 60 * 24;

const SALT_KEY = "visitorSalt";

export type ClickResult = {
  count: number;
  /** false면 중복이라 집계하지 않고 기존 값을 그대로 돌려준 것이다. */
  counted: boolean;
};

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

// 인덱스 생성과 솔트 조회는 프로세스당 한 번이면 충분하므로 Promise를 캐시한다.
let indexReady: Promise<void> | undefined;
let saltReady: Promise<string> | undefined;

async function ensureTtlIndex(): Promise<void> {
  const visits = await getVisitsCollection();
  // createIndex는 멱등이다. 이미 있으면 아무 일도 하지 않는다.
  await visits.createIndex(
    { at: 1 },
    { expireAfterSeconds: DEDUP_WINDOW_SECONDS },
  );
}

/**
 * 방문자 해시용 솔트.
 * 솔트가 없으면 IPv4는 전수 계산으로 원문을 되찾을 수 있어(약 43억 개) 해시가 무의미해진다.
 * 환경 변수를 하나 더 늘리지 않으려고 DB에 만들어 두고 재사용한다.
 */
async function getVisitorSalt(): Promise<string> {
  const meta = await getMetaCollection();
  // upsert + $setOnInsert 라서 여러 요청이 동시에 들어와도 솔트는 하나만 만들어진다.
  const doc = await meta.findOneAndUpdate(
    { _id: SALT_KEY },
    { $setOnInsert: { value: randomBytes(32).toString("hex") } },
    { upsert: true, returnDocument: "after" },
  );

  if (!doc) throw new Error("방문자 솔트를 준비하지 못했습니다.");
  return doc.value;
}

async function readCount(id: string): Promise<number> {
  const clicks = await getClicksCollection();
  const doc = await clicks.findOne({ _id: id });
  return doc?.count ?? 0;
}

export async function getCounts(): Promise<Counts> {
  const clicks = await getClicksCollection();
  const docs = await clicks.find({ _id: { $in: TRACKED_IDS } }).toArray();

  // 아직 눌린 적 없는 링크도 0으로 채워 항상 같은 모양으로 응답한다.
  const counts: Counts = { ...ZERO_COUNTS };
  for (const doc of docs) {
    counts[doc._id] = doc.count;
  }
  return counts;
}

export async function registerClick(
  id: string,
  visitorKey: string,
): Promise<ClickResult> {
  indexReady ??= ensureTtlIndex();
  saltReady ??= getVisitorSalt();
  await indexReady;
  const salt = await saltReady;

  const visitor = createHash("sha256")
    .update(`${salt}:${visitorKey}`)
    .digest("hex")
    .slice(0, 32);

  const visits = await getVisitsCollection();
  try {
    // 조회 후 삽입하면 동시 요청이 둘 다 통과한다.
    // 유일 키(_id) 삽입을 시도해 DB가 원자적으로 판정하게 한다.
    await visits.insertOne({ _id: `${id}:${visitor}`, at: new Date() });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      // 집계 기간 안에 이미 센 방문자다. 현재 값만 알려준다.
      return { count: await readCount(id), counted: false };
    }
    throw error;
  }

  const clicks = await getClicksCollection();
  const doc = await clicks.findOneAndUpdate(
    { _id: id },
    { $inc: { count: 1 } },
    { upsert: true, returnDocument: "after" },
  );

  return { count: doc?.count ?? 1, counted: true };
}
