'use client';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// 💡 Local Storage Keys
const TITLE_STORAGE_KEY = 'projectTitle';
const CONTENT_STORAGE_KEY = 'projectContent';
const BADGE_STORAGE_KEY = 'projectBadge';
const EXTERNAL_LINKS_KEY = 'externalLinks';
const SHORT_DESC_KEY = 'projectShortDescription';
const PREVIEW_IMAGE_KEY = 'previewImageUrl';
const COLLAB_STORAGE_KEY = 'projectCollaborators';
const PROJECT_RESOURCES_KEY = 'projectResources';
const DRAFT_ID_KEY = 'currentDraftId';
const CATEGORY_SELECT_KEY = 'projectSelectedCategoryIds';

// Interfaces
interface Collaborator {
  user_id: string;
  username: string;
}

interface ExternalLink {
  id: string;
  url: string;
}

interface UploadedResource {
  file_id: string;
  project_id: string;
  file_url: string;
  file_name: string;
  file_path: string;
}

// --- Check if content is empty ---
function isContentEmpty(contentString: string | null): boolean {
  if (!contentString) return true;
  let blocks: any[];
  try {
    blocks = JSON.parse(contentString);
  } catch (e) {
    return true;
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return true;
  const hasMeaningfulContent = blocks.some(block => {
    if (!block || !block.type) return false;
    if (block.content && Array.isArray(block.content) && block.content.length > 0) return true;
    if (block.props && block.props.url) return true;
    if (block.type === 'table' || block.type === 'horizontalRule') return true;
    return false;
  });
  return !hasMeaningfulContent;
}

// --- Clear all draft keys from Local Storage ---
const clearAllDraftKeys = () => {
  if (typeof window !== 'undefined') {
    [
      TITLE_STORAGE_KEY, CONTENT_STORAGE_KEY, BADGE_STORAGE_KEY, EXTERNAL_LINKS_KEY,
      SHORT_DESC_KEY, PREVIEW_IMAGE_KEY, COLLAB_STORAGE_KEY, PROJECT_RESOURCES_KEY,
      DRAFT_ID_KEY, CATEGORY_SELECT_KEY,
    ].forEach(key => localStorage.removeItem(key));
  }
};

export default function PublishButton() {
  const handlePublish = async () => {
    // 1. Get all data from Local Storage
    const draftId = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_ID_KEY) : null;
    // 💡 แก้ไข: ดึง user object
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) { toast.error("User not authenticated."); return; }
    if (!draftId) { toast.error("Draft ID missing."); return; }

    const title = localStorage.getItem(TITLE_STORAGE_KEY);
    const content = localStorage.getItem(CONTENT_STORAGE_KEY);
    const rawBadge = localStorage.getItem(BADGE_STORAGE_KEY);
    const shortDescription = localStorage.getItem(SHORT_DESC_KEY);
    const previewImageUrl = localStorage.getItem(PREVIEW_IMAGE_KEY);
    const categoriesJson = localStorage.getItem(CATEGORY_SELECT_KEY);
    const collaboratorsJson = localStorage.getItem(COLLAB_STORAGE_KEY);
    const externalLinksJson = localStorage.getItem(EXTERNAL_LINKS_KEY);
    const resourcesJson = localStorage.getItem(PROJECT_RESOURCES_KEY);

    // 2. Validate inputs
    if (!title || title.trim() === "") { toast.warning("Please enter the title."); return; }
    if (isContentEmpty(content)) { toast.warning("Content is empty."); return; }
    if (!rawBadge) { toast.warning("Please select a Badge."); return; }

    const sanitizedBadge = rawBadge.trim().split(' ')[0];

    // 3. Prepare project data
    const projectUpdateData = {
      project_id: draftId,
      title,
      content,
      badge: sanitizedBadge,
      short_description: shortDescription,
      preview_image_url: previewImageUrl,
      status: 'Published',
      created_at: new Date().toISOString(),
    };

    try {
      toast.loading("Publishing project...", { id: 'publish-status' });
      console.log('📦 Badge before upsert:', sanitizedBadge);

      // A. Upsert into `projects`
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .upsert(projectUpdateData)
        .select('project_id')
        .single();

      if (projectError) throw projectError;
      const finalProjectId = projectData.project_id;

      // B. Handle external links
      if (externalLinksJson) {
        const links: ExternalLink[] = JSON.parse(externalLinksJson);
        await supabase.from('project_external_links').delete().eq('project_id', draftId);

        if (links.length > 0) {
          const linkInserts = links.map(link => ({
            project_id: finalProjectId,
            link_url: link.url,
          }));
          const { error: linkError } = await supabase.from('project_external_links').insert(linkInserts);
          if (linkError) throw linkError;
        }
      }

      // C. Handle files/resources
      if (resourcesJson) {
        const resources: UploadedResource[] = JSON.parse(resourcesJson);
        await supabase.from('project_files').delete().eq('project_id', draftId);

        if (resources.length > 0) {
          const resourceInserts = resources.map(r => ({
            project_id: finalProjectId,
            file_url: r.file_url,
          }));
          const { error: resourceError } = await supabase.from('project_files').insert(resourceInserts);
          if (resourceError) throw resourceError;
        }
      }

      // D. Handle collaborators
      let collaborators: Collaborator[] = collaboratorsJson ? JSON.parse(collaboratorsJson) : [];
      
      // --- START: เพิ่มผู้ใช้ปัจจุบันเป็น Collaborator อัตโนมัติ ---
      const isCreatorAlreadyCollaborator = collaborators.some(
        c => c.user_id === user.id
      );

      // ถ้าผู้สร้างไม่อยู่ในรายชื่อ ให้เพิ่มเข้าไป
      if (!isCreatorAlreadyCollaborator) {
        // ใช้ username จาก user_metadata ซึ่งเป็นข้อมูลที่มาจาก Supabase Auth
        const creatorUsername = user.user_metadata?.username || 'Unknown User'; 
        
        collaborators.push({
          user_id: user.id,
          username: creatorUsername, 
        });
        console.log(`✅ Current user (ID: ${user.id}) added to collaborators.`);
      }
      // --- END: เพิ่มผู้ใช้ปัจจุบันเป็น Collaborator อัตโนมัติ ---
      
      // ลบ collaborators เก่าออกก่อน
      await supabase.from('project_collaborators').delete().eq('project_id', draftId);

      if (collaborators.length > 0) {
        const collabInserts = collaborators.map(c => ({
          project_id: finalProjectId,
          contributor_user_id: c.user_id,
        }));
        const { error: collabError } = await supabase.from('project_collaborators').insert(collabInserts);
        if (collabError) throw collabError;
      }

      // E. Handle categories
      if (categoriesJson) {
        const categoryIds: string[] = JSON.parse(categoriesJson);
        await supabase.from('project_categories').delete().eq('project_id', draftId);

        if (categoryIds.length > 0) {
          const categoryInserts = categoryIds.map(catId => ({
            project_id: finalProjectId,
            category_id: catId,
          }));
          const { error: categoryError } = await supabase.from('project_categories').insert(categoryInserts);
          if (categoryError) throw categoryError;
        }
      }
      

      // 4. Clear all local storage data
      clearAllDraftKeys();

      toast.success('Project published successfully!', { id: 'publish-status', duration: 5000 });
      window.location.href = `/en/project/${finalProjectId}`;
    } catch (e: any) {
      const errorMessage = e.message || 'Unexpected error during publishing.';
      console.error('❌ Publish error:', e);
      toast.error(errorMessage, { id: 'publish-status' });
    }
  };

  return (
    <button className="btn-primary" onClick={handlePublish} disabled={false}>
      <div className="small">Publish</div>
    </button>
  );
}