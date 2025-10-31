import React, { useMemo, useState, useEffect } from 'react';
import { RetirementRecord } from '../types';
import { ministryDepartments, ministriesWithCentralFunding, ministriesWithSelfFunding } from './DataEntryForm';

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
    className="bg-gray-700 p-6 rounded-lg flex items-center gap-4 w-full text-right hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
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

const Statistics: React.FC<StatisticsProps> = ({ records }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<{ title: string; data: Record<string, string[]> } | null>(null);

  useEffect(() => {
    const body = document.body;
    if (isModalOpen) {
      body.classList.add('print-modal-active');
    } else {
      body.classList.remove('print-modal-active');
    }

    // Cleanup function to remove the class when the component unmounts
    return () => {
      body.classList.remove('print-modal-active');
    };
  }, [isModalOpen]);

  const departmentDetails = useMemo(() => {
    const all = new Map<string, Set<string>>();
    const central = new Map<string, Set<string>>();
    const self = new Map<string, Set<string>>();

    for (const ministry in ministryDepartments) {
      const departments = ministryDepartments[ministry];
      for (const departmentName of departments) {
        // Add to 'all' map
        if (!all.has(ministry)) all.set(ministry, new Set());
        all.get(ministry)!.add(departmentName);

        // Determine funding type and add to respective map
        let fundingType = '';
        if (departmentName === 'شبكة الحماية الاجتماعية في البصرة') {
          fundingType = 'مركزي';
        } else if (departmentName === 'دائرة التقاعد والضمان الاجتماعي البصرة') {
          fundingType = 'ذاتي';
        } else if (ministriesWithCentralFunding.includes(ministry)) {
          fundingType = 'مركزي';
        } else if (ministriesWithSelfFunding.includes(ministry)) {
          fundingType = 'ذاتي';
        }
        
        if (fundingType === 'مركزي') {
            if (!central.has(ministry)) central.set(ministry, new Set());
            central.get(ministry)!.add(departmentName);
        } else if (fundingType === 'ذاتي') {
            if (!self.has(ministry)) self.set(ministry, new Set());
            self.get(ministry)!.add(departmentName);
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

  // Fix: Explicitly type the accumulator `acc` as `number` to prevent faulty type inference to `unknown`.
  const uniqueDepartmentsCount = useMemo(() => Object.values(departmentDetails.all).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.all]);
  const centralFundingDepartmentsCount = useMemo(() => Object.values(departmentDetails.central).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.central]);
  const selfFundingDepartmentsCount = useMemo(() => Object.values(departmentDetails.self).reduce((acc: number, depts) => acc + (depts as string[]).length, 0), [departmentDetails.self]);

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
    try {
      window.print();
    } catch (error) {
      console.error("Printing failed:", error);
      alert("فشلت عملية الطباعة. قد تكون هناك قيود في المتصفح أو البيئة الحالية تمنع فتح نافذة الطباعة.");
    }
  };

  return (
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 statistics-cards-container">
        <StatCard 
          icon="fa-sitemap" 
          title="عدد الدوائر الكلي" 
          value={uniqueDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-teal-500 text-white" 
          onClick={() => openModal('all')}
        />
        <StatCard 
          icon="fa-building-columns" 
          title="دوائر التمويل المركزي" 
          value={centralFundingDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-blue-500 text-white" 
          onClick={() => openModal('central')}
        />
        <StatCard 
          icon="fa-wallet" 
          title="دوائر التمويل الذاتي" 
          value={selfFundingDepartmentsCount.toLocaleString('ar-IQ')} 
          color="bg-green-500 text-white" 
          onClick={() => openModal('self')}
        />
      </div>

      {isModalOpen && modalData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 modal-overlay">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-container">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 modal-print-hide no-print">
              <h3 className="text-xl font-bold text-white">{modalData.title}</h3>
              <div>
                <button onClick={handlePrint} className="text-gray-400 hover:text-white mr-4 transition-colors" aria-label="Print">
                  <i className="fas fa-print text-xl"></i>
                </button>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors" aria-label="Close">
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>

            <div className="hidden print-only p-4">
              <h1 className="text-xl font-bold text-black">{modalData.title}</h1>
              <p className="text-sm text-black">تاريخ الطباعة: {new Date().toLocaleDateString('ar-IQ')}</p>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {Object.keys(modalData.data).length > 0 ? Object.entries(modalData.data).map(([ministry, departments]) => (
                <div key={ministry} className="mb-6 page-break-inside-avoid">
                  <h4 className="text-lg font-bold text-teal-400 border-b-2 border-teal-500 pb-2 mb-3">
                    {ministry}
                    <span className="print-inline-text">(العدد: {(departments as string[]).length})</span>
                  </h4>
                  <ul className="space-y-2 text-gray-300 pr-4 list-disc list-inside">
                    {(departments as string[]).map(deptName => (
                      <li key={deptName}>{deptName}</li>
                    ))}
                  </ul>
                </div>
              )) : (
                 <p className="text-center text-gray-400 p-6">لا توجد دوائر لعرضها في هذا التصنيف.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;