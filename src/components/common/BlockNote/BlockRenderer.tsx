"use client";

import { type PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/style.css";

interface BlockNoteWrapperProps {
  blocks: PartialBlock[];
}

export default function BlockNoteWrapper({ blocks }: BlockNoteWrapperProps) {
  const editor = useCreateBlockNote({
    initialContent: blocks,
  });

  return (
    <BlockNoteView
      className="blocknote-readonly"
      editor={editor}
      theme="light"
      editable={false}
    />
  );
}
