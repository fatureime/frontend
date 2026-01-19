import { Card, CardContent, CardActions, Button, IconButton, Typography, Box, useMediaQuery, useTheme } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Article } from '../../services/api';
import './ArticlesGrid.scss';

interface ArticlesGridProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: number) => void;
}

const ArticlesGrid = ({
  articles,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}: ArticlesGridProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  if (loading) {
    return (
      <Box className="articles-grid" sx={{ textAlign: 'center', padding: 3 }}>
        <Typography variant="body1" color="text.secondary">Duke u ngarkuar artikujt...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="articles-grid" sx={{ p: 2 }}>
        <Box className="error-message" sx={{ bgcolor: '#ffebee', color: '#c62828', p: 2, borderRadius: 1 }}>
          <Typography variant="body2">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="articles-grid">
      {articles.length === 0 ? (
        <Typography variant="body1" className="no-articles" sx={{ textAlign: 'center', padding: 3, color: 'text.secondary' }}>
          Nuk u gjetën artikuj.
        </Typography>
      ) : (
        <Box className="article-cards" sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
          {articles.map((article) => (
            <Card key={article.id} className="article-card" sx={{ display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" component="h3" sx={{ mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
                  {article.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {article.description && (
                    <Typography variant="body2">
                      <strong>Përshkrimi:</strong> {article.description}
                    </Typography>
                  )}
                  <Typography variant="body2">
                    <strong>Çmimi për njësi:</strong> {parseFloat(article.unit_price).toFixed(2)} €
                  </Typography>
                  {article.unit && (
                    <Typography variant="body2">
                      <strong>Njësia:</strong> {article.unit}
                    </Typography>
                  )}
                  {article.created_at && (
                    <Typography variant="body2">
                      <strong>Krijuar:</strong> {new Date(article.created_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>
              </CardContent>
              <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                {isMobile ? (
                  <>
                    <IconButton
                      size="small"
                      onClick={() => onView(article)}
                      title="Shiko"
                      color="primary"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(article)}
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(article.id)}
                      title="Fshi"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  <>
                <Button size="small" variant="outlined" onClick={() => onView(article)}>
                  Shiko
                </Button>
                <Button size="small" variant="contained" onClick={() => onEdit(article)}>
                  Ndrysho
                </Button>
                <Button size="small" variant="outlined" color="error" onClick={() => onDelete(article.id)}>
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

export default ArticlesGrid;
