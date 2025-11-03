'use client';

import { BlockNoteSchema, createHeadingBlockSpec, BlockNoteEditor, type PartialBlock } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner"

const CONTENT_STORAGE_KEY = 'projectContent';
const UPLOADED_FILES_KEY = 'uploadedFiles';

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

// Check the files that are actually in use
function getActiveFilePaths(document: PartialBlock[]): string[] {
  const activePaths: string[] = [];
  const publicUrlPrefix = supabase.storage.from("Published").getPublicUrl('').data.publicUrl;

  const traverse = (blocks: PartialBlock[]) => {
    for (const block of blocks) {
      // 1. ตรวจสอบ Block Type ที่อาจมีไฟล์ (เช่น image, file, custom block)
      if (block.type === 'image' && block.props?.url) {
        const url = block.props.url as string;
        // 💡 แปลง Public URL กลับเป็น File Path
        if (url.startsWith(publicUrlPrefix)) {
          // ดึงเฉพาะส่วนท้ายที่เป็น filePath
          const filePath = url.substring(publicUrlPrefix.length);
          activePaths.push(filePath);
        }
      }

      // 2. ตรวจสอบ Content ภายใน Block (ถ้ามี)
      if (block.content && Array.isArray(block.content)) {
        // สำหรับ Inline content ที่อาจมีไฟล์ (BlockNote image/file blocks มักใช้ props.url)
      }

      // 3. ตรวจสอบ Nested Blocks (ถ้า BlockNote รองรับ)
      if (block.children && Array.isArray(block.children)) {
        traverse(block.children);
      }
    }
  };

  traverse(document);
  return activePaths;
}

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

  // 2. Custom upload function: บันทึกรายชื่อไฟล์ลง localStorage ด้วย
  const customUploadFile = async (file: File) => {
    const { publicUrl, filePath } = await uploadFile(file);

    // อัปเดต state และ localStorage ด้วย path ของไฟล์ใหม่
    setUploadedFiles(prev => {
      const newFiles = [...prev, filePath];
      console.log('--- DEBUG: UPLOAD ---');
      console.log('✅ File uploaded and added to uploadedFiles state:', filePath);
      console.log('📦 New uploadedFiles state:', newFiles);
      console.log('-----------------------');
      return newFiles;
    });

    console.log('✅ File uploaded and saved to localStorage:', filePath);
    return publicUrl;
  };

  const editor = useCreateBlockNote({
    initialContent: getInitialContent(),
    placeholders: {
      emptyDocument: "Start typing..",
      heading: "Start typing..",
    },
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        heading: createHeadingBlockSpec({
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
    uploadFile: customUploadFile,
  });

  useEffect(() => {
    const listener = editor.onChange(() => {
      if (typeof window !== "undefined") {
        const currentDocument = editor.document;

        // 1. บันทึก Content ลง Local Storage
        localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(currentDocument));
        console.log("📝 Block Editor content saved to localStorage.");

        // 2. ตรวจสอบไฟล์ที่ยังคงใช้งานอยู่ใน Document
        const activePaths = getActiveFilePaths(currentDocument);
        console.log('--- DEBUG: ON CHANGE START ---');
        console.log('📂 uploadedFiles (State ก่อนการลบ):', uploadedFiles);
        console.log('✅ activePaths (Files ที่ยังอยู่ใน Editor):', activePaths);

        // 3. เปรียบเทียบและลบไฟล์ที่ไม่ได้ใช้งานแล้ว
        // filesToDelete = ไฟล์ที่อยู่ใน uploadedFiles แต่ไม่อยู่ใน activePaths
        const filesToDelete = uploadedFiles.filter(path => !activePaths.includes(path));

        if (filesToDelete.length > 0) {
          supabase.storage.from("Published").remove(filesToDelete)
            .then(({ error }) => {
              if (error) {
                console.error("❌ Error deleting unused files:", error);
              } else {
                console.log("🗑️ Unused files deleted from Supabase:", filesToDelete);

                // 4. อัปเดต State และ Local Storage (Files) หลังการลบ
                const newUploadedFiles = activePaths;
                setUploadedFiles(newUploadedFiles);
                localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(newUploadedFiles));
                console.log('📦 uploadedFiles (State หลังการลบ):', newUploadedFiles);
              }
            })
            .catch(e => console.error("❌ Unused file deletion failed:", e));
        } else {
          // หากไม่มีไฟล์ที่ต้องลบ, ให้บันทึก uploadedFiles state ล่าสุดลง localStorage
          if (uploadedFiles.length !== activePaths.length || !uploadedFiles.every((val, index) => val === activePaths[index])) {
            setUploadedFiles(activePaths);
            localStorage.setItem(UPLOADED_FILES_KEY, JSON.stringify(activePaths));
            console.log('📦 uploadedFiles (State Updated to activePaths):', activePaths);
          }
        }
      }
    });

    // Cleanup listener on unmount
    return () => {
      listener();
    };
  }, [editor, uploadedFiles]);

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