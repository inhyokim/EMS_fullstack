-- KT 스마트빌딩 EMS Lite 데이터베이스 스키마

-- 사용자 테이블 (Supabase Auth와 연동)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'operator')),
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 건물 테이블
CREATE TABLE buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  area DECIMAL(10,2), -- 면적 (㎡)
  floors INTEGER, -- 층수
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 구역 테이블
CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  floor INTEGER NOT NULL,
  area DECIMAL(10,2), -- 면적 (㎡)
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 계측기 테이블
CREATE TABLE meters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  meter_no VARCHAR(50) UNIQUE NOT NULL, -- 계측기 번호 (MT-001 등)
  type VARCHAR(50) NOT NULL CHECK (type IN ('electric', 'gas', 'water')),
  location VARCHAR(255),
  installation_date DATE,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 전력 데이터 테이블 (원시 데이터)
CREATE TABLE readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
  value DECIMAL(15,6) NOT NULL, -- 전력 사용량 (kWh)
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  quality VARCHAR(50) DEFAULT 'good' CHECK (quality IN ('good', 'estimated', 'invalid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 집계 데이터 테이블 (시간별/일별 집계)
CREATE TABLE aggregates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_id UUID NOT NULL REFERENCES meters(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('hourly', 'daily', 'monthly')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  count INTEGER NOT NULL, -- 집계된 데이터 포인트 수
  sum_value DECIMAL(15,6) NOT NULL, -- 총합
  avg_value DECIMAL(15,6) NOT NULL, -- 평균
  min_value DECIMAL(15,6) NOT NULL, -- 최소값
  max_value DECIMAL(15,6) NOT NULL, -- 최대값
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meter_id, type, timestamp)
);

-- 알람 규칙 테이블
CREATE TABLE alert_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('consumption', 'peak', 'efficiency', 'anomaly')),
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('above', 'below', 'equals')),
  threshold DECIMAL(15,6) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  severity VARCHAR(50) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  building_id UUID REFERENCES buildings(id),
  zone_id UUID REFERENCES zones(id),
  meter_id UUID REFERENCES meters(id),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 알람 테이블
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES alert_rules(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
  building_name VARCHAR(255),
  zone_name VARCHAR(255),
  meter_id UUID REFERENCES meters(id),
  current_value DECIMAL(15,6),
  threshold_value DECIMAL(15,6),
  unit VARCHAR(50),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 작업(배치) 테이블
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN ('hourly_aggregation', 'daily_aggregation', 'alert_check', 'report_generation')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  target_date TIMESTAMP WITH TIME ZONE,
  building_id UUID REFERENCES buildings(id),
  zone_id UUID REFERENCES zones(id),
  parameters JSONB,
  results JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 리포트 테이블
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL CHECK (type IN ('consumption', 'efficiency', 'cost', 'summary')),
  period VARCHAR(50) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  building_id UUID REFERENCES buildings(id),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  summary JSONB, -- 리포트 요약 데이터
  charts JSONB, -- 차트 데이터
  recommendations JSONB, -- 권장사항
  file_path VARCHAR(500), -- 생성된 파일 경로
  file_size VARCHAR(50),
  format VARCHAR(50) DEFAULT 'PDF',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_zones_building_id ON zones(building_id);
CREATE INDEX idx_meters_zone_id ON meters(zone_id);
CREATE INDEX idx_meters_meter_no ON meters(meter_no);
CREATE INDEX idx_readings_meter_id ON readings(meter_id);
CREATE INDEX idx_readings_timestamp ON readings(timestamp);
CREATE INDEX idx_aggregates_meter_id_type_timestamp ON aggregates(meter_id, type, timestamp);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_type ON jobs(type);

-- RLS (Row Level Security) 정책
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE meters ENABLE ROW LEVEL SECURITY;
ALTER TABLE readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 모든 데이터에 접근 가능 (데모용)
CREATE POLICY "Allow all for authenticated users" ON buildings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON zones FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON meters FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON readings FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON aggregates FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON alert_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON alerts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON jobs FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all for authenticated users" ON reports FOR ALL TO authenticated USING (true);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meters_updated_at BEFORE UPDATE ON meters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON alert_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();