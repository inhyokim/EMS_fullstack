import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Loader2,
  X
} from 'lucide-react';
import { readingsApi } from '../utils/api';
import { toast } from "sonner@2.0.3";

interface CsvData {
  building_name: string;
  zone_name: string;
  meter_no: string;
  timestamp: string;
  value: number;
}

interface UploadResult {
  processed: number;
  saved: number;
  errors: string[];
}

export function DataUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CsvData[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast.error('CSV 파일만 업로드할 수 있습니다.');
      return;
    }

    setFile(selectedFile);
    setUploadResult(null);
    setErrors([]);
    parseCsvFile(selectedFile);
  };

  const parseCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setErrors(['CSV 파일에 데이터가 없습니다.']);
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['building_name', 'zone_name', 'meter_no', 'timestamp', 'value'];
        
        // 헤더 검증
        const missingHeaders = requiredHeaders.filter(header => 
          !headers.some(h => h.toLowerCase() === header.toLowerCase())
        );
        
        if (missingHeaders.length > 0) {
          setErrors([`필수 헤더가 누락되었습니다: ${missingHeaders.join(', ')}`]);
          return;
        }

        // 데이터 파싱
        const data: CsvData[] = [];
        const parseErrors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          
          if (values.length !== headers.length) {
            parseErrors.push(`${i + 1}행: 컬럼 수가 맞지 않습니다.`);
            continue;
          }

          try {
            const row: any = {};
            headers.forEach((header, index) => {
              row[header.toLowerCase()] = values[index];
            });

            // 데이터 타입 변환 및 검증
            const parsedRow: CsvData = {
              building_name: row.building_name || '',
              zone_name: row.zone_name || '',
              meter_no: row.meter_no || '',
              timestamp: row.timestamp || '',
              value: parseFloat(row.value) || 0
            };

            // 필수 필드 검증
            if (!parsedRow.building_name || !parsedRow.zone_name || 
                !parsedRow.meter_no || !parsedRow.timestamp) {
              parseErrors.push(`${i + 1}행: 필수 필드가 비어있습니다.`);
              continue;
            }

            // 날짜 형식 검증
            if (isNaN(Date.parse(parsedRow.timestamp))) {
              parseErrors.push(`${i + 1}행: 올바르지 않은 날짜 형식입니다.`);
              continue;
            }

            // 값 검증
            if (isNaN(parsedRow.value) || parsedRow.value < 0) {
              parseErrors.push(`${i + 1}행: 올바르지 않은 전력값입니다.`);
              continue;
            }

            data.push(parsedRow);
          } catch (error) {
            parseErrors.push(`${i + 1}행: 데이터 파싱 오류`);
          }
        }

        setCsvData(data);
        setErrors(parseErrors);
        
        if (data.length === 0) {
          toast.error('유효한 데이터가 없습니다.');
        } else {
          toast.success(`${data.length}개의 데이터를 파싱했습니다.`);
        }
      } catch (error) {
        setErrors(['CSV 파일을 읽는 중 오류가 발생했습니다.']);
        console.error('CSV parsing error:', error);
      }
    };
    
    reader.readAsText(file);
  };

  const handleUpload = async () => {
    if (!csvData.length) {
      toast.error('업로드할 데이터가 없습니다.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadResult(null);

    try {
      // 배치 크기 (한 번에 처리할 데이터 수)
      const batchSize = 100;
      const totalBatches = Math.ceil(csvData.length / batchSize);
      let totalProcessed = 0;
      let totalSaved = 0;
      const uploadErrors: string[] = [];

      for (let i = 0; i < totalBatches; i++) {
        const start = i * batchSize;
        const end = start + batchSize;
        const batch = csvData.slice(start, end);

        try {
          const result = await readingsApi.upload(batch);
          if (result.success) {
            totalProcessed += result.data.processed || batch.length;
            totalSaved += result.data.saved || 0;
          } else {
            uploadErrors.push(`배치 ${i + 1} 업로드 실패: ${result.error}`);
          }
        } catch (error) {
          uploadErrors.push(`배치 ${i + 1} 업로드 오류`);
        }

        // 진행률 업데이트
        setProgress(((i + 1) / totalBatches) * 100);
        
        // UI 업데이트를 위한 짧은 대기
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setUploadResult({
        processed: totalProcessed,
        saved: totalSaved,
        errors: uploadErrors
      });

      if (totalSaved > 0) {
        toast.success(`${totalSaved}개의 데이터가 성공적으로 업로드되었습니다.`);
      }

      if (uploadErrors.length > 0) {
        toast.error(`${uploadErrors.length}개의 배치에서 오류가 발생했습니다.`);
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('업로드 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvData([]);
    setUploadResult(null);
    setErrors([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadSampleCsv = () => {
    const sampleData = `building_name,zone_name,meter_no,timestamp,value
본관,사무실 구역,MT-001,2024-01-15T09:00:00Z,120.5
본관,사무실 구역,MT-001,2024-01-15T10:00:00Z,135.2
본관,회의실 구역,MT-002,2024-01-15T09:00:00Z,85.7
별관,연구실 구역,MT-003,2024-01-15T09:00:00Z,95.3`;

    const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'power_data_sample.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">데이터 업로드</h1>
          <p className="text-muted-foreground">
            CSV 파일을 통해 전력 사용 데이터를 시스템에 업로드합니다.
          </p>
        </div>
        <Button variant="outline" onClick={downloadSampleCsv}>
          <Download className="w-4 h-4 mr-2" />
          샘플 CSV 다운로드
        </Button>
      </div>

      {/* 업로드 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>파일 업로드</CardTitle>
          <CardDescription>
            CSV 형식의 전력 데이터 파일을 선택해주세요. 
            파일은 building_name, zone_name, meter_no, timestamp, value 컬럼을 포함해야 합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!file ? (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">파일을 선택하세요</h3>
                    <p className="text-muted-foreground">CSV 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    className="mt-4" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    파일 선택
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-8 h-8 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{file.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    disabled={uploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {csvData.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary">
                          {csvData.length}개 데이터
                        </Badge>
                        {errors.length > 0 && (
                          <Badge variant="destructive">
                            {errors.length}개 오류
                          </Badge>
                        )}
                      </div>
                      <Button 
                        onClick={handleUpload}
                        disabled={uploading || csvData.length === 0}
                      >
                        {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        데이터 업로드
                      </Button>
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>업로드 진행률</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 오류 표시 */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>데이터 검증 오류</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {errors.slice(0, 10).map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ))}
              {errors.length > 10 && (
                <p className="text-sm text-muted-foreground">
                  ... 외 {errors.length - 10}개의 오류가 더 있습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 업로드 결과 */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span>업로드 완료</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{uploadResult.processed}</div>
                  <div className="text-sm text-muted-foreground">처리된 데이터</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{uploadResult.saved}</div>
                  <div className="text-sm text-muted-foreground">저장된 데이터</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{uploadResult.errors.length}</div>
                  <div className="text-sm text-muted-foreground">오류 수</div>
                </div>
              </div>

              {uploadResult.errors.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">업로드 오류:</h4>
                  <div className="space-y-1">
                    {uploadResult.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button onClick={handleReset}>
                  새로운 파일 업로드
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 파일 형식 안내 */}
      <Card>
        <CardHeader>
          <CardTitle>CSV 파일 형식 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">필수 컬럼:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• <strong>building_name</strong>: 건물명 (예: "본관")</li>
                <li>• <strong>zone_name</strong>: 구역명 (예: "사무실 구역")</li>
                <li>• <strong>meter_no</strong>: 계측기 번호 (예: "MT-001")</li>
                <li>• <strong>timestamp</strong>: 측정 시간 (ISO 8601 형식, 예: "2024-01-15T09:00:00Z")</li>
                <li>• <strong>value</strong>: 전력 사용량 (숫자, 예: 120.5)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">주의사항:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>• 첫 번째 행은 헤더여야 합니다</li>
                <li>• 계측기 번호(meter_no)는 시스템에 등록된 계측기와 일치해야 합니다</li>
                <li>• 시간 형식은 ISO 8601 표준을 따라주세요</li>
                <li>• 전력 사용량은 양수여야 합니다</li>
                <li>• 파일 크기는 10MB 이하를 권장합니다</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}