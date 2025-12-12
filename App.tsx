
import React, { useState, useCallback, useEffect } from 'react';
import { MapComponent } from './components/MapComponent';
import { SearchForm } from './components/SearchForm';
import { Spinner } from './components/Spinner';
import { TranslationWidget } from './components/TranslationWidget';
import { AuthModal } from './components/AuthModal';
import { getCoordinatesForLocation, getPointsOfInterest, getWeatherForCoordinates } from './services/apiService';
import type { Coordinates, PointOfInterest } from './types';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './services/firebase';


const INITIAL_CENTER: Coordinates = { lat: 16.047079, lng: 108.206230 }; // Da Nang, Vietnam

export default function App() {
  const [mapCenter, setMapCenter] = useState<Coordinates>(INITIAL_CENTER);
  const [pois, setPois] = useState<PointOfInterest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchedLocation, setSearchedLocation] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const handleSearch = useCallback(async (locationName: string) => {
    if (!locationName.trim()) {
      setError("Vui lòng nhập tên địa điểm.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setPois([]);
    setSearchedLocation(locationName);

    try {
      const coords = await getCoordinatesForLocation(locationName);
      if (!coords) {
        throw new Error("Không thể tìm thấy tọa độ cho địa điểm đã chỉ định.");
      }
      setMapCenter(coords);

      const fetchedPois = await getPointsOfInterest(coords);
      
      // Fetch weather for all POIs concurrently
      const weatherPromises = fetchedPois.map(poi => getWeatherForCoordinates(poi.coordinates));
      const weatherResults = await Promise.allSettled(weatherPromises);

      const poisWithWeather = fetchedPois.map((poi, index) => {
        const weatherResult = weatherResults[index];
        if (weatherResult.status === 'fulfilled' && weatherResult.value) {
          return { ...poi, weather: weatherResult.value };
        }
        return poi; // Return POI without weather if fetch failed
      });
      
      setPois(poisWithWeather);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      setMapCenter(INITIAL_CENTER); // Reset to default on error
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Auth Modal Component */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <aside
        className={`
          bg-white shadow-lg flex flex-col z-20 transition-all duration-300 ease-in-out
          w-full
          ${isSidebarOpen ? 'md:w-[32rem]' : 'md:w-0'}
        `}
      >
        <div 
          className={`
            h-full overflow-y-auto overflow-x-hidden
            transition-opacity duration-300
            ${isSidebarOpen ? 'opacity-100 p-6' : 'opacity-0 p-0'}
          `}
        >
          <div className="space-y-6 min-w-[28rem]">
            <header className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Khám Phá Địa Điểm Việt Nam</h1>
                <p className="text-gray-500 mt-1">Khám phá 5 địa điểm thú vị tại nơi bạn muốn du lịch.</p>
              </div>
              <div className="flex-shrink-0 ml-4">
                {user ? (
                  <div className="flex items-center gap-2 p-1.5 rounded-full bg-white border border-slate-200 shadow-sm relative group">
                    <img className="h-8 w-8 rounded-full" alt="avatar" src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName||user.email||"U")}&background=random`} />
                    <div className="hidden sm:flex flex-col items-start pr-2">
                      <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{user.displayName || "Thành viên"}</span>
                    </div>
                    
                    {/* Warning icon for unverified email */}
                    {!user.emailVerified && (
                      <div className="absolute -top-1 -right-1 bg-yellow-400 text-white rounded-full w-4 h-4 flex items-center justify-center border-2 border-white" title="Email chưa xác thực">
                        <span className="text-[10px] font-bold">!</span>
                      </div>
                    )}

                    <button onClick={handleSignOut} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors">
                      Thoát
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)} 
                    className="px-5 py-2.5 rounded-xl bg-green-600 text-white font-semibold shadow hover:bg-green-700 active:scale-[.98] transition-all whitespace-nowrap"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </header>
            
            <SearchForm onSearch={handleSearch} isLoading={isLoading} />

            {/* Đặt TranslationWidget ngay đây, trong luồng nội dung của Sidebar */}
            <TranslationWidget />

            {isLoading && (
              <div className="flex flex-col items-center justify-center text-center p-4 bg-green-50 rounded-lg">
                <Spinner />
                <p className="text-green-600 mt-2 font-semibold">Đang tìm kiếm "{searchedLocation}"...</p>
                <p className="text-green-500 text-sm">Gemini đang tìm tọa độ, địa điểm và thời tiết.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Lỗi</p>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && pois.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3">
                  5 địa điểm hàng đầu cho <span className="text-green-600">{searchedLocation}</span>
                </h2>
                <ul className="space-y-3">
                  {pois.map((poi, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex-grow">
                            <p className="font-semibold text-gray-800">{index + 1}. {poi.name}</p>
                            <p className="text-sm text-gray-600">{poi.description}</p>
                        </div>
                        {poi.weather && (
                          <div className="flex-shrink-0 flex flex-col items-center text-center w-14">
                            <span className="text-3xl" role="img" aria-label={poi.weather.description}>{poi.weather.icon}</span>
                            <span className="font-bold text-gray-800 text-sm">{poi.weather.temperature}°C</span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Khu vực chính chứa bản đồ - chiếm toàn bộ không gian còn lại */}
      <main className="flex-1 relative">
        {/* Nút toggle để ẩn/hiện sidebar - chỉ hiển thị trên desktop (md:) */}
        <button
          // Khi click sẽ đảo ngược trạng thái sidebar (true -> false hoặc false -> true)
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="
            hidden md:flex items-center justify-center 
            w-6 h-16 rounded-r-lg bg-white shadow-lg 
            absolute top-1/2 -translate-y-1/2 left-0 z-20 
            border-y-2 border-r-2 border-gray-200 
            hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
            transition-colors
          "
          /* 
            CSS Classes giải thích:
            - hidden md:flex: Ẩn trên mobile, hiện dạng flex trên desktop
            - w-6 h-16: Chiều rộng 24px, chiều cao 64px
            - rounded-r-lg: Bo tròn góc bên phải
            - absolute top-1/2 -translate-y-1/2 left-0: Đặt giữa cạnh trái màn hình
            - z-20: Độ ưu tiên hiển thị cao để nằm trên các element khác
            - border-y-2 border-r-2: Viền trên-dưới và phải dày 2px
          */
          aria-label={isSidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
        >
          {/* Icon mũi tên trái/phải để chỉ hướng của action */}
          <svg
            className={`
              w-4 h-4 text-gray-600 transition-transform duration-300 
              ${!isSidebarOpen && 'rotate-180'}
            `}
            /* 
              Icon sẽ xoay 180 độ khi sidebar đóng (!isSidebarOpen = true)
              - Sidebar mở: mũi tên trái (đóng sidebar) 
              - Sidebar đóng: mũi tên phải (mở sidebar)
            */
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Path tạo hình mũi tên trái */}
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <MapComponent center={mapCenter} pois={pois} isSidebarOpen={isSidebarOpen} />
      </main>
    </div>
  );
}
