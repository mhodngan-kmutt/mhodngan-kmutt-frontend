'use client';

import { Trash2Icon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const TITLE_STORAGE_KEY = 'projectTitle';
const CONTENT_STORAGE_KEY = 'projectContent';
const UPLOADED_FILES_KEY = 'uploadedFiles';

interface CancelButtonProps {
  onCancel?: () => void;
}

export default function CancelButton({ onCancel }: CancelButtonProps) {
  
  // read file from localStorage
  const getDraftFilePaths = (): string[] => {
    if (typeof window !== "undefined") {
      const storedFiles = localStorage.getItem(UPLOADED_FILES_KEY);
      try {
        const parsed = JSON.parse(storedFiles || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  };
  
  const handleConfirmCancel = async () => {
    const draftFilePaths = getDraftFilePaths();

    try {
      if (draftFilePaths.length > 0) {
        const { error } = await supabase.storage.from("Published").remove(draftFilePaths);
        if (error) console.error("❌ Error deleting draft files:", error);
        else console.log("✅ Draft files deleted:", draftFilePaths);
      }

      if (typeof window !== 'undefined') {
        localStorage.removeItem(TITLE_STORAGE_KEY);
        localStorage.removeItem(CONTENT_STORAGE_KEY);
        localStorage.removeItem(UPLOADED_FILES_KEY);
        console.log("📝 Draft data cleared from localStorage.");
      }

      onCancel?.();
      window.location.reload();
    } catch (e) {
      console.error("❌ Cancel error:", e);
    }
  };

  return (
    <AlertDialog>
      {/* Mobile Trigger: Opens the dialog, onClick removed */}
      <AlertDialogTrigger asChild>
        <Trash2Icon
          size={24}
          strokeWidth={1.5}
          className="md:hidden text-[var(--color-main-neutral2)] cursor-pointer hover:text-supporting-error transition-colors"
        />
      </AlertDialogTrigger>

      {/* Desktop Trigger: Opens the dialog, onClick removed */}
      <AlertDialogTrigger asChild>
        <button className="btn-ghost-light small !hidden md:!inline-flex hover:text-supporting-error hover:!border-supporting-error transition-colors">
          Cancel
        </button>
      </AlertDialogTrigger>

      {/* Dialog Content: This pops up when a trigger is clicked */}
      <AlertDialogContent className="bg-main-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-main-primary">
            <h4>Delete draft project?</h4>
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action is irreversible. This action will permanently delete your draft project, including its title, content, and all uploaded files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-main-neutral small">Keep Drafting</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmCancel}
            className="bg-main-primary hover:bg-supporting-dark-orange text-main-neutral small"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
