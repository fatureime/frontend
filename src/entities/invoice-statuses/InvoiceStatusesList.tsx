import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Box, IconButton } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import EditNoteIcon from '@mui/icons-material/EditNote';
import DeleteIcon from '@mui/icons-material/Delete';
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
                minWidth: 40,
              },
              {
                field: 'code',
                headerName: 'Kodi',
                minWidth: 100,
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                  <strong>{params.value}</strong>
                ),
              },
              {
                field: 'label',
                headerName: 'Etiketa',
                minWidth: 100,
                valueGetter: (_value: unknown, row: InvoiceStatus) => 
                  labels[row.code] || getStatusLabel(row.code),
                flex: 1,
              },
              {
                field: 'view',
                headerName: 'Shiko',
                minWidth: 100,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
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
                renderCell: (params: GridRenderCellParams<InvoiceStatus>) => (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(params.row)}
                      title="Ndrysho Kod"
                      color="primary"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => onEditLabel(params.row)}
                      title="Ndrysho Etiketë"
                      color="primary"
                    >
                      <EditNoteIcon fontSize="small" />
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
            getRowId={(row: InvoiceStatus) => row.id}
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

export default InvoiceStatusesList;
