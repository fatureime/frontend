import { useState, useMemo } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Card, CardContent, CardActions, Typography } from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Article } from '../../services/api';

type ViewMode = 'list' | 'grid';

interface ArticleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  articles: Article[];
  loading: boolean;
  onSelect: (article: Article) => void;
  issuerId: number | null;
}

const ArticleSelectionModal = ({
  open,
  onClose,
  articles,
  loading,
  onSelect,
  issuerId,
}: ArticleSelectionModalProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('invoice-article-selection-view-mode');
    return (saved === 'list' || saved === 'grid') ? saved : 'list';
  });

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('invoice-article-selection-view-mode', mode);
  };

  const handleArticleSelect = (article: Article) => {
    onSelect(article);
    onClose();
  };

  // Filter articles by issuer
  const filteredArticles = useMemo(() => {
    if (!issuerId) return [];
    return articles.filter(article => article.business_id === issuerId);
  }, [articles, issuerId]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <span>Zgjidhni Artikull</span>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 0.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('list')}
              sx={{
                borderRadius: 0,
                bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                color: viewMode === 'list' ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: viewMode === 'list' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                },
              }}
              title="Lista"
            >
              <GridViewIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleViewModeChange('grid')}
              sx={{
                borderRadius: 0,
                bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                color: viewMode === 'grid' ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: viewMode === 'grid' ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                },
              }}
              title="Tabelë"
            >
              <ViewListIcon fontSize="small" />
            </IconButton>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 2, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', padding: 3 }}>
            <Typography variant="body1" color="text.secondary">Duke u ngarkuar artikujt...</Typography>
          </Box>
        ) : !issuerId ? (
          <Box sx={{ textAlign: 'center', padding: 3 }}>
            <Typography variant="body1" color="text.secondary">Ju lutem zgjidhni lëshuesin e faturës për të parë artikujt.</Typography>
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Box sx={{ textAlign: 'center', padding: 3 }}>
            <Typography variant="body1" color="text.secondary">Nuk u gjetën artikuj për lëshuesin e zgjedhur.</Typography>
          </Box>
        ) : viewMode === 'list' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleArticleSelect(article)}
              >
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
                  </Box>
                </CardContent>
                <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider', justifyContent: 'center' }}>
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArticleSelect(article);
                    }}
                    title="Zgjidh artikullin"
                  >
                    <CheckCircleIcon />
                  </IconButton>
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ height: 600, width: '100%', maxWidth: '100%', overflow: 'auto' }}>
            <DataGrid
              rows={filteredArticles}
              columns={[
                {
                  field: 'name',
                  headerName: 'Emri',
                  flex: 1,
                  minWidth: 150,
                },
                {
                  field: 'description',
                  headerName: 'Përshkrimi',
                  flex: 1,
                  minWidth: 200,
                },
                {
                  field: 'unit_price',
                  headerName: 'Çmimi për njësi',
                  valueGetter: (_value: unknown, row: Article) => 
                    `${parseFloat(row.unit_price).toFixed(2)} €`,
                },
                {
                  field: 'unit',
                  headerName: 'Njësia',
                },
                {
                  field: 'actions',
                  headerName: 'Veprimet',
                  sortable: false,
                  filterable: false,
                  renderCell: (params: GridRenderCellParams<Article>) => (
                    <IconButton
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArticleSelect(params.row);
                      }}
                      title="Zgjidh artikullin"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                  ),
                },
              ]}
              getRowId={(row: Article) => row.id}
              onRowClick={(params) => handleArticleSelect(params.row)}
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Mbyll</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArticleSelectionModal;
