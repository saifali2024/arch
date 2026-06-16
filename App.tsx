import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { RetirementRecord, User } from './types';
import Header from './components/Header';
import DataEntryForm from './components/DataEntryForm';
import ArchiveSearch from './components/ArchiveSearch';
import Statistics from './components/Statistics';
import UnpaidDepartments from './components/UnpaidDepartments';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import Classification from './components/Classification';
import programmerLogo from './src/programmer_logo.png';
import institutionalLogo from './src/32.png';

import { collection, onSnapshot, doc, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';

export type View = 'entry' | 'query' | 'stats' | 'unpaid' | 'users' | 'classification';

const LOGO_PATHS = [
  programmerLogo,
  '/programmer_logo.png',
  '/programmer_logo.jpg',
  '/programmer_logo.jpeg',
  '/src/assets/images/programmer_logo.png',
  '/src/assets/images/programmer_logo.jpg',
  '/src/assets/images/programmer_logo.jpeg'
];

// Simple "hashing" for demonstration. Replace with a real crypto library in production.
const hashPassword = (password: string) => btoa(password);

const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

function App() {
  const [view, setView] = useState<View>('entry');
  const [records, setRecords] = useState<RetirementRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [logoIndex, setLogoIndex] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Test connection to Firestore
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync /records collection in real-time
  useEffect(() => {
    const recordsCol = collection(db, 'records');
    const unsubscribe = onSnapshot(recordsCol, (snapshot) => {
      const dbRecords: RetirementRecord[] = [];
      snapshot.forEach((doc) => {
        dbRecords.push(doc.data() as RetirementRecord);
      });
      setRecords(dbRecords);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'records');
    });

    return () => unsubscribe();
  }, []);

  // Sync /users collection in real-time
  useEffect(() => {
    const usersCol = collection(db, 'users');
    const unsubscribe = onSnapshot(usersCol, (snapshot) => {
      const dbUsers: User[] = [];
      snapshot.forEach((doc) => {
        dbUsers.push(doc.data() as User);
      });
      setUsers(dbUsers);
      setUsersLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'users');
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Create a default admin user if no users exist
    if (usersLoaded && users.length === 0) {
      const adminId = 'default_admin';
      const adminUser: User = {
        id: adminId,
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
          canViewClassification: true,
        },
      };
      setDoc(doc(db, 'users', adminId), adminUser).catch((err) => {
        console.error("Error creating default admin user:", err);
      });
    }
  }, [users, usersLoaded]);
  
  // Set initial view based on permissions after login
  useEffect(() => {
    if (loggedInUser) {
      if (loggedInUser.permissions.canEnterData) setView('entry');
      else if (loggedInUser.permissions.canQueryData) setView('query');
      else if (loggedInUser.permissions.canViewStats) setView('stats');
      else if (loggedInUser.permissions.canViewClassification) setView('classification');
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

  const handleAddRecord = useCallback(async (newRecord: RetirementRecord) => {
    try {
      await setDoc(doc(db, 'records', newRecord.id), newRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `records/${newRecord.id}`);
    }
  }, []);

  const handleUpdateRecord = useCallback(async (updatedRecord: RetirementRecord) => {
    try {
      await setDoc(doc(db, 'records', updatedRecord.id), updatedRecord);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `records/${updatedRecord.id}`);
    }
  }, []);

  const handleDeleteRecord = useCallback(async (recordId: string) => {
    try {
      await deleteDoc(doc(db, 'records', recordId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `records/${recordId}`);
    }
  }, []);
  
  // User Management Handlers
  const handleAddUser = async (user: Omit<User, 'id'>) => {
    const newId = generateId();
    const newUser = { ...user, id: newId };
    try {
      await setDoc(doc(db, 'users', newId), newUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${newId}`);
    }
  };
  const handleUpdateUser = async (updatedUser: User) => {
    try {
      await setDoc(doc(db, 'users', updatedUser.id), updatedUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  };
  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };


  if (!loggedInUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="bg-slate-900 min-h-screen text-gray-200 font-sans flex flex-col">
      <main className="flex-grow p-4 sm:p-6 lg:p-8 w-full">
        <div className="sticky top-0 z-10 bg-slate-900 py-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 shadow-md no-print relative">
            {/* الجهة العليا اليمنى: معلومات الدائرة الرسمية */}
            <div className="absolute top-2 right-4 sm:right-6 flex flex-col text-center items-center z-20">
                <span className="text-xs sm:text-sm font-bold text-white font-kufam">وزارة المالية</span>
                <span className="text-[9px] sm:text-xs text-white font-semibold font-kufam">صندوق تقاعد موظفي الدولة / فرع البصرة</span>
            </div>

            {/* الجهة العليا اليسرى: قائمة المستخدم */}
            <div ref={userMenuRef} className="absolute top-2 left-4 sm:left-6 z-20 no-print">
                <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-amber-500"
                >
                    <i className="fas fa-user-circle text-2xl text-amber-400"></i>
                    <span className="hidden sm:inline font-semibold text-amber-400">{loggedInUser.name}</span>
                    <i className={`fas fa-chevron-down text-xs text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}></i>
                </button>
                {isUserMenuOpen && (
                    <div className="absolute right-0 sm:right-auto sm:left-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg py-1 animate-fade-in-down">
                        {loggedInUser.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setView('users');
                                    setIsUserMenuOpen(false);
                                }}
                                className={`w-full text-right px-4 py-2 text-sm flex items-center gap-3 transition-colors ${
                                    view === 'users'
                                        ? 'bg-amber-600 text-white font-bold'
                                        : 'text-amber-400 hover:bg-slate-700 hover:text-amber-300'
                                }`}
                            >
                                <i className="fas fa-users-cog"></i>
                                <span>إدارة المستخدمين</span>
                            </button>
                        )}
                        <button
                            onClick={handleLogout}
                            className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 flex items-center gap-3 transition-colors border-t border-slate-700"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span>تسجيل الخروج</span>
                        </button>
                    </div>
                )}
            </div>
            
            {/* الشعار الرسمي للدائرة */}
            <div className="flex justify-center mb-4">
                <img 
                    src={institutionalLogo} 
                    alt="الشعار الرسمي" 
                    referrerPolicy="no-referrer"
                    className="h-28 w-auto object-contain max-w-[200px]"
                />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-center text-amber-300 mb-1 font-kufam">
            ارشفة التوقيفات التقاعدية
            </h1>
            <p className="text-center text-gray-400 mb-3 text-sm">
            إدارة وإدخال وبحث بيانات الدوائر والمؤسسات بسهولة.
            </p>
            <div>
              <Header activeView={view} setActiveView={setView} permissions={loggedInUser.permissions} role={loggedInUser.role} />
            </div>
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
          {view === 'classification' && loggedInUser.permissions.canViewClassification && <Classification records={records} />}
          {view === 'unpaid' && loggedInUser.permissions.canViewUnpaid && <UnpaidDepartments records={records} />}
          {view === 'users' && loggedInUser.role === 'admin' && <UserManagement users={users} onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} currentUser={loggedInUser} />}
        </div>
      </main>
      <footer className="text-center py-6 no-print bg-slate-900 flex flex-col items-center justify-center gap-2 border-t border-slate-850">
          {/* شعار المبرمج الذهبي الاحترافي */}
          <div className="flex flex-col items-center mb-1">
              {logoIndex < LOGO_PATHS.length ? (
                  <img 
                      src={LOGO_PATHS[logoIndex]} 
                      alt="شعار المبرمج سيف علي" 
                      referrerPolicy="no-referrer"
                      className="h-24 w-auto object-contain mb-2 transition-transform duration-300 hover:scale-110 rounded-lg"
                      onError={() => {
                          setLogoIndex(prev => prev + 1);
                      }}
                  />
              ) : (
                  <div 
                      className="flex flex-col items-center justify-center p-2 rounded-full bg-slate-800 border border-slate-700 w-12 h-12 mb-1 text-amber-400 hover:text-amber-300 transition-colors"
                      title="مساحة شعار المبرمج"
                  >
                      <i className="fas fa-laptop-code text-lg"></i>
                  </div>
              )}
          </div>
          <p className="text-sm text-amber-300 hover:text-amber-200 transition-colors font-cairo font-bold flex items-center justify-center gap-1">
              <i className="fas fa-code ml-1"></i>
              تصميم المبرمج سيف علي
          </p>
      </footer>
    </div>
  );
}

export default App;