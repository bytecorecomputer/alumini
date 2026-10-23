/**
 * feeParser.js
 * -----------------------------------------------------------------------
 * Fee / Date cell parser from fee-sync-kit.
 * Parses messy "Fee / Date" cells into clean { amount, date, dateDisplay, raw, suspicious } objects.
 * -----------------------------------------------------------------------
 */

const MIN_SANE_YEAR = 2020;
const MAX_SANE_YEAR = 2030;

/**
 * Parses a single fee cell.
 */
export function parseFeeCell(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;

  const raw = String(rawValue).trim();
  if (raw === '') return null;

  // Ignore pure-text cells without any digits (e.g. "CCC", "Pass", "Free", "-")
  if (!/\d/.test(raw)) return null;

  // Core regex matching amount and date parts
  const match = raw.match(
    /([\d][\d,]*)\s*[(/.:-]*\s*([\d]{1,2})\s*[-/.]\s*([\d]{1,2})\s*[-/.]\s*([\d]{2,4})\s*\)?/
  );

  if (!match) return null;

  const amount = Number(match[1].replace(/,/g, ''));
  let [, , dayStr, monthStr, yearStr] = match;

  let day = parseInt(dayStr, 10);
  let month = parseInt(monthStr, 10);
  let year = parseInt(yearStr, 10);

  if (year < 100) year += 2000;

  // Swap day/month if month > 12 (MM-DD-YYYY format detection)
  if (month > 12 && day <= 12) {
    const tmp = day;
    day = month;
    month = tmp;
  }

  const suspicious =
    year < MIN_SANE_YEAR ||
    year > MAX_SANE_YEAR ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31;

  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = `${year}-${pad(month)}-${pad(day)}`;
  const displayDate = `${pad(day)}-${pad(month)}-${year}`;

  if (Number.isNaN(amount)) return null;

  return {
    amount,
    date: isoDate,
    dateDisplay: displayDate,
    raw,
    suspicious,
  };
}

/**
 * Parses all fee/date cells for a student row and returns chronologically sorted installments.
 */
export function parseAllInstallments(feeCells) {
  const installments = [];

  for (const cell of feeCells || []) {
    const parsed = parseFeeCell(cell);
    if (parsed) installments.push(parsed);
  }

  installments.sort((a, b) => (a.date > b.date ? 1 : -1));
  return installments;
}

/**
 * Parses Total Fee or Registration Fee amounts.
 */
export function parseFeeAmount(rawValue) {
  if (rawValue === null || rawValue === undefined) return 0;
  const raw = String(rawValue).trim();
  if (raw === '' || /free/i.test(raw)) return 0;
  const numeric = raw.replace(/[^\d.]/g, '');
  const num = Number(numeric);
  return Number.isNaN(num) ? 0 : num;
}
