import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { DatabaseService } from './database.tsx'

const app = new Hono()

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Demo-Key'],
}))

app.use('*', logger(console.log))

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

// 데모 모드 인증 우회 미들웨어
const requireAuth = async (c: any, next: any) => {
  const demoKey = c.req.header('X-Demo-Key')
  
  // Always allow demo mode if demo key is present
  if (demoKey === 'kt-ems-demo') {
    console.log('Demo mode: bypassing authentication with demo key')
    c.set('user', { id: 'demo-user', email: 'demo@kt.com' })
    await next()
    return
  }

  const accessToken = c.req.header('Authorization')?.split(' ')[1]
  if (!accessToken) {
    console.log('No access token provided')
    return c.json({ error: 'Unauthorized - No access token' }, 401)
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (!user || error) {
      console.log('Auth error:', error)
      return c.json({ error: 'Unauthorized - Invalid token' }, 401)
    }

    c.set('user', user)
    await next()
  } catch (error) {
    console.log('Auth exception:', error)
    return c.json({ error: 'Unauthorized - Auth exception' }, 401)
  }
}

// 집계 헬퍼 함수
const aggregateReadings = async (type: 'hourly' | 'daily', targetDate?: string) => {
  try {
    const endTime = targetDate ? new Date(targetDate) : new Date()
    let startTime: Date

    if (type === 'hourly') {
      startTime = new Date(endTime.getTime() - 24 * 60 * 60 * 1000) // 24시간 전
    } else {
      startTime = new Date(endTime.getTime() - 30 * 24 * 60 * 60 * 1000) // 30일 전
    }

    // 원시 데이터 가져오기
    const readings = await DatabaseService.getReadings({
      from: startTime.toISOString(),
      to: endTime.toISOString()
    })

    // 수동 집계
    const groups = new Map()
    
    readings.forEach((reading: any) => {
      const readingTime = new Date(reading.timestamp)
      let groupKey: string
      
      if (type === 'hourly') {
        groupKey = `${reading.meter_id}:${readingTime.getFullYear()}-${(readingTime.getMonth() + 1).toString().padStart(2, '0')}-${readingTime.getDate().toString().padStart(2, '0')}T${readingTime.getHours().toString().padStart(2, '0')}:00:00`
      } else {
        groupKey = `${reading.meter_id}:${readingTime.getFullYear()}-${(readingTime.getMonth() + 1).toString().padStart(2, '0')}-${readingTime.getDate().toString().padStart(2, '0')}`
      }
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          meter_id: reading.meter_id,
          values: []
        })
      }
      
      groups.get(groupKey).values.push(reading.value)
    })

    const aggregates = []
    for (const [key, group] of groups) {
      const [meterId, timestamp] = key.split(':')
      const values = group.values
      
      if (values.length === 0) continue
      
      const aggregate = {
        meter_id: meterId,
        type,
        timestamp,
        count: values.length,
        sum_value: values.reduce((a: number, b: number) => a + b, 0),
        avg_value: values.reduce((a: number, b: number) => a + b, 0) / values.length,
        min_value: Math.min(...values),
        max_value: Math.max(...values)
      }
      
      aggregates.push(aggregate)
    }

    // 집계 결과 저장
    if (aggregates.length > 0) {
      await DatabaseService.createAggregates(aggregates)
    }

    return aggregates
  } catch (error) {
    console.error('Error in aggregateReadings:', error)
    return []
  }
}

