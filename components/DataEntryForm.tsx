import React, { useState, FormEvent, useEffect, useCallback } from 'react';
import { RetirementRecord } from '../types';

interface DataEntryFormProps {
  onAddRecord: (record: RetirementRecord) => void;
  departments: string[];
}

export interface DepartmentInfo {
  name: string;
  email?: string; // Optional email field
}

export const ministryDepartments: Record<string, DepartmentInfo[]> = {
    'رئاسة الوزراء': [
      { name: 'مديرية شهداء البصرة', email: 'shuhada.basra@gov.iq' },
      { name: 'مديرية شهداء شمال البصرة', email: 'shuhada.north.basra@gov.iq' },
      { name: 'مديرية الوقف الشيعي في البصرة', email: 'waqf.shia.basra@gov.iq' },
      { name: 'هيئة إدارة واستثمار أموال الوقف السني المنطقة الجنوبية', email: 'waqf.sunni.invest@gov.iq' },
      { name: 'مديرية الوقف السني المنطقة الجنوبية', email: 'waqf.sunni.basra@gov.iq' }
    ],
    'مجلس القضاء الأعلى': [
      { name: 'رئاسة محكمة استئناف البصرة', email: 'appeals.court.basra@gov.iq' }
    ],
    'محافظة البصرة': [
      { name: 'مديرية بلدية البصرة', email: 'municipality.basra@gov.iq' },
      { name: 'مديرية بلديات محافظة البصرة', email: 'municipalities.basra@gov.iq' },
      { name: 'مديرية بلدية الدير' },
      { name: 'مديرية بلدية الهارثة' },
      { name: 'مديرية بلدية النشوة' },
      { name: 'مديرية بلدية ابي الخصيب' },
      { name: 'مديرية بلدية السيبة' },
      { name: 'مديرية بلدية سفوان' },
      { name: 'مديرية بلدية المدينة' },
      { name: 'مديرية بلدية الفاو' },
      { name: 'مديرية بلدية عزالدين سليم' },
      { name: 'مديرية بلدية شط العرب' },
      { name: 'مديرية بلدية القرنة' },
      { name: 'مديرية بلدية الزبير' },
      { name: 'مديرية بلدية الثغر' },
      { name: 'مديرية بلدية الصادق' },
      { name: 'مديرية بلدية ام قصر' },
      { name: 'ديوان محافظة البصرة', email: 'diwan.basra@gov.iq' },
      { name: 'مجلس محافظة البصرة' },
      { name: 'مديرية ماء البصرة', email: 'water.basra@gov.iq' },
      { name: 'مديرية مجاري البصرة', email: 'sewerage.basra@gov.iq' },
      { name: 'المركز الوطني للصحة والسلامة المهنية في البصرة' },
      { name: 'مديرية زراعة البصرة' },
      { name: 'هيئة استثمار البصرة' },
      { name: 'مديرية طرق وجسور البصرة' },
      { name: 'هيئة رعاية ذوي الإعاقة والاحتياجات الخاصة' },
      { name: 'دائرة المباني البصرة' },
      { name: 'مديرية التخطيط العمراني' },
      { name: 'دائرة العمل والتدريب المهني البصرة' },
      { name: 'مديرية شباب ورياضة البصرة' },
      { name: 'دائرة الإسكان في البصرة' }
    ],
    'وزارة التربية': [
      { name: 'مديرية تربية البصرة', email: 'education.basra@gov.iq' }
    ],
    'وزارة الصحة': [
      { name: 'دائرة صحة البصرة', email: 'health.basra@gov.iq' }
    ],
    'وزارة الاتصالات': [
      { name: 'مديرية اتصالات ومعلوماتية البصرة', email: 'it.basra@gov.iq' }
    ],
    'وزارة التجارة': [
        { name: 'الشركة العامة لتجارة الحبوب فرع البصرة', email: 'grain.basra@gov.iq' },
        { name: 'الشركة العامة لتجارة المواد الغذائية فرع البصرة', email: 'food.basra@gov.iq' },
        { name: 'الشركة العامة للأسواق المركزية فرع البصرة', email: 'markets.basra@gov.iq' },
        { name: 'دائرة تسجيل الشركات البصرة' }
    ],
    'وزارة التخطيط': [
        { name: 'مديرية إحصاء البصرة' }
    ],
    'وزارة التعليم العالي': [
        { name: 'جامعة البصرة', email: 'uobasrah@gov.iq' },
        { name: 'الجامعة التقنية الجنوبية', email: 'stu@gov.iq' },
        { name: 'جامعة البصرة للنفط والغاز' },
        { name: 'جامعة المعقل الأهلية' },
        { name: 'جامعة شط العرب الأهلية' },
        { name: 'المعهد التقني البصرة' }
    ],
    'وزارة الداخلية': [
        { name: 'قيادة شرطة البصرة', email: 'police.basra@gov.iq' }
    ],
    'وزارة الزراعة': [
        { name: 'دائرة البستنة فرع البصرة' }
    ],
    'وزارة الصناعة والمعادن': [
        { name: 'الشركة العامة للأسمدة الجنوبية' },
        { name: 'الشركة العامة للحديد والصلب' },
        { name: 'الشركة العامة للبتروكيمياويات' },
        { name: 'شركة أبن ماجد العامة' },
        { name: 'الشركة العامة لصناعة الورق' }
    ],
    'وزارة العدل': [
        { name: 'دائرة التسجيل العقاري في البصرة' },
        { name: 'مديرية تنفيذ البصرة' }
    ],
    'وزارة العمل والشؤون الاجتماعية': [
        { name: 'دائرة التقاعد والضمان الاجتماعي البصرة', email: 'social.security.basra@gov.iq' },
        { name: 'شبكة الحماية الاجتماعية في البصرة' }
    ],
    'وزارة الكهرباء': [
        { name: 'مديرية توزيع كهرباء الجنوب' },
        { name: 'مديرية إنتاج الطاقة الكهربائية البصرة' },
        { name: 'مديرية شبكات كهرباء الجنوب' }
    ],
    'وزارة المالية': [
        { name: 'مديرية ضريبة البصرة' },
        { name: 'مديرية عقارات الدولة البصرة' },
        { name: 'مديرية خزينة البصرة' },
        { name: 'مصرف الرافدين فرع البصرة' },
        { name: 'مصرف الرشيد فرع البصرة' }
    ],
    'وزارة الموارد المائية': [
        { name: 'مديرية الموارد المائية في البصرة' }
    ],
    'وزارة النفط': [
        { name: 'شركة نفط البصرة' },
        { name: 'شركة مصافي الجنوب' },
        { name: 'شركة غاز الجنوب' },
        { name: 'شركة المشاريع النفطية' },
        { name: 'شركة خطوط الأنابيب النفطية' },
        { name: 'شركة توزيع المنتجات النفطية' },
        { name: 'شركة الحفر العراقية' },
        { name: 'معهد التدريب النفطي البصرة' }
    ],
    'وزارة النقل': [
        { name: 'الشركة العامة لموانئ العراق' },
        { name: 'الشركة العامة للنقل البحري' },
        { name: 'الشركة العامة للسكك الحديد المنطقة الجنوبية' }
    ]
};

