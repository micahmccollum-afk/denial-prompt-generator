"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { DenialPromptsSchema, DenialCategory, DenialKeyword } from "@/lib/denialPrompts";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminPage() {
  const [data, setData] = useState<DenialPromptsSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const [editingKeyword, setEditingKeyword] = useState<{
    categoryId: string;
    keyword: DenialKeyword;
  } | null>(null);
  const [addingCategory, setAddingCategory] = useState(false);
  const [addingKeyword, setAddingKeyword] = useState<string | null>(null);
  const [newCategoryLabel, setNewCategoryLabel] = useState("");
  const [newKeywordLabel, setNewKeywordLabel] = useState("");
  const [newKeywordTemplate, setNewKeywordTemplate] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editTemplate, setEditTemplate] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryLabel, setEditCategoryLabel] = useState("");

  const fetchPrompts = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/denial-prompts");
      if (!res.ok) throw new Error("Failed to load prompts");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const savePrompts = async (updated: DenialPromptsSchema) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/denial-prompts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((json as { error?: string }).error ?? "Failed to save");
      setData(updated);
      setEditingKeyword(null);
      setEditingCategoryId(null);
      setAddingCategory(false);
      setAddingKeyword(null);
      setNewCategoryLabel("");
      setNewKeywordLabel("");
      setNewKeywordTemplate("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    if (!data || !newCategoryLabel.trim()) return;
    const id = slugify(newCategoryLabel.trim());
    if (data.categories.some((c) => c.id === id)) {
      setError("Category with this name already exists");
      return;
    }
    const updated: DenialPromptsSchema = {
      categories: [
        ...data.categories,
        { id, label: newCategoryLabel.trim(), keywords: [] },
      ],
    };
    savePrompts(updated);
  };

  const handleAddKeyword = (categoryId: string) => {
    if (!data || !newKeywordLabel.trim() || !newKeywordTemplate.trim()) return;
    const cat = data.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const id = slugify(newKeywordLabel.trim());
    if (cat.keywords.some((k) => k.id === id)) {
      setError("Keyword with this label already exists in this category");
      return;
    }
    const updated: DenialPromptsSchema = {
      categories: data.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              keywords: [
                ...c.keywords,
                {
                  id,
                  label: newKeywordLabel.trim(),
                  template: newKeywordTemplate.trim(),
                },
              ],
            }
          : c
      ),
    };
    savePrompts(updated);
  };

  const handleUpdateKeyword = (categoryId: string, keywordId: string) => {
    if (!data || !editLabel.trim() || !editTemplate.trim()) return;
    const updated: DenialPromptsSchema = {
      categories: data.categories.map((c) =>
        c.id === categoryId
          ? {
              ...c,
              keywords: c.keywords.map((k) =>
                k.id === keywordId
                  ? {
                      ...k,
                      label: editLabel.trim(),
                      template: editTemplate.trim(),
                    }
                  : k
              ),
            }
          : c
      ),
    };
    savePrompts(updated);
  };

  const handleDeleteKeyword = (categoryId: string, keywordId: string) => {
    if (!data) return;
    const updated: DenialPromptsSchema = {
      categories: data.categories.map((c) =>
        c.id === categoryId
          ? { ...c, keywords: c.keywords.filter((k) => k.id !== keywordId) }
          : c
      ),
    };
    savePrompts(updated);
  };

  const handleUpdateCategory = (categoryId: string) => {
    if (!data || !editCategoryLabel.trim()) return;
    const updated: DenialPromptsSchema = {
      categories: data.categories.map((c) =>
        c.id === categoryId ? { ...c, label: editCategoryLabel.trim() } : c
      ),
    };
    savePrompts(updated);
  };

  const startEditCategory = (category: DenialCategory) => {
    setEditingCategoryId(category.id);
    setEditCategoryLabel(category.label);
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!data) return;
    const updated: DenialPromptsSchema = {
      categories: data.categories.filter((c) => c.id !== categoryId),
    };
    savePrompts(updated);
  };

  const startEditKeyword = (categoryId: string, keyword: DenialKeyword) => {
    setEditingKeyword({ categoryId, keyword });
    setEditLabel(keyword.label);
    setEditTemplate(keyword.template);
  };

  if (loading) {
    return (
      <div className="tech-grid flex min-h-screen items-center justify-center bg-storesight-background dark:bg-storesight-dark-bg">
        <p className="text-storesight-text dark:text-storesight-dark-text">
          Loading…
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="tech-grid flex min-h-screen flex-col items-center justify-center gap-4 bg-storesight-background dark:bg-storesight-dark-bg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchPrompts}
          className="rounded-md bg-storesight-primary px-4 py-2 text-white hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col tech-grid">
      <header className="shrink-0 bg-gradient-to-r from-storesight-banner via-purple-700 to-indigo-900 px-6 py-5 text-white shadow-xl">
        <div className="mx-auto flex max-w-[1800px] flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="flex items-center gap-4">
              <Image
                src="/logo-storesight-white.svg"
                alt="Storesight"
                width={120}
                height={27}
                className="h-7 w-auto drop-shadow-sm"
              />
              <div className="h-6 w-px bg-white/40" aria-hidden />
            </Link>
            <div>
              <h1 className="text-xl font-semibold tracking-tight drop-shadow-sm">
                Admin – Macros Database
              </h1>
              <p className="mt-0.5 text-sm text-white/90">
                Add and edit denial prompts sent to crowd users.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded-lg border border-white/40 bg-white/5 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-all hover:bg-white/15 hover:border-white/60"
            >
              ← Back to Generator
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1800px] flex-1 p-6 md:p-8">
        {error && data && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400">
            {error}
          </div>
        )}

        {saving && (
          <div className="fixed bottom-6 right-6 rounded-lg bg-storesight-banner px-4 py-2 text-sm text-white shadow-lg">
            Saving…
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-storesight-text dark:text-storesight-dark-text">
            Categories & Keywords
          </h2>
          {!addingCategory ? (
            <button
              onClick={() => setAddingCategory(true)}
              className="rounded-md bg-storesight-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              + Add Category
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newCategoryLabel}
                onChange={(e) => setNewCategoryLabel(e.target.value)}
                placeholder="Category name"
                className="rounded border border-storesight-border bg-white px-3 py-2 text-storesight-text dark:border-storesight-dark-border dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                autoFocus
              />
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryLabel.trim()}
                className="rounded-md bg-storesight-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setAddingCategory(false);
                  setNewCategoryLabel("");
                  setError(null);
                }}
                className="rounded-md border border-storesight-border px-4 py-2 text-sm dark:border-storesight-dark-border"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-3 w-full">
          {data?.categories.map((category) => (
            <div
              key={category.id}
              className="overflow-hidden rounded-lg border border-storesight-border bg-storesight-card dark:border-storesight-dark-border dark:bg-storesight-dark-card"
            >
              <div className="flex w-full items-center justify-between gap-3 px-4 py-3">
                {editingCategoryId === category.id ? (
                  <div className="flex flex-1 items-center gap-2">
                    <input
                      type="text"
                      value={editCategoryLabel}
                      onChange={(e) => setEditCategoryLabel(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdateCategory(category.id);
                        if (e.key === "Escape") setEditingCategoryId(null);
                      }}
                      className="flex-1 rounded border border-storesight-primary bg-white px-3 py-1.5 text-storesight-text dark:border-storesight-dark-primary dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                      autoFocus
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdateCategory(category.id);
                      }}
                      disabled={!editCategoryLabel.trim()}
                      className="rounded px-3 py-1.5 text-sm font-medium text-white bg-storesight-primary hover:opacity-90 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryId(null);
                        setEditCategoryLabel("");
                      }}
                      className="rounded px-3 py-1.5 text-sm border border-storesight-border dark:border-storesight-dark-border"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setExpandedCategoryId(
                        expandedCategoryId === category.id ? null : category.id
                      )
                    }
                    className="flex flex-1 items-center justify-between text-left hover:bg-storesight-primary-light/30 dark:hover:bg-white/5 rounded"
                  >
                    <span className="font-medium text-storesight-text dark:text-storesight-dark-text">
                      {category.label}
                    </span>
                    <span className="text-sm text-storesight-text-muted dark:text-storesight-dark-muted">
                      {category.keywords.length} keyword
                      {category.keywords.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                )}
                {editingCategoryId !== category.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditCategory(category);
                    }}
                    className="shrink-0 rounded px-2 py-1 text-sm text-storesight-primary hover:bg-storesight-primary-light dark:text-storesight-dark-primary dark:hover:bg-storesight-primary/20"
                  >
                    Edit
                  </button>
                )}
              </div>

              {expandedCategoryId === category.id && (
                <div className="border-t border-storesight-border px-4 py-4 dark:border-storesight-dark-border">
                  {addingKeyword === category.id ? (
                    <div className="mb-4 rounded-lg border border-dashed border-storesight-border p-4 dark:border-storesight-dark-border">
                      <h4 className="mb-2 text-sm font-medium text-storesight-text dark:text-storesight-dark-text">
                        New keyword
                      </h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={newKeywordLabel}
                          onChange={(e) => setNewKeywordLabel(e.target.value)}
                          placeholder="Label (e.g. Blurry Photos)"
                          className="w-full rounded border border-storesight-border bg-white px-3 py-2 text-storesight-text dark:border-storesight-dark-border dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                        />
                        <textarea
                          value={newKeywordTemplate}
                          onChange={(e) => setNewKeywordTemplate(e.target.value)}
                          placeholder="Full denial message template…"
                          rows={4}
                          className="w-full rounded border border-storesight-border bg-white px-3 py-2 text-storesight-text dark:border-storesight-dark-border dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddKeyword(category.id)}
                            disabled={
                              !newKeywordLabel.trim() || !newKeywordTemplate.trim()
                            }
                            className="rounded-md bg-storesight-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddingKeyword(null);
                              setNewKeywordLabel("");
                              setNewKeywordTemplate("");
                            }}
                            className="rounded-md border border-storesight-border px-4 py-2 text-sm dark:border-storesight-dark-border"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingKeyword(category.id)}
                      className="mb-4 rounded-md border border-dashed border-storesight-border px-4 py-2 text-sm text-storesight-text-muted hover:border-storesight-primary hover:text-storesight-primary dark:border-storesight-dark-border dark:text-storesight-dark-muted dark:hover:border-storesight-primary dark:hover:text-storesight-primary"
                    >
                      + Add keyword to {category.label}
                    </button>
                  )}

                  <ul className="space-y-2">
                    {category.keywords.map((keyword) => (
                      <li
                        key={keyword.id}
                        className="flex items-start justify-between gap-4 rounded-lg bg-storesight-background p-3 dark:bg-storesight-dark-bg"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-storesight-text dark:text-storesight-dark-text">
                            {keyword.label}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-storesight-text-muted dark:text-storesight-dark-muted">
                            {keyword.template}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <button
                            onClick={() => startEditKeyword(category.id, keyword)}
                            className="rounded px-3 py-1.5 text-sm text-storesight-primary hover:bg-storesight-primary-light dark:text-storesight-dark-primary dark:hover:bg-storesight-primary/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteKeyword(category.id, keyword.id)
                            }
                            className="rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {category.keywords.length === 0 && addingKeyword !== category.id && (
                    <p className="py-2 text-sm text-storesight-text-muted dark:text-storesight-dark-muted">
                      No keywords yet. Add one above.
                    </p>
                  )}

                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="mt-4 text-sm text-red-600 hover:underline dark:text-red-400"
                  >
                    Delete category
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>

      {editingKeyword && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setEditingKeyword(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-storesight-border bg-white p-6 shadow-xl dark:border-storesight-dark-border dark:bg-storesight-dark-card"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-storesight-text dark:text-storesight-dark-text">
              Edit keyword: {editingKeyword.keyword.label}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-storesight-text dark:text-storesight-dark-text">
                  Label
                </label>
                <input
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  className="w-full rounded border border-storesight-border bg-white px-3 py-2 text-storesight-text dark:border-storesight-dark-border dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-storesight-text dark:text-storesight-dark-text">
                  Template (denial message)
                </label>
                <textarea
                  value={editTemplate}
                  onChange={(e) => setEditTemplate(e.target.value)}
                  rows={8}
                  className="w-full rounded border border-storesight-border bg-white px-3 py-2 text-storesight-text dark:border-storesight-dark-border dark:bg-storesight-dark-card dark:text-storesight-dark-text"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setEditingKeyword(null)}
                  className="rounded-md border border-storesight-border px-4 py-2 text-sm dark:border-storesight-dark-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleUpdateKeyword(
                      editingKeyword.categoryId,
                      editingKeyword.keyword.id
                    )
                  }
                  disabled={!editLabel.trim() || !editTemplate.trim()}
                  className="rounded-md bg-storesight-primary px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