// 알람 규칙 검사
const checkAlertRules = async (aggregates: any[]) => {
  try {
    const rules = await DatabaseService.getAlertRules()
    const activeRules = rules.filter((rule: any) => rule.enabled)
    const newAlerts = []

    for (const rule of activeRules) {
      for (const agg of aggregates) {
        // 규칙 조건 확인
        if (rule.building_id && rule.building_id !== agg.meters?.zones?.buildings?.id) continue
        if (rule.zone_id && rule.zone_id !== agg.meters?.zones?.id) continue
        if (rule.meter_id && rule.meter_id !== agg.meter_id) continue

        let triggered = false
        let currentValue = agg.avg_value

        switch (rule.type) {
          case 'consumption':
            currentValue = agg.sum_value
            break
          case 'peak':
            currentValue = agg.max_value
            break
          case 'efficiency':
            currentValue = agg.avg_value
            break
          case 'anomaly':
            currentValue = agg.max_value
            break
        }

        // 임계치 비교
        switch (rule.condition) {
          case 'above':
            triggered = currentValue > rule.threshold
            break
          case 'below':
            triggered = currentValue < rule.threshold
            break
          case 'equals':
            triggered = Math.abs(currentValue - rule.threshold) < 0.01
            break
        }

        if (triggered) {
          const alert = {
            rule_id: rule.id,
            title: rule.name,
            description: rule.description,
            type: rule.type,
            severity: rule.severity,
            status: 'active',
            building_name: agg.meters?.zones?.buildings?.name,
            zone_name: agg.meters?.zones?.name,
            meter_id: agg.meter_id,
            current_value: currentValue,
            threshold_value: rule.threshold,
            unit: rule.unit,
            timestamp: agg.timestamp
          }

          const savedAlert = await DatabaseService.createAlert(alert)
          newAlerts.push(savedAlert)
        }
      }
    }

    return newAlerts
  } catch (error) {
    console.error('Error checking alert rules:', error)
    return []
  }
}

// API 엔드포인트들

// 헬스 체크
app.get('/make-server-ead5a09b/health', async (c) => {
  return c.json({ 
    success: true, 
    message: 'KT EMS Server is running',
    database: 'KV Store (PostgreSQL-like structure)',
    timestamp: new Date().toISOString()
  })
})

