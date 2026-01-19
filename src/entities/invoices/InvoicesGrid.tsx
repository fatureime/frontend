import { Link } from 'react-router-dom';
import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, Select, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Invoice, InvoiceStatus } from '../../services/api';
import './InvoicesGrid.scss';

type InvoiceStatusCode = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

interface InvoicesGridProps {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
  onStatusChange: (invoiceId: number, newStatus: InvoiceStatusCode) => void;
  onDownloadPdf: (invoiceId: number, invoiceNumber: string) => void;
  invoiceStatuses: InvoiceStatus[];
  statusLabels: Record<string, string>;
  downloadingIds: Set<number>;
}

const InvoicesGrid = ({
  invoices,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onDownloadPdf,
  invoiceStatuses,
  statusLabels,
  downloadingIds,
}: InvoicesGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box className="invoices-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar fatura...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="invoices-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="invoices-grid">
      {invoices.length === 0 ? (
        <Typography variant="body1" className="no-invoices" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën fatura.
        </Typography>
      ) : (
        <Box className="invoice-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="invoice-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Link
                    to={`/invoices/${invoice.id}`}
                    style={{ color: '#1976d2', textDecoration: 'none' }}
                  >
                    {invoice.invoice_number}
                  </Link>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>Data:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><strong>Data e Maturimit:</strong> {new Date(invoice.due_date).toLocaleDateString()}</Typography>
                  <Typography variant="body2"><strong>Fatura Nga:</strong> {invoice.issuer?.business_name || 'N/A'}</Typography>
                  <Typography variant="body2"><strong>Fatura Për:</strong> {invoice.receiver?.business_name || 'N/A'}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" component="strong">Statusi:</Typography>
                    <Select
                      value={invoice.status}
                      onChange={(e) => onStatusChange(invoice.id, e.target.value as InvoiceStatusCode)}
                      size="small"
                      sx={{ minWidth: 150 }}
                    >
                      {invoiceStatuses.map((status) => (
                        <MenuItem key={status.id} value={status.code}>
                          {statusLabels[status.code] || status.code}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  <Typography variant="body2"><strong>Totali:</strong> {parseFloat(invoice.total).toFixed(2)} €</Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider', flexWrap: 'wrap' }}>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onDownloadPdf(invoice.id, invoice.invoice_number)}
                      disabled={downloadingIds.has(invoice.id)}
                      title="Shkarko PDF"
                      color="primary"
                    >
                      <PrintIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onView(invoice.id)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(invoice.id)}
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(invoice.id)}
                      title="Fshi"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onDownloadPdf(invoice.id, invoice.invoice_number)}
                  disabled={downloadingIds.has(invoice.id)}
                  title="Shkarko PDF"
                >
                  {downloadingIds.has(invoice.id) ? 'Duke u shkarkuar...' : 'PDF'}
                </Button>
                <Button size="small" variant="outlined" onClick={() => onView(invoice.id)}>
                  Shiko
                </Button>
                <Button size="small" variant="contained" onClick={() => onEdit(invoice.id)}>
                  Ndrysho
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => onDelete(invoice.id)}>
                  Fshi
                </Button>
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

export default InvoicesGrid;
