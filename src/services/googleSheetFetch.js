/**
 * googleSheetFetch.js
 * -----------------------------------------------------------------------
 * Google Sheet published CSV fetcher from fee-sync-kit using PapaParse.
 * -----------------------------------------------------------------------
 */

import Papa from 'papaparse';

export async function fetchSheetRows(csvUrl) {
  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(
      `Sheet fetch failed (${response.status}). Please check URL: ${csvUrl}`
    );
  }
  const csvText = await response.text();

  const parsed = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors && parsed.errors.length) {
    console.warn('CSV parse warnings:', parsed.errors);
  }

  return parsed.data;
}
