import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { BankAccount, Business } from '../../services/api';
import './BankAccountsList.scss';

interface BankAccountWithBusiness extends BankAccount {
  business?: Business;
}

interface BankAccountsListProps {
  bankAccounts: BankAccountWithBusiness[];
  loading: boolean;
  error: string | null;
  onView: (bankAccount: BankAccountWithBusiness) => void;
  onEdit: (bankAccount: BankAccountWithBusiness) => void;
  onDelete: (bankAccount: BankAccountWithBusiness) => void;
}

const BankAccountsList = ({
  bankAccounts,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}: BankAccountsListProps) => {
  if (error) {
    return (
      <div className="bank-accounts-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="bank-accounts-list">
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
                minWidth: 100,
              },
              {
                field: 'business',
                headerName: 'Subjekti',
                flex: 1,
                minWidth: 100,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.business?.business_name || `Subjekti #${row.business_id}`,
              },
              {
                field: 'bank_name',
                headerName: 'Emri i Bankës',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'iban',
                headerName: 'IBAN',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'swift',
                headerName: 'SWIFT',
                minWidth: 100,
              },
              {
                field: 'bank_account_number',
                headerName: 'Numri i Llogarisë',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                minWidth: 100,
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
            sx={{
              width: '100%',
              maxWidth: '100%',
              '& .MuiDataGrid-columnHeaderTitle': {
                whiteSpace: 'normal',
                lineHeight: 1.5,
                textAlign: 'center',
              },
              '& .MuiDataGrid-columnHeader': {
                whiteSpace: 'normal',
                lineHeight: 1.5,
              },
              '& .MuiDataGrid-cell': {
                whiteSpace: 'normal',
                lineHeight: 1.5,
                wordBreak: 'break-word',
                display: 'flex',
                alignItems: 'center',
              },
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default BankAccountsList;
