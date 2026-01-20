import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Business } from '../../services/api';
import './BusinessesList.scss';

interface BusinessesListProps {
  businesses: Business[];
  loading: boolean;
  error: string | null;
  onView: (business: Business) => void;
  onEdit: (business: Business) => void;
  onDelete: (businessId: number) => void;
  issuerBusinessId?: number | null;
}

const BusinessesList = ({
  businesses,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  issuerBusinessId,
}: BusinessesListProps) => {
  if (error) {
    return (
      <div className="businesses-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="businesses-list">
      {businesses.length === 0 ? (
        <p className="no-businesses">Nuk u gjetën subjekte.</p>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={businesses}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
                minWidth: 40,
              },
              {
                field: 'business_name',
                headerName: 'Emri i Biznesit',
                flex: 1,
                minWidth: 100,
                renderCell: (params: GridRenderCellParams<Business>) => {
                  const isIssuer = issuerBusinessId === params.row.id;
                  return (
                    <span style={{ fontWeight: isIssuer ? 'bold' : 'normal' }}>
                      {params.row.business_name}
                    </span>
                  );
                },
              },
              {
                field: 'trade_name',
                headerName: 'Emri Tregtar',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'business_type',
                headerName: 'Lloji',
                minWidth: 100,
              },
              {
                field: 'fiscal_number',
                headerName: 'Numri Fiskal',
                minWidth: 100,
              },
              {
                field: 'vat_number',
                headerName: 'Numri TVSH',
                minWidth: 100,
              },
              {
                field: 'email',
                headerName: 'E-mail',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'phone',
                headerName: 'Telefoni',
                minWidth: 100,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Business) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Business>) => {
                  const isIssuer = issuerBusinessId === params.row.id;
                  return (
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
                        onClick={() => onDelete(params.row.id)}
                        disabled={isIssuer}
                        title={isIssuer ? 'Nuk mund të fshihet subjekti lëshues' : 'Fshi'}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                },
              },
            ]}
            getRowId={(row: Business) => row.id}
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
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default BusinessesList;
