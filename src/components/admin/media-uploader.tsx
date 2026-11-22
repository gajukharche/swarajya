'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface MediaUploaderProps {
  onUploadComplete?: (fileUrl: string) => void;
  allowedTypes?: string[];
  maxSizeMb?: number;
}

export function MediaUploader({
  onUploadComplete,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeMb = 20,
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setProgress(0);

    if (!allowedTypes.includes(file.type)) {
      setError(`Unsupported file type: ${file.type}. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File exceeds maximum size of ${maxSizeMb}MB.`);
      return;
    }

    try {
      setIsUploading(true);

      // Step 1: Request presigned URL from Next.js server route
      const res = await fetch('/api/admin/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to obtain presigned URL from server.');
      }

      const { uploadUrl, publicUrl } = await res.json();

      // Step 2: Upload directly to Cloudflare R2 via PUT
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Direct upload to R2 storage failed.');
      }

      setProgress(100);
      setUploadedUrl(publicUrl);
      onUploadComplete?.(publicUrl);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all ${
          isUploading
            ? 'border-indigo-500 bg-indigo-950/20'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:bg-zinc-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={allowedTypes.join(',')}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUpload(e.target.files[0]);
            }
          }}
        />

        {isUploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-sm text-zinc-300 font-medium">Uploading directly to R2...</p>
          </div>
        ) : uploadedUrl ? (
          <div className="flex flex-col items-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <p className="text-sm text-zinc-300 font-medium">Upload Complete</p>
            <p className="text-xs text-zinc-500 truncate max-w-xs">{uploadedUrl}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <UploadCloud className="w-8 h-8 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-300">
              Drag and drop product media, or <span className="text-indigo-400">browse</span>
            </p>
            <p className="text-xs text-zinc-500">
              Images up to {maxSizeMb}MB directly to Cloudflare R2
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
