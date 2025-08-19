import React from 'react';

interface RoleSelectProps {
  onRoleSelect: (role: 'admin' | 'operator') => void;
}

export function RoleSelect({ onRoleSelect }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">KT 스마트빌딩 EMS Lite</h1>
          <p className="text-xl text-muted-foreground">데이터 기반 건물 에너지 관리 시스템</p>
          <p className="text-muted-foreground mt-2">실시간 전력 모니터링 • 지능형 알람 • 에너지 최적화</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div 
            className="bg-card p-8 rounded-lg border-2 hover:border-blue-300 cursor-pointer transition-colors"
            onClick={() => onRoleSelect('admin')}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-2xl mb-2">관리자</h2>
              <p className="text-muted-foreground">시스템 전체 관리 권한</p>
            </div>
            
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                건물/구역/계측기 등록 및 관리
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                요금제 설정 및 알람 규칙 관리
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                데이터 수집 및 집계 작업
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                보고서 생성 및 내보내기
              </li>
            </ul>
            
            <button className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              관리자로 시작하기
            </button>
          </div>

          <div 
            className="bg-card p-8 rounded-lg border-2 hover:border-green-300 cursor-pointer transition-colors"
            onClick={() => onRoleSelect('operator')}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h2 className="text-2xl mb-2">운영자</h2>
              <p className="text-muted-foreground">일상 운영 및 모니터링</p>
            </div>
            
            <ul className="space-y-3 text-sm mb-6">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                실시간 대시보드 모니터링
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                알람 확인 및 조치
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                에너지 사용량 조회
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                리포트 다운로드
              </li>
            </ul>
            
            <button className="w-full p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              운영자로 시작하기
            </button>
          </div>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>© 2024 KT Corporation. All rights reserved.</p>
          <p className="mt-1">건물 에너지 효율화를 통한 탄소중립 실현</p>
        </div>
      </div>
    </div>
  );
}