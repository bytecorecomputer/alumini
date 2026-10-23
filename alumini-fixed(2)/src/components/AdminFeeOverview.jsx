/**
 * AdminFeeOverview.jsx
 * -----------------------------------------------------------------------
 * Admin Fee Overview component from fee-sync-kit.
 * Displays multi-centre sync button, search filter, and date-wise fee breakdown table.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { syncAllCentres } from '../services/studentLookup';

export default function AdminFeeOverview({ db }) {
  const [status, setStatus] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [filterCentre, setFilterCentre] = useState('all');
  const [search, setSearch] = useState('');

  async function handleSync() {
    setSyncing(true);
    setStatus('Starting live Google Sheet sync...');
    try {
      const results = await syncAllCentres(db, setStatus);
      const merged = Object.values(results).flatMap((r) => r.students);
      setAllStudents(merged);

      const totalWritten = Object.values(results).reduce(
        (sum, r) => sum + r.totalWritten,
        0
      );
      setStatus(`Sync complete! Processed ${totalWritten} students from Nariyawal & Thiriya sheets.`);
    } catch (err) {
      console.error(err);
      setStatus(`Sync Error: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  }

  const visibleStudents = allStudents.filter((s) => {
    const centreMatch = filterCentre === 'all' || s.centreId === filterCentre;
    const searchMatch =
      !search ||
      (s.name || s.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.regNo || s.registration || '').toLowerCase().includes(search.toLowerCase());
    return centreMatch && searchMatch;
  });

  return (
    <div className="p-4 bg-white rounded-3xl shadow-sm border border-slate-100 mb-8">
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <button
          onClick={handleSync}
          disabled={syncing}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {syncing ? 'Syncing Sheets...' : 'Sync Both Centres (Google Sheets)'}
        </button>

        <select
          value={filterCentre}
          onChange={(e) => setFilterCentre(e.target.value)}
          className="p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Centres (Nariyawal & Thiriya)</option>
          <option value="nariyawal">Nariyawal Centre</option>
          <option value="thiriya">Thiriya Centre</option>
        </select>

        <input
          type="text"
          placeholder="Search student by name or registration number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[240px] p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-xs text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {status && (
        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold mb-4 border border-blue-100">
          {status}
        </div>
      )}

      {visibleStudents.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-black border-b border-slate-100">
                <th className="p-3">Reg No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Centre</th>
                <th className="p-3">Course</th>
                <th className="p-3">Total Fee</th>
                <th className="p-3">Total Paid</th>
                <th className="p-3">Balance</th>
                <th className="p-3">Last Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleStudents.map((s, i) => {
                const lastPayment = s.installments && s.installments.length > 0 ? s.installments[s.installments.length - 1] : null;
                return (
                  <tr key={`${s.centreId}-${s.regNo}-${i}`} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-bold text-slate-900">{s.regNo || s.registration}</td>
                    <td className="p-3 font-black text-slate-800">{s.name || s.fullName}</td>
                    <td className="p-3 font-bold text-blue-600 uppercase">{s.centreId || s.center}</td>
                    <td className="p-3 font-bold text-slate-600">{s.course}</td>
                    <td className="p-3 font-bold text-slate-900">₹{s.totalFee || s.totalFees}</td>
                    <td className="p-3 font-black text-emerald-600">₹{s.totalPaid || s.paidFees}</td>
                    <td className={`p-3 font-black ${(s.balanceDue || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      ₹{s.balanceDue}
                    </td>
                    <td className="p-3 text-slate-500 font-medium">
                      {lastPayment
                        ? `₹${lastPayment.amount} (${lastPayment.dateDisplay || lastPayment.date})`
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
