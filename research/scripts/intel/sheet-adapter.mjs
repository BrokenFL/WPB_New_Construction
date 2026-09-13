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
  // Record positions are 1-based and include the header record, matching the
  // intake snapshot manifest convention. Positions come from parsed records,
  // not raw newlines, so quoted multiline fields cannot shift the numbering.
  const positionsById = new Map();
  rows.forEach((row, index) => {
    const list = positionsById.get(row.id);
    if (list) list.push(index + 2);
    else positionsById.set(row.id, [index + 2]);
  });
  // Repeated CLI selections of the same unique ID are processed once.
  const uniqueIds = [...new Set(ids)];
  // Validate the entire selected batch before returning any rows so a mixed
  // valid/ambiguous request can never partially process.
  const ambiguous = uniqueIds.filter((id) => (positionsById.get(id) || []).length > 1);
  if (ambiguous.length) {
    const detail = ambiguous.map((id) => `${id} at records ${positionsById.get(id).join(",")}`).join("; ");
    throw new Error(`ERR_AMBIGUOUS_INTEL_ID:${detail}`);
  }
  return uniqueIds.map((id) => {
    const positions = positionsById.get(id) || [];
    if (!positions.length) throw new Error(`ERR_ROW_NOT_FOUND:${id}`);
    return Object.freeze({ ...rows[positions[0] - 2] });
  });
}
