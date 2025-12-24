
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { getUsers, updateUserStatus, getKeys, generateKey, deleteKey } from './services/mockBackend';
import { User, ActivationKey } from './types';
import { Users, Key, LogOut, Shield, LayoutDashboard, Search, Trash2, Plus, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'keys'>('users');
  
  // Data State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [keysList, setKeysList] = useState<ActivationKey[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Protect Route
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load Data
  useEffect(() => {
    setUsersList(getUsers());
    setKeysList(getKeys());
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleUserStatus = (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    const updated = updateUserStatus(userId, newStatus);
    setUsersList(updated);
  };

  const handleGenerateKey = () => {
    const updated = generateKey(user?.username || 'admin');
    setKeysList(updated);
  };

  const handleDeleteKey = (id: string) => {
    const updated = deleteKey(id);
    setKeysList(updated);
  };

  // Render content based on tab
  const renderContent = () => {
    if (activeTab === 'users') {
      const filteredUsers = usersList.filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()));
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Users size={18} className="text-indigo-600" />
              用户列表
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="搜索用户..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-xs border border-gray-300 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none w-48"
              />
            </div>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">用户名</th>
                <th className="px-6 py-3">角色</th>
                <th className="px-6 py-3">注册时间</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{u.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{new Date(u.registeredAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                     {u.status === 'active' ? (
                       <span className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                         <CheckCircle size={12} /> 正常
                       </span>
                     ) : (
                       <span className="flex items-center gap-1.5 text-red-500 text-xs font-bold">
                         <XCircle size={12} /> 禁用
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {u.role !== 'admin' && (
                      <button 
                        onClick={() => toggleUserStatus(u.id, u.status)}
                        className={`text-xs font-medium px-3 py-1 rounded border transition-colors ${u.status === 'active' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'}`}
                      >
                        {u.status === 'active' ? '禁用' : '启用'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Key size={18} className="text-orange-600" />
              激活密钥管理
            </h3>
            <button 
              onClick={handleGenerateKey}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors"
            >
              <Plus size={14} /> 生成新密钥
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-3">密钥 (Key)</th>
                <th className="px-6 py-3">状态</th>
                <th className="px-6 py-3">生成人</th>
                <th className="px-6 py-3">生成时间</th>
                <th className="px-6 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keysList.map(k => (
                <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">{k.key}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${k.status === 'unused' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {k.status === 'unused' ? '未使用' : '已使用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{k.generatedBy}</td>
                  <td className="px-6 py-4 text-xs text-gray-500">{new Date(k.generatedAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteKey(k.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {keysList.length === 0 && (
                 <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-gray-400 text-xs">
                     暂无激活密钥，请点击生成
                   </td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans text-gray-800">
      {/* Admin Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2 mb-1">
             <Shield className="text-indigo-500" />
             <span className="font-black text-lg tracking-tight">Admin Console</span>
          </div>
          <span className="text-xs text-gray-500">后台管理系统 v1.0</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users size={18} />
            用户管理
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'keys' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Key size={18} />
            密钥管理
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs">
               A
            </div>
            <div className="flex flex-col">
               <span className="text-sm font-bold">{user?.username}</span>
               <span className="text-[10px] text-gray-400 uppercase">Administrator</span>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={14} />
            退出登录
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
         <header className="mb-8 flex justify-between items-end">
           <div>
             <h1 className="text-2xl font-black text-gray-900 mb-1">
               {activeTab === 'users' ? '用户管理' : '密钥管理'}
             </h1>
             <p className="text-sm text-gray-500">
               {activeTab === 'users' ? '管理注册用户及其访问权限' : '生成和管理账号激活凭证'}
             </p>
           </div>
           <button onClick={() => navigate('/')} className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
             前往工作台 <LayoutDashboard size={12} />
           </button>
         </header>

         {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
