# SSUL MAKER Work Log

이 파일은 앞으로 프로젝트에서 수행한 작업을 시간순으로 기록합니다. 코드 변경, 문서 변경, 설계 결정, 검증 결과, 남은 이슈를 간단히 남겨 다음 작업자가 맥락을 빠르게 이어받을 수 있게 합니다.

## 기록 규칙

- 새 작업을 시작하거나 마무리할 때 이 파일에 기록합니다.
- 변경한 파일, 작업 이유, 검증 결과, 남은 이슈를 적습니다.
- 실패한 명령도 원인과 함께 남깁니다.
- 기록은 최신 항목이 위로 오도록 작성합니다.

## 2026-08-21

### 다른 PC 작업 인수인계 문서 재정비

작업 내용:

- `HANDOFF.md`를 추가해 저장소 clone, 환경변수, 의존성 설치, migration, 개발 서버 실행, 기존 SQLite/미디어 이전, 다음 작업 순서를 한 문서에 정리했습니다.
- `로컬개발환경_설정가이드.md`에 남아 있던 React 18, Tailwind 3, 미사용 라이브러리와 예전 API 주소 예시를 제거하고 실제 package/env/API 구성 기준으로 전면 갱신했습니다.
- `README.md`에 다른 PC 시작 절차와 `HANDOFF.md`, 최신 로컬 개발환경 가이드 링크를 추가했습니다.
- `backend/.env`, `frontend/.env`, `backend/data`, `backend/uploads`가 Git clone으로 복원되지 않는다는 점과 기존 작업 데이터를 별도 이전하는 절차를 명시했습니다.
- 다른 PC의 `node_modules`를 복사하지 않고 두 package의 lockfile을 기준으로 각각 `npm ci`를 실행하도록 정리했습니다.
- 현재 우선 작업인 stale TTS 실패 경합, render terminal 상태, 반응형 편집기, 저장 상태, bulk TTS, 접근성 문제를 인수인계 문서에 기록했습니다.
- 문서 변경은 `docs/cross-pc-handoff` 브랜치에서 작성한 뒤 `main`에 반영하는 흐름으로 진행했습니다.

검증:

- 현재 `package.json`, `.env.example`, API base URL, SQLite/upload 경로와 문서 내용을 대조했습니다.
- 사용자 지침에 따라 테스트, lint, build는 실행하지 않았습니다.

AI / Developer Notes:

- Added canonical cross-machine handoff: `HANDOFF.md`.
- Replaced stale local setup examples with the current React 19, Vite 7, Tailwind 4, Express 5, SQLite, Gemini TTS, and FFmpeg setup.
- Explicitly documented non-Git state: secrets, SQLite DB, and generated media.
- Source of truth remains the remote `main` branch.

### main 브랜치 통합 및 기본 브랜치 전환

작업 내용:

- `docs/project-baseline`의 전체 기준선 커밋을 기반으로 로컬/원격 `main` 브랜치를 생성했습니다.
- GitHub `himangga01/short-video-service`의 기본 브랜치를 `docs/project-baseline`에서 `main`으로 변경했습니다.
- 기존 `docs/project-baseline` 브랜치는 삭제 요청이 없어 보존했습니다.

검증:

- 사용자 요청 범위에 따라 Git 브랜치, 원격 commit, GitHub 기본 브랜치만 확인했습니다.
- 테스트, lint, build는 실행하지 않았습니다.

AI / Developer Notes:

- Integration result: all baseline commits are present on `main`.
- Default branch: `main`.
- Source branch retained: `docs/project-baseline`.

### 전체 작업 이력 통합 및 Git 기준선 정리

지금까지 완료한 작업:

- 프로젝트/씬 CRUD와 검색, 페이지네이션, 입력 검증, 씬 순서 변경 API를 구현했습니다.
- 영상 편집 흐름을 `대본 -> 씬 -> 이미지 -> Gemini TTS -> 프리뷰/재생 -> MP4 Export`로 재정의하고 관련 설계·로드맵·기술 문서를 정리했습니다.
- 이미지 업로드, Sharp 기반 WebP 변환, 이미지 교체/삭제, 공통 업로드 경로 관리를 구현했습니다.
- Gemini `gemini-2.5-flash-preview-tts` 호출, PCM-to-MP3 변환, 음성 메타데이터 저장, timeout, TTS hash와 오래된 성공 결과 방어를 구현했습니다.
- 씬별 이미지/TTS/렌더 준비 상태와 실제 로컬 파일 존재 여부를 기준으로 Export 가능 상태를 계산하도록 보강했습니다.
- FFmpeg 기반 씬 렌더와 비동기 render job 생성, polling 진행률, MP4 결과 제공을 구현했습니다.
- 프로젝트 삭제 시 이미지, 오디오, 렌더 결과를 정리하고 진행 중 render job을 중단하는 흐름을 추가했습니다.
- React 편집기 워크스페이스, 9:16 미리보기, 씬 타임라인, 전체 재생, 대본 가져오기, 제작 준비도 패널, Export 차단 안내를 구현했습니다.
- Tailwind CSS 4 설정을 바로잡고 블랙/다크 네이비 기반의 전문 편집 프로그램 테마를 적용했습니다.
- Node 내장 테스트 러너와 fake Gemini 서버를 이용한 백엔드 회귀 테스트 기반을 추가했습니다.
- 백엔드, 프론트 상태관리, UX/접근성, QA/운영 관점의 병렬 리뷰를 2회 수행하고 메인 세션에서 지적을 재검증했습니다.

이번 문서/Git 작업:

- `README.md`를 현재 구현 상태, 로컬 실행 방법, 환경변수, API, 남은 작업, AI/개발자용 구조화 요약 기준으로 전면 갱신했습니다.
- 이 로그에 지금까지의 구현 내역과 남은 작업을 통합 기록했습니다.
- `.env`, 로컬 DB, uploads, `node_modules`, build 결과, 로그가 `.gitignore`로 제외되는 것을 확인했습니다.
- 아직 커밋이 없는 `master`에서 게시용 `docs/project-baseline` 브랜치를 생성했습니다.
- GitHub `https://github.com/himangga01/short-video-service.git`을 `origin`으로 연결하고 `docs/project-baseline` 브랜치를 push했습니다.

