/**
 * StudentFeeDashboard.jsx
 * -----------------------------------------------------------------------
 * Student Login & Fee Dashboard component from fee-sync-kit.
 * Allows students to enter Registration No + Mobile No and view their date-wise fee history.
 * -----------------------------------------------------------------------
 */

import React, { useState } from 'react';
import { loginStudent } from '../services/studentLookup';

export default function StudentFeeDashboard({ db }) {
  const [regNo, setRegNo] = useState('');
  const [mobile, setMobile] = useState('');
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await loginStudent(db, regNo.trim(), mobile.trim());
      if (!result) {
        setError('Registration number ya mobile number galat hai. Please check and try again.');
        setStudent(null);
      } else {
        setStudent(result);
      }
    } catch (err) {
      setError(err.message || 'Kuch gadbad ho gayi. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    setStudent(null);
    setRegNo('');
    setMobile('');
  }

  if (!student) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 font-inter">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2 text-center">Student Fee Login</h2>
        <p className="text-xs font-bold text-slate-400 mb-6 text-center">Apna Registration Number aur Registered Mobile Number daal kar apni fee details dekhein.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Registration Number / Roll No</label>
            <input
              type="text"
              placeholder="e.g. 2050 or 271 or 1003"
              value={regNo}
              onChange={(e) => setRegNo(e.target.value)}
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Mobile Number</label>
            <input
              type="text"
              placeholder="e.g. 8859554895"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Checking Records...' : 'View Fee Details'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-8 p-6 md:p-8 bg-white rounded-3xl shadow-xl border border-slate-100 font-inter">
      <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">{student.name || student.fullName}</h2>
          <p className="text-xs font-bold text-slate-500">
            Reg No: <span className="text-blue-600 font-black">{student.regNo || student.registration}</span> &nbsp;|&nbsp; 
            Course: <span className="text-slate-900 font-black">{student.course}</span> &nbsp;|&nbsp; 
            Center: <span className="text-emerald-600 font-black">{student.center || student.centreId}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Fee</p>
          <p className="text-xl font-black text-slate-900">₹{student.totalFee || student.totalFees}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-1">Paid Till Now</p>
          <p className="text-xl font-black text-emerald-700">₹{student.totalPaid || student.paidFees}</p>
        </div>
        <div className={`p-4 rounded-2xl border ${(student.balanceDue || 0) > 0 ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${(student.balanceDue || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Balance Due</p>
          <p className={`text-xl font-black ${(student.balanceDue || 0) > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>₹{student.balanceDue}</p>
        </div>
      </div>

      <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Payment History (Date-wise)</h3>
      {(!student.installments || student.installments.length === 0) ? (
        <p className="text-xs font-bold text-slate-400 p-4 bg-slate-50 rounded-xl text-center">Abhi tak koi payment record nahi hai.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase tracking-wider font-black border-b border-slate-100">
                <th className="p-3">#</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold">
              {student.installments.map((inst, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 text-slate-800">{inst.dateDisplay || inst.date}</td>
                  <td className="p-3 text-emerald-600 font-black text-sm">₹{inst.amount}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] uppercase font-black">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
