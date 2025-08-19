import * as kv from './kv_store.tsx'

// 관계형 데이터 구조를 시뮬레이션하는 KV Store 기반 데이터베이스 서비스
export class DatabaseService {
  
  // 키 생성 헬퍼 함수들
  private static generateId(): string {
    return 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36)
  }

  private static buildingKey(id?: string): string {
    return id ? `building:${id}` : 'buildings'
  }

  private static zoneKey(id?: string): string {
    return id ? `zone:${id}` : 'zones'
  }

  private static meterKey(id?: string): string {
    return id ? `meter:${id}` : 'meters'
  }

  private static readingKey(id?: string): string {
    return id ? `reading:${id}` : 'readings'
  }

  private static aggregateKey(type: string, meterId?: string, timestamp?: string): string {
    if (meterId && timestamp) {
      return `aggregate:${type}:${meterId}:${timestamp}`
    }
    return `aggregates:${type}`
  }

  private static alertRuleKey(id?: string): string {
    return id ? `alert_rule:${id}` : 'alert_rules'
  }

  private static alertKey(id?: string): string {
    return id ? `alert:${id}` : 'alerts'
  }

  private static jobKey(id?: string): string {
    return id ? `job:${id}` : 'jobs'
  }

  private static reportKey(id?: string): string {
    return id ? `report:${id}` : 'reports'
  }

  // 건물 관리
  static async getBuildings() {
    try {
      const buildingIds = await kv.get(this.buildingKey()) || []
      const buildings = []
      
      for (const id of buildingIds) {
        const building = await kv.get(this.buildingKey(id))
        if (building) {
          buildings.push(building)
        }
      }
      
      return buildings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching buildings:', error)
      return []
    }
  }

  static async createBuilding(building: any) {
    try {
      const id = this.generateId()
      const newBuilding = {
        id,
        ...building,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 건물 데이터 저장
      await kv.set(this.buildingKey(id), newBuilding)
      
      // 건물 ID 목록 업데이트
      const buildingIds = await kv.get(this.buildingKey()) || []
      buildingIds.push(id)
      await kv.set(this.buildingKey(), buildingIds)
      
      return newBuilding
    } catch (error) {
      console.error('Error creating building:', error)
      throw error
    }
  }

  static async updateBuilding(id: string, updates: any) {
    try {
      const existing = await kv.get(this.buildingKey(id))
      if (!existing) {
        throw new Error('Building not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.buildingKey(id), updated)
      return updated
    } catch (error) {
      console.error('Error updating building:', error)
      throw error
    }
  }

  static async deleteBuilding(id: string) {
    try {
      // 건물 데이터 삭제
      await kv.del(this.buildingKey(id))
      
      // 건물 ID 목록에서 제거
      const buildingIds = await kv.get(this.buildingKey()) || []
      const updatedIds = buildingIds.filter((buildingId: string) => buildingId !== id)
      await kv.set(this.buildingKey(), updatedIds)
      
      // 관련 구역들도 삭제 (CASCADE)
      const zones = await this.getZones(id)
      for (const zone of zones) {
        await this.deleteZone(zone.id)
      }
    } catch (error) {
      console.error('Error deleting building:', error)
      throw error
    }
  }

  // 구역 관리
  static async getZones(buildingId?: string) {
    try {
      const zoneIds = await kv.get(this.zoneKey()) || []
      const zones = []
      
      for (const id of zoneIds) {
        const zone = await kv.get(this.zoneKey(id))
        if (zone && (!buildingId || zone.building_id === buildingId)) {
          // 건물 정보 추가
          const building = await kv.get(this.buildingKey(zone.building_id))
          zones.push({
            ...zone,
            buildings: building ? { name: building.name } : null
          })
        }
      }
      
      return zones.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching zones:', error)
      return []
    }
  }

  static async createZone(zone: any) {
    try {
      const id = this.generateId()
      const newZone = {
        id,
        ...zone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 구역 데이터 저장
      await kv.set(this.zoneKey(id), newZone)
      
      // 구역 ID 목록 업데이트
      const zoneIds = await kv.get(this.zoneKey()) || []
      zoneIds.push(id)
      await kv.set(this.zoneKey(), zoneIds)
      
      // 건물 정보 추가
      const building = await kv.get(this.buildingKey(zone.building_id))
      return {
        ...newZone,
        buildings: building ? { name: building.name } : null
      }
    } catch (error) {
      console.error('Error creating zone:', error)
      throw error
    }
  }

  static async updateZone(id: string, updates: any) {
    try {
      const existing = await kv.get(this.zoneKey(id))
      if (!existing) {
        throw new Error('Zone not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.zoneKey(id), updated)
      
      // 건물 정보 추가
      const building = await kv.get(this.buildingKey(updated.building_id))
      return {
        ...updated,
        buildings: building ? { name: building.name } : null
      }
    } catch (error) {
      console.error('Error updating zone:', error)
      throw error
    }
  }

  static async deleteZone(id: string) {
    try {
      // 구역 데이터 삭제
      await kv.del(this.zoneKey(id))
      
      // 구역 ID 목록에서 제거
      const zoneIds = await kv.get(this.zoneKey()) || []
      const updatedIds = zoneIds.filter((zoneId: string) => zoneId !== id)
      await kv.set(this.zoneKey(), updatedIds)
      
      // 관련 계측기들도 삭제 (CASCADE)
      const meters = await this.getMeters(id)
      for (const meter of meters) {
        await this.deleteMeter(meter.id)
      }
    } catch (error) {
      console.error('Error deleting zone:', error)
      throw error
    }
  }

  // 계측기 관리
  static async getMeters(zoneId?: string) {
    try {
      const meterIds = await kv.get(this.meterKey()) || []
      const meters = []
      
      for (const id of meterIds) {
        const meter = await kv.get(this.meterKey(id))
        if (meter && (!zoneId || meter.zone_id === zoneId)) {
          // 구역 및 건물 정보 추가
          const zone = await kv.get(this.zoneKey(meter.zone_id))
          let zoneInfo = null
          if (zone) {
            const building = await kv.get(this.buildingKey(zone.building_id))
            zoneInfo = {
              name: zone.name,
              buildings: building ? { name: building.name } : null
            }
          }
          
          meters.push({
            ...meter,
            zones: zoneInfo
          })
        }
      }
      
      return meters.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching meters:', error)
      return []
    }
  }

  static async createMeter(meter: any) {
    try {
      const id = this.generateId()
      const newMeter = {
        id,
        ...meter,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // 계측기 데이터 저장
      await kv.set(this.meterKey(id), newMeter)
      
      // 계측기 ID 목록 업데이트
      const meterIds = await kv.get(this.meterKey()) || []
      meterIds.push(id)
      await kv.set(this.meterKey(), meterIds)
      
      // 구역 및 건물 정보 추가
      const zone = await kv.get(this.zoneKey(meter.zone_id))
      let zoneInfo = null
      if (zone) {
        const building = await kv.get(this.buildingKey(zone.building_id))
        zoneInfo = {
          name: zone.name,
          buildings: building ? { name: building.name } : null
        }
      }
      
      return {
        ...newMeter,
        zones: zoneInfo
      }
    } catch (error) {
      console.error('Error creating meter:', error)
      throw error
    }
  }

  static async updateMeter(id: string, updates: any) {
    try {
      const existing = await kv.get(this.meterKey(id))
      if (!existing) {
        throw new Error('Meter not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.meterKey(id), updated)
      
      // 구역 및 건물 정보 추가
      const zone = await kv.get(this.zoneKey(updated.zone_id))
      let zoneInfo = null
      if (zone) {
        const building = await kv.get(this.buildingKey(zone.building_id))
        zoneInfo = {
          name: zone.name,
          buildings: building ? { name: building.name } : null
        }
      }
      
      return {
        ...updated,
        zones: zoneInfo
      }
    } catch (error) {
      console.error('Error updating meter:', error)
      throw error
    }
  }

  static async deleteMeter(id: string) {
    try {
      // 계측기 데이터 삭제
      await kv.del(this.meterKey(id))
      
      // 계측기 ID 목록에서 제거
      const meterIds = await kv.get(this.meterKey()) || []
      const updatedIds = meterIds.filter((meterId: string) => meterId !== id)
      await kv.set(this.meterKey(), updatedIds)
      
      // 관련 읽기 데이터들도 삭제 (CASCADE)
      const readingIds = await kv.get(this.readingKey()) || []
      const readingsToDelete = []
      for (const readingId of readingIds) {
        const reading = await kv.get(this.readingKey(readingId))
        if (reading && reading.meter_id === id) {
          readingsToDelete.push(readingId)
        }
      }
      
      for (const readingId of readingsToDelete) {
        await kv.del(this.readingKey(readingId))
      }
      
      const updatedReadingIds = readingIds.filter((readingId: string) => !readingsToDelete.includes(readingId))
      await kv.set(this.readingKey(), updatedReadingIds)
    } catch (error) {
      console.error('Error deleting meter:', error)
      throw error
    }
  }

  // 전력 데이터 관리
  static async getReadings(options: {
    meterId?: string,
    from?: string,
    to?: string,
    limit?: number
  } = {}) {
    try {
      const readingIds = await kv.get(this.readingKey()) || []
      const readings = []
      
      for (const id of readingIds) {
        const reading = await kv.get(this.readingKey(id))
        if (!reading) continue
        
        // 필터 적용
        if (options.meterId && reading.meter_id !== options.meterId) continue
        if (options.from && new Date(reading.timestamp) < new Date(options.from)) continue
        if (options.to && new Date(reading.timestamp) > new Date(options.to)) continue
        
        // 계측기 정보 추가
        const meter = await kv.get(this.meterKey(reading.meter_id))
        let meterInfo = null
        if (meter) {
          const zone = await kv.get(this.zoneKey(meter.zone_id))
          if (zone) {
            const building = await kv.get(this.buildingKey(zone.building_id))
            meterInfo = {
              meter_no: meter.meter_no,
              name: meter.name,
              zones: {
                name: zone.name,
                buildings: building ? { name: building.name } : null
              }
            }
          }
        }
        
        readings.push({
          ...reading,
          meters: meterInfo
        })
      }
      
      // 정렬 및 제한
      readings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      if (options.limit) {
        return readings.slice(0, options.limit)
      }
      
      return readings
    } catch (error) {
      console.error('Error fetching readings:', error)
      return []
    }
  }

  static async createReadings(readings: any[]) {
    try {
      const readingIds = await kv.get(this.readingKey()) || []
      const newReadings = []
      
      for (const reading of readings) {
        const id = this.generateId()
        const newReading = {
          id,
          ...reading,
          created_at: new Date().toISOString()
        }
        
        await kv.set(this.readingKey(id), newReading)
        readingIds.push(id)
        newReadings.push(newReading)
      }
      
      await kv.set(this.readingKey(), readingIds)
      return newReadings
    } catch (error) {
      console.error('Error creating readings:', error)
      throw error
    }
  }

  // 집계 데이터 관리
  static async getAggregates(type: 'hourly' | 'daily', options: {
    from?: string,
    to?: string,
    meterId?: string,
    buildingName?: string
  } = {}) {
    try {
      const aggregateIds = await kv.get(this.aggregateKey(type)) || []
      const aggregates = []
      
      for (const id of aggregateIds) {
        const aggregate = await kv.get(this.aggregateKey(type, undefined, id))
        if (!aggregate) continue
        
        // 필터 적용
        if (options.meterId && aggregate.meter_id !== options.meterId) continue
        if (options.from && new Date(aggregate.timestamp) < new Date(options.from)) continue
        if (options.to && new Date(aggregate.timestamp) > new Date(options.to)) continue
        
        // 계측기 정보 추가
        const meter = await kv.get(this.meterKey(aggregate.meter_id))
        let meterInfo = null
        if (meter) {
          const zone = await kv.get(this.zoneKey(meter.zone_id))
          if (zone) {
            const building = await kv.get(this.buildingKey(zone.building_id))
            meterInfo = {
              meter_no: meter.meter_no,
              name: meter.name,
              zones: {
                name: zone.name,
                buildings: building ? { name: building.name } : null
              }
            }
            
            // 건물명 필터
            if (options.buildingName && building?.name !== options.buildingName) continue
          }
        }
        
        aggregates.push({
          ...aggregate,
          meters: meterInfo
        })
      }
      
      return aggregates.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('Error fetching aggregates:', error)
      return []
    }
  }

  static async createAggregates(aggregates: any[]) {
    try {
      const results = []
      
      for (const agg of aggregates) {
        const type = agg.type
        const aggregateIds = await kv.get(this.aggregateKey(type)) || []
        
        const id = this.generateId()
        const newAggregate = {
          id,
          ...agg,
          created_at: new Date().toISOString()
        }
        
        await kv.set(this.aggregateKey(type, undefined, id), newAggregate)
        aggregateIds.push(id)
        await kv.set(this.aggregateKey(type), aggregateIds)
        
        results.push(newAggregate)
      }
      
      return results
    } catch (error) {
      console.error('Error creating aggregates:', error)
      return []
    }
  }

  // 기타 메서드들 (알람 규칙, 알람, 작업, 리포트)도 비슷한 패턴으로 구현
  static async getAlertRules() {
    try {
      const ruleIds = await kv.get(this.alertRuleKey()) || []
      const rules = []
      
      for (const id of ruleIds) {
        const rule = await kv.get(this.alertRuleKey(id))
        if (rule) {
          rules.push(rule)
        }
      }
      
      return rules.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching alert rules:', error)
      return []
    }
  }

  static async createAlertRule(rule: any) {
    try {
      const id = this.generateId()
      const newRule = {
        id,
        ...rule,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.alertRuleKey(id), newRule)
      
      const ruleIds = await kv.get(this.alertRuleKey()) || []
      ruleIds.push(id)
      await kv.set(this.alertRuleKey(), ruleIds)
      
      return newRule
    } catch (error) {
      console.error('Error creating alert rule:', error)
      throw error
    }
  }

  static async updateAlertRule(id: string, updates: any) {
    try {
      const existing = await kv.get(this.alertRuleKey(id))
      if (!existing) {
        throw new Error('Alert rule not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.alertRuleKey(id), updated)
      return updated
    } catch (error) {
      console.error('Error updating alert rule:', error)
      throw error
    }
  }

  static async deleteAlertRule(id: string) {
    try {
      await kv.del(this.alertRuleKey(id))
      
      const ruleIds = await kv.get(this.alertRuleKey()) || []
      const updatedIds = ruleIds.filter((ruleId: string) => ruleId !== id)
      await kv.set(this.alertRuleKey(), updatedIds)
    } catch (error) {
      console.error('Error deleting alert rule:', error)
      throw error
    }
  }

  static async getAlerts(status?: string) {
    try {
      const alertIds = await kv.get(this.alertKey()) || []
      const alerts = []
      
      for (const id of alertIds) {
        const alert = await kv.get(this.alertKey(id))
        if (alert && (!status || alert.status === status)) {
          alerts.push(alert)
        }
      }
      
      return alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching alerts:', error)
      return []
    }
  }

  static async createAlert(alert: any) {
    try {
      const id = this.generateId()
      const newAlert = {
        id,
        ...alert,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.alertKey(id), newAlert)
      
      const alertIds = await kv.get(this.alertKey()) || []
      alertIds.push(id)
      await kv.set(this.alertKey(), alertIds)
      
      return newAlert
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  }

  static async updateAlert(id: string, updates: any) {
    try {
      const existing = await kv.get(this.alertKey(id))
      if (!existing) {
        throw new Error('Alert not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.alertKey(id), updated)
      return updated
    } catch (error) {
      console.error('Error updating alert:', error)
      throw error
    }
  }

  static async getJobs() {
    try {
      const jobIds = await kv.get(this.jobKey()) || []
      const jobs = []
      
      for (const id of jobIds) {
        const job = await kv.get(this.jobKey(id))
        if (job) {
          jobs.push(job)
        }
      }
      
      return jobs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  static async createJob(job: any) {
    try {
      const id = this.generateId()
      const newJob = {
        id,
        ...job,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.jobKey(id), newJob)
      
      const jobIds = await kv.get(this.jobKey()) || []
      jobIds.push(id)
      await kv.set(this.jobKey(), jobIds)
      
      return newJob
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }

  static async updateJob(id: string, updates: any) {
    try {
      const existing = await kv.get(this.jobKey(id))
      if (!existing) {
        throw new Error('Job not found')
      }
      
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date().toISOString()
      }
      
      await kv.set(this.jobKey(id), updated)
      return updated
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  static async getReports(options: { type?: string, period?: string } = {}) {
    try {
      const reportIds = await kv.get(this.reportKey()) || []
      const reports = []
      
      for (const id of reportIds) {
        const report = await kv.get(this.reportKey(id))
        if (report) {
          // 필터 적용
          if (options.type && report.type !== options.type) continue
          if (options.period && report.period !== options.period) continue
          
          reports.push(report)
        }
      }
      
      return reports.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } catch (error) {
      console.error('Error fetching reports:', error)
      return []
    }
  }

  static async createReport(report: any) {
    try {
      const id = this.generateId()
      const newReport = {
        id,
        ...report,
        created_at: new Date().toISOString()
      }
      
      await kv.set(this.reportKey(id), newReport)
      
      const reportIds = await kv.get(this.reportKey()) || []
      reportIds.push(id)
      await kv.set(this.reportKey(), reportIds)
      
      return newReport
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  }

  static async getReportById(id: string) {
    try {
      const report = await kv.get(this.reportKey(id))
      return report
    } catch (error) {
      console.error('Error fetching report:', error)
      return null
    }
  }

  // 대시보드 데이터
  static async getDashboardData() {
    try {
      // 카운트 계산
      const buildings = await this.getBuildings()
      const zones = await this.getZones()
      const meters = await this.getMeters()
      const activeAlerts = await this.getAlerts('active')

      // 최근 읽기 데이터
      const recentReadings = await this.getReadings({ limit: 100 })

      return {
        buildings: buildings.length,
        zones: zones.length,
        meters: meters.length,
        activeAlerts: activeAlerts.length,
        recentReadings
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // 테이블이 없을 경우 기본값 반환
      return {
        buildings: 0,
        zones: 0,
        meters: 0,
        activeAlerts: 0,
        recentReadings: []
      }
    }
  }
}