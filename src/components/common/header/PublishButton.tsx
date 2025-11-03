// PublishButton.tsx
'use client';

import { supabase } from '@/lib/supabase';

const TITLE_STORAGE_KEY = 'projectTitle';
const CONTENT_STORAGE_KEY = 'projectContent';
const UPLOADED_FILES_KEY = 'uploadedFiles';

export default function PublishButton() {
  const handlePublish = async () => {

    // 1. อ่าน title และ content จาก localStorage
    const title = typeof window !== 'undefined' ? localStorage.getItem(TITLE_STORAGE_KEY) : null;
    const content = typeof window !== 'undefined' ? localStorage.getItem(CONTENT_STORAGE_KEY) : null;

    if (!title || title.trim() === "") {
      alert("Please enter a title.");
      return;
    }

    if (!content || content.trim() === "") {
      alert("Content is empty.");
      return;
    }

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("User not authenticated");
      
      console.log("📝 Publishing content...", content);

      // Insert ลง table
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            title,
            content,
            status: 'Published',
          },
        ])
        .select();

      if (error) throw error;

      // 2. ล้างข้อมูล Draft ทั้งหมดออกจาก localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem(TITLE_STORAGE_KEY);
        localStorage.removeItem(CONTENT_STORAGE_KEY);
        localStorage.removeItem(UPLOADED_FILES_KEY);
      }

      alert('✅ Project published successfully!');
      window.location.reload();
    } catch (e) {
      console.error('❌ Publish error:', e);
      alert('An unexpected error occurred during publishing.');
    }
  };

  return (
    <button className="btn-primary" onClick={handlePublish}>
      <div className='small'>Publish</div>
    </button>
  );
}