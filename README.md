# 링크나무 🌳

내 모든 링크를 한 페이지에 모아두고, 하나의 URL로 공유하는 Link in Bio 서비스입니다.

**배포 주소** — https://linknamu-murex.vercel.app/

## 기능

- **프로필** — 이름, 한 줄 소개, 원형 프로필 사진
- **링크 카드** — 깃허브 · 인스타그램 · 링크드인 · 이메일
- **클릭 수 집계** — 링크별 클릭 횟수를 MongoDB에 기록하고 카드 오른쪽에 표시
  (같은 방문자의 같은 링크는 24시간에 한 번만 집계)
- **이메일 복사** — 이메일 카드를 누르면 주소가 클립보드에 복사 (`mailto:`는 메일 앱이 없는 환경에서 동작하지 않아 복사 방식 채택)
- **다크모드** — 첫 페인트 전에 테마를 적용해 화면 깜빡임 없음
- **모바일 우선 반응형**

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS |
| 폰트 | Pretendard (동적 서브셋) |
| 데이터베이스 | MongoDB Atlas |
| 배포 | Vercel |

## 시작하기

```bash
npm install
```

프로젝트 루트에 `.env.local` 파일을 만들고 MongoDB 접속 문자열을 넣습니다
(`.env.local.example` 참고).

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/linknamu?appName=Cluster0
```

> 경로의 `/linknamu`가 사용할 데이터베이스 이름입니다. 코드에서 `client.db()`를
> 인자 없이 호출하므로 이 부분을 빼면 안 됩니다.

```bash
npm run dev     # 개발 서버 (http://localhost:3000)
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint
```

## 프로젝트 구조

```
src/
├── app/
│   ├── api/clicks/
│   │   ├── route.ts          GET  전체 클릭 수 조회
│   │   └── [id]/route.ts     POST 특정 링크 클릭 수 +1
│   ├── globals.css           디자인 토큰, 글래스 표면
│   ├── layout.tsx            폰트 · 테마 초기화
│   └── page.tsx              메인 화면
├── components/
│   ├── ProfileHeader.tsx     프로필 영역
│   ├── LinkList.tsx          클릭 수 상태 관리 (client)
│   ├── LinkCard.tsx          링크 카드
│   ├── CopyEmailCard.tsx     이메일 복사 카드 (client)
│   ├── ClickCount.tsx        "N회" 표시
│   ├── ThemeToggle.tsx       다크모드 토글 (client)
│   └── cardStyle.ts          카드 공용 클래스
└── lib/
    ├── links.ts              링크 데이터 · 집계 대상 id
    ├── clicks.ts             집계 로직 (중복 제거 포함)
    └── mongodb.ts            DB 연결 (커넥션 캐시)
```

링크를 추가하거나 수정하려면 `src/lib/links.ts`만 고치면 됩니다.
`TRACKED_IDS`가 API의 허용 목록 역할도 하므로 여기 없는 id는 집계되지 않습니다.

## API

### `GET /api/clicks`

모든 링크의 클릭 수를 한 번에 반환합니다. 기록이 없는 링크도 `0`으로 채워집니다.

```json
{ "github": 5, "instagram": 3, "linkedin": 2, "email": 2 }
```

### `POST /api/clicks/:id`

해당 링크의 클릭 수를 1 증가시키고 갱신된 값을 반환합니다.
문서가 없으면 새로 만들며 `1`부터 시작합니다.

```json
{ "id": "github", "count": 6, "counted": true }
```

`counted`가 `false`면 집계 기간 안에 이미 센 방문자라 숫자를 올리지 않고
현재 값만 돌려준 것입니다. 허용 목록에 없는 `id`는 `400`을 반환합니다.

### 데이터 구조

`linknamu` 데이터베이스에 세 개의 컬렉션을 사용합니다.

```js
// clicks — 링크별 누적 클릭 수
{ _id: "github", count: 5 }

