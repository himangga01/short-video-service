# 🎨 SSUL MAKER (썰 메이커) - UX/UI 및 기능 설명서

## 📌 문서 정보
- **프로젝트명**: SSUL MAKER (썰 메이커)
- **도메인**: ssulmaker.io
- **버전**: 1.0
- **작성일**: 2025-10-06
- **문서 유형**: UX/UI 및 기능 상세 설명서

---

## 목차
1. [디자인 철학](#1-디자인-철학)
2. [화면별 상세 설명](#2-화면별-상세-설명)
3. [사용자 플로우](#3-사용자-플로우)
4. [컴포넌트 상세 가이드](#4-컴포넌트-상세-가이드)
5. [인터랙션 가이드](#5-인터랙션-가이드)
6. [반응형 디자인](#6-반응형-디자인)
7. [접근성 가이드라인](#7-접근성-가이드라인)
8. [애니메이션 명세](#8-애니메이션-명세)
9. [에러 및 엣지 케이스](#9-에러-및-엣지-케이스)
10. [사용자 온보딩](#10-사용자-온보딩)

---

## 1. 디자인 철학

### 1.1 핵심 원칙

#### 🎯 패널 기반 워크플로우 (Panel-Based Workflow)
- **장면별 구성**: 스토리를 패널 단위로 분할
- **독립적 편집**: 각 패널을 독립적으로 편집 가능
- **순서 변경 용이**: 드래그 앤 드롭으로 순서 변경

#### 🚀 즉시 재생 (Instant Playback)
- **패널별 미리듣기**: 각 패널의 TTS를 바로 재생
- **전체 재생**: 모든 패널을 연속 재생
- **빠른 피드백**: 수정 사항을 즉시 확인

#### 💎 3-Column 레이아웃
- **좌측**: 프로젝트 리스트 (다크 모드)
- **중앙**: 프로젝트 정보 및 내용 (밝은 모드)
- **우측**: 패널 편집 및 설정 (다크 모드)

#### 🌓 혼합 모드 (Mixed Mode)
- 사이드바: 다크 모드 (집중도 향상)
- 중앙 패널: 라이트 모드 (가독성 향상)
- 우측 패널: 다크 모드 (전문적인 느낌)

#### ⚡ 실시간 자동 저장
- 5초마다 자동 저장
- WebSocket 기반 실시간 동기화
- 저장 상태 시각적 피드백

---

## 2. 화면별 상세 설명

### 2.1 대시보드 메인 화면 (3-Column Layout)

#### 📸 전체 레이아웃 (image.png 기준)

```
┌────────────────────────────────────────────────────────────────────────────────┐
│  Sidebar (240px, Dark)  │  Center Panel (Flex, White)  │  Right Panel (400px)  │
│                         │                              │                       │
│  SSUL MAKER            │  ┌────────────────────────┐  │  7. 썰메이커에서 제작 │
│  [새 프로젝트 추가]     │  │ 🔍  채널명      ≡    │  │                       │
│  버튼 (Red)            │  └────────────────────────┘  │  스크립트 생성        │
│                         │                              │                       │
│  만생지원금 2차는...    │  새 프로젝트                 │  [AI] [+대본 추가]      │
│  4개 스크립트  🔴      │  작성자: 작성자  조회수: 0   │                       │
│                         │                              │  1 ┌─────────────────┐│
│  새 프로젝트            │  얼진은 독같이 에어컨...      │   │Script text...   ││
│  0개 스크립트  🔴      │  전기세가 걱반이라면요?       │   │🎤 Jiny  ▼      ││
│                         │                              │   │🔊▶ ─────◯────   ││
│                         │                              │   │⚙️ 이미지 추가   ││
│  [저장] (Red Button)   │                              │   │📥 프롬프트 추가 ││
│                         │                              │   └─────────────────┘│
└────────────────────────────────────────────────────────────────────────────────┘
```

#### 🎨 디자인 요소

**1. 좌측 사이드바 (Sidebar)**
```css
.sidebar {
  width: 240px;
  background: #000000;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #333333;
  padding: 20px;
}

.sidebar-logo {
  font-size: 20px;
  font-weight: 700;
  color: #FF0000;
  margin-bottom: 24px;
  font-family: 'Pretendard', sans-serif;
}
```

**2. 새 프로젝트 추가 버튼**
```css
.btn-new-project {
  width: 100%;
  background: #FF0000;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  transition: all 150ms ease;
}

.btn-new-project:hover {
  background: #CC0000;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}

.btn-new-project-icon {
  font-size: 16px;
}
```

**3. 프로젝트 리스트 항목**
```css
.project-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-item {
  padding: 12px;
  background: #1A1A1A;
  border-radius: 6px;
  cursor: pointer;
  transition: all 150ms ease;
  position: relative;
}

.project-item:hover {
  background: #2A2A2A;
}

.project-item.active {
  background: #2A2A2A;
  border-left: 3px solid #FF0000;
}

.project-title {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  font-size: 12px;
  color: #999999;
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-script-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.project-indicator {
  width: 8px;
  height: 8px;
  background: #FF0000;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

**4. 저장 버튼 (하단)**
```css
.sidebar-footer {
  padding-top: 16px;
  border-top: 1px solid #333333;
}

.btn-save {
  width: 100%;
  background: #FF0000;
  color: #FFFFFF;
  padding: 10px 16px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-save:hover {
  background: #CC0000;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**5. 중앙 패널 (Center Panel)**
```css
.center-panel {
  flex: 1;
  background: #FFFFFF;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.center-panel-header {
  background: #FF0000;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-icon {
  color: #FFFFFF;
  font-size: 20px;
  cursor: pointer;
}

.channel-name {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  flex: 1;
}

.menu-icon {
  color: #FFFFFF;
  font-size: 24px;
  cursor: pointer;
}
```

**6. 프로젝트 상세 영역**
```css
.project-detail {
  padding: 32px;
}

.project-detail-title {
  font-size: 28px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
}

.project-detail-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E0E0E0;
}

.meta-item {
  font-size: 14px;
  color: #666666;
}

.meta-label {
  font-weight: 500;
  color: #999999;
}

.meta-value {
  font-weight: 600;
  color: #000000;
}
```

**7. 프로젝트 본문 텍스트**
```css
.project-content {
  font-size: 18px;
  line-height: 1.8;
  color: #000000;
  font-weight: 500;
}

.content-text {
  margin-bottom: 16px;
}
```

**8. 우측 패널 (Right Panel)**
```css
.right-panel {
  width: 400px;
  background: #1A1A1A;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.right-panel-header {
  background: #000000;
  padding: 16px;
  border-bottom: 1px solid #333333;
}

.right-panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #FFFFFF;
}

.right-panel-subtitle {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
}
```

**9. 패널 탭 (스크립트 편집 / 이미지 적용)**
```css
.panel-tabs {
  display: flex;
  background: #000000;
  border-bottom: 1px solid #333333;
}

.panel-tab {
  flex: 1;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #999999;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 150ms ease;
}

.panel-tab:hover {
  color: #FFFFFF;
  background: #1A1A1A;
}

.panel-tab.active {
  color: #FFFFFF;
  border-bottom-color: #FF0000;
}
```

**10. 스크립트 추가 버튼**
```css
.btn-add-script {
  background: #FF0000;
  color: #FFFFFF;
  padding: 10px 20px;
  border-radius: 4px;
  border: none;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 150ms ease;
  margin: 16px;
}

.btn-add-script:hover {
  background: #CC0000;
  transform: translateY(-1px);
}

.ai-script-badge {
  background: linear-gradient(135deg, #FF0000, #CC0000);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  display: inline-block;
  margin-right: 8px;
}
```

#### 🔄 사용자 인터랙션

**1. 프로젝트 선택**
- 좌측 사이드바에서 프로젝트 클릭
- 선택된 프로젝트 하이라이트 (빨간 왼쪽 테두리)
- 중앙 패널에 프로젝트 상세 표시
- 우측 패널에 패널 리스트 표시

**2. 저장 버튼**
- 자동 저장: 5초마다 자동 저장
- 수동 저장: 저장 버튼 클릭
- 저장 상태 표시: "저장됨" / "저장 중..."

---

### 2.2 AI 대본 입력 모달

#### 📸 화면 구성 (image.png 기준)

```
┌───────────────────────────────────────────────────────────┐
│  AI 대본 입력                                      [X]    │
│  테스트를 입력하면 한 줄로 자동으로 스크립트가 분할됩니다.  │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ 홀드를 늘어도 시원현은 그대로 뭐지때요               │ │
│  │                                                     │ │
│  │ 냉방, 날씨는 거론이나 달라지는 꼭 나쪽드때요         │ │
│  │ 왜법만 만이도 살냄 온도가 2~3도 내려감니다          │ │
│  │                                                     │ │
│  │ 다섯째, 필터는 최소 한 달에 한 번 청소!              │ │
│  │ 먼지만 쌓여도 효율이 확실 올라갑니다                │ │
│  │                                                     │ │
│  │ 여섯째, 실외기는 숨통이 트여야 합니다               │ │
│  │ 그늘만 확보나 통풍 공간 확보하면 냉방 효율이...      │ │
│  │                                                     │ │
│  │ 처는 히 방법으로 에돌 전기세 전처 줄였앤요.          │ │
│  │                                                     │ │
│  │ 여러분은 어떤 포릅으로 "전기세 절약" 이 되신나요?    │ │
│  │ 댓글에 자펄 민읍 제주세요!                          │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  음성 선택                                                │
│  ┌─────────┐                                             │
│  │ 👤 Jiny │  ▶  [취소]  [생성]                        │
│  └─────────┘                                             │
└───────────────────────────────────────────────────────────┘
```

#### 🎨 디자인 요소

```css
.ai-script-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}

.ai-script-modal-content {
  background: #2A2A2A;
  border-radius: 12px;
  padding: 32px;
  width: 700px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
}

.ai-script-modal-header {
  margin-bottom: 24px;
}

.ai-script-modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-script-modal-subtitle {
  font-size: 14px;
  color: #CCCCCC;
  margin-top: 8px;
}

.ai-script-textarea {
  width: 100%;
  min-height: 400px;
  background: #1A1A1A;
  border: 2px solid #444444;
  border-radius: 8px;
  padding: 16px;
  color: #FFFFFF;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
  font-family: 'Pretendard', sans-serif;
}

.ai-script-textarea:focus {
  outline: none;
  border-color: #FF0000;
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
}

.ai-script-textarea::placeholder {
  color: #666666;
}

.voice-selector-label {
  font-size: 14px;
  color: #CCCCCC;
  margin-top: 20px;
  margin-bottom: 8px;
}

.voice-selector {
  width: 200px;
  background: #1A1A1A;
  border: 2px solid #444444;
  border-radius: 8px;
  padding: 12px 16px;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 150ms ease;
}

.voice-selector:hover {
  border-color: #FF0000;
  background: #2A2A2A;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel {
  background: transparent;
  border: 2px solid #444444;
  color: #FFFFFF;
  padding: 10px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-cancel:hover {
  background: #2A2A2A;
  border-color: #666666;
}

.btn-generate {
  background: #FF0000;
  border: none;
  color: #FFFFFF;
  padding: 10px 32px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 150ms ease;
}

.btn-generate:hover {
  background: #CC0000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
}

.btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

---

### 2.3 TTS 생성 진행률 모달

#### 📸 화면 구성 (image (1).png 기준)

```
┌────────────────────────────────────────────────────┐
│  AI    대본 분할 중                                │
│                                                    │
│  전체 진행중                                        │
│  ████████████████░░░░░░░░░░  42%                  │
│                                                    │
│  TTS 시간 계산 중 (2/10)...                       │
│  2 / 10 스크립트                                   │
│  잠시만 메지막 기다려주세요                         │
│                                                    │
│  TTS 시간 계산이 진행 중입니다. 잠조만 메지막       │
│  기다려주세요                                       │
│                                                    │
└────────────────────────────────────────────────────┘
```

#### 🎨 디자인 요소

```css
.tts-progress-modal {
  background: #2A2A2A;
  border-radius: 12px;
  padding: 32px;
  width: 600px;
  max-width: 90vw;
}

.tts-progress-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.ai-script-badge-large {
  background: linear-gradient(135deg, #FF0000, #CC0000);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: #FFFFFF;
}

.tts-progress-title {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
}

.tts-status-text {
  font-size: 14px;
  color: #CCCCCC;
  margin-bottom: 16px;
}

.progress-bar-container {
  width: 100%;
  height: 8px;
  background: #444444;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-bottom: 12px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF0000, #FF3333);
  border-radius: 4px;
  transition: width 300ms ease-out;
  position: relative;
}

.progress-bar-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-percentage {
  font-size: 24px;
  font-weight: 700;
  color: #FF0000;
  text-align: right;
}

.tts-progress-details {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #444444;
}

.tts-progress-message {
  font-size: 14px;
  color: #CCCCCC;
  line-height: 1.6;
}

.tts-script-counter {
  font-size: 16px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.tts-script-counter .current {
  color: #FF0000;
  font-weight: 700;
}
```

---

### 2.4 패널 설정 UI (우측 패널)

#### 📸 화면 구성 (image (2).png, (3).png 기준)

```
┌───────────────────────────────────────┐
│  패널 설정                             │
│                                       │
│  [스크립트 편집] [이미지 적용]         │
│                                       │
│  스크립트 & 타임라인                  │
│                                       │
│  1  ┌──────────────────────────────┐ │
│     │ 열점은 독감이 에어컨 켜는데    │ │
│     │ 전기세가 걱반이라면요?        │ │
│     │                              │ │
│     │ 🎤 미리듣기 ◀──────◯─────▶  │ │
│     │ ⚙️ 이미지 추가  🎼 프롬프트 추가│ │
│     │                              │ │
│     │ 👤 Jiny  ▼                  │ │
│     │ 텍스트 속도    텍스트 크기    │ │
│     │ ◀────◯──▶  24              │ │
│     │ 배경 색상    글자 색상  ⚙️ 전체│ │
│     │ ███████    ███████          │ │
│     └──────────────────────────────┘ │
│                                       │
│  2  ┌──────────────────────────────┐ │
│     │ 차이는 버튼 '이 습관' 때문입니다│ │
│     │                              │ │
│     │ 🎤 미리듣기 ◀──────◯─────▶  │ │
│     │ ⚙️ 이미지 추가  🎼 프롬프트 추가│ │
│     │                              │ │
│     │ 👤 Jiny  ▼                  │ │
│     │ 텍스트 속도    텍스트 크기    │ │
│     │ ◀────◯──▶  24              │ │
│     │ 배경 색상    글자 색상  ⚙️ 전체│ │
│     │ ███████    ███████          │ │
│     └──────────────────────────────┘ │
│                                       │
│  ...                                  │
└───────────────────────────────────────┘
```

#### 🎨 디자인 요소

**패널 아이템**
```css
.panel-item {
  background: #2A2A2A;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border: 2px solid #444444;
  transition: all 150ms ease;
}

.panel-item:hover {
  border-color: #FF0000;
  background: #333333;
}

.panel-item.active {
  border-color: #FF0000;
  box-shadow: 0 0 0 2px rgba(255, 0, 0, 0.2);
}

.panel-number {
  width: 24px;
  height: 24px;
  background: #FF0000;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #FFFFFF;
  font-size: 12px;
  margin-bottom: 12px;
}

.panel-script-text {
  font-size: 14px;
  line-height: 1.6;
  color: #FFFFFF;
  margin-bottom: 16px;
  white-space: pre-wrap;
  word-break: keep-all;
}

.panel-audio-player {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.play-button {
  width: 36px;
  height: 36px;
  background: #FF0000;
  border-radius: 50%;
  border: none;
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 150ms ease;
}

.play-button:hover {
  background: #CC0000;
  transform: scale(1.05);
}

.audio-timeline {
  flex: 1;
  height: 4px;
  background: #444444;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.audio-timeline-progress {
  height: 100%;
  background: #FF0000;
  border-radius: 2px;
  position: relative;
}

.audio-timeline-handle {
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 12px;
  height: 12px;
  background: #FFFFFF;
  border: 2px solid #FF0000;
  border-radius: 50%;
  cursor: grab;
}

.panel-actions {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.panel-action-btn {
  flex: 1;
  background: #1A1A1A;
  border: 1px solid #444444;
  color: #CCCCCC;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: all 150ms ease;
}

.panel-action-btn:hover {
  background: #2A2A2A;
  border-color: #FF0000;
  color: #FFFFFF;
}

.voice-selector-small {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #444444;
  border-radius: 4px;
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 13px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.panel-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 11px;
  color: #999999;
  text-transform: uppercase;
}

.control-slider {
  width: 100%;
  height: 4px;
  background: #444444;
  border-radius: 2px;
  appearance: none;
  outline: none;
}

.control-slider::-webkit-slider-thumb {
  appearance: none;
  width: 12px;
  height: 12px;
  background: #FF0000;
  border-radius: 50%;
  cursor: pointer;
}

.control-value {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.color-picker-button {
  width: 100%;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #444444;
  cursor: pointer;
  transition: all 150ms ease;
}

.color-picker-button:hover {
  border-color: #FF0000;
}

.control-settings-icon {
  background: #1A1A1A;
  border: 1px solid #444444;
  color: #CCCCCC;
  padding: 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 150ms ease;
}

.control-settings-icon:hover {
  background: #2A2A2A;
  border-color: #FF0000;
  color: #FFFFFF;
}
```

---

### 2.5 스타일 설정 패널 (image (4).png 기준)

#### 📸 화면 구성

```
┌────────────────────────────────────────┐
│  패널 설정                              │
│                                        │
│  보이스 설정                            │
│                                        │
│  보이스 선택                            │
│  ┌────────────────────────────────┐   │
│  │ 👤 Jiny        ▼              │   │
│  └────────────────────────────────┘   │
│                                        │
│  프리셋                                │
│  ┌────────────────────────────────┐   │
│  │ 프리셋을 선택하세요   ▼        │   │
│  └────────────────────────────────┘   │
│                                        │
│  🎵 음성 스크립트 확대                  │
│                                        │
│  스타일 설정                            │
│  ┌────────────────────────────────┐   │
│  │ 레터 스타일      ▲            │   │
│  └────────────────────────────────┘   │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 스크립트 스타일   ▼            │   │
│  └────────────────────────────────┘   │
│                                        │
│  □ 전체 설정                            │
│                                        │
│  스타일 설정                            │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 레터 스타일      ▲            │   │
│  └────────────────────────────────┘   │
│                                        │
│  1. 음성 설정 정보                      │
│                                        │
│  ┌────────────────────────────────┐   │
│  │ 스크립트 스타일   ▼            │   │
│  └────────────────────────────────┘   │
│                                        │
│  2. 본문 설정                           │
└────────────────────────────────────────┘
```

#### 🎨 디자인 요소

```css
.settings-panel {
  padding: 20px;
  background: #1A1A1A;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #333333;
}

.settings-section:last-child {
  border-bottom: none;
}

.settings-section-title {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 16px;
}

.settings-dropdown {
  width: 100%;
  background: #2A2A2A;
  border: 2px solid #444444;
  border-radius: 6px;
  padding: 12px 16px;
  color: #FFFFFF;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 150ms ease;
  margin-bottom: 12px;
}

.settings-dropdown:hover {
  border-color: #FF0000;
  background: #333333;
}

.settings-dropdown-icon {
  color: #999999;
  font-size: 12px;
}

.settings-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.settings-checkbox-input {
  width: 18px;
  height: 18px;
  border: 2px solid #444444;
  border-radius: 3px;
  appearance: none;
  cursor: pointer;
  transition: all 150ms ease;
}

.settings-checkbox-input:checked {
  background: #FF0000;
  border-color: #FF0000;
}

.settings-checkbox-input:checked::after {
  content: '✓';
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 12px;
}

.settings-checkbox-label {
  font-size: 14px;
  color: #CCCCCC;
}

.settings-feature-icon {
  color: #FF0000;
  font-size: 16px;
  margin-right: 8px;
}
```

---

### 2.6 프로젝트 정보 패널 (image (5).png, (6).png 기준)

#### 📸 화면 구성

```
┌────────────────────────────────────────┐
│  프로젝트 정보                    ▲    │
│                                        │
│  제목                                  │
│  "에어컨 커튼 요금 폭탄?"              │
│                                        │
│  작성자                                │
│  이게진짜                              │
│                                        │
│  조회수                                │
│  200000                                │
│                                        │
│  🔴 작성자 정보 표시                    │
│                                        │
│  제목 스타일                            │
│  ┌────────────────────────────────┐   │
│  │ 분표   탭...   ▼              │   │
│  └────────────────────────────────┘   │
│                                        │
│  글자 색상        글자 크기             │
│  ████████    22   ▼                   │
│                                        │
│  X 역할        Y 역할                  │
│  0             0                       │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ 🔴 작성자 정보 표시              │  │
│  └─────────────────────────────────┘  │
└────────────────────────────────────────┘
```

#### 🎨 디자인 요소

```css
.project-info-panel {
  background: #1A1A1A;
  border-radius: 8px;
  padding: 20px;
  margin: 16px;
}

.project-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.project-info-title {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
}

.project-info-toggle {
  background: transparent;
  border: none;
  color: #999999;
  cursor: pointer;
  font-size: 16px;
  transition: all 150ms ease;
}

.project-info-toggle:hover {
  color: #FFFFFF;
}

.project-info-field {
  margin-bottom: 16px;
}

.project-info-label {
  font-size: 12px;
  color: #999999;
  margin-bottom: 6px;
  display: block;
}

.project-info-input {
  width: 100%;
  background: #2A2A2A;
  border: 2px solid #444444;
  border-radius: 4px;
  padding: 10px 12px;
  color: #FFFFFF;
  font-size: 14px;
  transition: all 150ms ease;
}

.project-info-input:focus {
  outline: none;
  border-color: #FF0000;
}

.project-info-number {
  width: 100%;
  background: #2A2A2A;
  border: 2px solid #444444;
  border-radius: 4px;
  padding: 10px 12px;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
}

.show-author-toggle {
  background: #2A2A2A;
  border: 2px solid #FF0000;
  border-radius: 6px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 150ms ease;
}

.show-author-toggle:hover {
  background: #333333;
}

.show-author-indicator {
  width: 12px;
  height: 12px;
  background: #FF0000;
  border-radius: 50%;
}

.show-author-text {
  font-size: 14px;
  color: #FFFFFF;
  font-weight: 500;
}

.position-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
}

.position-control {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.position-label {
  font-size: 11px;
  color: #999999;
}

.position-input {
  background: #2A2A2A;
  border: 2px solid #444444;
  border-radius: 4px;
  padding: 8px 12px;
  color: #FFFFFF;
  font-size: 14px;
  text-align: center;
}
```

---

### 2.7 이미지 적용 패널 (image (7).png 기준)

#### 📸 화면 구성

```
┌────────────────────────────────────────┐
│  이미지 적용                            │
│                                        │
│  6  냉방, 날씨는 거론이나 달라지는      │
│     꼭 나쪽드때요                       │
│                                        │
│     왜법만 만이도 살냄 온도가            │
│     2~3도 내려감니다                    │
│                                        │
│     🎤 미리듣기  ◀───────◯──────▶     │
│                                        │
│  7  ┌──────────────────────────────┐  │
│     │  다섯째, 필터는 최소            │  │
│     │  한 달에 한 번 청소!           │  │
│     │                               │  │
│     │  먼지만 쌓여도 효율이          │  │
│     │  확실 올라갑니다              │  │
│     │                               │  │
│     │  [에어컨 필터 청소 이미지]     │  │
│     │  (손으로 에어컨 필터를 청소   │  │
│     │   하는 사진)                  │  │
│     └──────────────────────────────┘  │
│                                        │
│     🎤 미리듣기  ◀───────◯──────▶     │
│                                        │
│  열거번, 실거지도...                    │
└────────────────────────────────────────┘
```

#### 🎨 디자인 요소

```css
.image-panel {
  background: #2A2A2A;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.image-panel-text {
  font-size: 14px;
  line-height: 1.6;
  color: #FFFFFF;
  margin-bottom: 12px;
}

.image-preview-container {
  width: 100%;
  background: #1A1A1A;
  border: 2px dashed #444444;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  position: relative;
  overflow: hidden;
}

.image-preview {
  width: 100%;
  height: auto;
  border-radius: 4px;
  display: block;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 150ms ease;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.image-action-btn {
  background: #FF0000;
  color: #FFFFFF;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 150ms ease;
}

.image-action-btn:hover {
  background: #CC0000;
}

.image-upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #999999;
  text-align: center;
}

.image-upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
  color: #666666;
}

.image-upload-text {
  font-size: 14px;
  margin-bottom: 16px;
}

.image-upload-button {
  background: #FF0000;
  color: #FFFFFF;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 150ms ease;
}

.image-upload-button:hover {
  background: #CC0000;
  transform: translateY(-1px);
}
```

---

## 3. 사용자 플로우

### 3.1 프로젝트 생성 플로우

```
[대시보드]
    ↓
[+ 새 프로젝트 버튼] 클릭
    ↓
[프로젝트 생성 모달]
    ├─ 제목 입력
    ├─ 작성자 입력 (채널명)
    └─ [생성] 버튼 클릭
    ↓
[빈 프로젝트 생성]
    ├─ 좌측 사이드바에 추가
    ├─ 중앙 패널에 표시
    └─ 우측 패널 활성화
```

### 3.2 스크립트 작성 플로우

**방법 1: AI 대본 입력 (전체 작성)**
```
[+ 스크립트 추가] 버튼 클릭
    ↓
[AI 대본 입력 모달]
    ├─ 전체 스크립트 입력
    ├─ 음성 선택 (Jiny)
    └─ [생성] 버튼 클릭
    ↓
[TTS 생성 진행]
    ├─ 진행률 모달 표시
    ├─ 자동 패널 분할
    └─ 각 패널 TTS 생성
    ↓
[패널 리스트에 추가]
    ├─ 우측 패널에 표시
    ├─ 각 패널 편집 가능
    └─ 순서 변경 가능
```

**방법 2: 패널별 작성**
```
[+ 스크립트 추가] 버튼 클릭
    ↓
[빈 패널 추가]
    ├─ 스크립트 텍스트 입력
    ├─ 음성 설정 (Jiny, 속도, 크기)
    ├─ 스타일 설정 (색상, 폰트)
    └─ 이미지 추가 (선택)
    ↓
[미리듣기] 버튼 클릭
    ├─ TTS 생성 요청
    ├─ 진행률 표시
    └─ 생성 완료 후 재생
    ↓
[다음 패널 추가]
    └─ 반복...
```

### 3.3 프리셋 적용 플로우

```
[새 프로젝트 생성]
    ↓
[우측 패널 - 보이스 설정]
    ↓
[프리셋 드롭다운] 클릭
    ├─ "에어컨 커튼 요금 폭탄? 이 습관이 원인!"
    └─ 기타 프리셋들...
    ↓
[프리셋 선택]
    ├─ 자동으로 패널 생성
    ├─ 템플릿 스크립트 적용
    ├─ 스타일 설정 적용
    └─ 이미지 가이드 제공
    ↓
[커스터마이징]
    ├─ 스크립트 수정
    ├─ 이미지 교체
    └─ TTS 재생성
```

### 3.4 이미지 추가 플로우

```
[패널 선택]
    ↓
[이미지 적용] 탭 선택
    ↓
[이미지 업로드 영역] 클릭
    ├─ 파일 선택 (JPG, PNG, GIF)
    ├─ 또는 드래그 앤 드롭
    └─ 업로드 진행
    ↓
[이미지 미리보기]
    ├─ 크롭/리사이즈 (선택)
    ├─ 필터 적용 (선택)
    └─ [적용] 버튼 클릭
    ↓
[패널에 이미지 첨부]
    ├─ 이미지 적용 탭에서 확인
    └─ 이미지 수정/삭제 가능
```

---

## 4. 컴포넌트 상세 가이드

### 4.1 버튼 컴포넌트

#### Primary Button (빨간색)
```tsx
<Button 
  variant="primary"
  size="medium"
  onClick={handleClick}
  disabled={isLoading}
>
  생성하기
</Button>
```

**스타일 변형**:
```css
/* Primary (Red) */
background: #FF0000;
color: #FFFFFF;
padding: 12px 24px;
border-radius: 4px;
font-weight: 600;

/* Secondary (Dark) */
background: #2A2A2A;
color: #FFFFFF;
border: 2px solid #444444;

/* Outline (Transparent) */
background: transparent;
color: #FF0000;
border: 2px solid #FF0000;

/* Ghost (Minimal) */
background: transparent;
color: #CCCCCC;
border: none;
```

### 4.2 패널 컴포넌트 (핵심!)

```tsx
<PanelItem
  panelId={panel.id}
  orderIndex={panel.orderIndex}
  scriptText={panel.scriptText}
  voiceId={panel.voiceId}
  audioUrl={panel.audioUrl}
  imageUrl={panel.imageUrl}
  onPlay={handlePlay}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

**기능**:
- 스크립트 텍스트 표시
- 오디오 플레이어
- 이미지 프리뷰
- 음성 설정 (Jiny, 속도, 크기)
- 스타일 설정 (색상, 폰트)
- 드래그 핸들 (순서 변경)

---

## 5. 인터랙션 가이드

### 5.1 드래그 앤 드롭

**패널 순서 변경**:
```tsx
<DraggableList
  items={panels}
  onReorder={handleReorder}
  dragHandle
/>
```

**시각적 피드백**:
- 드래그 시작: 반투명 (opacity: 0.5)
- 드롭 가능 영역: 빨간 점선 테두리
- 드롭 완료: 애니메이션으로 제자리 이동

### 5.2 키보드 단축키

**전역 단축키**:
- `Ctrl/Cmd + S`: 저장
- `Ctrl/Cmd + N`: 새 프로젝트
- `Ctrl/Cmd + Shift + A`: 스크립트 추가
- `Ctrl/Cmd + P`: 재생/일시정지
- `Space`: 선택된 패널 재생/일시정지

**패널 내 단축키**:
- `Enter`: 패널 편집
- `Delete`: 패널 삭제
- `↑/↓`: 패널 이동
- `Esc`: 편집 취소

---

## 6. 반응형 디자인

### 6.1 브레이크포인트

```css
/* Tablet (768px ~ 1023px) */
@media (max-width: 1023px) {
  .sidebar {
    width: 200px;
  }
  
  .right-panel {
    width: 320px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .sidebar {
    transform: translateX(-100%);
    position: fixed;
    z-index: 100;
  }
  
  .sidebar.open {
    transform: translateX(0);
  }
  
  .right-panel {
    position: fixed;
    right: 0;
    transform: translateX(100%);
    z-index: 100;
  }
  
  .right-panel.open {
    transform: translateX(0);
  }
  
  .center-panel {
    margin-left: 0;
  }
}
```

---

## 7. 접근성 가이드라인

### 7.1 ARIA 레이블

```html
<!-- 패널 아이템 -->
<div
  role="article"
  aria-label={`패널 ${orderIndex}: ${scriptText.substring(0, 50)}`}
>
  <!-- 패널 내용 -->
</div>

<!-- 오디오 플레이어 -->
<button
  aria-label="재생"
  aria-pressed={isPlaying}
>
  ▶
</button>

<!-- 프로그레스 바 -->
<div
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin="0"
  aria-valuemax="100"
  aria-label="TTS 생성 진행률"
>
  {progress}%
</div>
```

---

## 8. 애니메이션 명세

### 8.1 패널 추가 애니메이션

```css
@keyframes panelSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.panel-item-enter {
  animation: panelSlideIn 300ms ease-out;
}
```

### 8.2 저장 인디케이터

```css
@keyframes savePulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.save-indicator {
  animation: savePulse 1s ease-in-out infinite;
}
```

---

## 9. 에러 및 엣지 케이스

### 9.1 에러 상태

#### TTS 생성 실패
```
┌───────────────────────────────────────────┐
│  ❌ TTS 생성에 실패했습니다                │
│                                           │
│  API 요청 한도를 초과했습니다.             │
│  잠시 후 다시 시도해주세요.                │
│                                           │
│  [다시 시도]  [취소]                     │
└───────────────────────────────────────────┘
```

#### 이미지 업로드 실패
```
┌───────────────────────────────────────────┐
│  ⚠️ 이미지 업로드에 실패했습니다           │
│                                           │
│  파일 크기가 10MB를 초과합니다.            │
│  더 작은 파일을 선택해주세요.              │
│                                           │
│  [확인]                                   │
└───────────────────────────────────────────┘
```

### 9.2 빈 상태

#### 프로젝트 없음
```
┌───────────────────────────────────────────┐
│                                           │
│              📁                           │
│                                           │
│        프로젝트가 없습니다                 │
│                                           │
│    첫 번째 프로젝트를 만들어보세요!        │
│                                           │
│        [+ 새 프로젝트 만들기]            │
│                                           │
└───────────────────────────────────────────┘
```

#### 패널 없음
```
┌───────────────────────────────────────────┐
│                                           │
│              📝                           │
│                                           │
│       스크립트를 추가해보세요              │
│                                           │
│     [+ 스크립트 추가]                    │
│                                           │
└───────────────────────────────────────────┘
```

---

## 10. 사용자 온보딩

### 10.1 첫 방문 튜토리얼

```typescript
const tutorialSteps = [
  {
    target: '.btn-new-project',
    title: '프로젝트 만들기',
    content: '여기를 클릭하여 새 프로젝트를 만드세요',
    placement: 'right',
  },
  {
    target: '.btn-add-script',
    title: '스크립트 추가',
    content: 'AI 대본 입력으로 전체 스크립트를 넣거나 씬별로 작성하세요',
    placement: 'left',
  },
  {
    target: '.panel-item',
    title: '패널 편집',
    content: '각 패널을 클릭하여 스크립트와 음성을 편집하세요',
    placement: 'left',
  },
  {
    target: '.play-button',
    title: '미리듣기',
    content: '패널을 재생하여 음성을 확인하세요',
    placement: 'top',
  },
  {
    target: '.btn-save',
    title: '저장',
    content: '자동 저장되지만 수동으로도 저장할 수 있습니다',
    placement: 'right',
  },
];
```

---

## 11. UX/UI 개선사항 🆕

### 11.1 네비게이션 개선

#### 브레드크럼 추가
```jsx
<Breadcrumb>
  <BreadcrumbItem href="/">홈</BreadcrumbItem>
  <BreadcrumbItem href="/projects">프로젝트</BreadcrumbItem>
  <BreadcrumbItem active>만생지원금 2차는 못받는다?</BreadcrumbItem>
</Breadcrumb>
```

**위치**: 중앙 패널 상단
**스타일**: 
- 텍스트 크기: 14px
- 색상: #666666
- 활성: #000000
- 구분자: `/` (회색)

#### 통합 검색
```jsx
<SearchModal>
  <SearchInput placeholder="프로젝트, 패널 내용 검색..." />
  <SearchFilters>
    <Filter name="type" options={['프로젝트', '패널', '프리셋']} />
    <Filter name="date" options={['최근', '이번 주', '이번 달', '전체']} />
    <Filter name="status" options={['작성중', '완성']} />
  </SearchFilters>
  <SearchResults />
  <SearchHistory />
</SearchModal>
```

**단축키**: `Ctrl+K` 또는 `Cmd+K`

#### 최근 작업 위젯
```jsx
<RecentWork>
  <RecentItem>
    <Icon>📁</Icon>
    <Title>만생지원금 2차...</Title>
    <Time>5분 전</Time>
  </RecentItem>
  <RecentItem>
    <Icon>📁</Icon>
    <Title>에어컨 커튼...</Title>
    <Time>1시간 전</Time>
  </RecentItem>
</RecentWork>
```

**위치**: 사이드바 상단 (로고 아래)

### 11.2 패널 편집 개선

#### Undo/Redo 버튼
```css
.history-controls {
  position: fixed;
  bottom: 20px;
  right: 420px;
  display: flex;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.btn-undo, .btn-redo {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-undo:hover, .btn-redo:hover {
  background: #f5f5f5;
  border-radius: 4px;
}

.btn-undo:disabled, .btn-redo:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

**단축키**:
- Undo: `Ctrl+Z` / `Cmd+Z`
- Redo: `Ctrl+Y` / `Cmd+Y` 또는 `Ctrl+Shift+Z`

#### 일괄 편집 모드
```jsx
<BulkEditToolbar visible={selectedPanels.length > 0}>
  <SelectedCount>{selectedPanels.length}개 선택됨</SelectedCount>
  <BulkActions>
    <Button icon="🎤" onClick={bulkChangeVoice}>음성 변경</Button>
    <Button icon="🎨" onClick={bulkChangeStyle}>스타일 변경</Button>
    <Button icon="📋" onClick={bulkCopy}>복사</Button>
    <Button icon="🗑️" onClick={bulkDelete}>삭제</Button>
  </BulkActions>
</BulkEditToolbar>
```

**선택 방법**:
- `Ctrl+클릭`: 개별 선택/해제
- `Shift+클릭`: 범위 선택
- `Ctrl+A`: 전체 선택

#### 패널 컨텍스트 메뉴
```jsx
<ContextMenu panel={selectedPanel}>
  <MenuItem icon="✏️" onClick={edit}>편집</MenuItem>
  <MenuItem icon="📋" onClick={copy}>복사</MenuItem>
  <MenuItem icon="📑" onClick={duplicate}>복제</MenuItem>
  <Divider />
  <MenuItem icon="⭐" onClick={saveAsTemplate}>템플릿으로 저장</MenuItem>
  <Divider />
  <MenuItem icon="🗑️" onClick={deletePanel} danger>삭제</MenuItem>
</ContextMenu>
```

### 11.3 피드백 시스템

#### 로딩 인디케이터 (개선)
```jsx
<LoadingModal>
  <ProgressBar value={progress} max={100} />
  <StatusText>패널 3의 TTS를 생성하는 중... ({progress}%)</StatusText>
  <TimeEstimate>약 15초 남음</TimeEstimate>
  <DetailList>
    <DetailItem status="completed">✓ 패널 1 완료</DetailItem>
    <DetailItem status="completed">✓ 패널 2 완료</DetailItem>
    <DetailItem status="processing">⏳ 패널 3 처리 중...</DetailItem>
    <DetailItem status="pending">⏸ 패널 4 대기 중</DetailItem>
  </DetailList>
  <CancelButton onClick={cancelTTS}>취소</CancelButton>
</LoadingModal>
```

#### 통합 알림 시스템
```jsx
<NotificationStack position="top-right">
  <Notification type="success" autoClose={3000}>
    <Icon>✓</Icon>
    <Title>저장 완료</Title>
    <Message>프로젝트가 저장되었습니다</Message>
  </Notification>
  
  <Notification type="error" autoClose={false}>
    <Icon>⚠️</Icon>
    <Title>TTS 생성 실패</Title>
    <Message>패널 3의 TTS 생성에 실패했습니다</Message>
    <Actions>
      <Button onClick={retry}>재시도</Button>
      <Button onClick={dismiss} variant="text">닫기</Button>
    </Actions>
  </Notification>
  
  <Notification type="warning">
    <Icon>⚠️</Icon>
    <Title>사용량 경고</Title>
    <Message>TTS 사용량이 70%를 초과했습니다</Message>
    <Link href="/settings/plan">플랜 업그레이드</Link>
  </Notification>
</NotificationStack>
```

#### 네트워크 상태 바
```jsx
<NetworkStatusBar offline={true}>
  <Icon>⚠️</Icon>
  <Message>인터넷 연결이 끊어졌습니다</Message>
  <Detail>작업 내용은 로컬에 저장되고 있습니다. 연결이 복구되면 자동으로 동기화됩니다.</Detail>
  <RetryButton onClick={checkConnection}>다시 연결</RetryButton>
</NetworkStatusBar>
```

**위치**: 화면 상단 (고정)
**색상**: `#FFF3CD` (배경), `#856404` (텍스트)

### 11.4 모바일 UX

#### 하단 네비게이션
```jsx
<MobileBottomNav>
  <NavItem href="/" icon="🏠" label="홈" active />
  <NavItem href="/projects" icon="📁" label="프로젝트" />
  <NavItem href="/add" icon="➕" label="추가" />
  <NavItem href="/settings" icon="⚙️" label="설정" />
  <NavItem href="/profile" icon="👤" label="프로필" />
</MobileBottomNav>
```

**스타일**:
```css
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #ffffff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
}

@media (min-width: 768px) {
  .mobile-bottom-nav {
    display: none;
  }
}
```

#### 터치 제스처
```typescript
const gestures = {
  swipeLeft: () => navigateToNextPanel(),
  swipeRight: () => navigateToPreviousPanel(),
  longPress: (element) => showContextMenu(element),
  doubleTap: (panel) => editPanel(panel),
  pinchZoom: (scale) => adjustTextSize(scale),
};
```

**설정**:
- 스와이프 거리: 최소 50px
- 롱프레스 시간: 500ms
- 더블탭 간격: 300ms

#### 가상 키보드 대응
```typescript
// 키보드 표시 시 레이아웃 조정
window.visualViewport?.addEventListener('resize', () => {
  const keyboardHeight = window.innerHeight - window.visualViewport.height;
  if (keyboardHeight > 100) {
    // 키보드가 표시됨
    document.body.classList.add('keyboard-open');
    // 입력 필드를 보이도록 스크롤
    activeInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    document.body.classList.remove('keyboard-open');
  }
});
```

### 11.5 고급 기능 UI

#### 발음 사전 모달
```jsx
<PronunciationDictionaryModal>
  <Header>
    <Title>발음 사전</Title>
    <TabGroup>
      <Tab active>프로젝트 사전</Tab>
      <Tab>전역 사전</Tab>
    </TabGroup>
  </Header>
  
  <DictionaryList>
    <DictionaryItem>
      <Word>에어컨</Word>
      <Pronunciation>[에어콘]</Pronunciation>
      <PlaySample>🔊</PlaySample>
      <Actions>
        <Button icon="✏️" />
        <Button icon="🗑️" />
      </Actions>
    </DictionaryItem>
  </DictionaryList>
  
  <AddNewEntry>
    <Input placeholder="단어 입력" />
    <Input placeholder="발음 입력" />
    <Button primary>추가</Button>
  </AddNewEntry>
</PronunciationDictionaryModal>
```

#### 타임라인 에디터
```jsx
<TimelineEditor>
  <TimelineHeader>
    <PlaybackControls>
      <Button icon="⏮️" onClick={goToStart} />
      <Button icon={playing ? "⏸️" : "▶️"} onClick={togglePlay} large />
      <Button icon="⏭️" onClick={goToEnd} />
    </PlaybackControls>
    <TimeDisplay>{formatTime(currentTime)} / {formatTime(totalDuration)}</TimeDisplay>
    <ZoomControls>
      <Button icon="➖" onClick={zoomOut} />
      <Slider value={zoom} onChange={setZoom} />
      <Button icon="➕" onClick={zoomIn} />
    </ZoomControls>
  </TimelineHeader>
  
  <TimelineCanvas>
    {panels.map(panel => (
      <TimelineClip
        key={panel.id}
        panel={panel}
        startTime={panel.startTime}
        duration={panel.duration}
        onDrag={handleDrag}
        onResize={handleResize}
      >
        <ClipThumbnail src={panel.imageUrl} />
        <ClipLabel>{panel.title}</ClipLabel>
        <TransitionIndicator type={panel.transition.type} />
      </TimelineClip>
    ))}
    <TimelineMarkers>
      {markers.map(marker => (
        <Marker key={marker.id} time={marker.time} label={marker.label} />
      ))}
    </TimelineMarkers>
    <Playhead position={currentTime} />
  </TimelineCanvas>
  
  <PropertiesPanel>
    <PropertyGroup title="전환 효과">
      <Select value={selectedTransition} onChange={setTransition}>
        <Option value="cut">컷</Option>
        <Option value="fade">페이드</Option>
        <Option value="slide">슬라이드</Option>
        <Option value="zoom">줌</Option>
      </Select>
      <Slider label="전환 시간" value={transitionDuration} onChange={setTransitionDuration} />
    </PropertyGroup>
  </PropertiesPanel>
</TimelineEditor>
```

#### TTS 비용 관리 위젯
```jsx
<TTSUsageWidget>
  <Header>
    <Icon>💰</Icon>
    <Title>TTS 사용량</Title>
  </Header>
  
  <UsageBar>
    <Progress value={15234} max={50000} />
    <UsageText>15,234자 / 50,000자 (30%)</UsageText>
  </UsageBar>
  
  <CostInfo>
    <CostItem>
      <Label>예상 비용</Label>
      <Value>$3.05 / $10.00</Value>
    </CostItem>
    <CostItem>
      <Label>현재 패널</Label>
      <Value>156자 (약 $0.03)</Value>
    </CostItem>
  </CostInfo>
  
  <Actions>
    <Button variant="link" href="/settings/plan">플랜 업그레이드</Button>
    <Button variant="link" href="/usage">상세 내역</Button>
  </Actions>
</TTSUsageWidget>
```

**위치**: 우측 패널 하단 (스티키)

### 11.6 접근성 개선 🆕

#### 키보드 네비게이션 강화
```typescript
const keyboardShortcuts = {
  // 전역 단축키
  'Ctrl+K': openSearch,
  'Ctrl+S': saveProject,
  'Ctrl+N': createNewProject,
  'Ctrl+Z': undo,
  'Ctrl+Y': redo,
  
  // 패널 조작
  'Ctrl+Enter': addNewPanel,
  'Ctrl+D': duplicatePanel,
  'Delete': deleteSelectedPanels,
  'Ctrl+A': selectAllPanels,
  
  // 재생 제어
  'Space': togglePlayback,
  'Left': seekBackward,
  'Right': seekForward,
  'Home': goToStart,
  'End': goToEnd,
  
  // 탭 전환
  'Ctrl+1': switchToScriptTab,
  'Ctrl+2': switchToImageTab,
  'Ctrl+3': switchToSettingsTab,
};
```

#### 포커스 인디케이터
```css
:focus-visible {
  outline: 2px solid #FF0000;
  outline-offset: 2px;
  border-radius: 4px;
}

/* 버튼 포커스 */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.2);
}

/* 입력 필드 포커스 */
input:focus-visible,
textarea:focus-visible {
  border-color: #FF0000;
  box-shadow: 0 0 0 3px rgba(255, 0, 0, 0.1);
}
```

#### 스크린 리더 지원
```jsx
<PanelItem
  role="article"
  aria-label={`패널 ${index + 1}, ${panel.script.substring(0, 50)}...`}
  aria-describedby={`panel-${panel.id}-description`}
>
  <PanelNumber aria-hidden="true">{index + 1}</PanelNumber>
  <PanelScript id={`panel-${panel.id}-description`}>
    {panel.script}
  </PanelScript>
  <AudioPlayer
    aria-label={`패널 ${index + 1} 오디오 플레이어`}
  />
</PanelItem>
```

---

### 11.7 영상 편집기 중심 UX 개정안 (2026-05-04)

현재 MVP는 프로젝트/패널 CRUD 중심으로 구성되어 있으나, SSUL MAKER의 실제 사용 목적은 "썰 영상 제작"입니다. 따라서 이후 UX는 패널 목록을 관리하는 화면이 아니라, 최종 영상 결과물을 계속 확인하면서 장면을 조립하는 편집 작업대를 중심으로 재정렬합니다.

#### 핵심 화면 구조

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Top Bar: 프로젝트명 · 저장 상태 · TTS 생성 · 전체 미리보기 · Export          │
├──────────────────┬────────────────────────────────────────┬─────────────────┤
│ Left Rail        │ Main Preview                           │ Inspector       │
│ - 프로젝트 목록  │ ┌────────────────────────────────────┐ │ - Script        │
│ - 씬 목록        │ │ 9:16 영상 프리뷰 캔버스             │ │ - Voice         │
│ - 에셋 라이브러리│ │ 이미지/배경/자막/safe area 표시     │ │ - Visual        │
│                  │ └────────────────────────────────────┘ │ - Timing        │
│                  │                                        │ - Export 상태   │
├──────────────────┴────────────────────────────────────────┴─────────────────┤
│ Bottom Timeline: 씬 카드 · 오디오 길이 · 재생 헤드 · 전체 재생 컨트롤        │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### UX 우선순위

1. 영상 프리뷰가 중앙의 1순위 화면이어야 합니다.
2. 패널은 "씬"으로 다루며, 순서와 길이는 타임라인에서 조작합니다.
3. 선택한 씬의 상세 설정은 우측 인스펙터에서 편집합니다.
4. 모든 생성 작업(TTS, 이미지, 렌더)은 상태가 명확히 표시되어야 합니다.
5. 사용자는 항상 "현재 영상이 몇 초이고, 지금 어느 장면을 보고 있으며, export 가능한 상태인지" 알 수 있어야 합니다.

#### 주요 컴포넌트 개정

| 영역 | 컴포넌트 | 역할 |
|------|----------|------|
| 중앙 | `VideoPreviewCanvas` | 9:16 기준 결과물 미리보기, 자막/이미지/배경/safe area 표시 |
| 하단 | `SceneTimeline` | 씬 순서, 음성 길이, 전환, 재생 헤드 표시 |
| 우측 | `SceneInspector` | 선택된 씬의 대본, 음성, 이미지, 스타일, 타이밍 설정 |
| 상단 | `EditorToolbar` | 저장 상태, 전체 TTS 생성, 전체 미리보기, export 진입 |
| 공통 | `JobStatusToast` | TTS/이미지/렌더 작업 상태와 실패 복구 표시 |

#### 씬 카드 필수 정보

- 씬 번호
- 대본 첫 줄
- TTS 상태: 없음, 생성 중, 완료, 실패
- 오디오 길이
- 이미지 유무
- 자막 스타일 적용 여부
- 재생/재생성 버튼
- 드래그 정렬 핸들

#### 우측 인스펙터 탭

| 탭 | 포함 기능 |
|----|-----------|
| Script | 대본 입력, 글자 수, 문장 분할, 발음/쉼표/강조 |
| Voice | 음성 선택, 속도, 톤 지시문, TTS 생성/재생성, 오디오 재생 |
| Visual | 이미지 업로드, 크롭, 배경, 자막 위치, 자막 스타일, safe area |
| Timing | 씬 길이, 전환 효과, fade in/out, 오디오 기준 자동 길이 |
| Export | 씬별 렌더 상태, 누락 에셋, export 가능 여부 |

#### MVP에서 반드시 보여줄 상태

- 저장 중 / 저장됨 / 저장 실패
- TTS 없음 / 생성 대기 / 생성 중 / 완료 / 실패
- 이미지 없음 / 업로드 중 / 적용됨 / 실패
- 렌더 준비 안 됨 / 렌더 가능 / 렌더 중 / 완료 / 실패
- 전체 영상 길이

---

## 12. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0  | 2025-10-06 | AI Assistant | 초기 작성 |
| 2.0  | 2025-10-06 | AI Assistant | UX/UI 개선사항 반영 |
|      |            |              | - 브레드크럼, 통합 검색, 최근 작업 위젯 추가 |
|      |            |              | - Undo/Redo, 일괄 편집, 컨텍스트 메뉴 추가 |
|      |            |              | - 로딩 인디케이터, 알림 시스템, 네트워크 상태 바 개선 |
|      |            |              | - 모바일 하단 네비게이션, 터치 제스처 추가 |
|      |            |              | - 발음 사전, 타임라인 에디터, TTS 비용 위젯 추가 |
|      |            |              | - 키보드 네비게이션, 접근성 강화 |
| 2.1  | 2026-05-04 | Codex | 영상 편집기 중심 UX 개정안 추가 |
|      |            |       | - 9:16 프리뷰, 씬 타임라인, 우측 인스펙터 중심 구조 정의 |
|      |            |       | - TTS/이미지/렌더 작업 상태 표시 기준 추가 |

---

**문서 끝**

이 문서는 SSUL MAKER의 실제 UI/UX를 기반으로 작성된 상세 설명서입니다. 모든 화면, 컴포넌트, 인터랙션이 실제 이미지 분석과 개선 필요사항 분석을 통해 작성되었습니다.
