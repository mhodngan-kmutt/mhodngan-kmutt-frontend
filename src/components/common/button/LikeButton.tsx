import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

interface LikeButtonProps {
  projectId: string | number;
  initialLikes: number;
  initialLiked?: boolean;
}

export function LikeButton({ projectId, initialLikes, initialLiked = false }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/likes`, {  //what's your API what's your API~
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add auth header if needed
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to update like');

      const data = await response.json();
      setLikes(data.likes);
      setLiked(data.liked);
      
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update
      setLikes(initialLikes);
      setLiked(initialLiked);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLike}
      disabled={loading}
      className={`btn-tertiary ${liked ? 'bg-red-50 border-red-200' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <Heart 
        className={`w-5 h-5 transition-colors ${
          liked ? 'text-red-500 fill-red-500' : 'text-main-secondary'
        }`}
      />
      <span className={`small ${liked ? 'text-red-500' : 'text-main-secondary'}`}>
        {liked ? 'Liked' : 'Like'}
      </span>
      <span className={`small ${liked ? 'text-red-500' : 'text-main-secondary'}`}>
        ({likes})
      </span>
    </button>
  );
}