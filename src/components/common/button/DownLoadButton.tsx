'use client';

import React from 'react';
import { Download, File } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

interface ProjectFile {
  fileId: string;
  fileUrl: string;
}

interface DownloadButtonProps {
  files: ProjectFile[];
}

// Helper to get a clean filename from a URL
const getFilenameFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url);
    const pathParts = urlObject.pathname.split('/');
    return pathParts[pathParts.length - 1] || 'download';
  } catch (e) {
    return 'download';
  }
};

const easterEggUrl = 'https://youtu.be/HtTUsOKjWyQ?si=b374x1GufP_8H3Tk&t=13';

const validateAndGetUrl = (url: string): string => {
  // Return easter egg for null, empty, or placeholder URLs
  if (!url || url.includes('[your-project-ref]')) {
    return easterEggUrl;
  }
  try {
    // This will throw an error for invalid URL formats
    new URL(url);
    // Ensure it's a web URL
    if (!url.startsWith('http')) {
        return easterEggUrl;
    }
    // If all checks pass, return the original URL
    return url;
  } catch (e) {
    // If the URL is structurally invalid, return the easter egg
    return easterEggUrl;
  }
};


export function DownloadButton({ files }: DownloadButtonProps) {
  // Don't render anything if there are no files
  if (!files || files.length === 0) {
    return null;
  }

  // Case 1: Only one file exists
  if (files.length === 1) {
    const file = files[0];
    const filename = getFilenameFromUrl(file.fileUrl);
    // Validate the URL before rendering
    const finalUrl = validateAndGetUrl(file.fileUrl);

    return (
      <a
        href={finalUrl}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary flex items-center gap-2 px-4 py-2"
      >
        <Download className='text-main-white w-5 h-5'/>
        <span className="small text-main-white">Download Project Resource</span> 
      </a>
    );
  }

  // Case 2: Multiple files exist, render a dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-primary px-4 py-2">
          <Download className='text-main-white w-5 h-5'/>
          <span className="small text-main-white">Download Project Resource</span> 
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {files.map((file) => {
          // Validate each URL in the list
          const finalUrl = validateAndGetUrl(file.fileUrl);
          return (
            <DropdownMenuItem key={file.fileId} asChild>
              <a
                href={finalUrl}
                download={getFilenameFromUrl(file.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 cursor-pointer"
              >
                <File className="w-4 h-4" />
                <span>{getFilenameFromUrl(file.fileUrl)}</span>
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}