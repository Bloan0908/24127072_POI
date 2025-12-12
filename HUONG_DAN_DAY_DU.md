# 📚 HƯỚNG DẪN ĐẦY ĐỦ: Xây dựng Website Khám Phá Địa Điểm Việt Nam

## 🎯 Tổng quan dự án

**Tech Stack:**
- **Frontend:** React + TypeScript + Vite + Leaflet (bản đồ)
- **Backend:** Python FastAPI + HuggingFace + OpenStreetMap
- **Deploy:** Firebase Hosting (Frontend) + Render.com (Backend) hoặc Ngrok
- **Authentication:** Firebase Auth
- **Database:** Firebase Data Connect

---

## 📁 Cấu trúc dự án

```
khám-phá-địa-điểm-việt-nam/
├── backend/                        # Backend API (Python)
│   ├── services/
│   │   ├── __init__.py
│   │   ├── location_service.py    # Geocoding, POI, Weather
│   │   └── huggingface_service.py # Translation AI
│   ├── main.py                    # FastAPI server
│   ├── requirements.txt           # Python dependencies
│   ├── .env                       # API keys (không commit)
│   └── venv/                      # Virtual environment
│
├── components/                     # React components
│   ├── AuthModal.tsx              # Modal đăng nhập
│   ├── MapComponent.tsx           # Bản đồ Leaflet
│   ├── SearchForm.tsx             # Form tìm kiếm
│   ├── Spinner.tsx                # Loading spinner
│   └── TranslationWidget.tsx      # Widget dịch thuật
│
├── services/                       # Frontend services
│   ├── apiService.ts              # Gọi Backend API
│   ├── firebase.ts                # Firebase config
│   └── geminiService.ts           # (Deprecated)
│
├── App.tsx                         # Main component
├── types.ts                        # TypeScript types
├── package.json                    # NPM dependencies
├── firebase.json                   # Firebase config
└── README.md
```

---

## 🚀 PHẦN 1: Setup Backend (Python FastAPI)

### Bước 1: Tạo môi trường Python

```powershell
# Di chuyển vào thư mục dự án
cd "E:\UNIVERSITY\Năm 2\1\TDTT\src\khám-phá-địa-điểm-việt-nam"

# Tạo thư mục backend (nếu chưa có)
mkdir backend
cd backend

# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Nếu gặp lỗi PowerShell Execution Policy:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Bước 2: Tạo file `requirements.txt`

Tạo file `backend/requirements.txt`:

```txt
fastapi
uvicorn[standard]
python-dotenv
requests
pyngrok
geopy
nominatim
```

### Bước 3: Cài đặt dependencies

```powershell
pip install -r requirements.txt
```

### Bước 4: Tạo file `.env`

Tạo file `backend/.env`:

```env
HUGGINGFACE_TOKEN=your_huggingface_token_here
NGROK_AUTH_TOKEN=your_ngrok_token_here
PORT=8080
```

**Lấy tokens miễn phí:**
- **HuggingFace:** https://huggingface.co/settings/tokens (Đăng ký → Tạo token "Read")
- **Ngrok:** https://dashboard.ngrok.com/get-started/your-authtoken (Đăng ký → Copy authtoken)

### Bước 5: Tạo file `backend/services/__init__.py`

```python
# File này để Python nhận diện thư mục services là một package
```

### Bước 6: Tạo `backend/services/location_service.py`

```python
"""
Location Service - Sử dụng Nominatim (OpenStreetMap) để:
- Tìm tọa độ từ tên địa điểm (Geocoding)
- Tìm địa điểm du lịch xung quanh (POI)
- Lấy thông tin thời tiết từ Open-Meteo API
"""

import requests
from typing import Optional, List, Dict
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut, GeocoderServiceError


