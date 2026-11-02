import React, { useState } from 'react';
import ImportDataset from './ImportDataset';
import ImportHistory from './ImportHistory';
import AllocateAthletes from './AllocateAthletes';

const DataAcquisitionDashboard = () => {
  const [activeTab, setActiveTab] = useState('import');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Management & Acquisition</h1>
        <p className="text-muted-foreground mt-2">
          Import external datasets and allocate athlete records to organizations.
        </p>
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="border-b px-4">
          <nav className="flex space-x-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('import')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'import'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              Import Dataset
            </button>
            <button
              onClick={() => setActiveTab('allocate')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'allocate'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              Allocate to Organization
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
              }`}
            >
              Import History
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'import' && <ImportDataset />}
          {activeTab === 'allocate' && <AllocateAthletes />}
          {activeTab === 'history' && <ImportHistory />}
        </div>
      </div>
    </div>
  );
};

export default DataAcquisitionDashboard;
