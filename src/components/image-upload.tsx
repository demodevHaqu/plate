/**
 * @file image-upload.tsx
 * @description 이미지 업로드 컴포넌트
 *
 * 이 컴포넌트는 사용자가 이미지를 업로드하고
 * Supabase Storage와 데이터베이스에 저장하는 기능을 제공합니다.
 *
 * 주요 기능:
 * 1. 이미지 파일 선택 및 미리보기
 * 2. Supabase Storage에 파일 업로드
 * 3. 데이터베이스에 메타데이터 저장
 * 4. 업로드 진행률 표시
 * 5. 에러 처리 및 사용자 피드백
 *
 * @dependencies
 * - @supabase/ssr
 * - react
 * - lucide-react
 */

"use client";

import { useState, useRef } from "react";
import { useSupabaseClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadedImage {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  mime_type: string;
  file_path: string;
  created_at: string;
  description?: string;
  tags?: string[];
}

export default function ImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = useSupabaseClient();

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    // 파일 크기 확인 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);

    // 미리보기 URL 생성
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  // 파일 제거 핸들러
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setDescription("");
    setTags("");
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(0);

    try {
      console.group("🖼️ 이미지 업로드 시작");
      console.log(
        "선택된 파일:",
        selectedFile.name,
        selectedFile.size,
        "bytes",
      );

      // 1. 고유한 파일명 생성
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      console.log("생성된 파일명:", fileName);
      console.log("파일 경로:", filePath);

      // 2. Supabase Storage에 파일 업로드
      console.log("📤 Storage에 파일 업로드 중...");
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Storage 업로드 실패:", uploadError);
        throw new Error(`파일 업로드 실패: ${uploadError.message}`);
      }

      console.log("✅ Storage 업로드 성공:", uploadData);
      setUploadProgress(50);

      // 3. 데이터베이스에 메타데이터 저장
      console.log("💾 데이터베이스에 메타데이터 저장 중...");
      const imageData = {
        filename: fileName,
        original_name: selectedFile.name,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        file_path: filePath,
        storage_bucket: "images",
        description: description || null,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : null,
      };

      console.log("저장할 데이터:", imageData);

      const { data: dbData, error: dbError } = await supabase
        .from("images")
        .insert([imageData])
        .select()
        .single();

      if (dbError) {
        console.error("❌ 데이터베이스 저장 실패:", dbError);
        throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
      }

      console.log("✅ 데이터베이스 저장 성공:", dbData);
      setUploadProgress(100);

      // 4. 성공 처리
      setUploadedImages((prev) => [dbData, ...prev]);
      setSuccess(`이미지가 성공적으로 업로드되었습니다! (${fileName})`);

      // 폼 초기화
      handleRemoveFile();

      console.log("🎉 이미지 업로드 완료");
      console.groupEnd();
    } catch (err) {
      console.error("❌ 업로드 오류:", err);
      setError(
        err instanceof Error ? err.message : "업로드 중 오류가 발생했습니다.",
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // 업로드된 이미지 목록 가져오기
  const fetchUploadedImages = async () => {
    try {
      const { data, error } = await supabase
        .from("images")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("이미지 목록 조회 실패:", error);
        return;
      }

      setUploadedImages(data || []);
    } catch (err) {
      console.error("이미지 목록 조회 오류:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            이미지 업로드
          </CardTitle>
          <CardDescription>
            이미지 파일을 선택하고 업로드하세요. (최대 10MB, JPG, PNG, GIF, WebP
            지원)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 파일 선택 */}
          <div className="space-y-2">
            <Label htmlFor="file-input">이미지 파일 선택</Label>
            <Input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              ref={fileInputRef}
              className="cursor-pointer"
            />
          </div>

          {/* 미리보기 */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>미리보기</Label>
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="미리보기"
                  className="max-w-xs max-h-48 rounded-lg border"
                />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveFile}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* 설명 입력 */}
          <div className="space-y-2">
            <Label htmlFor="description">설명 (선택사항)</Label>
            <Textarea
              id="description"
              placeholder="이미지에 대한 설명을 입력하세요..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* 태그 입력 */}
          <div className="space-y-2">
            <Label htmlFor="tags">태그 (선택사항)</Label>
            <Input
              id="tags"
              placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 사진, 여행, 자연)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>

          {/* 에러/성공 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* 업로드 버튼 */}
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1"
            >
              {uploading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  업로드 중... ({uploadProgress}%)
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  업로드
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={fetchUploadedImages}
              disabled={uploading}
            >
              목록 새로고침
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 업로드된 이미지 목록 */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 업로드된 이미지</CardTitle>
            <CardDescription>최근 업로드된 이미지 목록입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-2">
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">
                      {image.original_name}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium truncate">
                      {image.original_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.file_size / 1024).toFixed(1)} KB
                    </p>
                    {image.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {image.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(image.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
