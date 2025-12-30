"""
HuggingFace Service - Sử dụng các model HuggingFace cho:
- Translation (dịch thuật)
- Question Answering (tìm thông tin địa điểm)
"""

import os
from typing import Optional
from huggingface_hub import InferenceClient


class HuggingFaceService:
    def __init__(self):
        """Khởi tạo HuggingFace Service"""
        self.api_token = os.getenv("HUGGINGFACE_TOKEN")
        
        # Khởi tạo Inference Client với token
        self.client = InferenceClient(token=self.api_token)
        
        # Các model sử dụng
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
            
            print(f"Translating text with model: {model}")
            print(f"Input text: {text}")
            
            # Dùng InferenceClient để gọi model translation
            result = self.client.translation(
                text=text,
                model=model
            )
            
            print(f"Translation result: {result}")
            
            # Lấy text đã dịch
            if result and hasattr(result, 'translation_text'):
                return result.translation_text
            elif isinstance(result, dict) and 'translation_text' in result:
                return result['translation_text']
            elif isinstance(result, str):
                return result
            else:
                raise Exception(f"Unexpected result format: {result}")
            
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
