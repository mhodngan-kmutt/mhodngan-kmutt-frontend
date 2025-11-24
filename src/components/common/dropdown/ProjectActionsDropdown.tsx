'use client';

import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

import { MoreHorizontal } from 'lucide-react';
import { deleteProject } from '@/lib/api';

type ProjectActionsDropdownProps = {
  projectId: string;
  token: string;
};

export function ProjectActionsDropdown({ projectId, token }: ProjectActionsDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteProject(projectId, token);
      toast.success('Project deleted successfully');
      window.location.reload();
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  return (
    <div onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <MoreHorizontal className="w-6 h-6 hover:text-[var(--color-supporting-support)] transition-colors duration-200" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-auto bg-main-white border border-main-neutral"
          align="end"
        >
          <DropdownMenuItem
            onSelect={() => alert('Edit functionality not implemented yet')}
            className="w-full cursor-pointer hover:bg-neutral-100"
          >
            Edit
          </DropdownMenuItem>

          {/* Use AlertDialogTrigger inside menu */}
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpen(true);
                }}
                className="w-full cursor-pointer text-supporting-error hover:bg-neutral-100"
              >
                Delete
              </DropdownMenuItem>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-main-background">
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel className="btn-ghost-light small !hidden md:!inline-flex hover:text-supporting-error hover:!border-supporting-error transition-colors">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-main-primary hover:bg-supporting-dark-orange text-main-neutral small"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
