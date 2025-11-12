'use client';

import { BlockNoteSchema, createHeadingBlockSpec, BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback } from "react"; // 💡 เพิ่ม useCallback และ useRef
import { supabase } from "@/lib/supabase";
import { toast } from "sonner"

const CONTENT_STORAGE_KEY = 'projectContent';
const UPLOADED_FILES_KEY = 'uploadedFiles';
const DEBOUNCE_DELAY = 1000; // 1 วินาทีสำหรับการ Debounce

// ... getInitialContent, uploadFile, getActiveFilePaths (ใช้โค้ดเดิม) ...
const getInitialContent = () => {
  if (typeof window !== "undefined") {
    const storedContent = localStorage.getItem(CONTENT_STORAGE_KEY);
    if (storedContent) {
      try {
        return JSON.parse(storedContent) as PartialBlock[];
      } catch (e) {
        console.error("Error parsing stored content:", e);
        localStorage.removeItem(CONTENT_STORAGE_KEY);
      }
    }
  }
  return undefined;
}

async function uploadFile(file: File) {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) throw new Error("User not authenticated");

  const filePath = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  const { error } = await supabase.storage
    .from("Published")
    .upload(filePath, file, { upsert: false });

  if (error) {
    console.error('❌ Supabase upload error:', error);
    let toastMessage = "Failed to upload item: " + error.message;

    if (error.message.includes("exceeded the maximum allowed size")) {
      toastMessage = `The file "${file.name}" is too large. Please upload a file smaller than the limit (30MB).`;
    }

    toast.error("Failed to upload item", {
      description: toastMessage,
      duration: 10000,
    });
    throw error;
  }

  // public URL
  const { data } = supabase.storage.from("Published").getPublicUrl(filePath);
  return { publicUrl: data.publicUrl, filePath };
}

export interface BlockEditorRef {
  editor: BlockNoteEditor;
  uploadedFiles: string[];
}

function getActiveFilePaths(document: PartialBlock[]): string[] {
  const activePaths: string[] = [];
  // Check for window existence before accessing global object
  const publicUrlPrefix = typeof window !== "undefined"
    ? supabase.storage.from("Published").getPublicUrl('').data.publicUrl
    : '';

  const traverse = (blocks: PartialBlock[]) => {
    for (const block of blocks) {
      if (block.type === 'image' && block.props?.url) {
        const url = block.props.url as string;
        if (publicUrlPrefix && url.startsWith(publicUrlPrefix)) { // 💡 เพิ่มเงื่อนไข publicUrlPrefix เพื่อความปลอดภัย
          const filePath = url.substring(publicUrlPrefix.length);
          activePaths.push(filePath);
        }
      }

      if (block.children && Array.isArray(block.children)) {
        traverse(block.children);
      }
    }
  };

  traverse(document);
  return activePaths;
}
// ... interface และ getActiveFilePaths (ใช้โค้ดเดิม) ...

const BlockEditor = forwardRef<BlockEditorRef>(function BlockEditor(props, ref) {
  if (typeof window === "undefined") return null;

  // 1. Initialize uploadedFiles state จาก localStorage
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const storedFiles = localStorage.getItem(UPLOADED_FILES_KEY);
      return storedFiles ? JSON.parse(storedFiles) : [];
    }
    return [];
  });

  // 💡 Ref เพื่อเก็บค่า Editor
  const editor = useCreateBlockNote({
    initialContent: getInitialContent(),
    // ... schema และ config เดิม ...
    placeholders: {
      emptyDocument: "Start typing..",
      heading: "Start typing..",
    },
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        heading: createHeadingBlockSpec({
          allowToggleHeadings: false,
          levels: [1, 2, 3],
        }),
      },
    }),
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
    uploadFile: async (file: File) => { // 💡 ย้าย customUploadFile มาอยู่ตรงนี้และแก้ไขการจัดการ State
      const { publicUrl, filePath } = await uploadFile(file);

      // อัปเดต State และ Local Storage ในการเรียก setUploadedFiles ครั้งเดียว
      setUploadedFiles(prev => {
        const newFiles = [...prev, filePath];
        localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(newFiles));
        console.log('--- DEBUG: UPLOAD ---');
        console.log('✅ File uploaded and added to uploadedFiles state:', filePath);
        console.log('📦 New uploadedFiles state:', newFiles);
        console.log('-----------------------');
        return newFiles;
      });

      return publicUrl;
    }
  });

  // 💡 ฟังก์ชัน Debounce สำหรับ Logic การจัดการไฟล์
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 💡 ใช้ useCallback เพื่อสร้างฟังก์ชันที่เสถียรสำหรับ Logic การจัดการไฟล์
  const cleanupFiles = useCallback(async (currentDocument: PartialBlock[]) => {
    // 1. บันทึก Content ลง Local Storage
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(currentDocument));
    console.log("📝 Block Editor content saved to localStorage.");

    // 2. ตรวจสอบไฟล์ที่ยังคงใช้งานอยู่ใน Document
    const activePaths = getActiveFilePaths(currentDocument);
    const currentUploadedFiles = JSON.parse(localStorage.getItem(UPLOADED_FILES_KEY) || '[]'); // 💡 อ่านจาก LocalStorage โดยตรง

    console.log('--- DEBUG: CLEANUP START (Debounced) ---');
    console.log('📂 currentUploadedFiles (Local Storage):', currentUploadedFiles);
    console.log('✅ activePaths (Files ที่ยังอยู่ใน Editor):', activePaths);

    // 3. เปรียบเทียบและลบไฟล์ที่ไม่ได้ใช้งานแล้ว
    const filesToDelete = currentUploadedFiles.filter((path: string) => !activePaths.includes(path));

    if (filesToDelete.length > 0) {
      try {
        const { error } = await supabase.storage.from("Published").remove(filesToDelete);

        if (error) {
          console.error("❌ Error deleting unused files:", error);
        } else {
          console.log("🗑️ Unused files deleted from Supabase:", filesToDelete);

          // 4. อัปเดต State และ Local Storage (Files) หลังการลบ
          const newUploadedFiles = currentUploadedFiles.filter((path: string) => !filesToDelete.includes(path));
          setUploadedFiles(newUploadedFiles);
          localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(newUploadedFiles));
          console.log('📦 uploadedFiles (State & LocalStorage หลังการลบ):', newUploadedFiles);
        }
      } catch (e) {
        console.error("❌ Unused file deletion failed:", e);
      }
    }
    console.log('--- DEBUG: CLEANUP END (Debounced) ---');
  }, []); // 💡 ไม่มี dependencies เพื่อให้ฟังก์ชันเสถียร

  useEffect(() => {
    const listener = editor.onChange(() => {
      if (typeof window !== "undefined") {
        const currentDocument = editor.document;

        // 💡 ล้าง Debounce เก่า
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }

        // 💡 ตั้งเวลาเรียก cleanupFiles (รวมถึงการบันทึก content) หลังหยุดพิมพ์/แก้ไข 1 วินาที
        debounceRef.current = setTimeout(() => {
          cleanupFiles(currentDocument);
        }, DEBOUNCE_DELAY);
      }
    });

    // Cleanup listener และ Debounce timer on unmount
    return () => {
      listener();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [editor, cleanupFiles]); // 💡 cleanupFiles เป็น dependency แต่เป็น useCallback ที่เสถียร

  useImperativeHandle(ref, () => ({
    editor: editor,
    uploadedFiles,
  }));

  return (
    <div className="rounded-md border border-main-neutral p-4 bg-main-white shadow-sm">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
});

export default BlockEditor;