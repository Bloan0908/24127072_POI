"""
HuggingFace Service - Sử dụng các model HuggingFace cho:
- Translation (dịch thuật) - Chạy model local trên server
- Question Answering (tìm thông tin địa điểm)
"""

import os
from typing import Optional
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM


class HuggingFaceService:
    def __init__(self):
        """Khởi tạo HuggingFace Service"""
        self.api_token = os.getenv("HUGGINGFACE_TOKEN")
        
        # Translation pipelines sẽ được khởi tạo lazy (khi cần)
        self.translator_en_vi = None
        self.translator_vi_en = None
        
        # Các model sử dụng (nhẹ nhất cho translation)
        self.translation_model_en_vi = "Helsinki-NLP/opus-mt-en-vi"  # Dịch Anh -> Việt
        self.translation_model_vi_en = "Helsinki-NLP/opus-mt-vi-en"  # Dịch Việt -> Anh
        
    
    def _get_translator(self, source_lang: str, target_lang: str):
        """Lazy load translation pipeline"""
        try:
            if source_lang == "en" and target_lang == "vi":
                if self.translator_en_vi is None:
                    print(f"Loading translation model: {self.translation_model_en_vi}")
                    self.translator_en_vi = pipeline(
                        "translation",
                        model=self.translation_model_en_vi,
                        tokenizer=self.translation_model_en_vi,
                        token=self.api_token
                    )
                return self.translator_en_vi
            elif source_lang == "vi" and target_lang == "en":
                if self.translator_vi_en is None:
                    print(f"Loading translation model: {self.translation_model_vi_en}")
                    self.translator_vi_en = pipeline(
                        "translation",
                        model=self.translation_model_vi_en,
                        tokenizer=self.translation_model_vi_en,
                        token=self.api_token
                    )
                return self.translator_vi_en
            else:
                # Default: Anh -> Việt
                if self.translator_en_vi is None:
                    self.translator_en_vi = pipeline(
                        "translation",
                        model=self.translation_model_en_vi,
                        tokenizer=self.translation_model_en_vi,
                        token=self.api_token
                    )
                return self.translator_en_vi
        except Exception as e:
            print(f"Error loading translation model: {e}")
            raise
    
    
    async def translate(self, text: str, source_lang: str = "en", target_lang: str = "vi") -> str:
        """
        Dịch văn bản sử dụng HuggingFace Translation Model (Local Inference)
        
        Args:
            text: Văn bản cần dịch
            source_lang: Ngôn ngữ nguồn (en, vi)
            target_lang: Ngôn ngữ đích (en, vi)
            
        Returns:
            Văn bản đã dịch
        """
        try:
            print(f"Translating from {source_lang} to {target_lang}: {text}")
            
            # Lấy translator pipeline
            translator = self._get_translator(source_lang, target_lang)
            
            # Thực hiện dịch
            result = translator(text, max_length=512)
            
            print(f"Translation result: {result}")
            
            # Parse kết quả
            if isinstance(result, list) and len(result) > 0:
                translated_text = result[0].get('translation_text', '')
                if translated_text:
                    return translated_text
            
            raise Exception("Model không trả về kết quả dịch")
            
        except Exception as e:
            print(f"Translation error: {e}")
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
