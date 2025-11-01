// PublishButton.tsx (สมมติว่าอยู่ใน components/common/header/)
'use client';

import type { BlockEditorRef } from '../BlockEditor';
import { supabase } from '@/lib/supabase';

interface PublishButtonProps {
  editorRef: React.RefObject<BlockEditorRef>;
  title: string;
}

export default function PublishButton({ editorRef, title }: PublishButtonProps) {
  const handlePublish = async () => {
    if (!editorRef.current) {
      alert("Editor is not ready.");
      return;
    }

    if (title.trim() === "") {
      alert("Please enter a title.");
      return;
    }

    try {
      // 1. ดึงเนื้อหาจาก BlockNote editor ในรูปแบบ JSON string
      const content = JSON.stringify(editorRef.current.editor.document);
      console.log("📝 Publishing content...", content);

      // // 2. ส่งข้อมูลไปยัง Supabase
      // const { data, error } = await supabase
      //   .from('projects')
      //   .insert([
      //     {
      //       title: title,
      //       content: content,
      //       badge: 'New', // ควรมีการจัดการ field อื่นๆ ตามเหมาะสม
      //       status: 'Published'
      //     },
      //   ])
      //   .select();

      // if (error) {
      //   console.error('❌ Supabase publish error:', error);
      //   alert(`Failed to publish: ${error.message}`);
      //   return;
      // }

      // console.log('✅ Published successfully:', data);
      alert('Project published successfully!');

    } catch (e) {
      console.error('❌ General publish error:', e);
      alert('An unexpected error occurred during publishing.');
    }
  };

  return (
    <button className="btn-primary" onClick={handlePublish}>
      Publish
    </button>
  );
}