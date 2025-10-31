import React, { useState, FormEvent, useEffect } from 'react';
import { RetirementRecord } from '../types';

interface DataEntryFormProps {
  onAddRecord: (record: RetirementRecord) => void;
  departments: string[];
}

export const ministryDepartments: Record<string, string[]> = {
    'رئاسة الوزراء': [
      'مديرية شهداء البصرة',
      'مديرية شهداء شمال البصرة',
      'مديرية الوقف الشيعي في البصرة',
      'هيئة إدارة واستثمار أموال الوقف السني المنطقة الجنوبية',
      'مديرية الوقف السني المنطقة الجنوبية'
    ],
    'مجلس القضاء الأعلى': [
      'رئاسة محكمة استئناف البصرة'
    ],
    'محافظة البصرة': [
      'مديرية بلدية البصرة',
      'مديرية بلديات محافظة البصرة',
      'مديرية بلدية الدير',
      'مديرية بلدية الهارثة',
      'مديرية بلدية النشوة',
      'مديرية بلدية ابي الخصيب',
      'مديرية بلدية السيبة',
      'مديرية بلدية سفوان',
      'مديرية بلدية المدينة',
      'مديرية بلدية الفاو',
      'مديرية بلدية عزالدين سليم',
      'مديرية بلدية شط العرب',
      'مديرية بلدية القرنة',
      'مديرية بلدية الزبير',
      'مديرية بلدية الثغر',
      'مديرية بلدية الصادق',
      'مديرية بلدية ام قصر',
      'ديوان محافظة البصرة',
      'مجلس محافظة البصرة',
      'مديرية ماء البصرة',
      'مديرية مجاري البصرة',
      'المركز الوطني للصحة والسلامة المهنية في البصرة',
      'مديرية زراعة البصرة',
      'هيئة استثمار البصرة',
      'مديرية طرق وجسور البصرة',
      'هيئة رعاية ذوي الإعاقة والاحتياجات الخاصة',
      'دائرة المباني البصرة',
      'مديرية التخطيط العمراني',
      'دائرة العمل والتدريب المهني البصرة',
      'مديرية شباب ورياضة البصرة',
      'دائرة الإسكان في البصرة'
    ],
    'وزارة التربية': [
      'مديرية تربية البصرة'
    ],
    'وزارة الصحة': [
      'دائرة صحة البصرة'
    ],
    'وزارة الاتصالات': [
      'مديرية اتصالات ومعلوماتية البصرة'
    ],
    'وزارة التجارة': [
      'الشركة العامة لتجارة الحبوب / فرع البصرة',
      'الشركة العامة لتجارة الحبوب / فرع ام قصر',
      'الشركة العامة لتصنيع الحبوب /البصرة',
      'الشركة العامة لتجارة السيارات والمكائن فرع البصرة',
      'الشركة العامة لتجارة المواد الغذائية فرع البصرة'
    ],
    'وزارة التخطيط': [
      'مديرية إحصاء البصرة',
      'الجهاز المركزي للتقييس والسيطرة النوعية قسم البصرة'
    ],
    'وزارة التعليم العالي': [
      'رئاسة جامعة البصرة',
      'الجامعة التقنية الجنوبية',
      'الكلية التقنية الهندسية البصرة',
      'الكلية التقنية الإدارية البصرة',
      'كلية التقنيات الطبية والصحية البصرة',
      'المعهد التقني البصرة',
      'المعهد التقني القرنة',
      'جامعة البصرة للنفط والغاز'
    ],
    'وزارة الداخلية': [
      'قيادة حرس حدود المنطقة الرابعة',
      'مديرية الأحوال المدنية والجوازات والإقامة في البصرة',
      'مديرية الدفاع المدني البصرة',
      'مديرية شرطة كمارك المنطقة الرابعة',
      'امرية حرس حدود السواحل',
      'مدرسة تدريب حدود المنطقة الجنوبية',
      'مقر لواء حرس حدود الرابع عشر',
      'مقر لواء حرس حدود السادس عشر',
      'اكاديمية الخليج العربي للدراسات البحرية',
      'مديرية مرور محافظة البصرة',
      'مديرية شرطة محافظة البصرة والمنشأت'
    ],
    'وزارة الزراعة': [
      'مستشفى البيطرة البصرة'
    ],
    'وزارة الصناعة والمعادن': [
      'الشركة العامة لصناعة الاسمدة الجنوبية',
      'شركة ابن ماجد العامة',
      'معمل اسمنت البصرة',
      'الشركة العامة للصناعات البتروكيمياوية',
      'الشركة العامة للحديد والصلب'
    ],
    'وزارة العدل': [
      'مديرية رعاية القاصرين في البصرة',
      'سجن البصرة المركزي',
      'مديرية التسجيل العقاري في البصرة الأولى',
      'مديرية التسجيل العقاري في البصرة الثانية',
      'مديرية تنفيذ البصرة',
      'دائرة كاتب عدل البصرة'
    ],
    'وزارة العمل والشؤون الاجتماعية': [
      'شبكة الحماية الاجتماعية في البصرة',
      'دائرة التقاعد والضمان الاجتماعي البصرة'
    ]
  };
  