// 건물 관리 API
app.get('/make-server-ead5a09b/buildings', requireAuth, async (c) => {
  try {
    const buildings = await DatabaseService.getBuildings()
    return c.json({ success: true, data: buildings })
  } catch (error) {
    console.log('Error fetching buildings:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ead5a09b/buildings', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    
    // 입력 검증
    if (!body.name || !body.address) {
      return c.json({ success: false, error: '건물명과 주소는 필수 입력 항목입니다.' }, 400)
    }
    
    if (body.area && body.area <= 0) {
      return c.json({ success: false, error: '면적은 0보다 큰 값이어야 합니다.' }, 400)
    }
    
    if (body.floors && body.floors <= 0) {
      return c.json({ success: false, error: '층수는 0보다 큰 값이어야 합니다.' }, 400)
    }
    
    const building = await DatabaseService.createBuilding(body)
    return c.json({ success: true, data: building })
  } catch (error) {
    console.log('Error creating building:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ead5a09b/buildings/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const building = await DatabaseService.updateBuilding(id, body)
    return c.json({ success: true, data: building })
  } catch (error) {
    console.log('Error updating building:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ead5a09b/buildings/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    await DatabaseService.deleteBuilding(id)
    return c.json({ success: true, message: 'Building deleted successfully' })
  } catch (error) {
    console.log('Error deleting building:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 구역 관리 API
app.get('/make-server-ead5a09b/zones', requireAuth, async (c) => {
  try {
    const buildingId = c.req.query('buildingId')
    const zones = await DatabaseService.getZones(buildingId)
    return c.json({ success: true, data: zones })
  } catch (error) {
    console.log('Error fetching zones:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ead5a09b/zones', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    
    // 입력 검증
    if (!body.building_id || !body.name) {
      return c.json({ success: false, error: '건물과 구역명은 필수 입력 항목입니다.' }, 400)
    }
    
    if (body.floor <= 0 || body.area <= 0) {
      return c.json({ success: false, error: '층수와 면적은 0보다 큰 값이어야 합니다.' }, 400)
    }
    
    const zone = await DatabaseService.createZone(body)
    return c.json({ success: true, data: zone })
  } catch (error) {
    console.log('Error creating zone:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ead5a09b/zones/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const zone = await DatabaseService.updateZone(id, body)
    return c.json({ success: true, data: zone })
  } catch (error) {
    console.log('Error updating zone:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ead5a09b/zones/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    await DatabaseService.deleteZone(id)
    return c.json({ success: true, message: 'Zone deleted successfully' })
  } catch (error) {
    console.log('Error deleting zone:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 계측기 관리 API
app.get('/make-server-ead5a09b/meters', requireAuth, async (c) => {
  try {
    const zoneId = c.req.query('zoneId')
    const meters = await DatabaseService.getMeters(zoneId)
    return c.json({ success: true, data: meters })
  } catch (error) {
    console.log('Error fetching meters:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ead5a09b/meters', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    
    // 입력 검증
    if (!body.zone_id || !body.name || !body.meter_no) {
      return c.json({ success: false, error: '구역, 계측기명, 계측기 번호는 필수 입력 항목입니다.' }, 400)
    }
    
    const meter = await DatabaseService.createMeter(body)
    return c.json({ success: true, data: meter })
  } catch (error) {
    console.log('Error creating meter:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ead5a09b/meters/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const meter = await DatabaseService.updateMeter(id, body)
    return c.json({ success: true, data: meter })
  } catch (error) {
    console.log('Error updating meter:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ead5a09b/meters/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    await DatabaseService.deleteMeter(id)
    return c.json({ success: true, message: 'Meter deleted successfully' })
  } catch (error) {
    console.log('Error deleting meter:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 전력 데이터 API
app.post('/make-server-ead5a09b/readings', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    const readings = body.readings || [body]
    
    const validReadings = []
    const errors = []
    
    for (const reading of readings) {
      try {
        // 입력 검증
        if (!reading.value || reading.value <= 0) {
          errors.push('전력 사용량은 0보다 큰 값이어야 합니다.')
          continue
        }
        
        if (!reading.timestamp) {
          errors.push('측정 시간은 필수 입력 항목입니다.')
          continue
        }
        
        // meter_id 또는 meter_no로 계측기 찾기
        let meterId = reading.meter_id
        if (!meterId && reading.meter_no) {
          const meters = await DatabaseService.getMeters()
          const meter = meters.find((m: any) => m.meter_no === reading.meter_no)
          if (meter) {
            meterId = meter.id
          }
        }
        
        if (!meterId) {
          errors.push(`계측기를 찾을 수 없습니다: ${reading.meter_no || 'Unknown'}`)
          continue
        }
        
        validReadings.push({
          meter_id: meterId,
          value: reading.value,
          timestamp: new Date(reading.timestamp).toISOString(),
          quality: reading.quality || 'good'
        })
      } catch (error) {
        errors.push(`데이터 처리 오류: ${error.message}`)
      }
    }
    
    let savedReadings = []
    if (validReadings.length > 0) {
      savedReadings = await DatabaseService.createReadings(validReadings)
    }
    
    return c.json({ 
      success: true, 
      data: savedReadings, 
      processed: readings.length, 
      saved: savedReadings.length,
      errors: errors.slice(0, 10)
    })
  } catch (error) {
    console.log('Error saving readings:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.get('/make-server-ead5a09b/readings', requireAuth, async (c) => {
  try {
    const meterId = c.req.query('meterId')
    const from = c.req.query('from')
    const to = c.req.query('to')
    const limit = parseInt(c.req.query('limit') || '1000')
    
    const readings = await DatabaseService.getReadings({ meterId, from, to, limit })
    return c.json({ success: true, data: readings, total: readings.length })
  } catch (error) {
    console.log('Error fetching readings:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 집계 작업 API
app.post('/make-server-ead5a09b/jobs/aggregate/:type', requireAuth, async (c) => {
  try {
    const type = c.req.param('type') as 'hourly' | 'daily'
    const body = await c.req.json()
    const { targetDate, buildingId, zoneId } = body
    
    if (!['hourly', 'daily'].includes(type)) {
      return c.json({ success: false, error: 'Invalid aggregation type' }, 400)
    }
    
    // 작업 시작 기록
    const job = await DatabaseService.createJob({
      type: `${type}_aggregation`,
      status: 'running',
      target_date: targetDate || new Date().toISOString(),
      building_id: buildingId,
      zone_id: zoneId,
      started_at: new Date().toISOString()
    })
    
    try {
      // 집계 실행
      const aggregates = await aggregateReadings(type, targetDate)
      
      // 알람 규칙 검사
      const newAlerts = await checkAlertRules(aggregates)
      
      // 작업 완료 기록
      const completedJob = await DatabaseService.updateJob(job.id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        results: {
          aggregatesCount: aggregates.length,
          alertsTriggered: newAlerts.length
        }
      })
      
      return c.json({ 
        success: true, 
        data: completedJob,
        aggregates: aggregates.slice(0, 10),
        alerts: newAlerts
      })
    } catch (aggregationError) {
      // 작업 실패 기록
      await DatabaseService.updateJob(job.id, {
        status: 'failed',
        completed_at: new Date().toISOString(),
        error_message: aggregationError.message
      })
      
      return c.json({ success: false, error: 'Aggregation failed', details: aggregationError.message }, 500)
    }
  } catch (error) {
    console.log('Error running aggregation job:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.get('/make-server-ead5a09b/jobs', requireAuth, async (c) => {
  try {
    const jobs = await DatabaseService.getJobs()
    return c.json({ success: true, data: jobs })
  } catch (error) {
    console.log('Error fetching jobs:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 집계 데이터 API
app.get('/make-server-ead5a09b/aggregates/:type', requireAuth, async (c) => {
  try {
    const type = c.req.param('type') as 'hourly' | 'daily'
    const from = c.req.query('from')
    const to = c.req.query('to')
    const meterId = c.req.query('meterId')
    const buildingName = c.req.query('buildingName')
    
    const aggregates = await DatabaseService.getAggregates(type, { from, to, meterId, buildingName })
    return c.json({ success: true, data: aggregates })
  } catch (error) {
    console.log('Error fetching aggregates:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 알람 규칙 API
app.get('/make-server-ead5a09b/alert-rules', requireAuth, async (c) => {
  try {
    const rules = await DatabaseService.getAlertRules()
    return c.json({ success: true, data: rules })
  } catch (error) {
    console.log('Error fetching alert rules:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ead5a09b/alert-rules', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    
    // 입력 검증
    if (!body.name || !body.type || !body.condition || !body.threshold || !body.unit || !body.severity) {
      return c.json({ success: false, error: '필수 입력 항목이 누락되었습니다.' }, 400)
    }
    
    const rule = await DatabaseService.createAlertRule(body)
    return c.json({ success: true, data: rule })
  } catch (error) {
    console.log('Error creating alert rule:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.put('/make-server-ead5a09b/alert-rules/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const rule = await DatabaseService.updateAlertRule(id, body)
    return c.json({ success: true, data: rule })
  } catch (error) {
    console.log('Error updating alert rule:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.delete('/make-server-ead5a09b/alert-rules/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    await DatabaseService.deleteAlertRule(id)
    return c.json({ success: true, message: 'Alert rule deleted successfully' })
  } catch (error) {
    console.log('Error deleting alert rule:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 알람 API
app.get('/make-server-ead5a09b/alerts', requireAuth, async (c) => {
  try {
    const status = c.req.query('status')
    const alerts = await DatabaseService.getAlerts(status)
    return c.json({ success: true, data: alerts })
  } catch (error) {
    console.log('Error fetching alerts:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.patch('/make-server-ead5a09b/alerts/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const updateData: any = { status: body.status }
    
    if (body.status === 'acknowledged') {
      updateData.acknowledged_at = new Date().toISOString()
      updateData.acknowledged_by = c.get('user').id
    } else if (body.status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
      updateData.resolved_by = c.get('user').id
    }
    
    const alert = await DatabaseService.updateAlert(id, updateData)
    return c.json({ success: true, data: alert })
  } catch (error) {
    console.log('Error updating alert:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 리포트 API
app.get('/make-server-ead5a09b/reports', requireAuth, async (c) => {
  try {
    const type = c.req.query('type')
    const period = c.req.query('period')
    const reports = await DatabaseService.getReports({ type, period })
    return c.json({ success: true, data: reports })
  } catch (error) {
    console.log('Error fetching reports:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.get('/make-server-ead5a09b/reports/:id', requireAuth, async (c) => {
  try {
    const id = c.req.param('id')
    const report = await DatabaseService.getReportById(id)
    return c.json({ success: true, data: report })
  } catch (error) {
    console.log('Error fetching report:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

app.post('/make-server-ead5a09b/reports/generate', requireAuth, async (c) => {
  try {
    const body = await c.req.json()
    const { type, period, building } = body
    
    // 리포트 생성 로직 (간소화된 버전)
    const now = new Date()
    let startDate: Date
    let endDate = now
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
    
    // 집계 데이터 가져오기
    const aggregates = await DatabaseService.getAggregates('daily', {
      from: startDate.toISOString(),
      to: endDate.toISOString(),
      buildingName: building === 'all' ? undefined : building
    })
    
    // 리포트 데이터 계산
    const totalConsumption = aggregates.reduce((sum: number, agg: any) => sum + agg.sum_value, 0)
    const avgConsumption = aggregates.length > 0 ? totalConsumption / aggregates.length : 0
    const peakPower = aggregates.length > 0 ? Math.max(...aggregates.map((agg: any) => agg.max_value)) : 0
    
    const report = await DatabaseService.createReport({
      title: `${getReportTypeLabel(type)} ${getPeriodLabel(period)} 리포트`,
      description: `${building === 'all' ? '전체 건물' : building}의 ${getPeriodLabel(period)} 에너지 사용량 분석 리포트`,
      type,
      period,
      building_id: building === 'all' ? null : building,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      summary: {
        totalConsumption: Math.round(totalConsumption),
        avgConsumption: Math.round(avgConsumption),
        peakPower: Math.round(peakPower),
        dataPoints: aggregates.length
      },
      charts: {
        consumptionTrend: aggregates.slice(0, 24).map((agg: any) => ({
          time: agg.timestamp,
          consumption: Math.round(agg.sum_value),
          peak: Math.round(agg.max_value)
        }))
      },
      recommendations: [
        {
          priority: 'medium',
          title: '에너지 효율성 개선',
          description: '정기적인 설비 점검을 통해 에너지 효율성을 향상시키세요.'
        }
      ],
      file_size: `${Math.round(Math.random() * 2000 + 500)} KB`,
      format: 'PDF',
      created_by: c.get('user').id
    })
    
    return c.json({ success: true, data: report })
  } catch (error) {
    console.log('Error generating report:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 대시보드 API
app.get('/make-server-ead5a09b/dashboard', requireAuth, async (c) => {
  try {
    const rawData = await DatabaseService.getDashboardData()
    
    // 최근 24시간 집계 데이터 가져오기
    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const hourlyAggregates = await DatabaseService.getAggregates('hourly', {
      from: yesterday.toISOString(),
      to: now.toISOString()
    })
    
    // 최근 알람 가져오기
    const recentAlerts = await DatabaseService.getAlerts()
    
    // 건물 목록 가져오기
    const buildings = await DatabaseService.getBuildings()
    
    // 기본 시계열 데이터 생성 (집계 데이터가 없을 경우)
    let timeSeriesData = []
    if (hourlyAggregates.length > 0) {
      timeSeriesData = hourlyAggregates.slice(0, 24).reverse().map((agg, index) => ({
        time: new Date(agg.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        consumption: Math.round(agg.sum_value || 0),
        peak: Math.round(agg.max_value || 0),
        average: Math.round(agg.avg_value || 0)
      }))
    } else {
      // 데모 데이터 생성
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        timeSeriesData.push({
          time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          consumption: Math.round(100 + Math.random() * 200),
          peak: Math.round(80 + Math.random() * 120),
          average: Math.round(90 + Math.random() * 100)
        })
      }
    }
    
    // Dashboard 컴포넌트가 기대하는 형태로 데이터 변환
    const totalConsumptionToday = hourlyAggregates.reduce((sum, agg) => sum + (agg.sum_value || 0), 0) || Math.round(Math.random() * 5000 + 2000)
    const peakPowerToday = hourlyAggregates.length > 0 ? Math.max(...hourlyAggregates.map(agg => agg.max_value || 0)) : Math.round(Math.random() * 500 + 200)
    
    const dashboardData = {
      summary: {
        totalBuildings: rawData.buildings,
        totalZones: rawData.zones,
        totalMeters: rawData.meters,
        activeAlerts: rawData.activeAlerts
      },
      kpis: {
        totalConsumptionToday,
        peakPowerToday,
        totalConsumptionMonth: totalConsumptionToday * 30, // 추정값
        avgEfficiency: Math.round(85 + Math.random() * 10), // 85-95% 범위의 임의값
        energyCost: Math.floor(totalConsumptionToday * 120), // kWh당 120원 가정
        co2Emission: Math.floor(totalConsumptionToday * 0.46) // kWh당 0.46kg CO2
      },
      timeSeriesData,
      buildingData: buildings.slice(0, 5).map((building, index) => {
        const consumption = 1000 + Math.random() * 5000
        return {
          name: building.name,
          consumption: Math.round(consumption),
          percentage: Math.round((consumption / (buildings.length * 3000)) * 100)
        }
      }),
      recentAlerts: recentAlerts.slice(0, 10).map(alert => ({
        id: alert.id,
        title: alert.title,
        severity: alert.severity,
        building: alert.building_name || '알 수 없음',
        timestamp: alert.timestamp,
        status: alert.status
      })),
      trends: {
        consumptionTrend: (Math.random() - 0.5) * 20, // -10% ~ +10% 범위
        peakTrend: (Math.random() - 0.5) * 15 // -7.5% ~ +7.5% 범위
      }
    }
    
    return c.json({ success: true, data: dashboardData })
  } catch (error) {
    console.log('Error fetching dashboard data:', error)
    
    // 오류 발생 시 기본 데이터 반환
    const fallbackData = {
      summary: {
        totalBuildings: 0,
        totalZones: 0,
        totalMeters: 0,
        activeAlerts: 0
      },
      kpis: {
        totalConsumptionToday: 0,
        peakPowerToday: 0,
        totalConsumptionMonth: 0,
        avgEfficiency: 0,
        energyCost: 0,
        co2Emission: 0
      },
      timeSeriesData: [],
      buildingData: [],
      recentAlerts: [],
      trends: {
        consumptionTrend: 0,
        peakTrend: 0
      }
    }
    
    return c.json({ success: true, data: fallbackData })
  }
})

// 시드 데이터 생성 (데모용)
app.post('/make-server-ead5a09b/seed', requireAuth, async (c) => {
  try {
    // 샘플 건물 생성
    const building = await DatabaseService.createBuilding({
      name: 'KT 본사',
      address: '서울시 종로구 종로 1',
      area: 15000.0,
      floors: 20,
      description: 'KT 본사 건물'
    })

    // 샘플 구역 생성
    const zone = await DatabaseService.createZone({
      building_id: building.id,
      name: '사무실 A동',
      floor: 5,
      area: 500.0,
      description: '5층 사무실 구역'
    })

    // 샘플 계측기 생성
    const meter = await DatabaseService.createMeter({
      zone_id: zone.id,
      name: '전력계측기 #1',
      meter_no: 'MT-001',
      type: 'electric',
      location: '5층 배전반',
      installation_date: '2024-01-01',
      status: 'active'
    })

    // 샘플 전력 데이터 생성
    const readings = []
    const now = new Date()
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000) // 1시간 간격
      readings.push({
        meter_id: meter.id,
        value: Math.random() * 100 + 50, // 50-150 kWh
        timestamp: timestamp.toISOString(),
        quality: 'good'
      })
    }
    
    await DatabaseService.createReadings(readings)

    return c.json({ 
      success: true, 
      message: '초기 데이터가 생성되었습니다.',
      data: { building, zone, meter, readingsCount: readings.length }
    })
  } catch (error) {
    console.log('Error creating seed data:', error)
    return c.json({ success: false, error: error.message }, 500)
  }
})

// 헬퍼 함수들
const getReportTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    consumption: '전력 사용량',
    efficiency: '에너지 효율성',
    cost: '전력 비용',
    summary: '종합'
  }
  return labels[type] || '종합'
}

const getPeriodLabel = (period: string) => {
  const labels: Record<string, string> = {
    daily: '일일',
    weekly: '주간',
    monthly: '월간'
  }
  return labels[period] || '주간'
}

Deno.serve(app.fetch)