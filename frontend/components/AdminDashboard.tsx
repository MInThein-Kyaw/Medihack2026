import React, { useEffect, useMemo, useState } from 'react';
import { AdminNurseStat, AdminNurseStatsResponse, Language } from '../types';
import { getAdminNurseStats } from '../services/apiService';

interface AdminDashboardProps {
  language: Language;
}

type SortOption = 'name' | 'createdAt' | 'gap';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ language }) => {
  const [data, setData] = useState<AdminNurseStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('createdAt');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const stats = await getAdminNurseStats();
        setData(stats);
      } catch (err: any) {
        setError(err?.message || 'Failed to load admin stats');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  const nurses = data?.nurses || [];
  const sortedNurses = useMemo(() => {
    const copied = [...nurses];

    if (sortBy === 'name') {
      return copied.sort((a, b) => a.username.localeCompare(b.username));
    }

    if (sortBy === 'gap') {
      return copied.sort((a, b) => b.averageGap - a.averageGap);
    }

    return copied.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [nurses, sortBy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]"></div>
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">
          {language === 'th' ? 'กำลังโหลดข้อมูลพยาบาล...' : 'Loading nurse stats...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-red-200 bg-white">
        <p className="text-red-500 font-bold">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="glass-panel p-8 rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight mb-2">
          {language === 'th' ? 'แดชบอร์ดผู้ดูแลระบบ' : 'Admin Dashboard'}
        </h2>
        <p className="text-slate-500 text-sm font-medium tracking-wide">
          {language === 'th' ? 'ภาพรวมพยาบาลและผลการประเมินทั้งหมด' : 'Overview of all nurses and assessment performance'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard title={language === 'th' ? 'พยาบาลทั้งหมด' : 'Total Nurses'} value={data?.summary.totalNurses || 0} />
        <SummaryCard title={language === 'th' ? 'ใช้งานใน 30 วัน' : 'Active (30 days)'} value={data?.summary.activeNurses || 0} />
        <SummaryCard
          title={language === 'th' ? 'ค่าเฉลี่ยคะแนนรวม' : 'Global Avg Score'}
          value={
            nurses.length > 0
              ? (nurses.reduce((acc, nurse) => acc + (nurse.averageScore || 0), 0) / nurses.length).toFixed(2)
              : '0.00'
          }
        />
      </div>

      <div className="glass-panel rounded-[2rem] border border-slate-200 overflow-hidden bg-white shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-slate-800 font-black uppercase tracking-[0.2em] text-[11px]">
            {language === 'th' ? 'รายชื่อพยาบาลและสถิติ' : 'Nurse List & Stats'}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {language === 'th' ? 'เรียงตาม' : 'Sort by'}
            </span>
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-blue-300"
            >
              <option value="name">{language === 'th' ? 'ชื่อ (A-Z)' : 'Name (A-Z)'}</option>
              <option value="createdAt">{language === 'th' ? 'วันที่สร้างบัญชี (ล่าสุด)' : 'Created Date (Newest)'}</option>
              <option value="gap">{language === 'th' ? 'คะแนนช่องว่าง (มากไปน้อย)' : 'Gap Score (High to Low)'}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead className="bg-slate-50/50">
              <tr className="text-left text-[10px] uppercase tracking-[0.2em] text-slate-400">
                <th className="px-4 py-3">Nurse</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Sessions</th>
                <th className="px-4 py-3">Completion</th>
                <th className="px-4 py-3">Avg Score</th>
                <th className="px-4 py-3">Avg Gap</th>
                <th className="px-4 py-3">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {sortedNurses.map((nurse) => (
                <NurseRow key={nurse.id} nurse={nurse} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const SummaryCard: React.FC<{ title: string; value: number | string }> = ({ title, value }) => (
  <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{title}</p>
    <p className="text-3xl font-black text-blue-600">{value}</p>
  </div>
);

const NurseRow: React.FC<{ nurse: AdminNurseStat }> = ({ nurse }) => (
  <tr className="border-t border-slate-100 text-sm hover:bg-slate-50/50 transition-colors">
    <td className="px-4 py-3">
      <p className="font-bold text-slate-700">{nurse.username}</p>
      <p className="text-xs text-slate-400">{nurse.email || '-'}</p>
    </td>
    <td className="px-4 py-3 text-slate-500">{nurse.department || '-'}</td>
    <td className="px-4 py-3 text-slate-500">{nurse.experienceYears} yrs</td>
    <td className="px-4 py-3 text-slate-500">{nurse.totalSessions}</td>
    <td className="px-4 py-3 text-slate-500">{nurse.completionRate}%</td>
    <td className="px-4 py-3 text-slate-500">{nurse.averageScore.toFixed(2)}</td>
    <td className={`px-4 py-3 font-bold ${nurse.averageGap >= 0 ? 'text-green-600' : 'text-red-500'}`}>
      {nurse.averageGap > 0 ? '+' : ''}{nurse.averageGap.toFixed(2)}
    </td>
    <td className="px-4 py-3 text-slate-400">{nurse.lastLogin ? new Date(nurse.lastLogin).toLocaleDateString() : '-'}</td>
  </tr>
);

export default AdminDashboard;

