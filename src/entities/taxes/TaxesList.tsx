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
              },
              {
                field: 'rate',
                headerName: 'Norma',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Tax) => formatRate(row.rate),
              },
              {
                field: 'name',
                headerName: 'Emri',
                flex: 1,
                minWidth: 100,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                minWidth: 100,
                valueGetter: (_value: unknown, row: Tax) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'view',
                headerName: 'Shiko',
                minWidth: 100,
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
                minWidth: 100,
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
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default TaxesList;