### 남은 작업

우선 처리할 안정성 작업:

- 오래된 TTS 요청이 실패했을 때 최신 `tts_hash`, 완료 상태, 오디오를 덮어쓰지 않도록 실패 업데이트에 현재 hash 조건을 적용합니다.
- render job을 `completed`로 저장한 뒤 프로젝트 상태 갱신이 실패해도 job이 `failed`로 역전되거나 출력 MP4가 삭제되지 않도록 terminal 상태를 보호합니다.
- 위 두 상태 전이에 대한 백엔드 회귀 테스트를 추가합니다.

편집기 UX와 접근성 작업:

- 좁은 화면에서 좌우 패널과 중앙 작업대가 과도하게 압축되지 않도록 패널 접기/전환과 반응형 레이아웃을 구현합니다.
- 한 줄 툴바를 액션 그룹과 overflow 메뉴 구조로 변경합니다.
- 전역 `저장됨` 표시를 씬 설정 저장, 이미지, TTS, 정렬 등 작업별 상태와 구분합니다.
- 빈 대본 씬이 있을 때 전체 TTS 버튼 조건과 안내를 개선합니다.
- 설정 label과 입력 요소를 프로그램적으로 연결하고 이미지 업로드를 키보드로 실행할 수 있게 합니다.
- 우측 설정 영역을 대본, 음성, 비주얼, 자막 단위로 구조화합니다.

운영·테스트·후속 기능:

- production에서는 localhost CORS origin을 제외하도록 환경별 허용 목록을 분리합니다.
- 범용 Tailwind class를 `!important`로 덮어쓰는 다크 테마를 의미 기반 토큰/컴포넌트 스타일로 점진 전환합니다.
- Render API, CORS, 핵심 Frontend 편집 흐름의 자동화 테스트를 추가합니다.
- TTS 일괄 진행률/재시도, 이미지 크롭·팬·줌, 정밀 재생 헤드, 단축키, 씬 복제, 일괄 스타일, Undo/Redo를 후속 구현합니다.

검증:

- 이번 요청에서는 사용자 지침에 따라 별도 테스트, lint, build를 실행하지 않았습니다.
- Git 포함/제외 대상과 현재 브랜치/remote 상태만 확인했습니다.

AI / Developer Notes:

- Completed baseline: project/scene CRUD, media upload lifecycle, Gemini TTS, readiness validation, preview/playback, async FFmpeg render, cleanup, dark editor shell, and backend regression-test harness.
- Immediate fixes: hash-guard stale TTS failures and preserve terminal render-job state.
- UX priorities: responsive shell/toolbar, operation-specific status, valid bulk-TTS preconditions, and accessible form/file-upload controls.
- Git branch: `docs/project-baseline`; remote: `origin/docs/project-baseline`.

## 2026-05-10

### 백엔드 회귀 테스트 추가 및 테스트 격리 보강

작업 내용:
- `backend/test/api-regression.test.js`를 추가해 Node 내장 `node:test` 기반 백엔드 회귀 테스트를 구성했습니다.
- `backend/package.json`에 `npm test` 스크립트를 추가했습니다.
- 테스트가 실제 Gemini API를 호출하지 않도록 fake Gemini HTTP 서버를 사용해 TTS 성공/지연/timeout 흐름을 재현하게 했습니다.
- 이미지 업로드 성공, 잘못된 패널 설정 400, 진행 중 TTS stale completion 방지, Gemini timeout 실패 상태 저장을 자동 검증합니다.
- `backend/knexfile.js`가 `DATABASE_PATH` 환경변수를 실제로 반영하도록 수정했습니다.
- `backend/src/paths.js`가 `UPLOAD_DIR` 환경변수를 실제로 반영하도록 수정했습니다.
- 테스트는 임시 SQLite DB와 임시 uploads 디렉터리를 만들어 사용하고 종료 시 삭제합니다.
- 예상 가능한 Gemini timeout은 서버 로그에서 error가 아니라 입력/업스트림 오류 레벨로 남도록 조정했습니다.

검증:
- `backend npm test` 성공: 3개 테스트 통과
- 백엔드 전체 `backend/src/**/*.js` 문법 검사 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건

남은 이슈:
- 현재 테스트는 백엔드 API와 TTS 서비스의 핵심 회귀를 우선 커버합니다. 렌더 job 취소/정리와 프로젝트 삭제 미디어 cleanup도 별도 테스트로 확장하면 더 안전합니다.

AI Notes:
- Test runner: Node built-in `node --test`.
- Tests isolate DB/uploads via `DATABASE_PATH` and `UPLOAD_DIR` temp paths.
- Fake Gemini server avoids external network and API cost.

### 코드 리뷰 버그 수정: 이미지 업로드, 패널 검증, TTS 경합/타임아웃

작업 내용:
- `backend/src/routes/panels.js` 이미지 업로드 라우트에 잘못 들어간 `settingsError` 참조를 제거해 정상 multipart 업로드가 500으로 실패하지 않도록 수정했습니다.
- `backend/src/routes/panels.js` 패널 수정 API에서 설정 검증 실패 시 즉시 400을 반환하도록 보강했습니다.
- `backend/src/services/ttsService.js`에서 Gemini TTS 완료 직전에 현재 패널의 `tts_hash`를 다시 확인하고, 대본/음성/속도/지시문이 바뀐 오래된 TTS 결과는 MP3를 삭제한 뒤 DB에 완료 처리하지 않도록 수정했습니다.
- Gemini TTS `fetch` 호출에 `AbortController` 기반 timeout을 추가하고, `GEMINI_TTS_TIMEOUT_MS` 환경변수를 `.env.example`에 추가했습니다.

