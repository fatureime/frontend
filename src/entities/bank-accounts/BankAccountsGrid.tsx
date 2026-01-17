import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { BankAccount, Business } from '../../services/api';
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
}

const BankAccountsGrid = ({
  bankAccounts,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}: BankAccountsGridProps) => {
  if (error) {
    return (
      <div className="bank-accounts-grid">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="bank-accounts-grid">
      {bankAccounts.length === 0 ? (
        <p className="no-bank-accounts">Nuk u gjetën llogari bankare.</p>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={bankAccounts}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
                width: 80,
              },
              {
                field: 'business',
                headerName: 'Subjekti',
                flex: 1,
                minWidth: 200,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.business?.business_name || `Subjekti #${row.business_id}`,
              },
              {
                field: 'bank_name',
                headerName: 'Emri i Bankës',
                flex: 1,
                minWidth: 150,
              },
              {
                field: 'iban',
                headerName: 'IBAN',
                flex: 1,
                minWidth: 200,
              },
              {
                field: 'swift',
                headerName: 'SWIFT',
                width: 120,
              },
              {
                field: 'bank_account_number',
                headerName: 'Numri i Llogarisë',
                flex: 1,
                minWidth: 150,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                width: 150,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                width: 250,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onView(params.row)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Shiko
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onEdit(params.row)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Ndrysho
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onDelete(params.row)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Fshi
                    </Button>
                  </Box>
                ),
              },
            ]}
            getRowId={(row: BankAccountWithBusiness) => `${row.business_id}-${row.id}`}
            disableRowSelectionOnClick
            pageSizeOptions={[10, 25, 50]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            loading={loading}
          />
        </Box>
      )}
    </div>
  );
};

export default BankAccountsGrid;
