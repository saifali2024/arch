import React from 'react';
import { View } from '../App';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const baseClasses = "w-full sm:w-auto flex-1 sm:flex-none text-center py-3 px-6 rounded-lg transition-all duration-300 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const entryActiveClasses = "bg-green-600 text-white shadow-md focus:ring-green-500";
  const queryActiveClasses = "bg-blue-600 text-white shadow-md focus:ring-blue-500";
  const statsActiveClasses = "bg-purple-600 text-white shadow-md focus:ring-purple-500";
  
  const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-200";

  return (
    <div className="bg-white shadow-md rounded-lg p-2 flex flex-col sm:flex-row justify-center items-center gap-2">
      <button 
        onClick={() => setActiveView('entry')} 
        className={`${baseClasses} ${activeView === 'entry' ? entryActiveClasses : inactiveClasses}`}
      >
        <i className="fas fa-plus-circle ml-2"></i>
        إدخال البيانات
      </button>
      <button 
        onClick={() => setActiveView('query')} 
        className={`${baseClasses} ${activeView === 'query' ? queryActiveClasses : inactiveClasses}`}
      >
        <i className="fas fa-database ml-2"></i>
        الاستعلام
      </button>
      <button 
        onClick={() => setActiveView('stats')} 
        className={`${baseClasses} ${activeView === 'stats' ? statsActiveClasses : inactiveClasses}`}
      >
        <i className="fas fa-chart-pie ml-2"></i>
        الاحصائيات
      </button>
    </div>
  );
};

export default Header;