class LocationService:
    def __init__(self):
        """Khởi tạo Location Service với Nominatim"""
        self.geolocator = Nominatim(user_agent="vietnam-discovery-app")
        self.overpass_url = "https://overpass-api.de/api/interpreter"
        self.weather_api = "https://api.open-meteo.com/v1/forecast"
    
    
    async def get_coordinates(self, location_name: str) -> Optional[Dict[str, float]]:
        """
        Tìm tọa độ (lat, lng) của địa điểm tại Việt Nam
        
        Args:
            location_name: Tên địa điểm (VD: "Hà Nội", "Vịnh Hạ Long")
            
        Returns:
            Dict với lat và lng, hoặc None nếu không tìm thấy
        """
        try:
            query = f"{location_name}, Vietnam"
            location = self.geolocator.geocode(query, timeout=10)
            
            if location:
                return {
                    "lat": location.latitude,
                    "lng": location.longitude
                }
            return None
            
        except (GeocoderTimedOut, GeocoderServiceError) as e:
            print(f"Geocoding error: {e}")
            return None
    
    
    async def get_points_of_interest(self, lat: float, lng: float) -> List[Dict]:
        """
        Tìm các điểm du lịch (POI) xung quanh tọa độ
        Sử dụng Overpass API (OpenStreetMap)
        """
        try:
            radius = 0.1  # Bán kính ~10km
            
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node["tourism"~"attraction|museum|viewpoint|artwork|gallery"]({lat-radius},{lng-radius},{lat+radius},{lng+radius});
              node["historic"]({lat-radius},{lng-radius},{lat+radius},{lng+radius});
              node["natural"~"beach|cave|peak|waterfall"]({lat-radius},{lng-radius},{lat+radius},{lng+radius});
            );
            out body 5;
            """
            
            response = requests.post(
                self.overpass_url,
                data={"data": overpass_query},
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            elements = data.get("elements", [])
            
            pois = []
            for element in elements[:5]:
                tags = element.get("tags", {})
                name = tags.get("name", "Địa điểm không tên")
                description = self._generate_description(tags)
                
                pois.append({
                    "name": name,
                    "description": description,
                    "coordinates": {
                        "lat": element.get("lat"),
                        "lng": element.get("lon")
                    }
                })
            
            if not pois:
                pois = self._get_fallback_pois(lat, lng)
            
            return pois
            
        except Exception as e:
            print(f"POI search error: {e}")
            return self._get_fallback_pois(lat, lng)
    
    
    def _generate_description(self, tags: dict) -> str:
        """Tạo mô tả từ OSM tags"""
        tourism = tags.get("tourism", "")
        historic = tags.get("historic", "")
        natural = tags.get("natural", "")
        
        if tourism:
            return f"Điểm du lịch: {tourism}"
        elif historic:
            return f"Di tích lịch sử: {historic}"
        elif natural:
            return f"Kỳ quan thiên nhiên: {natural}"
        else:
            return "Địa điểm thú vị đáng khám phá"
    
    
    def _get_fallback_pois(self, lat: float, lng: float) -> List[Dict]:
        """Trả về danh sách POI mẫu khi không tìm được"""
        return [
            {
                "name": "Địa điểm 1",
                "description": "Điểm tham quan thú vị gần đây",
                "coordinates": {"lat": lat + 0.01, "lng": lng + 0.01}
            },
            {
                "name": "Địa điểm 2", 
                "description": "Khu vực văn hóa lịch sử",
                "coordinates": {"lat": lat - 0.01, "lng": lng + 0.01}
            },
            {
                "name": "Địa điểm 3",
                "description": "Điểm du lịch nổi tiếng",
                "coordinates": {"lat": lat + 0.01, "lng": lng - 0.01}
            },
            {
                "name": "Địa điểm 4",
                "description": "Cảnh quan thiên nhiên đẹp",
                "coordinates": {"lat": lat - 0.01, "lng": lng - 0.01}
            },
            {
                "name": "Địa điểm 5",
                "description": "Khu vực ẩm thực đặc sản",
                "coordinates": {"lat": lat, "lng": lng}
            }
        ]
    
    
    async def get_weather(self, lat: float, lng: float) -> Optional[Dict]:
        """
        Lấy thông tin thời tiết hiện tại
        Sử dụng Open-Meteo API (miễn phí, không cần API key)
        """
        try:
            url = f"{self.weather_api}?latitude={lat}&longitude={lng}&current=temperature_2m,weather_code"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            current = data.get("current", {})
            
            temperature = round(current.get("temperature_2m", 0))
            weather_code = current.get("weather_code", 0)
            
            weather_info = self._map_weather_code(weather_code)
            
            return {
                "temperature": temperature,
                "description": weather_info["description"],
                "icon": weather_info["icon"]
            }
            
        except Exception as e:
            print(f"Weather error: {e}")
            return None
    
    
    def _map_weather_code(self, code: int) -> Dict[str, str]:
        """Map WMO weather code sang mô tả và icon"""
        weather_map = {
            0: {"description": "Trời quang", "icon": "☀️"},
            1: {"description": "Ít mây", "icon": "🌤️"},
            2: {"description": "Mây rải rác", "icon": "☁️"},
            3: {"description": "U ám", "icon": "🌥️"},
            45: {"description": "Sương mù", "icon": "🌫️"},
            48: {"description": "Sương mù", "icon": "🌫️"},
            51: {"description": "Mưa phùn", "icon": "🌦️"},
            61: {"description": "Mưa", "icon": "🌧️"},
            80: {"description": "Mưa rào", "icon": "⛈️"},
            95: {"description": "Dông", "icon": "🌩️"},
        }
        
        return weather_map.get(code, {"description": "Không xác định", "icon": "🤷"})
```

### Bước 7: Tạo `backend/services/huggingface_service.py`

```python
"""
HuggingFace Service - Sử dụng các model HuggingFace cho:
- Translation (dịch thuật)
"""

import os
import requests


class HuggingFaceService:
    def __init__(self):
        """Khởi tạo HuggingFace Service"""
        self.api_token = os.getenv("HUGGINGFACE_TOKEN")
        self.api_base = "https://api-inference.huggingface.co/models"
        self.translation_model = "Helsinki-NLP/opus-mt-en-vi"
        self.translation_model_vi_en = "Helsinki-NLP/opus-mt-vi-en"
    
    
    async def translate(self, text: str, source_lang: str = "en", target_lang: str = "vi") -> str:
        """
        Dịch văn bản sử dụng HuggingFace Translation Model
        """
        try:
            if source_lang == "en" and target_lang == "vi":
                model = self.translation_model
            elif source_lang == "vi" and target_lang == "en":
                model = self.translation_model_vi_en
            else:
                model = self.translation_model
            
            url = f"{self.api_base}/{model}"
            headers = {}
            if self.api_token:
                headers["Authorization"] = f"Bearer {self.api_token}"
            
            payload = {"inputs": text}
            
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            
            if isinstance(result, list) and len(result) > 0:
                translated_text = result[0].get("translation_text", text)
                return translated_text
            
            return text
            
        except Exception as e:
            print(f"Translation error: {e}")
            return text
```

### Bước 8: Tạo `backend/main.py`

```python
"""
Backend API cho ứng dụng Khám Phá Địa Điểm Việt Nam
Sử dụng FastAPI để cung cấp các endpoint cho frontend
Tích hợp HuggingFace và OpenStreetMap
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import uvicorn

