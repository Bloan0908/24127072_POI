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
        # Nominatim yêu cầu user_agent để tracking
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
            # Thêm "Vietnam" vào query để tăng độ chính xác
            query = f"{location_name}, Vietnam"
            
            # Gọi Nominatim API
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
        
        Args:
            lat: Vĩ độ
            lng: Kinh độ
            
        Returns:
            List các POI với name, description, coordinates
        """
        try:
            # Bán kính tìm kiếm (độ) - khoảng 10km
            radius = 0.1
            
            # Overpass QL query để tìm các POI du lịch
            # Tìm: tourism, historic, natural features
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
            
            # Parse kết quả
            pois = []
            for element in elements[:5]:  # Lấy tối đa 5 POI
                tags = element.get("tags", {})
                name = tags.get("name", "Địa điểm không tên")
                
                # Tạo mô tả từ tags
                description = self._generate_description(tags)
                
                pois.append({
                    "name": name,
                    "description": description,
                    "coordinates": {
                        "lat": element.get("lat"),
                        "lng": element.get("lon")
                    }
                })
            
            # Nếu không tìm được POI, trả về danh sách mẫu
            if not pois:
                pois = self._get_fallback_pois(lat, lng)
            
            return pois
            
        except Exception as e:
            print(f"POI search error: {e}")
            # Trả về danh sách mẫu nếu lỗi
            return self._get_fallback_pois(lat, lng)
    
    
    def _generate_description(self, tags: dict) -> str:
        """Tạo mô tả chi tiết từ OSM tags"""
        tourism = tags.get("tourism", "")
        historic = tags.get("historic", "")
        natural = tags.get("natural", "")
        amenity = tags.get("amenity", "")
        building = tags.get("building", "")
        
        # Lấy thông tin bổ sung
        wikipedia = tags.get("wikipedia", "")
        wikidata = tags.get("wikidata", "")
        description = tags.get("description", "")
        
        # Tạo mô tả dựa trên loại địa điểm
        base_desc = ""
        
        if tourism == "attraction":
            base_desc = "Điểm tham quan du lịch nổi tiếng"
        elif tourism == "museum":
            base_desc = "Bảo tàng lưu giữ di sản văn hóa và lịch sử"
        elif tourism == "viewpoint":
            base_desc = "Điểm ngắm cảnh đẹp, view panorama tuyệt vời"
        elif tourism == "artwork":
            base_desc = "Tác phẩm nghệ thuật công cộng, điểm check-in độc đáo"
        elif tourism == "gallery":
            base_desc = "Phòng tranh nghệ thuật, triển lãm đa dạng"
        elif historic == "memorial":
            base_desc = "Đài tưởng niệm lịch sử, nơi tôn vinh các anh hùng dân tộc"
        elif historic == "monument":
            base_desc = "Di tích lịch sử quan trọng, kiến trúc đặc sắc"
        elif historic == "archaeological_site":
            base_desc = "Khu di tích khảo cổ học, dấu tích văn minh cổ đại"
        elif historic == "castle":
            base_desc = "Lâu đài cổ kính, kiến trúc thời phong kiến"
        elif historic == "ruins":
            base_desc = "Tàn tích lịch sử, dấu vết của thời gian"
        elif natural == "beach":
            base_desc = "Bãi biển đẹp, cát trắng nước trong, lý tưởng để nghỉ dưỡng"
        elif natural == "cave":
            base_desc = "Hang động tự nhiên, khám phá thạch nhũ kỳ thú"
        elif natural == "peak":
            base_desc = "Đỉnh núi hùng vĩ, chinh phục và ngắm cảnh từ trên cao"
        elif natural == "waterfall":
            base_desc = "Thác nước hùng vĩ, khung cảnh thiên nhiên tuyệt đẹp"
        elif amenity == "place_of_worship":
            base_desc = "Nơi thờ cúng tâm linh, kiến trúc tôn giáo độc đáo"
        else:
            # Fallback description
            if tourism:
                base_desc = f"Địa điểm du lịch thú vị - {tourism}"
            elif historic:
                base_desc = f"Di tích lịch sử - {historic}"
            elif natural:
                base_desc = f"Kỳ quan thiên nhiên - {natural}"
            else:
                base_desc = "Địa điểm đáng khám phá tại Việt Nam"
        
        # Thêm thông tin từ description tag nếu có
        if description:
            base_desc += f". {description}"
        
        return base_desc
    
    
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
        
        Args:
            lat: Vĩ độ
            lng: Kinh độ
            
        Returns:
            Dict với temperature, description, icon
        """
        try:
            url = f"{self.weather_api}?latitude={lat}&longitude={lng}&current=temperature_2m,weather_code"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            current = data.get("current", {})
            
            temperature = round(current.get("temperature_2m", 0))
            weather_code = current.get("weather_code", 0)
            
            # Map weather code sang icon và mô tả
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
