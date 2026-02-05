export type FilterType = 'text' | 'multi-select' | 'date-range' | 'number-range' | 'relation-select';

export type SortDirection = 'asc' | 'desc';

export interface FilterFieldConfig {
  type: FilterType;
  field: string;
  label: string;
  relationField?: string; // For relation-select, the field to extract (e.g., 'business_name' from issuer)
  relationIdField?: string; // For relation-select, the ID field (e.g., 'id')
  options?: Array<{ value: string | number; label: string }>; // For multi-select
  getValue?: (item: any) => any; // Custom value extractor
  getLabel?: (item: any) => string; // Custom label extractor for options
}

export interface FilterState {
  text?: string;
  [key: string]: any; // Dynamic filter values
}

export interface SortConfig {
  field: string;
  direction: SortDirection;
  getValue?: (item: any) => any; // Custom value extractor for sorting
}

export interface GridFilterConfig {
  textSearchFields?: string[]; // Fields to search in text filter
  filters?: FilterFieldConfig[]; // Manual filter configuration
  sortFields?: Array<{
    field: string;
    label: string;
    getValue?: (item: any) => any;
  }>;
  defaultSort?: {
    field: string;
    direction: SortDirection;
  };
}

export interface GridFiltersProps<T = any> {
  data: T[];
  filterConfig?: GridFilterConfig;
  filterState: FilterState;
  onFilterChange: (filters: FilterState) => void;
  sortConfig: SortConfig;
  onSortChange: (sort: SortConfig) => void;
  statusLabels?: Record<string, string>; // For status fields
  className?: string;
}