from services.location_service import LocationService
from services.huggingface_service import HuggingFaceService

load_dotenv()

app = FastAPI(
    title="Vietnam Discovery API",
    description="Backend API cho ứng dụng khám phá địa điểm Việt Nam (HuggingFace + OpenStreetMap)",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

location_service = LocationService()
huggingface_service = HuggingFaceService()


# ==================== MODELS ====================

class LocationRequest(BaseModel):
    location_name: str

class CoordinatesResponse(BaseModel):
    lat: float
    lng: float

class POIRequest(BaseModel):
    lat: float
    lng: float

class WeatherRequest(BaseModel):
    lat: float
    lng: float

class WeatherInfo(BaseModel):
    temperature: int
    description: str
    icon: str

class PointOfInterest(BaseModel):
    name: str
    description: str
    coordinates: CoordinatesResponse
    weather: WeatherInfo | None = None

class TranslationRequest(BaseModel):
    text: str
    source_lang: str = "en"
    target_lang: str = "vi"


# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
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
    """Lấy tọa độ của địa điểm"""
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
    """Lấy 5 điểm ưa thích xung quanh tọa độ"""
    try:
        pois = await location_service.get_points_of_interest(request.lat, request.lng)
        return pois
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/weather", response_model=WeatherInfo | None)
async def get_weather(request: WeatherRequest):
    """Lấy thông tin thời tiết"""
    try:
        weather = await location_service.get_weather(request.lat, request.lng)
        return weather
    except Exception as e:
        print(f"Weather error: {e}")
        return None


@app.post("/api/translate")
async def translate_text(request: TranslationRequest):
    """Dịch văn bản"""
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
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "location": "OpenStreetMap/Nominatim",
            "weather": "Open-Meteo",
            "translation": "HuggingFace"
        },
        "huggingface_configured": bool(os.getenv("HUGGINGFACE_TOKEN"))
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8080))
    
    print("=" * 50)
    print("🚀 Vietnam Discovery API đang khởi động...")
    print(f"📍 URL: http://localhost:{port}")
    print(f"📖 Docs: http://localhost:{port}/docs")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
