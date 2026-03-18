'use client';

import { useState, useCallback } from 'react';
import { FilterBar } from '@/components/list/FilterBar';
import { ProspectTable } from '@/components/list/ProspectTable';

export default function ListPage() {
  const [filteredCount, setFilteredCount] = useState(0);

  const handleFilteredCount = useCallback((n: number) => {
    setFilteredCount(n);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <FilterBar filteredCount={filteredCount} />
      <div className="flex-1 overflow-auto">
        <ProspectTable onFilteredCount={handleFilteredCount} />
      </div>
    </div>
  );
}
