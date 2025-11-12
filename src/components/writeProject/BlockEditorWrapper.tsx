// BlockEditorWrapper.tsx (อยู่ใน components/common/)
'use client';

import { useRef, useState, useEffect } from 'react';
import BlockEditor, { type BlockEditorRef } from '../common/BlockEditor';

interface BlockEditorWrapperProps {
  currentLang: string;
}

const TITLE_STORAGE_KEY = 'projectTitle';

export default function BlockEditorWrapper({ currentLang }: BlockEditorWrapperProps) {
  const editorRef = useRef<BlockEditorRef>(null);
  
  // 1. Initialize title จาก localStorage
  const [title, setTitle] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedTitle = localStorage.getItem(TITLE_STORAGE_KEY);
      return storedTitle !== null ? storedTitle : '';
    }
    return '';
  });

  // 2. ใช้ useEffect เพื่อบันทึก title ลง localStorage ทุกครั้งที่มีการเปลี่ยนแปลง
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TITLE_STORAGE_KEY, title);
    }
  }, [title]);

  return (
    <div className="flex flex-col items-center h-screen gap-15 p-[120px_60px_24px_60px]">
      <h1>Write New Project</h1>
      <div className="flex flex-col gap-5 w-full max-w-[980px]">
        {/* Input สำหรับ Title */}
        <div className="flex flex-col gap-1.5">
          <h4>Title<span className="text-main-primary">*</span></h4>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border rounded"
            placeholder="Add title"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4>Content<span className="text-main-primary">*</span></h4>
          <BlockEditor ref={editorRef} />
        </div>
      </div>
    </div>
  );
}