검증:
- `node -c backend/src/services/ttsService.js`, `backend/src/routes/panels.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건
- API 스모크 테스트 성공: 잘못된 패널 수정 `400`, 정상 이미지 업로드 `200`, 이미지 파일 생성 확인
- Fake Gemini 스모크 테스트 성공: 진행 중 TTS 도중 대본 변경 시 최종 상태 `idle`, `audio_url=null`, `tts_hash=null`, 고아 MP3 0개 확인
- Fake Gemini timeout 스모크 테스트 성공: timeout 시 `504`, DB `tts_status=failed` 저장 확인

남은 이슈:
- timeout은 현재 HTTP 요청 안에서 실패 상태를 저장하는 방식입니다. 일괄 TTS가 길어지면 별도 job queue로 분리하는 편이 사용자 경험과 서버 안정성에 더 좋습니다.

AI Notes:
- Fixed review findings P1/P2 around image upload regression, update validation, stale in-flight TTS completion, and Gemini timeout.
- Stale TTS completion is guarded with a conditional `tts_hash` check and output file cleanup.

### TTS provider를 Gemini TTS로 변경

작업 내용:
- `backend/src/services/ttsService.js`를 OpenAI Speech API 호출 방식에서 Gemini API `gemini-2.5-flash-preview-tts` REST 호출 방식으로 교체했습니다.
- Gemini TTS가 반환하는 24kHz PCM 오디오를 FFmpeg로 mp3로 변환해 기존 오디오 저장, 미리듣기, 렌더 파이프라인과 호환되도록 했습니다.
- TTS hash에 provider를 포함해 OpenAI 시절 캐시와 Gemini 캐시가 섞이지 않도록 했습니다.
- `GEMINI_API_KEY`, `GEMINI_TTS_MODEL`, `TTS_DEFAULT_VOICE` 환경변수 기준으로 `.env.example`을 갱신했습니다.
- Gemini prebuilt voice 30종을 백엔드 검증과 프론트 음성 선택 UI에 반영하고, 기본 음성을 `Kore`로 변경했습니다.
- 더 이상 사용하지 않는 `openai` npm 의존성을 제거했습니다.
- README, 테스트 문서, 설계서, 기술스택 명세서, 구현 로드맵의 현재 TTS 기준을 Gemini TTS로 갱신했습니다.

검증:
- `node -c backend/src/services/ttsService.js`, `backend/src/routes/panels.js`, `backend/src/services/renderService.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm run migrate` 성공: `Already up to date`
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건
- API 스모크 테스트 성공: OpenAI voice `alloy` 요청 400, Gemini voice `Puck` 패널 생성 성공, `GEMINI_API_KEY` 미설정 시 TTS 요청 503 및 DB `tts_status=failed`, `tts_model=gemini-2.5-flash-preview-tts` 저장 확인
- 실제 Gemini TTS 생성은 유효한 `GEMINI_API_KEY`가 있는 환경에서 추가 확인 필요

남은 이슈:
- Gemini TTS의 `speed`는 OpenAI처럼 숫자 파라미터가 아니라 자연어 prompt의 pacing 지시로 반영합니다. 실제 음성 속도 품질은 키가 있는 환경에서 샘플별 청감 QA가 필요합니다.

AI Notes:
- Provider: Gemini API TTS, model `gemini-2.5-flash-preview-tts`.
- Output flow: Gemini PCM base64 -> temp `.pcm` -> FFmpeg mp3 -> `uploads/audio`.
- Env: `GEMINI_API_KEY`, `GEMINI_TTS_MODEL`, `TTS_DEFAULT_VOICE`.

### 렌더 삭제 경합, Export 준비 조건, 패널 설정 검증 보강

작업 내용:
- `backend/src/services/renderService.js`에서 프로젝트 삭제 중인 백그라운드 렌더 작업이 완료 상태로 덮어쓰지 못하도록 active job 확인과 조건부 완료 업데이트를 추가했습니다.
- 렌더 중 프로젝트가 삭제되면 pending/processing job을 실패 처리하고, 렌더 작업 내부에서도 project/job 존재 여부를 재확인해 생성된 MP4가 고아 파일로 남지 않도록 출력물을 정리합니다.
- `backend/src/services/renderService.js`에서 Export 시작 전에 모든 패널의 `render_ready`, 이미지/TTS 상태, TTS hash, 실제 업로드 파일 존재 여부를 확인하도록 막았습니다.
- `frontend/src/components/EditorWorkspace.tsx`와 `frontend/src/components/EditorToolbar.tsx`에서 모든 씬이 렌더 준비 상태일 때만 Export 버튼이 활성화되도록 변경하고, 비활성 사유를 title과 에러 상태에 표시했습니다.
- `backend/src/routes/panels.js`에 `voice_id`, `voice_speed`, `text_size`, 색상 hex, 자막 위치, 전환 타입, 전환 시간, order index, TTS 지시문 검증을 추가해 잘못된 API 입력이 렌더러까지 전달되지 않도록 했습니다.
- `backend/src/routes/projects.js`에서 프로젝트 삭제 전에 진행 중인 렌더 job을 취소/실패 처리하도록 연결했습니다.

검증:
- `node -c backend/src/services/renderService.js`, `backend/src/routes/panels.js`, `backend/src/routes/projects.js` 성공
- 백엔드 전체 `backend/src/**/*.js` 문법 검사 성공
- `backend npm run migrate` 성공: `Already up to date`
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건
- API 스모크 테스트 성공: 잘못된 패널 설정 400, 준비되지 않은 프로젝트 Export 400, 준비된 렌더 202, 렌더 직후 프로젝트 삭제 시 고아 MP4 0개, render job cascade 삭제 확인

남은 이슈:
- 백그라운드 렌더 취소는 현재 같은 Node 프로세스 안에서 cooperative cancellation 방식으로 동작합니다. 운영 규모가 커지면 BullMQ/Redis 같은 외부 job runner로 분리하는 편이 더 안전합니다.

AI Notes:
- Scope: fix review findings P2/P3 for render cancellation, render readiness gating, and server-side panel setting validation.
- Render completion now uses an active-status conditional update so a cancelled job cannot be overwritten as completed.
- Export readiness is enforced in both frontend and backend.

## 2026-05-06

### 코드 리뷰 버그 수정

작업 내용:
- `backend/src/routes/panels.js`에서 일반 패널 생성/수정 API가 `image_url`, `audio_url`, 상태 필드를 직접 받지 못하도록 차단했습니다.
- 대본, 음성, 속도, TTS 지시문이 바뀌면 기존 TTS 오디오 파일과 DB 메타데이터를 무효화하고 `render_ready=false`, `tts_status=idle`로 내려가도록 수정했습니다.
- `render_ready` 계산을 문자열 존재 여부가 아니라 이미지/TTS 상태와 실제 업로드 파일 존재 여부 기준으로 보강했습니다.
- `backend/src/services/ttsService.js`에서 TTS 실패 시 오래된 오디오 URL/파일이 남지 않도록 정리하고, 렌더 준비 상태도 실제 파일 기준으로 갱신하도록 수정했습니다.
- `backend/src/services/renderService.js`와 `backend/src/routes/render.js`를 수정해 렌더 요청은 `202 + job`을 즉시 반환하고 실제 FFmpeg 렌더는 백그라운드에서 진행되도록 변경했습니다.
- `frontend/src/components/EditorWorkspace.tsx`에서 렌더 job polling을 추가해 완료/실패 상태와 다운로드 링크를 갱신하도록 했습니다.
- `backend/src/routes/projects.js`에서 프로젝트 삭제 시 패널 이미지, TTS 오디오, 렌더 MP4 파일을 함께 삭제하도록 정리 로직을 추가했습니다.
- `frontend/src/components/SceneTimeline.tsx`와 `EditorWorkspace.tsx`에서 타임라인 정렬 실패 시 로컬 순서를 rollback하도록 수정했습니다.
- `frontend/src/types/index.ts`에서 일반 패널 DTO의 직접 미디어 URL/상태 필드를 제거했습니다.

검증:
- 임시 HTTP 서버로 미디어 필드 직접 생성/수정 요청이 400으로 차단되는지 확인했습니다.
- 임시 HTTP 서버로 대본 변경 시 기존 `audio_url`, `tts_hash`, 오디오 메타데이터가 제거되고 `render_ready=false`가 되는지 확인했습니다.
- 임시 HTTP 서버로 render API가 202를 반환한 뒤 job polling으로 completed 상태가 되는지 확인했습니다.
- 임시 HTTP 서버로 프로젝트 삭제 시 연결된 이미지/오디오/렌더 파일이 파일시스템에서 삭제되는지 확인했습니다.
- `backend npm run migrate` 성공: `Already up to date`
- 백엔드 전체 `node -c` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건

남은 이슈:
- 렌더 백그라운드 작업은 현재 같은 Node 프로세스의 `setImmediate` 기반입니다. 운영 환경에서는 BullMQ/Redis 같은 별도 큐로 분리하는 것이 안전합니다.
- reorder 실패 rollback은 적용됐지만 사용자 toast/알림 UI는 아직 없습니다.

AI Notes:
- Fixed review findings P1-P2: stale TTS invalidation, media field hardening, async render job response, project media cleanup, reorder rollback.
- Render POST now returns `202 Accepted` with an initial job; frontend polls `GET /api/render/jobs/:jobId`.
- `render_ready` now depends on media status plus local file existence.

### Phase G 제작 편의 UX 및 마무리 품질 보강

작업 내용:
- `frontend/src/components/ScriptImportModal.tsx`를 추가해 긴 대본을 붙여넣고 씬으로 자동 분할해 추가할 수 있게 했습니다.
- `frontend/src/components/EditorToolbar.tsx`에 `대본 붙여넣기` 버튼을 추가했습니다.
- `frontend/src/components/EditorWorkspace.tsx`에서 대본 분할 결과를 순차적으로 패널 생성 API에 연결하고, 첫 생성 씬을 자동 선택하도록 했습니다.
- `frontend/src/components/PanelSettings.tsx`에 선택 씬 대본 편집 textarea를 추가해 워크스페이스 구조에서도 대본을 직접 수정할 수 있게 했습니다.
- `frontend/src/components/PanelSettings.tsx`에 자막 위치 선택 UI를 추가해 프리뷰와 렌더에 반영되는 위치 값을 설정할 수 있게 했습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- 임시 HTTP 서버에서 패널 대본 수정과 `subtitle_position` 수정이 API 응답에 정상 반영되는지 확인했습니다.

남은 이슈:
- 대본 자동 분할은 문단/문장 기반의 기본 규칙입니다. 실제 썰 영상 품질을 위해서는 목표 길이, 호흡, 반전 포인트 기준의 AI 분할 기능을 추가하면 좋습니다.
- 대량 생성 중 취소/진행률 UI는 아직 없습니다.

AI Notes:
- Phase G scope: authoring convenience, script editing recovery, bulk scene creation.
- Script splitting prefers blank-line paragraphs, then falls back to punctuation-based sentence chunks.

### Phase F MP4 렌더/export 구현 및 리뷰 보강

작업 내용:
- 로컬 PATH에 FFmpeg가 없어도 export가 동작하도록 `backend`에 `ffmpeg-static` 의존성을 추가했습니다.
- `backend/src/services/renderService.js`를 추가해 프로젝트 씬을 1080x1920 MP4로 렌더링하도록 구현했습니다.
- 각 씬은 `sharp`로 배경/이미지/자막을 하나의 프레임 이미지로 합성하고, FFmpeg로 무음 또는 TTS 오디오가 포함된 씬 MP4를 만든 뒤 concat으로 최종 MP4를 생성합니다.
- `backend/src/routes/render.js`와 `app.js` 라우팅을 추가해 `POST /api/render/project/:projectId`, `GET /api/render/jobs/:jobId`를 제공했습니다.
- `render_jobs` 테이블에 `pending -> processing -> completed/failed`, 진행률, output URL, 오류 메시지를 저장하도록 했습니다.
- `frontend/src/api/render.ts`, `frontend/src/components/EditorToolbar.tsx`, `frontend/src/components/EditorWorkspace.tsx`에 Export 버튼, 렌더 진행 상태, MP4 다운로드 링크를 연결했습니다.

검증:
- `backend node -c src/services/renderService.js`, `src/routes/render.js`, `src/app.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 성공: 취약점 0건
- 임시 HTTP 서버에서 이미지/오디오가 없는 기본 씬을 배경+자막+무음 MP4로 실제 렌더링하고, `/uploads/renders/...mp4` 정적 파일 조회까지 확인했습니다.

