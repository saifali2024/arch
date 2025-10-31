import React, { useState, useMemo, useCallback } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments, ministriesWithCentralFunding, ministriesWithSelfFunding } from './DataEntryForm';

interface ArchiveSearchProps {
  records: RetirementRecord[];
}

type SearchResult = Omit<RetirementRecord, 'id'> & { id: string; status: 'paid' | 'unpaid' };

const ArchiveSearch: React.FC<ArchiveSearchProps> = ({ records }) => {
  const [ministryFilter, setMinistryFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [yearFilter, setYearFilter] = useState<number | ''>('');
  const [monthFilter, setMonthFilter] = useState<number | ''>('');
  const [fundingTypeFilter, setFundingTypeFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  const [displayedResults, setDisplayedResults] = useState<SearchResult[]>([]);
  const [searchPerformed, setSearchPerformed] = useState(false);


  const ministriesList = useMemo(() => Object.keys(ministryDepartments).sort((a,b) => a.localeCompare(b, 'ar')), []);


  const allDepartmentsWithFunding = useMemo(() => {
    return Object.entries(ministryDepartments).flatMap(([ministry, departments]) =>
      departments.map(dept => {
        let fundingType = '';
        if (dept.name === 'شبكة الحماية الاجتماعية في البصرة') {
          fundingType = 'مركزي';
        } else if (dept.name === 'دائرة التقاعد والضمان الاجتماعي البصرة') {
          fundingType = 'ذاتي';
        } else if (ministriesWithCentralFunding.includes(ministry)) {
          fundingType = 'مركزي';
        } else if (ministriesWithSelfFunding.includes(ministry)) {
          fundingType = 'ذاتي';
        }
        return { ministry, departmentName: dept.name, fundingType };
      })
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

  const formatCurrency = (value: number) => (value === 0 ? '-' : new Intl.NumberFormat('ar-IQ').format(value));

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
      'عدد الموظفين', 'مجموع الرواتب الاسمية', 'نسبة ال10%', 'نسبة ال15%', 'نسبة ال25%'
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
      record.deduction25
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

  const inputClasses = "w-full p-3 bg-white text-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-400 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  
  const showYearColumn = !yearFilter;
  const showMonthColumn = !monthFilter;

  const colSpan = 7 + (showYearColumn ? 1 : 0) + (showMonthColumn ? 1 : 0);
  const footerTextColSpan = 2 + (showYearColumn ? 1 : 0) + (showMonthColumn ? 1 : 0);

  const getFilterSummary = () => {
    const filters = [
      yearFilter && `السنة: ${yearFilter}`,
      monthFilter && `الشهر: ${months.find(m => m.value === monthFilter)?.name}`,
      ministryFilter && `الوزارة: ${ministryFilter}`,
      departmentFilter && `الدائرة: ${departmentFilter}`,
      fundingTypeFilter && `نوع التمويل: ${fundingTypeFilter}`,
      paymentStatusFilter !== 'all' && `حالة التسديد: ${paymentStatusFilter === 'paid' ? 'مسدد' : 'غير مسدد'}`
    ].filter(Boolean);
    
    return filters.length > 0 ? filters.join(' | ') : 'جميع السجلات';
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
       <div className="no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700 rounded-lg items-end">
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
            <button onClick={clearFilters} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              <i className="fas fa-eraser ml-2"></i>مسح وإعادة تعيين
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button onClick={handlePrint} disabled={!searchPerformed || displayedResults.length === 0} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <i className="fas fa-print ml-2"></i>طباعة التقرير
          </button>
          <button onClick={handleExport} disabled={!searchPerformed || displayedResults.length === 0} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <i className="fas fa-file-csv ml-2"></i>تصدير كملف CSV
          </button>
        </div>
      </div>
      
       <div className="printable-section">
          <div className="mt-6 overflow-x-auto bg-gray-900 rounded-lg print-bg-white">
            <div className="print-header">
                <h1 className="font-pt-sans">تقرير التوقيفات التقاعدية</h1>
                <p className="subtitle font-pt-sans">
                    {getFilterSummary()}
                </p>
            </div>
            {!searchPerformed ? (
                <div className="p-8 text-center text-gray-400 no-print">
                    <i className="fas fa-info-circle text-4xl mb-4"></i>
                    <p>يرجى تحديد معايير البحث والضغط على زر 'تطبيق الفلاتر' لعرض النتائج.</p>
                </div>
            ) : (
              <table className="min-w-full text-sm text-center text-gray-300">
                <thead className="bg-gray-700 text-xs text-gray-200 uppercase tracking-wider">
                  <tr>
                    {showYearColumn && <th scope="col" className="p-3">السنة</th>}
                    {showMonthColumn && <th scope="col" className="p-3">الشهر</th>}
                    <th scope="col" className="p-3">الوزارة</th>
                    <th scope="col" className="p-3">اسم الدائرة</th>
                    <th scope="col" className="p-3">نوع التمويل</th>
                    <th scope="col" className="p-3">حالة التسديد</th>
                    <th scope="col" className="p-3">عدد الموظفين</th>
                    <th scope="col" className="p-3">مجموع الرواتب الاسمية</th>
                    <th scope="col" className="p-3">10%</th>
                    <th scope="col" className="p-3">15%</th>
                    <th scope="col" className="p-3">25%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {displayedResults.length > 0 ? (
                    displayedResults.map(record => (
                      <tr key={record.id} className="hover:bg-gray-800">
                        {showYearColumn && <td className="p-3">{record.year}</td>}
                        {showMonthColumn && <td className="p-3 whitespace-nowrap">{months.find(m => m.value === record.month)?.name}</td>}
                        <td className="p-3">{record.ministry}</td>
                        <td className="p-3 font-medium text-white">{record.departmentName}</td>
                        <td className="p-3">{record.fundingType || '-'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 font-semibold leading-tight rounded-full ${record.status === 'paid' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                            {record.status === 'paid' ? 'مسدد' : 'غير مسدد'}
                          </span>
                        </td>
                        <td className="p-3">{record.employeeCount || '-'}</td>
                        <td className="p-3 whitespace-nowrap">{formatCurrency(record.totalSalaries)}</td>
                        <td className="p-3 whitespace-nowrap">{formatCurrency(record.deduction10)}</td>
                        <td className="p-3 whitespace-nowrap">{formatCurrency(record.deduction15)}</td>
                        <td className="p-3 whitespace-nowrap">{formatCurrency(record.deduction25)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={colSpan + 4} className="p-4 text-center text-gray-500">
                        لا توجد سجلات مطابقة لمعايير البحث.
                      </td>
                    </tr>
                  )}
                </tbody>
                {displayedResults.length > 0 && totals.employeeCount > 0 && (
                  <tfoot className="bg-gray-700 font-bold text-white">
                      <tr>
                          <td colSpan={footerTextColSpan} className="p-3 text-right">المجموع (للسجلات المسددة فقط)</td>
                          <td className="p-3">{totals.employeeCount}</td>
                          <td className="p-3 whitespace-nowrap">{formatCurrency(totals.totalSalaries)}</td>
                          <td className="p-3 whitespace-nowrap">{formatCurrency(totals.deduction10)}</td>
                          <td className="p-3 whitespace-nowrap">{formatCurrency(totals.deduction15)}</td>
                          <td className="p-3 whitespace-nowrap">{formatCurrency(totals.deduction25)}</td>
                      </tr>
                  </tfoot>
                )}
              </table>
            )}
          </div>
          {searchPerformed && (
           <p className="text-center text-gray-400 mt-4 no-print">
            {`تم العثور على ${displayedResults.length} نتيجة.`}
          </p>
          )}
      </div>
    </div>
  );
};

export default ArchiveSearch;