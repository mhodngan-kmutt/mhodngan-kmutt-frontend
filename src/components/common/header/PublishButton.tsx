// /components/writeProject/PublishButton.tsx
'use client';

import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

// ---------------- Local Storage Keys ----------------
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

// ---------------- Interfaces ----------------
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

// ---------------- Helper Functions ----------------

// Check if content is empty
function isContentEmpty(contentString: string | null): boolean {
  if (!contentString) return true;
  let blocks: any[];
  try {
    blocks = JSON.parse(contentString);
  } catch (e) {
    return true;
  }
  if (!Array.isArray(blocks) || blocks.length === 0) return true;

  return !blocks.some(block => {
    if (!block || !block.type) return false;
    if (block.content && Array.isArray(block.content) && block.content.length > 0) return true;
    if (block.props && block.props.url) return true;
    if (block.type === 'table' || block.type === 'horizontalRule') return true;
    return false;
  });
}

// Clear all draft keys from localStorage
const clearAllDraftKeys = () => {
  if (typeof window !== 'undefined') {
    [
      TITLE_STORAGE_KEY, CONTENT_STORAGE_KEY, BADGE_STORAGE_KEY, EXTERNAL_LINKS_KEY,
      SHORT_DESC_KEY, PREVIEW_IMAGE_KEY, COLLAB_STORAGE_KEY, PROJECT_RESOURCES_KEY,
      DRAFT_ID_KEY, CATEGORY_SELECT_KEY,
    ].forEach(key => localStorage.removeItem(key));
  }
};

// ---------------- PublishButton Component ----------------
export default function PublishButton() {

  const handlePublish = async () => {
    // ---------------- Step 1: Get data from localStorage ----------------
    const draftId = typeof window !== 'undefined' ? localStorage.getItem(DRAFT_ID_KEY) : null;

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

    // ---------------- Step 2: Validate inputs ----------------
    if (!title || title.trim() === "") { toast.warning("Please enter the title."); return; }
    if (isContentEmpty(content)) { toast.warning("Content is empty."); return; }
    if (!rawBadge) { toast.warning("Please select a Badge."); return; }

    const sanitizedBadge = rawBadge.trim().split(' ')[0];

    try {
      toast.loading("Publishing project...", { id: 'publish-status' });

      // ---------------- Step 3: Check if project exists ----------------
      const { data: existingProject } = await supabase
        .from('projects')
        .select('project_id, created_at')
        .eq('project_id', draftId)
        .single();

      let finalProjectId = draftId;

      if (existingProject) {
        // Project exists → update it, only update updated_at
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            title,
            content,
            badge: sanitizedBadge,
            short_description: shortDescription,
            preview_image_url: previewImageUrl,
            status: 'Published',
            updated_at: new Date().toISOString(),
          })
          .eq('project_id', draftId);

        if (updateError) throw updateError;

      } else {
        // Project does not exist → insert new project with created_at and updated_at
        const { data: insertData, error: insertError } = await supabase
          .from('projects')
          .insert({
            project_id: draftId,
            title,
            content,
            badge: sanitizedBadge,
            short_description: shortDescription,
            preview_image_url: previewImageUrl,
            status: 'Published',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('project_id')
          .single();

        if (insertError) throw insertError;
        finalProjectId = insertData.project_id;
      }

      // ---------------- Step 4: Handle external links ----------------
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

      // ---------------- Step 5: Handle resources/files ----------------
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

      // ---------------- Step 6: Handle collaborators ----------------
      let collaborators: Collaborator[] = collaboratorsJson ? JSON.parse(collaboratorsJson) : [];

      // Ensure creator is always a collaborator
      const isCreatorAlreadyCollaborator = collaborators.some(c => c.user_id === user.id);
      if (!isCreatorAlreadyCollaborator) {
        const creatorUsername = user.user_metadata?.username || 'Unknown User';
        collaborators.push({
          user_id: user.id,
          username: creatorUsername,
        });
      }

      if (collaborators.length > 0) {
        const collabInserts = collaborators.map(c => ({
          project_id: finalProjectId,
          contributor_user_id: c.user_id,
        }));

        // Use upsert to avoid duplicates
        const { error: collabError } = await supabase.from('project_collaborators')
          .upsert(collabInserts, { 
            onConflict: 'project_id, contributor_user_id',
            ignoreDuplicates: true,
          });

        if (collabError) throw collabError;
      }

      // ---------------- Step 7: Handle categories ----------------
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

      // ---------------- Step 8: Clear localStorage ----------------
      clearAllDraftKeys();

      toast.success('Project published successfully!', { id: 'publish-status', duration: 5000 });
      window.location.href = `/en/project/${finalProjectId}`;

    } catch (e: any) {
      console.error('❌ Publish error:', e);
      toast.error(e.message || 'Unexpected error during publishing.', { id: 'publish-status' });
    }
  };

  return (
    <button className="btn-primary" onClick={handlePublish}>
      <div className="small">Publish</div>
    </button>
  );
}