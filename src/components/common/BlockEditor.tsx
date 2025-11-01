'use client';

import { BlockNoteSchema, createHeadingBlockSpec, BlockNoteEditor } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { forwardRef, useImperativeHandle } from "react";

async function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);

  const ret = await fetch("https://tmpfiles.org/api/v1/upload", {
    method: "POST",
    body: body,
  });
  return (await ret.json()).data.url.replace(
    "tmpfiles.org/",
    "tmpfiles.org/dl/",
  );
}

export interface BlockEditorRef {
  editor: BlockNoteEditor;
}

const BlockEditor = forwardRef<BlockEditorRef>(function BlockEditor(props, ref) {
  if (typeof window === "undefined") return null;

  const editor = useCreateBlockNote({
    placeholders: {
      emptyDocument: "Start typing..",
      heading: "Start typing..",
    },
    schema: BlockNoteSchema.create().extend({
      blockSpecs: {
        heading: createHeadingBlockSpec({
          levels: [1, 2, 3],
        }),
      },
    }),
    tables: {
      splitCells: true,
      cellBackgroundColor: true,
      cellTextColor: true,
      headers: true,
    },
    uploadFile,
  });

  useImperativeHandle(ref, () => ({
    editor: editor,
  }));

  return (
    <div className="rounded-md border border-main-neutral p-4 bg-main-white shadow-sm">
      <BlockNoteView editor={editor} theme="light" />
    </div>
  );
});

export default BlockEditor;