import { parse } from "csv-parse/sync";

export const SHEET_ID = "1gVDZbH632Gmghea2eCXZFvAvcyJrDj7o6zjsQsRJ6a8";
export const SHEET_NAME = "Incoming_Intel";

export function parseSheetCsv(csv) {
  return parse(csv, { columns: true, skip_empty_lines: true, relax_column_count: false, bom: true, trim: false });
}

export async function readSelectedRows({ ids, fetchImpl = fetch, csvText } = {}) {
  if (!Array.isArray(ids) || !ids.length) throw new Error("ERR_NO_SELECTED_ROWS");
  let csv = csvText;
  if (csv == null) {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;
    const response = await fetchImpl(url, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error(`ERR_SHEET_READ:${response.status}`);
    csv = await response.text();
  }
  const rows = parseSheetCsv(csv);
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids.map((id) => {
    const row = byId.get(id);
    if (!row) throw new Error(`ERR_ROW_NOT_FOUND:${id}`);
    return Object.freeze({ ...row });
  });
}
