// ContributorActionBar.tsx

import React from 'react';
import AvatarGroup from '../common/Avatar/AvatarGroup';
import Avatar from '../common/Avatar/Avatar';
import { Download } from 'lucide-react';
import { LikeButton } from '../common/button/LikeButton';
import { formatDate } from '../../lib/dateFormat';
import { DownloadButton } from '../common/button/DownLoadButton';
import { likeStore } from '@/store/likeStore';

interface Contributor {
  userId: string;
  fullname: string;
  profileImageUrl: string;
}

interface ContributorActionBarProps {
  contributors?: Contributor[];
  projectId: string;
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  files?: any[];
  token?: string;
}

export function ContributorActionBar({
  contributors = [],
  projectId = '',
  likeCount = 0,
  isLiked,
  createdAt = 'Unknown date',
  files = [],
  token
}: ContributorActionBarProps) {

  const formattedDate = formatDate(createdAt);

  const likeState = likeStore(state => state.likes[projectId]);
  const updateLike = likeStore(state => state.updateLike);

  const currentLikes = likeState?.likes ?? likeCount;
  const currentLiked = likeState?.liked ?? isLiked;

  const handleLikeChange = (newLikes: number, newLiked: boolean) => {
    updateLike(projectId, newLikes, newLiked);
  };

  return (
    // Contributor and buttons container
    <div className="flex gap-5 flex-col lg:flex-row lg:justify-between lg:items-center">
      {/* Contributor information */}
      <div className="flex flex-col gap-2">
        {/* Publisher avatar with safety check */}
        {contributors && contributors.length > 0 ? (
          <div className="flex items-center gap-4">
            <Avatar
              name={contributors[0]?.fullname || 'Unknown'}
              avatar={contributors[0]?.profileImageUrl || ''}
            />
            <div className="text-supporting-ghost">
              <span className="small">{contributors[0]?.fullname || 'Unknown Author'}</span>
              <span className="detail"> | {formattedDate}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
            <div className="text-supporting-ghost">
              <span className="small">Unknown Author</span>
              <span className="detail"> | {formattedDate}</span>
            </div>
          </div>
        )}

        {/* Contributor avatars with safety check */}
        {contributors && contributors.length > 0 && (
          <div className="flex items-center gap-4">
            <AvatarGroup
              contributors={contributors}
              className="w-6 h-6 -space-x-7"
            />
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-row flex-wrap justify-end gap-2">
        {/* Like button */}
        <LikeButton
          projectId={projectId}
          initialLikes={currentLikes}
          initialLiked={currentLiked}
          token={token}
        />

        {/* Download button */}
        <DownloadButton
          files={files}
        />
      </div>
    </div>
  );
}