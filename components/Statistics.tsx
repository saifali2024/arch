

import React, { useMemo, useState, useEffect, useRef } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments, getFundingType } from './DataEntryForm';

interface StatisticsProps {
  records: RetirementRecord[];
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string | number;
  color: string;
  onClick: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, color, onClick }) => (
  <button 
    onClick={onClick} 
    className="bg-slate-700 p-6 rounded-lg flex items-center gap-4 w-full text-right hover:bg-slate-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-blue-500"
  >
    <div className={`text-3xl p-3 rounded-full ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </button>
);

const PieChart = ({ chartData, title }: { chartData: any, title: string }) => {
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
            const ctx = chartRef.current.getContext('2d');
            if (ctx) {
                chartInstanceRef.current = new (window as any).Chart(ctx, {
                    type: 'pie',
                    data: chartData,
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    color: '#e2e8f0',
                                    font: {
                                        family: "'Cairo', sans-serif",
                                        size: 14
                                    }
                                }
                            },
                            title: {
                                display: true,
                                text: title,
                                color: '#fcd34d',
                                font: {
                                    family: "'Cairo', sans-serif",
                                    size: 16,
                                    weight: 'bold'
                                }
                            },
                        },
                    },
                });
            }
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [chartData, title]);

    return <canvas ref={chartRef} />;
};


const Statistics: React.FC<StatisticsProps> = ({ records }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; data: Record<string, string[]> } | null>(null);

  const departmentDetails = useMemo(() => {
    const all = new Map<string, Set<string>>();
    const central = new Map<string, Set<string>>();
    const self = new Map<string, Set<string>>();

    for (const ministry in ministryDepartments) {
      const departments = ministryDepartments[ministry];
      for (const dept of departments) {
        // Add to 'all' map
        if (!all.has(ministry)) all.set(ministry, new Set());
        all.get(ministry)!.add(dept.name);

        // Determine funding type and add to respective map
        const fundingType = getFundingType(ministry, dept.name);
        
        if (fundingType === 'مركزي') {
            if (!central.has(ministry)) central.set(ministry, new Set());
            central.get(ministry)!.add(dept.name);
        } else if (fundingType === 'ذاتي') {
            if (!self.has(ministry)) self.set(ministry, new Set());
            self.get(ministry)!.add(dept.name);
        }
      }
    }
    
    const mapToObject = (map: Map<string, Set<string>>): Record<string, string[]> => {
        const obj: Record<string, string[]> = {};
        const sortedMinistries = Array.from(map.keys()).sort((a,b) => a.localeCompare(b, 'ar'));
        sortedMinistries.forEach(ministry => {
            obj[ministry] = Array.from(map.get(ministry)!).sort((a,b) => a.localeCompare(b, 'ar'));
        });
        return obj;
    };

    return {
        all: mapToObject(all),
        central: mapToObject(central),
        self: mapToObject(self),
    };
  }, []);
  
  const totalEmployeeCount = useMemo(() => {
    const latestRecordsMap = new Map<string, RetirementRecord>();

    for (const record of records) {
        const existingRecord = latestRecordsMap.get(record.departmentName);

        if (!existingRecord) {
            latestRecordsMap.set(record.departmentName, record);
        } else {
            const existingDate = (existingRecord.year * 100) + existingRecord.month;
            const currentDate = (record.year * 100) + record.month;

            if (currentDate > existingDate) {
                latestRecordsMap.set(record.departmentName, record);
            }
        }
    }

    const total = Array.from(latestRecordsMap.values()).reduce((sum, record) => sum + (record.employeeCount || 0), 0);
    
    return total;
  }, [records]);

  const uniqueDepartmentsCount = useMemo(() => Object.values(departmentDetails.all).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.all]);
  const centralFundingDepartmentsCount = useMemo(() => Object.values(departmentDetails.central).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.central]);
  const selfFundingDepartmentsCount = useMemo(() => Object.values(departmentDetails.self).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.self]);
  
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

  const paymentStatusCounts = useMemo(() => {
    if (isGracePeriodActive) {
      return { paid: uniqueDepartmentsCount, unpaid: 0 };
    }
    const paidInCurrentMonth = new Set(
      records
        .filter(r => r.year === currentYear && r.month === currentMonth)
        .map(r => r.departmentName)
    );
    const paidCount = paidInCurrentMonth.size;
    const unpaidCount = uniqueDepartmentsCount - paidCount;
    return { paid: paidCount, unpaid: unpaidCount };
  }, [records, currentYear, currentMonth, uniqueDepartmentsCount, isGracePeriodActive]);


  const fundingChartData = useMemo(() => ({
    labels: ['التمويل الذاتي', 'التمويل المركزي'],
    datasets: [{
        label: 'عدد الدوائر',
        data: [selfFundingDepartmentsCount, centralFundingDepartmentsCount],
        backgroundColor: ['#f59e0b', '#3b82f6'],
        borderColor: '#1e293b',
        borderWidth: 2,
    }],
  }), [selfFundingDepartmentsCount, centralFundingDepartmentsCount]);

  const paymentStatusChartData = useMemo(() => ({
    labels: ['مسدد', 'غير مسدد'],
    datasets: [{
        label: 'عدد الدوائر',
        data: [paymentStatusCounts.paid, paymentStatusCounts.unpaid],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: '#1e293b',
        borderWidth: 2,
    }],
  }), [paymentStatusCounts]);

  const openModal = (type: 'all' | 'central' | 'self') => {
    if (type === 'all') {
        setModalData({ title: 'كافة الدوائر حسب الوزارة', data: departmentDetails.all });
    } else if (type === 'central') {
        setModalData({ title: 'دوائر التمويل المركزي حسب الوزارة', data: departmentDetails.central });
    } else {
        setModalData({ title: 'دوائر التمويل الذاتي حسب الوزارة', data: departmentDetails.self });
    }
    setIsModalOpen(true);
  };
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 statistics-cards-container">
        <StatCard 
          icon="fa-sitemap" 
          title="عدد الدوائر الكلي" 
          value={uniqueDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-blue-500 text-white" 
          onClick={() => openModal('all')}
        />
        <StatCard 
          icon="fa-users" 
          title="عدد الموظفين الكلي" 
          value={totalEmployeeCount.toLocaleString('ar-IQ')} 
          color="bg-green-500 text-white" 
          onClick={() => {}}
        />
        <StatCard 
          icon="fa-building-columns" 
          title="دوائر التمويل المركزي" 
          value={centralFundingDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-amber-500 text-white" 
          onClick={() => openModal('central')}
        />
        <StatCard 
          icon="fa-wallet" 
          title="دوائر التمويل الذاتي" 
          value={selfFundingDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-blue-500 text-white" 
          onClick={() => openModal('self')}
        />
      </div>
      
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 no-print">
        <div className="bg-slate-700 p-4 rounded-lg shadow-lg relative h-80 sm:h-96">
            <PieChart chartData={fundingChartData} title="توزيع الدوائر حسب نوع التمويل" />
        </div>
        <div className="bg-slate-700 p-4 rounded-lg shadow-lg relative h-80 sm:h-96">
            <PieChart chartData={paymentStatusChartData} title={`حالة تسديد الدوائر لشهر ${currentMonthName}`} />
        </div>
      </div>

      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 printable-section">
          <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-container">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 modal-print-hide no-print">
              <h3 className="text-xl font-bold text-white">{modalData.title}</h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrint} 
                  className="flex items-center gap-2 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200">
                  <i className="fas fa-print"></i>
                  <span>طباعة</span>
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-gray-400 hover:text-white transition-colors duration-200" 
                  aria-label="إغلاق"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="print-header">
                  <h1 className="font-pt-sans">{modalData.title}</h1>
                  <p className="subtitle font-pt-sans">
                      عدد الدوائر الكلي: {Object.values(modalData.data).reduce((acc: number, depts) => acc + (depts as string[]).length, 0)}
                  </p>
              </div>
              <div className="space-y-6">
                {Object.entries(modalData.data).map(([ministry, departments]) => (
                  <div key={ministry} className="print-list-section">
                    <h4 className="flex justify-between items-baseline text-lg font-bold text-blue-400 border-b-2 border-blue-500 pb-2 mb-3">
                      <span>{ministry}</span>
                      <span>
                        <span className="text-sm font-normal bg-blue-900 text-blue-300 px-2 py-1 rounded-md no-print">
                          {(departments as string[]).length} دائرة
                        </span>
                        <span className="print-inline-text">({(departments as string[]).length} دائرة)</span>
                      </span>
                    </h4>
                    <ul className="list-disc pr-6 space-y-2 text-gray-300">
                      {(departments as string[]).map(dept => <li key={dept}>{dept}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;