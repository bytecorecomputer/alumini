/**
 * centres.js
 * -----------------------------------------------------------------------
 * Real live Google Sheet CSV URLs for Nariyawal and Thiriya centres.
 * -----------------------------------------------------------------------
 */

export const CENTRES = {
  nariyawal: {
    id: 'nariyawal',
    name: 'Nariyawal Centre',
    sheetCsvUrl:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vSR3LLRHq4DsbOplvZ0JPfEOXjrR-wGfOUqpSUnunRD6PGiCCAX9VVcC-80-d8GEoTqQF--fX4bDjbh/pub?gid=0&single=true&output=csv',
    firestoreCollection: 'centres/nariyawal/students',
  },
  thiriya: {
    id: 'thiriya',
    name: 'Thiriya Centre',
    sheetCsvUrl:
      'https://docs.google.com/spreadsheets/d/e/2PACX-1vRE02PgxnsZb22qYQRIqe3CQZIoCNlPmJ8975fmmrT2KIn40KPYO2PhBrEuNKgEu6ebCr-r0-yFMqzd/pub?gid=967039806&single=true&output=csv',
    firestoreCollection: 'centres/thiriya/students',
  },
};
