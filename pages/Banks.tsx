
import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { Bank } from '../types';
import { Building2, Plus, Edit2, Trash2, Check, Search } from 'lucide-react';

const Banks: React.FC = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const loadBanks = async () => {
      const data = await db.getBanks();
      setBanks(data);
    };
    loadBanks();
  }, []);

  const handleSave = async () => {
    if (!newName.trim()) return;
    const bank: Bank = {
      id: editingId || `B-${Date.now()}`,
      name: newName,
      createdAt: new Date().toISOString()
    };
    await db.saveBank(bank);
    const data = await db.getBanks();
    setBanks(data);
    setEditingId(null);
    setIsAdding(false);
    setNewName('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this bank branch? Existing appraisals will remain.")) {
      await db.deleteBank(id);
      const data = await db.getBanks();
      setBanks(data);
    }
  };

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Partner Branches</h1>
          <p className="text-slate-500">Manage the bank branches you work with.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setNewName(''); }}
          className="flex items-center gap-2 bg-slate-900 text-white font-bold py-3 px-6 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          <Plus size={20} />
          Add Branch
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Filter branches..."
          className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all text-slate-900 placeholder-slate-400 font-medium"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isAdding && (
          <div className="bg-amber-50 border-2 border-dashed border-amber-200 p-6 rounded-3xl animate-in slide-in-from-top-4">
            <label className="text-xs font-bold text-amber-700 uppercase tracking-widest block mb-2">New Branch Name</label>
            <input
              autoFocus
              className="w-full bg-white border-slate-200 border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-amber-500 mb-4 font-semibold text-slate-900"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. AU Bank Lalgudi"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <div className="flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-amber-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-sm"
              >
                <Check size={18} />
                Save
              </button>
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-white text-slate-500 font-bold py-2.5 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {filteredBanks.map(bank => (
          <div key={bank.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:border-amber-200 transition-all group">
            {editingId === bank.id ? (
              <div className="space-y-4">
                <input
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-900"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-slate-900 text-white font-bold py-2 rounded-xl">Save</button>
                  <button onClick={() => setEditingId(null)} className="flex-1 bg-slate-100 text-slate-500 font-bold py-2 rounded-xl border border-slate-200">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-2xl text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 leading-tight">{bank.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">Est. {new Date(bank.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => { setEditingId(bank.id); setNewName(bank.name); }}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(bank.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {filteredBanks.length === 0 && !isAdding && (
        <div className="py-20 text-center space-y-5">
          <div className="inline-block p-10 bg-slate-100 rounded-full text-slate-300">
            <Building2 size={48} />
          </div>
          <p className="text-slate-500 font-medium">No branches found.</p>
        </div>
      )}
    </div>
  );
};

export default Banks;
