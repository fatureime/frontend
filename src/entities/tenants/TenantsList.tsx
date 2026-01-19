import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box, Chip } from '@mui/material';
import { Tenant } from '../../services/api';
import './TenantsList.scss';

interface TenantsListProps {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenantId: number) => void;
  canDelete?: boolean;
}

const TenantsList = ({
  tenants,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  canDelete = false,
}: TenantsListProps) => {
  if (error) {
    return (
      <div className="tenants-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="tenants-list">
      {tenants.length === 0 ? (
        <p className="no-tenants">Nuk u gjetën hapësirëmarrës.</p>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={tenants}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
              },
              {
                field: 'is_admin',
                headerName: 'Menagjues',
                renderCell: (params: GridRenderCellParams<Tenant>) => (
                  params.row.is_admin ? (
                    <Chip label="Po" color="success" size="small" />
                  ) : (
                    <Chip label="Jo" size="small" />
                  )
                ),
              },
              {
                field: 'has_paid',
                headerName: 'I Paguar',
                renderCell: (params: GridRenderCellParams<Tenant>) => (
                  params.row.has_paid ? (
                    <Chip label="Po" color="success" size="small" />
                  ) : (
                    <Chip label="Jo" size="small" />
                  )
                ),
              },
              {
                field: 'issuer_business',
                headerName: 'Subjekti Lëshues',
                flex: 1,
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.issuer_business?.business_name || 'N/A',
              },
              {
                field: 'users',
                headerName: 'Përdoruesit',
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.users?.length || 0,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tenant>) => (
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
                    {canDelete && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(params.row.id)}
                        sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                      >
                        Fshi
                      </Button>
                    )}
                  </Box>
                ),
              },
            ]}
            getRowId={(row: Tenant) => row.id}
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

export default TenantsList;
