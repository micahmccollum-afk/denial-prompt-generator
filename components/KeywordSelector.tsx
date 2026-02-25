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
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setExpandedCategoryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  // When searching, show all matching categories expanded so results are visible
  const effectiveExpandedIds = search.trim()
    ? new Set(filteredCategories.map((c) => c.id))
    : expandedCategoryIds;

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-3">
      <input
        type="search"
        placeholder="Search keywords..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full shrink-0 rounded-lg border border-storesight-border dark:border-storesight-dark-border bg-storesight-card dark:bg-storesight-dark-card px-4 py-2.5 text-sm text-storesight-text dark:text-storesight-dark-text placeholder-storesight-text-muted dark:placeholder-storesight-dark-muted transition-all focus:border-storesight-primary focus:outline-none focus:ring-2 focus:ring-storesight-primary/30 dark:focus:ring-storesight-dark-primary/40"
      />
      <div className="glass-card min-h-0 flex-1 overflow-y-auto rounded-xl shadow-lg dark:shadow-storesight-dark-border/20">
        {filteredCategories.length === 0 ? (
          <p className="p-4 text-center text-sm text-storesight-text-muted dark:text-storesight-dark-muted">
            No keywords match your search
          </p>
        ) : (
          <ul className="divide-y divide-storesight-border dark:divide-storesight-dark-border">
            {filteredCategories.map((category) => {
              const isExpanded = effectiveExpandedIds.has(category.id);
              return (
              <li key={category.id}>
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex w-full items-center justify-between border-b border-storesight-border/50 dark:border-storesight-dark-border/50 bg-storesight-primary-light/50 dark:bg-storesight-dark-border/30 px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-storesight-text dark:text-storesight-dark-text hover:bg-storesight-primary-light/70 dark:hover:bg-storesight-dark-border/50 transition-colors"
                >
                  {category.label}
                  <svg
                    className={`h-4 w-4 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isExpanded && (
                <ul>
                  {category.keywords.map((keyword) => (
                    <li key={keyword.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(keyword)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-all hover:bg-storesight-primary-light/60 dark:hover:bg-white/5 ${
                          selectedKeywordId === keyword.id
                            ? "border-l-2 border-storesight-primary dark:border-storesight-tech-accent bg-storesight-primary-light/80 dark:bg-white/10 font-medium text-storesight-text dark:text-storesight-dark-text glow-border"
                            : "border-l-2 border-transparent text-storesight-text dark:text-storesight-dark-text"
                        }`}
                      >
                        {keyword.label}
                      </button>
                    </li>
                  ))}
                </ul>
                )}
              </li>
            );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
