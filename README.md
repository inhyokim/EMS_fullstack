# KT 스마트빌딩 EMS Lite

KT 스마트빌딩 EMS (Energy Management System) Lite는 건물별/계측기별 전력 데이터를 실시간 수집·집계하고, 요금/임계치/기준선 기반으로 알람과 리포트를 제공하는 에너지 관리 시스템입니다.

## 주요 기능

### 관리자 (Admin)
- **건물/구역/계측기 관리**: CRUD 기능으로 에너지 관리 대상 등록
- **데이터 수집**: CSV 업로드를 통한 전력 데이터 입력
- **집계 배치 작업**: 시간별/일별 데이터 집계 및 작업 관리  
- **알람 규칙 관리**: 임계치 기반 알람 규칙 설정
- **리포트 생성**: 다양한 유형의 에너지 분석 리포트 생성
- **시스템 설정**: 온보딩 가이드 및 초기 설정

### 운영자 (Operator)
- **대시보드 모니터링**: 실시간 전력 사용량 및 KPI 모니터링
- **알람 관리**: 발생한 알람 확인 및 처리
- **데이터 탐색**: 전력 사용 패턴 분석 및 시각화
- **리포트 조회**: 일/월별 전력 사용 리포트 확인

## 기술 스택

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions (Hono)
- **Database**: Supabase KV Store
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Notifications**: Sonner

## 환경 설정

### 필수 환경 변수

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# Supabase 설정
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=your-supabase-db-url

# 데모 모드 (개발/테스트용)
DEMO_MODE=true
```

### 데모 모드 설정

개발 및 테스트를 위해 인증을 우회하는 데모 모드를 지원합니다:

1. `.env` 파일에 `DEMO_MODE=true` 설정
2. API 요청 시 `X-Demo-Key: kt-ems-demo` 헤더 자동 추가
3. 실제 인증 없이 모든 기능 사용 가능

## 실행 방법

### 개발 환경

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

3. 브라우저에서 `http://localhost:3000` 접속

### 초기 데이터 생성

시스템에 로그인한 후 다음 방법으로 초기 데이터를 생성할 수 있습니다:

1. **자동 생성**: 건물 관리 페이지에서 "초기 데이터 생성" 버튼 클릭
2. **수동 등록**: 건물 → 구역 → 계측기 순서로 직접 등록

### CSV 데이터 업로드

전력 데이터를 업로드하려면:

1. 데이터 업로드 페이지에서 "샘플 CSV 다운로드"로 형식 확인
2. 다음 컬럼을 포함한 CSV 파일 준비:
   - `building_name`: 건물명
   - `zone_name`: 구역명  
   - `meter_no`: 계측기 번호 (MT-XXX 형식)
   - `timestamp`: 측정 시간 (ISO 8601 형식)
   - `value`: 전력 사용량 (양수)
3. CSV 파일 선택 및 업로드

## API 엔드포인트

### 인증
- 데모 모드: `X-Demo-Key: kt-ems-demo` 헤더 필요
- 실제 환경: `Authorization: Bearer <token>` 헤더 필요

### 주요 엔드포인트

```
# 건물 관리
GET    /make-server-ead5a09b/buildings
POST   /make-server-ead5a09b/buildings
PUT    /make-server-ead5a09b/buildings/:id
DELETE /make-server-ead5a09b/buildings/:id

# 구역 관리
GET    /make-server-ead5a09b/zones[?buildingId=]
POST   /make-server-ead5a09b/zones
PUT    /make-server-ead5a09b/zones/:id
DELETE /make-server-ead5a09b/zones/:id

# 계측기 관리
GET    /make-server-ead5a09b/meters[?zoneId=]
POST   /make-server-ead5a09b/meters
PUT    /make-server-ead5a09b/meters/:id
DELETE /make-server-ead5a09b/meters/:id

# 전력 데이터
GET    /make-server-ead5a09b/readings[?meterId=&from=&to=&limit=]
POST   /make-server-ead5a09b/readings

# 집계 작업
GET    /make-server-ead5a09b/jobs
POST   /make-server-ead5a09b/jobs/aggregate/hourly
POST   /make-server-ead5a09b/jobs/aggregate/daily
GET    /make-server-ead5a09b/aggregates/hourly[?from=&to=&meterId=&buildingName=]
GET    /make-server-ead5a09b/aggregates/daily[?from=&to=&meterId=&buildingName=]

# 알람 규칙
GET    /make-server-ead5a09b/alert-rules
POST   /make-server-ead5a09b/alert-rules
PUT    /make-server-ead5a09b/alert-rules/:id
DELETE /make-server-ead5a09b/alert-rules/:id

# 알람
GET    /make-server-ead5a09b/alerts[?status=]
PATCH  /make-server-ead5a09b/alerts/:id

# 리포트
GET    /make-server-ead5a09b/reports[?type=&period=]
GET    /make-server-ead5a09b/reports/:id
POST   /make-server-ead5a09b/reports/generate

# 대시보드
GET    /make-server-ead5a09b/dashboard

# 개발용 시드 데이터
POST   /make-server-ead5a09b/seed

# 헬스 체크
GET    /make-server-ead5a09b/health
```

