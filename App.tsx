import React, { useState, useMemo, useCallback } from 'react';
import { RetirementRecord } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DataEntryForm from './components/DataEntryForm';
import ArchiveSearch from './components/ArchiveSearch';
import Statistics from './components/Statistics';
import UnpaidDepartments from './components/UnpaidDepartments';

export type View = 'entry' | 'query' | 'stats' | 'unpaid';

function App() {
  const [view, setView] = useState<View>('entry');
  const [records, setRecords] = useLocalStorage<RetirementRecord[]>('retirementRecords', []);

  const departments = useMemo(() => {
    const departmentSet = new Set(records.map(record => record.departmentName));
    return Array.from(departmentSet);
  }, [records]);

  const handleAddRecord = useCallback((newRecord: RetirementRecord) => {
    setRecords(prevRecords => {
      const filteredRecords = prevRecords.filter(record => record.id !== newRecord.id);
      return [...filteredRecords, newRecord];
    });
  }, [setRecords]);

  return (
    <div className="bg-gray-200 min-h-screen text-gray-800 font-sans">
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-700 mb-2 font-pt-sans no-print">
          ارشفة التوقيفات التقاعدية
        </h1>
        <p className="text-center text-gray-500 mb-8 no-print">
          إدارة وإدخال وبحث بيانات الدوائر والمؤسسات بسهولة.
        </p>

        <div className="no-print">
          <Header activeView={view} setActiveView={setView} />
        </div>
        
        <div className="mt-8">
          {view === 'entry' && <DataEntryForm onAddRecord={handleAddRecord} departments={departments} />}
          {view === 'query' && <ArchiveSearch records={records} />}
          {view === 'stats' && <Statistics records={records} />}
          {view === 'unpaid' && <UnpaidDepartments records={records} />}
        </div>
      </main>
    </div>
  );
}

export default App;