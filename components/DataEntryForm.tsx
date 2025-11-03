
import React, { useState, FormEvent, useEffect } from 'react';
import { RetirementRecord, Attachment } from '../types';

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
        { name: 'الشركة العامة لتجارة الحبوب / فرع البصرة', email: 'grain.basra@gov.iq' },
        { name: 'الشركة العامة لتجارة الحبوب / فرع ام قصر' },
        { name: 'الشركة العامة لتصنيع الحبوب /البصرة' },
        { name: 'الشركة العامة لتجارة السيارات والمكائن فرع البصرة' },
        { name: 'الشركة العامة لتجارة المواد الغذائية فرع البصرة', email: 'food.basra@gov.iq' }
    ],
    'وزارة التخطيط': [
        { name: 'مديرية إحصاء البصرة' },
        { name: 'الجهاز المركزي للتقييس والسيطرة النوعية قسم البصرة' }
    ],
    'وزارة التعليم العالي': [
        { name: 'رئاسة جامعة البصرة', email: 'uobasrah@gov.iq' },
        { name: 'الجامعة التقنية الجنوبية', email: 'stu@gov.iq' },
        { name: 'الكلية التقنية الهندسية البصرة' },
        { name: 'الكلية التقنية الإدارية البصرة' },
        { name: 'كلية التقنيات الطبية والصحية البصرة' },
        { name: 'المعهد التقني البصرة' },
        { name: 'المعهد التقني القرنة' },
        { name: 'جامعة البصرة للنفط والغاز' }
    ],
    'وزارة الداخلية': [
        { name: 'قيادة حرس حدود المنطقة الرابعة' },
        { name: 'مديرية الأحوال المدنية والجوازات والإقامة في البصرة' },
        { name: 'مديرية الدفاع المدني البصرة' },
        { name: 'مديرية شرطة كمارك المنطقة الرابعة' },
        { name: 'امرية حرس حدود السواحل' },
        { name: 'مدرسة تدريب حدود المنطقة الجنوبية' },
        { name: 'مقر لواء حرس حدود الرابع عشر' },
        { name: 'اكاديمية الخليج العربي للدراسات البحرية' },
        { name: 'مديرية مرور محافظة البصرة' },
        { name: 'مديرية شرطة محافظة البصرة والمنشأت' }
    ],
    'وزارة الزراعة': [
        { name: 'مستشفى البيطرة البصرة' }
    ],
    'وزارة الصناعة والمعادن': [
        { name: 'الشركة العامة لصناعة الاسمدة الجنوبية' },
        { name: 'شركة ابن ماجد العامة' },
        { name: 'معمل اسمنت البصرة' },
        { name: 'الشركة العامة للصناعات البتروكيمياوية' },
        { name: 'الشركة العامة للحديد والصلب' }
    ],
    'وزارة العدل': [
        { name: 'مديرية رعاية القاصرين في البصرة' },
        { name: 'سجن البصرة المركزي' },
        { name: 'مديرية التسجيل العقاري في البصرة الأولى' },
        { name: 'مديرية التسجيل العقاري في البصرة الثانية' },
        { name: 'مديرية تنفيذ البصرة' },
        { name: 'دائرة كاتب عدل البصرة' }
    ],
    'وزارة العمل والشؤون الاجتماعية': [
        { name: 'دائرة التقاعد والضمان الاجتماعي البصرة', email: 'social.security.basra@gov.iq' },
        { name: 'شبكة الحماية الاجتماعية في البصرة' }
    ],
    'وزارة الكهرباء': [
        { name: 'الشركة العامة لتوزيع كهرباء الجنوب' },
        { name: 'الشركة العامة لتوزيع كهرباء الجنوب / فرع البصرة' },
        { name: 'الشركة العامة لتوزيع كهرباء الجنوب / فرع شمال البصرة' },
        { name: 'الشركة العامة لنقل الطاقة الكهربائية المنطقة الجنوبية' },
        { name: 'الشركة العامة لنقل الطاقة الكهربائية المنطقة الجنوبية / شبكات جنوب البصرة' },
        { name: 'الشركة العامة لنقل الطاقة الكهربائية المنطقة الجنوبية / شبكات شمال البصرة' },
        { name: 'دائرة التشغيل والتحكم / مديرية الاتصالات ونقل المعلومات الجنوبية' },
        { name: 'دائرة التشغيل والتحكم / مديرية مركز السيطرة الجنوبي' },
        { name: 'انتاج الطاقة الكهربائية المنطقة الجنوبية' },
        { name: 'محطة كهرباء شط البصرة والشعيبة الغازية' },
        { name: 'محطة كهرباء الهارثة' },
        { name: 'محطة كهرباء النجيبية' },
        { name: 'محطة كهرباء خور الزبير الغازية' },
        { name: 'محطة كهرباء الرميلة الغازية' }
    ],
    'وزارة المالية': [
        { name: 'مصرف الرشيد / فرع المربد' },
        { name: 'مصرف الرشيد / فرع القرنة' },
        { name: 'مصرف الرشيد / فرع ام قصر' },
        { name: 'مصرف الرشيد / فرع جامعة البصرة' },
        { name: 'مصرف الرشيد / فرع شارع الثورة' },
        { name: 'مصرف الرشيد /  فرع شط العرب' },
        { name: 'مصرف الرشيد /  فرع الفاو' },
        { name: 'مصرف الرشيد / فرع الزبير' },
        { name: 'مصرف الرشيد /  فرع ساحة سعد' },
        { name: 'مصرف الرشيد / فرع السيف' },
        { name: 'مصرف الرشيد / فرع مكتب مندوب الادارة العامة للمنطقة الجنوبية' },
        { name: 'مصرف الرشيد / فرع مكتب الرقابة للمنطقة الجنوبية' },
        { name: 'مصرف الرافدين / فرع وحدة خزينة المنطقة الجنوبية' },
        { name: 'مصرف الرافدين / فرع ابي الخصيب' },
        { name: 'مصرف الرافدين / فرع البصرة 2' },
        { name: 'مصرف الرافدين /  فرع الصيادلة' },
        { name: 'مصرف الرافدين / فرع الجنينة' },
        { name: 'مصرف الرافدين / فرع سفوان' },
        { name: 'مصرف الرافدين / فرع الاستقلال' },
        { name: 'مصرف الرافدين / فرع المعقل' },
        { name: 'مصرف الرافدين /  فرع خورالزبير' },
        { name: 'مصرف الرافدين / فرع المدينة' },
        { name: 'المصرف الزراعي التعاوني / فرع البصرة' },
        { name: 'المصرف الزراعي التعاوني / فرع القرنة' },
        { name: 'مصرف النهرين الإسلامي / فرع الفراهيدي' },
        { name: 'المصرف العقاري / فرع البصرة' },
        { name: 'المصرف الصناعي / فرع البصرة' },
        { name: 'البنك المركزي العراقي / فرع البصرة' },
        { name: 'فرع عقارات الدولة في البصرة' },
        { name: 'الهيئة العامة للضرائب / فرع البصرة' },
        { name: 'الهيئة العامة للضرائب / فرع الزبير' },
        { name: 'مديرية كمرك المنطقة الجنوبية' },
        { name: 'مديرية خزينة محافظة البصرة' },
        { name: 'مديرية المنطقة الحرة في خور الزبير' },
        { name: 'مديرية تقاعد البصرة' }
    ],
    'وزارة الموارد المائية': [
        { name: 'مديرية الموارد المائية في البصرة' },
        { name: 'مديرية مشروع ماء البصرة' }
    ],
    'وزارة النفط': [
        { name: 'شركة نفط البصرة' },
        { name: 'شركة الحفر العراقية / فرع عمليات الجنوب' },
        { name: 'شركة ناقلات النفط العراقية' },
        { name: 'شركة توزيع المنتجات النفطية / هيأة توزيع الجنوب' },
        { name: 'معهد التدريب النفطي البصرة' },
        { name: 'شركة مصافي الجنوب' },
        { name: 'شركة غاز الجنوب' }
    ],
    'وزارة النقل': [
        { name: 'الشركة العامة لموانئ العراق' },
        { name: 'الشركة العامة للنقل البحري' }
    ]
};

