import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    fetch('/data/mpf_data.json')
      .then(res => res.ok ? res.json() : Promise.reject("無數據"))
      .then(json => {
        if (Array.isArray(json) && json.length > 50) { // 確保讀到大數據
          setData(json);
          setLoading(false);
        } else {
          throw new Error("數據量不足");
        }
      })
      .catch(err => {
        console.error(err);
        // 如果 GitHub Actions 仲未跑完，出句提示
        setLoading(false);
      });
  }, []);

  const providers = ["All", ...new Set(data.map(f => f.provider))];
  const categories = ["All", ...new Set(data.map(f => f.category))];

  const topMovers = useMemo(() => {
    const results = {};
    categories.filter(c => c !== "All").forEach(cat => {
      const sortedFunds = data.filter(f => f.category === cat).sort((a, b) => b.daily_chg - a.daily_chg).slice(0, 3);
      if (sortedFunds.length > 0) results[cat] = sortedFunds;
    });
    return results;
  }, [data, categories]);

  const filteredData = data.filter(f => {
    const safeName = f.name || "";
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = safeName.toLowerCase().includes(searchLower) || f.provider.toLowerCase().includes(searchLower);
    const matchProvider = selectedProvider === "All" || f.provider === selectedProvider;
    const matchCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchSearch && matchProvider && matchCategory;
  });

  const handleCompareToggle = (fund) => {
    if (compareList.find(f => f.id === fund.id)) {
      setCompareList(compareList.filter(f => f.id !== fund.id));
    } else {
      if (compareList.length >= 3) return alert('DataPro 限制：最多只能同時對比 3 隻基金。');
      setCompareList([...compareList, fund]);
    }
  };

  // 顏色輔助函數
  const colorNum = (val) => val > 0 ? "text-green-400" : val < 0 ? "text-red-400" : "text-gray-400";

  return (
    <div className="min-h-screen bg-[#001F3F] text-white font-sans selection:bg-[#D4AF37] pb-32">
      <header className="sticky top-0 z-40 bg-[#001F3F] border-b border-[#D4AF37]/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center text-[#001F3F] font-bold text-lg">MK</div>
            <h1 className="text-xl font-semibold text-[#D4AF37] tracking-wider">
              MPF Expert <span className="text-gray-400 font-light text-sm hidden sm:inline">| DataPro Terminal</span>
            </h1>
          </div>
          <div className="text-xs text-gray-400">市場總覽: <span className="text-[#D4AF37] font-bold">{data.length}</span> 隻基金</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {loading ? (
          <div className="text-center text-[#D4AF37] py-20 animate-pulse text-lg tracking-widest">載入全港 MPF 數據庫...</div>
        ) : data.length === 0 ? (
          <div className="text-center py-20 border border-[#D4AF37]/30 bg-[#00132B] rounded-xl">
            <h2 className="text-[#D4AF37] text-xl mb-4">系統正在同步海量數據 ⏳</h2>
            <p className="text-gray-400">請前往 GitHub Actions 點擊 <b>Run workflow</b> 更新數據庫，約 30 秒後重新整理此頁面。</p>
          </div>
        ) : (
          <>
            {/* 篩選區塊 */}
            <section className="bg-[#00132B] border border-[#D4AF37]/30 rounded-xl p-5 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase">關鍵字搜尋</label>
                  <input type="text" placeholder="e.g. 宏利, 北美..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase">受託人 Provider</label>
                  <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm">
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase">資產類別 Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* 超級數據表 */}
            <section>
              <h2 className="text-lg font-light text-[#D4AF37] mb-4 border-l-4 border-[#D4AF37] pl-3 uppercase">全覽表 Market Data ({filteredData.length})</h2>
              
              <div className="hidden md:block bg-[#00132B] border border-[#D4AF37]/30 rounded-xl shadow-lg overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1000px]">
                  <thead className="bg-[#D4AF37]/10 text-[#D4AF37]">
                    <tr>
                      <th className="py-4 px-4 w-12 text-center">對比</th>
                      <th className="py-4 px-4 sticky left-0 bg-[#00132B] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">基金名稱</th>
                      <th className="py-4 px-4">官方分類</th>
                      <th className="py-4 px-4 text-right">最新 NAV</th>
                      <th className="py-4 px-4 text-right">單日</th>
                      <th className="py-4 px-4 text-right">1個月</th>
                      <th className="py-4 px-4 text-right">3個月</th>
                      <th className="py-4 px-4 text-right">YTD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/10">
                    {filteredData.map(fund => (
                      <tr key={fund.id} className="hover:bg-[#D4AF37]/5 transition-colors group">
                        <td className="py-3 px-4 text-center">
                          <input type="checkbox" checked={!!compareList.find(f => f.id === fund.id)} onChange={() => handleCompareToggle(fund)} className="w-4 h-4 cursor-pointer" />
                        </td>
                        <td className="py-3 px-4 sticky left-0 bg-[#00132B] group-hover:bg-[#061e38] z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.5)]">
                          <p className="font-medium text-gray-100">{fund.name}</p>
                          <p className="text-[10px] text-[#D4AF37]/70">{fund.provider}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{fund.category}</td>
                        <td className="py-3 px-4 text-right font-bold">${fund.nav.toFixed(4)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${colorNum(fund.daily_chg)}`}>{fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%</td>
                        <td className={`py-3 px-4 text-right font-medium ${colorNum(fund['1m_chg'])}`}>{fund['1m_chg'] > 0 ? '+' : ''}{fund['1m_chg']}%</td>
                        <td className={`py-3 px-4 text-right font-medium ${colorNum(fund['3m_chg'])}`}>{fund['3m_chg'] > 0 ? '+' : ''}{fund['3m_chg']}%</td>
                        <td className={`py-3 px-4 text-right font-bold ${colorNum(fund.ytd_chg)}`}>{fund.ytd_chg > 0 ? '+' : ''}{fund.ytd_chg}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
      
      {/* 底部對比視窗 Compare Modal ... (保持不變) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#00132B] border-t-2 border-[#D4AF37] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#D4AF37] font-bold tracking-widest uppercase">對比分析 ({compareList.length}/3)</h3>
              <button onClick={() => setCompareList([])} className="text-gray-400 border border-gray-600 px-3 py-1 rounded">清空</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map(fund => (
                <div key={fund.id} className="bg-[#001F3F] border border-[#D4AF37]/30 rounded-lg p-3 relative">
                  <button onClick={() => handleCompareToggle(fund)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400">✕</button>
                  <p className="text-[10px] text-[#D4AF37] truncate pr-6">{fund.provider}</p>
                  <p className="text-sm text-white truncate pr-6">{fund.name}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>1D: <span className={colorNum(fund.daily_chg)}>{fund.daily_chg}%</span></div>
                    <div>YTD: <span className={colorNum(fund.ytd_chg)}>{fund.ytd_chg}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}