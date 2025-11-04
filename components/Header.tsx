import React from 'react';
import { View } from '../App';
import { User } from '../types';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
  permissions: User['permissions'];
  role: User['role'];
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView, permissions, role }) => {
  const baseClasses = "flex-grow sm:flex-grow-0 py-3 px-4 rounded-lg transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 text-center";
  
  const activeClasses = "bg-blue-600 text-white shadow-md focus:ring-blue-500";
  const inactiveClasses = "bg-slate-700 text-gray-200 hover:bg-slate-600 focus:ring-blue-500";

  return (
    <div className="bg-slate-800 shadow-md rounded-lg p-2">
      <div className="flex flex-row flex-wrap justify-center items-stretch gap-2">
        {permissions.canEnterData && (
          <button 
            onClick={() => setActiveView('entry')} 
            className={`${baseClasses} ${activeView === 'entry' ? activeClasses : inactiveClasses}`}
          >
            <i className="fas fa-plus-circle ml-2"></i>
            إدخال البيانات
          </button>
        )}
        {permissions.canQueryData && (
          <button 
            onClick={() => setActiveView('query')} 
            className={`${baseClasses} ${activeView === 'query' ? activeClasses : inactiveClasses}`}
          >
            <i className="fas fa-database ml-2"></i>
            الاستعلام
          </button>
        )}
        {permissions.canViewStats && (
          <button 
            onClick={() => setActiveView('stats')} 
            className={`${baseClasses} ${activeView === 'stats' ? activeClasses : inactiveClasses}`}
          >
            <i className="fas fa-chart-pie ml-2"></i>
            الاحصائيات
          </button>
        )}
        {permissions.canViewUnpaid && (
          <button 
            onClick={() => setActiveView('unpaid')} 
            className={`${baseClasses} ${activeView === 'unpaid' ? activeClasses : inactiveClasses}`}
          >
            <i className="fas fa-file-invoice-dollar ml-2"></i>
            الدوائر الغير مسددة
          </button>
        )}
        {role === 'admin' && (
           <button 
            onClick={() => setActiveView('users')} 
            className={`${baseClasses} ${activeView === 'users' ? activeClasses : inactiveClasses}`}
          >
            <i className="fas fa-users-cog ml-2"></i>
            إدارة المستخدمين
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
