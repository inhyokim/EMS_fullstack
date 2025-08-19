import React from 'react';
import { Building2, Shield, User } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface RoleSelectProps {
  onRoleSelect: (role: 'admin' | 'operator') => void;
}

export function RoleSelect({ onRoleSelect }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1>KT 스마트빌딩 EMS Lite</h1>
          </div>
          <p className="text-xl text-muted-foreground">데이터 기반 건물 에너지 관리 시스템</p>
          <p className="text-muted-foreground mt-2">실시간 전력 모니터링 • 지능형 알람 • 에너지 최적화</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-blue-300"
                onClick={() => onRoleSelect('admin')}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-blue-100 rounded-full">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">관리자</CardTitle>
              <CardDescription className="text-base">시스템 전체 관리 권한</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  건물/구역/계측기 등록 및 관리
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  요금제 설정 및 알람 규칙 관리
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  데이터 수집 및 집계 작업
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  보고서 생성 및 내보내기
                </li>
              </ul>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                관리자로 시작하기
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300"
                onClick={() => onRoleSelect('operator')}>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <User className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">운영자</CardTitle>
              <CardDescription className="text-base">일상 운영 및 모니터링</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm mb-6">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  실시간 대시보드 모니터링
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  알람 확인 및 조치
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  에너지 사용량 조회
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  리포트 다운로드
                </li>
              </ul>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                운영자로 시작하기
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>© 2024 KT Corporation. All rights reserved.</p>
          <p className="mt-1">건물 에너지 효율화를 통한 탄소중립 실현</p>
        </div>
      </div>
    </div>
  );
}