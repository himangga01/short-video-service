# SSUL MAKER

유튜브 쇼츠형 썰 영상을 제작하기 위한 로컬 우선 웹 편집기입니다.

`대본 작성 -> 씬 분할 -> 이미지 적용 -> Gemini TTS 생성 -> 9:16 미리보기 -> 전체 재생 -> MP4 Export` 흐름을 한 화면에서 처리하는 것을 목표로 합니다.

## 현재 구현 상태

MVP 영상 제작 파이프라인은 구현되어 있습니다.

- [x] 프로젝트 생성, 조회, 수정, 삭제 및 검색
- [x] 씬 생성, 수정, 삭제, 드래그 순서 변경
- [x] 긴 대본 붙여넣기와 씬 분할 생성
- [x] 이미지 업로드, WebP 변환, 교체, 삭제
- [x] Gemini TTS 음성 생성과 MP3 저장
- [x] 대본·음성 설정 변경 시 기존 TTS 무효화
- [x] 씬별 이미지/TTS/렌더 준비 상태 관리
- [x] 9:16 영상 미리보기와 타임라인 기반 전체 재생
- [x] 준비되지 않은 씬 안내와 Export 차단
- [x] 비동기 FFmpeg MP4 렌더 작업 및 진행 상태 조회
- [x] 프로젝트 삭제 시 이미지, TTS, 렌더 파일 정리
- [x] 전문 편집 프로그램 방향의 블랙 테마
- [x] Node 내장 테스트 러너 기반 백엔드 회귀 테스트

과거 Phase A~G에서 MVP 기능 파이프라인을 구현했고, 현재 UX 개선 로드맵에서는 Phase 0 문서 정리와 Phase 1 제작 준비도 UX까지 반영된 상태입니다.

## 주요 화면 구성

- 좌측: 프로젝트 목록, 검색, 새 프로젝트 생성
- 중앙 상단: 씬 추가, 대본 붙여넣기, 전체 TTS, 전체 재생, Export
- 중앙: 제작 준비도, 9:16 미리보기, 렌더 상태
- 중앙 하단: 드래그 정렬 가능한 씬 타임라인
- 우측: 선택한 씬의 대본, 음성, 자막, 색상, 이미지 설정

## 기술 스택

### Frontend

- React 19 + TypeScript
- Vite 7
- Tailwind CSS 4
- Redux Toolkit
- Axios
- dnd-kit
- Lucide React

### Backend

- Node.js + Express 5
- SQLite + Knex.js
- Gemini API `gemini-2.5-flash-preview-tts`
- Multer + Sharp
- FFmpeg Static
- music-metadata
- Node.js `node:test`

## 프로젝트 구조

```text
ssul-maker/
├── frontend/                 # React 편집기
│   └── src/
│       ├── api/              # Backend API 클라이언트
│       ├── components/       # 편집기 UI
│       ├── store/            # Redux 상태 관리
│       └── types/            # 공용 Frontend 타입
├── backend/
│   ├── migrations/           # SQLite 스키마
│   ├── src/
│   │   ├── routes/           # Project, Panel, Render API
│   │   ├── services/         # Gemini TTS, FFmpeg 렌더
│   │   └── app.js            # Express 서버
│   └── test/                 # Backend 회귀 테스트
├── HANDOFF.md                # 다른 PC 작업 인수인계
├── IMPLEMENTATION_PLAN.md    # 단계별 구현 계획
└── work-log.md               # 작업 이력과 남은 작업
```

## 다른 PC에서 이어가기

다른 PC에서는 `main`을 기준으로 저장소를 받습니다.

```powershell
git clone https://github.com/himangga01/short-video-service.git
cd short-video-service
git switch main
git pull --ff-only origin main
```

설치·환경변수·로컬 DB/미디어 이전·현재 남은 작업은 [HANDOFF.md](./HANDOFF.md)를 따릅니다. Git에는 소스와 문서만 저장되며 `backend/.env`, `frontend/.env`, `backend/data`, `backend/uploads`는 새 PC에 자동으로 복원되지 않습니다.

## 로컬 실행

### 1. Backend

```powershell
cd backend
npm ci
Copy-Item .env.example .env
npm run migrate
npm run dev
```

`backend/.env`에 발급받은 Gemini API 키를 입력합니다.

```dotenv
PORT=3001
NODE_ENV=development
DATABASE_PATH=./data/ssulmaker.db
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5173

GEMINI_API_KEY=your_api_key
GEMINI_TTS_MODEL=gemini-2.5-flash-preview-tts
GEMINI_TTS_TIMEOUT_MS=60000
TTS_DEFAULT_VOICE=Kore
TTS_DEFAULT_INSTRUCTIONS=한국어 썰 영상 내레이션처럼 자연스럽고 몰입감 있게 읽어주세요.
```

Backend 기본 주소는 `http://localhost:3001`이며 상태 확인은 `GET /health`를 사용합니다.

### 2. Frontend

```powershell
cd frontend
npm ci
npm run dev
```

