import { useState } from 'react';
import { Heart } from 'lucide-react';
import { likeProject } from "@/lib/api";
import { likeStore } from '@/store/likeStore';

interface LikeButtonProps {
  projectId: string;
  initialLikes: number;
  initialLiked: boolean;
  token?: string;
}

export function LikeButton({
  projectId,
  initialLikes,
  initialLiked,
  token,
}: LikeButtonProps) {
  const [loading, setLoading] = useState(false);

  const likeState = likeStore(state => state.likes[projectId]);
  const updateLike = likeStore(state => state.updateLike);

  const currentLikes = likeState?.likes ?? initialLikes;
  const currentLiked = likeState?.liked ?? initialLiked;

  const handleLike = async () => {
    console.log("Liking project:", projectId);
    if (loading) return;
    setLoading(true);

    try {
      const response = await likeProject({ projectId, token: token || "" });
      console.log("Like response:", response);
      const newLiked = response.liked;
      const newLikes = newLiked ? currentLikes + 1 : currentLikes - 1;

      updateLike(projectId, newLikes, newLiked);
    } catch (err) {
      console.error("Error liking project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`btn-tertiary ${currentLiked ? 'bg-red-50 border-red-200' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${currentLiked ? 'text-red-500 fill-red-500' : 'text-main-secondary'
          }`}
      />
      <span className={`small ${currentLiked ? 'text-red-500' : 'text-main-secondary'}`}>
        {currentLiked ? 'Liked' : 'Like'}
      </span>
      <span className={`small ${currentLiked ? 'text-red-500' : 'text-main-secondary'}`}>
        ({currentLikes})
      </span>
    </button>
  );
}