남은 이슈:
- 현재 렌더 API는 요청 안에서 동기적으로 완료까지 기다리는 MVP 구조입니다. 긴 프로젝트에서는 백그라운드 큐와 polling/Socket 진행률로 분리하는 것이 좋습니다.
- 프로젝트 삭제 시 과거 렌더 산출물 파일까지 자동 삭제하는 정리 작업은 아직 없습니다.
- 자막 스타일은 기본 박스형 오버레이이며, 폰트 선택/자막 애니메이션/씬 전환 효과는 후속 개선 대상입니다.

AI Notes:
- Render stack: Sharp scene compositor + ffmpeg-static H.264/AAC MP4.
- Fallback behavior: no image means solid background; no audio means silent AAC track.
- Output path: `/uploads/renders/*.mp4`; job state persisted in `render_jobs`.

### Phase E 전체 재생/프리뷰 타임라인 고도화

작업 내용:
- `frontend/src/components/EditorWorkspace.tsx`의 전체 재생을 단순 타이머 기반에서 실제 오디오 기반 재생으로 개선했습니다.
- 씬에 `audio_url`이 있으면 브라우저 `Audio` 객체로 MP3를 재생하고, `timeupdate` 이벤트로 전체 playhead 진행률을 갱신하도록 했습니다.
- 오디오가 없거나 재생 실패가 발생하면 기존 fallback 씬 길이로 자동 진행하도록 유지했습니다.
- 오디오 종료 시 DB에 저장된 길이보다 브라우저가 읽은 실제 duration을 우선 사용해 다음 씬 진행 누적 시간이 어긋나지 않게 보강했습니다.
- 재생 중지 시 타이머와 오디오 이벤트 핸들러를 모두 정리해 중복 재생/메모리 누수를 줄였습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공

