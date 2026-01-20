import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Article } from '../../services/api';
import './ArticlesList.scss';

interface ArticlesListProps {
  articles: Article[];
  loading: boolean;
  error: string | null;
  onView: (article: Article) => void;
  onEdit: (article: Article) => void;
  onDelete: (articleId: number) => void;
}

const ArticlesList = ({
  articles,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
}: ArticlesListProps) => {
  if (error) {
    return (
      <div className="articles-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="articles-list">
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
                minWidth: 40,
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'description',
                headerName: 'Përshkrimi',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'unit_price',
                headerName: 'Çmimi për njësi',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Article) => 
                  `${parseFloat(row.unit_price).toFixed(2)} €`,
              },
              {
                field: 'unit',
                headerName: 'Njësia',
                minWidth: 100,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Article) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Article>) => (
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
                      title="Ndrysho"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(params.row.id)}
                      title="Fshi"
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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

export default ArticlesList;
