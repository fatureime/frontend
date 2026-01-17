import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { Tax } from '../../services/api';
import './TaxesGrid.scss';

interface TaxesGridProps {
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

const TaxesGrid = ({
  taxes,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  canEdit = false,
}: TaxesGridProps) => {
  if (error) {
    return (
      <div className="taxes-grid">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="taxes-grid">
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
                width: 80,
              },
              {
                field: 'rate',
                headerName: 'Norma',
                width: 150,
                valueGetter: (_value: unknown, row: Tax) => formatRate(row.rate),
              },
              {
                field: 'name',
                headerName: 'Emri',
                width: 200,
                flex: 1,
              },
              {
                field: 'created_at',
                headerName: 'Krijuar',
                width: 150,
                valueGetter: (_value: unknown, row: Tax) => 
                  row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
              },
              {
                field: 'view',
                headerName: 'Shiko',
                width: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => onView(params.row)}
                    sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                  >
                    Shiko
                  </Button>
                ),
              },
              ...(canEdit ? [{
                field: 'actions',
                headerName: 'Veprimet',
                width: 200,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Tax>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
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
          />
        </Box>
      )}
    </div>
  );
};

export default TaxesGrid;
