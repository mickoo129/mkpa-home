import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 讀取爬蟲生成嘅 JSON
  useEffect(() => {
    fetch('/data/mpf_data.json')
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // 3. UI 組件優化：按『分類』提取 Top 3 龍虎榜
  const categorizedTopMovers = useMemo(() => {
    if (!data.length) return {};
    const categories = [...new Set(data.map(f => f.category))];
    const topMovers = {};
    
    categories.forEach(cat => {
      // 找出該分類下所有基金，按升跌幅排降序，取前 3 名
      const fundsInCat = data.filter(f => f.category === cat);
      const top3 = fundsInCat.sort((a, b) => b.daily_chg - a.daily_chg).slice(0, 3);
      if (top3.length > 0) topMovers[cat] = top3;
    });
    return topMovers;
  }, [data]);

  // 表格過濾邏輯
  const filteredData = data.filter(f => 
    f.fund_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#001F3F] text-white font-sans selection:bg-[#D4AF37] selection:text-[#001F3F]">
      
      {/* 導航欄 */}
      <header className="sticky top-0 z-50 bg-[#001F3F]/95 backdrop-blur border-b border-[#D4AF37]/40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-yellow-600 flex items-center justify-center text-[#001F3F] font-bold text-lg">M</div>
            <h1 className="text-xl font-semibold text-[#D4AF37]">Michael Koo <span className="text-gray-400 font-light text-sm hidden md:inline">| MPF Expert</span></h1>
          </div>
          <div className="w-48 md:w-64">
            <input 
              type="text" placeholder="搜尋基金或供應商..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#00132B] border border-[#D4AF37]/50 text-white rounded-full py-1.5 pl-4 pr-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-all"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {loading ? (
          <div className="text-center text-[#D4AF37] py-20 animate-pulse text-lg tracking-widest">載入專業數據庫...</div>
        ) : (
          <>
            {/* 區塊 1：分類龍虎榜 (Category Top Movers) */}
            <section>
              <h2 className="text-2xl font-light text-[#D4AF37] mb-8 border-l-4 border-[#D4AF37] pl-3 uppercase tracking-widest">
                各分類表現最強 Top 3
              </h2>
              
              <div className="space-y-10">
                {Object.entries(categorizedTopMovers).map(([category, funds]) => (
                  <div key={category} className="bg-[#00132B] border border-[#D4AF37]/20 rounded-xl p-6 shadow-[0_0_15px_rgba(212,175,55,0.05)]">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {funds.map((fund, index) => (
                        <div key={fund.fund_name} className="relative p-5 bg-gradient-to-br from-[#001F3F] to-[#00132B] border border-[#D4AF37]/40 rounded-lg hover:border-[#D4AF37] transition-colors">
                          <div className="absolute top-0 right-0 bg-[#D4AF37] text-[#001F3F] font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm">
                            #{index + 1}
                          </div>
                          <p className="text-xs text-[#D4AF37]/80 mb-1">{fund.provider}</p>
                          <h4 className="text-base font-medium text-gray-100 mb-4 pr-6 leading-snug h-10">{fund.fund_name}</h4>
                          <div className="flex justify-between items-end border-t border-[#D4AF37]/10 pt-3">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase">最新 NAV</p>
                              <p className="font-bold text-[#D4AF37]">${fund.nav.toFixed(2)}</p>
                            </div>
                            <div className={`px-2 py-1 rounded text-sm font-bold ${fund.daily_chg >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                              {fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 區塊 2：專業數據表 (Data Table) */}
            <section>
              <h2 className="text-2xl font-light text-[#D4AF37] mb-6 border-l-4 border-[#D4AF37] pl-3 uppercase tracking-widest">
                市場全覽 Market Data
              </h2>
              <div className="bg-[#00132B] border border-[#D4AF37]/30 rounded-xl overflow-x-auto shadow-lg">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b-2 border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] text-sm tracking-wider">
                      <th className="py-4 px-6 font-medium">基金全名 (Provider)</th>
                      <th className="py-4 px-6 font-medium">分類</th>
                      <th className="py-4 px-6 font-medium text-right">最新價格</th>
                      <th className="py-4 px-6 font-medium text-right">單日變動</th>
                      <th className="py-4 px-6 font-medium text-center">數據來源</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/10 text-sm">
                    {filteredData.map((fund, idx) => (
                      <tr key={idx} className="hover:bg-[#D4AF37]/5 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-100">{fund.fund_name}</p>
                          <p className="text-xs text-[#D4AF37]/70 mt-0.5">{fund.provider}</p>
                        </td>
                        <td className="py-4 px-6 text-gray-300">
                          <span className="px-2.5 py-1 rounded-full border border-gray-600 bg-gray-800/50 text-xs">
                            {fund.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-[#D4AF37]">${fund.nav.toFixed(2)}</td>
                        <td className={`py-4 px-6 text-right font-bold ${fund.daily_chg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {fund.daily_chg > 0 ? '+' : ''}{fund.daily_chg}%
                        </td>
                        <td className="py-4 px-6 text-center">
                          {fund.source === 'AASTOCKS' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-900/40 text-yellow-300 border border-yellow-500/50">⚡ AASTOCKS</span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/40 text-blue-300 border border-blue-500/50">📅 MPFA</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredData.length === 0 && (
                      <tr><td colSpan="5" className="py-10 text-center text-gray-500">查無相符資料</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}