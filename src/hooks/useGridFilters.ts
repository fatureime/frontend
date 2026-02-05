import { useState, useMemo, useCallback } from 'react';
import { FilterState, SortConfig, GridFilterConfig, FilterFieldConfig } from '../types/gridFilters';
import { extractUniqueRelationValues } from '../utils/gridFilterUtils';

export interface UseGridFiltersOptions<T> {
  data: T[];
  config?: GridFilterConfig;
  initialFilters?: FilterState;
  initialSort?: SortConfig;
}

export interface UseGridFiltersReturn<T> {
  filteredData: T[];
  filterState: FilterState;
  sortConfig: SortConfig;
  setFilter: (key: string, value: any) => void;
  setFilters: (filters: FilterState) => void;
  clearFilters: () => void;
  setSort: (sort: SortConfig) => void;
  activeFiltersCount: number;
  uniqueRelationValues: (relationField: string, idField?: string, nameField?: string) => Array<{ id: number; name: string }>;
}

export function useGridFilters<T = any>({
  data,
  config,
  initialFilters = {},
  initialSort,
}: UseGridFiltersOptions<T>): UseGridFiltersReturn<T> {
  const defaultSort = initialSort || config?.defaultSort || { field: '', direction: 'asc' as const };
  
  const [filterState, setFilterState] = useState<FilterState>(initialFilters);
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort);

  // Set individual filter
  const setFilter = useCallback((key: string, value: any) => {
    setFilterState(prev => ({ ...prev, [key]: value }));
  }, []);

  // Set multiple filters at once
  const setFilters = useCallback((filters: FilterState) => {
    setFilterState(filters);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilterState({});
  }, []);

  // Set sort
  const setSort = useCallback((sort: SortConfig) => {
    setSortConfig(sort);
  }, []);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterState.text?.trim()) count++;
    
    Object.keys(filterState).forEach(key => {
      if (key === 'text') return;
      const value = filterState[key];
      if (Array.isArray(value) && value.length > 0) count++;
      else if (value !== null && value !== undefined && value !== '') count++;
    });
    
    return count;
  }, [filterState]);

  // Get unique relation values
  const uniqueRelationValues = useCallback((
    relationField: string,
    idField: string = 'id',
    nameField: string = 'business_name'
  ) => {
    return extractUniqueRelationValues(data, relationField, idField, nameField);
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply text search
    if (filterState.text?.trim() && config?.textSearchFields) {
      const searchLower = filterState.text.toLowerCase().trim();
      filtered = filtered.filter((item: any) => {
        return config.textSearchFields!.some(field => {
          const value = item[field];
          if (value === null || value === undefined) return false;
          
          // Handle nested fields (e.g., issuer.business_name)
          if (field.includes('.')) {
            const parts = field.split('.');
            let nestedValue = item;
            for (const part of parts) {
              nestedValue = nestedValue?.[part];
              if (nestedValue === null || nestedValue === undefined) return false;
            }
            return String(nestedValue).toLowerCase().includes(searchLower);
          }
          
          return String(value).toLowerCase().includes(searchLower);
        });
      });
    }

    // Apply configured filters
    if (config?.filters) {
      config.filters.forEach((filterConfig: FilterFieldConfig) => {
        const filterKey = filterConfig.field;
        const filterValue = filterState[filterKey];
        
        if (filterValue === null || filterValue === undefined || filterValue === '') return;
        
        switch (filterConfig.type) {
          case 'multi-select':
          case 'relation-select':
            if (Array.isArray(filterValue) && filterValue.length > 0) {
              filtered = filtered.filter((item: any) => {
                if (filterConfig.type === 'relation-select') {
                  const relation = item[filterKey];
                  return relation && relation[filterConfig.relationIdField!] && 
                         filterValue.includes(relation[filterConfig.relationIdField!]);
                }
                
                // Handle boolean fields - filter values are strings ('true'/'false') but item values are booleans
                const itemValue = item[filterKey];
                if (typeof itemValue === 'boolean') {
                  // Convert filter string values to booleans for comparison
                  const booleanFilterValues = filterValue.map(v => v === 'true' || v === true);
                  return booleanFilterValues.includes(itemValue);
                }
                
                return filterValue.includes(itemValue);
              });
            }
            break;
            
          case 'date-range':
            const fromKey = `${filterKey}_from`;
            const toKey = `${filterKey}_to`;
            const fromValue = filterState[fromKey];
            const toValue = filterState[toKey];
            
            if (fromValue) {
              const fromDate = new Date(fromValue);
              fromDate.setHours(0, 0, 0, 0);
              filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item[filterKey]);
                itemDate.setHours(0, 0, 0, 0);
                return itemDate >= fromDate;
              });
            }
            
            if (toValue) {
              const toDate = new Date(toValue);
              toDate.setHours(23, 59, 59, 999);
              filtered = filtered.filter((item: any) => {
                const itemDate = new Date(item[filterKey]);
                itemDate.setHours(23, 59, 59, 999);
                return itemDate <= toDate;
              });
            }
            break;
            
          case 'number-range':
            const minKey = `${filterKey}_min`;
            const maxKey = `${filterKey}_max`;
            const minValue = filterState[minKey];
            const maxValue = filterState[maxKey];
            
            if (minValue) {
              const minNum = parseFloat(minValue);
              if (!isNaN(minNum)) {
                filtered = filtered.filter((item: any) => {
                  const itemValue = parseFloat(item[filterKey]);
                  return !isNaN(itemValue) && itemValue >= minNum;
                });
              }
            }
            
            if (maxValue) {
              const maxNum = parseFloat(maxValue);
              if (!isNaN(maxNum)) {
                filtered = filtered.filter((item: any) => {
                  const itemValue = parseFloat(item[filterKey]);
                  return !isNaN(itemValue) && itemValue <= maxNum;
                });
              }
            }
            break;
        }
      });
    }

    // Apply sorting
    if (sortConfig.field) {
      filtered.sort((a: any, b: any) => {
        let aValue: any;
        let bValue: any;
        
        // Use custom getValue if provided
        if (sortConfig.getValue) {
          aValue = sortConfig.getValue(a);
          bValue = sortConfig.getValue(b);
        } else {
          // Handle nested fields
          if (sortConfig.field.includes('.')) {
            const parts = sortConfig.field.split('.');
            aValue = parts.reduce((obj, part) => obj?.[part], a);
            bValue = parts.reduce((obj, part) => obj?.[part], b);
          } else {
            aValue = a[sortConfig.field];
            bValue = b[sortConfig.field];
          }
        }
        
        // Handle null/undefined
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        // Convert to comparable values
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        } else if (aValue instanceof Date || (typeof aValue === 'string' && /^\d{4}-\d{2}-\d{2}/.test(aValue))) {
          aValue = new Date(aValue).getTime();
          bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string' && !isNaN(parseFloat(aValue))) {
          aValue = parseFloat(aValue);
          bValue = parseFloat(bValue);
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filterState, sortConfig, config]);

  return {
    filteredData,
    filterState,
    sortConfig,
    setFilter,
    setFilters,
    clearFilters,
    setSort,
    activeFiltersCount,
    uniqueRelationValues,
  };
}
