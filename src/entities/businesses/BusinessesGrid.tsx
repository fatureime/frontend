import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Business } from '../../services/api';
import { useGridFilters } from '../../hooks/useGridFilters';
import GridFilters from '../../components/GridFilters';
import { GridFilterConfig } from '../../types/gridFilters';
import './BusinessesGrid.scss';

interface BusinessesGridProps {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  onView: (business: Business) => void;
  onEdit: (business: Business) => void;
  onDelete: (businessId: number) => void;
  issuerBusinessId?: number | null;
}

const BusinessesGrid = ({
  businesses,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  issuerBusinessId,
}: BusinessesGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Configure filters for businesses
  const filterConfig: GridFilterConfig = {
    textSearchFields: ['business_name', 'trade_name', 'fiscal_number', 'vat_number', 'email', 'phone'],
    filters: [
      {
        type: 'date-range',
        field: 'registration_date',
        label: 'Data e Regjistrimit',
      },
      {
        type: 'date-range',
        field: 'created_at',
        label: 'Data e Krijimit',
      },
      {
        type: 'number-range',
        field: 'number_of_employees',
        label: 'Numri i Punëtorëve',
      },
      {
        type: 'relation-select',
        field: 'created_by',
        label: 'Krijuar Nga',
        relationField: 'email',
        relationIdField: 'id',
      },
      {
        type: 'relation-select',
        field: 'tenant',
        label: 'Hapësirëmarrësi',
        relationField: 'name',
        relationIdField: 'id',
      },
    ],
    sortFields: [
      { field: 'business_name', label: 'Emri i Biznesit' },
      { field: 'trade_name', label: 'Emri Tregtar' },
      { field: 'registration_date', label: 'Data e Regjistrimit' },
      { field: 'created_at', label: 'Data e Krijimit' },
      { field: 'number_of_employees', label: 'Numri i Punëtorëve' },
      { 
        field: 'created_by.email', 
        label: 'Krijuar Nga',
        getValue: (item: Business) => item.created_by?.email || '',
      },
      { 
        field: 'tenant.name', 
        label: 'Hapësirëmarrësi',
        getValue: (item: Business) => item.tenant?.name || '',
      },
    ],
    defaultSort: {
      field: 'created_at',
      direction: 'desc',
    },
  };

  // Use the grid filters hook
  const {
    filteredData: filteredAndSortedBusinesses,
    filterState,
    sortConfig,
    setFilters,
    setSort,
  } = useGridFilters<Business>({
    data: businesses,
    config: filterConfig,
    initialSort: filterConfig.defaultSort,
  });

  if (loading) {
    return (
      <Box className="businesses-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar subjektet...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="businesses-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <div className="businesses-grid">
      {businesses.length === 0 ? (
        <Typography variant="body1" className="no-businesses">Nuk u gjetën subjekte.</Typography>
      ) : (
        <>
          {/* Filter Panel */}
          <GridFilters
            data={businesses}
            filterConfig={filterConfig}
            filterState={filterState}
            onFilterChange={setFilters}
            sortConfig={sortConfig}
            onSortChange={setSort}
          />

          {/* Results count */}
          {filteredAndSortedBusinesses.length !== businesses.length && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {filteredAndSortedBusinesses.length} nga {businesses.length} subjekte
            </Typography>
          )}

          {/* Business Cards */}
          {filteredAndSortedBusinesses.length === 0 ? (
            <Typography variant="body1" className="no-businesses" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
              Nuk u gjetën subjekte që përputhen me filtrat.
            </Typography>
          ) : (
            <Box className="business-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
              {filteredAndSortedBusinesses.map((business) => {
            const isIssuer = issuerBusinessId === business.id;
            return (
              <Card key={business.id} className="business-card" sx={{ display: 'flex', flexDirection: 'column' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', overflow: 'hidden' }}>
                    {business.logo && (
                      <Box
                        component="img"
                        src={business.logo}
                        alt={`${business.business_name} logo`}
                        sx={{ maxWidth: '100px', maxHeight: '60px', objectFit: 'contain', flexShrink: 0 }}
                      />
                    )}
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        flex: 1, 
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {business.business_name}
                    </Typography>
                    {isIssuer && (
                      <Chip label="Biznesi i juaj" color="success" size="small" sx={{ flexShrink: 0 }} />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {business.trade_name && (
                      <Typography variant="body2">
                        <strong>Emri tregtar:</strong> {business.trade_name}
                      </Typography>
                    )}
                    {business.business_type && (
                      <Typography variant="body2">
                        <strong>Lloji i subjektit:</strong> {business.business_type}
                      </Typography>
                    )}
                    {business.fiscal_number && (
                      <Typography variant="body2">
                        <strong>Numri Fiskal:</strong> {business.fiscal_number}
                      </Typography>
                    )}
                    {business.vat_number && (
                      <Typography variant="body2">
                        <strong>Numri i TVSH-së:</strong> {business.vat_number}
                      </Typography>
                    )}
                    {business.business_number && (
                      <Typography variant="body2">
                        <strong>Numri i biznesit:</strong> {business.business_number}
                      </Typography>
                    )}
                    {business.unique_identifier_number && (
                      <Typography variant="body2">
                        <strong>Numri unik identifikues:</strong> {business.unique_identifier_number}
                      </Typography>
                    )}
                    {business.number_of_employees !== undefined && business.number_of_employees !== null && (
                      <Typography variant="body2">
                        <strong>Numri punëtorëve:</strong> {business.number_of_employees}
                      </Typography>
                    )}
                    {business.municipality && (
                      <Typography variant="body2">
                        <strong>Komuna:</strong> {business.municipality}
                      </Typography>
                    )}
                    {business.email && (
                      <Typography variant="body2">
                        <strong>E-mail:</strong> {business.email}
                      </Typography>
                    )}
                    {business.phone && (
                      <Typography variant="body2">
                        <strong>Telefoni:</strong> {business.phone}
                      </Typography>
                    )}
                    {business.created_by && (
                      <Typography variant="body2">
                        <strong>Krijuar nga:</strong> {business.created_by.email}
                      </Typography>
                    )}
                    {business.created_at && (
                      <Typography variant="body2">
                        <strong>Krijuar:</strong> {new Date(business.created_at).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  {isMobile ? (
                    <>
                      <IconButton
                        size="small"
                        onClick={() => onView(business)}
                        title="Shiko"
                        color="primary"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onEdit(business)}
                        title="Ndrysho"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(business.id)}
                        disabled={isIssuer}
                        title={isIssuer ? 'Nuk mund të fshihet subjekti lëshues' : 'Fshi'}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </>
                  ) : (
                    <>
                  <Button size="small" variant="outlined" onClick={() => onView(business)}>
                    Shiko
                  </Button>
                  <Button size="small" variant="contained" onClick={() => onEdit(business)}>
                    Ndrysho
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => onDelete(business.id)}
                    disabled={isIssuer}
                    title={isIssuer ? 'Nuk mund të fshihet subjekti lëshues' : ''}
                  >
                    Fshi
                  </Button>
                    </>
                  )}
                </CardActions>
              </Card>
            );
          })}
            </Box>
          )}
        </>
      )}
    </div>
  );
};

export default BusinessesGrid;
