import React from 'react';

const AdvisorZone = () => {
  return (
    <section className="mt-12 mb-8 bg-gradient-to-r from-[#D4AF37] to-yellow-600 rounded-xl p-1 shadow-lg">
      <div className="bg-[#001F3F] h-full w-full rounded-lg p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] bg-[#00132B] flex items-center justify-center text-3xl font-bold text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            MK
          </div>
          <div>
            <h3 className="text-2xl font-semibold text-white mb-1">Michael Koo</h3>
            <p className="text-[#D4AF37] text-sm uppercase tracking-wider mb-2">Senior Wealth & MPF Advisor</p>
            <p className="text-gray-300 text-sm">專業強積金整合 • 家族資產配置 • 退優理財規劃</p>
          </div>
        </div>
        
        <div className="w-full md:w-auto">
          <button 
            onClick={() => window.open('https://wa.me/85212345678', '_blank')}
            className="w-full md:w-auto px-8 py-3 bg-[#D4AF37] hover:bg-yellow-500 text-[#001F3F] font-bold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
            聯絡顧問預約諮詢
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdvisorZone;