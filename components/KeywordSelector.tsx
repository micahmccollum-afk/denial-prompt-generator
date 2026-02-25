"use client";

import { useState, useMemo } from "react";
import type { DenialCategory, DenialKeyword } from "@/lib/denialPrompts";

interface KeywordSelectorProps {
  categories: DenialCategory[];
  selectedKeywordId: string | null;
  onSelect: (keyword: DenialKeyword) => void;
}

export function KeywordSelector({
  categories,
  selectedKeywordId,
  onSelect,
}: KeywordSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories
      .map((cat) => ({
        ...cat,
        keywords: cat.keywords.filter(
          (k) =>
            k.label.toLowerCase().includes(q) ||
            k.id.toLowerCase().includes(q) ||
            cat.label.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.keywords.length > 0);
  }, [categories, search]);

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-3">
      <input
        type="search"
        placeholder="Search keywords..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full shrink-0 rounded-md border border-storesight-border dark:border-storesight-dark-border bg-storesight-card dark:bg-storesight-dark-card px-3 py-2 text-sm text-storesight-text dark:text-storesight-dark-text placeholder-storesight-text-muted dark:placeholder-storesight-dark-muted focus:border-storesight-primary focus:outline-none focus:ring-1 focus:ring-storesight-primary"
      />
      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-storesight-border dark:border-storesight-dark-border bg-storesight-card dark:bg-storesight-dark-card shadow-sm">
        {filteredCategories.length === 0 ? (
          <p className="p-4 text-center text-sm text-storesight-text-muted dark:text-storesight-dark-muted">
            No keywords match your search
          </p>
        ) : (
          <ul className="divide-y divide-storesight-border dark:divide-storesight-dark-border">
            {filteredCategories.map((category) => (
              <li key={category.id}>
                <p className="bg-storesight-primary-light dark:bg-storesight-dark-border px-3 py-2 text-xs font-semibold uppercase tracking-wide text-storesight-text dark:text-storesight-dark-text">
                  {category.label}
                </p>
                <ul>
                  {category.keywords.map((keyword) => (
                    <li key={keyword.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(keyword)}
                        className={`w-full px-3 py-2 text-left text-sm transition-colors hover:bg-storesight-primary-light/60 dark:hover:bg-white/5 ${
                          selectedKeywordId === keyword.id
                            ? "bg-storesight-primary-light dark:bg-white/10 font-medium text-storesight-text dark:text-storesight-dark-text"
                            : "text-storesight-text dark:text-storesight-dark-text"
                        }`}
                      >
                        {keyword.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
