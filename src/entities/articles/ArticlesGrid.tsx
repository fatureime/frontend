import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
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
  if (error) {
    return (
      <div className="articles-grid">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="articles-grid">
      {articles.length === 0 ? (
        <p className="no-articles">Nuk u gjetën artikuj.</p>
      ) : (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={articles}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
              },
              {
                field: 'description',
                headerName: 'Përshkrimi',
                flex: 1,
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
                field: 'created_at',
                headerName: 'Krijuar',
                valueGetter: (_value: unknown, row: Article) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Article>) => (
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
                      Ndrysho
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => onDelete(params.row.id)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Fshi
                    </Button>
                  </Box>
                ),
              },
            ]}
            getRowId={(row: Article) => row.id}
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

export default ArticlesGrid;
