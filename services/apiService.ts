/**
 * API Service - Gọi Backend API (FastAPI) thay vì Gemini trực tiếp
 * Backend sử dụng: HuggingFace + OpenStreetMap + Open-Meteo
 */

import type { Coordinates, PointOfInterest, WeatherInfo } from '../types';

// URL của Backend API
// Ngrok URL - Cập nhật URL này mỗi khi restart ngrok
const API_URL = import.meta.env.VITE_API_URL || "https://divina-subcultrated-superintensely.ngrok-free.dev";

/**
 * Lấy tọa độ (lat, lng) của một địa điểm tại Việt Nam
 * Gọi endpoint: POST /api/coordinates
 * 
 * @param locationName - Tên địa điểm (VD: "Hà Nội", "Vịnh Hạ Long")
 * @returns Promise<Coordinates> - Tọa độ { lat, lng }
 * @throws Error nếu không tìm thấy hoặc lỗi API
 */
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
    
    // Validate dữ liệu trả về
    if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') {
      throw new Error('Dữ liệu tọa độ không hợp lệ từ backend');
    }

    return {
      lat: data.lat,
      lng: data.lng
    };

  } catch (error) {
    console.error("Error fetching coordinates:", error);
    
    // Xử lý lỗi network
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới backend API. Vui lòng kiểm tra backend đang chạy.');
    }
    
    throw error;
  }
}

/**
 * Lấy danh sách 5 điểm ưa thích (POI) xung quanh tọa độ
 * Gọi endpoint: POST /api/pois
 * 
 * @param coords - Tọa độ { lat, lng }
 * @returns Promise<PointOfInterest[]> - Mảng các điểm du lịch
 */
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
    
    // Validate dữ liệu
    if (!Array.isArray(data)) {
      throw new Error('Dữ liệu POI không hợp lệ từ backend');
    }

    // Map dữ liệu về đúng format
    return data.map(poi => ({
      name: poi.name,
      description: poi.description,
      coordinates: {
        lat: poi.coordinates.lat,
        lng: poi.coordinates.lng
      },
      weather: poi.weather // Optional
    }));

  } catch (error) {
    console.error("Error fetching POIs:", error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối tới backend API.');
    }
    
    throw error;
  }
}

/**
 * Lấy thông tin thời tiết hiện tại tại một tọa độ
 * Gọi endpoint: POST /api/weather
 * 
 * @param coords - Tọa độ { lat, lng }
 * @returns Promise<WeatherInfo | null> - Thông tin thời tiết hoặc null nếu lỗi
 */
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
    
    // Nếu backend trả về null (không lấy được thời tiết)
    if (!data) {
      return null;
    }

    return {
      temperature: data.temperature,
      description: data.description,
      icon: data.icon
    };

  } catch (error) {
    // Weather không quan trọng lắm, trả về null thay vì throw error
    console.warn("Error fetching weather (non-critical):", error);
    return null;
  }
}

/**
 * Dịch văn bản sang tiếng Việt hoặc tiếng Anh
 * Gọi endpoint: POST /api/translate
 * Sử dụng HuggingFace Translation Model
 * 
 * @param text - Văn bản cần dịch
 * @param sourceLang - Ngôn ngữ nguồn (en, vi)
 * @param targetLang - Ngôn ngữ đích (en, vi)
 * @returns Promise<string> - Văn bản đã dịch
 */
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
      return text; // Trả về text gốc nếu dịch thất bại
    }

    const data = await response.json();
    return data.translated_text || text;

  } catch (error) {
    console.warn("Translation error (non-critical):", error);
    return text; // Trả về text gốc nếu lỗi
  }
}

/**
 * Kiểm tra backend API có hoạt động không
 * Gọi endpoint: GET /
 * 
 * @returns Promise<boolean> - true nếu backend hoạt động
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
}