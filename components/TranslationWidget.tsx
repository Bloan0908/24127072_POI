
import React, { useState } from 'react';
import { translateText } from '../services/apiService';

export const TranslationWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    setTranslatedText('');

    try {
      const result = await translateText(inputText, 'en', 'vi');
      
      // Kiểm tra xem có thực sự dịch được không (nếu kết quả giống text gốc)
      if (result === inputText) {
        setError('Backend không thể dịch văn bản. Model HuggingFace có thể đang loading hoặc lỗi.');
        setTranslatedText('');
      } else {
        setTranslatedText(result);
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi dịch thuật. Vui lòng thử lại.');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header của Widget - Click để mở/đóng */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 flex items-center justify-between transition-colors
          ${isOpen ? 'bg-green-50 text-green-800' : 'bg-white hover:bg-slate-50 text-gray-700'}
        `}
      >
        <div className="flex items-center gap-2 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
          </svg>
          <span>Công cụ Dịch (Anh - Việt)</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Phần nội dung form - Hiển thị khi isOpen = true */}
      {isOpen && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="space-y-3">
            <div>
              <textarea
                className="w-full px-3 py-2 text-sm text-gray-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none bg-white"
                rows={3}
                placeholder="Nhập văn bản tiếng Anh cần dịch..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              ></textarea>
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm"
            >
              {isLoading ? (
                 <>
                   <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Đang dịch...
                 </>
              ) : (
                'Dịch ngay'
              )}
            </button>

            {(translatedText || error) && (
              <div className={`rounded-lg p-3 mt-2 ${error ? 'bg-red-50 border border-red-100' : 'bg-green-100 border border-green-200'}`}>
                <p className={`text-sm ${error ? 'text-red-600' : 'text-green-800'}`}>
                  {error ? (
                    <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </span>
                  ) : (
                    translatedText
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
