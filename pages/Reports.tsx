
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { Loan, Bank } from '../types';
import { Download, FileDown, Calendar, Table as TableIcon } from 'lucide-react';

const APPRAISAL_FEE = 350;

const Reports: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [reportType, setReportType] = useState<'daily' | 'monthly' | 'bankwise'>('bankwise');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const loadData = async () => {
      const [loansData, banksData] = await Promise.all([
        db.getLoans(),
        db.getBanks()
      ]);
      setLoans(loansData);
      setBanks(banksData);
    };
    loadData();
  }, []);

  const reportData = useMemo(() => {
    if (reportType === 'bankwise') {
      const counts = banks.map(b => {
        const bankLoans = loans.filter(l => l.bankId === b.id);
        return {
          label: b.name,
          count: bankLoans.length,
          totalAmount: bankLoans.reduce((sum, l) => sum + (l.amount || 0), 0),
          salary: bankLoans.length * APPRAISAL_FEE
        };
      }).sort((a, b) => b.count - a.count);
      return counts;
    } else if (reportType === 'monthly') {
      const currentMonthLoans = loans.filter(l => l.date.startsWith(selectedMonth));
      const days: Record<string, {count: number, amount: number, salary: number}> = {};
      currentMonthLoans.forEach(l => {
        days[l.date] = days[l.date] || { count: 0, amount: 0, salary: 0 };
        days[l.date].count += 1;
        days[l.date].amount += (l.amount || 0);
        days[l.date].salary += APPRAISAL_FEE;
      });
      return Object.entries(days).map(([date, data]) => ({
        label: date,
        ...data
      })).sort((a, b) => b.label.localeCompare(a.label));
    } else {
      const today = new Date().toISOString().split('T')[0];
      return loans.filter(l => l.date === today).map(l => ({
        label: l.id,
        count: 1,
        amount: l.amount || 0,
        salary: APPRAISAL_FEE,
        bank: l.bankName,
        customer: l.customerName
      }));
    }
  }, [loans, banks, reportType, selectedMonth]);

  const exportCSV = () => {
    const headers = ["Label", "Count", "Total Valuation", "Earnings"];
    const rows = reportData.map(d => [
      d.label, 
      (d as any).count, 
      (d as any).amount || (d as any).totalAmount, 
      (d as any).salary
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `appraisal_report_${reportType}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Business Reports</h1>
          <p className="text-slate-500">Analyze performance and financial metrics.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 font-bold py-3 px-6 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileDown size={20} />
            CSV Export
          </button>
          <button 
            onClick={exportPrint}
            className="flex items-center gap-2 bg-amber-500 text-white font-bold py-3 px-6 rounded-2xl hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
          >
            <Download size={20} />
            PDF Export
          </button>
        </div>
      </header>

      {/* Controls */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-6 print:hidden">
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setReportType('bankwise')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${reportType === 'bankwise' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Bank-wise
          </button>
          <button 
            onClick={() => setReportType('monthly')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${reportType === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setReportType('daily')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${reportType === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Daily Log
          </button>
        </div>

        {reportType === 'monthly' && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl">
            <Calendar size={18} className="text-slate-400" />
            <input 
              type="month" 
              className="bg-transparent border-none p-0 text-sm font-bold text-slate-700 focus:ring-0 outline-none cursor-pointer"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Report View */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600 border border-emerald-100">
              <TableIcon size={20} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 capitalize">{reportType} Breakdown</h2>
          </div>
          <p className="text-sm text-slate-400 font-semibold">Report Date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">{reportType === 'daily' ? 'Loan Ref' : 'Category'}</th>
                {reportType === 'daily' && <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Branch</th>}
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Appraisals</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Value</th>
                <th className="px-8 py-5 text-xs font-bold text-emerald-600 uppercase tracking-widest text-right">Salary (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {reportData.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">{row.label}</td>
                  {reportType === 'daily' && <td className="px-8 py-5 text-slate-500 font-medium">{(row as any).bank}</td>}
                  <td className="px-8 py-5 text-center font-mono font-bold text-slate-900">
                    <span className="inline-block bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{(row as any).count}</span>
                  </td>
                  <td className="px-8 py-5 text-right font-semibold text-slate-500">
                    {((row as any).totalAmount || (row as any).amount || 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-emerald-600">
                    {((row as any).salary || 0).toLocaleString()}
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={reportType === 'daily' ? 5 : 4} className="py-24 text-center text-slate-400 italic font-medium">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
            {reportData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold">
                  <td className="px-8 py-6 rounded-bl-[2rem]" colSpan={reportType === 'daily' ? 2 : 1}>Totals</td>
                  <td className="px-8 py-6 text-center text-lg">
                    {reportData.reduce((sum, r) => sum + (r as any).count, 0)}
                  </td>
                  <td className="px-8 py-6 text-right text-slate-400 font-medium">
                    {reportData.reduce((sum, r) => sum + ((r as any).totalAmount || (r as any).amount || 0), 0).toLocaleString()}
                  </td>
                  <td className="px-8 py-6 text-right rounded-br-[2rem] text-amber-400 text-xl">
                    ₹{reportData.reduce((sum, r) => sum + ((r as any).salary || 0), 0).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      
      <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 text-sm text-amber-800 font-medium shadow-sm print:hidden">
        Salary estimate calculated @ ₹{APPRAISAL_FEE} per successfully recorded loan entry.
      </div>
    </div>
  );
};

export default Reports;
