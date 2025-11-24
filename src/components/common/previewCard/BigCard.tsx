'use client';

import React from 'react';
import { Heart, Eye } from 'lucide-react';
import AvatarGroup from '../Avatar/AvatarGroup';
import { ProjectActionsDropdown } from '../dropdown/ProjectActionsDropdown';
import { recordProjectView } from '@/lib/api';
import { createBrowserClient } from '@supabase/ssr';
import type { Professor, Contributor } from '@/lib/api';

interface BigCardProps {
  projectImage: string;
  title: string;
  explanation: string;
  likes: number;
  views: number;
  professors: Professor[];
  contributors: Contributor[];
  link: string;
  showActions?: boolean;
  projectId: string;
  token?: string;
  certified: string;
  contributorsLabel: string;
}

export default function BigCard({
  projectImage,
  title,
  explanation,
  likes,
  views,
  professors,
  contributors,
  link,
  showActions = false,
  projectId,
  token,
  certified,
  contributorsLabel,
}: BigCardProps) {
  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    
    // Get user session and record view
    try {
      const supabase = createBrowserClient(
        import.meta.env.PUBLIC_SUPABASE_URL!,
        import.meta.env.PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || '';
      
      await recordProjectView(userId, projectId);
    } catch (error) {
      console.debug('Failed to record project view:', error);
    }
    
    // Navigate to project
    window.location.href = link;
  };

  return (
    <a 
      href={link} 
      className="block hover:shadow-lg transition-shadow rounded-xl"
      onClick={handleClick}
    >
      <div className="w-[360px] flex flex-col gap-3 p-2.5 rounded-xl bg-main-white shadow-[0_0_16px_0_rgba(0,0,0,0.06)]">
        <div className="relative h-[160px] w-full rounded-xl overflow-hidden flex items-center justify-center">
          <img
            src={projectImage || '/images/mocks/ProjectImageMocks-2.png'}
            alt={title}
            className="w-full h-full object-cover object-center rounded-xl transition duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>
        <div className="w-full pl-1.5 pr-4 overflow-hidden">
          <h4 className="truncate">{title}</h4>
        </div>
        <div className="w-full pl-1.5 pr-4">
          <div className="text-supporting-support h-[50px] line-clamp-2">{explanation}</div>
        </div>
        <div className="w-full flex justify-between items-center px-1.5">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1">
              <Heart className="w-4 h-4" color="var(--color-supporting-light-orange)" />
              <div className="subtle text-supporting-support">{likes}</div>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" color="var(--color-supporting-light-orange)" />
              <div className="subtle text-supporting-support">{views}</div>
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {professors.length > 0 && (
              <>
                <div className="detail text-supporting-support">{certified}</div>
                <div className="flex justify-center -space-x-5">
                  <AvatarGroup contributors={professors} className="w-5 h-5" />
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex px-4 py-3 rounded-xl border-2 border-main-background h-[72px]">
          <div className="flex w-full gap-2.5">
            <AvatarGroup contributors={contributors} />
            <div className="w-full gap-1">
              <div className="small">{contributorsLabel}</div>
              <div className="detail text-supporting-support">@cpe, kmutt</div>
            </div>
          </div>
          {showActions && token && (
            <ProjectActionsDropdown projectId={projectId} token={token} />
          )}
        </div>
      </div>
    </a>
  );
}
