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

// 💡 Local Storage Keys (Synced with PublishButton.tsx)
const TITLE_STORAGE_KEY = 'projectTitle';
const CONTENT_STORAGE_KEY = 'projectContent';
const BADGE_STORAGE_KEY = 'projectBadge';
const EXTERNAL_LINKS_KEY = 'externalLinks';
const SHORT_DESC_KEY = 'projectShortDescription';
const PREVIEW_IMAGE_KEY = 'previewImageUrl';
const COLLAB_STORAGE_KEY = 'projectCollaborators';
const PROJECT_RESOURCES_KEY = 'projectResources'; // Key for uploaded files/resources
const DRAFT_ID_KEY = 'currentDraftId';
const CATEGORY_SELECT_KEY = 'projectSelectedCategoryIds';

// Interface for resource objects (Synced with PublishButton.tsx)
interface UploadedResource {
  file_id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_path: string;
}

interface CancelButtonProps {
  onCancel?: () => void;
}

// --- Clear all draft keys from Local Storage (Synced with PublishButton.tsx) ---
const clearAllDraftKeys = () => {
  if (typeof window !== 'undefined') {
    [
      TITLE_STORAGE_KEY, CONTENT_STORAGE_KEY, BADGE_STORAGE_KEY, EXTERNAL_LINKS_KEY,
      SHORT_DESC_KEY, PREVIEW_IMAGE_KEY, COLLAB_STORAGE_KEY, PROJECT_RESOURCES_KEY,
      DRAFT_ID_KEY, CATEGORY_SELECT_KEY,
    ].forEach(key => localStorage.removeItem(key));
    console.log("📝 All Draft data cleared from localStorage.");
  }
};


export default function CancelButton({ onCancel }: CancelButtonProps) {
  
  // read file paths from localStorage (using the correct resource key)
  const getDraftFilePaths = (): string[] => {
    if (typeof window !== "undefined") {
      const storedResources = localStorage.getItem(PROJECT_RESOURCES_KEY);
      try {
        const parsed: UploadedResource[] = JSON.parse(storedResources || '[]');
        // We only need the file_path for Supabase storage removal
        return Array.isArray(parsed) ? parsed.map(r => r.file_path).filter(p => p) : [];
      } catch (e) {
        console.error("Error parsing draft resources:", e);
        return [];
      }
    }
    return [];
  };
  
  const handleConfirmCancel = async () => {
    const draftFilePaths = getDraftFilePaths();

    try {
      // 1. Delete files from Supabase Storage
      if (draftFilePaths.length > 0) {
        // Assuming your bucket name is "Published"
        const { error } = await supabase.storage.from("Published").remove(draftFilePaths);
        if (error) console.error("❌ Error deleting draft files from storage:", error);
        else console.log("✅ Draft files deleted from storage:", draftFilePaths);
      }
      
      // 2. Clear all Local Storage keys
      clearAllDraftKeys();

      // 3. Optional callback and page reload
      onCancel?.();
      window.history.back();
    } catch (e) {
      console.error("❌ Cancel error:", e);
    }
  };

  return (
    <AlertDialog>
      {/* Mobile Trigger: Opens the dialog */}
      <AlertDialogTrigger asChild>
        <Trash2Icon
          size={24}
          strokeWidth={1.5}
          className="md:hidden text-[var(--color-main-neutral2)] cursor-pointer hover:text-supporting-error transition-colors"
        />
      </AlertDialogTrigger>

      {/* Desktop Trigger: Opens the dialog */}
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
          <AlertDialogCancel
            onClick={() => {
              window.history.back();
            }}
            className="hover:bg-main-neutral small"
          >
            Keep Drafting
          </AlertDialogCancel>
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