```

### Bước 9: Test backend local

```powershell
# Trong thư mục backend
python main.py
```

Mở browser: `http://localhost:8080/docs` → Test các API endpoint

---

## 🌐 PHẦN 2: Deploy Backend lên Ngrok

### Bước 1: Cấu hình Ngrok authtoken

```powershell
# Thêm authtoken vào config ngrok
ngrok config add-authtoken YOUR_NGROK_TOKEN
```

### Bước 2: Chạy backend và ngrok

**Terminal 1 - Chạy ngrok:**
```powershell
cd backend
ngrok http 8080
```

**Terminal 2 - Chạy backend:**
```powershell
cd backend
.\venv\Scripts\activate
python main.py
```

### Bước 3: Lấy Public URL

Trong terminal ngrok, tìm dòng:
```
Forwarding    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:8080
```

**Copy URL đó** (VD: `https://divina-subcultrated-superintensely.ngrok-free.dev`)

---

## 💻 PHẦN 3: Setup Frontend (React + TypeScript)

### Bước 1: Tạo file `services/apiService.ts`

```typescript
/**
 * API Service - Gọi Backend API (FastAPI) thay vì Gemini trực tiếp
 * Backend sử dụng: HuggingFace + OpenStreetMap + Open-Meteo
 */

import type { Coordinates, PointOfInterest, WeatherInfo } from '../types';

// URL của Backend API - Cập nhật URL ngrok của bạn ở đây
const API_URL = import.meta.env.VITE_API_URL || "https://your-ngrok-url.ngrok-free.app";

export async function getCoordinatesForLocation(locationName: string): Promise<Coordinates> {
  try {
    const response = await fetch(`${API_URL}/api/coordinates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location_name: locationName }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `Không thể lấy tọa độ cho ${locationName}`);
    }

    const data = await response.json();
    
    if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      throw new Error('Dữ liệu tọa độ không hợp lệ từ backend');
    }

    return {
      lat: data.lat,
      lng: data.lng
    };

  } catch (error) {
    console.error("Error fetching coordinates:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới backend API. Vui lòng kiểm tra backend đang chạy.');
    }
    
    throw error;
  }
}

export async function getPointsOfInterest(coords: Coordinates): Promise<PointOfInterest[]> {
  try {
    const response = await fetch(`${API_URL}/api/pois`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Không thể lấy danh sách địa điểm');
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      throw new Error('Dữ liệu POI không hợp lệ từ backend');
    }

    return data.map(poi => ({
      name: poi.name,
      description: poi.description,
      coordinates: {
        lat: poi.coordinates.lat,
        lng: poi.coordinates.lng
      },
      weather: poi.weather
    }));

  } catch (error) {
    console.error("Error fetching POIs:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới backend API.');
    }
    
    throw error;
  }
}

