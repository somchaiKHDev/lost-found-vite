export const LS_KEY = "lf_items_v1";
export const PIN_KEY = "lf_staff_pin_v1";
export const TAB_KEY = "lf_form_tab";
export const COLLAPSE_KEY = "lf_form_collapsed";
export const ANN_KEY = "lf_anns_v1";

export const uid = () => Math.random().toString(36).slice(2, 10);
export const todayISO = () => new Date().toISOString().slice(0, 10);

import type { Item } from "./types";
import type { Announcement } from "./types";

export const saveItems = (items: Item[]) => localStorage.setItem(LS_KEY, JSON.stringify(items));
export const loadItems = (): Item[] => {
  try { const raw = localStorage.getItem(LS_KEY); return raw ? (JSON.parse(raw) as Item[]) : []; } catch { return []; }
};

export const saveAnns = (anns: Announcement[]) => localStorage.setItem(ANN_KEY, JSON.stringify(anns));
export const loadAnns = (): Announcement[] => {
  try { const raw = localStorage.getItem(ANN_KEY); return raw ? (JSON.parse(raw) as Announcement[]) : []; } catch { return []; }
};
