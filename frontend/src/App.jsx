import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

function App() {
  const [mpfData, setMpfData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 模擬拉取 JSON 數據
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 實戰中這裡讀取 public 目錄下的 json，或接後端 API
        const response = await fetch('/data/mpf_master_data.json');
        
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMpfData(data);
      } catch (error) {
        console.error("Failed to fetch MPF data, loading dummy data...", error);
        // 若找不到檔案，注入預設展示數據確保畫面不崩潰
        setMpfData([
          { fund_code: "MAN001", fund_name: "Manulife MPF Core - HK Equity", category: "Equity Fund - Hong Kong", nav: 15.42, "1d_change": 1.2, data_source: "Real-time" },
          { fund_code: "BOC002", fund_name: "BOC-Prudential North America", category: "Equity Fund - North America", nav: 22.00, "1d_change": 0.8, data_source: "Real-time" },
          { fund_code: "HSB003", fund_name: "HSBC ValueChoice Balanced", category: "Mixed Assets Fund", nav: 18.55, "1d_change": 0.0, data_source: "Monthly Sync" },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-[#001F3F] text-white font-sans selection:bg-[#D4AF37] selection:text-[#001F3F]">
      {/* 導航欄 Navbar */}
      <header className="sticky top-0 z-50 bg-[#001F3F]/90 backdrop-blur-md border-b border-[#D4AF37]/40 shadow-lg shadow-[#D4AF37]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* 顧問 Logo / 名稱 */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-yellow-600 flex items-center justify-center text-[#001F3F] font-bold text-xl">
              M
            </div>
            <h1 className="text-xl font-semibold tracking-wide text-[#D4AF37]">
              Michael Koo <span className="text-gray-300 font-light text-sm ml-2 hidden sm:inline-block">| MPF Expert</span>
            </h1>
          </div>
          
          {/* 搜尋框 (Desktop & Mobile 響應式) */}
          <div className="relative w-40 sm:w-64">
            <input 
              type="text" 
              placeholder="搜尋基金代碼/名稱..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#00132B] border border-[#D4AF37]/50 text-sm text-white rounded-full py-1.5 pl-4 pr-3 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>
      </header>

      {/* 主內容區 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64 text-[#D4AF37]">數據同步中...</div>
        ) : (
          <Dashboard data={mpfData} searchTerm={searchTerm} />
        )}
      </main>
    </div>
  );
}

export default App;