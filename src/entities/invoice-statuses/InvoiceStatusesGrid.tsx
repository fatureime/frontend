import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
import { InvoiceStatus } from '../../services/api';
import { getStatusLabel } from '../../utils/invoiceStatusLabels';
import './InvoiceStatusesGrid.scss';

interface InvoiceStatusesGridProps {
  statuses: InvoiceStatus[];
  loading: boolean;
  error: string | null;
  onView: (status: InvoiceStatus) => void;
  onEdit: (status: InvoiceStatus) => void;
  onEditLabel: (status: InvoiceStatus) => void;
  onDelete: (statusId: number) => void;
  canEdit?: boolean;
  labels?: Record<string, string>;
}

const InvoiceStatusesGrid = ({
  statuses,
  loading,
  error,
  onView,
  onEdit,
  onEditLabel,
  onDelete,
  canEdit = false,
  labels = {},
}: InvoiceStatusesGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box className="invoice-statuses-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar gjendje të faturave...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="invoice-statuses-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="invoice-statuses-grid">
      {statuses.length === 0 ? (
        <Typography variant="body1" className="no-statuses" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën gjendje të faturave.
        </Typography>
      ) : (
        <Box className="status-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {statuses.map((status) => (
            <Card key={status.id} className="status-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  {status.code}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>Etiketa:</strong> {labels[status.code] || getStatusLabel(status.code)}</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(status)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(status)}
                          title="Ndrysho Kod"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onEditLabel(status)}
                          title="Ndrysho Etiketë"
                          color="primary"
                        >
                          <EditNoteIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(status.id)}
                          title="Fshi"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </>
                ) : (
                  <>
                <Button size="small" variant="outlined" onClick={() => onView(status)}>
                  Shiko
                </Button>
                {canEdit && (
                  <>
                    <Button size="small" variant="contained" onClick={() => onEdit(status)}>
                      Ndrysho Kod
                    </Button>
                    <Button size="small" variant="contained" onClick={() => onEditLabel(status)}>
                      Ndrysho Etiketë
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => onDelete(status.id)}>
                      Fshi
                    </Button>
                      </>
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

export default InvoiceStatusesGrid;