## 사용자 플로우

### 관리자 초기 설정 (5단계)
1. **역할 선택**: 관리자 선택
2. **온보딩 가이드**: 시스템 설정 단계 안내
3. **건물 등록**: "초기 데이터 생성" 또는 수동 등록
4. **구역 설정**: 건물 내 관리 구역 설정
5. **계측기 등록**: 전력 데이터 수집 장치 등록
6. **데이터 업로드**: CSV를 통한 전력 데이터 입력
7. **알람 규칙 설정**: 임계치 기반 알람 규칙 구성

### 운영자 모니터링
1. **역할 선택**: 운영자 선택
2. **대시보드**: 실시간 전력 사용량 및 KPI 확인
3. **알람 관리**: 발생한 알람 확인 및 처리
4. **데이터 탐색**: 원시/집계 데이터 시각화 및 분석
5. **리포트**: 주기별 사용량 리포트 확인

## 핵심 기능 상세

### 1. 실시간 대시보드
- **KPI 모니터링**: 일일/월간 사용량, 피크 전력, 에너지 효율성
- **시계열 차트**: 최근 24시간 사용량 추이
- **건물별 분석**: 파이차트로 건물별 사용량 분포
- **실시간 알람**: 활성 알람 목록 및 심각도별 분류

### 2. 데이터 집계 시스템
- **자동 집계**: 시간별/일별 데이터 자동 집계
- **배치 작업**: 수동 집계 작업 실행 및 이력 관리
- **통계 계산**: 합계, 평균, 최대, 최소값 자동 계산
- **성능 최적화**: 집계된 데이터로 빠른 조회 성능

### 3. 알람 시스템
- **규칙 엔진**: 사용량/피크/효율성/이상감지 기반 규칙
- **자동 감지**: 집계 시 실시간 임계치 비교
- **상태 관리**: Active → Acknowledged → Resolved 워크플로우
- **알림 이력**: 코멘트 및 처리자 추적

### 4. 데이터 탐색
- **이중 모드**: 원시 데이터 vs 집계 데이터 조회
- **다양한 차트**: 라인/영역/바차트 지원
- **필터링**: 건물/계측기/기간별 필터
- **데이터 내보내기**: CSV 형태로 분석 데이터 다운로드

### 5. 리포트 시스템
- **동적 생성**: 요청 시 실시간 리포트 생성
- **다양한 유형**: 사용량/효율성/비용/종합 리포트
- **자동 분석**: 통계, 알람 현황, 개선 권장사항 포함
- **기간별 비교**: 일일/주간/월간 리포트

## 데이터 구조

### 전력 데이터 흐름
```
Raw Data (readings) → Hourly Aggregates → Daily Aggregates → Reports
                   ↓
              Alert Detection → Alert Management
```

### KV Store 키 구조
```
building:{timestamp}                     # 건물 정보
zone:{buildingId}:{timestamp}           # 구역 정보  
meter:{zoneId}:{timestamp}              # 계측기 정보
reading:{meterId}:{timestamp}-{random}  # 원시 전력 데이터
agg:hourly:{meterId}:{timestamp}        # 시간별 집계 데이터
agg:daily:{meterId}:{timestamp}         # 일별 집계 데이터
alert-rule:{timestamp}                  # 알람 규칙
alert:{timestamp}-{random}              # 발생 알람
job:{type}:{timestamp}                  # 집계 작업 이력
report:{type}:{period}:{building}:{timestamp} # 리포트
```

## 개발 가이드

### 컴포넌트 구조
```
components/
├── contexts/          # React Context (UserFlow)
├── ui/               # shadcn/ui 컴포넌트
├── data/             # 데이터 탐색 관련 (차트, 필터, 헬퍼)
├── buildings/        # 건물 관리 관련
├── zones/           # 구역 관리 관련
├── meters/          # 계측기 관리 관련
├── alerts/          # 알람 관련
├── reports/         # 리포트 관련
└── *.tsx           # 메인 페이지 컴포넌트
```

