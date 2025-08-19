import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import type { UserRole } from '../../App';

interface ReadingsUploadProps {
  userRole: UserRole;
}

interface UploadResult {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    error: string;
  }>;
}

export function ReadingsUpload({ userRole }: ReadingsUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      alert('CSV 파일만 업로드할 수 있습니다.');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadProgress(100);
      
      // Mock upload result
      const mockResult: UploadResult = {
        totalRows: 1000,
        successRows: 987,
        failedRows: 13,
        errors: [
          { row: 15, error: '잘못된 계측기 ID: METER_999' },
          { row: 42, error: '잘못된 날짜 형식: 2024-13-45' },
          { row: 67, error: '음수 전력값: -15.5 kWh' },
          { row: 89, error: '필수 필드 누락: timestamp' },
          { row: 156, error: '중복된 데이터: METER_001, 2024-12-24 14:30' }
        ]
      };
      
      setUploadResult(mockResult);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      clearInterval(progressInterval);
    }
  };

  const handleReset = () => {
    setFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    // Mock CSV template
    const csvContent = `meter_id,timestamp,value,unit
METER_001,2024-12-24 14:30:00,125.5,kWh
METER_002,2024-12-24 14:30:00,87.2,kWh
METER_003,2024-12-24 14:30:00,203.8,kWh`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'readings_template.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (userRole !== 'admin') {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">접근 권한이 없습니다</h3>
            <p className="text-gray-500">관리자만 데이터 업로드를 수행할 수 있습니다.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">데이터 업로드</h1>
          <p className="text-gray-600 mt-1">CSV 파일을 통한 전력 사용량 데이터 일괄 등록</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="h-4 w-4 mr-2" />
          템플릿 다운로드
        </Button>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>파일 업로드</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
              ${file ? 'bg-green-50 border-green-300' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-green-700">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    파일 크기: {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button onClick={handleUpload} disabled={uploading}>
                    <Upload className="h-4 w-4 mr-2" />
                    업로드 시작
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    다시 선택
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    CSV 파일을 여기에 드래그하거나 클릭하여 선택하세요
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    지원 형식: .csv (최대 10MB)
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  파일 선택
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span>업로드 진행률</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Results */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              업로드 결과
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResult.totalRows.toLocaleString()}
                </div>
                <div className="text-sm text-blue-700">총 처리 행수</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.successRows.toLocaleString()}
                </div>
                <div className="text-sm text-green-700">성공</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResult.failedRows.toLocaleString()}
                </div>
                <div className="text-sm text-red-700">실패</div>
              </div>
            </div>

            {/* Success Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>성공률</span>
                <span>{((uploadResult.successRows / uploadResult.totalRows) * 100).toFixed(1)}%</span>
              </div>
              <Progress 
                value={(uploadResult.successRows / uploadResult.totalRows) * 100} 
                className="w-full"
              />
            </div>

            {/* Error Details */}
            {uploadResult.errors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <h4 className="font-medium">오류 상세 내역</h4>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {uploadResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="flex items-start space-x-2 text-sm">
                        <Badge variant="destructive" className="text-xs">
                          행 {error.row}
                        </Badge>
                        <span className="text-gray-700">{error.error}</span>
                      </div>
                    ))}
                    {uploadResult.errors.length > 10 && (
                      <div className="text-sm text-gray-500 text-center pt-2">
                        ... 및 {uploadResult.errors.length - 10}개 더
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button onClick={handleReset}>
                새 파일 업로드
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>업로드 가이드</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">CSV 파일 형식</h4>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• 필수 컬럼: meter_id, timestamp, value, unit</li>
                <li>• 날짜 형식: YYYY-MM-DD HH:MM:SS</li>
                <li>• 계측기 ID는 시스템에 등록된 ID여야 함</li>
                <li>• 전력값은 양수여야 함</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">주의사항</h4>
              <ul className="space-y-1 text-gray-600 ml-4">
                <li>• 중복된 데이터는 자동으로 제외됩니다</li>
                <li>• 잘못된 형식의 데이터는 건너뛰고 처리됩니다</li>
                <li>• 대용량 파일의 경우 처리 시간이 오래 걸릴 수 있습니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}