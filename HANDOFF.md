# SSUL MAKER 작업 인수인계

이 문서는 다른 PC에서 저장소를 받아 현재 작업을 바로 이어가기 위한 기준 문서입니다.

- 기준일: 2026-08-21
- 저장소: `https://github.com/himangga01/short-video-service.git`
- 기준 브랜치: `main`
- 제품 흐름: `대본 -> 씬 분할 -> 이미지 -> Gemini TTS -> 9:16 미리보기 -> 전체 재생 -> MP4 Export`

## 1. 새 PC 준비

필요한 도구:

- Git
- Node.js와 npm
- Gemini API 키
- Windows에서는 PowerShell 사용 권장

FFmpeg는 `ffmpeg-static` 패키지를 사용하므로 별도 시스템 설치가 필수는 아닙니다. `better-sqlite3`와 `sharp`는 네이티브 모듈이므로 다른 PC의 `node_modules`를 복사하지 말고 새 PC에서 다시 설치합니다.

## 2. 저장소 받기

```powershell
git clone https://github.com/himangga01/short-video-service.git
cd short-video-service
git switch main
git pull --ff-only origin main
```

작업 시작 전 현재 브랜치가 `main`인지 확인한 뒤 작업용 브랜치를 만듭니다.

```powershell
git switch -c <type>/<short-description>
```

예시: `fix/tts-stale-failure`, `feat/responsive-editor`, `docs/update-handoff`

## 3. 환경변수 구성

### Backend

```powershell
Copy-Item backend\.env.example backend\.env
```

`backend/.env`에서 최소한 `GEMINI_API_KEY`를 입력합니다.

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

### Frontend

`frontend/.env`를 새로 만듭니다.

```dotenv
VITE_API_URL=http://127.0.0.1:3001
```

`backend/.env`와 `frontend/.env`는 Git에서 제외됩니다. API 키가 있는 `.env` 파일을 커밋하지 않습니다.

## 4. 의존성 설치와 DB 준비

저장소에는 두 개의 lockfile이 있으므로 각 디렉터리에서 `npm ci`를 실행합니다.

```powershell
cd backend
npm ci
npm run migrate

cd ..\frontend
npm ci
```

`better-sqlite3` 바이너리 호환 오류가 발생하면 현재 PC의 Node.js 버전에 맞게 백엔드 모듈을 다시 빌드합니다.

```powershell
cd backend
npm rebuild better-sqlite3
```

## 5. 개발 서버 실행

터미널 1:

```powershell
cd backend
npm run dev
```

터미널 2:

```powershell
cd frontend
npm run dev
```

기본 주소:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health check: `http://localhost:3001/health`

## 6. 기존 로컬 작업 데이터 옮기기

Git clone만 하면 소스와 문서는 복원되지만 로컬 프로젝트 데이터와 미디어는 복원되지 않습니다.

Git에 포함되지 않는 항목:

- `backend/.env`: Gemini 키와 로컬 설정
- `frontend/.env`: Frontend API 주소
- `backend/data/`: SQLite DB
- `backend/uploads/`: 이미지, TTS MP3, 렌더 MP4
- `backend/node_modules/`, `frontend/node_modules/`
- `frontend/dist/`, 로그 파일

기존 데이터를 이어 써야 한다면 이전 PC에서 서버를 종료한 뒤 아래 경로를 새 PC의 같은 위치로 별도 복사합니다.

```text
backend/data/ssulmaker.db
backend/uploads/images/
backend/uploads/audio/
backend/uploads/renders/
```

DB와 uploads는 서로 연결되어 있으므로 가능하면 함께 복사합니다. 이 파일들은 사용자 데이터와 생성 미디어이므로 Git 저장소에 올리지 않습니다. 새로운 빈 환경으로 시작한다면 복사하지 않고 `npm run migrate`만 실행합니다.

## 7. 현재 구현 완료 범위

- 프로젝트/씬 CRUD, 검색, 입력 검증, 씬 순서 변경
- 대본 붙여넣기와 씬 분할
- 이미지 업로드, WebP 변환, 교체, 삭제
- Gemini TTS 생성, PCM-to-MP3 변환, timeout, source hash 관리
- 씬별 이미지/TTS/render 준비 상태와 실제 파일 존재 검증
- 9:16 프리뷰, 씬 타임라인, 전체 재생
- 준비되지 않은 씬 안내와 Export 차단
- 비동기 FFmpeg render job과 MP4 다운로드
- 프로젝트 삭제 시 이미지, 오디오, 렌더 파일 정리
- 블랙/다크 네이비 기반 편집기 테마
- backend 회귀 테스트 기반

## 8. 다음 작업 순서

### 1순위: 상태 안정성

1. 오래된 TTS 요청의 실패가 최신 `tts_hash`, 완료 상태, 오디오를 덮어쓰지 않도록 실패 업데이트에 hash 조건을 추가합니다.
2. 완료된 render job이 후속 프로젝트 갱신 실패로 `failed`로 역전되거나 출력 MP4가 삭제되지 않도록 terminal 상태를 보호합니다.
3. 위 두 경합 조건의 회귀 테스트를 추가합니다.