### API 헬퍼 사용
```typescript
import { buildingsApi, validateForm } from '../utils/api'

// 건물 목록 조회
const result = await buildingsApi.list()

// 폼 검증과 함께 건물 생성
try {
  validateForm.required(data.name, '건물명')
  validateForm.positiveNumber(data.area, '면적')
  const result = await buildingsApi.create(data)
} catch (error) {
  handleApiError(error)
}
```

### 에러 처리 및 검증
- **폼 검증**: 클라이언트/서버 양쪽 검증
- **자동 토스트**: 성공/실패 메시지 자동 표시
- **로딩 상태**: 모든 비동기 작업에 로딩 인디케이터
- **에러 복구**: 사용자 친화적인 에러 메시지 및 재시도 옵션

## 성능 최적화

- **데이터 집계**: 원시 데이터를 시간별/일별로 미리 집계하여 조회 성능 향상
- **필터링**: 서버 단에서 날짜/건물/계측기별 필터링
- **제한**: 대량 데이터 조회 시 limit 파라미터로 성능 보호
- **캐싱**: 리포트 데이터 임시 캐싱
- **컴포넌트 분할**: 큰 컴포넌트를 작은 단위로 분할하여 렌더링 최적화

## 보안 고려사항

- **인증 우회**: 데모 모드는 개발/테스트 환경에서만 사용
- **입력 검증**: 모든 사용자 입력에 대한 서버 단 검증
- **권한 분리**: 관리자/운영자 역할별 기능 접근 제어
- **데이터 보호**: 민감한 API 키는 환경 변수로 관리

## 배포

### 프로덕션 빌드
```bash
npm run build
```

### 환경 변수 설정
- `DEMO_MODE=false` (프로덕션에서는 실제 인증 사용)
- 실제 Supabase 프로젝트 정보 설정
- 서버 환경변수에 API 키들 안전하게 저장

## 트러블슈팅

### 자주 발생하는 문제

1. **API 호출 실패**
   - `.env` 파일의 환경 변수 확인
   - `DEMO_MODE=true` 설정 여부 확인
   - 네트워크 연결 상태 확인

2. **데이터 업로드 실패**
   - CSV 파일 형식 확인 (필수 컬럼 포함 여부)
   - 계측기 번호가 시스템에 등록되어 있는지 확인 (MT-XXX 형식)
   - 파일 크기 제한 확인
   - 날짜 형식이 ISO 8601 표준인지 확인

3. **집계 작업 실패**
   - 원시 데이터가 충분히 있는지 확인
   - 서버 리소스 상태 확인
   - 날짜 범위가 적절한지 확인

4. **권한 오류**
   - 데모 모드 설정 확인
   - API 헤더 설정 확인
   - 사용자 역할이 올바른지 확인

5. **차트 표시 문제**
   - 데이터 형식이 올바른지 확인
   - 날짜 필터 범위 확인
   - 브라우저 콘솔에서 에러 메시지 확인

## 라이선스

이 프로젝트는 KT의 내부 프로젝트입니다.

## 지원

문제 발생 시 개발팀에 문의하세요.

## 변경 이력

### v1.0.0 (완성)
- ✅ 전체 시스템 아키텍처 구현
- ✅ 관리자/운영자 역할 기반 접근 제어
- ✅ 건물/구역/계측기 완전한 CRUD
- ✅ CSV 데이터 업로드 및 검증
- ✅ 실시간 데이터 집계 시스템
- ✅ 알람 규칙 엔진 및 상태 관리
- ✅ 인터랙티브 대시보드 (실데이터 기반)
- ✅ 데이터 탐색 (원시/집계 데이터 시각화)
- ✅ 동적 리포트 생성 시스템
- ✅ 폼 검증 및 에러 처리
- ✅ 토스트 알림 시스템
- ✅ 데모 모드 인증 우회
- ✅ 컴포넌트 모듈화 및 성능 최적화
```

## 주요 구현 완료 사항 (Day 3)

✅ **Data Explorer 완전 구현**: 원시/집계 데이터 시각화, 필터링, 차트, 통계, CSV 내보내기  
✅ **리포트 시스템 연동**: 실제 API 기반 리포트 생성/조회, 동적 분석  
✅ **MeterManagement 구현**: 계측기 CRUD, 유효성 검증, 연결 상태  
✅ **컴포넌트 모듈화**: DataChart, DataFilters, DataStats 등으로 분할  
✅ **헬퍼 함수 분리**: 데이터 처리, 검증, 내보내기 로직 분리  
✅ **상수 추출**: 색상, 라벨, 옵션 등을 별도 파일로 관리  
✅ **폼 검증 강화**: 클라이언트/서버 양쪽 입력 검증  
✅ **에러 처리 개선**: 사용자 친화적 메시지, 자동 토스트  
✅ **README 완성**: 전체 시스템 가이드 및 API 문서