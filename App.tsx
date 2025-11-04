import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { RetirementRecord, User } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DataEntryForm from './components/DataEntryForm';
import ArchiveSearch from './components/ArchiveSearch';
import Statistics from './components/Statistics';
import UnpaidDepartments from './components/UnpaidDepartments';
import Login from './components/Login';
import UserManagement from './components/UserManagement';

export type View = 'entry' | 'query' | 'stats' | 'unpaid' | 'users';

// Simple "hashing" for demonstration. Replace with a real crypto library in production.
const hashPassword = (password: string) => btoa(password);

function App() {
  const [view, setView] = useState<View>('entry');
  const [records, setRecords] = useLocalStorage<RetirementRecord[]>('retirementRecords', []);
  const [users, setUsers] = useLocalStorage<User[]>('retirement_users', []);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Create a default admin user if no users exist
    if (users.length === 0) {
      const adminUser: User = {
        id: crypto.randomUUID(),
        name: 'المدير العام',
        username: 'admin',
        passwordHash: hashPassword('admin'),
        role: 'admin',
        permissions: {
          canEnterData: true,
          canQueryData: true,
          canViewStats: true,
          canViewUnpaid: true,
          canEditDelete: true,
        },
      };
      setUsers([adminUser]);
    }
  }, [users, setUsers]);
  
  // Set initial view based on permissions after login
  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.permissions.canEnterData) setView('entry');
      else if (loggedInUser.permissions.canQueryData) setView('query');
      else if (loggedInUser.permissions.canViewStats) setView('stats');
      else if (loggedInUser.permissions.canViewUnpaid) setView('unpaid');
      else if (loggedInUser.role === 'admin') setView('users');
    }
  }, [loggedInUser]);

  // Effect to handle clicks outside the user menu to close it
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
              setIsUserMenuOpen(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
          document.removeEventListener("mousedown", handleClickOutside);
      };
  }, [userMenuRef]);


  const handleLogin = (username: string, password_raw: string): boolean => {
    const passwordHash = hashPassword(password_raw);
    const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
    if (user) {
      setLoggedInUser(user);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setLoggedInUser(null);
  };

  const departments = useMemo(() => {
    const departmentSet = new Set(records.map(record => record.departmentName));
    return Array.from(departmentSet);
  }, [records]);

  const handleAddRecord = useCallback((newRecord: RetirementRecord) => {
    setRecords(prevRecords => {
      const filteredRecords = prevRecords.filter(record => record.id !== newRecord.id);
      return [...filteredRecords, newRecord];
    });
  }, [setRecords]);

  const handleUpdateRecord = useCallback((updatedRecord: RetirementRecord) => {
    setRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
  }, [setRecords]);

  const handleDeleteRecord = useCallback((recordId: string) => {
    setRecords(prevRecords => prevRecords.filter(record => record.id !== recordId));
  }, [setRecords]);
  
  // User Management Handlers
  const handleAddUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: crypto.randomUUID() };
    setUsers(prev => [...prev, newUser]);
  };
  const handleUpdateUser = (updatedUser: User) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
  };


  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-gray-200 font-sans flex flex-col">
      <main className="flex-grow p-4 sm:p-6 lg:p-8 w-full relative">
        <div ref={userMenuRef} className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 no-print">
            <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 bg-slate-800 hover:bg-slate-700/80 p-1.5 pr-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500"
            >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-white text-lg ring-1 ring-slate-600">
                    {loggedInUser.name.charAt(0)}
                </div>
                <span className="hidden sm:inline font-semibold text-gray-200">{loggedInUser.name}</span>
                <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {isUserMenuOpen && (
                <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 animate-fade-in-down">
                    <button
                        onClick={handleLogout}
                        className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-3 transition-colors"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            )}
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-amber-300 mb-2 font-kufam no-print">
          ارشفة التوقيفات التقاعدية
        </h1>
        <p className="text-center text-gray-400 mb-8 no-print">
          إدارة وإدخال وبحث بيانات الدوائر والمؤسسات بسهولة.
        </p>

        <div className="no-print">
          <Header activeView={view} setActiveView={setView} permissions={loggedInUser.permissions} role={loggedInUser.role} />
        </div>
        
        <div className="mt-8 max-w-7xl mx-auto w-full">
          {view === 'entry' && loggedInUser.permissions.canEnterData && <DataEntryForm 
              onAddRecord={handleAddRecord} 
              departments={departments}
              records={records}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
            />}
          {view === 'query' && loggedInUser.permissions.canQueryData && <ArchiveSearch records={records} onUpdateRecord={handleUpdateRecord} onDeleteRecord={handleDeleteRecord} canEditDelete={loggedInUser.permissions.canEditDelete} />}
          {view === 'stats' && loggedInUser.permissions.canViewStats && <Statistics records={records} />}
          {view === 'unpaid' && loggedInUser.permissions.canViewUnpaid && <UnpaidDepartments records={records} />}
          {view === 'users' && loggedInUser.role === 'admin' && <UserManagement users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} currentUser={loggedInUser} />}
        </div>
      </main>
      <footer className="text-center py-4 no-print bg-slate-900">
          <p className="text-sm text-amber-300 hover:text-amber-200 transition-colors font-cairo font-bold">
              <i className="fas fa-code ml-2"></i>
              تصميم المبرمج سيف علي
          </p>
      </footer>
    </div>
  );
}

export default App;