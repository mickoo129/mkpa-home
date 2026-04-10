import React, { useState, useMemo } from 'react';

const Dashboard = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrustee, setSelectedTrustee] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: '1d_change', direction: 'desc' });

  // 提取唯一選項供 Filter 使用
  const trustees = ["All", ...new Set(data.map(item => item.trustee))];
  const categories = ["All", ...new Set(data.map(item => item.category))];

  // 排序與篩選邏輯 (DataPro 核心體驗)
  const processedData = useMemo(() => {
    let filtered = data.filter(fund => {
      const matchSearch = fund.fund_name?.toLowerCase().includes(searchTerm.toLowerCase()) || fund.fund_code?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTrustee = selectedTrustee === "All" || fund.trustee === selectedTrustee;
      const matchCategory = selectedCategory === "All" || fund.category === selectedCategory;
      return matchSearch && matchTrustee && matchCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [data, searchTerm, selectedTrustee, selectedCategory, sortConfig]);

  // 處理點擊表頭排序
  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return " ↕";
    return sortConfig.direction === 'asc' ? " ↑" : " ↓";
  };

  // 顏色輔助函數
  const colorText = (val) => val > 0 ? "text-green-400" : val < 0 ? "text-red-400" : "text-gray-400";

  return (
    <div className="space-y-8 bg-[#001F3F] text-white">
      
      {/* 數據篩選區 (Filter Bar) */}
      <section className="bg-[#00132B] border border-[#D4AF37]/30 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-1/3">
            <label className="block text-xs text-[#D4AF37] mb-1">搜尋名稱/代碼</label>
            <input 
              type="text" placeholder="e.g. 宏利, US..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
            />
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-xs text-[#D4AF37] mb-1">過濾受託人 (Trustee)</label>
            <select value={selectedTrustee} onChange={(e) => setSelectedTrustee(e.target.value)} className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-3 py-2">
              {trustees.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="block text-xs text-[#D4AF37] mb-1">過濾資產類別 (Category)</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-3 py-2">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* 專業數據表 (DataPro 寬表模式) */}
      <section className="bg-[#00132B] border border-[#D4AF37]/30 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="border-b-2 border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-xs uppercase tracking-wider cursor-pointer">
                <th className="py-4 px-4 sticky left-0 bg-[#00132B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]" onClick={() => requestSort('fund_name')}>基金名稱 {getSortIcon('fund_name')}</th>
                <th className="py-4 px-4" onClick={() => requestSort('category')}>資產類別 {getSortIcon('category')}</th>
                <th className="py-4 px-4 text-right" onClick={() => requestSort('nav')}>最新 NAV {getSortIcon('nav')}</th>
                <th className="py-4 px-4 text-right" onClick={() => requestSort('1d_change')}>1日 {getSortIcon('1d_change')}</th>
                <th className="py-4 px-4 text-right" onClick={() => requestSort('1m_change')}>1個月 {getSortIcon('1m_change')}</th>
                <th className="py-4 px-4 text-right" onClick={() => requestSort('3m_change')}>3個月 {getSortIcon('3m_change')}</th>
                <th className="py-4 px-4 text-right" onClick={() => requestSort('ytd_change')}>YTD {getSortIcon('ytd_change')}</th>
                <th className="py-4 px-4 text-right text-gray-400" onClick={() => requestSort('fer')}>FER(%) {getSortIcon('fer')}</th>
                <th className="py-4 px-4 text-right text-gray-400" onClick={() => requestSort('fund_size')}>規模(百萬) {getSortIcon('fund_size')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10 text-sm">
              {processedData.length > 0 ? processedData.map((fund) => (
                <tr key={fund.fund_code} className="hover:bg-[#D4AF37]/5 transition-colors group">
                  {/* Sticky 鎖定左側基金名稱，方便手機水平滑動查看數據 */}
                  <td className="py-3 px-4 sticky left-0 bg-[#00132B] group-hover:bg-[#061e38] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                    <p className="font-medium text-gray-100">{fund.fund_name}</p>
                    <p className="text-[10px] text-gray-500">{fund.trustee} | {fund.fund_code}</p>
                  </td>
                  <td className="py-3 px-4 text-gray-300">{fund.category}</td>
                  <td className="py-3 px-4 text-right font-semibold">${fund.nav?.toFixed(2)}</td>
                  <td className={`py-3 px-4 text-right font-medium ${colorText(fund['1d_change'])}`}>{fund['1d_change'] > 0 ? '+' : ''}{fund['1d_change']}%</td>
                  <td className={`py-3 px-4 text-right font-medium ${colorText(fund['1m_change'])}`}>{fund['1m_change'] > 0 ? '+' : ''}{fund['1m_change']}%</td>
                  <td className={`py-3 px-4 text-right font-medium ${colorText(fund['3m_change'])}`}>{fund['3m_change'] > 0 ? '+' : ''}{fund['3m_change']}%</td>
                  <td className={`py-3 px-4 text-right font-bold ${colorText(fund['ytd_change'])}`}>{fund['ytd_change'] > 0 ? '+' : ''}{fund['ytd_change']}%</td>
                  <td className="py-3 px-4 text-right text-gray-400">{fund.fer}%</td>
                  <td className="py-3 px-4 text-right text-gray-400">${fund.fund_size}M</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-gray-500 font-light">找不到符合條件的基金</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;