Frontend 기본 주소는 `http://localhost:5173`입니다. API 주소를 명시하려면 Git에 포함되지 않는 `frontend/.env`를 사용합니다.

```dotenv
VITE_API_URL=http://127.0.0.1:3001
```

## 개발 명령

```powershell
# Backend
cd backend
npm run dev
npm run migrate
npm test

# Frontend
cd frontend
npm run dev
npm run lint
npm run build
```

## API

### Projects

```text
GET    /api/projects
GET    /api/projects/:id
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Panels

```text
GET    /api/panels/project/:projectId
GET    /api/panels/:id
POST   /api/panels
PUT    /api/panels/:id
DELETE /api/panels/:id
PUT    /api/panels/reorder
POST   /api/panels/:id/image
DELETE /api/panels/:id/image
POST   /api/panels/:id/tts
POST   /api/panels/project/:projectId/tts
```

### Render

```text
POST   /api/render/project/:projectId
GET    /api/render/jobs/:jobId
```

## 남은 작업

### 우선순위 1: 상태 안정성

- [ ] 오래된 TTS 실패 요청이 최신 TTS 상태와 오디오를 덮어쓰지 않도록 `tts_hash` 조건부 실패 업데이트 적용
- [ ] 완료된 렌더 job이 후속 프로젝트 상태 갱신 실패로 `failed`로 되돌아가거나 출력 파일이 삭제되지 않도록 terminal 상태 보호
- [ ] stale TTS 실패 경합과 렌더 완료 상태 전이에 대한 회귀 테스트 추가

### 우선순위 2: 편집기 UX와 접근성

- [ ] 좁은 화면에서 좌우 패널을 접거나 전환할 수 있는 반응형 편집기 레이아웃 구현
- [ ] 툴바 액션 그룹과 overflow 메뉴를 도입해 버튼 잘림 방지
- [ ] 저장 상태를 씬 설정 저장과 이미지/TTS/정렬 작업 상태로 구분
- [ ] 빈 대본 씬이 있을 때 전체 TTS 실행 조건과 안내 문구 개선
- [ ] 설정 label과 입력 요소 연결, 이미지 업로드의 키보드 접근 지원
- [ ] 우측 인스펙터를 대본·음성·비주얼·자막 단위로 구조화

### 우선순위 3: 운영과 유지보수

- [ ] production 환경에서는 localhost CORS origin을 제외하도록 환경별 allow-list 분리
- [ ] Tailwind 유틸리티 전역 override를 의미 기반 다크 테마 토큰과 컴포넌트 클래스로 점진 전환
- [ ] Render API, CORS, 주요 Frontend 편집 흐름에 대한 자동화 테스트 확장
- [ ] 릴리즈용 환경 설정, QA 체크리스트, 배포 절차 문서화

### 후속 편집 기능

- [ ] TTS 일괄 진행률, 실패 씬 재시도, 음성 프리셋
- [ ] 이미지 업로드 진행률, 드래그 앤 드롭, 크롭·팬·줌
- [ ] 오디오 기반 정밀 재생 헤드와 키보드 단축키
- [ ] 씬 복제, 일괄 스타일 적용, Undo/Redo

## 문서

- [HANDOFF.md](./HANDOFF.md): 다른 PC 인수인계, 로컬 데이터 이전, 다음 작업 순서
- [로컬개발환경_설정가이드.md](./로컬개발환경_설정가이드.md): 현재 코드 기준 설치와 실행 방법
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md): 전체 구현 및 개선 계획
- [TESTING.md](./TESTING.md): 테스트와 검증 방법
- [UX_UI_기능설명서.md](./UX_UI_기능설명서.md): 편집기 UX 기능 설명
- [설계서.md](./설계서.md): 시스템 및 기능 설계
- [구현_로드맵.md](./구현_로드맵.md): 단계별 구현 순서
- [기술스택_명세서.md](./기술스택_명세서.md): 기술 선택 기준
- [요구사항서.md](./요구사항서.md): MVP 요구사항과 완료 기준
- [work-log.md](./work-log.md): 작업 이력, 결정, 남은 작업

## AI / Developer Structured Summary

### Product Flow

`script -> scene split -> image -> Gemini TTS -> 9:16 preview -> playback -> asynchronous FFmpeg export`

### Current Baseline

- The local-first MVP media pipeline is implemented end to end.
- Backend media readiness is authoritative and checks database state plus local file existence.
- Gemini TTS returns PCM audio that is converted to MP3 through FFmpeg.
- Render requests create jobs first and expose polling-based progress.
- The current UI uses a three-column dark editor shell with project list, workspace/timeline, and scene inspector.
- Cross-PC setup and non-Git state transfer are documented in `HANDOFF.md`.

### Immediate Engineering Priorities

1. Guard stale TTS failure updates with the active request hash.
2. Preserve terminal render-job invariants after output publication.
3. Make the editor shell and toolbar responsive.
4. Separate operation-specific persistence status from the global save label.
5. Fix bulk-TTS preconditions and form/upload accessibility.
6. Expand regression coverage for TTS races, render transitions, CORS, and critical editor flows.

## 라이선스

MIT
