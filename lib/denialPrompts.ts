import denialPromptsData from "@/data/denial-prompts.json";

export interface DenialKeyword {
  id: string;
  label: string;
  template: string;
}

export interface DenialCategory {
  id: string;
  label: string;
  keywords: DenialKeyword[];
}

export interface DenialPromptsSchema {
  categories: DenialCategory[];
}

export function getDenialPrompts(): DenialPromptsSchema {
  return denialPromptsData as DenialPromptsSchema;
}

export function getKeywordById(id: string): DenialKeyword | undefined {
  const { categories } = getDenialPrompts();
  for (const category of categories) {
    const keyword = category.keywords.find((k) => k.id === id);
    if (keyword) return keyword;
  }
  return undefined;
}
