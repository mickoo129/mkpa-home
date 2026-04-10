import React, { useState } from 'react';

const Dashboard = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 輔助函數：從代碼中推斷受託人 (若後端無傳遞此欄位時的容錯機制)
  const getTrustee = (code) => {
    if (code.startsWith('MAN')) return '宏利 Manulife';
    if (code.startsWith('BOC')) return '中銀保誠 BOC-Prudential';
    if (code.startsWith('HSB')) return '匯豐 HSBC';
    if (code.startsWith('AIA')) return '友邦 AIA';
    return '其他受託人';
  };

  // 搜尋過濾
  const filteredData = data.filter(fund => 
    fund.fund_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fund.fund_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 龍虎榜：當日表現前 3 名
  const topFunds = [...data].sort((a, b) => (b['1d_change'] || 0) - (a['1d_change'] || 0)).slice(0, 3);

  return (
    <div className="space-y-12 bg-[#001F3F] min-h-screen text-white">
      
      {/* 搜尋列區塊 (私人銀行風格) */}
      <div className="relative max-w-md mx-auto md:mx-0">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-[#D4AF37]/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input 
          type="text" 
          placeholder="搜尋基金名稱或受託人..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#00132B] border-b-2 border-[#D4AF37]/50 text-white py-3 pl-12 pr-4 focus:outline-none focus:border-[#D4AF37] transition-colors placeholder-gray-400 font-light"
        />
      </div>

      {/* 區塊 1: 龍虎榜 (Top Movers) - 帶有香檳金發光效果 */}
      <section>
        <h2 className="text-xl font-light text-[#D4AF37] mb-6 flex items-center gap-2 uppercase tracking-widest border-l-4 border-[#D4AF37] pl-3">
          Top Movers 今日龍虎榜
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topFunds.map((fund, index) => (
            <div 
              key={fund.fund_code} 
              className="relative overflow-hidden rounded-lg p-6 bg-gradient-to-br from-[#00132B] to-[#001F3F] border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_25px_rgba(212,175,55,0.3)] transition-all duration-300"
            >
              <div className="absolute -top-4 -right-2 text-6xl text-[#D4AF37]/10 font-serif italic font-bold">
                {index + 1}
              </div>
              <p className="text-xs text-[#D4AF37]/80 mb-2 uppercase tracking-wider">{getTrustee(fund.fund_code)}</p>
              <h3 className="text-lg font-medium text-white leading-tight mb-6 pr-6 h-12">{fund.fund_name}</h3>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-400 font-light mb-1">最新 NAV</p>
                  <p className="text-2xl font-semibold text-[#D4AF37]">${fund.nav?.toFixed(2) || '0.00'}</p>
                </div>
                <div className={`px-4 py-1.5 rounded-sm text-sm font-medium ${fund['1d_change'] >= 0 ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {fund['1d_change'] > 0 ? '+' : ''}{fund['1d_change']}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 區塊 2: 受託人 PK 表格 (Market Data) */}
      <section>
        <h2 className="text-xl font-light text-[#D4AF37] mb-6 flex items-center gap-2 uppercase tracking-widest border-l-4 border-[#D4AF37] pl-3">
          Market Data 市場全覽
        </h2>
        
        {/* 電腦端：經典優雅表格 (大於 md 顯示) */}
        <div className="hidden md:block bg-[#00132B] border border-[#D4AF37]/30 rounded-lg shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#D4AF37]/40 bg-[#D4AF37]/5 text-[#D4AF37] text-sm uppercase tracking-wider">
                <th className="py-4 px-6 font-medium">基金名稱</th>
                <th className="py-4 px-6 font-medium">受託人</th>
                <th className="py-4 px-6 font-medium text-right">最新價格 (HKD)</th>
                <th className="py-4 px-6 font-medium text-center">數據狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {filteredData.map((fund) => (
                <tr key={fund.fund_code} className="hover:bg-[#D4AF37]/5 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-100">{fund.fund_name}</p>
                    <p className="text-xs text-gray-500">{fund.category}</p>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-300">{getTrustee(fund.fund_code)}</td>
                  <td className="py-4 px-6 text-right">
                    <p className="font-bold text-[#D4AF37]">${fund.nav?.toFixed(2)}</p>
                    <p className={`text-xs ${fund['1d_change'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {fund['1d_change'] > 0 ? '+' : ''}{fund['1d_change']}%
                    </p>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {fund.data_source === 'Real-time' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-900/40 text-yellow-300 border border-yellow-500/50 shadow-[0_0_8px_rgba(234,179,8,0.2)]">
                        ⚡ Real-time
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-900/40 text-blue-300 border border-blue-500/50">
                        📅 Monthly Sync
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 手機端：黑卡式堆疊佈局 (小於 md 顯示) */}
        <div className="md:hidden space-y-4">
          {filteredData.map((fund) => (
            <div key={fund.fund_code} className="bg-[#00132B] border border-[#D4AF37]/20 rounded-lg p-4 shadow-md relative">
              <div className="flex justify-between items-start mb-3">
                <div className="pr-2">
                  <p className="text-xs text-[#D4AF37]/80 mb-1">{getTrustee(fund.fund_code)}</p>
                  <p className="font-medium text-gray-100 text-sm leading-snug">{fund.fund_name}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-[#D4AF37]">${fund.nav?.toFixed(2)}</p>
                  <p className={`text-xs ${fund['1d_change'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {fund['1d_change'] > 0 ? '+' : ''}{fund['1d_change']}%
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-[#D4AF37]/10 pt-3 mt-1">
                <p className="text-xs text-gray-500">{fund.category}</p>
                <div>
                  {fund.data_source === 'Real-time' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-900/40 text-yellow-300 border border-yellow-500/50">
                      ⚡ Real-time
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-900/40 text-blue-300 border border-blue-500/50">
                      📅 Monthly Sync
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500 font-light border border-[#D4AF37]/20 rounded-lg bg-[#00132B]/50">
            查無相符的受託人或基金資料
          </div>
        )}
      </section>

    </div>
  );
};

export default Dashboard;