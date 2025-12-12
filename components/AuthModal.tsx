
import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Chỉ dùng khi đăng ký
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  if (!isOpen) return null;

  // Reset state khi đóng hoặc mở lại mà chưa hoàn tất
  const handleClose = () => {
    setVerificationSent(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Đăng ký
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Cập nhật tên hiển thị
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }

        // Gửi email xác thực
        await sendEmailVerification(userCredential.user);
        
        // Hiển thị thông báo đã gửi email thay vì đóng modal ngay
        setVerificationSent(true);
      } else {
        // Đăng nhập
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email này đã được sử dụng.');
      } else if (err.code === 'auth/weak-password') {
        setError('Mật khẩu quá yếu (tối thiểu 6 ký tự).');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Lỗi đăng nhập Google.');
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
        {/* Close button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {verificationSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Đã gửi email xác nhận!</h2>
              <p className="text-gray-600 mb-6">
                Chúng tôi đã gửi một liên kết xác nhận đến <strong>{email}</strong>.<br/>
                Vui lòng kiểm tra hộp thư của bạn (cả mục Spam) để kích hoạt tài khoản.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {isRegistering ? 'Tạo tài khoản' : 'Đăng nhập'}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Khám phá các địa điểm thú vị cùng chúng tôi
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên hiển thị</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Đang xử lý...' : (isRegistering ? 'Đăng ký' : 'Đăng nhập')}
                </button>
              </form>

              <div className="mt-6 flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="px-4 text-sm text-gray-400">Hoặc</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="mt-4 w-full py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.12c-.22-.66-.35-1.36-.35-2.12s.13-1.46.35-2.12V7.04H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.96l2.66-2.84z" />
                  <path fill="#EA4335" d="M12 4.36c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.04l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Tiếp tục với Google
              </button>

              <p className="mt-6 text-center text-sm text-gray-600">
                {isRegistering ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
                <button
                  onClick={() => {
                    setIsRegistering(!isRegistering);
                    setError(null);
                  }}
                  className="ml-1 font-semibold text-green-600 hover:text-green-700 hover:underline focus:outline-none"
                >
                  {isRegistering ? 'Đăng nhập' : 'Đăng ký ngay'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
