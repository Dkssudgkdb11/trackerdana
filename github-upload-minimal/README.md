# 시간 관리 웹 애플리케이션

![시간 관리 애플리케이션](https://img.shields.io/badge/시간_관리-애플리케이션-blue)
![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)

## 프로젝트 소개

한국어로 현지화된 시간 관리 웹 애플리케이션으로, 정확한 근무 시간 추적과 인사이트를 제공합니다. 직원들의 근무 시간, 휴가, 외출 등을 효율적으로 관리할 수 있습니다.

## 주요 기능

### 🗓️ 캘린더 기능
- 월별 캘린더 보기
- 날짜별 근무 현황 빠른 확인
- 직관적인 시각적 표시 (업무 유형별 색상 구분)

### ⏱️ 근무 시간 기록
- 다양한 근무 유형 지원 (사무실/재택/연차)
- 출퇴근 시간 기록
- 외출 시간 및 석식 시간 관리
- 근무 시간 자동 계산

### 📊 통계 및 분석
- 월별 근무 시간 통계
- 근무 유형별 시간 분석
- 초과 근무 시간 계산
- 평균 근무 시간 보기

### 📱 사용자 친화적 기능
- 반응형 디자인 (모바일 지원)
- 다크 모드 지원
- 사용자별 독립적인 데이터 관리
- 데이터 내보내기 및 스크린샷 기능

## 화면 구성

1. **로그인 화면**: 사용자 인증
2. **메인 화면**: 월별 캘린더 및 통계 요약
3. **일일 입력 모달**: 상세한 근무 정보 입력
4. **통계 화면**: 근무 패턴 분석 및 시각화

## 넷플리파이 배포 안내

이 프로젝트는 넷플리파이에 정적 웹 애플리케이션으로 배포할 수 있도록 수정되었습니다.

### 배포 방법

1. 간편 빌드 스크립트 실행:
   ```bash
   ./simple-build.sh
   ```

2. 생성된 `client/dist` 폴더를 넷플리파이에 배포
   - Netlify 사이트에서 "Deploy manually" 선택
   - `client/dist` 폴더 업로드

## 개발 환경 설정

### 사전 준비
- Node.js 18+ 및 npm 설치
- Git 설치

### 로컬 개발 시작하기

1. 저장소 복제:
   ```bash
   git clone https://github.com/your-username/time-management-app.git
   cd time-management-app
   ```

2. 의존성 설치:
   ```bash
   npm install
   ```

3. 개발 서버 실행:
   ```bash
   npm run dev
   ```

4. 웹 브라우저에서 확인:
   ```
   http://localhost:5000
   ```

## 기술 스택

### 프론트엔드
- **React**: UI 컴포넌트 구축
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **Zustand**: 상태 관리
- **React Query**: 데이터 관리
- **Shadcn UI**: UI 컴포넌트

### 백엔드
- **Express.js**: API 서버
- **Drizzle ORM**: 데이터베이스 접근

### 배포
- **Netlify**: 정적 웹사이트 호스팅

## 기여하기

기여는 언제나 환영합니다! 다음과 같은 방법으로 참여하실 수 있습니다:

1. 프로젝트 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

## 라이센스

MIT 라이센스를 따릅니다 - [LICENSE](LICENSE) 파일을 참조하세요.