남은 이슈:
- 실제 브라우저에서 오디오 자동 재생 정책, 네트워크 지연, 긴 프로젝트 재생 안정성은 추가 수동 QA가 필요합니다.
- 현재는 한 씬 단위 이어 재생이며, 파형/스크러빙/구간 점프는 후속 고도화 대상입니다.

AI Notes:
- Playback mode: audio-first with timer fallback.
- Uses `mediaUrl()` so backend-hosted uploaded MP3 files work in Vite dev mode.

### Phase D TTS 생성 파이프라인 구현 및 리뷰 보강

작업 내용:
- OpenAI 공식 Speech API 기준으로 백엔드 TTS 생성 서비스를 구현했습니다.
- `backend/src/services/ttsService.js`를 추가해 단일 패널 TTS 생성, 프로젝트 전체 TTS 생성, 입력 해시 기반 재사용, 실패 상태 저장, 오디오 길이/파일 크기 저장을 처리하도록 했습니다.
- `backend/src/routes/panels.js`에 `POST /api/panels/:id/tts`, `POST /api/panels/project/:projectId/tts` API를 추가했습니다.
- TTS 결과 MP3는 `backend/uploads/audio`에 저장하고 `audio_url`, `tts_status`, `tts_model`, `tts_hash`, `tts_error`, `audio_duration_ms`, `audio_file_size`를 DB에 반영하도록 했습니다.
- `frontend/src/api/panels.ts`, `frontend/src/store/slices/panelsSlice.ts`, `frontend/src/components/PanelSettings.tsx`, `frontend/src/components/EditorToolbar.tsx`에 단일 씬/전체 씬 TTS 생성 UI를 연결했습니다.
- `frontend/src/api/media.ts`를 추가해 `/uploads/...` 상대 경로를 백엔드 미디어 URL로 변환하도록 했습니다.
- TTS voice 타입과 UI 옵션을 OpenAI 내장 voice 목록에 맞춰 확장했습니다.
- `.gitignore`와 `backend/.env.example`을 추가해 `.env`, SQLite DB, 업로드 파일, 빌드 산출물, `node_modules`가 실수로 커밋되지 않도록 했습니다.

검증:
- `backend node -c src/routes/panels.js`, `src/services/ttsService.js`, `src/app.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend npm audit --audit-level=moderate` 최초 실패 후 `npm audit fix` 적용, 재검증 시 취약점 0건
- 임시 HTTP 서버에서 `OPENAI_API_KEY`가 없는 상태의 단일 TTS 요청 503 응답, DB `tts_status=failed`, 오류 메시지 저장을 확인했습니다.
- 임시 HTTP 서버에서 프로젝트 전체 TTS 요청이 부분 실패 상태 `207`과 실패 패널 상태를 반환하는지 확인했습니다.

남은 이슈:
- 실제 음성 생성은 `OPENAI_API_KEY`가 설정된 환경에서 추가 실검증이 필요합니다.
- 장시간/대량 TTS는 현재 순차 처리이며, 운영 규모에서는 큐/재시도/취소 기능을 분리하는 것이 좋습니다.

AI Notes:
- TTS provider: OpenAI Speech API, default `gpt-4o-mini-tts`, MP3 output, instructions supported.
- Cache key: script + model + voice + speed + instructions SHA-256.
- Missing API key is treated as a recoverable 503 and persists failed state to the panel.

### Phase C 이미지 업로드/삭제 구현 및 리뷰 보강

