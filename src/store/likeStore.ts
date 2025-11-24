// src/lib/likeStore.ts
import { create } from 'zustand';

interface LikeStatus {
  likes: number;
  liked: boolean;
}

interface LikeStore {
  likes: Record<string, LikeStatus>; // projectId -> LikeStatus
  updateLike: (projectId: string, newLikes: number, newLiked: boolean) => void;
}

export const likeStore = create<LikeStore>((set) => ({
  likes: {},
  updateLike: (projectId, newLikes, newLiked) =>
    set((state) => ({
      likes: {
        ...state.likes,
        [projectId]: { likes: newLikes, liked: newLiked },
      },
    })),
}));
