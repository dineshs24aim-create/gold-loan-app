
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Loan, Bank } from '../types';
import { Plus, Search, Trash2, Edit3, X, Save } from 'lucide-react';

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [bankFilter, setBankFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Form States
  const [formData, setFormData] = useState<Partial<Loan>>({
    bankId: '',
    date: new Date().toISOString().split('T')[0],
    amount: null,
    customerName: '',
    notes: ''
  });

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const [loansData, banksData] = await Promise.all([
      db.getLoans(),
      db.getBanks()
    ]);
    setLoans(loansData);
    setBanks(banksData);
  };

  const handleOpenModal = (loan: Loan | null = null) => {
    if (loan) {
      setEditingLoan(loan);
      setFormData(loan);
    } else {
      setEditingLoan(null);
      setFormData({
        bankId: banks[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        amount: null,
        customerName: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankId || !formData.date) return;

    const loan: Loan = {
      id: editingLoan ? editingLoan.id : `L-${Date.now()}`,
      bankId: formData.bankId!,
      date: formData.date!,
      amount: formData.amount || null,
      customerName: formData.customerName || null,
      notes: formData.notes || null,
      createdAt: editingLoan ? editingLoan.createdAt : new Date().toISOString()
    };

    await db.saveLoan(loan);
    setIsModalOpen(false);
    await refreshData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this appraisal?")) {
      await db.deleteLoan(id);
      await refreshData();
    }
  };

  const filteredLoans = loans.filter(l => {
    const matchesSearch = l.id.toLowerCase().includes(search.toLowerCase()) || 
                          l.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchesBank = !bankFilter || l.bankId === bankFilter;
    const matchesDate = !dateFilter || l.date === dateFilter;
    return matchesSearch && matchesBank && matchesDate;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Loan Appraisals</h1>
          <p className="text-slate-500">Maintain records of your appraisal activity.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus size={20} />
          New Appraisal
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID or customer..."
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all text-slate-900 placeholder-slate-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 font-medium"
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
          >
            <option value="">All Branches</option>
            {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <input
            type="date"
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 font-medium cursor-pointer"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {(bankFilter || dateFilter || search) && (
            <button 
              onClick={() => {setBankFilter(''); setDateFilter(''); setSearch('');}}
              className="text-amber-600 hover:text-amber-700 font-semibold px-3 py-2 rounded-xl"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Branch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Valuation</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-600 font-medium">{l.id}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                      {l.bankName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{new Date(l.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">{l.customerName || '-'}</td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-slate-900">
                    {l.amount ? `₹${l.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-1">
                      <button 
                        onClick={() => handleOpenModal(l)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(l.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    No appraisals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">{editingLoan ? 'Edit Entry' : 'New Appraisal'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bank Branch</label>
                  <select
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-medium"
                    value={formData.bankId}
                    onChange={(e) => setFormData({...formData, bankId: e.target.value})}
                  >
                    <option value="" disabled>Select branch</option>
                    {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-medium"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Customer Name</label>
                <input
                  type="text"
                  placeholder="Full name"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-medium placeholder:text-slate-400"
                  value={formData.customerName || ''}
                  onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loan Valuation (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all text-slate-900 font-bold"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || null})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Technical Notes</label>
                <textarea
                  rows={3}
                  placeholder="Purity check, weight details, etc."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none text-slate-900 font-medium"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 px-6 bg-amber-500 text-white rounded-2xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingLoan ? 'Update' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
