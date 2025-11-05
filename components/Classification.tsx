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

    // Find the latest year and month from all records
    const latestPeriod = records.reduce((latest, record) => {
        const recordPeriod = record.year * 100 + record.month;
        return recordPeriod > latest ? recordPeriod : latest;
    }, 0);
    
    if (latestPeriod === 0) return null;

    const latestYear = Math.floor(latestPeriod / 100);
    const latestMonth = latestPeriod % 100;
    
    // Get all departments that paid for the latest period
    const paidRecords = records
      .filter(r => r.year === latestYear && r.month === latestMonth)
      .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

    // Get all departments from the master list
    const allDepartments = Object.values(ministryDepartments).flat();
    const paidDepartmentNames = new Set(paidRecords.map(r => r.departmentName));
    
    // Find unpaid departments
    const unpaidDepartments = allDepartments
        .filter(dept => !paidDepartmentNames.has(dept.name))
        .map(dept => {
            const ministry = Object.keys(ministryDepartments).find(m => ministryDepartments[m].some(d => d.name === dept.name)) || '';
            return { departmentName: dept.name, ministry };
        })
        .sort((a,b) => a.departmentName.localeCompare(b.departmentName, 'ar'));

    return {
      latestYear,
      latestMonth,
      rankedPaid: paidRecords,
      unpaid: unpaidDepartments,
    };
  }, [records]);
  
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

  const { latestYear, latestMonth, rankedPaid, unpaid } = classificationData;
  const monthName = months.find(m => m.value === latestMonth)?.name;

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in space-y-8">
      <h2 className="text-2xl font-bold text-amber-300 mb-4 text-center">
        تصنيف الدوائر حسب سرعة التسديد لشهر {monthName} {latestYear}
      </h2>
      
      {/* Ranked Paid Departments */}
      <div>
        <h3 className="text-xl font-semibold text-green-400 mb-4 border-b-2 border-green-500 pb-2">
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
                            <td className="p-3">{getRankIcon(index + 1)}</td>
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
        <h3 className="text-xl font-semibold text-red-400 mb-4 border-b-2 border-red-500 pb-2">
            <i className="fas fa-exclamation-triangle ml-2"></i>
            الدوائر التي لم تسدد بعد ({unpaid.length})
        </h3>
        {unpaid.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpaid.map((dept, index) => (
                    <div key={index} className="bg-slate-700 p-3 rounded-lg">
                        <p className="font-semibold text-white">{dept.departmentName}</p>
                        <p className="text-xs text-gray-400">{dept.ministry}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-gray-400 text-center p-4 bg-slate-700 rounded-lg">جميع الدوائر قامت بالتسديد لهذا الشهر. عمل رائع!</p>
        )}
      </div>
    </div>
  );
};

export default Classification;
