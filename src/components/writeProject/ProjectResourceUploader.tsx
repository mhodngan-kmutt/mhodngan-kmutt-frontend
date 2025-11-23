'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1 GB but Supabase limit is 50MB
const RESOURCE_BUCKET_NAME = 'Resources';

interface UploadedResource {
  file_id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_path: string;
}

interface ProjectResourceUploaderProps {
  projectId: string;
  onUploadSuccess: (resource: UploadedResource) => void;
  onResourceRemove: (fileId: string) => void;
  initialResources?: UploadedResource[];
}

interface UploadingFile {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
}

// --- Upload function ---
async function uploadFile(file: File, projectId: string): Promise<UploadedResource> {
  if (file.size > MAX_FILE_SIZE_BYTES) throw new Error('File too large');

  const filePath = `${projectId}/${Date.now()}-${file.name.replace(/\s/g, '_')}`;

  console.log('Uploading file to bucket:', RESOURCE_BUCKET_NAME, 'path:', filePath);

  const { data, error } = await supabase.storage
    .from(RESOURCE_BUCKET_NAME)
    .upload(filePath, file, { upsert: false });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage.from(RESOURCE_BUCKET_NAME).getPublicUrl(filePath);

  if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL');

  return {
    file_id: `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    project_id: projectId,
    file_name: file.name,
    file_url: publicUrlData.publicUrl,
    file_path: filePath,
  };
}

const ProjectResourceUploader: React.FC<ProjectResourceUploaderProps> = ({
  projectId,
  onUploadSuccess,
  onResourceRemove,
  initialResources = []
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>(initialResources);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(async (file) => {
      const tempId = `${Date.now()}-${Math.random()}`;
      setUploadingFiles(prev => [...prev, { id: tempId, name: file.name, progress: 0, status: 'uploading' }]);

      try {
        const resource = await uploadFile(file, projectId);
        console.log('✅ Uploaded:', resource);

        setUploadedResources(prev => [...prev, resource]);
        onUploadSuccess(resource);

        setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
        toast.success(`'${file.name}' uploaded successfully!`);
      } catch (err: any) {
        console.error('Upload failed:', err);
        setUploadingFiles(prev => prev.map(f => f.id === tempId ? { ...f, status: 'failed' } : f));
        toast.error(`Failed to upload '${file.name}': ${err.message}`);
      }
    });
    e.target.value = '';
  }, [projectId, onUploadSuccess]);

  const handleRemoveResource = async (resource: UploadedResource) => {
    if (!confirm(`Delete ${resource.file_name}?`)) return;
    try {
      console.log('Attempting to delete file from storage:', RESOURCE_BUCKET_NAME, 'path:', resource.file_path);

      const { error } = await supabase.storage
        .from(RESOURCE_BUCKET_NAME)
        .remove([resource.file_path]);

      if (error) throw error;

      console.log('✅ File deleted from storage:', resource.file_path);

      setUploadedResources(prev => prev.filter(r => r.file_id !== resource.file_id));
      onResourceRemove(resource.file_id);

      toast.success(`'${resource.file_name}' deleted from storage`);
    } catch (err: any) {
      console.error('Delete failed:', err);
      toast.error(`Failed to delete '${resource.file_name}': ${err.message}`);
    }
  };

  const handleRemoveFailedFile = (fileId: string, fileName: string) => {
    if (!confirm(`Remove failed file '${fileName}' from list?`)) return;
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const isListVisible = uploadedResources.length > 0 || uploadingFiles.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col items-center justify-center p-8 border border-solid border-main-neutral rounded-md shadow-sm h-52 bg-main-white cursor-pointer transition-colors hover:bg-main-neutral-light">
        <input type="file" multiple className="hidden" onChange={handleFileSelect} />
        <Upload className="w-12 h-12 text-main-neutral-dark" />
        <p className="mt-2 text-sm font-medium text-main-text">Drag & Drop your file here</p>
        <p className="text-xs text-main-neutral-dark mt-1">PDF, PPTX, ZIP and 7Z formats, up to 1GB</p>
      </label>

      {uploadingFiles.map(f => (
        <div key={f.id} className="flex justify-between items-center p-2 bg-main-lightest rounded">
          <div className="flex items-center gap-2">
            {f.status === 'uploading' ? <Loader2 className="animate-spin w-4 h-4 text-main-primary" /> : <FileText className="w-4 h-4 text-main-neutral-dark" />}
            <span className="text-main-text">{f.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={f.status === 'failed' ? 'text-red-500 text-sm' : 'text-main-primary text-sm'}>
              {f.status === 'failed' ? 'Failed' : 'Uploading'}
            </span>
            {f.status === 'failed' && (
              <button onClick={() => handleRemoveFailedFile(f.id, f.name)} className="text-red-500 hover:text-red-700 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ))}

      {isListVisible && (
        <div className="flex flex-col border border-main-neutral rounded-md overflow-hidden shadow-sm">
          {uploadedResources.map(r => (
            <div key={r.file_id} className="flex justify-between items-center px-3 py-2 border-b border-main-light bg-main-white hover:bg-neutral-50 last:border-b-0">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-main-neutral-dark" />
                <span className="text-sm text-main-text">{r.file_name}</span>
              </div>
              <button onClick={() => handleRemoveResource(r)} className="text-main-neutral-dark hover:text-red-700 p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectResourceUploader;