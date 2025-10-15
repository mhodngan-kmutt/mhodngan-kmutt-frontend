'use client';

import { Button } from '@/components/ui/button';
import { CircleUser } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DropdownProfile() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="btn-icon">
          <CircleUser className="w-5 h-5" />
          <span className="small ml-1">Mooham</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-auto bg-white border-1 border-neutral-200 " align="end">
        <DropdownMenuSeparator />
        {/* My Project */}
        <DropdownMenuItem asChild>
          <a href="en/project" className="w-full cursor-pointer hover:bg-neutral-200">
            My Project
          </a>
        </DropdownMenuItem>

        {/* Sign out */}
        <DropdownMenuItem asChild>
          <a href="en/signout" className="w-full cursor-pointer hover:bg-neutral-200">
            Sign out
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
