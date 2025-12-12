import { GoogleGenAI, Type } from "@google/genai";
import type { Coordinates, PointOfInterest, WeatherInfo} from '../types';

const apiKey = import.meta.env.VITE_API_KEY || "AIzaSyAgApoD7EMsc7rTCaMMbaRw3xLskyC53Oc"; //set up api key của gemini

const ai = new GoogleGenAI({ apiKey });
console.log('API Key exists:', !!apiKey); 

const locationSchema = {
  type: Type.OBJECT,
  properties: {
    lat: { type: Type.NUMBER, description: 'Vĩ độ của địa điểm' },
    lng: { type: Type.NUMBER, description: 'Kinh độ của địa điểm' },
  },
  required: ['lat', 'lng'],
};

const poiSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Tên của địa điểm ưa thích.' },
      description: { type: Type.STRING, description: 'Mô tả ngắn gọn trong một câu.' },
      coordinates: {
        type: Type.OBJECT,
        properties: {
          lat: { type: Type.NUMBER },
          lng: { type: Type.NUMBER }
        },
        required: ['lat', 'lng']
      }
    },
    required: ['name', 'description', 'coordinates']
  }
};

export async function getCoordinatesForLocation(locationName: string): Promise<Coordinates> {
  const prompt = `Cung cấp tọa độ địa lý (vĩ độ và kinh độ) cho địa điểm: "${locationName}, Việt Nam". Vui lòng chỉ trả về một đối tượng JSON với các khóa "lat" và "lng".`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: locationSchema,
      },
    });

    const rawText = response.text.trim();
    if (!rawText) {
        throw new Error("Mô hình AI đã trả về một phản hồi trống.");
    }
    
    const jsonText = rawText.replace(/^```json\s*|```$/g, '').trim();

    let result: any;
    try {
      result = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse coordinates JSON:", jsonText, e);
      throw new Error("Mô hình AI đã trả về phản hồi JSON không hợp lệ.");
    }

    // Stricter validation to prevent NaN and other invalid number types.
    if (
      !result ||
      typeof result !== 'object' ||
      Array.isArray(result) ||
      typeof result.lat !== 'number' ||
      typeof result.lng !== 'number' ||
      !isFinite(result.lat) ||
      !isFinite(result.lng)
    ) {
      console.error("Invalid or incomplete coordinate data from API:", result);
      throw new Error("Nhận được định dạng tọa độ không hợp lệ từ mô hình AI.");
    }

    return { lat: result.lat, lng: result.lng };
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    if (error instanceof Error && (error.message.includes("không hợp lệ") || error.message.includes("phản hồi trống"))) {
        throw error;
    }
    
    const baseMessage = `Không thể lấy tọa độ cho ${locationName}.`;
    let details = 'Địa điểm có thể không hợp lệ hoặc đã xảy ra lỗi kết nối.';
    
    if (error instanceof Error) {
        const lowerCaseError = error.message.toLowerCase();
        // FIX: Update error message to refer to API_KEY instead of VITE_GEMINI_API_KEY.
        if(lowerCaseError.includes("api key") || lowerCaseError.includes("permission denied") || lowerCaseError.includes("403")) {
            details = "API key không hợp lệ hoặc bị thiếu. Vui lòng đảm bảo biến môi trường API_KEY được đặt chính xác.";
        } else if (lowerCaseError.includes("400")) {
            details = "Yêu cầu không hợp lệ (lỗi 400). Tên địa điểm có thể không được chấp nhận.";
        } else if (lowerCaseError.includes("500")) {
            details = "Lỗi máy chủ từ dịch vụ AI (lỗi 500). Vui lòng thử lại sau.";
        } else if (lowerCaseError.includes("fetch")) {
            details = "Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn."
        }
    }
    throw new Error(`${baseMessage} ${details}`);
  }
}