### 2순위: 편집기 UX와 접근성

1. 좌우 패널 접기/전환과 반응형 편집기 레이아웃을 구현합니다.
2. 좁은 화면에서 툴바 버튼이 잘리지 않도록 액션 그룹과 overflow 메뉴를 구성합니다.
3. `저장됨` 표시를 씬 설정, 이미지, TTS, 정렬 상태와 구분합니다.
4. 빈 대본 씬이 있을 때 전체 TTS 실행 조건과 안내를 개선합니다.
5. 설정 label 연결과 키보드 이미지 업로드를 지원합니다.

### 3순위: 운영과 후속 편집 기능

1. production CORS에서 localhost origin을 제외합니다.
2. 다크 테마의 범용 Tailwind `!important` override를 의미 기반 토큰으로 전환합니다.
3. Render API, CORS, 핵심 Frontend 흐름의 테스트를 확장합니다.
4. TTS 재시도/진행률, 이미지 크롭·팬·줌, 정밀 재생, 단축키, 씬 복제, 일괄 스타일, Undo/Redo를 구현합니다.

## 9. 주요 코드 위치

| 영역 | 경로 |
| --- | --- |
| 앱 화면 조합 | `frontend/src/App.tsx` |
| 편집 워크스페이스 | `frontend/src/components/EditorWorkspace.tsx` |
| 타임라인 | `frontend/src/components/SceneTimeline.tsx` |
| 씬 설정 | `frontend/src/components/PanelSettings.tsx` |
| Frontend 상태 | `frontend/src/store/slices/` |
| 프로젝트 API | `backend/src/routes/projects.js` |
| 씬/이미지/TTS API | `backend/src/routes/panels.js` |
| Gemini TTS | `backend/src/services/ttsService.js` |
| FFmpeg 렌더 | `backend/src/services/renderService.js` |
| DB migrations | `backend/migrations/` |
| 회귀 테스트 | `backend/test/api-regression.test.js` |

## 10. 문서 읽는 순서

1. `README.md`: 제품 개요, 실행 방법, 전체 상태
2. `HANDOFF.md`: 다른 PC 인수인계와 다음 작업
3. `work-log.md`: 실제 작업 이력과 결정
4. `IMPLEMENTATION_PLAN.md`: 단계별 개선 계획
5. `TESTING.md`: 자동/수동 확인 절차
6. `설계서.md`, `UX_UI_기능설명서.md`: 상세 설계와 UX 기준

과거 설계 문서의 OpenAI 관련 내용은 당시 이력일 수 있습니다. 현재 TTS 기준은 Gemini `gemini-2.5-flash-preview-tts`이며, 현재 상태 판단은 `README.md`, `HANDOFF.md`, 최신 `work-log.md` 순으로 우선합니다.

## 11. 작업 종료 시 인수인계 체크리스트

- [ ] 작업 브랜치와 commit을 원격에 push
- [ ] 변경한 코드와 이유를 `work-log.md` 최신 항목에 기록
- [ ] 새 환경변수가 있으면 `.env.example`과 문서 갱신
- [ ] DB migration이 있으면 migration 파일과 실행 순서 기록
- [ ] Git에 포함되지 않는 로컬 데이터 이전 필요 여부 기록
- [ ] 남은 이슈와 다음 시작 위치 기록
- [ ] 사용자 승인 없이 비밀키, DB, uploads를 커밋하지 않음

## AI / Developer Structured Handoff

### Repository

- URL: `https://github.com/himangga01/short-video-service.git`
- Source of truth: `main`
- Runtime units: `backend` and `frontend`
- Persistence: local SQLite plus local media filesystem

### Bootstrap

1. Clone and update `main`.
2. Create `backend/.env` from `.env.example` and set `GEMINI_API_KEY`.
3. Create `frontend/.env` with `VITE_API_URL=http://127.0.0.1:3001`.
4. Run `npm ci` in both packages.
5. Run backend migrations.
6. Start backend on port 3001 and frontend on port 5173.

### Non-Git State

- Secrets: `backend/.env`, `frontend/.env`
- Database: `backend/data/ssulmaker.db`
- Media: `backend/uploads/{images,audio,renders}`
- Copy the database and media together only when the previous local content must be preserved.

### Immediate Fix Targets

1. `ttsService.js`: stale failure must only mutate a panel when its active hash still matches.
2. `renderService.js`: a completed job and published output must remain terminal after bookkeeping failures.
3. Frontend shell: responsive panels and toolbar.
4. Frontend operation state: distinguish settings save from media/TTS/reorder states.
5. Accessibility: associated labels and keyboard-accessible file upload.

### Canonical Documents

- Current state: `README.md`
- Cross-PC handoff: `HANDOFF.md`
- Chronological decisions: `work-log.md`
- Planned phases: `IMPLEMENTATION_PLAN.md`
- Verification procedures: `TESTING.md`
