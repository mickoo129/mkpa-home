import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import CompareEngine from './components/CompareEngine'; // 新增
import AdvisorZone from './components/AdvisorZone';     // 新增

function App() {
  const [mpfData, setMpfData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 去抓取 GitHub Actions 每晚更新嘅 mpf_data.json
        const response = await fetch('/data/mpf_data.json');
        if (!response.ok) throw new Error("無數據");
        const data = await response.json();
        setMpfData(data);
      } catch (error) {
        console.error("無法讀取數據，使用備用展示資料", error);
        // 如果無檔案，塞幾筆展示數據防崩潰
        setMpfData([
          { fund_code: "MAN001", fund_name: "宏利 MPF - 核心累積", category: "混合資產", nav: 15.42, "1d_change": 1.2, data_source: "Real-time" },
          { fund_code: "BOC002", fund_name: "中銀保誠 - 北美股票", category: "北美股票", nav: 22.00, "1d_change": 0.8, data_source: "Real-time" },
          { fund_code: "HSB003", fund_name: "匯豐 - 智選平衡", category: "混合資產", nav: 18.55, "1d_change": -0.5, data_source: "Monthly Sync" },
          { fund_code: "AIA004", fund_name: "友邦 - 亞洲股票", category: "亞洲股票", nav: 12.30, "1d_change": 1.5, data_source: "Real-time" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#001F3F] text-white font-sans selection:bg-[#D4AF37] selection:text-[#001F3F]">
      {/* Navbar 同之前一樣... */}
      <header className="sticky top-0 z-50 bg-[#001F3F]/90 backdrop-blur-md border-b border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-yellow-600 flex items-center justify-center text-[#001F3F] font-bold text-xl mr-3">M</div>
          <h1 className="text-xl font-semibold tracking-wide text-[#D4AF37]">
            Michael Koo <span className="text-gray-300 font-light text-sm ml-2 hidden sm:inline-block">| MPF Expert</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-[#D4AF37] animate-pulse">數據引擎啟動中...</div>
        ) : (
          <>
            {/* 核心數據表 & 龍虎榜 */}
            <Dashboard data={mpfData} />
            
            {/* 新增的對比引擎 */}
            <CompareEngine data={mpfData} />
            
            {/* 新增的顧問專區 */}
            <AdvisorZone />
          </>
        )}
      </main>
    </div>
  );
}

export default App;