작업 내용:
- `backend/src/routes/panels.js`에 패널 이미지 업로드/삭제 API를 추가했습니다.
- 업로드 이미지는 `sharp`로 WebP 변환, EXIF 회전 보정, 1080x1920 내부 리사이즈를 적용해 `backend/uploads/images`에 저장하도록 했습니다.
- `backend/src/paths.js`를 추가해 업로드 루트/이미지/오디오/렌더 경로를 공통 관리하도록 정리했습니다.
- `backend/src/app.js`의 정적 업로드 서빙 경로를 실행 위치에 덜 의존하도록 공통 업로드 루트로 변경했습니다.
- 잘못된 이미지 타입이나 손상된 이미지 업로드는 500이 아니라 400 응답으로 처리하도록 보강했습니다.
- `frontend/src/api/panels.ts`, `frontend/src/store/slices/panelsSlice.ts`, `frontend/src/components/PanelSettings.tsx`에 이미지 업로드/삭제 UI와 상태 처리를 연결했습니다.

검증:
- `backend npm run migrate` 성공: `Already up to date`
- `backend node -c src/app.js`, `src/routes/panels.js`, `src/paths.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- 임시 HTTP 서버로 이미지 업로드, 정적 파일 조회, 이미지 삭제, 잘못된 파일 타입 400 응답을 확인했습니다.

남은 이슈:
- 업로드 진행률 표시와 드래그 앤 드롭 업로드는 아직 없습니다.
- 이미지 크롭/팬/줌 같은 영상 편집용 배치 컨트롤은 후속 UX 개선 대상입니다.

AI Notes:
- Phase C scope: panel image upload/delete, normalized local media path helpers, frontend upload state.
- Verification smoke: create project -> create panel -> reject invalid file as 400 -> upload PNG -> serve WebP -> delete image -> cleanup project.
- Reuse `backend/src/paths.js` for Phase D audio and Phase F render output.

### Phase B 영상 편집 중심 UX 재구성

작업 내용:
- `frontend/src/components/EditorWorkspace.tsx`를 추가해 영상 편집 흐름의 중심 화면을 구성했습니다.
- `frontend/src/components/EditorToolbar.tsx`를 추가해 프로젝트 제목, 씬 수, 총 길이, 씬 추가, 전체 재생, export 진입 버튼을 한곳에 모았습니다.
- `frontend/src/components/VideoPreviewCanvas.tsx`를 추가해 9:16 미리보기, 이미지/배경/자막 상태, 렌더 준비 상태를 보여주도록 했습니다.
- `frontend/src/components/SceneTimeline.tsx`를 추가해 하단 씬 타임라인, 드래그 정렬, 씬 상태 배지를 제공하도록 했습니다.
- `frontend/src/App.tsx`의 중앙 영역을 기존 텍스트 중심 패널 편집기에서 영상 편집 워크스페이스로 교체했습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공

남은 이슈:
- 현재 전체 재생은 TTS 오디오가 없을 때 타이머 기반으로 동작합니다.
- 실제 오디오 이어 재생, 재생 헤드 정밀 동기화, 키보드 단축키는 Phase E에서 보강합니다.

AI Notes:
- Phase B scope: editor shell, 9:16 preview, timeline, project-level playback skeleton.
- Keep old settings sidebar but shift core UX to preview/timeline/video workflow.

### Phase A-2 데이터 모델 및 상태 기반 확장

작업 내용:
- `backend/migrations/20260506090000_add_scene_status_fields.js`를 추가해 패널 이미지/TTS/렌더 준비 상태 필드를 확장했습니다.
- `render_jobs` 테이블을 추가해 이후 MP4 export 작업 상태를 저장할 기반을 만들었습니다.
- `frontend/src/types/index.ts`에 이미지 상태, TTS 상태, 오디오 메타데이터, 렌더 준비 상태, 자막 위치, 전환 타입, 렌더 작업 타입을 반영했습니다.
- `backend/src/routes/panels.js`와 `backend/src/routes/projects.js`에서 `render_ready`와 boolean 응답 정규화를 보강했습니다.

검증:
- `backend npm run migrate` 성공
- `backend node -c src/app.js`, `src/routes/projects.js`, `src/routes/panels.js` 성공
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- 임시 HTTP 서버로 패널 생성 시 `image_status`, `tts_status`, `render_ready` 기본값과 프로젝트 응답 boolean 정규화를 확인했습니다.

남은 이슈:
- 실제 이미지/TTS/렌더 생성 로직은 이 단계에서 붙이지 않았고, 후속 Phase C/D/F에서 구현합니다.

AI Notes:
- Phase A-2 scope: schema and API response readiness for media pipeline.
- `render_ready` is derived from script + image_url + audio_url.

## 2026-05-04

### 코드 리뷰 후 안정성 보강

작업 내용:
- `backend/src/app.js`가 import될 때 서버를 즉시 띄우던 구조를 `require.main === module` 조건으로 분리했습니다.
- `backend/src/app.js`에 `startServer()`를 추가해 실행 진입점과 테스트/검증용 app import를 분리했습니다.
- `backend/src/routes/projects.js`에서 프로젝트 목록 `total`이 현재 페이지 길이만 반환하던 문제를 전체 matching count로 수정했습니다.
- `backend/src/routes/projects.js`에서 빈 제목 생성/수정을 API 레벨에서 차단하도록 입력 검증을 추가했습니다.
- `backend/src/routes/panels.js`에서 빈 대본 생성/수정을 API 레벨에서 차단하도록 입력 검증을 추가했습니다.
- `backend/src/routes/panels.js`에서 reorder payload의 id, order_index, 중복 ID, 존재하지 않는 패널, 서로 다른 프로젝트 패널 혼합을 검증하도록 보강했습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend node -c src/app.js` 성공
- `backend node -c src/routes/projects.js` 성공
- `backend node -c src/routes/panels.js` 성공
- `backend npm run migrate` 성공: `Already up to date`
- 임시 HTTP 서버로 빈 프로젝트 제목 요청 400 확인
- 임시 HTTP 서버로 빈 패널 대본 요청 400 확인
- 임시 HTTP 서버로 잘못된 reorder 요청 400 확인
- 임시 HTTP 서버로 정상 reorder 후 패널 순서 변경 확인
- 임시 HTTP 서버로 프로젝트 삭제 후 연결 패널 0개 확인
- UTF-8 기준 코드 영역에서 깨진 한글 패턴 재검색 결과 없음

