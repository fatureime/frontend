import { FilterFieldConfig, GridFilterConfig } from '../types/gridFilters';

/**
 * Detects the type of a field value
 */
export function detectFieldType(value: any): 'string' | 'number' | 'date' | 'object' | 'array' | 'null' {
  if (value === null || value === undefined) return 'null';
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object' && value instanceof Date) return 'date';
  if (typeof value === 'object') return 'object';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    // Check if it's a date string
    if (/^\d{4}-\d{2}-\d{2}/.test(value) && !isNaN(Date.parse(value))) {
      return 'date';
    }
    // Check if it's a number string
    if (!isNaN(parseFloat(value)) && isFinite(parseFloat(value))) {
      return 'number';
    }
    return 'string';
  }
  return 'string';
}

/**
 * Extracts unique values from a relation field
 */
export function extractUniqueRelationValues<T>(
  data: T[],
  relationField: string,
  idField: string = 'id',
  nameField: string = 'business_name'
): Array<{ id: number; name: string }> {
  const valuesMap = new Map<number, { id: number; name: string }>();
  
  data.forEach((item: any) => {
    const relation = item[relationField];
    if (relation && relation[idField] && relation[nameField]) {
      if (!valuesMap.has(relation[idField])) {
        valuesMap.set(relation[idField], {
          id: relation[idField],
          name: relation[nameField],
        });
      }
    }
  });
  
  return Array.from(valuesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Extracts unique values for a field
 */
export function extractUniqueValues<T>(data: T[], field: string): any[] {
  const values = new Set<any>();
  data.forEach((item: any) => {
    const value = item[field];
    if (value !== null && value !== undefined && value !== '') {
      values.add(value);
    }
  });
  return Array.from(values).sort();
}

/**
 * Auto-generates filter configuration from data structure
 */
export function autoGenerateFilterConfig<T>(
  data: T[],
  sampleItem?: T
): FilterFieldConfig[] {
  if (!data.length && !sampleItem) return [];
  
  const item = sampleItem || data[0];
  if (!item) return [];
  
  const configs: FilterFieldConfig[] = [];
  const itemObj = item as any;
  
  // Analyze each field
  Object.keys(itemObj).forEach((key) => {
    // Skip internal fields
    if (key.startsWith('_') || key === 'id' || key === 'items') return;
    
    const value = itemObj[key];
    const fieldType = detectFieldType(value);
    
    // Handle relation objects (e.g., issuer, receiver)
    if (fieldType === 'object' && value && typeof value === 'object' && !Array.isArray(value)) {
      if (value.id && value.business_name) {
        configs.push({
          type: 'relation-select',
          field: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          relationField: 'business_name',
          relationIdField: 'id',
        });
      }
      return;
    }
    
    // Handle date fields
    if (fieldType === 'date' || (key.includes('date') || key.includes('Date'))) {
      configs.push({
        type: 'date-range',
        field: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      });
      return;
    }
    
    // Handle number fields
    if (fieldType === 'number' || (key.includes('total') || key.includes('price') || key.includes('amount'))) {
      configs.push({
        type: 'number-range',
        field: key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      });
      return;
    }
    
    // Handle enum/status fields (limited unique values)
    if (fieldType === 'string') {
      const uniqueValues = extractUniqueValues(data, key);
      // If it's a small set of unique values, treat as multi-select
      if (uniqueValues.length > 1 && uniqueValues.length <= 10) {
        configs.push({
          type: 'multi-select',
          field: key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          options: uniqueValues.map(val => ({ value: val, label: String(val) })),
        });
      }
    }
  });
  
  return configs;
}

/**
 * Merges manual config with auto-generated config
 */
export function mergeFilterConfig(
  autoConfig: FilterFieldConfig[],
  manualConfig?: GridFilterConfig
): FilterFieldConfig[] {
  if (!manualConfig?.filters) return autoConfig;
  
  // Use manual config if provided, otherwise use auto-generated
  return manualConfig.filters.map(manualFilter => {
    const autoFilter = autoConfig.find(f => f.field === manualFilter.field);
    return {
      ...autoFilter,
      ...manualFilter, // Manual config overrides auto-generated
    };
  });
}
