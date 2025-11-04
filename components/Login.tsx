import React, { useState, FormEvent } from 'react';

interface LoginProps {
  onLogin: (username: string, password_raw: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  const inputClasses = "w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900">
      <div className="w-full max-w-md mx-auto p-4">
        <form
          onSubmit={handleLogin}
          className="bg-slate-800 p-8 rounded-xl shadow-lg animate-fade-in"
        >
          <div className="text-center mb-8">
            <i className="fas fa-lock text-5xl text-blue-400 mb-4"></i>
            <h1 className="text-3xl font-bold text-gray-100 font-pt-sans">
              تسجيل الدخول
            </h1>
            <p className="text-gray-400">
              الرجاء إدخال بيانات الاعتماد الخاصة بك
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                اسم المستخدم
              </label>
              <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                   <i className="fas fa-user text-gray-400"></i>
                 </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  placeholder="اسم المستخدم"
                  required
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                كلمة المرور
              </label>
               <div className="relative">
                 <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                   <i className="fas fa-key text-gray-400"></i>
                 </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClasses} pl-10`}
                  placeholder="كلمة المرور"
                  required
                />
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-3 rounded-lg text-center bg-red-800 text-red-100">
              {error}
            </div>
          )}

          <div className="mt-8">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
            >
              <i className="fas fa-sign-in-alt ml-2"></i>
              تسجيل الدخول
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