남은 이슈:
- 자동화된 테스트 프레임워크가 아직 없어 API 검증은 임시 Node 스크립트로 수행했습니다.
- 저장소 전체가 아직 untracked 상태라 파일별 diff 통계가 git 기준으로 잘 보이지 않습니다.

### Phase A 안정화 구현

작업 내용:
- `frontend/src/components/ProjectList.tsx`의 깨진 한글 문구를 정리하고 프로젝트 생성/검색/상태 표시 문구를 바로잡았습니다.
- `frontend/src/components/PanelEditor.tsx`의 패널 용어를 UI상 "씬" 중심으로 정리하고, 저장/취소/삭제/빈 상태 문구를 수정했습니다.
- `frontend/src/components/PanelSettings.tsx`의 깨진 문구를 수정하고 `any` 타입을 제거해 lint 오류를 해결했습니다.
- `frontend/src/components/Layout.tsx`, `projectsSlice.ts`, `panelsSlice.ts`의 깨진 주석/에러 문구를 정리했습니다.
- `backend/src/routes/panels.js`에서 `PUT /api/panels/reorder`가 `PUT /api/panels/:id`보다 먼저 매칭되도록 라우트 순서를 수정했습니다.
- `backend/src/routes/projects.js`, `backend/src/routes/panels.js`, `backend/src/app.js`의 깨진 로그/응답 문구를 정리했습니다.
- `backend`에서 `npm rebuild better-sqlite3`를 실행해 현재 Node 버전에 맞게 SQLite 네이티브 모듈을 재빌드했습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `backend node -c src/app.js` 성공
- `backend node -c src/routes/projects.js` 성공
- `backend node -c src/routes/panels.js` 성공
- `backend npm run migrate` 성공: `Already up to date`
- 임시 서버 실행 후 `GET /health` 200 확인
- 임시 서버 실행 후 `PUT /api/panels/reorder` 빈 body 요청이 `400 panels 배열이 필요합니다.`를 반환하는 것 확인

남은 이슈:
- UI 구조는 아직 기존 3컬럼 패널 편집기이며, 다음 단계에서 9:16 프리뷰와 씬 타임라인 중심으로 개편해야 합니다.
- TTS, 이미지 업로드, 전체 재생, FFmpeg export는 아직 구현 전입니다.

### 영상 편집기 중심 UX/구현 설계 문서 개정

작업 내용:
- `UX_UI_기능설명서.md`에 9:16 영상 프리뷰, 씬 타임라인, 우측 인스펙터 중심 UX 개정안을 추가했습니다.
- `설계서.md`에 모듈형 모놀리스 기준의 TTS, 이미지, 프리뷰, 타임라인, 렌더 구현 설계를 추가했습니다.
- `구현_로드맵.md`에 영상 편집 MVP 중심의 단계별 구현 순서를 추가했습니다.
- `기술스택_명세서.md`에 기능별 기술 선택 기준을 추가했습니다.
- `개선_필요사항_분석.md`에 영상 편집 UX/기능 설계 재검토 결과를 추가했습니다.
- `개발_로드맵_간소화.md`에 인증 제외 상태의 영상 편집 MVP 로드맵을 추가했습니다.
- `요구사항서.md`에 영상 편집 MVP 범위와 완료 기준을 추가했습니다.

설계 결정:
- MVP의 중심을 프로젝트/패널 CRUD에서 `대본 작성 -> 씬 분할 -> 이미지 적용 -> TTS 생성 -> 9:16 프리뷰 -> 전체 재생 -> mp4 export` 흐름으로 재정의했습니다.
- TTS는 프론트 직접 호출이 아니라 백엔드에서 OpenAI Speech API를 호출하고, mp3 파일을 저장한 뒤 DB에 연결하는 방식으로 설계했습니다.
- 초기 작업 상태 관리는 SQLite 상태 필드와 polling으로 시작하고, 일괄 TTS/렌더 안정화 후 Socket.io 또는 BullMQ/Redis로 확장하기로 했습니다.
- 렌더링은 1차 MVP에서 FFmpeg 기반 로컬 mp4 생성으로 진행합니다.

남은 이슈:
- 깨진 한글 UI 문구 수정이 필요합니다.
- `frontend npm run lint` 실패 원인인 `PanelSettings.tsx`의 `any` 타입을 정리해야 합니다.
- `backend npm run migrate`는 `better-sqlite3` Node 바이너리 버전 mismatch로 실패했으므로 `npm rebuild` 또는 `npm install`이 필요합니다.
- `PUT /api/panels/reorder` 라우트가 `PUT /api/panels/:id`보다 뒤에 있어 라우팅 충돌 가능성이 있습니다.

## 2026-05-10

### 전체 기능 구현 및 수정 계획 수립

작업 내용:
- `IMPLEMENTATION_PLAN.md`를 새로 작성해 SSUL MAKER의 남은 기능 구현과 UX 수정 범위를 Phase 0부터 Phase 7까지 재정리했습니다.
- 각 Phase마다 목표, 주요 작업, 완료 기준을 한국어로 먼저 작성하고, 뒤에 AI/개발자용 구조화 계획을 추가했습니다.
- 구현 원칙에 Phase 종료 후 코드 리뷰, 테스트 실행, `work-log.md` 기록을 포함했습니다.

설계 결정:
- 다음 작업은 Phase 0인 문서/문구/현재 상태 동기화부터 진행합니다.
- 이후 Phase 1에서 준비도 체크리스트, Export 불가 사유, 저장 상태처럼 사용자가 즉시 체감하는 UX 병목을 먼저 해결합니다.

