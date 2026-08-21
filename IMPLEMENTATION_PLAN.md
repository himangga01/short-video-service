# SSUL MAKER 전체 기능 구현 및 수정 계획

## 1. 한국어 버전

### 1.1 목표

SSUL MAKER를 `대본 작성 -> 씬 분할 -> 이미지 적용 -> Gemini TTS 생성 -> 9:16 프리뷰 -> 전체 재생 -> MP4 Export` 흐름이 자연스럽게 이어지는 썰 영상 제작용 편집기로 완성한다.

이번 계획의 핵심은 단순 기능 추가가 아니라, 사용자가 현재 어떤 단계에 있고 무엇이 부족해서 Export가 안 되는지 명확하게 알 수 있는 UX와 안정적인 미디어 처리 파이프라인을 함께 만드는 것이다.

### 1.2 작업 원칙

- 각 Phase가 끝날 때마다 전체 코드 리뷰를 진행하고, 발견한 부족한 부분을 같은 Phase 안에서 수정한다.
- 각 Phase가 끝날 때마다 `frontend npm run lint`, `frontend npm run build`, `backend npm test`를 기본 검증으로 실행한다.
- API나 데이터 구조가 바뀌면 관련 테스트를 먼저 추가하거나 함께 수정한다.
- 작업 내역은 매번 `work-log.md`에 기록한다.
- 문서 변경 시 한국어 설명을 먼저 작성하고, 이후 AI/개발자가 빠르게 이해할 수 있는 구조화 섹션을 둔다.

### 1.3 Phase 0: 기준선 정리 및 문서 동기화

목표:
- 현재 구현 상태와 문서 상태를 일치시킨다.
- 오래된 외부 AI/TTS 설계 문구를 Gemini TTS 기준으로 정리한다.
- 깨진 한글 문자열, 오래된 기능 설명, 실제 코드와 맞지 않는 로드맵을 정리한다.

주요 작업:
- `구현_로드맵.md`, `설계서.md`, `기술스택_명세서.md`, `요구사항서.md`의 TTS/렌더/UX 항목을 현재 구현 기준으로 갱신한다.
- 프론트엔드 UI 문자열 전체를 점검해 깨진 한글 문구와 어색한 용어를 정리한다.
- 현재 완료된 기능과 남은 기능을 `IMPLEMENTATION_PLAN.md` 기준으로 재분류한다.

완료 기준:
- 문서와 실제 코드의 TTS 제공자가 모두 Gemini 기준으로 일치한다.
- 주요 UI 화면에서 깨진 한글 문구가 남아 있지 않다.
- 이후 Phase의 작업 범위가 중복 없이 정리되어 있다.

### 1.4 Phase 1: 핵심 UX 흐름 개선

목표:
- 사용자가 영상 제작 상태를 한눈에 이해하게 만든다.
- Export가 안 되는 이유를 버튼 비활성화가 아니라 작업 가능한 안내로 보여준다.

주요 작업:
- 프로젝트 상단에 제작 준비도 체크리스트를 추가한다.
- 체크리스트 항목은 `씬 수`, `이미지 준비`, `TTS 준비`, `렌더 가능 여부`로 구성한다.
- Export 버튼 주변에 미완료 사유와 바로 이동 가능한 액션을 표시한다.
- 빈 프로젝트/빈 씬 상태에 starter CTA를 추가한다.
- 저장 상태를 `저장됨`, `저장 중`, `저장 실패`로 실제 API 상태와 연결한다.

완료 기준:
- 사용자가 Export 실패 원인을 씬 단위로 확인할 수 있다.
- 준비되지 않은 씬을 클릭하면 해당 씬 설정으로 이동한다.
- 저장 실패가 조용히 묻히지 않고 화면에 표시된다.

### 1.5 Phase 2: 타임라인, 프리뷰, 인스펙터 재설계

목표:
- 현재의 폼 기반 편집기를 영상 편집기처럼 느껴지게 만든다.
- 타임라인과 프리뷰가 실제 작업 중심이 되도록 개선한다.

주요 작업:
- 타임라인 카드에 이미지 썸네일, TTS 상태, 길이, 실패 배지, 렌더 준비 배지를 추가한다.
- 타임라인 drag 실패 시 롤백/재조회 UX를 강화한다.
- 9:16 프리뷰에 자막 안전영역, 이미지 없음 CTA, 현재 씬 상태 오버레이를 추가한다.
- 우측 설정 패널을 `대본`, `이미지`, `음성`, `자막 스타일` 섹션 또는 탭으로 정리한다.
- 좌우 패널 접기와 좁은 화면 대응을 추가한다.

