
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../db';
import { Loan, Bank } from '../types';
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles,
  IndianRupee
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { getAppraisalInsights } from '../geminiService';

const APPRAISAL_FEE = 300;

const Dashboard: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [insight, setInsight] = useState<string>('Analyzing your recent appraisal data...');
  const [isLoadingInsight, setIsLoadingInsight] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [l, b] = await Promise.all([
        db.getLoans(),
        db.getBanks()
      ]);
      setLoans(l);
      setBanks(b);

      const loadInsight = async () => {
        setIsLoadingInsight(true);
        const text = await getAppraisalInsights(l, b);
        setInsight(text || "Keep up the consistent work.");
        setIsLoadingInsight(false);
      };

      if (l.length > 0) loadInsight();
      else {
        setInsight("Add your first loan entry to see personalized professional insights.");
        setIsLoadingInsight(false);
      }
    };

    loadData();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = now.toISOString().slice(0, 7);

    const todayLoans = loans.filter(l => l.date === todayStr);
    const monthLoans = loans.filter(l => l.date.startsWith(monthStr));

    const bankMap = new Map<string, number>();
    banks.forEach(b => bankMap.set(b.id, 0));
    loans.forEach(l => {
      const count = bankMap.get(l.bankId) || 0;
      bankMap.set(l.bankId, count + 1);
    });

    const bankWise = Array.from(bankMap.entries()).map(([id, count]) => ({
      bankName: banks.find(b => b.id === id)?.name || 'Unknown',
      count
    })).sort((a, b) => b.count - a.count);

    return {
      todayCount: todayLoans.length,
      todayEarnings: todayLoans.length * APPRAISAL_FEE,
      monthCount: monthLoans.length,
      monthEarnings: monthLoans.length * APPRAISAL_FEE,
      overallCount: loans.length,
      overallEarnings: loans.length * APPRAISAL_FEE,
      bankWise
    };
  }, [loans, banks]);

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6366F1'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Real-time statistics of your appraisal operations.</p>
        </div>
      </header>

      {/* AI Insight Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-amber-100 flex items-start gap-4">
        <div className="bg-amber-100 p-3 rounded-2xl flex-shrink-0">
          <Sparkles className="text-amber-600" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Appraiser Intelligence</h3>
          <p className={`text-slate-600 mt-1 text-sm leading-relaxed ${isLoadingInsight ? 'animate-pulse' : ''}`}>
            {insight}
          </p>
        </div>
      </div>

      {/* Top Cards - Loan Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Today's Appraisals" 
          value={stats.todayCount} 
          icon={CheckCircle2} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="This Month" 
          value={stats.monthCount} 
          icon={Calendar} 
          color="bg-amber-500" 
        />
        <StatCard 
          label="Total Overall" 
          value={stats.overallCount} 
          icon={Briefcase} 
          color="bg-blue-600" 
        />
        <StatCard 
          label="Active Banks" 
          value={banks.length} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
        />
      </div>

      {/* Salary/Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Today's Salary</p>
            <h2 className="text-3xl font-bold text-slate-900">₹{stats.todayEarnings.toLocaleString()}</h2>
            <p className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-tight">Rate: ₹300 / loan</p>
          </div>
          <IndianRupee className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-500 font-medium text-sm mb-1 uppercase tracking-wider">Month's Salary</p>
            <h2 className="text-3xl font-bold text-slate-900">₹{stats.monthEarnings.toLocaleString()}</h2>
            <p className="text-xs text-slate-400 mt-3 font-semibold uppercase tracking-tight">Based on {stats.monthCount} appraisals</p>
          </div>
          <IndianRupee className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-50 opacity-10 group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-lg shadow-slate-900/10 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-slate-400 font-medium text-sm mb-1 uppercase tracking-wider">Overall Earnings</p>
            <h2 className="text-3xl font-bold">₹{stats.overallEarnings.toLocaleString()}</h2>
            <p className="text-xs text-slate-500 mt-3 font-semibold uppercase tracking-tight">Total track record</p>
          </div>
          <IndianRupee className="absolute -bottom-4 -right-4 w-24 h-24 text-slate-800 opacity-20 group-hover:scale-110 transition-transform duration-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Charts */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Appraisals per Bank</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.bankWise}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="bankName" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={40}>
                  {stats.bankWise.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bank Breakdown List */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Salary Breakdown</h2>
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
            {stats.bankWise.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-amber-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: COLORS[idx % COLORS.length]}}></div>
                  <span className="font-semibold text-slate-700">{item.bankName}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-bold text-slate-900">₹{(item.count * APPRAISAL_FEE).toLocaleString()}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{item.count} Loans</span>
                </div>
              </div>
            ))}
            {stats.bankWise.length === 0 && (
              <p className="text-center text-slate-400 py-10 font-medium italic">No data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, value: number, icon: any, color: string }> = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
    <div className={`${color} p-4 rounded-2xl shadow-lg shadow-current/10`}>
      <Icon className="text-white" size={24} />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
    </div>
  </div>
);

export default Dashboard;
