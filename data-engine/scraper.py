import json
import os
import random
from datetime import datetime

class MPFProfessionalEngine:
    def __init__(self):
        # 1. 分類映射 (Mapping Fix) - 專業分類翻譯機
        self.MASTER_MAP = {
            "股票": "股票基金",
            "中港": "股票基金",
            "大中華": "股票基金",
            "北美": "股票基金",
            "美股": "股票基金",
            "環球": "股票基金",
            "亞洲": "股票基金",
            "歐洲": "股票基金",
            "20": "混合資產基金",
            "40": "混合資產基金",
            "60": "混合資產基金",
            "80": "混合資產基金",
            "混合": "混合資產基金",
            "平衡": "混合資產基金",
            "增長": "混合資產基金",
            "保守": "保守/保證基金",
            "保證": "保守/保證基金",
            "貨幣": "保守/保證基金",
            "債券": "債券基金"
        }

    def map_category(self, raw_name: str) -> str:
        """根據 MASTER_MAP 將市場雜亂名稱統一歸類"""
        for key, standard_cat in self.MASTER_MAP.items():
            if key in raw_name:
                return standard_cat
        return "其他基金"

    def fetch_and_clean_data(self):
        print("[*] 啟動專業級 MPF 數據清洗引擎...")
        
        # 模擬從 AASTOCKS 或 MPFA 抓取到的「未清洗原始數據」
        raw_market_data = [
            {"name": "宏利MPF核心累積基金", "prov": "宏利 Manulife", "raw_cat": "混合資產", "nav": 15.42, "src": "AASTOCKS"},
            {"name": "宏利MPF北美股票基金", "prov": "宏利 Manulife", "raw_cat": "北美", "nav": 22.00, "src": "AASTOCKS"},
            {"name": "宏利MPF中華威力基金", "prov": "宏利 Manulife", "raw_cat": "大中華", "nav": 18.20, "src": "MPFA"},
            {"name": "中銀保誠平穩基金", "prov": "中銀保誠 BOC-PT", "raw_cat": "平衡", "nav": 14.80, "src": "AASTOCKS"},
            {"name": "中銀保誠北美指數追蹤", "prov": "中銀保誠 BOC-PT", "raw_cat": "美股", "nav": 28.50, "src": "AASTOCKS"},
            {"name": "匯豐智選恒指基金", "prov": "匯豐 HSBC", "raw_cat": "中港股票", "nav": 18.55, "src": "AASTOCKS"},
            {"name": "匯豐智選增長基金", "prov": "匯豐 HSBC", "raw_cat": "80%股票", "nav": 19.10, "src": "MPFA"},
            {"name": "匯豐智選保證基金", "prov": "匯豐 HSBC", "raw_cat": "保證", "nav": 12.05, "src": "MPFA"},
            {"name": "友邦強積金保守基金", "prov": "友邦 AIA", "raw_cat": "保守", "nav": 11.20, "src": "AASTOCKS"},
            {"name": "友邦綠色退休基金", "prov": "友邦 AIA", "raw_cat": "環球", "nav": 16.75, "src": "AASTOCKS"},
        ]

        cleaned_data = []
        for f in raw_market_data:
            standard_category = self.map_category(f["raw_cat"])
            
            # 根據分類賦予合理嘅單日升跌幅 (模擬真實大市表現)
            if standard_category == "股票基金":
                chg = round(random.uniform(0.5, 2.5), 2)
            elif standard_category == "混合資產基金":
                chg = round(random.uniform(0.1, 1.2), 2)
            else:
                chg = round(random.uniform(-0.05, 0.1), 2)

            # 2. 數據字段嚴格對齊
            cleaned_data.append({
                "fund_name": f["name"],
                "provider": f["prov"],
                "category": standard_category,
                "nav": f["nav"],
                "daily_chg": chg,
                "source": f["src"]
            })
            
        return cleaned_data

    def export_to_json(self, data: list):
        os.makedirs("output", exist_ok=True)
        with open("output/mpf_master_data.json", 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
        print(f"[+] 數據映射成功！共匯出 {len(data)} 隻格式化基金。")

if __name__ == "__main__":
    engine = MPFProfessionalEngine()
    engine.export_to_json(engine.fetch_and_clean_data())