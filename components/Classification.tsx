
import React, { useMemo } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments } from './DataEntryForm';

interface ClassificationProps {
  records: RetirementRecord[];
}

const months = [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
];

const Classification: React.FC<ClassificationProps> = ({ records }) => {
  const classificationData = useMemo(() => {
    if (records.length === 0) {
      return null;
    }

    const latestPeriod = records.reduce((latest, record) => {
        const recordPeriod = record.year * 100 + record.month;
        return recordPeriod > latest ? recordPeriod : latest;
    }, 0);
    
    if (latestPeriod === 0) return null;

    const latestYear = Math.floor(latestPeriod / 100);
    const latestMonth = latestPeriod % 100;
    
    const paidRecords = records
      .filter(r => r.year === latestYear && r.month === latestMonth)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    const allDepartments = Object.values(ministryDepartments).flat();
    const paidDepartmentNames = new Set(paidRecords.map(r => r.departmentName));
    
    const unpaidDepartments = allDepartments
        .filter(dept => !paidDepartmentNames.has(dept.name))
        .map(dept => {
            const ministry = Object.keys(ministryDepartments).find(m => ministryDepartments[m].some(d => d.name === dept.name)) || '';
            return { departmentName: dept.name, ministry };
        });

    const unpaidByMinistry = unpaidDepartments.reduce((acc, dept) => {
        const { ministry, departmentName } = dept;
        if (!acc[ministry]) acc[ministry] = [];
        acc[ministry].push(departmentName);
        acc[ministry].sort((a, b) => a.localeCompare(b, 'ar'));
        return acc;
    }, {} as Record<string, string[]>);
    
    const sortedUnpaidMinistries = Object.keys(unpaidByMinistry).sort((a,b) => a.localeCompare(b, 'ar'));

    return {
      latestYear,
      latestMonth,
      rankedPaid: paidRecords,
      unpaid: unpaidByMinistry,
      unpaidCount: unpaidDepartments.length,
      sortedUnpaidMinistries
    };
  }, [records]);

  const handlePrint = () => {
    window.print();
  };
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <i className="fas fa-medal text-2xl text-yellow-400" title="المرتبة الأولى"></i>;
      case 2:
        return <i className="fas fa-medal text-2xl text-gray-400" title="المرتبة الثانية"></i>;
      case 3:
        return <i className="fas fa-medal text-2xl text-yellow-600" title="المرتبة الثالثة"></i>;
      default:
        return <span className="text-gray-400 font-bold">{rank}</span>;
    }
  };
  
  const formatSubmissionDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('ar-IQ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!classificationData) {
    return (
      <div className="bg-slate-800 p-8 rounded-xl shadow-lg animate-fade-in text-center text-gray-400">
        <i className="fas fa-info-circle text-4xl mb-4"></i>
        <p>لا توجد بيانات تسديد لعرض التصنيف.</p>
      </div>
    );
  }

  const { latestYear, latestMonth, rankedPaid, unpaid, unpaidCount, sortedUnpaidMinistries } = classificationData;
  const monthName = months.find(m => m.value === latestMonth)?.name;
  const reportTitle = `تصنيف الدوائر حسب سرعة التسديد`;

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in space-y-8 printable-section print-portrait">
       {/* Official Header - Hidden on screen, visible on print */}
       <div className="official-header hidden print:flex">
         <div className="header-side">
             جمهورية العراق<br/>
             وزارة المالية<br/>
             هيئة التقاعد الوطنية - فرع البصرة
         </div>
         <div className="header-center">
             <div className="header-logo"><i className="fas fa-trophy"></i></div>
             <h1>{reportTitle}</h1>
             <p>لشهر {monthName} {latestYear}</p>
         </div>
         <div className="header-side print-text-left">
             التاريخ: {new Date().toLocaleDateString('ar-IQ')}<br/>
             العدد: ............
         </div>
     </div>

      <div className="no-print">
        <h2 className="text-2xl font-bold text-amber-300 mb-4 text-center">
            {reportTitle} - {monthName} {latestYear}
        </h2>
        <div className="flex justify-center mb-6">
            <button 
                onClick={handlePrint} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300">
                <i className="fas fa-print ml-2"></i>طباعة التقرير
            </button>
        </div>
      </div>
      
      {/* Ranked Paid Departments */}
      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-4 border-b-2 border-green-500 pb-2 print-text-black">
           <i className="fas fa-check-circle ml-2"></i>
           الدوائر المسددة ({rankedPaid.length})
        </h3>
        {rankedPaid.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="min-w-full text-sm text-center text-gray-300">
                <thead className="bg-slate-700 text-xs text-gray-200 uppercase tracking-wider">
                    <tr>
                        <th className="p-3 w-16">الترتيب</th>
                        <th className="p-3 text-right">اسم الدائرة</th>
                        <th className="p-3 text-right">الوزارة</th>
                        <th className="p-3">تاريخ التسديد</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {rankedPaid.map((record, index) => (
                        <tr key={record.id} className="hover:bg-slate-700">
                            <td className="p-3">
                                <span className="no-print">{getRankIcon(index + 1)}</span>
                                <span className="hidden force-print-inline">{index + 1}</span>
                            </td>
                            <td className="p-3 font-medium text-white text-right">{record.departmentName}</td>
                            <td className="p-3 text-gray-400 text-right">{record.ministry}</td>
                            <td className="p-3 text-gray-400 whitespace-nowrap">{formatSubmissionDate(record.submittedAt)}</td>
                        </tr>
                    ))}
                </tbody>
             </table>
           </div>
        ) : (
             <p className="text-gray-400 text-center p-4 bg-slate-700 rounded-lg">لم تقم أي دائرة بالتسديد لهذا الشهر بعد.</p>
        )}
      </div>

      {/* Unpaid Departments */}
      <div>
        <h3 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-red-500 pb-2 print-text-black">
            <i className="fas fa-exclamation-triangle ml-2"></i>
            الدوائر التي لم تسدد بعد ({unpaidCount})
        </h3>
        {unpaidCount > 0 ? (
            <div className="space-y-6">
                {sortedUnpaidMinistries.map(ministry => (
                    <div key={ministry} className="print-list-section">
                        <h4 className="flex justify-between items-baseline text-lg font-bold text-blue-400 border-b-2 border-blue-500 pb-2 mb-3">
                        <span>{ministry}</span>
                        <span>
                            <span className="text-sm font-normal bg-blue-900 text-blue-300 px-2 py-1 rounded-md no-print">
                                {unpaid[ministry].length} دائرة
                            </span>
                            <span className="print-inline-text hidden force-print-inline font-normal text-sm">({unpaid[ministry].length} دائرة)</span>
                        </span>
                        </h4>
                        <ul className="list-disc pr-6 space-y-2 text-gray-300 columns-1 md:columns-2 lg:columns-3">
                          {unpaid[ministry].map(deptName => <li key={deptName}>{deptName}</li>)}
                        </ul>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-400 text-center p-4 bg-slate-700 rounded-lg">جميع الدوائر قامت بالتسديد لهذا الشهر. عمل رائع!</p>
        )}
      </div>
      
       <div className="print-footer hidden print:flex">
            <span>نظام أرشفة التوقيفات التقاعدية</span>
            <span>تاريخ الطباعة: {new Date().toLocaleString('ar-IQ')}</span>
        </div>
    </div>
  );
};

export default Classification;
