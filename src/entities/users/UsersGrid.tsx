import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { User } from '../../services/api';
import { useGridFilters } from '../../hooks/useGridFilters';
import GridFilters from '../../components/GridFilters';
import { GridFilterConfig } from '../../types/gridFilters';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Configure filters for users
  const filterConfig: GridFilterConfig = {
    textSearchFields: ['email'],
    filters: [
      {
        type: 'multi-select',
        field: 'is_active',
        label: 'Statusi',
        options: [
          { value: 'true', label: 'Aktiv' },
          { value: 'false', label: 'Jo Aktiv' },
        ],
      },
      {
        type: 'multi-select',
        field: 'email_verified',
        label: 'Verifikimi i Email',
        options: [
          { value: 'true', label: 'I Verifikuar' },
          { value: 'false', label: 'I Paverifikuar' },
        ],
      },
      {
        type: 'date-range',
        field: 'created_at',
        label: 'Data e Krijimit',
      },
      {
        type: 'relation-select',
        field: 'tenant',
        label: 'Hapësirëmarrësi',
        relationField: 'name',
        relationIdField: 'id',
      },
    ],
    sortFields: [
      { field: 'email', label: 'Email' },
      { 
        field: 'is_active', 
        label: 'Statusi',
        getValue: (item: User) => item.is_active ? 'Aktiv' : 'Jo Aktiv',
      },
      { 
        field: 'email_verified', 
        label: 'Verifikimi',
        getValue: (item: User) => item.email_verified ? 'I Verifikuar' : 'I Paverifikuar',
      },
      { field: 'created_at', label: 'Data e Krijimit' },
      { 
        field: 'tenant.name', 
        label: 'Hapësirëmarrësi',
        getValue: (item: User) => item.tenant?.name || '',
      },
    ],
    defaultSort: {
      field: 'created_at',
      direction: 'desc',
    },
  };

  // Use the grid filters hook
  const {
    filteredData: filteredAndSortedUsers,
    filterState,
    sortConfig,
    setFilters,
    setSort,
  } = useGridFilters<User>({
    data: users,
    config: filterConfig,
    initialSort: filterConfig.defaultSort,
  });

  if (loading) {
    return (
      <Box className="users-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar përdoruesit...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="users-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="users-grid">
      {users.length === 0 ? (
        <Typography variant="body1" className="no-users" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën përdorues.
        </Typography>
      ) : (
        <>
          {/* Filter Panel */}
          <GridFilters
            data={users}
            filterConfig={filterConfig}
            filterState={filterState}
            onFilterChange={setFilters}
            sortConfig={sortConfig}
            onSortChange={setSort}
          />

          {/* Results count */}
          {filteredAndSortedUsers.length !== users.length && (
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {filteredAndSortedUsers.length} nga {users.length} përdorues
            </Typography>
          )}

          {/* User Cards */}
          {filteredAndSortedUsers.length === 0 ? (
            <Typography variant="body1" className="no-users" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
              Nuk u gjetën përdorues që përputhen me filtrat.
            </Typography>
          ) : (
            <Box className="user-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
              {filteredAndSortedUsers.map((userItem) => (
            <Card key={userItem.id} className="user-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ flex: 1, wordBreak: 'break-word' }}>
                    {userItem.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {userItem.roles?.includes('ROLE_ADMIN') && (
                      <Chip label="Menagjues" color="success" size="small" />
                    )}
                    {userItem.is_active ? (
                      <Chip label="Aktiv" color="primary" size="small" />
                    ) : (
                      <Chip label="Jo Aktiv" size="small" />
                    )}
                    {!userItem.email_verified && (
                      <Chip label="I Paverifikuar" color="warning" size="small" />
                    )}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>ID:</strong> {userItem.id}</Typography>
                  <Typography variant="body2"><strong>Rolet:</strong> {userItem.roles?.join(', ') || 'ROLE_USER'}</Typography>
                  {userItem.tenant && (
                    <Typography variant="body2"><strong>Hapësirëmarrësi:</strong> {userItem.tenant.name}</Typography>
                  )}
                  {userItem.created_at && (
                    <Typography variant="body2"><strong>Krijuar:</strong> {new Date(userItem.created_at).toLocaleDateString()}</Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(userItem)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(userItem)}
                      title="Edit"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(userItem.id)}
                      disabled={userItem.id === currentUserId}
                      title={userItem.id === currentUserId ? 'Cannot delete current user' : 'Delete'}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                <Button size="small" variant="outlined" onClick={() => onView(userItem)}>
                  Shiko
                </Button>
                <Button size="small" variant="contained" onClick={() => onEdit(userItem)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => onDelete(userItem.id)}
                  disabled={userItem.id === currentUserId}
                >
                  Delete
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

export default UsersGrid;
