import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, Chip, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tenant } from '../../services/api';
import './TenantsGrid.scss';

interface TenantsGridProps {
  tenants: Tenant[];
  loading: boolean;
  error: string | null;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenantId: number) => void;
  canDelete?: boolean;
}

const TenantsGrid = ({
  tenants,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  canDelete = false,
}: TenantsGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box className="tenants-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar hapësirëmarrësit...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="tenants-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="tenants-grid">
      {tenants.length === 0 ? (
        <Typography variant="body1" className="no-tenants" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën hapësirëmarrës.
        </Typography>
      ) : (
        <Box className="tenant-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {tenants.map((tenant) => (
            <Card key={tenant.id} className="tenant-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider', flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6" component="h3" sx={{ flex: 1, wordBreak: 'break-word' }}>
                    {tenant.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {tenant.is_admin && <Chip label="Menagjues" color="success" size="small" />}
                    {tenant.has_paid && <Chip label="I Paguar" color="primary" size="small" />}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>ID:</strong> {tenant.id}</Typography>
                  {tenant.issuer_business && (
                    <Typography variant="body2"><strong>Subjekti Lëshues:</strong> {tenant.issuer_business.business_name}</Typography>
                  )}
                  {tenant.users && (
                    <Typography variant="body2"><strong>Përdoruesit:</strong> {tenant.users.length}</Typography>
                  )}
                  {tenant.created_at && (
                    <Typography variant="body2"><strong>Krijuar:</strong> {new Date(tenant.created_at).toLocaleDateString()}</Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(tenant)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(tenant)}
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => onDelete(tenant.id)}
                        title="Fshi"
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </>
                ) : (
                  <>
                <Button size="small" variant="outlined" onClick={() => onView(tenant)}>
                  Shiko
                </Button>
                <Button size="small" variant="contained" onClick={() => onEdit(tenant)}>
                  Ndrysho
                </Button>
                {canDelete && (
                  <Button size="small" variant="outlined" color="error" onClick={() => onDelete(tenant.id)}>
                    Fshi
                  </Button>
                    )}
                  </>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default TenantsGrid;
