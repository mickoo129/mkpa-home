import React, { useState } from 'react';

const CompareEngine = ({ data }) => {
  const [fund1, setFund1] = useState('');
  const [fund2, setFund2] = useState('');

  const selectedFund1 = data.find(f => f.fund_code === fund1);
  const selectedFund2 = data.find(f => f.fund_code === fund2);

  return (
    <section className="mt-12 bg-[#00132B] border border-[#D4AF37]/30 rounded-xl p-6 shadow-lg">
      <h2 className="text-xl font-light text-[#D4AF37] mb-6 flex items-center gap-2 uppercase tracking-widest border-l-4 border-[#D4AF37] pl-3">
        VS 對比引擎 Compare
      </h2>
      
      {/* 選擇器 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs text-gray-400 mb-2">選擇基金 A</label>
          <select 
            className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded p-3 focus:outline-none focus:border-[#D4AF37]"
            value={fund1} onChange={(e) => setFund1(e.target.value)}
          >
            <option value="">-- 請選擇基金 --</option>
            {data.map(f => <option key={`A-${f.fund_code}`} value={f.fund_code}>{f.fund_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-2">選擇基金 B</label>
          <select 
            className="w-full bg-[#001F3F] border border-[#D4AF37]/50 text-white rounded p-3 focus:outline-none focus:border-[#D4AF37]"
            value={fund2} onChange={(e) => setFund2(e.target.value)}
          >
            <option value="">-- 請選擇基金 --</option>
            {data.map(f => <option key={`B-${f.fund_code}`} value={f.fund_code}>{f.fund_name}</option>)}
          </select>
        </div>
      </div>

      {/* PK 面板 */}
      {selectedFund1 && selectedFund2 && (
        <div className="grid grid-cols-3 text-center border-t border-[#D4AF37]/20 pt-6">
          <div className="space-y-4">
            <p className="text-[#D4AF37] font-semibold h-12">{selectedFund1.fund_name}</p>
            <p className="text-2xl font-bold text-white">${selectedFund1.nav?.toFixed(2)}</p>
            <p className={`font-medium ${selectedFund1['1d_change'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>{selectedFund1['1d_change']}%</p>
            <p className="text-sm text-gray-400">{selectedFund1.category}</p>
          </div>
          
          <div className="space-y-4 border-l border-r border-[#D4AF37]/10 flex flex-col justify-center items-center">
             <span className="text-gray-500 text-sm">基金名稱</span>
             <span className="text-gray-500 text-sm">最新 NAV</span>
             <span className="text-gray-500 text-sm">單日升跌</span>
             <span className="text-gray-500 text-sm">資產類別</span>
             <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mt-2">
               <span className="text-[#D4AF37] font-bold italic">VS</span>
             </div>
          </div>

          <div className="space-y-4">
            <p className="text-[#D4AF37] font-semibold h-12">{selectedFund2.fund_name}</p>
            <p className="text-2xl font-bold text-white">${selectedFund2.nav?.toFixed(2)}</p>
            <p className={`font-medium ${selectedFund2['1d_change'] >= 0 ? 'text-green-400' : 'text-red-400'}`}>{selectedFund2['1d_change']}%</p>
            <p className="text-sm text-gray-400">{selectedFund2.category}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default CompareEngine;