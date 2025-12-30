"""
HuggingFace Service - Sử dụng các model HuggingFace cho:
- Translation (dịch thuật)
- Question Answering (tìm thông tin địa điểm)
"""

import os
from typing import Optional
import requests


class HuggingFaceService:
    def __init__(self):
        """Khởi tạo HuggingFace Service"""
        self.api_token = os.getenv("HUGGINGFACE_TOKEN")
        # API endpoint mới từ HuggingFace (2024+)
        self.api_base = "https://api-inference.huggingface.co/models"
        
        # Các model sử dụng (miễn phí, không cần token cho inference API)
        self.translation_model = "Helsinki-NLP/opus-mt-en-vi"  # Dịch Anh -> Việt
        self.translation_model_vi_en = "Helsinki-NLP/opus-mt-vi-en"  # Dịch Việt -> Anh
        
    
    async def translate(self, text: str, source_lang: str = "en", target_lang: str = "vi") -> str:
        """
        Dịch văn bản sử dụng HuggingFace Translation Model
        
        Args:
            text: Văn bản cần dịch
            source_lang: Ngôn ngữ nguồn (en, vi)
            target_lang: Ngôn ngữ đích (en, vi)
            
        Returns:
            Văn bản đã dịch
        """
        try:
            # Chọn model phù hợp
            if source_lang == "en" and target_lang == "vi":
                model = self.translation_model
            elif source_lang == "vi" and target_lang == "en":
                model = self.translation_model_vi_en
            else:
                # Mặc định dịch sang tiếng Việt
                model = self.translation_model
            
            # Gọi HuggingFace Inference API
            url = f"{self.api_base}/{model}"
            headers = {"Content-Type": "application/json"}
            if self.api_token:
                headers["Authorization"] = f"Bearer {self.api_token}"
            
            payload = {"inputs": text}
            
            print(f"Calling HuggingFace API: {url}")
            print(f"Payload: {payload}")
            
            response = requests.post(url, headers=headers, json=payload, timeout=60)
            
            print(f"Response status: {response.status_code}")
            print(f"Response body: {response.text}")
            
            # Kiểm tra lỗi API endpoint deprecated
            if response.status_code >= 400:
                error_text = response.text
                if "no longer supported" in error_text or "router.huggingface.co" in error_text:
                    raise Exception("HuggingFace API endpoint đã thay đổi. Cần cập nhật code.")
                response.raise_for_status()
            
            result = response.json()
            
            # Parse kết quả
            if isinstance(result, list) and len(result) > 0:
                translated_text = result[0].get("translation_text", "")
                if translated_text:
                    print(f"Translation successful: {translated_text}")
                    return translated_text
            
            # Nếu không có kết quả, raise error thay vì trả về text gốc
            print(f"No translation result from API: {result}")
            raise Exception("Model không trả về kết quả dịch")
            
        except Exception as e:
            print(f"Translation error: {e}")
            # Raise error để frontend biết có lỗi
            raise Exception(f"Lỗi dịch thuật: {str(e)}")
    
    
    async def get_location_info(self, location_name: str) -> dict:
        """
        Lấy thông tin về địa điểm sử dụng Question Answering model
        (Tạm thời để placeholder - sẽ dùng Nominatim API thay thế)
        
        Args:
            location_name: Tên địa điểm
            
        Returns:
            Dict chứa thông tin địa điểm
        """
        # TODO: Implement với QA model hoặc dùng API khác
        return {
            "name": location_name,
            "description": f"Thông tin về {location_name}"
        }
