export interface Selection {
  readonly category: number;
  /** The selected item in every category, so each column remembers its position. */
  readonly items: readonly number[];
}

/** Item counts per category, in menu order. */
export type Counts = readonly number[];

const clamp = (value: number, count: number) =>
  Math.min(Math.max(value, 0), Math.max(count - 1, 0));

export function createSelection(counts: Counts, category: number, item: number): Selection {
  const selected = clamp(category, counts.length);
  return {
    category: selected,
    items: counts.map((count, index) => (index === selected ? clamp(item, count) : 0)),
  };
}

export function selectedItem(selection: Selection): number {
  return selection.items[selection.category] ?? 0;
}

/** Selects a category (clamped to the ends; the bar doesn't wrap). */
export function withCategory(selection: Selection, category: number, counts: Counts): Selection {
  const next = clamp(category, counts.length);
  return next === selection.category ? selection : { ...selection, category: next };
}

/** Selects an item, in the current category unless another is given. */
export function withItem(
  selection: Selection,
  item: number,
  counts: Counts,
  category = selection.category,
): Selection {
  const categoryIndex = clamp(category, counts.length);
  const next = clamp(item, counts[categoryIndex] ?? 0);
  if (categoryIndex === selection.category && next === selectedItem(selection)) return selection;
  return {
    category: categoryIndex,
    items: selection.items.map((value, index) => (index === categoryIndex ? next : value)),
  };
}
