import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import os
from datetime import datetime

class MPFDataIntelligence:
    def __init__(self):
        # 建立 HTTP 標頭，模擬真實瀏覽器行為，防止被阻擋
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
        }
        
        # 核心功能：【分類翻譯機】 Mapping Logic
        # 將市場非標準名稱對應至 MPFA 官方標準分類，提升專業度
        self.category_mapping = {
            "中港股票": "Equity Fund - Hong Kong",
            "港股": "Equity Fund - Hong Kong",
            "大中華股票": "Equity Fund - Greater China",
            "美股": "Equity Fund - North America",
            "北美股票": "Equity Fund - North America",
            "環球股票": "Equity Fund - Global",
            "保守基金": "Conservative Fund",
            "保證基金": "Guaranteed Fund",
            "混合資產": "Mixed Assets Fund"
        }

    def _translate_category(self, raw_category: str) -> str:
        """分類翻譯機：將抓取到的分類正規化"""
        for key, official_name in self.category_mapping.items():
            if key in raw_category:
                return official_name
        return "Other / Unclassified" # 預設分類

    def fetch_realtime_data(self) -> dict:
        """
        抓取 AASTOCKS / etnet 即時數據
        回傳格式: { "FundCode": {"nav": float, "1d_change": float} }
        """
        print("[*] 啟動即時數據引擎 (Target: AASTOCKS/etnet)...")
        realtime_data = {}
        
        try:
            # 實戰中這裡替換為實際的 AASTOCKS URL 與 Selector
            # url = "http://www.aastocks.com/tc/mpf/search.aspx"
            # response = requests.get(url, headers=self.headers)
            # soup = BeautifulSoup(response.text, 'html.parser')
            
            # 這裡使用模擬數據展示爬蟲抓取後的結構化結果
            # 假設我們抓到了兩檔有即時報價的基金，一檔沒有
            realtime_data = {
                "MAN001": {"nav": 15.42, "1d_change": 1.2, "raw_cat": "中港股票"},
                "BOC002": {"nav": 22.10, "1d_change": -0.5, "raw_cat": "美股"}
            }
            print(f"[+] 成功獲取 {len(realtime_data)} 筆即時數據。")
        except Exception as e:
            print(f"[-] 即時數據抓取失敗: {e}")
            
        return realtime_data

    def fetch_mpfa_static_data(self) -> dict:
        """
        獲取 MPFA 官方月度靜態數據作為兜底 (Fallback)
        """
        print("[*] 獲取 MPFA 靜態基準數據...")
        # 模擬從 MPFA API 或靜態文件讀取的基礎數據
        mpfa_data = {
            "MAN001": {"name": "Manulife MPF Core - HK Equity", "nav": 15.30, "raw_cat": "Equity Fund - Hong Kong"},
            "BOC002": {"name": "BOC-Prudential North America", "nav": 22.00, "raw_cat": "Equity Fund - North America"},
            "HSB003": {"name": "HSBC ValueChoice Balanced", "nav": 18.55, "raw_cat": "混合資產"}
        }
        return mpfa_data

    def merge_and_clean_data(self):
        """
        【數據整合】：執行混合動力邏輯，生成最終數據
        若有即時價 -> 標註 Real-time
        否則 -> 標註 Monthly Sync
        """
        realtime_data = self.fetch_realtime_data()
        mpfa_data = self.fetch_mpfa_static_data()
        
        final_dataset = []
        
        print("[*] 執行數據清洗與混合邏輯...")
        for fund_code, base_info in mpfa_data.items():
            fund_entry = {
                "fund_code": fund_code,
                "fund_name": base_info["name"],
                "category": self._translate_category(base_info["raw_cat"]),
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # 混合動力判斷邏輯
            if fund_code in realtime_data:
                fund_entry["nav"] = realtime_data[fund_code]["nav"]
                fund_entry["1d_change"] = realtime_data[fund_code]["1d_change"]
                fund_entry["data_source"] = "Real-time" # 高亮：來自即時爬蟲
            else:
                fund_entry["nav"] = base_info["nav"]
                fund_entry["1d_change"] = 0.0 # 靜態數據無日變化
                fund_entry["data_source"] = "Monthly Sync" # 兜底：來自 MPFA
                
            final_dataset.append(fund_entry)
            
        return final_dataset

    def export_to_json(self, data: list):
        """將清洗後的數據輸出為 JSON，供前端 React 使用"""
        output_dir = "output"
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
            
        file_path = os.path.join(output_dir, "mpf_master_data.json")
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=4)
            
        print(f"[+] 數據已成功導出至 {file_path}")

if __name__ == "__main__":
    print(f"=== MPF-Expert-Michael Data Engine ===")
    engine = MPFDataIntelligence()
    
    # 執行 ETL Pipeline
    clean_data = engine.merge_and_clean_data()
    engine.export_to_json(clean_data)
    
    print("=== 數據引擎執行完畢 ===")