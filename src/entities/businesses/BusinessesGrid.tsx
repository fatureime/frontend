import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { Business } from '../../services/api';
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
  if (error) {
    return (
      <div className="businesses-grid">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="businesses-grid">
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
              },
              {
                field: 'business_name',
                headerName: 'Emri i Biznesit',
                flex: 1,
              },
              {
                field: 'trade_name',
                headerName: 'Emri Tregtar',
                flex: 1,
              },
              {
                field: 'business_type',
                headerName: 'Lloji',
              },
              {
                field: 'fiscal_number',
                headerName: 'Numri Fiskal',
              },
              {
                field: 'vat_number',
                headerName: 'Numri TVSH',
              },
              {
                field: 'email',
                headerName: 'E-mail',
                flex: 1,
              },
              {
                field: 'phone',
                headerName: 'Telefoni',
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                valueGetter: (_value: unknown, row: Business) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'issuer',
                headerName: 'Lëshues',
                renderCell: (params: GridRenderCellParams<Business>) => {
                  const isIssuer = issuerBusinessId === params.row.id;
                  return isIssuer ? (
                    <span className="badge issuer">Biznesi Lëshues</span>
                  ) : null;
                },
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Business>) => {
                  const isIssuer = issuerBusinessId === params.row.id;
                  return (
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
                        onClick={() => onDelete(params.row.id)}
                        disabled={isIssuer}
                        title={isIssuer ? 'Nuk mund të fshihet subjekti lëshues' : ''}
                        sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                      >
                        Fshi
                      </Button>
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
          />
        </Box>
      )}
    </div>
  );
};

export default BusinessesGrid;
