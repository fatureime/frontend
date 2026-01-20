import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box, Chip, IconButton, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
                minWidth: 100,
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'is_admin',
                headerName: 'Menagjues',
                minWidth: 100,
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
                minWidth: 100,
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
                minWidth: 100,
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.issuer_business?.business_name || 'N/A',
              },
              {
                field: 'users',
                headerName: 'Përdoruesit',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.users?.length || 0,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Tenant) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tenant>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {isMobile ? (
                      <>
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
                        {canDelete && (
                          <IconButton
                            size="small"
                            onClick={() => onDelete(params.row.id)}
                            title="Fshi"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                      </>
                    ) : (
                      <>
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
                      </>
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

export default TenantsList;
