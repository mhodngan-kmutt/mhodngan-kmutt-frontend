'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { deleteProject } from '@/lib/api';

type ProjectActionsDropdownProps = {
  projectId: string;
  token: string;
};

export function ProjectActionsDropdown({ projectId, token }: ProjectActionsDropdownProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project?')) {
      return;
    }
    try {
      await deleteProject(projectId, token);
      alert('Project deleted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project.');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Project Actions">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto bg-main-white border border-main-neutral" align="end">
        <DropdownMenuItem
          onSelect={() => alert('Edit functionality not implemented yet')}
          className="w-full cursor-pointer hover:bg-neutral-100"
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleDelete}
          className="w-full cursor-pointer text-supporting-error hover:bg-neutral-100"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
