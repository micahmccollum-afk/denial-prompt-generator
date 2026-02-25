"use client";

import { useState } from "react";

interface CopyButtonProps {
  text: string;
  disabled?: boolean;
  className?: string;
}

export function CopyButton({ text, disabled = false, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text || disabled) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-storesight-ring focus:ring-offset-2 focus:ring-offset-storesight-background dark:focus:ring-offset-storesight-dark-bg disabled:cursor-not-allowed disabled:opacity-50 ${className} ${
        copied
          ? "bg-green-600 text-white"
          : "bg-storesight-primary text-white hover:bg-storesight-banner dark:bg-storesight-dark-primary dark:hover:bg-storesight-primary"
      }`}
    >
      {copied ? (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Copy to clipboard
        </>
      )}
    </button>
  );
}
