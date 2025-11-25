// /components/writeProject/BlockEditorWrapper.tsx
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import BlockEditor, { type BlockEditorRef } from '../common/BlockNote/BlockEditor';
import { DropdownBadge, type ProjectBadge } from '@/components/common/dropdown/DropdownBadge'; 
import ProjectResourceUploader from '@/components/writeProject/ProjectResourceUploader';
import ExternalLinkAdder from '@/components/writeProject/ExternalLinkAdder';
import CategorySelect from '@/components/writeProject/CategorySelect';
import ShortDescription from '@/components/writeProject/ShortDescription';
import PreviewImageUploader from '@/components/writeProject/PreviewImageUploader';
import CollaboratorSelector from '@/components/writeProject/CollaboratorSearch';

interface BlockEditorWrapperProps {
  currentLang: string;
}

const TITLE_STORAGE_KEY = 'projectTitle';
const BADGE_STORAGE_KEY = 'projectBadge'; 
const PROJECT_RESOURCES_KEY = 'projectResources';
const DRAFT_ID_KEY = 'currentDraftId';
const EXTERNAL_LINKS_KEY = 'externalLinks';
const SHORT_DESC_KEY = 'projectShortDescription';
const PREVIEW_IMAGE_KEY = 'previewImageUrl';

interface UploadedResource {
  file_id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_path: string;
}

interface ExternalLink {
  id: string;
  url: string;
}

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

  const [badge, setBadge] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const storedBadge = localStorage.getItem(BADGE_STORAGE_KEY);
      return storedBadge !== null ? storedBadge : ''; 
    }
    return '';
  });

  const [projectResources, setProjectResources] = useState<UploadedResource[]>(() => {
    if (typeof window !== 'undefined') {
        const storedResources = localStorage.getItem(PROJECT_RESOURCES_KEY);
        if (storedResources) {
            try {
                return JSON.parse(storedResources) as UploadedResource[];
            } catch (e) {
                console.error("Error parsing stored project resources:", e);
                return [];
            }
        }
    }
    return [];
  });

  const [draftId, setDraftId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DRAFT_ID_KEY);
    }
    return null;
  });

  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(() => {
    if (typeof window !== 'undefined') {
        const storedLinks = localStorage.getItem(EXTERNAL_LINKS_KEY);
        if (storedLinks) {
             try {
                const parsedLinks = JSON.parse(storedLinks) as ExternalLink[];
                return parsedLinks.length > 0 ? parsedLinks : []; 
             } catch (e) {
                 console.error("Error parsing stored external links:", e);
                 return [];
             }
        }
    }
    return [];
  });

  const [shortDescription, setShortDescription] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedDesc = localStorage.getItem(SHORT_DESC_KEY);
      return storedDesc !== null ? storedDesc : '';
    }
    return '';
  });

  const [previewImageUrl, setPreviewImageUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(PREVIEW_IMAGE_KEY) || '';
    }
    return '';
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !draftId) {
      const newId = crypto.randomUUID();
      localStorage.setItem(DRAFT_ID_KEY, newId);
      setDraftId(newId);
    }
  }, [draftId]);

  // 2. ใช้ useEffect เพื่อบันทึก title ลง localStorage 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TITLE_STORAGE_KEY, title);
    }
  }, [title]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(BADGE_STORAGE_KEY, badge);
    }
  }, [badge]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECT_RESOURCES_KEY, JSON.stringify(projectResources));
    }
  }, [projectResources]);

  // 💡 External Links Effect 
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(EXTERNAL_LINKS_KEY, JSON.stringify(externalLinks));
    }
  }, [externalLinks]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SHORT_DESC_KEY, shortDescription);
    }
  }, [shortDescription]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PREVIEW_IMAGE_KEY, previewImageUrl);
    }
  }, [previewImageUrl]);

  const handleResourceUpload = useCallback((resource: UploadedResource) => {
    setProjectResources(prev => [...prev, resource]);
  }, []);

  const handleResourceRemove = useCallback((fileId: string) => {
    setProjectResources(prev => prev.filter(resource => resource.file_id !== fileId));
  }, []);

  // 💡 Handler เพื่อรับรายการลิงก์ทั้งหมดที่อัปเดตจาก ExternalLinkAdder
  const handleLinksChange = useCallback((newLinks: ExternalLink[]) => {
      setExternalLinks(newLinks);
  }, []);

  const handleShortDescriptionChange = useCallback((desc: string) => {
      setShortDescription(desc);
  }, []);

  const handleImageUrlChange = useCallback((url: string) => {
      setPreviewImageUrl(url);
  }, []);
  
  return (
    <div 
      className="flex flex-col items-center bg-main-background min-h-screen px-[var(--padding-md)]"
    > 
      <div 
        className="flex flex-col gap-15 p-[120px_60px_24px_60px]" 
      >
        <h1>Write New Project</h1>
      </div>
      <div className="flex flex-col gap-5 w-full max-w-[980px] pb-32"> 
        
        {/* 💡 Title and Badge */}
        <div className="flex gap-4"> 
          <div className="flex flex-col gap-1.5 flex-grow">
            <h4>Title<span className="text-main-primary">*</span></h4>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="px-3 h-10 bg-main-white border border-main-neutral rounded-md shadow-sm"
              placeholder="Add title"
            />
          </div>
          
          {/* Dropdown Badge */}
          <div className="flex flex-col gap-1.5 w-[200px] min-w-[150px]">
            <h4>Badge<span className="text-main-primary">*</span></h4>
            <DropdownBadge
              selectedBadge={badge}
              onBadgeSelect={(selected) => setBadge(selected)} 
            />
          </div>
        </div>

        {/* Content (BlockEditor) */}
        <div className="flex flex-col gap-1.5">
          <h4>Content<span className="text-main-primary">*</span></h4>
          <BlockEditor ref={editorRef} />
        </div>

        {/* Project Resources Uploader */}
        <div className="flex flex-col gap-1.5">
            <h4>Add project resources</h4>
            <ProjectResourceUploader 
                projectId={draftId ?? ''} 
                onUploadSuccess={handleResourceUpload}
                initialResources={projectResources} 
                onResourceRemove={handleResourceRemove} 
            />
        </div>

        {/* Add external links */}
        <div className="flex flex-col gap-1.5">
            <h4>Add external links</h4>
            <ExternalLinkAdder 
                initialLinks={externalLinks}
                onLinksChange={handleLinksChange}
            />
        </div>

        {/* Category Select */}
        <div className="flex flex-col gap-1.5">
          <CategorySelect projectId={draftId ?? ''} />
        </div>

        <ShortDescription 
          initialValue={shortDescription}
          onDescriptionChange={handleShortDescriptionChange}
        />

        <PreviewImageUploader
          projectId={draftId ?? ''} 
          initialImageUrl={previewImageUrl}
          onImageUrlChange={handleImageUrlChange}
        />

        {/* Collaborators */}
        <CollaboratorSelector 
          projectId={draftId ?? ''}
          currentLang={currentLang}
        />
      </div>
    </div>
  );
}