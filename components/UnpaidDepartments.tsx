import React, { useState, useMemo } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments } from './DataEntryForm';

interface UnpaidDepartmentsProps {
  records: RetirementRecord[];
}

const UnpaidDepartments: React.FC<UnpaidDepartmentsProps> = ({ records }) => {
  const [yearFilter, setYearFilter] = useState<number>(new Date().getFullYear());
  const [reportGenerated, setReportGenerated] = useState(false);

  const months = useMemo(() => [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ], []);

  const years = Array.from({ length: 2028 - 2020 + 1 }, (_, i) => 2028 - i);
  
  const unpaidReport = useMemo(() => {
    if (!reportGenerated) {
        return { data: {}, count: 0 };
    }
    
    const unpaidByMinistry: Record<string, Record<string, number[]>> = {};

    const paidRecordsSet = new Set(
        records
            .filter(r => r.year === yearFilter)
            .map(r => `${r.departmentName}-${r.month}`)
    );
    
    const sortedMinistries = Object.keys(ministryDepartments).sort((a, b) => a.localeCompare(b, 'ar'));

    for (const ministry of sortedMinistries) {
        const departments = ministryDepartments[ministry];
        for (const deptName of departments) {
            const unpaidMonths: number[] = [];
            for (let month = 1; month <= 12; month++) {
                if (!paidRecordsSet.has(`${deptName}-${month}`)) {
                    unpaidMonths.push(month);
                }
            }

            if (unpaidMonths.length > 0) {
                if (!unpaidByMinistry[ministry]) {
                    unpaidByMinistry[ministry] = {};
                }
                unpaidByMinistry[ministry][deptName] = unpaidMonths;
            }
        }
    }

    // Sort departments within each ministry alphabetically
    for (const ministry in unpaidByMinistry) {
        const sortedDepts: Record<string, number[]> = {};
        Object.keys(unpaidByMinistry[ministry]).sort((a,b) => a.localeCompare(b, 'ar')).forEach(dept => {
            sortedDepts[dept] = unpaidByMinistry[ministry][dept];
        });
        unpaidByMinistry[ministry] = sortedDepts;
    }
    
    const unpaidCount = Object.values(unpaidByMinistry).reduce((acc, depts) => acc + Object.keys(depts).length, 0);

    return { data: unpaidByMinistry, count: unpaidCount };
  }, [records, yearFilter, reportGenerated, ministryDepartments]);

  const handlePrint = () => {
    try {
      window.print();
    } catch (error) {
      console.error("Printing failed:", error);
      alert("فشلت عملية الطباعة. قد تكون هناك قيود في المتصفح أو البيئة الحالية تمنع فتح نافذة الطباعة.");
    }
  };

  const inputClasses = "w-full p-3 bg-white text-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  
  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in print-container">
      <div className="hidden print-only mb-6">
        <h1 className="text-2xl font-bold text-black mb-2">تقرير الدوائر الغير مسددة لعام {yearFilter}</h1>
        <p className="text-sm text-black">تاريخ الطباعة: {new Date().toLocaleDateString('ar-IQ')}</p>
      </div>

      <div className="no-print">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">تقرير الدوائر الغير مسددة</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-700 rounded-lg items-end">
          <div className="md:col-span-2">
            <label htmlFor="yearFilter" className={labelClasses}>اختر السنة لعرض التقرير</label>
            <select id="yearFilter" value={yearFilter} onChange={(e) => setYearFilter(Number(e.target.value))} className={inputClasses}>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <button onClick={() => setReportGenerated(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300">
              <i className="fas fa-search ml-2"></i>عرض التقرير
          </button>
        </div>
        
        {reportGenerated && (
          <button onClick={handlePrint} disabled={unpaidReport.count === 0} className="w-full bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed">
            <i className="fas fa-print ml-2"></i>طباعة التقرير
          </button>
        )}
      </div>
      
      <div className="mt-6">
        {!reportGenerated ? (
          <div className="p-8 text-center text-gray-400">
            <i className="fas fa-info-circle text-4xl mb-4"></i>
            <p>يرجى اختيار السنة والضغط على 'عرض التقرير'.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-center text-gray-300 font-semibold no-print">
              تم العثور على {unpaidReport.count} دائرة غير مسددة لشهر واحد على الأقل في عام {yearFilter}.
            </p>
            {Object.keys(unpaidReport.data).length > 0 ? Object.entries(unpaidReport.data).map(([ministry, departments]) => (
                 <div key={ministry} className="mb-6 page-break-inside-avoid">
                     <h4 className="text-lg font-bold text-orange-400 border-b-2 border-orange-500 pb-2 mb-3">{ministry}</h4>
                     <ul className="space-y-2 text-gray-300 pr-4">
                         {Object.entries(departments).map(([deptName, unpaidMonths]) => (
                             <li key={deptName}>
                                 <span className="font-semibold text-white">{deptName}:</span>
                                 <span className="text-sm text-red-400 mr-2">
                                     {unpaidMonths.map(m => months.find(mon => mon.value === m)?.name).join('، ')}
                                 </span>
                             </li>
                         ))}
                     </ul>
                 </div>
             )) : <p className="text-center text-green-400 p-6 bg-gray-700 rounded-lg">جميع الدوائر قامت بتسديد مستحقاتها لعام {yearFilter}.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UnpaidDepartments;