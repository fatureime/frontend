import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, Chip, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../services/api';
import './UsersList.scss';

interface UsersListProps {
  users: User[];
  loading: boolean;
  error: string | null;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  currentUserId?: number;
}

const UsersList = ({
  users,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  currentUserId,
}: UsersListProps) => {
  if (error) {
    return (
      <div className="users-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="users-list">
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
                minWidth: 40,
              },
              {
                field: 'email',
                headerName: 'E-mail',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'roles',
                headerName: 'Rolet',
                minWidth: 100,
                valueGetter: (_value: unknown, row: User) => 
                  row.roles?.join(', ') || 'ROLE_USER',
              },
              {
                field: 'is_active',
                headerName: 'Statusi',
                minWidth: 100,
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
                minWidth: 100,
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
                minWidth: 100,
                valueGetter: (_value: unknown, row: User) => 
                  row.tenant?.name || 'N/A',
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: User) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<User>) => {
                  const isCurrentUser = currentUserId === params.row.id;
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
                        title="Edit"
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onDelete(params.row.id)}
                        disabled={isCurrentUser}
                        title={isCurrentUser ? 'Cannot delete current user' : 'Delete'}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
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

export default UsersList;
