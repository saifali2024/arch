import React, { useMemo, useState } from 'react';
import { RetirementRecord } from '../types';

interface StatisticsProps {
  records: RetirementRecord[];
}

const formatCurrency = (value: number) => {
    if (value === 0) return '0';
    return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD', minimumFractionDigits: 0 }).format(value);
};


const StatCard: React.FC<{ icon: string; title: string; value: string | number; color: string }> = ({ icon, title, value, color }) => (
  <div className="bg-gray-700 p-6 rounded-lg flex items-center gap-4 h-full">
    <div className={`text-3xl p-3 rounded-full ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const BarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 0), [data]);
    const colors = ['bg-sky-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500', 'bg-amber-500'];

    return (
        <div className="bg-gray-700 p-4 rounded-lg h-80 flex items-end justify-around gap-2">
        {data.length > 0 ? data.map((item, index) => (
            <div key={item.label} className="flex-1 flex flex-col items-center justify-end h-full">
            <div 
                className={`w-full rounded-t-md transition-all duration-500 ${colors[index % colors.length]}`}
                style={{ height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%` }}
                title={`${item.label}: ${formatCurrency(item.value)}`}
            ></div>
            <p className="text-xs text-gray-300 mt-2">{item.label}</p>
            </div>
        )) : <p className="text-gray-400">لا توجد بيانات كافية لعرض الرسم البياني.</p>}
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const totalValue = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);
    const colors = ['#38bdf8', '#2dd4bf', '#818cf8', '#f43f5e', '#f59e0b', '#10b981', '#6366f1', '#ec4899'];
    
    const gradientParts = useMemo(() => {
        let cumulativePercent = 0;
        return data.map((item, index) => {
            const percent = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
            const start = cumulativePercent;
            cumulativePercent += percent;
            const end = cumulativePercent;
            return `${colors[index % colors.length]} ${start}% ${end}%`;
        });
    }, [data, totalValue]);

    const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

    return (
        <div className="bg-gray-700 p-4 rounded-lg flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
                <div 
                    className="w-full h-full rounded-full"
                    style={{ background: conicGradient }}
                ></div>
                <div className="absolute inset-4 bg-gray-700 rounded-full"></div>
            </div>
            <div className="flex-1">
                <ul className="space-y-2 text-sm">
                    {data.map((item, index) => (
                        <li key={item.label} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                                <span className="text-gray-300">{item.label}</span>
                            </div>
                            <span className="font-semibold text-white">{formatCurrency(item.value)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};


const Statistics: React.FC<StatisticsProps> = ({ records }) => {
  const [departmentsModalVisible, setDepartmentsModalVisible] = useState(false);
  const [unpaidModalVisible, setUnpaidModalVisible] = useState(false);

  const months = useMemo(() => [
    { value: 1, name: 'كانون الثاني' }, { value: 2, name: 'شباط' }, { value: 3, name: 'آذار' },
    { value: 4, name: 'نيسان' }, { value: 5, name: 'أيار' }, { value: 6, name: 'حزيران' },
    { value: 7, name: 'تموز' }, { value: 8, name: 'آب' }, { value: 9, name: 'أيلول' },
    { value: 10, name: 'تشرين الأول' }, { value: 11, name: 'تشرين الثاني' }, { value: 12, name: 'كانون الأول' }
  ], []);

  const generalStats = useMemo(() => {
    const totalDeductions = records.reduce((sum, r) => sum + r.deduction10 + r.deduction15 + r.deduction25, 0);
    const totalSalaries = records.reduce((sum, r) => sum + r.totalSalaries, 0);
    const uniqueDepartments = new Set(records.map(r => r.departmentName)).size;
    return {
      totalRecords: records.length,
      totalDeductions,
      totalSalaries,
      uniqueDepartments,
    };
  }, [records]);

  const yearlyStats = useMemo(() => {
    const statsByYear: { [year: number]: number } = {};
    records.forEach(r => {
        const totalDeductions = r.deduction10 + r.deduction15 + r.deduction25;
        statsByYear[r.year] = (statsByYear[r.year] || 0) + totalDeductions;
    });
    return Object.entries(statsByYear)
        .map(([year, value]) => ({ label: year, value }))
        .sort((a, b) => a.label.localeCompare(b.label));
  }, [records]);

  const ministryStats = useMemo(() => {
    const statsByMinistry: { [ministry: string]: number } = {};
    records.forEach(r => {
        const totalDeductions = r.deduction10 + r.deduction15 + r.deduction25;
        statsByMinistry[r.ministry] = (statsByMinistry[r.ministry] || 0) + totalDeductions;
    });
    return Object.entries(statsByMinistry)
        .map(([ministry, value]) => ({ label: ministry, value }))
        .sort((a, b) => b.value - a.value) // Sort descending by value
        .slice(0, 7); // Show top 7 for clarity
  }, [records]);
  
  const departmentsByMinistry = useMemo(() => {
    const grouped = new Map<string, Set<string>>();
    records.forEach(r => {
        if (!grouped.has(r.ministry)) {
            grouped.set(r.ministry, new Set<string>());
        }
        grouped.get(r.ministry)!.add(r.departmentName);
    });
    const result: Record<string, string[]> = {};
    const sortedMinistries = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'ar'));

    for (const ministry of sortedMinistries) {
        result[ministry] = Array.from(grouped.get(ministry)!).sort((a, b) => a.localeCompare(b, 'ar'));
    }
    return result;
  }, [records]);

  const ministryDepartments: Record<string, string[]> = {
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

  const unpaidStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const unpaidByMinistry: Record<string, Record<string, number[]>> = {};

    const paidRecordsSet = new Set(
        records
            .filter(r => r.year === currentYear)
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

    for (const ministry in unpaidByMinistry) {
        const sortedDepts: Record<string, number[]> = {};
        Object.keys(unpaidByMinistry[ministry]).sort((a,b) => a.localeCompare(b, 'ar')).forEach(dept => {
            sortedDepts[dept] = unpaidByMinistry[ministry][dept];
        });
        unpaidByMinistry[ministry] = sortedDepts;
    }
    
    const unpaidCount = Object.values(unpaidByMinistry).reduce((acc, depts) => acc + Object.keys(depts).length, 0);

    return {
        data: unpaidByMinistry,
        count: unpaidCount,
        year: currentYear
    };
  }, [records, ministryDepartments]);


  const handlePrintModal = () => {
    window.print();
  };

  if (records.length === 0) {
    return (
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg text-center text-gray-400">
        <i className="fas fa-info-circle text-4xl mb-4"></i>
        <p>لا توجد بيانات مسجلة لعرض الإحصائيات.</p>
        <p>يرجى إضافة بعض السجلات أولاً من قسم "إدخال البيانات".</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">ملخص عام</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon="fa-file-alt" title="إجمالي السجلات" value={generalStats.totalRecords.toLocaleString('ar-IQ')} color="bg-blue-500 text-white" />
            <StatCard icon="fa-building" title="الدوائر المسجلة" value={generalStats.uniqueDepartments.toLocaleString('ar-IQ')} color="bg-green-500 text-white" />
            <StatCard icon="fa-money-bill-wave" title="مجموع الرواتب" value={formatCurrency(generalStats.totalSalaries)} color="bg-yellow-500 text-white" />
            <StatCard icon="fa-percent" title="مجموع التوقيفات" value={formatCurrency(generalStats.totalDeductions)} color="bg-red-500 text-white" />
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">تقارير تفصيلية</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div onClick={() => setDepartmentsModalVisible(true)} className="cursor-pointer transition-transform transform hover:scale-105">
                <StatCard icon="fa-sitemap" title="عرض الدوائر حسب الوزارة" value={`إجمالي ${generalStats.uniqueDepartments}`} color="bg-teal-500 text-white" />
            </div>
            <div onClick={() => setUnpaidModalVisible(true)} className="cursor-pointer transition-transform transform hover:scale-105">
                <StatCard icon="fa-file-invoice-dollar" title={`الدوائر غير المسددة (${unpaidStats.year})`} value={`${unpaidStats.count} دائرة`} color="bg-orange-500 text-white" />
            </div>
            <div className="opacity-60 cursor-not-allowed">
                <StatCard icon="fa-chart-line" title="قريباً..." value="تقرير سنوي" color="bg-gray-600 text-white" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">إجمالي التوقيفات حسب السنة</h3>
            <BarChart data={yearlyStats} />
        </div>
        <div className="lg:col-span-2">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">أعلى الوزارات (توقيفات)</h3>
            <DonutChart data={ministryStats} />
        </div>
      </div>

      {departmentsModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 modal-overlay no-print">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col modal-container">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center modal-print-hide">
                    <h3 className="text-xl font-bold">الدوائر حسب الوزارة</h3>
                    <div>
                        <button onClick={handlePrintModal} className="text-gray-400 hover:text-white p-2 rounded-full transition" title="طباعة">
                            <i className="fas fa-print text-lg"></i>
                        </button>
                        <button onClick={() => setDepartmentsModalVisible(false)} className="text-gray-400 hover:text-white p-2 rounded-full transition mr-2" title="إغلاق">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                   {Object.keys(departmentsByMinistry).length > 0 ? Object.entries(departmentsByMinistry).map(([ministry, departments]: [string, string[]]) => (
                       <div key={ministry} className="mb-6 page-break-inside-avoid">
                           <h4 className="text-lg font-bold text-teal-400 border-b-2 border-teal-500 pb-2 mb-3">{ministry}</h4>
                           <ul className="list-disc list-inside space-y-1 text-gray-300 pr-4">
                               {departments.map(dept => (
                                   <li key={dept}>{dept}</li>
                               ))}
                           </ul>
                       </div>
                   )) : <p className="text-center text-gray-400">لا توجد دوائر لعرضها.</p>}
                </div>
            </div>
        </div>
      )}

      {unpaidModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 modal-overlay no-print">
            <div className="bg-gray-800 text-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col modal-container">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center modal-print-hide">
                    <h3 className="text-xl font-bold">{`الدوائر غير المسددة لعام ${unpaidStats.year}`}</h3>
                    <div>
                        <button onClick={handlePrintModal} className="text-gray-400 hover:text-white p-2 rounded-full transition" title="طباعة">
                            <i className="fas fa-print text-lg"></i>
                        </button>
                        <button onClick={() => setUnpaidModalVisible(false)} className="text-gray-400 hover:text-white p-2 rounded-full transition mr-2" title="إغلاق">
                            <i className="fas fa-times text-2xl"></i>
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto">
                   {Object.keys(unpaidStats.data).length > 0 ? Object.entries(unpaidStats.data).map(([ministry, departments]) => (
                       <div key={ministry} className="mb-6 page-break-inside-avoid">
                           <h4 className="text-lg font-bold text-orange-400 border-b-2 border-orange-500 pb-2 mb-3">{ministry}</h4>
                           <ul className="space-y-2 text-gray-300 pr-4">
                               {Object.entries(departments).map(([deptName, unpaidMonths]) => (
                                   <li key={deptName}>
                                       <span className="font-semibold">{deptName}:</span>
                                       <span className="text-sm text-red-400 mr-2">
                                           {unpaidMonths.map(m => months.find(mon => mon.value === m)?.name).join('، ')}
                                       </span>
                                   </li>
                               ))}
                           </ul>
                       </div>
                   )) : <p className="text-center text-gray-400">جميع الدوائر قامت بتسديد مستحقاتها لهذا العام.</p>}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;