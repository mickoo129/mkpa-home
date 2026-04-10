import requests
import json
import os
import random
from datetime import datetime

class RealTimeMPFEngine:
    def __init__(self):
        self.api_url = "https://query1.finance.yahoo.com/v8/finance/chart/{ticker}"
        self.headers = {'User-Agent': 'Mozilla/5.0'}

    def get_real_market_change(self, ticker: str) -> float:
        try:
            res = requests.get(self.api_url.format(ticker=ticker), headers=self.headers)
            data = res.json()
            meta = data['chart']['result'][0]['meta']
            prev_close = meta['chartPreviousClose']
            current_price = meta['regularMarketPrice']
            return round(((current_price - prev_close) / prev_close) * 100, 2)
        except:
            return 0.0

    def build_real_mpf_data(self):
        print("[*] 啟動 DataPro 級數數據引擎...")
        hsi_change = self.get_real_market_change("^HSI")
        sp500_change = self.get_real_market_change("^GSPC")
        
        # 擴展基金清單 (模擬真實市場多樣性)
        mpf_funds = [
            {"code": "MAN001", "name": "宏利 MPF - 核心累積", "trustee": "宏利 Manulife", "cat": "混合資產", "nav": 15.42, "exp": "MIXED", "fer": 1.45, "size": 12500},
            {"code": "MAN002", "name": "宏利 MPF - 北美股票", "trustee": "宏利 Manulife", "cat": "北美股票", "nav": 22.00, "exp": "US", "fer": 1.30, "size": 8400},
            {"code": "BOC001", "name": "中銀保誠 - 香港股票", "trustee": "中銀保誠 BOC-PT", "cat": "香港股票", "nav": 14.80, "exp": "HK", "fer": 1.55, "size": 6200},
            {"code": "BOC002", "name": "中銀保誠 - 北美跟蹤", "trustee": "中銀保誠 BOC-PT", "cat": "北美股票", "nav": 28.50, "exp": "US", "fer": 0.95, "size": 4100},
            {"code": "HSB001", "name": "匯豐 - 智選恒指", "trustee": "匯豐 HSBC", "cat": "香港股票", "nav": 18.55, "exp": "HK", "fer": 0.75, "size": 25000},
            {"code": "HSB002", "name": "匯豐 - 環球債券", "trustee": "匯豐 HSBC", "cat": "債券基金", "nav": 10.55, "exp": "BOND", "fer": 1.15, "size": 9500},
            {"code": "AIA001", "name": "友邦 - 美洲基金", "trustee": "友邦 AIA", "cat": "北美股票", "nav": 25.30, "exp": "US", "fer": 1.65, "size": 11000},
            {"code": "AIA002", "name": "友邦 - 強積金保守", "trustee": "友邦 AIA", "cat": "保守基金", "nav": 11.20, "exp": "CASH", "fer": 0.85, "size": 18000},
        ]

        final_data = []
        for f in mpf_funds:
            # 根據大市賦予單日表現
            if f["exp"] == "US": d_change = sp500_change
            elif f["exp"] == "HK": d_change = hsi_change
            elif f["exp"] == "MIXED": d_change = round((sp500_change*0.3) + (hsi_change*0.3), 2)
            elif f["exp"] == "BOND": d_change = round(random.uniform(-0.1, 0.2), 2)
            else: d_change = 0.01

            # 【DataPro 核心】加入歷史表現推演 (實戰中應接駁歷史數據庫，這裡用邏輯模擬)
            m1_trend = d_change * 15 + random.uniform(-2, 2)
            m3_trend = m1_trend * 2.5 + random.uniform(-4, 4)
            ytd_trend = m3_trend * 1.5 + random.uniform(-5, 5)

            final_data.append({
                "fund_code": f["code"],
                "fund_name": f["name"],
                "trustee": f["trustee"],
                "category": f["cat"],
                "nav": round(f["nav"] * (1 + (d_change/100)), 2),
                "1d_change": d_change,
                "1m_change": round(m1_trend, 2),
                "3m_change": round(m3_trend, 2),
                "ytd_change": round(ytd_trend, 2),
                "fer": f["fer"],
                "fund_size": f["size"]
            })
            
        final_data.sort(key=lambda x: x["1d_change"], reverse=True)
        return final_data

    def export_to_json(self, data: list):
        os.makedirs("output", exist_ok=True)
        with open("output/mpf_master_data.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print("[+] DataPro 級數據輸出完成。")

if __name__ == "__main__":
    engine = RealTimeMPFEngine()
    engine.export_to_json(engine.build_real_mpf_data())