export const ministriesWithCentralFunding = [
    'رئاسة الوزراء', 'مجلس القضاء الأعلى', 'وزارة التربية', 'وزارة الصحة', 
    'وزارة الاتصالات', 'وزارة التجارة', 'وزارة التخطيط', 'وزارة التعليم العالي',
    'وزارة الداخلية', 'وزارة الزراعة', 'وزارة العدل', 'وزارة العمل والشؤون الاجتماعية',
    'وزارة المالية', 'وزارة الموارد المائية', 'محافظة البصرة'
];

export const ministriesWithSelfFunding = [
    'وزارة الصناعة والمعادن', 'وزارة الكهرباء', 'وزارة النفط', 'وزارة النقل', 'وزارة العمل والشؤون الاجتماعية'
];


const DataEntryForm: React.FC<DataEntryFormProps> = ({ onAddRecord }) => {
  const [ministry, setMinistry] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [totalSalaries, setTotalSalaries] = useState<number | ''>('');
  const [employeeCount, setEmployeeCount] = useState<number | ''>('');
  const [deduction10, setDeduction10] = useState<number | ''>('');
  const [deduction15, setDeduction15] = useState<number | ''>('');
  const [deduction25, setDeduction25] = useState<number | ''>('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const ministriesList = Object.keys(ministryDepartments).sort((a,b) => a.localeCompare(b, 'ar'));
  const departmentsForSelectedMinistry = ministry ? ministryDepartments[ministry] : [];

  const getFundingType = useCallback((ministry: string, department: string) => {
    if (department === 'شبكة الحماية الاجتماعية في البصرة') return 'مركزي';
    if (department === 'دائرة التقاعد والضمان الاجتماعي البصرة') return 'ذاتي';
    if (ministriesWithCentralFunding.includes(ministry)) return 'مركزي';
    if (ministriesWithSelfFunding.includes(ministry)) return 'ذاتي';
    return '';
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!ministry || !departmentName || !year || !month || totalSalaries === '' || employeeCount === '') {
      setFeedback({ type: 'error', message: 'يرجى ملء جميع الحقول المطلوبة.' });
      return;
    }

    const newRecord: RetirementRecord = {
      id: `${ministry}-${departmentName}-${year}-${month}`,
      ministry,
      fundingType: getFundingType(ministry, departmentName),
      departmentName,
      year,
      month,
      totalSalaries: totalSalaries || 0,
      employeeCount: employeeCount || 0,
      deduction10: deduction10 || 0,
      deduction15: deduction15 || 0,
      deduction25: deduction25 || 0,
    };

    onAddRecord(newRecord);
    setFeedback({ type: 'success', message: `تمت إضافة سجل ${departmentName} لشهر ${month}/${year} بنجاح!` });
    
    // Clear only salary and employee fields for faster entry for the same department
    setTotalSalaries('');
    setEmployeeCount('');
    setDeduction10('');
    setDeduction15('');
    setDeduction25('');

    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };
  
  const handleMinistryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinistry(e.target.value);
    setDepartmentName(''); // Reset department when ministry changes
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);
  const months = [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ];

  const inputClasses = "w-full p-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ministry" className={labelClasses}>الوزارة</label>
            <select id="ministry" value={ministry} onChange={handleMinistryChange} className={inputClasses} required>
              <option value="">-- اختر الوزارة --</option>
              {ministriesList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="department" className={labelClasses}>الدائرة</label>
            <select id="department" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} className={inputClasses} required disabled={!ministry}>
              <option value="">-- اختر الدائرة --</option>
              {departmentsForSelectedMinistry.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="year" className={labelClasses}>السنة</label>
            <select id="year" value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClasses} required>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month" className={labelClasses}>الشهر</label>
            <select id="month" value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClasses} required>
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="totalSalaries" className={labelClasses}>مجموع الرواتب الاسمية</label>
            <input type="number" id="totalSalaries" value={totalSalaries} onChange={(e) => setTotalSalaries(e.target.value ? Number(e.target.value) : '')} className={inputClasses} required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="employeeCount" className={labelClasses}>عدد الموظفين</label>
            <input type="number" id="employeeCount" value={employeeCount} onChange={(e) => setEmployeeCount(e.target.value ? Number(e.target.value) : '')} className={inputClasses} required />
          </div>
          <div>
            <label htmlFor="deduction10" className={labelClasses}>توقيفات 10%</label>
            <input type="number" id="deduction10" value={deduction10} onChange={(e) => setDeduction10(e.target.value ? Number(e.target.value) : '')} className={inputClasses} />
          </div>
          <div>
            <label htmlFor="deduction15" className={labelClasses}>توقيفات 15%</label>
            <input type="number" id="deduction15" value={deduction15} onChange={(e) => setDeduction15(e.target.value ? Number(e.target.value) : '')} className={inputClasses} />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="deduction25" className={labelClasses}>توقيفات 25%</label>
            <input type="number" id="deduction25" value={deduction25} onChange={(e) => setDeduction25(e.target.value ? Number(e.target.value) : '')} className={inputClasses} />
          </div>
        </div>

        {feedback.message && (
          <div className={`p-4 rounded-lg text-center font-semibold ${feedback.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            {feedback.message}
          </div>
        )}

        <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105">
          <i className="fas fa-save ml-2"></i>
          حفظ السجل
        </button>
      </form>
    </div>
  );
};

export default DataEntryForm;