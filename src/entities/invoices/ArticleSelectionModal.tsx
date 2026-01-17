import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Box, Card, CardContent, CardActions, Typography } from '@mui/material';
import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from '@mui/icons-material/Close';
import { Article } from '../../services/api';

type ViewMode = 'list' | 'grid';

interface ArticleSelectionModalProps {
  open: boolean;
  onClose: () => void;
  articles: Article[];
  loading: boolean;
  onSelect: (article: Article) => void;
}

const ArticleSelectionModal = ({
  open,
  onClose,
  articles,
  loading,
  onSelect,
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
        ) : articles.length === 0 ? (
          <Box sx={{ textAlign: 'center', padding: 3 }}>
            <Typography variant="body1" color="text.secondary">Nuk u gjetën artikuj.</Typography>
          </Box>
        ) : viewMode === 'list' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
            {articles.map((article) => (
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
                <CardActions sx={{ pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Button size="small" variant="contained" fullWidth>
                    Zgjidh
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={articles}
              columns={[
                {
                  field: 'name',
                  headerName: 'Emri',
                  flex: 1,
                  minWidth: 200,
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
                  width: 150,
                  valueGetter: (_value: unknown, row: Article) => 
                    `${parseFloat(row.unit_price).toFixed(2)} €`,
                },
                {
                  field: 'unit',
                  headerName: 'Njësia',
                  width: 120,
                },
                {
                  field: 'actions',
                  headerName: 'Veprimet',
                  width: 120,
                  sortable: false,
                  filterable: false,
                  renderCell: (params: GridRenderCellParams<Article>) => (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArticleSelect(params.row);
                      }}
                    >
                      Zgjidh
                    </Button>
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
