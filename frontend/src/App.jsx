import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 篩選狀態 (DataPro 功能)
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // 對比引擎狀態
  const [compareList, setCompareList] = useState([]);

  useEffect(() => {
    fetch('/data/mpf_data.json')
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // 提取選項供 Filter 使用
  const providers = ["All", ...new Set(data.map(f => f.provider))];
  const categories = ["All", ...new Set(data.map(f => f.category))];

  // 龍虎榜 2.0 (按分類提取 Top 3)
  const topMovers = useMemo(() => {
    const results = {};
    categories.filter(c => c !== "All").forEach(cat => {
      results[cat] = data.filter(f => f.category === cat).sort((a, b) => b.daily_chg - a.daily_chg).slice(0, 3);
    });
    return results;
  }, [data, categories]);

  // 表格過濾邏輯
  const filteredData = data.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) || f.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvider = selectedProvider === "All" || f.provider === selectedProvider;
    const matchCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchSearch && matchProvider && matchCategory;
  });

  // 處理 Checkbox 對比勾選
  const handleCompareToggle = (fund) => {
    if (compareList.find(f => f.id === fund.id)) {
      setCompareList(compareList.filter(f => f.id !== fund.id));
    } else {
      if (compareList.length >= 3) return alert('DataPro 限制：最多只能同時對比 3 隻基金。');
      setCompareList([...compareList, fund]);
    }
  };

  return (
    <div className="min-h-screen bg-[#001F3F] text-white font-sans selection:bg-[#D4AF37] selection:text-[#001F3F] pb-32">
      
      {/* 導航欄 */}
      <header className="sticky top-0 z-40 bg-[#001F3F] border-b border-[#D4AF37]/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#D4AF37] flex items-center justify-center text-[#001F3F] font-bold text-lg">MK</div>
            <h1 className="text-xl font-semibold text-[#D4AF37] tracking-wider">
              MPF Expert <span className="text-gray-400 font-light text-sm hidden sm:inline">| Private Terminal</span>
            </h1>
          </div>
          <div className="text-xs text-gray-400 hidden md:block">總收錄基金數: <span className="text-[#D4AF37] font-bold">{data.length}</span></div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {loading ? (
          <div className="text-center text-[#D4AF37] py-20 animate-pulse text-lg tracking-widest">初始化 DataPro 終端機...</div>
        ) : (
          <>
            {/* 區塊 1：DataPro 頂部篩選菜單 */}
            <section className="bg-[#00132B] border border-[#D4AF37]/30 rounded-xl p-5 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase tracking-wider">關鍵字搜尋</label>
                  <input type="text" placeholder="輸入基金名稱..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase tracking-wider">受託人 Provider</label>
                  <select value={selectedProvider} onChange={(e) => setSelectedProvider(e.target.value)} 
                    className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm appearance-none">
                    {providers.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#D4AF37] mb-2 uppercase tracking-wider">資產類別 Category</label>
                  <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} 
                    className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded px-4 py-2 text-sm appearance-none">
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* 區塊 2：龍虎榜 2.0 (橫向滾動) */}
            <section>
              <h2 className="text-lg font-light text-[#D4AF37] mb-4 border-l-4 border-[#D4AF37] pl-3 uppercase tracking-widest">
                各分類領先榜單 (Top by Category)
              </h2>
              <div className="flex overflow-x-auto pb-4 gap-6 snap-x hide-scrollbar">
                {Object.entries(topMovers).map(([category, funds]) => (
                  <div key={category} className="min-w-[300px] md:min-w-[350px] bg-[#00132B] border border-[#D4AF37]/20 rounded-xl p-5 snap-start">
                    <h3 className="text-sm font-bold text-[#D4AF37] mb-4 pb-2 border-b border-[#D4AF37]/10">{category}</h3>
                    <div className="space-y-4">
                      {funds.map((fund, idx) => (
                        <div key={fund.id} className="flex justify-between items-center">
                          <div className="pr-4">
                            <span className="text-[#D4AF37] text-xs font-bold mr-2">#{idx + 1}</span>
                            <span className="text-sm text-gray-200">{fund.name}</span>
                          </div>
                          <span className={`text-sm font-bold ${fund.daily_chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 區塊 3：全量數據表 (Desktop 表格 / Mobile 理財黑卡) */}
            <section>
              <h2 className="text-lg font-light text-[#D4AF37] mb-4 border-l-4 border-[#D4AF37] pl-3 uppercase tracking-widest flex justify-between">
                <span>市場全覽 (Market Data)</span>
                <span className="text-sm text-gray-400">顯示 {filteredData.length} 筆</span>
              </h2>

              {/* Desktop 表格視圖 */}
              <div className="hidden md:block bg-[#00132B] border border-[#D4AF37]/30 rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#D4AF37]/10 text-[#D4AF37]">
                    <tr>
                      <th className="py-4 px-4 w-12 text-center">PK</th>
                      <th className="py-4 px-4">基金名稱</th>
                      <th className="py-4 px-4">受託人</th>
                      <th className="py-4 px-4">官方分類</th>
                      <th className="py-4 px-4 text-right">最新 NAV</th>
                      <th className="py-4 px-4 text-right">單日升跌</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/10">
                    {filteredData.map(fund => (
                      <tr key={fund.id} className="hover:bg-[#D4AF37]/5 transition-colors">
                        <td className="py-3 px-4 text-center">
                          <input type="checkbox" checked={!!compareList.find(f => f.id === fund.id)} onChange={() => handleCompareToggle(fund)} 
                            className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-100">{fund.name}</td>
                        <td className="py-3 px-4 text-gray-400">{fund.provider}</td>
                        <td className="py-3 px-4 text-[#D4AF37]/80">{fund.category}</td>
                        <td className="py-3 px-4 text-right font-bold">${fund.nav.toFixed(2)}</td>
                        <td className={`py-3 px-4 text-right font-bold ${fund.daily_chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile 理財黑卡視圖 */}
              <div className="md:hidden space-y-4">
                {filteredData.map(fund => (
                  <div key={fund.id} className="bg-gradient-to-br from-[#00132B] to-[#001F3F] border border-[#D4AF37]/30 rounded-xl p-4 shadow-lg flex gap-3">
                    <div className="pt-1">
                      <input type="checkbox" checked={!!compareList.find(f => f.id === fund.id)} onChange={() => handleCompareToggle(fund)} 
                            className="w-5 h-5 accent-[#D4AF37]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] text-[#D4AF37] mb-1">{fund.provider} • {fund.category}</p>
                      <h4 className="text-sm font-medium text-white mb-3 leading-tight">{fund.name}</h4>
                      <div className="flex justify-between items-end border-t border-[#D4AF37]/10 pt-2">
                        <span className="text-lg font-bold text-white">${fund.nav.toFixed(2)}</span>
                        <span className={`text-sm font-bold ${fund.daily_chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      {/* 區塊 4：底部對比引擎 (Compare Modal) */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-[#00132B] border-t-2 border-[#D4AF37] shadow-[0_-10px_30px_rgba(0,0,0,0.8)] z-50 p-4 transform transition-transform duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#D4AF37] font-bold tracking-widest uppercase">對比分析 ({compareList.length}/3)</h3>
              <button onClick={() => setCompareList([])} className="text-gray-400 hover:text-white text-sm border border-gray-600 px-3 py-1 rounded">清空</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map(fund => (
                <div key={fund.id} className="bg-[#001F3F] border border-[#D4AF37]/30 rounded-lg p-3 relative">
                  <button onClick={() => handleCompareToggle(fund)} className="absolute top-2 right-2 text-gray-500 hover:text-red-400">✕</button>
                  <p className="text-[10px] text-[#D4AF37] truncate pr-6">{fund.provider}</p>
                  <p className="text-sm text-white font-medium truncate pr-6">{fund.name}</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-lg font-bold">${fund.nav.toFixed(2)}</span>
                    <span className={`text-sm font-bold ${fund.daily_chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>{fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%</span>
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