// visits — 집계된 방문 (TTL로 24시간 뒤 자동 삭제)
{ _id: "github:36550cf873ec47d9927c872d2a216c61", at: ISODate(...) }

// meta — 앱이 스스로 만드는 설정값
{ _id: "visitorSalt", value: "<랜덤 32바이트>" }
```

### 동작 방식

페이지가 열리면 `GET /api/clicks`를 한 번 호출합니다. 응답 전에는 모든 카드가
`0회`로 표시되고, 응답이 오면 실제 값으로 교체됩니다.

카드를 누르면 화면의 숫자가 먼저 올라가고(낙관적 업데이트), 이어서
`POST`를 보내 서버가 알려준 값으로 맞춥니다. 링크가 새 탭으로 열려도 요청이
끊기지 않도록 `keepalive`를 사용합니다.

DB 연결에 실패하면 API가 `503`을 반환하고 화면은 `0회`를 유지합니다.
이 경우에도 링크 이동 자체는 정상 동작합니다.

### 중복 제거

클릭 수가 "몇 번 요청이 왔나"가 아니라 "몇 명이 눌렀나"에 가깝도록,
같은 방문자의 같은 링크 클릭은 **24시간에 한 번만** 집계합니다.

방문자는 IP로 구분하되 원문을 저장하지 않습니다. DB에 보관된 솔트와 함께
SHA-256으로 해싱한 값만 `visits`에 남습니다. 솔트가 없으면 IPv4는 전수 계산으로
원문을 되찾을 수 있어(약 43억 개) 해시가 무의미해지기 때문입니다.
솔트는 첫 요청 때 자동 생성되므로 따로 설정할 것은 없습니다.

판정은 `visits`에 `{링크 id}:{방문자 해시}`를 `_id`로 삽입해 보는 방식입니다.
조회 후 삽입하면 동시 요청이 둘 다 통과하므로, DB의 유일 키가 원자적으로
판정하게 맡깁니다. TTL 인덱스가 24시간 지난 문서를 지우면 집계 기간이 초기화됩니다.

이미 집계된 방문자가 다시 누르면 화면의 숫자가 잠깐 올랐다가 원래 값으로
돌아옵니다. 낙관적 업데이트로 먼저 올린 뒤 서버 응답으로 되돌리기 때문이며,
의도된 동작입니다.

## 배포

Vercel에 GitHub 저장소를 연결하면 `main` 브랜치 푸시마다 자동 배포됩니다.
다만 두 가지 설정이 필요합니다.

**1. Vercel 환경 변수**

Settings → Environment Variables에 `MONGODB_URI`를 등록합니다.
환경 변수는 빌드 시점에 주입되므로, 값을 바꾼 뒤에는 **Redeploy**를 해야 반영됩니다.

**2. MongoDB Atlas 네트워크 접근 허용**

Network Access → IP Access List에 `0.0.0.0/0`을 추가합니다.
Vercel 서버리스 함수는 고정 IP가 없어서, 특정 IP만 허용하면 로컬에서는
연결되는데 배포 환경에서만 실패합니다.

## 알려진 제약

- 중복 제거는 IP 기준이라 한계가 있습니다. 같은 공유기나 회사 네트워크를 쓰는
  여러 사람은 한 명으로 합쳐지고, 반대로 IP가 자주 바뀌는 모바일 환경에서는
  같은 사람이 여러 번 집계될 수 있습니다. IP를 바꿔 가며 보내는 요청도 막지
  못합니다. 작정한 조작까지 차단하려면 별도의 봇 방지 수단이 필요합니다.
- 호출 횟수 자체를 제한하는 rate limit은 없습니다. 중복 제거로 숫자는 보호되지만,
  대량 요청이 들어오면 DB 호출은 그대로 발생합니다.
- 클립보드 복사는 보안 컨텍스트(HTTPS 또는 localhost)에서만 동작합니다.
  사용할 수 없는 환경에서는 `mailto:`로 대체됩니다.
