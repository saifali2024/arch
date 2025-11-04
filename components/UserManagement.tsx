import React, { useState, useEffect, FormEvent } from 'react';
import { User, Permissions } from '../types';

interface UserManagementProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const initialPermissions: Permissions = {
  canEnterData: true,
  canQueryData: true,
  canViewStats: false,
  canViewUnpaid: false,
  canEditDelete: false,
};

const hashPassword = (password: string) => btoa(password);

const UserManagement: React.FC<UserManagementProps> = ({ users, currentUser, onAddUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [permissions, setPermissions] = useState<Permissions>(initialPermissions);
  const [error, setError] = useState('');


  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setPermissions(initialPermissions);
    setError('');
    setIsModalOpen(true);
  };
  
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setPassword(''); // Don't show old password
    setPermissions(user.permissions);
    setError('');
    setIsModalOpen(true);
  };

  const handlePermissionChange = (perm: keyof Permissions) => {
    setPermissions(prev => ({...prev, [perm]: !prev[perm]}));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !username) {
        setError('الاسم الكامل واسم المستخدم مطلوبان.');
        return;
    }

    // Check for duplicate username
    const isDuplicate = users.some(u => u.username === username && u.id !== editingUser?.id);
    if(isDuplicate) {
        setError('اسم المستخدم هذا موجود بالفعل.');
        return;
    }

    if (editingUser) { // Update mode
        onUpdateUser({
            ...editingUser,
            name,
            username,
            // Only update password if a new one is provided
            passwordHash: password ? hashPassword(password) : editingUser.passwordHash,
            permissions,
        });
    } else { // Add mode
        if (!password) {
            setError('كلمة المرور مطلوبة للمستخدم الجديد.');
            return;
        }
        onAddUser({
            name,
            username,
            passwordHash: hashPassword(password),
            role: 'user',
            permissions,
        });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
        onDeleteUser(userId);
    }
  };
  
  const inputClasses = "w-full p-3 bg-slate-700 text-white border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-2";
  const checkboxLabelClasses = "flex items-center gap-3 text-white cursor-pointer select-none";
  const checkboxInputClasses = "w-5 h-5 bg-slate-600 border-slate-500 text-blue-500 rounded focus:ring-blue-500 focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800";


  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">إدارة المستخدمين</h2>
            <button onClick={openAddModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
                <i className="fas fa-user-plus ml-2"></i>إضافة مستخدم
            </button>
        </div>
        
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-center text-gray-300">
                <thead className="bg-slate-700 text-xs text-gray-200 uppercase tracking-wider">
                    <tr>
                        <th className="p-3">المستخدم</th>
                        <th className="p-3">الدور</th>
                        <th className="p-3">الصلاحيات</th>
                        <th className="p-3">الإجراءات</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-700">
                            <td className="p-3 font-medium text-white text-right">
                                <div>{user.name}</div>
                                <div className="text-xs text-gray-400">@{user.username}</div>
                            </td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs font-semibold leading-tight rounded-full ${user.role === 'admin' ? 'bg-amber-600 text-amber-100' : 'bg-blue-800 text-blue-200'}`}>
                                    {user.role === 'admin' ? 'مدير' : 'مستخدم'}
                                </span>
                            </td>
                            <td className="p-3 text-xs text-right">
                                <ul className="flex flex-wrap justify-center gap-2">
                                    {Object.entries(user.permissions).map(([perm, hasAccess]) => (
                                        hasAccess && <li key={perm} className="bg-slate-600 px-2 py-1 rounded">{perm.replace('can','')}</li>
                                    ))}
                                </ul>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                                {user.id === currentUser.id ? (
                                    <span className="text-gray-500"> (الحساب الحالي) </span>
                                ) : (
                                    <div className="flex items-center justify-center gap-4">
                                        <button onClick={() => openEditModal(user)} className="text-blue-400 hover:text-blue-300 transition-colors" title="تعديل"><i className="fas fa-edit"></i></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-400 hover:text-red-300 transition-colors" title="حذف"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">{editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white" aria-label="إغلاق"><i className="fas fa-times text-2xl"></i></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
                <div>
                    <label htmlFor="name" className={labelClasses}>الاسم الكامل</label>
                    <input id="name" type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                </div>
                <div>
                    <label htmlFor="username" className={labelClasses}>اسم المستخدم (للدخول)</label>
                    <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} className={inputClasses} required />
                </div>
                 <div>
                    <label htmlFor="password" className={labelClasses}>كلمة المرور</label>
                    <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className={inputClasses} placeholder={editingUser ? 'اتركها فارغة لعدم التغيير' : ''} required={!editingUser} />
                </div>
                <div>
                    <label className={labelClasses}>صلاحيات الوصول</label>
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-700 rounded-lg">
                        <label className={checkboxLabelClasses}>
                           <input type="checkbox" checked={permissions.canEnterData} onChange={() => handlePermissionChange('canEnterData')} className={checkboxInputClasses}/>
                           <span>إدخال البيانات</span>
                        </label>
                         <label className={checkboxLabelClasses}>
                           <input type="checkbox" checked={permissions.canQueryData} onChange={() => handlePermissionChange('canQueryData')} className={checkboxInputClasses}/>
                           <span>الاستعلام</span>
                        </label>
                         <label className={checkboxLabelClasses}>
                           <input type="checkbox" checked={permissions.canViewStats} onChange={() => handlePermissionChange('canViewStats')} className={checkboxInputClasses}/>
                           <span>الاحصائيات</span>
                        </label>
                         <label className={checkboxLabelClasses}>
                           <input type="checkbox" checked={permissions.canViewUnpaid} onChange={() => handlePermissionChange('canViewUnpaid')} className={checkboxInputClasses}/>
                           <span>الدوائر الغير مسددة</span>
                        </label>
                        <label className={`${checkboxLabelClasses} col-span-2`}>
                           <input type="checkbox" checked={permissions.canEditDelete} onChange={() => handlePermissionChange('canEditDelete')} className={checkboxInputClasses}/>
                           <span>السماح بالتعديل والحذف في واجهة الاستعلام</span>
                        </label>
                    </div>
                </div>
                {error && <p className="text-red-400 text-sm text-center bg-red-900/50 p-2 rounded">{error}</p>}
            </div>
            <div className="flex justify-end items-center p-4 border-t border-slate-700 gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-500">إلغاء</button>
                <button type="submit" className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <i className="fas fa-save ml-2"></i>
                  {editingUser ? 'حفظ التغييرات' : 'إنشاء مستخدم'}
                </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;