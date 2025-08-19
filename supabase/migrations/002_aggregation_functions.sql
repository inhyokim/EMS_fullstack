-- PostgreSQL 집계 함수 생성

-- 시간별/일별 집계를 위한 함수
CREATE OR REPLACE FUNCTION aggregate_readings(
  p_type TEXT,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
  meter_id UUID,
  timestamp TIMESTAMPTZ,
  count INTEGER,
  sum_value DECIMAL,
  avg_value DECIMAL,
  min_value DECIMAL,
  max_value DECIMAL
) AS $$
BEGIN
  IF p_type = 'hourly' THEN
    RETURN QUERY
    SELECT 
      r.meter_id,
      date_trunc('hour', r.timestamp) as timestamp,
      COUNT(*)::INTEGER as count,
      SUM(r.value) as sum_value,
      AVG(r.value) as avg_value,
      MIN(r.value) as min_value,
      MAX(r.value) as max_value
    FROM readings r
    WHERE r.timestamp >= p_start_time 
      AND r.timestamp <= p_end_time
    GROUP BY r.meter_id, date_trunc('hour', r.timestamp)
    ORDER BY timestamp DESC;
    
  ELSIF p_type = 'daily' THEN
    RETURN QUERY
    SELECT 
      r.meter_id,
      date_trunc('day', r.timestamp) as timestamp,
      COUNT(*)::INTEGER as count,
      SUM(r.value) as sum_value,
      AVG(r.value) as avg_value,
      MIN(r.value) as min_value,
      MAX(r.value) as max_value
    FROM readings r
    WHERE r.timestamp >= p_start_time 
      AND r.timestamp <= p_end_time
    GROUP BY r.meter_id, date_trunc('day', r.timestamp)
    ORDER BY timestamp DESC;
    
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 대시보드용 통계 함수
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_buildings', (SELECT COUNT(*) FROM buildings),
    'total_zones', (SELECT COUNT(*) FROM zones),
    'total_meters', (SELECT COUNT(*) FROM meters WHERE status = 'active'),
    'active_alerts', (SELECT COUNT(*) FROM alerts WHERE status = 'active'),
    'total_readings', (SELECT COUNT(*) FROM readings WHERE timestamp >= NOW() - INTERVAL '24 hours'),
    'avg_consumption_today', (
      SELECT COALESCE(AVG(value), 0) 
      FROM readings 
      WHERE timestamp >= date_trunc('day', NOW())
    ),
    'peak_consumption_today', (
      SELECT COALESCE(MAX(value), 0) 
      FROM readings 
      WHERE timestamp >= date_trunc('day', NOW())
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 건물별 소비량 비교 함수
CREATE OR REPLACE FUNCTION get_building_consumption_comparison(
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '7 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  building_name TEXT,
  total_consumption DECIMAL,
  avg_consumption DECIMAL,
  meter_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as building_name,
    COALESCE(SUM(r.value), 0) as total_consumption,
    COALESCE(AVG(r.value), 0) as avg_consumption,
    COUNT(DISTINCT m.id) as meter_count
  FROM buildings b
    LEFT JOIN zones z ON z.building_id = b.id
    LEFT JOIN meters m ON m.zone_id = z.id
    LEFT JOIN readings r ON r.meter_id = m.id 
      AND r.timestamp >= p_start_date 
      AND r.timestamp <= p_end_date
  GROUP BY b.id, b.name
  ORDER BY total_consumption DESC;
END;
$$ LANGUAGE plpgsql;

-- 알람 통계 함수
CREATE OR REPLACE FUNCTION get_alert_statistics(
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_alerts', (
      SELECT COUNT(*) 
      FROM alerts 
      WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    'by_severity', (
      SELECT json_object_agg(severity, count)
      FROM (
        SELECT severity, COUNT(*) as count
        FROM alerts 
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY severity
      ) t
    ),
    'by_status', (
      SELECT json_object_agg(status, count)
      FROM (
        SELECT status, COUNT(*) as count
        FROM alerts 
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
        GROUP BY status
      ) t
    ),
    'resolution_rate', (
      SELECT 
        CASE 
          WHEN total_count > 0 THEN 
            ROUND((resolved_count::DECIMAL / total_count::DECIMAL) * 100, 2)
          ELSE 0 
        END
      FROM (
        SELECT 
          COUNT(*) as total_count,
          COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count
        FROM alerts 
        WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL
      ) counts
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 에너지 효율성 분석 함수
CREATE OR REPLACE FUNCTION analyze_energy_efficiency(
  p_building_id UUID DEFAULT NULL,
  p_days INTEGER DEFAULT 30
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'average_consumption_per_area', (
      SELECT 
        CASE 
          WHEN SUM(z.area) > 0 THEN 
            SUM(daily_avg.avg_consumption) / SUM(z.area)
          ELSE 0 
        END
      FROM (
        SELECT 
          m.zone_id,
          AVG(r.value) as avg_consumption
        FROM readings r
          JOIN meters m ON m.id = r.meter_id
          JOIN zones z ON z.id = m.zone_id
          JOIN buildings b ON b.id = z.building_id
        WHERE r.timestamp >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_building_id IS NULL OR b.id = p_building_id)
        GROUP BY m.zone_id
      ) daily_avg
        JOIN zones z ON z.id = daily_avg.zone_id
    ),
    'peak_hours', (
      SELECT json_agg(
        json_build_object(
          'hour', hour_of_day,
          'avg_consumption', avg_consumption
        )
      )
      FROM (
        SELECT 
          EXTRACT(HOUR FROM r.timestamp) as hour_of_day,
          AVG(r.value) as avg_consumption
        FROM readings r
          JOIN meters m ON m.id = r.meter_id
          JOIN zones z ON z.id = m.zone_id
          JOIN buildings b ON b.id = z.building_id
        WHERE r.timestamp >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_building_id IS NULL OR b.id = p_building_id)
        GROUP BY EXTRACT(HOUR FROM r.timestamp)
        ORDER BY avg_consumption DESC
        LIMIT 5
      ) peak_hours
    ),
    'efficiency_trend', (
      SELECT json_agg(
        json_build_object(
          'date', consumption_date,
          'consumption_per_area', consumption_per_area
        )
      )
      FROM (
        SELECT 
          DATE(r.timestamp) as consumption_date,
          SUM(r.value) / NULLIF(SUM(z.area), 0) as consumption_per_area
        FROM readings r
          JOIN meters m ON m.id = r.meter_id
          JOIN zones z ON z.id = m.zone_id
          JOIN buildings b ON b.id = z.building_id
        WHERE r.timestamp >= NOW() - (p_days || ' days')::INTERVAL
          AND (p_building_id IS NULL OR b.id = p_building_id)
        GROUP BY DATE(r.timestamp)
        ORDER BY consumption_date DESC
        LIMIT 30
      ) daily_efficiency
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 자동 데이터 정리 함수 (오래된 데이터 삭제)
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- 3개월 이상 된 readings 삭제
  DELETE FROM readings 
  WHERE timestamp < NOW() - INTERVAL '3 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- 6개월 이상 된 resolved alerts 삭제
  DELETE FROM alerts 
  WHERE status = 'resolved' 
    AND resolved_at < NOW() - INTERVAL '6 months';
  
  -- 1년 이상 된 failed jobs 삭제
  DELETE FROM jobs 
  WHERE status = 'failed' 
    AND created_at < NOW() - INTERVAL '1 year';
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 정기 정리 작업을 위한 스케줄러 (pg_cron 사용 시)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');