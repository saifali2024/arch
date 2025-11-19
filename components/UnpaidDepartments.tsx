
import React, { useMemo } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments, DepartmentInfo } from './DataEntryForm';

interface UnpaidDepartmentsProps {
  records: RetirementRecord[];
}

const UnpaidDepartments: React.FC<UnpaidDepartmentsProps> = ({ records }) => {
  const months = useMemo(() => [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ], []);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = months.find(m => m.value === currentMonth)?.name;
  
  const gracePeriodEndDay = 20;
  const currentDay = new Date().getDate();
  const isGracePeriodActive = currentDay <= gracePeriodEndDay;


  const unpaidReport = useMemo(() => {
    if (isGracePeriodActive) {
      return { data: {}, count: 0, departments: [] };
    }
  
    const unpaidByMinistry: Record<string, string[]> = {};
    const unpaidDepartmentsWithInfo: DepartmentInfo[] = [];

    const paidRecordsSet = new Set(
      records
        .filter(r => r.year === currentYear && r.month === currentMonth)
        .map(r => r.departmentName)
    );
    
    const sortedMinistries = Object.keys(ministryDepartments).sort((a, b) => a.localeCompare(b, 'ar'));

    for (const ministry of sortedMinistries) {
      const departments = ministryDepartments[ministry];
      const unpaidDepartmentsInMinistry: string[] = [];
      for (const dept of departments) {
        if (!paidRecordsSet.has(dept.name)) {
          unpaidDepartmentsInMinistry.push(dept.name);
          unpaidDepartmentsWithInfo.push(dept);
        }
      }

      if (unpaidDepartmentsInMinistry.length > 0) {
        unpaidByMinistry[ministry] = unpaidDepartmentsInMinistry.sort((a, b) => a.localeCompare(b, 'ar'));
      }
    }
    
    const unpaidCount = unpaidDepartmentsWithInfo.length;

    return { data: unpaidByMinistry, count: unpaidCount, departments: unpaidDepartmentsWithInfo };
  }, [records, currentYear, currentMonth, isGracePeriodActive]);

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const emails = unpaidReport.departments
        .map(dept => dept.email)
        .filter((email): email is string => !!email); // Filter out null/undefined and type guard

    if (emails.length === 0) {
        alert('لا توجد عناوين بريد إلكتروني متاحة للدوائر غير المسددة.');
        return;
    }

    const bcc = emails.join(',');
    const subject = `تذكير بخصوص تسديد التوقيفات التقاعدية لشهر ${currentMonthName} ${currentYear}`;
    const body = `
تحية طيبة،

نود تذكيركم بضرورة تسديد مستحقات التوقيفات التقاعدية لشهر ${currentMonthName} من عام ${currentYear}.

يرجى اتخاذ الإجراءات اللازمة في أقرب وقت ممكن.

مع التقدير،
هيئة التقاعد الوطنية / فرع البصرة
    `;

    const mailtoLink = `mailto:?bcc=${encodeURIComponent(bcc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.trim())}`;
    window.location.href = mailtoLink;
};
  
  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in printable-section">
      {/* Official Header - Hidden on screen, visible on print */}
      <div className="official-header hidden print:flex">
         <div className="header-side">
             جمهورية العراق<br/>
             وزارة المالية<br/>
             هيئة التقاعد الوطنية - فرع البصرة
         </div>
         <div className="header-center">
             <div className="header-logo"><i className="fas fa-file-invoice-dollar"></i></div>
             <h1>تقرير الدوائر غير المسددة</h1>
             <p>لشهر {currentMonthName} {currentYear}</p>
             <p style={{fontSize: '10pt', marginTop: '5px'}}>عدد الدوائر: {unpaidReport.count}</p>
         </div>
         <div className="header-side print-text-left">
             التاريخ: {new Date().toLocaleDateString('ar-IQ')}<br/>
             العدد: ............
         </div>
     </div>
      
      <div className="no-print">
        <h2 className="text-2xl font-bold text-gray-100 mb-4 text-center">
          متابعة تسديد الدوائر لشهر {currentMonthName} {currentYear}
        </h2>
        
        {isGracePeriodActive ? (
          <div className="bg-blue-800 border-r-4 border-blue-500 text-blue-100 p-4 mb-6 rounded-md shadow-lg" role="alert">
            <div className="flex items-center">
              <i className="fas fa-info-circle text-2xl ml-3"></i>
              <div>
                <p className="font-bold">فترة سماح</p>
                <p>تعتبر الدائرة غير مسددة بعد يوم {gracePeriodEndDay} من الشهر. لا توجد إجراءات مطلوبة حاليًا.</p>
              </div>
            </div>
          </div>
        ) : unpaidReport.count > 0 ? (
          <div className="bg-red-800 border-r-4 border-red-500 text-red-100 p-4 mb-6 rounded-md shadow-lg" role="alert">
            <div className="flex items-center">
              <i className="fas fa-exclamation-triangle text-2xl ml-3"></i>
              <div>
                <p className="font-bold">تنبيه!</p>
                <p>يوجد <strong>{unpaidReport.count.toLocaleString('ar-IQ')}</strong> دائرة لم تقم بتسديد مستحقاتها لهذا الشهر.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-green-800 border-r-4 border-green-500 text-green-100 p-4 mb-6 rounded-md shadow-lg" role="alert">
             <div className="flex items-center">
              <i className="fas fa-check-circle text-2xl ml-3"></i>
              <div>
                <p className="font-bold">لا توجد تنبيهات</p>
                <p>جميع الدوائر قامت بتسديد مستحقاتها لهذا الشهر.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
            <button onClick={handlePrint} disabled={isGracePeriodActive || unpaidReport.count === 0} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed">
              <i className="fas fa-print ml-2"></i>طباعة التقرير
            </button>
            <button onClick={handleSendEmail} disabled={isGracePeriodActive || unpaidReport.count === 0} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-blue-400 disabled:cursor-not-allowed">
              <i className="fas fa-envelope ml-2"></i>إرسال بريد إلكتروني للجميع
            </button>
        </div>

      </div>
      
      <div>
        {isGracePeriodActive ? (
            <div className="text-center text-blue-400 p-6 bg-slate-700 rounded-lg no-print">
                <p>فترة السماح سارية حتى يوم {gracePeriodEndDay} من الشهر. سيتم عرض الدوائر غير المسددة بعد هذا التاريخ.</p>
            </div>
        ) : Object.keys(unpaidReport.data).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(unpaidReport.data).map(([ministry, departments]) => (
              <div key={ministry} className="print-list-section">
                <h4 className="text-lg font-bold text-amber-400 border-b-2 border-amber-500 pb-2 mb-3">{ministry}</h4>
                <ul className="list-disc pr-6 space-y-2 text-gray-300">
                  {(departments as string[]).map(deptName => (
                    <li key={deptName}>{deptName}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-green-400 p-6 bg-slate-700 rounded-lg no-print">
            <p>رائع! جميع الدوائر قامت بتسديد مستحقاتها لهذا الشهر.</p>
          </div>
        )}
        
        <div className="print-footer hidden print:flex">
            <span>نظام أرشفة التوقيفات التقاعدية</span>
            <span>تاريخ الطباعة: {new Date().toLocaleString('ar-IQ')}</span>
        </div>
      </div>
    </div>
  );
};

export default UnpaidDepartments;
