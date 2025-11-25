

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { RetirementRecord, Attachment } from '../types';
import { ministryDepartments, getFundingType } from './DataEntryForm';

interface ArchiveSearchProps {
  records: RetirementRecord[];
  onUpdateRecord: (record: RetirementRecord) => void;
  onDeleteRecord: (id: string) => void;
  canEditDelete: boolean;
}

type SearchResult = RetirementRecord & { status: 'paid' | 'unpaid' };

// Helper functions copied from DataEntryForm
const formatCurrency = (value: number | string): string => {
  if (value === null || value === undefined || value === '' || Number(value) === 0) return '0';
  const num = Number(String(value).replace(/,/g, ''));
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('ar-IQ').format(num);
};
const parseCurrency = (value: string): number | '' => {
    if (typeof value !== 'string' || value === '') return '';
    const westernNumerals = value.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => String.fromCharCode(d.charCodeAt(0) - 1584));
    const digitsOnly = westernNumerals.replace(/\D/g, '');
    if (digitsOnly === '') return '';
    const num = Number(digitsOnly);
    return isNaN(num) ? '' : num;
};
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};

const ArchiveSearch: React.FC<ArchiveSearchProps> = ({ records, onUpdateRecord, onDeleteRecord, canEditDelete }) => {
  const [ministryFilter, setMinistryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [monthFilter, setMonthFilter] = useState<number | ''>('');
  const [fundingTypeFilter, setFundingTypeFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  const [editingRecord, setEditingRecord] = useState<RetirementRecord | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<RetirementRecord>>({});
  const [formattedSalaries, setFormattedSalaries] = useState('');
  const [newAttachments, setNewAttachments] = useState<File[]>([]);


  const ministriesList = useMemo(() => Object.keys(ministryDepartments).sort((a,b) => a.localeCompare(b, 'ar')), []);


  const allDepartmentsWithFunding = useMemo(() => {
    return Object.entries(ministryDepartments).flatMap(([ministry, departments]) =>
      departments.map(dept => ({
        ministry,
        departmentName: dept.name,
        fundingType: getFundingType(ministry, dept.name)
      }))
    );
  }, []);

 const handleSearch = useCallback(() => {
    let departmentsToCheck = allDepartmentsWithFunding;

    if (ministryFilter) {
      departmentsToCheck = departmentsToCheck.filter(d => d.ministry === ministryFilter);
    }
    if (departmentFilter) {
      departmentsToCheck = departmentsToCheck.filter(d => d.departmentName === departmentFilter);
    }
    if (fundingTypeFilter) {
      departmentsToCheck = departmentsToCheck.filter(d => d.fundingType === fundingTypeFilter);
    }

    const reportYears = new Set(records.map(r => r.year));
    for (let y = 2020; y <= 2028; y++) reportYears.add(y);
    const minYear = Math.min(...Array.from(reportYears).map(Number));
    const maxYear = Math.max(...Array.from(reportYears).map(Number));

    const yearsToScan = yearFilter ? [yearFilter] : Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const monthsToScan = monthFilter ? [monthFilter] : Array.from({ length: 12 }, (_, i) => i + 1);

    let finalReport: SearchResult[] = [];

    for (const year of yearsToScan) {
      for (const month of monthsToScan) {
        for (const dept of departmentsToCheck) {
          const record = records.find(r => 
            r.year === year && 
            r.month === month && 
            r.departmentName === dept.departmentName && 
            r.ministry === dept.ministry
          );

          if (record) {
            finalReport.push({ ...record, status: 'paid' as const });
          } else {
            finalReport.push({
              id: `${dept.ministry}-${dept.departmentName}-${year}-${month}-unpaid`,
              ministry: dept.ministry,
              departmentName: dept.departmentName,
              fundingType: dept.fundingType,
              year: year,
              month: month,
              totalSalaries: 0, employeeCount: 0, deduction10: 0, deduction15: 0, deduction25: 0,
              attachments: [],
              submittedAt: '',
              status: 'unpaid' as const,
            });
          }
        }
      }
    }

    if (paymentStatusFilter === 'paid') {
      finalReport = finalReport.filter(r => r.status === 'paid');
    } else if (paymentStatusFilter === 'unpaid') {
      finalReport = finalReport.filter(r => r.status === 'unpaid');
    }
    
    setDisplayedResults(finalReport.sort((a,b) => a.year - b.year || a.month - b.month || a.departmentName.localeCompare(b.departmentName, 'ar')));
    setSearchPerformed(true);

  }, [records, allDepartmentsWithFunding, ministryFilter, departmentFilter, yearFilter, monthFilter, fundingTypeFilter, paymentStatusFilter]);

  const years = Array.from({ length: 2028 - 2020 + 1 }, (_, i) => 2028 - i);
  const months = useMemo(() => [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ], []);

  const formatCurrencyForDisplay = (value: number) => (value === 0 ? '-' : new Intl.NumberFormat('ar-IQ').format(value));

  const clearFilters = () => {
    setMinistryFilter('');
    setDepartmentFilter('');
    setYearFilter('');
    setMonthFilter('');
    setFundingTypeFilter('');
    setPaymentStatusFilter('all');
    setDisplayedResults([]);
    setSearchPerformed(false);
  };
  
  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (displayedResults.length === 0) {
      alert('لا توجد بيانات لتصديرها.');
      return;
    }

    const headers = [
      'السنة', 'الشهر', 'الوزارة', 'اسم الدائرة', 'نوع التمويل', 'حالة التسديد', 
      'عدد الموظفين', 'مجموع الرواتب الاسمية', 'نسبة ال10%', 'نسبة ال15%', 'نسبة ال25%', 'المرفقات'
    ];

    const rows = displayedResults.map(record => [
      record.year,
      months.find(m => m.value === record.month)?.name || record.month,
      `"${record.ministry.replace(/"/g, '""')}"`,
      `"${record.departmentName.replace(/"/g, '""')}"`,
      record.fundingType || '-',
      record.status === 'paid' ? 'مسدد' : 'غير مسدد',
      record.employeeCount,
      record.totalSalaries,
      record.deduction10,
      record.deduction15,
      record.deduction25,
      `"${record.attachments?.map(a => a.name).join('; ') || ''}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const today = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute('download', `report_${today}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };


  const totals = useMemo(() => {
    return displayedResults.reduce((acc, record) => {
        if (record.status === 'paid') {
            acc.totalSalaries += record.totalSalaries;
            acc.employeeCount += record.employeeCount;
            acc.deduction10 += record.deduction10;
            acc.deduction15 += record.deduction15;
            acc.deduction25 += record.deduction25;
        }
        return acc;
    }, { totalSalaries: 0, employeeCount: 0, deduction10: 0, deduction15: 0, deduction25: 0 });
  }, [displayedResults]);

  const handleEditClick = (record: RetirementRecord) => {
    setEditingRecord(record);
    setEditFormData({
      totalSalaries: record.totalSalaries,
      employeeCount: record.employeeCount,
    });
    setFormattedSalaries(formatCurrency(record.totalSalaries));
    setNewAttachments([]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.')) {
        onDeleteRecord(id);
        setDisplayedResults(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleUpdateSave = async () => {
    if (!editingRecord) return;

    const attachmentData: Attachment[] = [];
    if (newAttachments.length > 0) {
        for (const file of newAttachments) {
            attachmentData.push({
                name: file.name,
                type: file.type,
                data: await fileToBase64(file),
            });
        }
    }

    const updatedRecord: RetirementRecord = {
        ...editingRecord,
        totalSalaries: editFormData.totalSalaries ?? editingRecord.totalSalaries,
        employeeCount: editFormData.employeeCount ?? editingRecord.employeeCount,
        deduction10: editFormData.deduction10 ?? editingRecord.deduction10,
        deduction15: editFormData.deduction15 ?? editingRecord.deduction15,
        deduction25: editFormData.deduction25 ?? editingRecord.deduction25,
        attachments: newAttachments.length > 0 ? attachmentData : editingRecord.attachments,
        submittedAt: new Date().toISOString(), // Update timestamp on edit
    };
    onUpdateRecord(updatedRecord);
    setDisplayedResults(prev => prev.map(r => r.id === updatedRecord.id ? { ...updatedRecord, status: 'paid' } : r));
    setEditingRecord(null);
  };
  
  useEffect(() => {
    if (editingRecord) {
        const salaries = typeof editFormData.totalSalaries === 'number' ? editFormData.totalSalaries : 0;
        setEditFormData(prev => ({
            ...prev,
            deduction10: Math.round(salaries * 0.10),
            deduction15: Math.round(salaries * 0.15),
            deduction25: Math.round(salaries * 0.25),
        }))
    }
  }, [editFormData.totalSalaries, editingRecord]);

  const handleSalariesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = parseCurrency(e.target.value);
    setEditFormData(prev => ({ ...prev, totalSalaries: numericValue === '' ? 0 : numericValue }));
    setFormattedSalaries(numericValue === '' ? '' : formatCurrency(numericValue));
  };

  const inputClasses = "w-full p-3 bg-slate-600 text-white border border-slate-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-slate-500 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  
  const showYearColumn = !yearFilter;
  const showMonthColumn = !monthFilter;
  
  const baseCols = 11 - (showYearColumn ? 0 : 1) - (showMonthColumn ? 0 : 1);
  const totalTableColumns = baseCols + (canEditDelete ? 1 : 0);
  const footerTextColSpan = totalTableColumns - 5 - (canEditDelete ? 1 : 0);


  const getFilterSummary = () => {
    const filters = [
      yearFilter && `السنة: ${yearFilter}`,
      monthFilter && `الشهر: ${months.find(m => m.value === monthFilter)?.name}`,
      ministryFilter && `الوزارة: ${ministryFilter}`,
      departmentFilter && `الدائرة: ${departmentFilter}`,
      fundingTypeFilter && `التمويل: ${fundingTypeFilter}`,
      paymentStatusFilter !== 'all' && `الحالة: ${paymentStatusFilter === 'paid' ? 'مسدد' : 'غير مسدد'}`
    ].filter(Boolean);
    
    return filters.length > 0 ? filters.join(' | ') : 'كافة السجلات';
  };

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
       <div className="no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-700 rounded-lg items-end">
          <div>
            <label htmlFor="yearFilter" className={labelClasses}>السنة</label>
            <select id="yearFilter" value={yearFilter} onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : '')} className={inputClasses}>
              <option value="">-- كل السنوات --</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="monthFilter" className={labelClasses}>الشهر</label>
            <select id="monthFilter" value={monthFilter} onChange={(e) => setMonthFilter(e.target.value ? Number(e.target.value) : '')} className={inputClasses}>
              <option value="">-- كل الشهور --</option>
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="paymentStatusFilter" className={labelClasses}>حالة التسديد</label>
            <select id="paymentStatusFilter" value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value as any)} className={inputClasses}>
              <option value="all">الكل</option>
              <option value="paid">مسدد فقط</option>
              <option value="unpaid">غير مسدد فقط</option>
            </select>
          </div>
          <div>
            <label htmlFor="ministryFilter" className={labelClasses}>الوزارة</label>
            <select id="ministryFilter" value={ministryFilter} onChange={(e) => { setMinistryFilter(e.target.value); setDepartmentFilter(''); }} className={inputClasses}>
              <option value="">كل الوزارات</option>
              {ministriesList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="departmentFilter" className={labelClasses}>الدائرة</label>
             <select id="departmentFilter" value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className={inputClasses} disabled={!ministryFilter}>
                <option value="">كل الدوائر</option>
                {ministryFilter && ministryDepartments[ministryFilter] &&
                  ministryDepartments[ministryFilter].map(dep => <option key={dep.name} value={dep.name}>{dep.name}</option>)}
              </select>
          </div>
          <div>
            <label htmlFor="fundingTypeFilter" className={labelClasses}>نوع التمويل</label>
            <select id="fundingTypeFilter" value={fundingTypeFilter} onChange={(e) => setFundingTypeFilter(e.target.value)} className={inputClasses}>
              <option value="">الكل</option>
              <option value="مركزي">مركزي</option>
              <option value="ذاتي">ذاتي</option>
            </select>
          </div>
          <div className="lg:col-span-3 flex flex-col sm:flex-row gap-2">
            <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              <i className="fas fa-search ml-2"></i>تطبيق الفلاتر وعرض التقرير
            </button>
            <button onClick={clearFilters} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              <i className="fas fa-eraser ml-2"></i>مسح وإعادة تعيين
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handlePrint} disabled={!searchPerformed || displayedResults.length === 0} className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed">
            <i className="fas fa-print ml-2"></i>طباعة التقرير
          </button>
          <button onClick={handleExport} disabled={!searchPerformed || displayedResults.length === 0} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <i className="fas fa-file-csv ml-2"></i>تصدير كملف CSV
          </button>
        </div>
      </div>
      
       <div>
         {/* Show instruction when no search performed */}
         {!searchPerformed && (
            <div className="p-8 text-center text-gray-400 no-print">
                <i className="fas fa-info-circle text-4xl mb-4"></i>
                <p>يرجى تحديد معايير البحث والضغط على زر 'تطبيق الفلاتر' لعرض النتائج.</p>
            </div>
         )}

         {/* Results Section - visible when searchPerformed */}
         {searchPerformed && (
           <div className="printable-section mt-4 print-portrait">
             {/* Official Header: Hidden on screen, visible on print */}
             <div className="official-header hidden print:flex">
                 <div className="header-side">
                     جمهورية العراق<br/>
                     وزارة المالية<br/>
                     هيئة التقاعد الوطنية - فرع البصرة
                 </div>
                 <div className="header-center">
                     <img src="logo.png" alt="الشعار" className="header-logo-img" />
                     <h1>تقرير التوقيفات التقاعدية</h1>
                     <p>{getFilterSummary()}</p>
                 </div>
                 <div className="header-side print-text-left">
                     التاريخ: {new Date().toLocaleDateString('ar-IQ')}<br/>
                     العدد: ............
                 </div>
             </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-center text-gray-200">
                <thead>
                  <tr className="bg-slate-700 text-gray-300">
                    {showYearColumn && <th scope="col" className="p-2">السنة</th>}
                    {showMonthColumn && <th scope="col" className="p-2">الشهر</th>}
                    <th scope="col" className="p-2">الوزارة</th>
                    <th scope="col" className="p-2">اسم الدائرة</th>
                    <th scope="col" className="p-2">التمويل</th>
                    <th scope="col" className="p-2">الحالة</th>
                    <th scope="col" className="p-2">المرفقات</th>
                    <th scope="col" className="p-2">الموظفين</th>
                    <th scope="col" className="p-2">الرواتب الاسمية</th>
                    <th scope="col" className="p-2">10%</th>
                    <th scope="col" className="p-2">15%</th>
                    <th scope="col" className="p-2">25%</th>
                    {canEditDelete && <th scope="col" className="no-print p-2">الإجراءات</th>}
                  </tr>
                </thead>
                <tbody>
                  {displayedResults.length > 0 ? (
                    displayedResults.map(record => (
                      <tr key={record.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                        {showYearColumn && <td className="p-2">{record.year}</td>}
                        {showMonthColumn && <td className="whitespace-nowrap p-2">{months.find(m => m.value === record.month)?.name}</td>}
                        <td className="p-2">{record.ministry}</td>
                        <td className="font-bold p-2">{record.departmentName}</td>
                        <td className="p-2">{record.fundingType || '-'}</td>
                        <td className="p-2">
                          <span className={`no-print px-2 py-1 rounded-full text-xs ${record.status === 'paid' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                             {record.status === 'paid' ? 'مسدد' : 'غير مسدد'}
                          </span>
                          <span className="print-inline-text hidden force-print-inline">
                            {record.status === 'paid' ? 'مسدد' : 'غير مسدد'}
                          </span>
                        </td>
                        <td className="p-2">
                          {record.attachments && record.attachments.length > 0 ? (
                             <span className="text-xs">مرفق ({record.attachments.length})</span>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="p-2">{record.employeeCount || '-'}</td>
                        <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(record.totalSalaries)}</td>
                        <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(record.deduction10)}</td>
                        <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(record.deduction15)}</td>
                        <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(record.deduction25)}</td>
                        {canEditDelete && (
                            <td className="no-print p-2">
                                {record.status === 'paid' && (
                                    <div className="flex justify-center gap-2">
                                        <button onClick={() => handleEditClick(record)} className="text-blue-400 hover:text-blue-300"><i className="fas fa-pencil-alt"></i></button>
                                        <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-300"><i className="fas fa-trash-alt"></i></button>
                                    </div>
                                )}
                            </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={totalTableColumns} className="p-4 text-center text-gray-500">
                        لا توجد سجلات مطابقة.
                      </td>
                    </tr>
                  )}
                </tbody>
                {displayedResults.length > 0 && totals.employeeCount > 0 && (
                  <tfoot>
                      <tr className="bg-slate-700 font-bold">
                          <td colSpan={footerTextColSpan} className="text-right p-2">المجموع الكلي (للمسدد فقط)</td>
                          <td className="p-2">{totals.employeeCount}</td>
                          <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(totals.totalSalaries)}</td>
                          <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(totals.deduction10)}</td>
                          <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(totals.deduction15)}</td>
                          <td className="whitespace-nowrap p-2">{formatCurrencyForDisplay(totals.deduction25)}</td>
                          {canEditDelete && <td className="no-print p-2"></td>}
                      </tr>
                  </tfoot>
                )}
              </table>
            </div>
              
              <div className="print-footer hidden print:flex">
                  <span>نظام أرشفة التوقيفات التقاعدية</span>
                  <span>تاريخ الطباعة: {new Date().toLocaleString('ar-IQ')}</span>
              </div>
            </div>
          )}
          </div>

      {editingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">تعديل سجل: {editingRecord.departmentName}</h3>
              <button onClick={() => setEditingRecord(null)} className="text-gray-400 hover:text-white transition-colors duration-200" aria-label="إغلاق">
                <i className="fas fa-times text-2xl"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
               {/* Read-only info */}
               <div className='grid grid-cols-2 gap-4 text-sm'>
                  <p className='text-gray-400 bg-slate-700 p-2 rounded'><strong>الوزارة:</strong> {editingRecord.ministry}</p>
                  <p className='text-gray-400 bg-slate-700 p-2 rounded'><strong>الدائرة:</strong> {editingRecord.departmentName}</p>
                  <p className='text-gray-400 bg-slate-700 p-2 rounded'><strong>السنة:</strong> {editingRecord.year}</p>
                  <p className='text-gray-400 bg-slate-700 p-2 rounded'><strong>الشهر:</strong> {months.find(m => m.value === editingRecord.month)?.name}</p>
               </div>
               
               {/* Editable fields */}
               <div>
                  <label htmlFor="editTotalSalaries" className={labelClasses}>مجموع الرواتب الاسمية</label>
                  <input type="text" inputMode="numeric" id="editTotalSalaries" value={formattedSalaries} onChange={handleSalariesChange} className={`${inputClasses} bg-slate-700 text-white`} />
               </div>
               <div>
                  <label htmlFor="editEmployeeCount" className={labelClasses}>عدد الموظفين</label>
                  <input type="number" id="editEmployeeCount" value={editFormData.employeeCount} onChange={e => setEditFormData(prev => ({...prev, employeeCount: Number(e.target.value)}))} className={`${inputClasses} bg-slate-700 text-white`} />
               </div>

               {/* Calculated deductions */}
               <div className='grid grid-cols-3 gap-4'>
                    <div>
                        <label className={labelClasses}>توقيفات 10%</label>
                        <input type="text" value={formatCurrency(editFormData.deduction10 || 0)} className={`${inputClasses} bg-slate-600 cursor-not-allowed`} readOnly />
                    </div>
                    <div>
                        <label className={labelClasses}>توقيفات 15%</label>
                        <input type="text" value={formatCurrency(editFormData.deduction15 || 0)} className={`${inputClasses} bg-slate-600 cursor-not-allowed`} readOnly />
                    </div>
                    <div>
                        <label className={labelClasses}>توقيفات 25%</label>
                        <input type="text" value={formatCurrency(editFormData.deduction25 || 0)} className={`${inputClasses} bg-slate-600 cursor-not-allowed`} readOnly />
                    </div>
               </div>

               {/* Attachments */}
               <div>
                <label className={labelClasses}>المرفقات</label>
                <div className="text-xs text-gray-400 bg-slate-700 p-2 rounded mb-2">
                    <strong>المرفقات الحالية: </strong>
                    {editingRecord.attachments && editingRecord.attachments.length > 0 ? editingRecord.attachments.map(a => a.name).join(', ') : 'لا يوجد'}
                </div>
                 <input type="file" id="editAttachments" multiple accept="image/*,application/pdf" onChange={e => e.target.files && setNewAttachments(Array.from(e.target.files))} 
                    className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-600 file:text-white hover:file:bg-slate-500"/>
                 <p className="text-xs text-gray-500 mt-1">اختيار ملفات جديدة سيؤدي إلى استبدال جميع المرفقات القديمة.</p>
               </div>
            </div>
            <div className="flex justify-end items-center p-4 border-t border-slate-700 gap-2">
                <button onClick={() => setEditingRecord(null)} className="py-2 px-4 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors">إلغاء</button>
                <button onClick={handleUpdateSave} className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <i className="fas fa-save ml-2"></i>حفظ التغييرات
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveSearch;