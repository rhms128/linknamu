import { Collection, MongoClient } from "mongodb";

export type ClickDoc = {
  _id: string;
  count: number;
};

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "MONGODB_URI 환경 변수가 없습니다. .env.local을 확인하고 dev 서버를 재시작하세요.",
  );
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// 개발 중에는 HMR로 이 모듈이 여러 번 평가된다.
// 전역에 캐시해두지 않으면 커넥션이 계속 쌓여 Atlas 연결 수 제한에 걸린다.
let clientPromise: Promise<MongoClient> | undefined = global._mongoClientPromise;

function connect(): Promise<MongoClient> {
  return new MongoClient(uri as string).connect().catch((error) => {
    // 실패한 Promise를 캐시에 남기면 이후 모든 요청이 같은 에러를 그대로 재사용한다.
    // (예: Atlas 비밀번호를 고쳐도 서버를 재시작할 때까지 계속 인증 실패)
    // 캐시를 비워 다음 요청에서 새로 연결을 시도하게 한다.
    clientPromise = undefined;
    global._mongoClientPromise = undefined;
    throw error;
  });
}

export async function getClicksCollection(): Promise<Collection<ClickDoc>> {
  if (!clientPromise) {
    clientPromise = connect();
    if (process.env.NODE_ENV !== "production") {
      global._mongoClientPromise = clientPromise;
    }
  }

  const client = await clientPromise;
  // 접속 문자열에 /linknamu 가 들어 있으므로 db() 인자는 비워 둔다.
  return client.db().collection<ClickDoc>("clicks");
}
