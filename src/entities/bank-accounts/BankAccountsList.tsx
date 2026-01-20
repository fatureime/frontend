import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
                minWidth: 40,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'business',
                headerName: 'Subjekti',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.business?.business_name || `Subjekti #${row.business_id}`,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'bank_name',
                headerName: 'Emri i Bankës',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'iban',
                headerName: 'IBAN',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'swift',
                headerName: 'SWIFT',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'bank_account_number',
                headerName: 'Numri i Llogarisë',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                valueGetter: (_value: unknown, row: BankAccountWithBusiness) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                flex: 0,
                minWidth: 140,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<BankAccountWithBusiness>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onView(params.row)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(params.row)}
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(params.row)}
                      title="Fshi"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
                lineHeight: 1.5,
                wordBreak: { xs: 'break-word', sm: 'normal' },
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-cell[data-field="actions"]': {
                overflow: 'visible',
                minWidth: '140px !important',
              },
              '& .MuiDataGrid-columnHeader[data-field="actions"]': {
                minWidth: '140px !important',
              },
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default BankAccountsList;
