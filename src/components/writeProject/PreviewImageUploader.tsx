// /components/writeProject/PreviewImageUploader.tsx
'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { UploadCloud, ImagePlus as ImageIcon, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface PreviewImageUploaderProps {
    projectId: string;
    initialImageUrl: string;
    onImageUrlChange: (url: string) => void;
}

const BUCKET_NAME = 'project-previews';

export default function PreviewImageUploader({
    projectId,
    initialImageUrl,
    onImageUrlChange,
}: PreviewImageUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);
    const [error, setError] = useState<string | null>(null);

    const previewUrl = useMemo(() => {
        return file ? URL.createObjectURL(file) : currentImageUrl;
    }, [file, currentImageUrl]);

    React.useEffect(() => {
        return () => {
            if (file) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [file, previewUrl]);


    const handleFileUpload = useCallback(async (selectedFile: File) => {
        if (!projectId) {
            setError("Project ID (Draft ID) is missing.");
            return;
        }

        setUploading(true);
        setError(null);

        const fileExt = selectedFile.name.split('.').pop();
        const filePath = `${projectId}/${uuidv4()}.${fileExt}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, selectedFile, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            setCurrentImageUrl(publicUrl);
            setFile(null);
            onImageUrlChange(publicUrl); // บันทึก URL ลง LocalStorage

        } catch (err: any) {
            console.error('Upload error:', err);
            setError(`Upload failed: ${err.message}`);
            setFile(null);
        } finally {
            setUploading(false);
        }
    }, [projectId, onImageUrlChange]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
                setError('Only JPG, JPEG, PNG, and WEBP formats are supported.');
                setFile(null);
                return;
            }
            setFile(selectedFile);
            handleFileUpload(selectedFile);
        }
    }, [handleFileUpload]);

    const handleRemoveImage = useCallback(async () => {
    try {
        if (!currentImageUrl) return;

        let filePath = '';
        const match = currentImageUrl.match(/project-previews\/(.+)$/);
        if (match) filePath = match[1];

        if (filePath) {
            const { error: removeError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePath]);

            if (removeError) throw removeError;
        } else {
            console.warn('⚠️ Could not extract file path from URL:', currentImageUrl);
        }

        // Cleanup memory
        if (file) {
            URL.revokeObjectURL(previewUrl);
        }

        // Reset UI
        setCurrentImageUrl('');
        setFile(null);
        setError(null);
        setUploading(false);
        onImageUrlChange('');

        console.log('✅ Image removed successfully from Supabase Storage');
    } catch (err: any) {
        console.error('Remove error:', err);
        setError(`Failed to delete image: ${err.message}`);
    }
}, [currentImageUrl, file, previewUrl, onImageUrlChange]);

    const isImagePresent = !!previewUrl;

    return (
        <div className="flex flex-col gap-1.5">
            <h4 className="flex items-center gap-1">Preview Image</h4>

            <label
                className={`
                    relative flex flex-col items-center justify-center 
                    border border-solid border-main-neutral rounded-md shadow-sm
                    bg-main-white transition-colors overflow-hidden h-[200px] w-full
                    cursor-pointer
                    ${!isImagePresent && 'hover:bg-main-neutral-light'}
                `}
            >
                <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />

                {isImagePresent && (
                    <>
                        <img
                            src={previewUrl}
                            alt="Project Preview"
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRemoveImage();
                            }}
                            className="absolute top-2 right-2 bg-main-black/70 text-white rounded-full p-2 z-30 hover:bg-supporting-error transition shadow-lg"
                            aria-label="Remove image"
                        >
                            <X size={16} />
                        </button>
                    </>
                )}

                {!isImagePresent && (
                    <div className="flex flex-col items-center justify-center h-full w-full">
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <UploadCloud size={42} className="animate-bounce text-main-primary" />
                                <p className="small text-main-primary mt-2">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <ImageIcon size={42} className="text-main-neutral2" />
                                <p className="small text-main-neutral2 mt-2">Drag & Drop your image here</p>
                                <p className="detail text-supporting-support mt-1">
                                    JPG, JPEG, PNG and WEBP formats, up to 1GB
                                </p>
                            </>
                        )}
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 bg-supporting-error/80 text-white flex items-center justify-center p-4 z-40">
                        Error: {error}
                    </div>
                )}
            </label>
        </div>
    );
}