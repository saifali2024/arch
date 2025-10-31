import React, { useMemo, useState } from 'react';
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
    document.body.classList.add('printing-active');
    setTimeout(() => {
        try {
          window.print();
        } catch (error) {
          console.error("Printing failed:", error);
          alert("فشلت عملية الطباعة. قد تكون هناك قيود في المتصفح أو البيئة الحالية تمنع فتح نافذة الطباعة.");
        }
    }, 100); // A small delay ensures the browser applies the 'printing-active' class before generating the preview.
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
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 modal-overlay printable-section">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col modal-container">
            <div className="flex justify-between items-center p-4 border-b border-gray-700 modal-print-hide no-print">
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
                      {/* FIX: Add type assertion to depts to fix 'unknown' type error. */}
                      عدد الدوائر الكلي: {Object.values(modalData.data).reduce((acc: number, depts) => acc + (depts as string[]).length, 0)}
                  </p>
              </div>
              <div className="space-y-6">
                {Object.entries(modalData.data).map(([ministry, departments]) => (
                  <div key={ministry} className="print-list-section">
                    <h4 className="text-lg font-bold text-blue-400 border-b-2 border-blue-500 pb-2 mb-3">
                      {ministry}
                      {/* FIX: Add type assertion to departments to fix 'unknown' type error. */}
                      <span className="print-inline-text">({(departments as string[]).length} دائرة)</span>
                    </h4>
                    <ul className="list-disc pr-6 space-y-2 text-gray-300">
                      {/* FIX: Add type assertion to departments to fix 'unknown' type error. */}
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