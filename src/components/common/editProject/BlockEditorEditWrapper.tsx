// /components/editProject/BlockEditorEditWrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import BlockEditorWrapper from '@/components/writeProject/BlockEditorWrapper'; 
import { toast } from 'sonner';

// Define all Local Storage Keys used in BlockEditorWrapper
const DRAFT_ID_KEY = 'currentDraftId';
const TITLE_STORAGE_KEY = 'projectTitle';
const BADGE_STORAGE_KEY = 'projectBadge'; 
const SHORT_DESC_KEY = 'projectShortDescription';
const PREVIEW_IMAGE_KEY = 'previewImageUrl';
const CONTENT_STORAGE_KEY = 'projectContent'; 
const EXTERNAL_LINKS_KEY = 'externalLinks';
const PROJECT_RESOURCES_KEY = 'projectResources';
const COLLAB_STORAGE_KEY = 'projectCollaborators';
const CATEGORY_SELECT_KEY = 'projectSelectedCategoryIds';

const clearAllDraftKeys = () => {
    if (typeof window !== 'undefined') {
        [
            DRAFT_ID_KEY, TITLE_STORAGE_KEY, BADGE_STORAGE_KEY, SHORT_DESC_KEY, 
            PREVIEW_IMAGE_KEY, CONTENT_STORAGE_KEY, EXTERNAL_LINKS_KEY, 
            PROJECT_RESOURCES_KEY, COLLAB_STORAGE_KEY, CATEGORY_SELECT_KEY,
        ].forEach(key => localStorage.removeItem(key));
    }
};

// Data interfaces (remains the same)
interface BlockEditorEditWrapperProps {
  currentLang: string;
  projectId: string; // ID of the project to be edited (from URL params)
}

export default function BlockEditorEditWrapper({ currentLang, projectId }: BlockEditorEditWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 💡 2. Fetch Data and Hydrate Local Storage
  useEffect(() => {
    async function fetchProjectDataAndHydrate() {
      setLoading(true);
      setError(null);
      if (typeof window === 'undefined') return;
      
      clearAllDraftKeys(); 

      try {
        // --- 1. Fetch Data: เติม fields ที่หายไปใน .select() ---
        const { data: mainData, error: mainError } = await supabase
          .from('projects')
          // 💡 แก้ไข: เติม fields ที่ขาดหายไปใน .select()
          .select(`
            title, badge, short_description, preview_image_url, content,
            project_external_links (link_id, link_url),
            project_files (file_id, file_url),
            project_collaborators (contributor_user_id, users!project_collaborators_contributor_user_id_fkey (username)), 
            project_categories (category_id)
          `)
          .eq('project_id', projectId) 
          .single();

        if (mainError || !mainData) throw new Error(mainError?.message || "Project not found or user unauthorized.");

        console.log('--- DEBUG: FETCHED DATA ---');
        console.log('Raw Links Data:', mainData.project_external_links); 
        console.log('--- END DEBUG ---');

        // --- 2. Process and Map Complex Data ---
        
        // Collabs: Map to {user_id, username}
        const collaboratorsMapped = mainData.project_collaborators?.map((collab: any) => ({
            user_id: collab.contributor_user_id,
            username: collab.users?.username || 'Unknown', 
        })) || [];

        // Links: Map to {id, url}
        const linksMapped = mainData.project_external_links?.map((link: any) => ({
            id: link.link_id,
            url: link.link_url,
        })) || [];

        console.log('Mapped Links:', linksMapped);

        // Resources: Map to the UploadedResource interface
        const resourcesMapped = mainData.project_files?.map((file: any) => ({
            file_id: file.file_id,
            project_id: projectId, 
            file_url: file.file_url,
            file_name: file.file_url.substring(file.file_url.lastIndexOf('/') + 1), 
            file_path: file.file_url.substring(file.file_url.lastIndexOf('public/') + 7), 
        })) || [];
        
        // Categories: Map to an Array of category_id strings
        const categoriesMapped = mainData.project_categories?.map((cat: any) => cat.category_id) || [];
        
        // --- 3. Hydrate Local Storage for BlockEditorWrapper ---
        
        // A. Primary Fields 
        localStorage.setItem(DRAFT_ID_KEY, projectId); 
        localStorage.setItem(TITLE_STORAGE_KEY, mainData.title);
        localStorage.setItem(BADGE_STORAGE_KEY, mainData.badge);
        localStorage.setItem(SHORT_DESC_KEY, mainData.short_description || '');
        localStorage.setItem(PREVIEW_IMAGE_KEY, mainData.preview_image_url || '');
        
        // B. Complex Fields (JSON serialization)
        localStorage.setItem(CONTENT_STORAGE_KEY, mainData.content || JSON.stringify([{ type: "paragraph", content: [] }]));
        localStorage.setItem(EXTERNAL_LINKS_KEY, JSON.stringify(linksMapped));
        localStorage.setItem(PROJECT_RESOURCES_KEY, JSON.stringify(resourcesMapped));
        localStorage.setItem(COLLAB_STORAGE_KEY, JSON.stringify(collaboratorsMapped));
        localStorage.setItem(CATEGORY_SELECT_KEY, JSON.stringify(categoriesMapped)); 

      } catch (err: any) {
        toast.error("Failed to load project data: " + err.message);
        setError("Error loading project data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjectDataAndHydrate();
    
    // 💡 Cleanup function
    return () => {
    };
  }, [projectId]); 

  
  if (loading) {
    return <div className="text-center p-20">Loading project for editing...</div>;
  }
  
  if (error) {
      return <div className="text-center p-20 text-supporting-error">{error}</div>;
  }

  // 4. Render the existing form (BlockEditorWrapper)
  return (
    <BlockEditorWrapper 
      currentLang={currentLang}
    />
  );
}