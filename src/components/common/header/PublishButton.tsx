// PublishButton.tsx
'use client';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const TITLE_STORAGE_KEY = 'projectTitle';
const CONTENT_STORAGE_KEY = 'projectContent';
const UPLOADED_FILES_KEY = 'uploadedFiles';

function isContentEmpty(contentString: string | null): boolean {
  if (!contentString) {
    return true; // Null หรือ empty string
  }

  let blocks: any[];
  try {
    blocks = JSON.parse(contentString);
  } catch (e) {
    return true; // JSON ผิดพลาด
  }

  if (!Array.isArray(blocks) || blocks.length === 0) {
    return true; // ไม่มี Blocks
  }

  // ใช้ .some() เพื่อหาว่ามี Block "อย่างน้อยหนึ่ง" ที่มีเนื้อหาหรือไม่
  // ถ้าเจอแม้แต่อันเดียว = "ไม่ว่างเปล่า"
  const hasMeaningfulContent = blocks.some(block => {
    if (!block || !block.type) {
      return false; // ไม่ใช่ Block ที่ถูกต้อง
    }

    // 1. ตรวจสอบ Block ที่มีข้อความ (Text-based)
    // (เช่น paragraph, heading, bulletListItem, numberedListItem, codeBlock, callout)
    if (block.content && Array.isArray(block.content)) {
      if (block.content.length > 0) {
        return true; // มี inline content (เช่น text)
      }
    }

    // 2. ตรวจสอบ Block ที่มีไฟล์ (Media-based)
    // (เช่น image, video, file)
    if (block.props && block.props.url) {
      return true; // มี URL ของไฟล์ = มีเนื้อหา
    }

    // 3. ตรวจสอบ Block ที่มีเนื้อหาในตัวเอง (Self-contained)
    // (เช่น table, horizontalRule)
    if (block.type === 'table' || block.type === 'horizontalRule') {
      return true; // แค่มี Block นี้อยู่ ก็ถือว่ามีเนื้อหา
    }

    // ถ้าไม่เข้าเงื่อนไขข้างบนเลย = Block นี้ว่างเปล่า
    return false;
  });

  // ถ้า hasMeaningfulContent = true (เจอเนื้อหา) -> ฟังก์ชันต้องคืนค่า false (ไม่ว่างเปล่า)
  // ถ้า hasMeaningfulContent = false (ไม่เจอเนื้อหาเลย) -> ฟังก์ชันต้องคืนค่า true (ว่างเปล่า)
  return !hasMeaningfulContent;
}

export default function PublishButton() {
  const handlePublish = async () => {

    // 1. อ่าน title และ content จาก localStorage
    const title = typeof window !== 'undefined' ? localStorage.getItem(TITLE_STORAGE_KEY) : null;
    const content = typeof window !== 'undefined' ? localStorage.getItem(CONTENT_STORAGE_KEY) : null;

    if (!title || title.trim() === "") {
      toast.warning("Please enter the title.", { duration: 10000 });
      return;
    }

    if (isContentEmpty(content)) {
      toast.warning("Content is empty.", { duration: 10000 });
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