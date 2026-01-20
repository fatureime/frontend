import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
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
  if (error) {
    return (
      <div className="taxes-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="taxes-list">
      {taxes.length === 0 ? (
        <p className="no-taxes">Nuk u gjetën taksa.</p>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={taxes}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
                minWidth: 40,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'rate',
                headerName: 'Norma',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                valueGetter: (_value: unknown, row: Tax) => formatRate(row.rate),
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                flex: 1,
                minWidth: 100,
                maxWidth: 250,
                valueGetter: (_value: unknown, row: Tax) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box
                    sx={{
                      maxWidth: 250,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {params.value}
                  </Box>
                ),
              },
              {
                field: 'view',
                headerName: 'Shiko',
                flex: 0,
                minWidth: 80,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <IconButton
                    size="small"
                    onClick={() => onView(params.row)}
                    title="Shiko"
                    color="primary"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                ),
              },
              ...(canEdit ? [{
                field: 'actions',
                headerName: 'Veprimet',
                flex: 0,
                minWidth: 140,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
              }] : []),
            ]}
            getRowId={(row: Tax) => row.id}
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
              '& .MuiDataGrid-cell[data-field="actions"]': {
                overflow: 'visible',
                minWidth: '140px !important',
              },
              '& .MuiDataGrid-columnHeader[data-field="actions"]': {
                minWidth: '140px !important',
              },
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default TaxesList;
