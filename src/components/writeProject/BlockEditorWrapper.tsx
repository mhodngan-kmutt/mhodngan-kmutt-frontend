// BlockEditorWrapper.tsx (อยู่ใน components/common/)
'use client';

import { useRef, useState, useEffect } from 'react';
import BlockEditor, { type BlockEditorRef } from '../common/BlockEditor';

interface BlockEditorWrapperProps {
  currentLang: string;
}

export default function BlockEditorWrapper({ currentLang }: BlockEditorWrapperProps) {
  const editorRef = useRef<BlockEditorRef>(null);
  const [title, setTitle] = useState('');

  useEffect(() => {
    const publishProps = {
      editorRef,
      title,
    };
    
    const event = new CustomEvent('editorPropsReady', { detail: publishProps });
    window.dispatchEvent(event);
    
    return () => {
      // Optional: Dispatch an event to clear props if unmounting
    }
  }, [title]);

  return (
    <div className="flex flex-col items-center h-screen gap-15 p-[120px_60px_24px_60px]">
      <h1>Write New Project</h1>
      <div className="flex flex-col gap-5 w-[980px]">
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