export async function getWeatherForCoordinates(coords: Coordinates): Promise<WeatherInfo | null> {
  try {
    const response = await fetch(`${API_URL}/api/weather`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lat: coords.lat, lng: coords.lng }),
    });

    if (!response.ok) {
      console.warn('Weather API returned error, returning null');
      return null;
    }

    const data = await response.json();
    
    if (!data) {
      return null;
    }

    return {
      temperature: data.temperature,
      description: data.description,
      icon: data.icon
    };

  } catch (error) {
    console.warn("Error fetching weather (non-critical):", error);
    return null;
  }
}

export async function translateText(
  text: string, 
  sourceLang: string = 'en', 
  targetLang: string = 'vi'
): Promise<string> {
  try {
    const response = await fetch(`${API_URL}/api/translate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        text, 
        source_lang: sourceLang, 
        target_lang: targetLang 
      }),
    });

    if (!response.ok) {
      console.warn('Translation failed, returning original text');
      return text;
    }

    const data = await response.json();
    return data.translated_text || text;

  } catch (error) {
    console.warn("Translation error (non-critical):", error);
    return text;
  }
}
```

### Bước 2: Cập nhật `App.tsx`

Thay đổi import ở đầu file:

```typescript
// CŨ (xóa dòng này):
// import { getCoordinatesForLocation, getPointsOfInterest, getWeatherForCoordinates } from './services/geminiService';

// MỚI (thêm dòng này):
import { getCoordinatesForLocation, getPointsOfInterest, getWeatherForCoordinates } from './services/apiService';
```

### Bước 3: Test frontend local

```powershell
# Trong thư mục gốc dự án
npm run dev
```

Mở `http://localhost:5173` → Test tìm kiếm địa điểm (VD: "Hà Nội")

---

## 🔥 PHẦN 4: Deploy lên Firebase Hosting

### Bước 1: Build frontend

```powershell
npm run build
```

### Bước 2: Deploy lên Firebase

```powershell
npx firebase deploy
```

Hoặc:

```powershell
firebase deploy --only hosting
```

### Bước 3: Lấy URL website

Sau khi deploy thành công, Firebase sẽ trả về URL:
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/...
Hosting URL: https://your-project.web.app
```

---

## 📝 LƯU Ý QUAN TRỌNG

### 1. Ngrok URL thay đổi mỗi lần restart

- Mỗi khi restart ngrok, URL sẽ đổi
- **Cần làm:**
  1. Cập nhật `API_URL` trong `services/apiService.ts`
  2. Build lại: `npm run build`
  3. Deploy lại: `firebase deploy`

**Giải pháp lâu dài:**
- Nâng cấp Ngrok Pro (URL cố định)
- Hoặc deploy backend lên Render/Railway (miễn phí)

### 2. Backend phải luôn chạy

Để website hoạt động, cần giữ 2 terminal đang chạy:
- **Terminal 1:** Ngrok (`ngrok http 8080`)
- **Terminal 2:** Backend (`python main.py`)

### 3. API Keys bảo mật

- **KHÔNG** commit file `.env` lên Git
- Thêm vào `.gitignore`:
```
backend/.env
backend/venv/
```

### 4. CORS Settings

Nếu gặp lỗi CORS, kiểm tra `main.py`:
```python
allow_origins=["*"]  # Cho phép tất cả origins
```

---

## 🆘 Troubleshooting

### Lỗi: "Không thể kết nối tới backend API"

**Nguyên nhân:** Backend không chạy hoặc URL sai

**Giải pháp:**
1. Kiểm tra backend đang chạy: `http://localhost:8080/docs`
2. Kiểm tra ngrok đang chạy và có URL
3. Kiểm tra `API_URL` trong `apiService.ts` đúng với ngrok URL

### Lỗi: PowerShell Execution Policy

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Lỗi: Ngrok "authtoken required"

```powershell
ngrok config add-authtoken YOUR_TOKEN
```

### Lỗi: Port 8080 đã được sử dụng

Đổi port trong `.env`:
```env
PORT=8081
```

Và chạy ngrok với port mới:
```powershell
ngrok http 8081
```

---

## 🎯 Checklist hoàn thành

### Setup & Development
- [ ] Python virtual environment đã tạo
- [ ] Backend dependencies đã cài (`pip install -r requirements.txt`)
- [ ] File `.env` đã tạo với tokens
- [ ] Backend chạy được local (`python main.py`)
- [ ] Test API qua Swagger UI (`/docs`)
- [ ] Frontend có file `apiService.ts`
- [ ] `App.tsx` đã import từ `apiService`
- [ ] Test tìm kiếm địa điểm thành công

### Deploy (Chọn 1 trong 2)

**Option 1: Ngrok (Development)**
- [ ] Ngrok tạo được public URL
- [ ] Frontend gọi được backend qua ngrok
- [ ] Website hoạt động (khi máy bật)

**Option 2: Render (Production - Khuyến nghị)**
- [ ] Code đã push lên GitHub
- [ ] Deploy backend lên Render thành công
- [ ] Lấy được Render URL cố định
- [ ] Cập nhật `apiService.ts` với Render URL
- [ ] Build frontend thành công (`npm run build`)
- [ ] Deploy lên Firebase thành công
- [ ] Website hoạt động 24/7 (không cần máy bật)

---

## 🚀 PHẦN 5: Deploy Backend lên Render.com (URL cố định, chạy 24/7)

### **Tại sao cần deploy lên Render?**

- ❌ **Ngrok:** URL thay đổi mỗi lần restart, cần máy bật
- ✅ **Render:** URL cố định, backend chạy 24/7, tắt máy vẫn hoạt động

---

### **Bước 1: Chuẩn bị files**

#### 1.1. Tạo file `.gitignore` trong thư mục `backend`

```
venv/
__pycache__/
.env
*.pyc
.DS_Store
```

#### 1.2. Kiểm tra `requirements.txt` có `gunicorn`

File `backend/requirements.txt` phải có:
```
fastapi
uvicorn[standard]
python-dotenv
requests
pyngrok
geopy
nominatim
gunicorn
```

#### 1.3. Tạo file `runtime.txt` (nếu cần chỉ định Python version)

Tạo file `backend/runtime.txt`:
```
python-3.11.0
```

---

### **Bước 2: Push code lên GitHub**

```powershell
# Di chuyển về thư mục gốc dự án
cd "E:\UNIVERSITY\Năm 2\1\TDTT\src\khám-phá-địa-điểm-việt-nam"

# Khởi tạo git (nếu chưa có)
git init

# Add tất cả files
git add .

# Commit
git commit -m "Add backend for Render deployment"

# Kết nối với GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# Push code lên
git branch -M main
git push -u origin main
```

---

### **Bước 3: Deploy lên Render.com**

#### 3.1. Đăng ký/Đăng nhập Render

1. Vào https://render.com
2. Click **"Get Started"** hoặc **"Sign Up"**
3. Chọn **"Sign in with GitHub"** (dễ nhất)
4. Cho phép Render truy cập GitHub

#### 3.2. Tạo Web Service mới

1. Sau khi đăng nhập → Click **"New +"** (góc trên bên phải)
2. Chọn **"Web Service"**
3. Tìm repository của bạn trong danh sách (VD: `24127072_POI`)
4. Click **"Connect"**

#### 3.3. Cấu hình Web Service

Điền các thông tin sau:

| Field | Value |
|-------|-------|
| **Name** | `vietnam-discovery-api` (hoặc tên bạn thích) |
| **Region** | `Singapore` (gần Việt Nam nhất) |
| **Branch** | `main` |
| **Root Directory** | `backend` ⚠️ **QUAN TRỌNG!** |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | `Free` ✅ |

#### 3.4. Thêm Environment Variables

Scroll xuống phần **"Environment Variables"**, click **"Add Environment Variable"**:

- **Key:** `HUGGINGFACE_TOKEN`
- **Value:** `your_huggingface_token_here`

Click **"Add"**

#### 3.5. Deploy

Click **"Create Web Service"** ở cuối trang.

Render sẽ bắt đầu build và deploy (~3-5 phút). Bạn sẽ thấy logs đang chạy.

**Chờ đến khi thấy:**
```
✅ Live at https://vietnam-discovery-api.onrender.com
```

**Copy URL này!**

---

### **Bước 4: Cập nhật Frontend**

#### 4.1. Sửa file `services/apiService.ts`

Thay đổi dòng `API_URL`:

```typescript
// CŨ:
const API_URL = import.meta.env.VITE_API_URL || "https://divina-subcultrated-superintensely.ngrok-free.dev";

// MỚI:
const API_URL = import.meta.env.VITE_API_URL || "https://vietnam-discovery-api.onrender.com";
```

*(Thay bằng URL Render của bạn)*

#### 4.2. Build lại Frontend

```powershell
npm run build
```

#### 4.3. Deploy lại lên Firebase

```powershell
firebase deploy
```

hoặc:

```powershell
npx firebase deploy
```

---

### **Bước 5: Test Website**

1. Mở website Firebase của bạn
2. Tìm kiếm địa điểm (VD: "Hà Nội")
3. Kiểm tra có hiện bản đồ và 5 địa điểm không

**✅ Hoàn thành!** Website giờ chạy 24/7, không cần máy bạn bật.

---

### **⚠️ Lưu ý về Render Free Tier:**

**Giới hạn:**
- Backend sẽ "ngủ" sau **15 phút** không có request
- Lần đầu truy cập sau khi ngủ sẽ chậm ~30 giây (đánh thức backend)
- Giới hạn: **750 giờ/tháng** (đủ dùng cho học tập)

**Giải pháp:**
- Nâng cấp Render Paid ($7/tháng): Backend không ngủ, nhanh hơn
- Hoặc dùng cron job để ping backend 10 phút/lần (giữ backend thức)

---

### **Bước 6: (Optional) Giữ Render Backend không ngủ**

Tạo cron job miễn phí để ping backend mỗi 10 phút:

1. Vào https://cron-job.org/en/
2. Đăng ký tài khoản
3. Tạo cronjob mới:
   - URL: `https://vietnam-discovery-api.onrender.com/health`
   - Interval: Every 10 minutes
4. Save

Backend giờ sẽ luôn thức! 🚀

---

## 🔄 So sánh Ngrok vs Render

| Tiêu chí | Ngrok | Render |
|----------|-------|--------|
| **URL** | Thay đổi mỗi lần restart | Cố định |
| **Uptime** | Cần máy bật | 24/7 |
| **Speed** | Nhanh | Hơi chậm khi "thức dậy" |
| **Setup** | Đơn giản | Cần push GitHub |
| **Free Tier** | Unlimited | 750 giờ/tháng |
| **Dùng cho** | Development/Test | Production |

---

### Sử dụng biến môi trường trong Frontend

Tạo file `.env` trong thư mục gốc:
```env
VITE_API_URL=https://vietnam-discovery-api.onrender.com
```

Sau đó trong `apiService.ts`:
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
```

---

## 📚 Tài liệu tham khảo

- **FastAPI:** https://fastapi.tiangolo.com/
- **HuggingFace API:** https://huggingface.co/docs/api-inference/
- **Nominatim (Geocoding):** https://nominatim.org/
- **Open-Meteo (Weather):** https://open-meteo.com/
- **Ngrok:** https://ngrok.com/docs
- **Firebase Hosting:** https://firebase.google.com/docs/hosting

---

**Chúc bạn thành công! 🎉**

Nếu gặp vấn đề, hãy kiểm tra lại từng bước hoặc xem phần Troubleshooting.
