import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { BankAccount, Business } from '../../services/api';
import { useGridFilters } from '../../hooks/useGridFilters';
import GridFilters from '../../components/GridFilters';
import { GridFilterConfig } from '../../types/gridFilters';
import './BankAccountsGrid.scss';

interface BankAccountWithBusiness extends BankAccount {
  business?: Business;
}

interface BankAccountsGridProps {
  bankAccounts: BankAccountWithBusiness[];
  loading: boolean;
  error: string | null;
  onView: (bankAccount: BankAccountWithBusiness) => void;
  onEdit: (bankAccount: BankAccountWithBusiness) => void;
  onDelete: (bankAccount: BankAccountWithBusiness) => void;
  isAdminTenant?: boolean;
  businessesCount?: number;
}

const BankAccountsGrid = ({
  bankAccounts,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  isAdminTenant,
  businessesCount = 0,
}: BankAccountsGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Configure filters for bank accounts
  const filterConfig: GridFilterConfig = {
    textSearchFields: ['bank_name', 'swift', 'iban', 'bank_account_number'],
    filters: [
      {
        type: 'date-range',
        field: 'created_at',
        label: 'Data e Krijimit',
      },
      {
        type: 'relation-select',
        field: 'business',
        label: 'Biznesi',
        relationField: 'business_name',
        relationIdField: 'id',
      },
    ],
    sortFields: [
      { field: 'bank_name', label: 'Emri i Bankës' },
      { field: 'swift', label: 'SWIFT' },
      { field: 'iban', label: 'IBAN' },
      { field: 'bank_account_number', label: 'Numri i Llogarisë' },
      { field: 'created_at', label: 'Data e Krijimit' },
      { 
        field: 'business.business_name', 
        label: 'Biznesi',
        getValue: (item: BankAccountWithBusiness) => item.business?.business_name || '',
      },
    ],
    defaultSort: {
      field: 'created_at',
      direction: 'desc',
    },
  };

  // Use the grid filters hook
  const {
    filteredData: filteredAndSortedBankAccounts,
    filterState,
    sortConfig,
    setFilters,
    setSort,
  } = useGridFilters<BankAccountWithBusiness>({
    data: bankAccounts,
    config: filterConfig,
    initialSort: filterConfig.defaultSort,
  });

  if (loading) {
    return (
      <Box className="bank-accounts-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar llogaritë bankare...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="bank-accounts-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="bank-accounts-grid">
      {bankAccounts.length === 0 ? (
        <Typography variant="body1" className="no-bank-accounts" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          {businessesCount === 0 
            ? 'Nuk u gjetën subjekte. Ju lutem krijoni një subjekt fillimisht.'
            : 'Nuk u gjetën llogari bankare. Klikoni "Krijo Llogari Bankare" për të shtuar një të re.'}
        </Typography>
      ) : (
        <>
          {/* Filter Panel */}
          <GridFilters
            data={bankAccounts}
            filterConfig={filterConfig}
            filterState={filterState}
            onFilterChange={setFilters}
            sortConfig={sortConfig}
            onSortChange={setSort}
          />

          {/* Results count */}
          {filteredAndSortedBankAccounts.length !== bankAccounts.length && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {filteredAndSortedBankAccounts.length} nga {bankAccounts.length} llogari bankare
            </Typography>
          )}

          {/* Bank Account Cards */}
          {filteredAndSortedBankAccounts.length === 0 ? (
            <Typography variant="body1" className="no-bank-accounts" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
              Nuk u gjetën llogari bankare që përputhen me filtrat.
            </Typography>
          ) : (
            <Box className="bank-account-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
              {filteredAndSortedBankAccounts.map((bankAccount) => (
            <Card key={`${bankAccount.business_id}-${bankAccount.id}`} className="bank-account-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                    {bankAccount.business?.business_name || `Subjekti #${bankAccount.business_id}`}
                  </Typography>
                  {isAdminTenant && bankAccount.business && (
                    <Chip label={bankAccount.business.business_name} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1976d2' }} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {bankAccount.bank_name && (
                    <Typography variant="body2"><strong>Emri i bankës:</strong> {bankAccount.bank_name}</Typography>
                  )}
                  {bankAccount.swift && (
                    <Typography variant="body2"><strong>SWIFT:</strong> {bankAccount.swift}</Typography>
                  )}
                  {bankAccount.iban && (
                    <Typography variant="body2"><strong>IBAN:</strong> {bankAccount.iban}</Typography>
                  )}
                  {bankAccount.bank_account_number && (
                    <Typography variant="body2"><strong>Numri i llogarisë:</strong> {bankAccount.bank_account_number}</Typography>
                  )}
                  {bankAccount.created_at && (
                    <Typography variant="body2"><strong>Krijuar:</strong> {new Date(bankAccount.created_at).toLocaleDateString()}</Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(bankAccount)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(bankAccount)}
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(bankAccount)}
                      title="Fshi"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                <Button size="small" variant="outlined" onClick={() => onView(bankAccount)}>
                  Shiko
                </Button>
                <Button size="small" variant="contained" onClick={() => onEdit(bankAccount)}>
                  Ndrysho
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => onDelete(bankAccount)}>
                  Fshi
                </Button>
                  </>
                )}
              </CardActions>
            </Card>
              ))}
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default BankAccountsGrid;
