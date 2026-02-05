import { useState, useMemo } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { GridFiltersProps, FilterFieldConfig, SortConfig } from '../types/gridFilters';
import { autoGenerateFilterConfig, mergeFilterConfig } from '../utils/gridFilterUtils';
import './GridFilters.scss';

export default function GridFilters<T = any>({
  data,
  filterConfig,
  filterState,
  onFilterChange,
  sortConfig,
  onSortChange,
  statusLabels,
  className,
}: GridFiltersProps<T>) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [filterPanelExpanded, setFilterPanelExpanded] = useState(false);

  // Auto-generate filter configuration
  const filters = useMemo(() => {
    const autoConfig = autoGenerateFilterConfig(data);
    return mergeFilterConfig(autoConfig, filterConfig);
  }, [data, filterConfig]);

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

  // Clear all filters
  const clearAllFilters = () => {
    onFilterChange({});
  };

  // Handle filter change
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filterState, [key]: value });
  };

  // Handle sort
  const handleSort = (field: string) => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    // Find the sort field config to get the getValue function
    const sortFieldConfig = filterConfig?.sortFields?.find(sf => sf.field === field);
    onSortChange({
      field,
      direction: newDirection,
      getValue: sortFieldConfig?.getValue,
    });
  };

  // Get unique relation values
  const getRelationValues = (filter: FilterFieldConfig): Array<{ id: number; name: string }> => {
    if (filter.type !== 'relation-select') return [];
    
    const valuesMap = new Map<number, { id: number; name: string }>();
    data.forEach((item: any) => {
      const relation = item[filter.field];
      if (relation && relation[filter.relationIdField!] && relation[filter.relationField!]) {
        const id = relation[filter.relationIdField!];
        if (!valuesMap.has(id)) {
          valuesMap.set(id, {
            id,
            name: relation[filter.relationField!],
          });
        }
      }
    });
    
    return Array.from(valuesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Render filter field
  const renderFilterField = (filter: FilterFieldConfig) => {
    const filterKey = filter.field;
    const currentValue = filterState[filterKey];

    switch (filter.type) {
      case 'text':
        return (
          <Grid item xs={12} sm={6} md={4} key={filterKey}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TextField
                fullWidth
                label={filter.label}
                value={currentValue || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(filterKey, e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              {filterConfig?.sortFields?.some(sf => sf.field === filterKey) && (
                <IconButton
                  size="small"
                  onClick={() => handleSort(filterKey)}
                  sx={{
                    color: sortConfig.field === filterKey ? 'primary.main' : 'action.disabled',
                    '&:hover': { color: 'primary.main' },
                  }}
                  title={`Rendit sipas ${filter.label}`}
                >
                  {sortConfig.field === filterKey && sortConfig.direction === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Box>
          </Grid>
        );

      case 'multi-select':
      case 'relation-select':
        const options = filter.type === 'relation-select'
          ? getRelationValues(filter)
          : filter.options || [];
        
        const selectedValues = currentValue || [];
        const getLabel = (value: string | number) => {
          if (filter.type === 'relation-select') {
            const option = options.find((opt: any) => opt.id === value);
            return option?.name || value;
          }
          if (filterKey === 'status' && statusLabels) {
            return statusLabels[String(value)] || value;
          }
          return String(value);
        };

        return (
          <Grid item xs={12} sm={6} md={4} key={filterKey}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Select
                fullWidth
                multiple
                value={selectedValues}
                onChange={(e: { target: { value: unknown } }) => {
                  const value = filter.type === 'relation-select'
                    ? (e.target.value as number[]).map(v => typeof v === 'object' ? (v as any).id : v)
                    : e.target.value;
                  handleFilterChange(filterKey, value);
                }}
                size="small"
                displayEmpty
                renderValue={(selected: unknown) => {
                  const selectedArray = selected as (string | number)[];
                  if (selectedArray.length === 0) {
                    return `Të gjitha ${filter.label.toLowerCase()}`;
                  }
                  return selectedArray.map(val => getLabel(val)).join(', ');
                }}
              >
                {options.map((option: any) => {
                  const value = filter.type === 'relation-select' ? option.id : option.value;
                  const label = filter.type === 'relation-select' ? option.name : option.label;
                  return (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  );
                })}
              </Select>
              {filterConfig?.sortFields?.some(sf => sf.field === filterKey || sf.field === `${filterKey}.${filter.relationField}`) && (
                <IconButton
                  size="small"
                  onClick={() => handleSort(filter.type === 'relation-select' ? `${filterKey}.${filter.relationField}` : filterKey)}
                  sx={{
                    color: sortConfig.field === filterKey || sortConfig.field === `${filterKey}.${filter.relationField}` ? 'primary.main' : 'action.disabled',
                    '&:hover': { color: 'primary.main' },
                  }}
                  title={`Rendit sipas ${filter.label}`}
                >
                  {(sortConfig.field === filterKey || sortConfig.field === `${filterKey}.${filter.relationField}`) && sortConfig.direction === 'asc' ? (
                    <ArrowUpwardIcon fontSize="small" />
                  ) : (
                    <ArrowDownwardIcon fontSize="small" />
                  )}
                </IconButton>
              )}
            </Box>
          </Grid>
        );

      case 'date-range':
        const fromKey = `${filterKey}_from`;
        const toKey = `${filterKey}_to`;
        const fromValue = filterState[fromKey] || '';
        const toValue = filterState[toKey] || '';

        return (
          <>
            <Grid item xs={12} sm={6} md={4} key={fromKey}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  fullWidth
                  label={`${filter.label} Nga`}
                  type="date"
                  value={fromValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(fromKey, e.target.value)}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                {filterConfig?.sortFields?.some(sf => sf.field === filterKey) && (
                  <IconButton
                    size="small"
                    onClick={() => handleSort(filterKey)}
                    sx={{
                      color: sortConfig.field === filterKey ? 'primary.main' : 'action.disabled',
                      '&:hover': { color: 'primary.main' },
                    }}
                    title={`Rendit sipas ${filter.label}`}
                  >
                    {sortConfig.field === filterKey && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4} key={toKey}>
              <TextField
                fullWidth
                label={`${filter.label} Deri`}
                type="date"
                value={toValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(toKey, e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        );

      case 'number-range':
        const minKey = `${filterKey}_min`;
        const maxKey = `${filterKey}_max`;
        const minValue = filterState[minKey] || '';
        const maxValue = filterState[maxKey] || '';

        return (
          <>
            <Grid item xs={12} sm={6} md={4} key={minKey}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TextField
                  fullWidth
                  label={`${filter.label} Min`}
                  type="number"
                  value={minValue}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(minKey, e.target.value)}
                  size="small"
                  inputProps={{ min: 0, step: 0.01 }}
                />
                {filterConfig?.sortFields?.some(sf => sf.field === filterKey) && (
                  <IconButton
                    size="small"
                    onClick={() => handleSort(filterKey)}
                    sx={{
                      color: sortConfig.field === filterKey ? 'primary.main' : 'action.disabled',
                      '&:hover': { color: 'primary.main' },
                    }}
                    title={`Rendit sipas ${filter.label}`}
                  >
                    {sortConfig.field === filterKey && sortConfig.direction === 'asc' ? (
                      <ArrowUpwardIcon fontSize="small" />
                    ) : (
                      <ArrowDownwardIcon fontSize="small" />
                    )}
                  </IconButton>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4} key={maxKey}>
              <TextField
                fullWidth
                label={`${filter.label} Max`}
                type="number"
                value={maxValue}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(maxKey, e.target.value)}
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
          </>
        );

      default:
        return null;
    }
  };

  // Render active filter chips
  const renderActiveFilterChips = () => {
    const chips: JSX.Element[] = [];

    if (filterState.text?.trim()) {
      chips.push(
        <Chip
          key="text"
          label={`Kërkim: "${filterState.text}"`}
          onDelete={() => handleFilterChange('text', '')}
          size="small"
          color="primary"
          variant="outlined"
        />
      );
    }

    filters.forEach((filter) => {
      const filterKey = filter.field;
      const value = filterState[filterKey];

      if (filter.type === 'multi-select' || filter.type === 'relation-select') {
        if (Array.isArray(value) && value.length > 0) {
          value.forEach((val: string | number) => {
            const label = filter.type === 'relation-select'
              ? getRelationValues(filter).find(opt => opt.id === val)?.name || val
              : (filterKey === 'status' && statusLabels ? statusLabels[String(val)] : String(val));
            chips.push(
              <Chip
                key={`${filterKey}-${val}`}
                label={`${filter.label}: ${label}`}
                onDelete={() => {
                  const newValue = (value as (string | number)[]).filter(v => v !== val);
                  handleFilterChange(filterKey, newValue);
                }}
                size="small"
                color="primary"
                variant="outlined"
              />
            );
          });
        }
      } else if (filter.type === 'date-range') {
        const fromKey = `${filterKey}_from`;
        const toKey = `${filterKey}_to`;
        if (filterState[fromKey]) {
          chips.push(
            <Chip
              key={fromKey}
              label={`${filter.label} nga: ${new Date(filterState[fromKey]).toLocaleDateString()}`}
              onDelete={() => handleFilterChange(fromKey, '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          );
        }
        if (filterState[toKey]) {
          chips.push(
            <Chip
              key={toKey}
              label={`${filter.label} deri: ${new Date(filterState[toKey]).toLocaleDateString()}`}
              onDelete={() => handleFilterChange(toKey, '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          );
        }
      } else if (filter.type === 'number-range') {
        const minKey = `${filterKey}_min`;
        const maxKey = `${filterKey}_max`;
        if (filterState[minKey]) {
          chips.push(
            <Chip
              key={minKey}
              label={`${filter.label} min: ${parseFloat(filterState[minKey]).toFixed(2)} €`}
              onDelete={() => handleFilterChange(minKey, '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          );
        }
        if (filterState[maxKey]) {
          chips.push(
            <Chip
              key={maxKey}
              label={`${filter.label} max: ${parseFloat(filterState[maxKey]).toFixed(2)} €`}
              onDelete={() => handleFilterChange(maxKey, '')}
              size="small"
              color="primary"
              variant="outlined"
            />
          );
        }
      }
    });

    return chips;
  };

  const filterContent = (
    <Grid container spacing={2}>
      {/* Text search if configured */}
      {filterConfig?.textSearchFields && filterConfig.textSearchFields.length > 0 && (
        <Grid item xs={12} sm={6} md={4}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <TextField
              fullWidth
              label="Kërko..."
              value={filterState.text || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('text', e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Grid>
      )}

      {/* Render all filter fields */}
      {filters.map(renderFilterField)}

      {/* Clear All Button */}
      {activeFiltersCount > 0 && (
        <Grid item xs={12}>
          <Button
            startIcon={<ClearIcon />}
            onClick={clearAllFilters}
            size="small"
            variant="outlined"
            color="secondary"
          >
            Pastro të gjitha filtrat
          </Button>
        </Grid>
      )}
    </Grid>
  );

  return (
    <Box className={className}>
      {isMobile ? (
        <Accordion
          expanded={filterPanelExpanded}
          onChange={() => setFilterPanelExpanded(!filterPanelExpanded)}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <FilterListIcon />
              <Typography variant="subtitle1">Filtrat</Typography>
              {activeFiltersCount > 0 && (
                <Chip
                  label={activeFiltersCount}
                  size="small"
                  color="primary"
                  sx={{ ml: 1 }}
                />
              )}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Paper sx={{ p: 2 }}>{filterContent}</Paper>
          </AccordionDetails>
        </Accordion>
      ) : (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterListIcon />
            <Typography variant="subtitle1">Filtrat</Typography>
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          {filterContent}
        </Paper>
      )}

      {/* Active Filters Chips */}
      {activeFiltersCount > 0 && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Filtrat aktive:
          </Typography>
          {renderActiveFilterChips()}
        </Box>
      )}
    </Box>
  );
}
