import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box, Chip } from '@mui/material';
import { User } from '../../services/api';
import './UsersGrid.scss';

interface UsersGridProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  currentUserId?: number;
}

const UsersGrid = ({
  users,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  currentUserId,
}: UsersGridProps) => {
  if (error) {
    return (
      <div className="users-grid">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="users-grid">
      {users.length === 0 ? (
        <p className="no-users">Nuk u gjetën përdorues.</p>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={users}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
              },
              {
                field: 'email',
                headerName: 'E-mail',
                flex: 1,
              },
              {
                field: 'roles',
                headerName: 'Rolet',
                valueGetter: (_value: unknown, row: User) => 
                  row.roles?.join(', ') || 'ROLE_USER',
              },
              {
                field: 'is_active',
                headerName: 'Statusi',
                renderCell: (params: GridRenderCellParams<User>) => (
                  <Chip
                    label={params.row.is_active ? 'Aktiv' : 'Jo Aktiv'}
                    color={params.row.is_active ? 'success' : 'default'}
                    size="small"
                  />
                ),
              },
              {
                field: 'email_verified',
                headerName: 'Verifikuar',
                renderCell: (params: GridRenderCellParams<User>) => (
                  params.row.email_verified ? (
                    <Chip label="Po" color="success" size="small" />
                  ) : (
                    <Chip label="Jo" color="warning" size="small" />
                  )
                ),
              },
              {
                field: 'tenant',
                headerName: 'Hapësirëmarrësi',
                flex: 1,
                valueGetter: (_value: unknown, row: User) => 
                  row.tenant?.name || 'N/A',
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                valueGetter: (_value: unknown, row: User) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<User>) => {
                  const isCurrentUser = currentUserId === params.row.id;
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
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onDelete(params.row.id)}
                        disabled={isCurrentUser}
                        sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                      >
                        Delete
                      </Button>
                    </Box>
                  );
                },
              },
            ]}
            getRowId={(row: User) => row.id}
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

export default UsersGrid;
