"""
Backend API cho ứng dụng Khám Phá Địa Điểm Việt Nam
Sử dụng FastAPI để cung cấp các endpoint cho frontend
Tích hợp Gemini AI và HuggingFace models
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import uvicorn

# Import các service
from services.location_service import LocationService
from services.huggingface_service import HuggingFaceService

# Load biến môi trường từ file .env
load_dotenv()

# Khởi tạo FastAPI app
app = FastAPI(
    title="Vietnam Discovery API",
    description="Backend API cho ứng dụng khám phá địa điểm Việt Nam (HuggingFace + OpenStreetMap)",
    version="2.0.0"
)

# Cấu hình CORS - cho phép frontend gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong production nên chỉ định cụ thể domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Khởi tạo các service
location_service = LocationService()
huggingface_service = HuggingFaceService()


# ==================== MODELS (Request/Response) ====================

class LocationRequest(BaseModel):
    """Request để tìm tọa độ của một địa điểm"""
    location_name: str

class CoordinatesResponse(BaseModel):
    """Response trả về tọa độ"""
    lat: float
    lng: float

class POIRequest(BaseModel):
    """Request để lấy điểm ưa thích xung quanh tọa độ"""
    lat: float
    lng: float

class WeatherRequest(BaseModel):
    """Request để lấy thời tiết tại tọa độ"""
    lat: float
    lng: float

class WeatherInfo(BaseModel):
    """Thông tin thời tiết"""
    temperature: int
    description: str
    icon: str

class PointOfInterest(BaseModel):
    """Điểm ưa thích (POI)"""
    name: str
    description: str
    coordinates: CoordinatesResponse
    weather: WeatherInfo | None = None

class TranslationRequest(BaseModel):
    """Request để dịch văn bản"""
    text: str
    source_lang: str = "en"
    target_lang: str = "vi"


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    """
    Endpoint gốc - kiểm tra API hoạt động
    """
    return {
        "message": "Vietnam Discovery API đang hoạt động! 🇻🇳",
        "version": "2.0.0",
        "tech_stack": "HuggingFace + OpenStreetMap + Open-Meteo",
        "endpoints": {
            "coordinates": "/api/coordinates",
            "pois": "/api/pois",
            "weather": "/api/weather",
            "translate": "/api/translate"
        }
    }


@app.post("/api/coordinates", response_model=CoordinatesResponse)
async def get_coordinates(request: LocationRequest):
    """
    Lấy tọa độ (lat, lng) của một địa điểm tại Việt Nam
    Sử dụng Nominatim (OpenStreetMap) Geocoding
    
    Args:
        request: LocationRequest với tên địa điểm
        
    Returns:
        CoordinatesResponse với lat và lng
        
    Raises:
        HTTPException: Nếu không tìm thấy tọa độ
    """
    try:
        coords = await location_service.get_coordinates(request.location_name)
        if not coords:
            raise HTTPException(
                status_code=404, 
                detail=f"Không tìm thấy tọa độ cho '{request.location_name}'"
            )
        return coords
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/pois", response_model=list[PointOfInterest])
async def get_points_of_interest(request: POIRequest):
    """
    Lấy 5 điểm ưa thích (POI) xung quanh một tọa độ
    Sử dụng Overpass API (OpenStreetMap)
    
    Args:
        request: POIRequest với lat và lng
        
    Returns:
        Danh sách các PointOfInterest
    """
    try:
        pois = await location_service.get_points_of_interest(request.lat, request.lng)
        return pois
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/weather", response_model=WeatherInfo | None)
async def get_weather(request: WeatherRequest):
    """
    Lấy thông tin thời tiết hiện tại tại một tọa độ
    Sử dụng Open-Meteo API (miễn phí, không cần API key)
    
    Args:
        request: WeatherRequest với lat và lng
        
    Returns:
        WeatherInfo hoặc None nếu không lấy được
    """
    try:
        weather = await location_service.get_weather(request.lat, request.lng)
        return weather
    except Exception as e:
        print(f"Weather error: {e}")
        return None


@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    """
    Dịch văn bản sử dụng HuggingFace translation model
    
    Args:
        request: TranslationRequest với text, source_lang, target_lang
        
    Returns:
        Dict với translated_text
        
    Raises:
        HTTPException: Nếu dịch thất bại
    """
    try:
        translated = await huggingface_service.translate(
            request.text,
            request.source_lang,
            request.target_lang
        )
        return {"translated_text": translated}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/health")
async def health_check():
    """
    Health check endpoint - kiểm tra trạng thái API
    """
    return {
        "status": "healthy",
        "services": {
            "location": "OpenStreetMap/Nominatim",
            "weather": "Open-Meteo",
            "translation": "HuggingFace"
        },
        "huggingface_configured": bool(os.getenv("HUGGINGFACE_TOKEN"))
    }


# ==================== MAIN ====================

if __name__ == "__main__":
    # Lấy port từ biến môi trường hoặc dùng 8000
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 50)
    print("🚀 Vietnam Discovery API đang khởi động...")
    print(f"📍 URL: http://localhost:{port}")
    print(f"📖 Docs: http://localhost:{port}/docs")
    print("=" * 50)
    
    # Chạy server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True  # Auto-reload khi code thay đổi (chỉ dùng trong development)
    )
