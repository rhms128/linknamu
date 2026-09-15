import { Collection, Document, MongoClient } from "mongodb";

export type ClickDoc = {
  _id: string;
  count: number;
};

/** 집계된 방문. _id는 `${링크 id}:${방문자 해시}`, TTL로 자동 삭제된다. */
export type VisitDoc = {
  _id: string;
  at: Date;
};

/** 앱이 스스로 관리하는 설정값 (예: 방문자 해시용 솔트) */
export type MetaDoc = {
  _id: string;
  value: string;
};

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 개발 중에는 HMR로 이 모듈이 여러 번 평가된다.
// 전역에 캐시해두지 않으면 커넥션이 계속 쌓여 Atlas 연결 수 제한에 걸린다.
let clientPromise: Promise<MongoClient> | undefined = global._mongoClientPromise;

function connect(uri: string): Promise<MongoClient> {
  return new MongoClient(uri).connect().catch((error) => {
    // 실패한 Promise를 캐시에 남기면 이후 모든 요청이 같은 에러를 그대로 재사용한다.
    // (예: Atlas 비밀번호를 고쳐도 서버를 재시작할 때까지 계속 인증 실패)
    // 캐시를 비워 다음 요청에서 새로 연결을 시도하게 한다.
    clientPromise = undefined;
    global._mongoClientPromise = undefined;
    throw error;
  });
}

export async function getCollection<T extends Document>(
  name: string,
): Promise<Collection<T>> {
  // 환경 변수는 모듈 평가 시점이 아니라 요청 시점에 확인한다.
  // 최상단에서 throw 하면 빌드가 이 모듈을 읽는 것만으로 실패한다.
  // (Vercel에 MONGODB_URI를 넣기 전에는 배포 자체가 깨진다)
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI 환경 변수가 없습니다. 로컬은 .env.local, 배포 환경은 Vercel의 Environment Variables를 확인하세요.",
    );
  }

  if (!clientPromise) {
    clientPromise = connect(uri);
    if (process.env.NODE_ENV !== "production") {
      global._mongoClientPromise = clientPromise;
    }
  }

  const client = await clientPromise;
  // 접속 문자열에 /linknamu 가 들어 있으므로 db() 인자는 비워 둔다.
  return client.db().collection<T>(name);
}

export const getClicksCollection = () => getCollection<ClickDoc>("clicks");
export const getVisitsCollection = () => getCollection<VisitDoc>("visits");
export const getMetaCollection = () => getCollection<MetaDoc>("meta");