export const ministriesWithCentralFunding = ['رئاسة الوزراء', 'مجلس القضاء الأعلى', 'محافظة البصرة', 'وزارة التربية', 'وزارة الصحة', 'وزارة التخطيط', 'وزارة التعليم العالي', 'وزارة الداخلية', 'وزارة الزراعة', 'وزارة العدل'];
export const ministriesWithSelfFunding = ['وزارة الاتصالات', 'وزارة التجارة', 'وزارة الصناعة والمعادن'];


const DataEntryForm: React.FC<DataEntryFormProps> = ({ onAddRecord, departments }) => {
  const [ministry, setMinistry] = useState('');
  const [fundingType, setFundingType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [year, setYear] = useState<number | ''>(new Date().getFullYear());
  const [month, setMonth] = useState<number | ''>(new Date().getMonth() + 1);
  const [totalSalaries, setTotalSalaries] = useState('');
  const [employeeCount, setEmployeeCount] = useState<number | ''>('');
  const [deduction10, setDeduction10] = useState('');
  const [deduction15, setDeduction15] = useState('');
  const [deduction25, setDeduction25] = useState('');

  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Department-specific rules override ministry-level rules
    if (departmentName === 'شبكة الحماية الاجتماعية في البصرة') {
      setFundingType('مركزي');
    } else if (departmentName === 'دائرة التقاعد والضمان الاجتماعي البصرة') {
      setFundingType('ذاتي');
    } else if (ministriesWithCentralFunding.includes(ministry)) {
      setFundingType('مركزي');
    } else if (ministriesWithSelfFunding.includes(ministry)) {
      setFundingType('ذاتي');
    } else {
      setFundingType('');
    }
  }, [ministry, departmentName]);

  useEffect(() => {
    const numericSalaries = parseFloat(totalSalaries.replace(/,/g, ''));
    if (!isNaN(numericSalaries) && numericSalaries > 0) {
      // Calculate deductions
      const d10 = Math.round(numericSalaries * 0.10);
      const d15 = Math.round(numericSalaries * 0.15);
      const d25 = Math.round(numericSalaries * 0.25);

      // Update state with calculated values (as strings)
      setDeduction10(d10.toString());
      setDeduction15(d15.toString());
      setDeduction25(d25.toString());
    } else {
      // Clear deductions if total salaries is empty or zero
      setDeduction10('');
      setDeduction15('');
      setDeduction25('');
    }
  }, [totalSalaries]);


  const ministriesList = [
    'رئاسة الوزراء', 'مجلس القضاء الأعلى', 'محافظة البصرة', 'وزارة التربية', 'وزارة الاتصالات',
    'وزارة التجارة', 'وزارة التخطيط', 'وزارة التعليم العالي', 'وزارة الداخلية', 'وزارة الزراعة',
    'وزارة الصناعة والمعادن', 'وزارة العدل', 'وزارة العمل والشؤون الاجتماعية', 'وزارة الصحة', 'وزارة الكهرباء',
    'وزارة المالية', 'وزارة الموارد المائية', 'وزارة النفط', 'وزارة النقل'
  ];
  
  const formatCurrency = (value: string) => {
    if (!value) return '';
    const numericValue = value.replace(/[^0-9]/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    setter(numericValue);
  };


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!ministry || !fundingType || !departmentName || !year || !month || totalSalaries === '' || employeeCount === '') {
      setFeedbackMessage('يرجى ملء جميع الحقول الإلزامية.');
      return;
    }

    const unformat = (val: string) => Number(val.replace(/,/g, ''));

    const newRecord: RetirementRecord = {
      id: `${ministry}-${departmentName}-${year}-${month}`,
      ministry,
      fundingType,
      departmentName,
      year: Number(year),
      month: Number(month),
      totalSalaries: unformat(totalSalaries),
      employeeCount: Number(employeeCount),
      deduction10: unformat(deduction10) || 0,
      deduction15: unformat(deduction15) || 0,
      deduction25: unformat(deduction25) || 0,
    };

    onAddRecord(newRecord);
    
    setFeedbackMessage(`تمت إضافة سجل ${departmentName} بنجاح!`);
    
    setDepartmentName('');
    if (!ministriesWithCentralFunding.includes(ministry) && !ministriesWithSelfFunding.includes(ministry)) {
       setFundingType('');
    }
    setTotalSalaries('');
    setEmployeeCount('');
    setDeduction10('');
    setDeduction15('');
    setDeduction25('');

    setTimeout(() => setFeedbackMessage(null), 3000);
  };
  
  const inputClasses = "w-full p-3 bg-white text-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:bg-gray-300 disabled:cursor-not-allowed";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  
  const months = [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ];

  const years = Array.from({ length: 2028 - 2020 + 1 }, (_, i) => 2020 + i);

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">إدخال بيانات جديدة</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="ministry" className={labelClasses}>الوزارة</label>
            <select
              id="ministry"
              value={ministry}
              onChange={e => {
                setMinistry(e.target.value);
                setDepartmentName(''); // Reset department when ministry changes
              }}
              className={inputClasses}
              required
            >
              <option value="" disabled>-- اختر الوزارة --</option>
              {ministriesList.sort((a, b) => a.localeCompare(b, 'ar')).map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="fundingType" className={labelClasses}>نوع التمويل</label>
            <select
              id="fundingType"
              value={fundingType}
              onChange={e => setFundingType(e.target.value)}
              className={inputClasses}
              required
              disabled={
                ministriesWithCentralFunding.includes(ministry) || 
                ministriesWithSelfFunding.includes(ministry) ||
                departmentName === 'شبكة الحماية الاجتماعية في البصرة' ||
                departmentName === 'دائرة التقاعد والضمان الاجتماعي البصرة'
              }
            >
              <option value="" disabled>-- اختر النوع --</option>
              <option value="ذاتي">ذاتي</option>
              <option value="مركزي">مركزي</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="departmentName" className={labelClasses}>اسم الدائرة / المؤسسة</label>
            {ministryDepartments[ministry] ? (
              <select
                id="departmentName"
                value={departmentName}
                onChange={e => setDepartmentName(e.target.value)}
                className={inputClasses}
                required
              >
                <option value="" disabled>-- اختر الدائرة --</option>
                {ministryDepartments[ministry].map(dep => <option key={dep} value={dep}>{dep}</option>)}
              </select>
            ) : (
              <>
                <input
                  id="departmentName"
                  type="text"
                  list="departments-list"
                  value={departmentName}
                  onChange={e => setDepartmentName(e.target.value)}
                  className={inputClasses}
                  required
                  placeholder="مثال: جامعة بغداد"
                />
                <datalist id="departments-list">
                  {departments.map(dep => <option key={dep} value={dep} />)}
                </datalist>
              </>
            )}
          </div>
          <div>
            <label htmlFor="year" className={labelClasses}>السنة</label>
            <select
              id="year"
              value={year}
              onChange={e => setYear(e.target.value ? Number(e.target.value) : '')}
              className={inputClasses}
              required
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="month" className={labelClasses}>الشهر</label>
            <select
              id="month"
              value={month}
              onChange={e => setMonth(e.target.value ? Number(e.target.value) : '')}
              className={inputClasses}
              required
            >
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </div>
        </div>

        <hr className="border-gray-600" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="employeeCount" className={labelClasses}>عدد الموظفين</label>
                <input
                id="employeeCount"
                type="number"
                value={employeeCount}
                onChange={e => setEmployeeCount(e.target.value ? Number(e.target.value) : '')}
                className={inputClasses}
                required
                />
            </div>
            <div>
                <label htmlFor="totalSalaries" className={labelClasses}>مجموع الرواتب الاسمية</label>
                <input
                id="totalSalaries"
                type="text"
                inputMode="numeric"
                value={formatCurrency(totalSalaries)}
                onChange={(e) => handleCurrencyChange(e, setTotalSalaries)}
                className={inputClasses}
                required
                placeholder="بالدينار العراقي"
                />
            </div>
        </div>

        <hr className="border-gray-600" />
        
        <h3 className="text-lg font-semibold text-gray-200 text-center">مبالغ التوقيفات التقاعدية</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="deduction10" className={labelClasses}>نسبة ال10%</label>
            <input
              id="deduction10"
              type="text"
              inputMode="numeric"
              value={formatCurrency(deduction10)}
              onChange={(e) => handleCurrencyChange(e, setDeduction10)}
              className={inputClasses}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="deduction15" className={labelClasses}>نسبة ال15%</label>
            <input
              id="deduction15"
              type="text"
              inputMode="numeric"
              value={formatCurrency(deduction15)}
              onChange={(e) => handleCurrencyChange(e, setDeduction15)}
              className={inputClasses}
              placeholder="0"
            />
          </div>
          <div>
            <label htmlFor="deduction25" className={labelClasses}>نسبة ال25%</label>
            <input
              id="deduction25"
              type="text"
              inputMode="numeric"
              value={formatCurrency(deduction25)}
              onChange={(e) => handleCurrencyChange(e, setDeduction25)}
              className={inputClasses}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500">
            <i className="fas fa-save ml-2"></i>
            حفظ وإضافة السجل
          </button>
        </div>
        {feedbackMessage && (
          <div className={`p-3 rounded-lg text-center ${feedbackMessage.includes('بنجاح') ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
            {feedbackMessage}
          </div>
        )}
      </form>
    </div>
  );
};

export default DataEntryForm;