완료 기준:
- 편집 화면에서 각 씬의 미디어 준비 상태를 타임라인만 보고도 이해할 수 있다.
- 우측 패널의 주요 액션이 긴 스크롤에 묻히지 않는다.
- 작은 화면에서도 프리뷰와 타임라인을 사용할 수 있다.

### 1.6 Phase 3: TTS UX 및 Gemini 음성 파이프라인 고도화

목표:
- Gemini TTS 생성 과정을 사용자가 신뢰할 수 있게 만든다.
- 실패/재시도/대본 변경/일괄 생성 상황을 안정적으로 처리한다.

주요 작업:
- 전체 TTS 생성 시 씬별 진행 상태와 실패 목록을 표시한다.
- 실패한 씬만 다시 생성하는 액션을 추가한다.
- 음성 선택 UX를 Gemini voice 이름만 나열하는 방식에서 `추천 음색`, `캐릭터`, `톤` 기준으로 정리한다.
- TTS 생성 전 예상 고지와 AI 음성 사용 안내를 명확히 표시한다.
- 대본/voice/speed/instructions 변경 시 기존 TTS가 무효화되는 UI 표시를 강화한다.

완료 기준:
- 일괄 TTS 중 어떤 씬이 진행/완료/실패인지 확인할 수 있다.
- 실패한 TTS는 전체 재실행 없이 개별 또는 실패분만 재시도할 수 있다.
- 대본 변경 후 오래된 음성이 사용되는 UX 혼란이 없다.

### 1.7 Phase 4: 이미지 및 미디어 관리 개선

목표:
- 썰 영상에 필요한 이미지 업로드/교체/삭제 흐름을 명확하게 만든다.
- 잘못된 파일, 누락 파일, 삭제된 파일로 인한 렌더 문제를 줄인다.

주요 작업:
- 이미지 업로드 전 파일 크기/타입/해상도 안내를 추가한다.
- 업로드 실패 시 재시도와 원인 메시지를 제공한다.
- 이미지 교체 시 이전 파일 정리와 상태 갱신을 검증한다.
- 프로젝트 삭제 시 남는 미디어 파일이 없는지 회귀 테스트를 보강한다.
- 향후 AI 이미지 생성 연동을 넣을 수 있도록 이미지 소스 필드를 설계한다.

완료 기준:
- 이미지가 없는 씬은 프리뷰/타임라인/체크리스트에서 일관되게 표시된다.
- 프로젝트 삭제 후 업로드/렌더 파일이 남지 않는다.
- 이미지 실패 상태에서 사용자가 다음 행동을 알 수 있다.

### 1.8 Phase 5: 재생 및 Export 경험 고도화

목표:
- 전체 재생과 MP4 Export를 영상 제작 완료 단계로 안정화한다.
- 렌더 작업 상태를 명확히 보여주고 실패 복구를 쉽게 만든다.

주요 작업:
- 전체 재생에서 씬 전환, 음성 없는 씬 fallback, 진행바를 더 명확히 표시한다.
- 렌더 Job 상태 패널을 상시 확인 가능한 형태로 개선한다.
- 렌더 실패 시 원인과 해결 액션을 표시한다.
- 완료된 MP4 다운로드, 다시 렌더, 결과 파일 열기 흐름을 정리한다.
- 렌더 중 프로젝트 삭제/씬 변경/파일 누락 상황에 대한 회귀 테스트를 추가한다.

완료 기준:
- 렌더 진행률, 실패 메시지, 다운로드 액션이 한 화면에서 이해된다.
- 준비되지 않은 프로젝트는 Export 전에 막히고, 이유가 명확히 표시된다.
- 렌더 중 데이터 변경으로 고아 파일이 생기지 않는다.

### 1.9 Phase 6: 편집 생산성 기능

목표:
- 반복적인 썰 영상 제작을 빠르게 할 수 있도록 편집 생산성을 높인다.

주요 작업:
- 씬 복제, 씬 삭제 확인, 빈 씬 삽입, 선택 씬 기준 앞/뒤 추가를 구현한다.
- 대본 붙여넣기 분할 결과를 import 전에 사용자가 수정할 수 있게 한다.
- 한국어 문장 분할 규칙을 보강한다.
- 자막 스타일 프리셋과 일괄 적용 기능을 추가한다.
- Undo/Redo의 최소 버전을 도입한다.

완료 기준:
- 긴 대본을 붙여넣은 뒤 씬 분할 결과를 수정하고 추가할 수 있다.
- 여러 씬에 동일한 자막/음성 스타일을 빠르게 적용할 수 있다.
- 실수한 편집을 최소 1단계 이상 복구할 수 있다.