export async function getPointsOfInterest(coords: Coordinates): Promise<PointOfInterest[]> {
  const prompt = `Liệt kê chính xác 5 điểm ưa thích phổ biến và thú vị gần vĩ độ ${coords.lat}, kinh độ ${coords.lng} ở Việt Nam. Cung cấp một danh sách đa dạng (ví dụ: di tích lịch sử, kỳ quan thiên nhiên, điểm văn hóa). Đối với mỗi điểm, bao gồm tên, mô tả ngắn gọn trong một câu, và vĩ độ và kinh độ chính xác của nó. Phản hồi bằng một mảng JSON gồm các đối tượng.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: poiSchema,
      },
    });
    
    const rawText = response.text.trim();
    if (!rawText) {
        console.warn("Model returned an empty response for POIs.");
        return [];
    }

    const jsonText = rawText.replace(/^```json\s*|```$/g, '').trim();

    let results: any;
    try {
      results = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse POI JSON:", jsonText, e);
      throw new Error("Mô hình AI đã trả về phản hồi JSON không hợp lệ.");
    }

    if (!Array.isArray(results)) {
      console.error("Invalid POI data from API (not an array):", results);
      throw new Error("Nhận được định dạng POI không hợp lệ từ mô hình AI (dự kiến là một mảng).");
    }

    // A more robust way to filter and map data to prevent invalid objects.
    return results.reduce<PointOfInterest[]>((acc, poi) => {
      const isValid =
        poi &&
        typeof poi === 'object' &&
        typeof poi.name === 'string' && poi.name.trim() !== '' &&
        typeof poi.description === 'string' &&
        poi.coordinates &&
        typeof poi.coordinates === 'object' &&
        typeof poi.coordinates.lat === 'number' &&
        isFinite(poi.coordinates.lat) &&
        typeof poi.coordinates.lng === 'number' &&
        isFinite(poi.coordinates.lng);

      if (isValid) {
        acc.push({
          name: poi.name,
          description: poi.description,
          coordinates: {
            lat: poi.coordinates.lat,
            lng: poi.coordinates.lng
          }
        });
      } else {
        console.warn('Filtering out POI with invalid data:', poi);
      }
      return acc;
    }, []);

  } catch (error) {
    console.error("Error fetching points of interest:", error);
    if (error instanceof Error && (error.message.includes("định dạng POI không hợp lệ") || error.message.includes("không hợp lệ"))) {
        throw error;
    }
    
    let details = 'Đã xảy ra lỗi khi truy xuất các điểm ưa thích.';
    if (error instanceof Error) {
        const lowerCaseError = error.message.toLowerCase();
        // FIX: Update error message to refer to API_KEY instead of VITE_GEMINI_API_KEY.
        if(lowerCaseError.includes("api key") || lowerCaseError.includes("permission denied") || lowerCaseError.includes("403")) {
            details = "API key không hợp lệ hoặc bị thiếu. Vui lòng đảm bảo biến môi trường API_KEY được đặt chính xác.";
        } else if (lowerCaseError.includes("400")) {
            details = "Yêu cầu không hợp lệ (lỗi 400).";
        } else if (lowerCaseError.includes("500")) {
            details = "Lỗi máy chủ từ dịch vụ AI (lỗi 500). Vui lòng thử lại sau.";
        } else if (lowerCaseError.includes("fetch")) {
            details = "Lỗi mạng. Vui lòng kiểm tra kết nối internet của bạn."
        }
    }
    throw new Error(details);
  }
}

/**
 * Maps WMO weather interpretation codes to a descriptive string and an emoji icon.
 * @see https://open-meteo.com/en/docs
 * @param code The WMO weather code.
 * @returns An object with a description and an icon.
 */
function mapWeatherCodeToInfo(code: number): { description: string; icon: string } {
  switch (code) {
    case 0: return { description: 'Trời quang', icon: '☀️' };
    case 1: return { description: 'Ít mây', icon: '🌤️' };
    case 2: return { description: 'Mây rải rác', icon: '☁️' };
    case 3: return { description: 'U ám', icon: '🌥️' };
    case 45: case 48: return { description: 'Sương mù', icon: '🌫️' };
    case 51: case 53: case 55: return { description: 'Mưa phùn', icon: '🌦️' };
    case 56: case 57: return { description: 'Mưa phùn đông', icon: '🌨️' };
    case 61: case 63: case 65: return { description: 'Mưa', icon: '🌧️' };
    case 66: case 67: return { description: 'Mưa lạnh', icon: '🌨️' };
    case 71: case 73: case 75: return { description: 'Tuyết rơi', icon: '❄️' };
    case 77: return { description: 'Hạt tuyết', icon: '❄️' };
    case 80: case 81: case 82: return { description: 'Mưa rào', icon: '⛈️' };
    case 85: case 86: return { description: 'Tuyết', icon: '❄️' };
    case 95: return { description: 'Dông', icon: '🌩️' };
    case 96: case 99: return { description: 'Dông có mưa đá', icon: '⛈️' };
    default: return { description: 'Không xác định', icon: '🤷' };
  }
}

/**
 * Fetches the current weather for a given set of coordinates using the Open-Meteo API.
 * @param coords The latitude and longitude.
 * @returns A promise that resolves to a WeatherInfo object or null if an error occurs.
 */
export async function getWeatherForCoordinates(coords: Coordinates): Promise<WeatherInfo | null> {
  const { lat, lng } = coords;
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`Weather API request failed with status ${response.status}`);
      return null;
    }
    const data = await response.json();

    if (data && data.current) {
      const { temperature_2m: temperature, weather_code: weatherCode } = data.current;
      const { description, icon } = mapWeatherCodeToInfo(weatherCode);

      return {
        temperature: Math.round(temperature),
        description,
        icon,
      };
    }
    console.warn("Weather API returned invalid data structure:", data);
    return null;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

/**
 * Translates English text to Vietnamese mimicking the logic of py-googletrans.
 * Since py-googletrans is a Python library and we are in a browser environment,
 * we implement the call to the same internal Google API endpoint (client=gtx) that py-googletrans uses.
 * 
 * @param text The English text to translate.
 * @returns The translated Vietnamese text.
 */
export async function translateToVietnamese(text: string): Promise<string> {
  // Đây là endpoint 'bí mật' mà py-googletrans sử dụng (client=gtx)
  // Tham số: sl=source language (en), tl=target language (vi), dt=t (return translation)
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      // Nếu Google chặn request (429 Too Many Requests hoặc 403), ta ném lỗi ra
      throw new Error(`Google API Error: ${response.status}`);
    }

    const data = await response.json();

    // Cấu trúc dữ liệu trả về của endpoint này khá phức tạp (mảng lồng nhau)
    // Ví dụ: [[["Xin chào","Hello",null,null,1]], null, "en", ...]
    // Chúng ta cần nối các phần tử đã dịch lại (trong trường hợp câu dài bị tách ra)
    if (data && data[0]) {
       return data[0].map((item: any) => item[0]).join('');
    }
    
    throw new Error("Không thể phân tích dữ liệu trả về từ Google.");
  } catch (error) {
    console.error("Translation function error:", error);
    throw new Error("Lỗi dịch thuật (Có thể do chính sách CORS của Google khi gọi từ trình duyệt)."); 
  }
}