export const ministriesWithCentralFunding = [
    'رئاسة الوزراء', 'مجلس القضاء الأعلى', 'وزارة التربية', 'وزارة الصحة', 
    'وزارة الاتصالات', 'وزارة التخطيط', 'وزارة التعليم العالي',
    'وزارة الداخلية', 'وزارة الزراعة', 'وزارة العدل', 'وزارة العمل والشؤون الاجتماعية',
    'وزارة الموارد المائية', 'محافظة البصرة'
];

export const ministriesWithSelfFunding = [
    'وزارة الصناعة والمعادن', 'وزارة الكهرباء', 'وزارة النفط', 'وزارة النقل', 'وزارة التجارة', 'وزارة المالية'
];

export const getFundingType = (ministry: string, department: string): string => {
  // Special cases for specific departments overriding ministry-level funding
  if (department === 'مديرية اتصالات ومعلوماتية البصرة') return 'ذاتي';
  if (department === 'دائرة التشغيل والتحكم / مديرية الاتصالات ونقل المعلومات الجنوبية') return 'مركزي';
  if (department === 'دائرة التشغيل والتحكم / مديرية مركز السيطرة الجنوبي') return 'مركزي';
  if (department === 'شبكة الحماية الاجتماعية في البصرة') return 'مركزي';
  if (department === 'الهيئة العامة للضرائب / فرع البصرة') return 'مركزي';
  if (department === 'الهيئة العامة للضرائب / فرع الزبير') return 'مركزي';
  if (department === 'فرع عقارات الدولة في البصرة') return 'مركزي';
  if (department === 'مديرية تقاعد البصرة') return 'مركزي';
  if (department === 'مديرية خزينة محافظة البصرة') return 'مركزي';
  if (department === 'مديرية كمرك المنطقة الجنوبية') return 'مركزي';
  
  if (department === 'دائرة التقاعد والضمان الاجتماعي البصرة') return 'ذاتي';
  
  // General ministry-level funding
  if (ministriesWithCentralFunding.includes(ministry)) return 'مركزي';
  if (ministriesWithSelfFunding.includes(ministry)) return 'ذاتي';

  return ''; // Default if not found
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove the part "data:image/png;base64,"
      const base64String = result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
};


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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [fundingType, setFundingType] = useState('');

  const ministriesList = Object.keys(ministryDepartments).sort((a,b) => a.localeCompare(b, 'ar'));
  const departmentsForSelectedMinistry = ministry ? ministryDepartments[ministry] : [];

  useEffect(() => {
    if (ministry && departmentName) {
      setFundingType(getFundingType(ministry, departmentName));
    } else {
      setFundingType('');
    }
  }, [ministry, departmentName]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!ministry || !departmentName || !year || !month || totalSalaries === '' || employeeCount === '') {
      setFeedback({ type: 'error', message: 'يرجى ملء جميع الحقول المطلوبة.' });
      return;
    }
    
    const attachmentData: Attachment[] = [];
    for (const file of attachments) {
        attachmentData.push({
            name: file.name,
            type: file.type,
            data: await fileToBase64(file),
        });
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
      attachments: attachmentData,
    };

    onAddRecord(newRecord);
    setFeedback({ type: 'success', message: `تمت إضافة سجل ${departmentName} لشهر ${month}/${year} بنجاح!` });
    
    // Clear fields
    setTotalSalaries('');
    setEmployeeCount('');
    setDeduction10('');
    setDeduction15('');
    setDeduction25('');
    setAttachments([]);
    // Reset file input element
    const fileInput = document.getElementById('attachments') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

    setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
  };
  
  const handleMinistryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinistry(e.target.value);
    setDepartmentName(''); // Reset department when ministry changes
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
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
            <label htmlFor="fundingType" className={labelClasses}>نوع التمويل</label>
            <input
              type="text"
              id="fundingType"
              value={fundingType || 'يتم تحديده تلقائياً عند اختيار الدائرة'}
              className={`${inputClasses} bg-gray-600 cursor-not-allowed font-semibold`}
              readOnly
            />
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
          <div className="md:col-span-2">
            <label htmlFor="attachments" className={labelClasses}>المرفقات (صور أو PDF)</label>
            <input
              type="file"
              id="attachments"
              multiple
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-gray-500 transition-colors duration-200"
            />
            {attachments.length > 0 && (
                <div className="mt-3 text-sm text-gray-300 bg-gray-700 p-3 rounded-lg">
                    <p className="font-semibold mb-2">الملفات المحددة:</p>
                    <ul className="list-disc list-inside space-y-1">
                        {attachments.map((file, index) => (
                        <li key={index} className="truncate">
                            <i className="fas fa-file ml-2 text-gray-400"></i>
                            {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                        ))}
                    </ul>
                </div>
            )}
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
