/**
 * csvToStudents.js
 * -----------------------------------------------------------------------
 * Raw Google Sheet CSV to clean student objects converter from fee-sync-kit.
 * Dynamic header detection matching columns by name.
 * -----------------------------------------------------------------------
 */

import { parseAllInstallments, parseFeeAmount } from './feeParser';

function normalizeHeader(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const KNOWN_COLUMNS = {
  registration: ['roll no', 'reg no', 'registration', 'registration no', 'sr no'],
  studentName: ['student name', 'name'],
  status: ['status'],
  course: ['course', 'trade'],
  fatherName: ['fathers name', "father's name", 'father name'],
  mobile: ['mob no', 'mobile no', 'mob', 'mobile', 'contact'],
  address: ['address', 'center'],
  admissionDate: ['admission date', 'adm date', 'date'],
  registrationFee: ['registration fee', 'regi fee', 'reg fee', 'admission fee'],
  totalFee: ['total fee', 'total fees', 'fee total', 'course fee'],
};

export function detectColumnMap(rows) {
  let headerRowIndex = -1;
  let headerCells = [];

  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const normalizedCells = rows[r].map(normalizeHeader);
    if (normalizedCells.includes('student name') || normalizedCells.includes('name')) {
      headerRowIndex = r;
      headerCells = normalizedCells;
      break;
    }
  }

  if (headerRowIndex === -1) {
    throw new Error(
      'Header row missing. Google Sheet must contain a "Student Name" column header.'
    );
  }

  const columnIndex = {};
  for (const [key, aliases] of Object.entries(KNOWN_COLUMNS)) {
    const idx = headerCells.findIndex((cell) => aliases.includes(cell));
    columnIndex[key] = idx;
  }

  // Ensure Registration column doesn't pick S.No if Roll No exists in column 1
  if (columnIndex.registration === 0 && headerCells[1] && (headerCells[1].includes('roll') || headerCells[1].includes('reg'))) {
    columnIndex.registration = 1;
  }

  const feeDateColumns = [];
  headerCells.forEach((cell, idx) => {
    // Explicitly exclude metadata columns (Admission Fee, Total Fee, etc.)
    if (idx >= 11 || (cell.includes('fee') && cell.includes('date') && !cell.includes('admission') && !cell.includes('total'))) {
      feeDateColumns.push(idx);
    }
  });

  // Fallback for fee date columns starting at index 11
  if (feeDateColumns.length === 0) {
    for (let idx = 11; idx < headerCells.length; idx++) {
      feeDateColumns.push(idx);
    }
  }

  return { headerRowIndex, columnIndex, feeDateColumns };
}

export function buildStudentsFromRows(rows, centreId) {
  const { headerRowIndex, columnIndex, feeDateColumns } = detectColumnMap(rows);
  const students = [];

  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    let regNo = (row[columnIndex.registration] || '').toString().trim();
    const name = (row[columnIndex.studentName] || '').toString().trim();

    if (!regNo && !name) continue;

    if (!regNo) {
      const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
      regNo = `REG_${cleanName || (Date.now() + r)}`;
    }

    const feeCells = feeDateColumns.map((idx) => row[idx]);
    const installments = parseAllInstallments(feeCells);
    
    // Add installmentNo index
    installments.forEach((inst, idx) => {
      inst.installmentNo = idx + 1;
    });

    const totalPaid = installments.reduce((sum, i) => sum + i.amount, 0);
    const totalFee = parseFeeAmount(row[columnIndex.totalFee]);
    const registrationFee = parseFeeAmount(row[columnIndex.registrationFee]);
    const mobileClean = (row[columnIndex.mobile] || '').toString().replace(/\D/g, '');

    // Standardized address & center
    const addressStr = (row[columnIndex.address] || '').toString().trim();
    let centerName = centreId === 'nariyawal' ? 'Nariyawal' : 'Thiriya';
    if (addressStr.toLowerCase().includes('thiriya')) centerName = 'Thiriya';
    else if (addressStr.toLowerCase().includes('nariyawal') || addressStr.toLowerCase().includes('naryawal')) centerName = 'Nariyawal';

    students.push({
      centreId,
      center: centerName,
      registration: regNo,
      regNo,
      fullName: name,
      name,
      status: (row[columnIndex.status] || '').toString().trim() || 'unpaid',
      course: (row[columnIndex.course] || '').toString().trim() || 'N/A',
      fatherName: (row[columnIndex.fatherName] || '').toString().trim(),
      mobile: mobileClean,
      address: addressStr,
      admissionDate: (row[columnIndex.admissionDate] || '').toString().trim(),
      registrationFee,
      admissionFee: registrationFee,
      totalFee,
      totalFees: totalFee,
      totalPaid,
      paidFees: totalPaid,
      balanceDue: Math.max(totalFee - totalPaid, 0),
      installments,
      hasSuspiciousDates: installments.some((i) => i.suspicious),
      lastSyncedAt: new Date().toISOString(),
      updatedAt: Date.now()
    });
  }

  return students;
}
