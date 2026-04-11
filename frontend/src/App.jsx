import React, { useState, useEffect, useMemo } from 'react';

export default function App() {
  const [dataset, setDataset] = useState({ meta: { years: ['2023','2022','2021'] }, funds: [] });
  const [loading, setLoading] = useState(true);
  
  // 導航與全局狀態
  const [activeTab, setActiveTab] = useState("ranking"); // ranking, directory, calculator
  const [timeframe, setTimeframe] = useState("ytd"); // 全局時間切換器
  
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

  // 時間範圍選項
  const timeOptions = [
    { group: "短期", items: [{ k: "1d", l: "1日" }, { k: "1m", l: "1個月" }, { k: "6m", l: "6個月" }, { k: "ytd", l: "YTD" }] },
    { group: "長期", items: [{ k: "1y", l: "1年" }, { k: "3y", l: "3年" }, { k: "5y", l: "5年" }, { k: "10y", l: "10年" }] },
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

  // 計算器邏輯
  const runCalculator = () => {
    const yearsLeft = 65 - calc.age;
    const months = yearsLeft * 12;
    const monthlyCont = Math.min(calc.salary * 0.05, 1500) * 2 + Number(calc.tvc);
    const monthlyRate = calc.returnRate / 100 / 12;
    
    // 未來價值 (FV)
    let fv = calc.balance * Math.pow(1 + monthlyRate, months);
    if (monthlyRate > 0) fv += monthlyCont * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    else fv += monthlyCont * months;

    // 購買力折算與可用年數
    const realPurchasingPower = fv / Math.pow(1 + calc.inflation / 100, yearsLeft);
    const yearsToLast = realPurchasingPower > 0 ? realPurchasingPower / (calc.monthlyExpense * 12) : 0;

    return { fv, realPurchasingPower, yearsToLast };
  };
  const calcResult = runCalculator();

  const handleCompare = (f) => {
    if (compareList.find(x => x.id === f.id)) setCompareList(compareList.filter(x => x.id !== f.id));
    else if (compareList.length < 3) setCompareList([...compareList, f]);
    else alert("最多對比 3 隻基金");
  };

  const ColorNum = ({ val }) => (
    <span className={`font-semibold ${val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-slate-500'}`}>
      {val > 0 ? '+' : ''}{val}%
    </span>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans pb-32">
      {/* 頂部導航 */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1E293B] text-[#B59410] rounded flex items-center justify-center font-bold text-lg">MK</div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">
              Michael Koo <span className="text-[#B59410] font-normal text-sm ml-1 hidden sm:inline">| Professional Wealth System</span>
            </h1>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <button onClick={() => setActiveTab("ranking")} className={`${activeTab==="ranking" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"}`}>市場排行</button>
            <button onClick={() => setActiveTab("directory")} className={`${activeTab==="directory" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"}`}>全港名錄</button>
            <button onClick={() => setActiveTab("calculator")} className={`${activeTab==="calculator" ? "text-[#B59410] border-b-2 border-[#B59410]" : "text-slate-500 hover:text-[#1E293B]"}`}>退休精算機</button>
          </div>
        </div>
      </header>

      {/* 全局時間切換器 (只有排行與名錄顯示) */}
      {(activeTab === "ranking" || activeTab === "directory") && (
        <div className="max-w-7xl mx-auto px-4 pt-6">
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex flex-wrap gap-2 items-center text-sm">
            <span className="text-slate-400 font-medium px-2">分析時段:</span>
            {timeOptions.map(group => (
              <div key={group.group} className="flex bg-slate-100 rounded-md p-1 border border-slate-200">
                {group.items.map(t => (
                  <button key={t.k} onClick={() => setTimeframe(t.k)}
                    className={`px-3 py-1 rounded-sm transition-all ${timeframe === t.k ? "bg-[#1E293B] text-[#B59410] shadow-sm font-medium" : "text-slate-600 hover:bg-slate-200"}`}>
                    {t.l}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-20 text-[#B59410] font-medium tracking-widest">系統啟動中...</div>
        ) : (
          <>
            {/* Tab 1: 市場排行 */}
            {activeTab === "ranking" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-[#1E293B] px-4 py-3 text-[#B59410] font-bold tracking-widest">🏆 表現最強 Top 10</div>
                  <div className="p-4 space-y-3">
                    {sortedFunds.slice(0, 10).map((f, i) => (
                      <div key={f.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div><span className="text-slate-400 font-bold w-6 inline-block">{i+1}.</span><span className="font-medium text-slate-700">{f.name}</span> <span className="text-xs text-slate-400 ml-1">({f.category})</span></div>
                        <ColorNum val={f.returns[timeframe]} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-100 px-4 py-3 text-slate-700 font-bold tracking-widest border-b border-slate-200">⚠️ 表現最弱 Bottom 10</div>
                  <div className="p-4 space-y-3">
                    {sortedFunds.slice(-10).reverse().map((f, i) => (
                      <div key={f.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                        <div><span className="text-slate-400 font-bold w-6 inline-block">{i+1}.</span><span className="font-medium text-slate-700">{f.name}</span> <span className="text-xs text-slate-400 ml-1">({f.category})</span></div>
                        <ColorNum val={f.returns[timeframe]} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: 全港名錄 */}
            {activeTab === "directory" && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="搜尋基金..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#B59410]" />
                  <select value={selectedProvider} onChange={e=>setSelectedProvider(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#B59410]">{providers.map(p=><option key={p}>{p}</option>)}</select>
                  <select value={selectedCategory} onChange={e=>setSelectedCategory(e.target.value)} className="border border-slate-300 rounded px-3 py-2 text-sm bg-white focus:outline-none focus:border-[#B59410]">{categories.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                
                <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#1E293B] text-white">
                      <tr>
                        <th className="p-3 w-10 text-center">PK</th>
                        <th className="p-3">受託人</th>
                        <th className="p-3 font-medium">基金名稱</th>
                        <th className="p-3">資產分類</th>
                        <th className="p-3 text-right">最新 NAV</th>
                        <th className="p-3 text-right text-[#B59410]">當前時段回報</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFunds.map(f => (
                        <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 text-center"><input type="checkbox" checked={!!compareList.find(x=>x.id===f.id)} onChange={()=>handleCompare(f)} className="accent-[#B59410] w-4 h-4 cursor-pointer"/></td>
                          <td className="p-3 text-slate-500 text-xs">{f.provider}</td>
                          <td className="p-3 font-medium text-[#1E293B]">{f.name}</td>
                          <td className="p-3 text-slate-500 text-xs"><span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">{f.category}</span></td>
                          <td className="p-3 text-right font-medium">${f.nav.toFixed(4)}</td>
                          <td className="p-3 text-right bg-slate-50"><ColorNum val={f.returns[timeframe]} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 3: 退休計算器 */}
            {activeTab === "calculator" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-5">
                  <h2 className="text-lg font-bold text-[#1E293B] border-l-4 border-[#B59410] pl-2">參數輸入模型</h2>
                  <div><label className="text-xs text-slate-500">現時年齡</label><input type="number" value={calc.age} onChange={e=>setCalc({...calc, age: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500">強積金現有結餘 (HKD)</label><input type="number" value={calc.balance} onChange={e=>setCalc({...calc, balance: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500">現時月薪 (HKD)</label><input type="number" value={calc.salary} onChange={e=>setCalc({...calc, salary: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                  <div><label className="text-xs text-slate-500">每月可扣稅自願性供款 TVC (HKD)</label><input type="number" value={calc.tvc} onChange={e=>setCalc({...calc, tvc: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs text-slate-500">預期年回報 (%)</label><input type="number" value={calc.returnRate} onChange={e=>setCalc({...calc, returnRate: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                    <div><label className="text-xs text-slate-500">預期通脹率 (%)</label><input type="number" value={calc.inflation} onChange={e=>setCalc({...calc, inflation: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none"/></div>
                  </div>
                  <div className="pt-4 border-t border-slate-200"><label className="text-xs text-slate-500 font-bold text-[#1E293B]">退休後每月預期開支 (以今日物價計 HKD)</label><input type="number" value={calc.monthlyExpense} onChange={e=>setCalc({...calc, monthlyExpense: e.target.value})} className="w-full mt-1 border border-slate-300 rounded p-2 text-sm focus:border-[#B59410] focus:outline-none bg-slate-50"/></div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-[#1E293B] rounded-xl p-8 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#B59410] rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                    <h2 className="text-[#B59410] text-sm font-bold tracking-widest uppercase mb-2">65歲時累計總額 (名義價值)</h2>
                    <p className="text-5xl font-bold text-white mb-8">HK$ {(calcResult.fv/10000).toFixed(1)} <span className="text-xl font-normal text-slate-400">萬</span></p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-600">
                      <div>
                        <p className="text-slate-400 text-xs uppercase mb-1">折算實質購買力 (扣除通脹後)</p>
                        <p className="text-2xl font-bold text-white">HK$ {(calcResult.realPurchasingPower/10000).toFixed(1)} 萬</p>
                      </div>
                      <div>
                        <p className="text-[#B59410] text-xs uppercase mb-1 font-bold">預計資金可支撐年數</p>
                        <p className="text-2xl font-bold text-white">{calcResult.yearsToLast.toFixed(1)} <span className="text-sm font-normal text-slate-400">年</span></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-6 text-sm text-slate-600 leading-relaxed">
                    <p>💡 <b>專業顧問洞察：</b> 在假設年回報 {calc.returnRate}% 與通脹率 {calc.inflation}% 的情況下，您在 65 歲時的強積金結餘將達到約 <b>HK${(calcResult.fv/10000).toFixed(1)}萬</b>。但受通脹影響，其真實購買力相當於今天的 <b>HK${(calcResult.realPurchasingPower/10000).toFixed(1)}萬</b>。</p>
                    <p className="mt-2 text-[#1E293B] font-medium">若您希望維持每月 HK${calc.monthlyExpense} 的生活質素，這筆資金大約可維持 {calcResult.yearsToLast.toFixed(1)} 年。建議增加 TVC 供款或重整投資組合以拉長退休跑道。</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部 Compare Modal */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-300 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[#1E293B] font-bold tracking-widest uppercase text-sm border-l-4 border-[#B59410] pl-2">對比分析 ({compareList.length}/3)</h3>
              <button onClick={() => setCompareList([])} className="text-slate-500 hover:text-[#1E293B] text-xs border border-slate-300 px-3 py-1 rounded bg-slate-50">清空對比</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {compareList.map(f => (
                <div key={f.id} className="bg-slate-50 border border-slate-200 rounded p-3 relative shadow-sm">
                  <button onClick={() => handleCompare(f)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 font-bold">✕</button>
                  <p className="text-[10px] text-slate-500">{f.provider}</p>
                  <p className="text-sm font-bold text-[#1E293B] truncate pr-6 mb-2">{f.name}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs text-center">
                    <div className="bg-white border border-slate-200 rounded py-1"><div className="text-slate-400 text-[9px] uppercase">1個月</div><ColorNum val={f.returns['1m']} /></div>
                    <div className="bg-white border border-slate-200 rounded py-1"><div className="text-[#B59410] font-bold text-[9px] uppercase">YTD</div><ColorNum val={f.returns['ytd']} /></div>
                    <div className="bg-white border border-slate-200 rounded py-1"><div className="text-[#1E293B] font-bold text-[9px] uppercase">3年</div><ColorNum val={f.returns['3y']} /></div>
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