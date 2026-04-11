import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [dataset, setDataset] = useState({ meta: { years: ['2023','2022','2021'] }, funds: [] });
  const [loading, setLoading] = useState(true);
  
  // 導航與全局狀態
  const [activeTab, setActiveTab] = useState("ranking"); // ranking, directory, calculator
  const [timeframe, setTimeframe] = useState("ytd"); // 全局時間 (預設 YTD)
  
  // 篩選與對比
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [compareList, setCompareList] = useState([]);

  // 計算器狀態
  const [calc, setCalc] = useState({ age: 35, balance: 200000, salary: 30000, tvc: 0, returnRate: 5.0, inflation: 2.0, monthlyExpense: 15000 });

  useEffect(() => {
    fetch('/data/mpf_data.json')
      .then(res => res.json())
      .then(json => {
        if (json.funds) setDataset(json);
        setLoading(false);
      })
      .catch(err => { console.error("數據讀取錯誤", err); setLoading(false); });
  }, []);

  const { funds, meta } = dataset;
  const providers = ["All", ...new Set(funds.map(f => f.provider))];
  const categories = ["All", ...new Set(funds.map(f => f.category))];

  // 全局時間選項
  const timeOptions = [
    { group: "短期走勢", items: [{ k: "1d", l: "1日" }, { k: "1m", l: "1個月" }, { k: "6m", l: "6個月" }, { k: "ytd", l: "YTD" }] },
    { group: "中長期回報", items: [{ k: "1y", l: "1年" }, { k: "3y", l: "3年" }, { k: "5y", l: "5年" }, { k: "10y", l: "10年" }] },
    { group: "歷史年份", items: meta.years.map(y => ({ k: y, l: `${y}年` })) }
  ];

  // 排序與篩選邏輯
  const sortedFunds = useMemo(() => {
    return [...funds].sort((a, b) => (b.returns[timeframe] || 0) - (a.returns[timeframe] || 0));
  }, [funds, timeframe]);

  const filteredFunds = sortedFunds.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchProvider = selectedProvider === "All" || f.provider === selectedProvider;
    const matchCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchSearch && matchProvider && matchCategory;
  });

  // 計算器核心演算法
  const runCalculator = () => {
    const yearsLeft = 65 - calc.age;
    const months = yearsLeft * 12;
    // 每月供款 = (人工 5% max 1500) * 2 (勞資) + TVC
    const monthlyCont = Math.min(calc.salary * 0.05, 1500) * 2 + Number(calc.tvc);
    const monthlyRate = calc.returnRate / 100 / 12;
    
    // FV (Future Value) 計算
    let fv = calc.balance * Math.pow(1 + monthlyRate, months);
    if (monthlyRate > 0) fv += monthlyCont * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    else fv += monthlyCont * months;

    // 折算實質購買力
    const realPurchasingPower = fv / Math.pow(1 + calc.inflation / 100, yearsLeft);
    // 資金可用年數
    const yearsToLast = realPurchasingPower > 0 ? realPurchasingPower / (calc.monthlyExpense * 12) : 0;

    return { fv, realPurchasingPower, yearsToLast };
  };
  const calcResult = runCalculator();

  const handleCompare = (f) => {
    if (compareList.find(x => x.id === f.id)) setCompareList(compareList.filter(x => x.id !== f.id));
    else if (compareList.length < 3) setCompareList([...compareList, f]);
    else alert("提示：為保證顯示效果，最多只能同時對比 3 隻基金。");
  };

  const ColorNum = ({ val }) => (
    <span className={`font-semibold ${val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-slate-500'}`}>
      {val > 0 ? '+' : ''}{val}%
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans pb-32">
      {/* 頂部導航欄 (海軍藍 + 香檳金) */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E293B] text-[#B59410] rounded flex items-center justify-center font-bold text-lg">MK</div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">
              Michael Koo <span className="text-[#B59410] font-normal text-sm ml-1 hidden sm:inline">| Wealth Management</span>
            </h1>
          </div>
          <div className="flex gap-4 sm:gap-8 text-sm font-medium">
            <button onClick={() => setActiveTab("ranking")} className={`${activeTab==="ranking" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"} pb-1`}>市場排行</button>
            <button onClick={() => setActiveTab("directory")} className={`${activeTab==="directory" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"} pb-1`}>全港名錄</button>
            <button onClick={() => setActiveTab("calculator")} className={`${activeTab==="calculator" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"} pb-1`}>退休精算</button>
          </div>
        </div>
      </header>

      {/* 全局時間切換器 (只有排行與名錄需要) */}
      {(activeTab === "ranking" || activeTab === "directory") && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-4 items-center text-sm">
            <span className="text-[#1E293B] font-bold border-l-4 border-[#B59410] pl-2 uppercase">分析時段</span>
            {timeOptions.map(group => (
              <div key={group.group} className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
                {group.items.map(t => (
                  <button key={t.k} onClick={() => setTimeframe(t.k)}
                    className={`px-3 py-1.5 rounded transition-all ${timeframe === t.k ? "bg-[#1E293B] text-[#B59410] shadow font-bold" : "text-slate-600 hover:bg-slate-200"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-[#B59410] font-bold tracking-widest text-lg animate-pulse">系統數據同步中...</div>
        ) : (
          <>
            {/* Tab 1: 市場排行 */}
            {activeTab === "ranking" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top 10 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-[#1E293B] px-6 py-4 text-[#B59410] font-bold tracking-widest flex justify-between">
                    <span>🏆 表現最強 (Top 10)</span>
                    <span>{timeOptions.flatMap(g=>g.items).find(i=>i.k===timeframe)?.l}</span>
                  </div>
                  <div className="p-2">
                    {sortedFunds.slice(0, 10).map((f, i) => (
                      <div key={f.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <div className="truncate pr-4">
                          <span className="text-slate-400 font-bold w-6 inline-block">{i+1}.</span>
                          <span className="font-bold text-[#1E293B]">{f.name}</span> 
                          <span className="text-xs text-slate-500 ml-2 hidden sm:inline-block bg-slate-100 px-2 py-0.5 rounded">{f.category}</span>
                        </div>
                        <ColorNum val={f.returns[timeframe]} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Bottom 10 */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-6 py-4 text-slate-600 font-bold tracking-widest flex justify-between border-b border-slate-200">
                    <span>⚠️ 表現最弱 (Bottom 10)</span>
                    <span>{timeOptions.flatMap(g=>g.items).find(i=>i.k===timeframe)?.l}</span>
                  </div>
                  <div className="p-2">
                    {sortedFunds.slice(-10).reverse().map((f, i) => (
                      <div key={f.id} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0">
                        <div className="truncate pr-4">
                          <span className="text-slate-400 font-bold w-6 inline-block">{i+1}.</span>
                          <span className="font-bold text-slate-600">{f.name}</span> 
                          <span className="text-xs text-slate-400 ml-2 hidden sm:inline-block bg-slate-100 px-2 py-0.5 rounded">{f.category}</span>
                        </div>
                        <ColorNum val={f.returns[timeframe]} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 全港名錄 */}
            {activeTab === "directory" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="搜尋基金名稱..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410]" />
                  <select value={selectedProvider} onChange={e=>setSelectedProvider(e.target.value)} className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#B59410]">{providers.map(p=><option key={p}>{p}</option>)}</select>
                  <select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} className="w-full border border-slate-300 rounded-md px-4 py-2.5 text-sm bg-white focus:outline-none focus:border-[#B59410]">{categories.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#1E293B] text-white">
                      <tr>
                        <th className="p-4 w-12 text-center">對比</th>
                        <th className="p-4">受託人</th>
                        <th className="p-4 font-bold">基金名稱</th>
                        <th className="p-4">資產分類</th>
                        <th className="p-4 text-right">最新 NAV</th>
                        <th className="p-4 text-right text-[#B59410] font-bold">
                          {timeOptions.flatMap(g=>g.items).find(i=>i.k===timeframe)?.l} 回報
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFunds.map(f => (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-center">
                            <input type="checkbox" checked={!!compareList.find(x=>x.id===f.id)} onChange={()=>handleCompare(f)} className="accent-[#B59410] w-4 h-4 cursor-pointer"/>
                          </td>
                          <td className="p-4 text-slate-500 text-xs">{f.provider}</td>
                          <td className="p-4 font-bold text-[#1E293B]">{f.name}</td>
                          <td className="p-4 text-slate-500 text-xs"><span className="bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{f.category}</span></td>
                          <td className="p-4 text-right font-medium">${f.nav.toFixed(4)}</td>
                          <td className="p-4 text-right text-base bg-slate-50"><ColorNum val={f.returns[timeframe]} /></td>
                        </tr>
                      ))}
                      {filteredFunds.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">找不到符合條件的基金</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: 退休計算器 */}
            {activeTab === "calculator" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 參數輸入區 */}
                <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
                  <h2 className="text-lg font-bold text-[#1E293B] border-l-4 border-[#B59410] pl-3 mb-6">退休參數模型</h2>
                  <div><label className="text-xs text-slate-500 font-bold">現時年齡</label><input type="number" value={calc.age} onChange={e=>setCalc({...calc, age: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500 font-bold">MPF 現有結餘 (HKD)</label><input type="number" value={calc.balance} onChange={e=>setCalc({...calc, balance: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500 font-bold">現時月薪 (HKD)</label><input type="number" value={calc.salary} onChange={e=>setCalc({...calc, salary: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500 font-bold">每月 TVC 供款 (HKD)</label><input type="number" value={calc.tvc} onChange={e=>setCalc({...calc, tvc: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500 font-bold">預期年回報 (%)</label><input type="number" value={calc.returnRate} onChange={e=>setCalc({...calc, returnRate: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                    <div><label className="text-xs text-slate-500 font-bold">預期通脹率 (%)</label><input type="number" value={calc.inflation} onChange={e=>setCalc({...calc, inflation: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none"/></div>
                  </div>
                  <div className="pt-5 border-t border-slate-200">
                    <label className="text-xs text-[#1E293B] font-bold">退休後每月預期開支 (以今日物價計 HKD)</label>
                    <input type="number" value={calc.monthlyExpense} onChange={e=>setCalc({...calc, monthlyExpense: e.target.value})} className="w-full mt-1.5 border border-slate-300 rounded p-2.5 text-sm focus:border-[#B59410] focus:ring-1 focus:ring-[#B59410] focus:outline-none bg-slate-50"/>
                  </div>
                </div>

                {/* 結果展示區 */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#B59410] rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <h2 className="text-[#B59410] text-sm font-bold tracking-widest uppercase mb-2">65歲時 MPF 總額 (名義價值)</h2>
                    <p className="text-5xl md:text-6xl font-bold text-white mb-10">HK$ {(calcResult.fv/10000).toFixed(1)} <span className="text-xl font-normal text-slate-400">萬</span></p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 border-t border-slate-600">
                      <div>
                        <p className="text-slate-400 text-xs uppercase mb-2 font-bold">折算實質購買力 (扣除通脹後)</p>
                        <p className="text-2xl md:text-3xl font-bold text-white">HK$ {(calcResult.realPurchasingPower/10000).toFixed(1)} <span className="text-sm font-normal text-slate-400">萬</span></p>
                      </div>
                      <div>
                        <p className="text-[#B59410] text-xs uppercase mb-2 font-bold flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#B59410] animate-pulse"></span>
                          預計資金可支撐年數
                        </p>
                        <p className="text-2xl md:text-3xl font-bold text-white">{calcResult.yearsToLast.toFixed(1)} <span className="text-sm font-normal text-slate-400">年</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-[#B59410]/30 shadow-sm rounded-xl p-6 text-sm text-slate-600 leading-relaxed border-l-4 border-l-[#B59410]">
                    <p>💡 <b className="text-[#1E293B]">顧問洞察：</b> 在假設年回報 <b>{calc.returnRate}%</b> 與通脹率 <b>{calc.inflation}%</b> 的情況下，您在 65 歲時的強積金結餘將達到 <b>HK${(calcResult.fv/10000).toFixed(1)}萬</b>。受通脹影響，其真實購買力相當於今天的 <b>HK${(calcResult.realPurchasingPower/10000).toFixed(1)}萬</b>。</p>
                    <p className="mt-2">若希望維持每月 HK${calc.monthlyExpense} 的生活質素，這筆資金大約可維持 <b className="text-[#1E293B]">{calcResult.yearsToLast.toFixed(1)} 年</b>。建議透過 <b>TVC (可扣稅自願性供款)</b> 或重整高增長投資組合，以拉長您的退休跑道。</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部 Compare Modal */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-300 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] z-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#1E293B] font-bold tracking-widest uppercase text-sm border-l-4 border-[#B59410] pl-2">對比分析 ({compareList.length}/3)</h3>
              <button onClick={() => setCompareList([])} className="text-slate-500 hover:text-white hover:bg-slate-800 text-xs border border-slate-300 px-4 py-1.5 rounded transition-colors">清空對比</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map(f => (
                <div key={f.id} className="bg-slate-50 border border-slate-200 rounded-lg p-4 relative shadow-sm hover:shadow transition-shadow">
                  <button onClick={() => handleCompare(f)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold p-1">✕</button>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{f.provider}</p>
                  <p className="text-sm font-bold text-[#1E293B] truncate pr-6 mb-3">{f.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-white border border-slate-200 rounded p-1.5"><div className="text-slate-400 text-[10px] uppercase mb-1">1個月</div><ColorNum val={f.returns['1m']} /></div>
                    <div className="bg-white border border-[#B59410]/40 rounded p-1.5 shadow-sm"><div className="text-[#B59410] font-bold text-[10px] uppercase mb-1">YTD</div><ColorNum val={f.returns['ytd']} /></div>
                    <div className="bg-white border border-slate-200 rounded p-1.5"><div className="text-slate-400 text-[10px] uppercase mb-1">3年</div><ColorNum val={f.returns['3y']} /></div>
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