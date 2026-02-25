"use client";

import { useState, useEffect } from "react";
import { CopyButton } from "./CopyButton";

interface DenialReasonDisplayProps {
  text: string | null;
}

export function DenialReasonDisplay({ text }: DenialReasonDisplayProps) {
  const [editableText, setEditableText] = useState(text ?? "");

  // Reset to template when a different prompt is selected
  useEffect(() => {
    setEditableText(text ?? "");
  }, [text]);

  if (text === null) {
    return (
      <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center rounded-lg border border-storesight-border dark:border-storesight-dark-border bg-storesight-primary-light/30 dark:bg-storesight-dark-card p-6 text-center text-storesight-text-muted dark:text-storesight-dark-muted">
        Select a denial prompt or keyword to see the denial reason
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="max-h-[320px] min-h-[200px] overflow-y-auto rounded-lg border border-storesight-border dark:border-storesight-dark-border bg-storesight-card dark:bg-storesight-dark-card p-4 shadow-sm">
        <textarea
          value={editableText}
          onChange={(e) => setEditableText(e.target.value)}
          placeholder="Edit the text before copying—changes are not saved."
          className="min-h-[180px] w-full resize-y border-0 bg-transparent p-0 text-storesight-text caret-storesight-primary outline-none placeholder:text-storesight-text-muted dark:text-storesight-dark-text dark:placeholder:text-storesight-dark-muted"
          rows={8}
        />
      </div>
      <p className="text-xs text-storesight-text-muted dark:text-storesight-dark-muted">
        You can edit the text above for this copy only. Changes are not saved to the template.
      </p>
      <CopyButton text={editableText} />
    </div>
  );
}
