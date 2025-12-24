
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2, Sparkles, LayoutDashboard } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(username, password);
      if (success) {
        // Need to fetch user from context/storage to know role immediately, 
        // but login is async and state updates. 
        // We can cheat slightly by checking the mock backend logic or waiting for effect.
        // For simplicity, we rely on the Verify logic returning the user object in a real app.
        // Here we just pull from storage which was just set.
        const stored = localStorage.getItem('current_user');
        const user = stored ? JSON.parse(stored) : null;
        
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('用户名或密码错误 (试用账号: admin/123456 或 user/123456)');
      }
    } catch (err) {
      setError('登录服务暂不可用');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="mb-8 text-center animate-fade-in">
        <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
          <Sparkles className="text-white h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">KV Visual Architect</h1>
        <p className="text-gray-500 mt-2 font-medium">电商视觉全案生成系统</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100 animate-fade-in-up">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <LogIn className="text-indigo-600" size={20} />
          账号登录
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
              placeholder="请输入密码"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-gray-900 hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : "立刻登录"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            未注册账号？请联系管理员获取激活密钥
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
