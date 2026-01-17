import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tax } from '../../services/api';
import './TaxesList.scss';

interface TaxesListProps {
  taxes: Tax[];
  loading: boolean;
  error: string | null;
  onView: (tax: Tax) => void;
  onEdit: (tax: Tax) => void;
  onDelete: (taxId: number) => void;
  canEdit?: boolean;
}

const formatRate = (rate: string | null): string => {
  if (rate === null) return 'E përjashtuar';
  return `${rate}%`;
};

const TaxesList = ({
  taxes,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
}: TaxesListProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box className="taxes-list" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar taksat...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="taxes-list" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="taxes-list">
      {taxes.length === 0 ? (
        <Typography variant="body1" className="no-taxes" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën taksa.
        </Typography>
      ) : (
        <Box className="tax-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 }}>
          {taxes.map((tax) => (
            <Card key={tax.id} className="tax-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  {tax.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body2"><strong>Norma:</strong> {formatRate(tax.rate)}</Typography>
                  {tax.created_at && (
                    <Typography variant="body2"><strong>Krijuar:</strong> {new Date(tax.created_at).toLocaleDateString()}</Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(tax)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    {canEdit && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => onEdit(tax)}
                          title="Ndrysho"
                          color="primary"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDelete(tax.id)}
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
                <Button size="small" variant="outlined" onClick={() => onView(tax)}>
                  Shiko
                </Button>
                {canEdit && (
                  <>
                    <Button size="small" variant="contained" onClick={() => onEdit(tax)}>
                      Ndrysho
                    </Button>
                    <Button size="small" variant="outlined" color="error" onClick={() => onDelete(tax.id)}>
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

export default TaxesList;