검증:
- 문서 작성 작업이므로 코드 테스트는 실행하지 않았습니다.

### Phase 0 기준선 정리 및 Phase 1 핵심 UX 1차 구현

작업 내용:
- `README.md`, `TESTING.md`, `UX_UI_기능설명서.md`, `개발_로드맵_간소화.md`, `설계서.md`, `요구사항서.md`의 오래된 GPT/OpenAI 중심 표현을 현재 기준에 맞춰 Gemini TTS 또는 AI 대본 입력 표현으로 정리했습니다.
- `README.md`의 현재 개발 현황, 환경변수 안내, API 엔드포인트, 다음 단계 정보를 실제 코드 상태와 맞췄습니다.
- `frontend/src/components/ProjectReadinessPanel.tsx`를 추가해 씬 수, 이미지 준비, TTS 준비, Export 가능 여부를 한눈에 볼 수 있게 했습니다.
- 준비되지 않은 씬으로 바로 이동하는 CTA와 전체 TTS 생성 CTA를 추가했습니다.
- 빈 프로젝트/빈 씬 상태에서 `대본 붙여넣기`, `빈 씬 추가`로 바로 시작할 수 있는 starter CTA를 추가했습니다.
- `frontend/src/store/slices/panelsSlice.ts`에 `saving`, `saveError` 상태를 추가하고 `updatePanel` 저장 중/성공/실패 상태를 추적하도록 했습니다.
- `frontend/src/components/EditorToolbar.tsx`에 `저장 중`, `저장됨`, `저장 실패` 표시를 연결했습니다.
- `frontend/src/components/EditorWorkspace.tsx`에서 Export 불가 사유를 `대본`, `이미지`, `TTS` 누락 개수 기준으로 구체화했습니다.

설계 결정:
- PowerShell 출력에서 한글이 깨져 보이는 경우가 있어 실제 파일 검사는 Node UTF-8 기준으로 수행했습니다.
- `work-log.md`의 과거 OpenAI 언급은 당시 작업 기록이므로 삭제하지 않고, 현재 기준 문서와 새 로그에서 Gemini TTS 기준을 명확히 했습니다.
- Phase 2에서 타임라인 카드 썸네일, 프리뷰 안전영역, 우측 인스펙터 구조화, 반응형 패널을 이어서 진행합니다.

검증:
- `backend npm test` 성공: 3개 테스트 통과
- `frontend npm run lint` 성공
- `frontend npm run build` 성공

코드 리뷰:
- 준비도 계산은 프론트 UX 안내용이며, 최종 Export 가능 여부는 기존처럼 서버/DB의 `render_ready`를 기준으로 유지했습니다.
- 저장 상태는 우선 패널 설정 저장 요청 기준으로 연결했습니다. 이미지/TTS는 각자의 상태 필드로 계속 표시합니다.

### FE 미리보기 환경 점검 및 스타일/CORS 보강

작업 내용:
- 로컬 백엔드와 프론트 dev 서버를 실행하고 인앱 브라우저에서 `http://localhost:5173` 미리보기를 열었습니다.
- Tailwind CSS v4 환경에서 `frontend/src/index.css`가 v3 방식의 `@tailwind base/components/utilities`를 사용해 유틸리티 CSS가 충분히 생성되지 않는 문제를 확인했습니다.
- `frontend/src/index.css`를 Tailwind v4 방식인 `@import "tailwindcss";`로 수정했습니다.
- 인앱 브라우저 미리보기를 위해 `frontend/.env`의 `VITE_API_URL`을 `http://127.0.0.1:3001`로 맞췄습니다.
- 인앱 브라우저에서 `127.0.0.1:5173`과 `localhost:5173`을 번갈아 사용할 때 API CORS가 막히는 문제를 확인했습니다.
- `backend/src/app.js`에서 로컬 개발용 CORS origin으로 `http://localhost:5173`과 `http://127.0.0.1:5173`을 모두 허용하도록 보강했습니다.
- FE 검토용 샘플 프로젝트 `Preview UX Review`와 씬 3개, 샘플 이미지를 로컬 DB에 생성했습니다.

검증:
- `backend npm test` 성공: 3개 테스트 통과
- `frontend npm run lint` 성공
- `frontend npm run build` 성공

리뷰 메모:
- 현재 좁은 브라우저 폭에서는 좌측 프로젝트 목록과 우측 씬 설정 패널이 중앙 프리뷰 영역을 밀어내는 문제가 보입니다. Phase 2에서 좌우 패널 접기/반응형 레이아웃을 우선 처리해야 합니다.
- 우측 설정 패널이 긴 단일 스크롤이라 핵심 액션과 스타일 설정이 섞여 보입니다. Phase 2에서 탭 또는 섹션형 인스펙터 구조가 필요합니다.

### 전문 편집툴 스타일 블랙 테마 적용

작업 내용:
- `frontend/src/index.css`에 편집 프로그램 느낌의 다크 테마 토큰을 추가했습니다.
- 전체 앱 루트에 `editor-dark` 테마 클래스를 적용해 헤더, 좌측 프로젝트 목록, 중앙 작업대, 우측 인스펙터, 카드, 입력창, 버튼, 상태 배지를 블랙/다크 네이비 기반으로 보정했습니다.
- 주요 액션 버튼은 블루/시안/그린 계열의 편집툴식 포인트 컬러와 글로우를 사용하도록 조정했습니다.
- 스크롤바, 선택 영역, 입력 focus ring도 다크 테마에 맞춰 정리했습니다.

검증:
- `frontend npm run lint` 성공
- `frontend npm run build` 성공
- `http://localhost:5173` dev 서버 응답 200 확인

리뷰 메모:
- 이번 변경은 색상/무드 레이어 중심이며, Phase 2에서 패널 접기와 인스펙터 구조 개편을 진행하면 전문 편집툴 느낌이 더 강해질 예정입니다.
