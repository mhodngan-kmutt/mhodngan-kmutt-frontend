import { useState } from 'react';
import { Heart } from 'lucide-react';
import { likeProject } from "@/lib/api";
import { likeStore } from '@/store/likeStore';
import { toast } from 'sonner';

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
    if (!token) {
      toast.warning("Please sign in to like this project.");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const response = await likeProject({ projectId, token: token || "" });
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
      className={`btn-tertiary ${loading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${currentLiked ? 'text-main-primary fill-main-primary' : 'text-main-secondary'
          }`}
      />
      <span className={`small ${currentLiked ? 'text-main-primary' : 'text-main-secondary'}`}>
        {currentLiked ? 'Liked' : 'Like'}
      </span>
      <span className={`small ${currentLiked ? 'text-main-primary' : 'text-main-secondary'}`}>
        ({currentLikes})
      </span>
    </button>
  );
}
