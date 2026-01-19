import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';
import { InvoiceStatus } from '../../services/api';
import { getStatusLabel } from '../../utils/invoiceStatusLabels';
import './InvoiceStatusesList.scss';

interface InvoiceStatusesListProps {
  statuses: InvoiceStatus[];
  loading: boolean;
  error: string | null;
  onView: (status: InvoiceStatus) => void;
  onEdit: (status: InvoiceStatus) => void;
  onEditLabel: (status: InvoiceStatus) => void;
  onDelete: (statusId: number) => void;
  canEdit?: boolean;
  labels?: Record<string, string>;
}

const InvoiceStatusesList = ({
  statuses,
  loading,
  error,
  onView,
  onEdit,
  onEditLabel,
  onDelete,
  canEdit = false,
  labels = {},
}: InvoiceStatusesListProps) => {
  if (error) {
    return (
      <div className="invoice-statuses-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="invoice-statuses-list">
      {statuses.length === 0 ? (
        <p className="no-statuses">Nuk u gjetën gjendje të faturave.</p>
      ) : (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={statuses}
            columns={[
              {
                field: 'id',
                headerName: 'ID',
              },
              {
                field: 'code',
                headerName: 'Kodi',
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                  <strong>{params.value}</strong>
                ),
              },
              {
                field: 'label',
                headerName: 'Etiketa',
                valueGetter: (_value: unknown, row: InvoiceStatus) => 
                  labels[row.code] || getStatusLabel(row.code),
                flex: 1,
              },
              {
                field: 'view',
                headerName: 'Shiko',
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
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
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => onEdit(params.row)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Ndrysho Kod
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onEditLabel(params.row)}
                      sx={{ minWidth: 'auto', fontSize: '0.75rem' }}
                    >
                      Ndrysho Etiketë
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
            getRowId={(row: InvoiceStatus) => row.id}
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

export default InvoiceStatusesList;
