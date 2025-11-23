// /components/writeProject/ExternalLinkAdder.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Link, X } from 'lucide-react';
import { toast } from 'sonner';

// Type สำหรับเก็บ URL แต่ละรายการ
interface ExternalLink {
  id: string;
  url: string;
}

interface ExternalLinkAdderProps {
  initialLinks?: ExternalLink[];
  // onLinksChange จะถูกเรียกเมื่อมีการเปลี่ยนแปลงรายการลิงก์ทั้งหมด
  onLinksChange: (links: ExternalLink[]) => void;
}

const ExternalLinkAdder: React.FC<ExternalLinkAdderProps> = ({ initialLinks = [], onLinksChange }) => {
  const [links, setLinks] = useState<ExternalLink[]>(initialLinks);
  const [currentInput, setCurrentInput] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(true);

  // ฟังก์ชันเพิ่มรายการ URL ใหม่
  const handleAddLink = useCallback(() => {
    // ตรวจสอบความถูกต้องของ URL อย่างง่าย
    const trimmedInput = currentInput.trim();
    if (!trimmedInput) return;

    // ตรวจสอบว่าเป็น URL ที่ใช้ได้หรือไม่ (อย่างง่าย)
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    if (!urlPattern.test(trimmedInput)) {
      toast.error('Please enter a valid URL.');
      return;
    }

    const newLink: ExternalLink = {
      id: `link_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      url: trimmedInput,
    };

    const newLinks = [...links, newLink];
    setLinks(newLinks);
    onLinksChange(newLinks);
    setCurrentInput('');
    setIsInputVisible(false); // ซ่อน Input เมื่อเพิ่มสำเร็จ
  }, [links, currentInput, onLinksChange]);

  // ฟังก์ชันลบรายการ URL
  const handleRemoveLink = useCallback((id: string) => {
    const newLinks = links.filter(link => link.id !== id);
    setLinks(newLinks);
    onLinksChange(newLinks);
    // ถ้าไม่มีรายการแล้ว ให้แสดงช่อง Input อีกครั้ง
    if (newLinks.length === 0) {
      setIsInputVisible(true);
    }
  }, [links, onLinksChange]);

  // ฟังก์ชันจัดการ Key Press (ใช้ Enter เพื่อเพิ่ม)
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddLink();
    }
  }, [handleAddLink]);

  return (
    <div className="flex flex-col gap-3">
      {/* ส่วน Input และปุ่ม Add */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center border border-main-neutral rounded-md shadow-sm bg-main-white overflow-hidden">
            <Link className="w-5 h-5 text-main-neutral-dark ml-3" />
            <input
                type="url"
                placeholder="Add URL"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 p-3 text-sm text-main-text focus:outline-none placeholder-main-neutral-light"
            />
        </div>
        <button
          onClick={handleAddLink}
          disabled={!currentInput.trim()}
          className="w-12 h-12 flex items-center border border-main-neutral bg-main-white rounded-md shadow-sm"
        >
          <Plus className="w-24 h-24 text-main-text" />
        </button>
      </div>

      {/* รายการ External Links ที่ถูกเพิ่มแล้ว */}
      {links.length > 0 && (
        <div className="flex flex-col border border-main-neutral rounded-md overflow-hidden shadow-sm">
          {links.map((link) => (
            <div key={link.id} className="flex justify-between items-center px-3 py-2 border-b border-main-light bg-main-white hover:bg-neutral-50 last:border-b-0">
              <div className="flex items-center gap-2 overflow-hidden">
                <Link className="w-4 h-4 text-main-primary shrink-0" />
                {/* แสดง URL และทำให้คลิกได้ */}
                <a 
                    href={link.url.startsWith('http') ? link.url : `http://${link.url}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm text-main-text hover:underline truncate"
                >
                    {link.url}
                </a>
              </div>
              <button onClick={() => handleRemoveLink(link.id)} className="text-red-500 hover:text-red-700 p-1 rounded shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default ExternalLinkAdder;