### 1.10 Phase 7: 테스트, 안정성, 릴리즈 준비

목표:
- 현재 MVP를 반복 개발 가능한 안정 상태로 만든다.

주요 작업:
- 백엔드 API 회귀 테스트를 프로젝트/패널/이미지/TTS/렌더 전 범위로 확장한다.
- 프론트엔드 핵심 UX 테스트를 추가한다.
- 가능하면 Playwright 기반 주요 사용자 흐름 테스트를 추가한다.
- `.env.example`, 로컬 실행 가이드, Gemini 키 설정 가이드를 최신화한다.
- 릴리즈 전 QA 체크리스트를 문서화한다.

완료 기준:
- 주요 API 회귀 테스트가 자동화되어 있다.
- 핵심 사용자 흐름이 수동 QA 체크리스트와 자동 테스트로 모두 검증된다.
- 새 개발자가 문서만 보고 로컬 실행과 Gemini TTS 테스트를 진행할 수 있다.

### 1.11 권장 구현 순서

1. Phase 0으로 문서/문구/현재 상태를 정리한다.
2. Phase 1로 사용자가 막히는 지점을 먼저 제거한다.
3. Phase 2로 편집기다운 화면 구조를 만든다.
4. Phase 3과 Phase 4로 TTS/이미지 미디어 파이프라인을 안정화한다.
5. Phase 5로 Export 완성도를 높인다.
6. Phase 6으로 제작 속도를 높이는 편집 기능을 추가한다.
7. Phase 7로 테스트와 릴리즈 준비를 마무리한다.

### 1.12 현재 진행 상태

- 2026-05-10 기준 Phase 0은 문서/현재 상태 동기화와 검증까지 완료했다.
- 2026-05-10 기준 Phase 1은 제작 준비도 체크리스트, Export 차단 사유, 저장 상태 표시, 빈 씬 CTA를 1차 구현했다.
- 다음 작업은 Phase 2인 타임라인, 프리뷰, 우측 인스펙터 재설계다.

## 2. AI / Developer Structured Plan

### 2.1 Objective

Deliver SSUL MAKER as a local-first short-form story video editor with a reliable pipeline:

`script -> scene split -> image upload -> Gemini TTS -> 9:16 preview -> playback -> MP4 export`

The implementation should prioritize workflow clarity, media readiness correctness, robust async jobs, and regression coverage.

### 2.2 Global Acceptance Gates

- Update `work-log.md` after each meaningful change.
- Run backend tests after backend changes: `cd backend && npm test`.
- Run frontend checks after frontend changes: `cd frontend && npm run lint && npm run build`.
- Add or update tests for every bug fix involving API state, media files, TTS, or render jobs.
- Perform a code review pass at the end of every phase and fix actionable findings before moving on.

### 2.3 Phase Breakdown

| Phase | Area | Primary Outcome |
| --- | --- | --- |
| 0 | Baseline/docs/copy | Current code, docs, and Gemini TTS design are aligned. |
| 1 | Core UX flow | Users can understand project readiness and blocked export causes. |
| 2 | Editor UI | Timeline, preview, and inspector behave like a video editor. |
| 3 | TTS | Batch/scene Gemini TTS has clear progress, retry, and stale-state UX. |
| 4 | Media | Image upload, replacement, deletion, and cleanup are reliable. |
| 5 | Render/export | Render jobs are visible, recoverable, and safe against orphan files. |
| 6 | Productivity | Scene duplication, script split editing, presets, bulk apply, undo/redo. |
| 7 | Quality/release | Regression tests, UX tests, docs, and QA checklist are ready. |

### 2.4 Key Technical Tasks

- Frontend: add readiness selectors, saving state, timeline metadata cards, inspector sections/tabs, responsive shell, TTS batch UI, render job panel.
- Backend: keep media readiness server-authoritative, expand cleanup tests, add render/TTS edge-case tests, preserve Gemini timeout and stale-hash guards.
- Shared types: ensure panel readiness, media status, TTS status, and render job statuses are consistently represented.
- Docs: update Gemini TTS references, local setup, environment variables, and QA flow.

### 2.5 Risks

- Large UI refactors can regress existing panel selection, playback, or reorder behavior.
- TTS and render jobs are async and can produce stale state if project/panel changes mid-job.
- File cleanup must remain conservative to avoid deleting unrelated uploads.
- Korean copy and encoding should be handled as UTF-8 throughout the repo.

### 2.6 Next Action

Phase 0 and Phase 1 are complete as of 2026-05-10. Next action: start Phase 2 editor UI redesign, focusing on timeline cards, preview overlays, inspector organization, and responsive shell.
