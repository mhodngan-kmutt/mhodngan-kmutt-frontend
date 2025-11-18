'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type ProjectActionsDropdownProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function ProjectActionsDropdown({onEdit, onDelete }: ProjectActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon" type="button" aria-label="Project Actions">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto bg-main-white border border-main-neutral" align="end">
        <DropdownMenuItem
          onSelect={onEdit}
          className="w-full cursor-pointer hover:bg-neutral-100"
        >
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={onDelete}
          className="w-full cursor-pointer text-supporting-error hover:bg-neutral-100"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
