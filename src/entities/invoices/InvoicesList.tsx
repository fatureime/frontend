import { DataGrid, GridRenderCellParams } from '@mui/x-data-grid';
import { Select, MenuItem, Box, IconButton, Menu } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Link } from 'react-router-dom';
import { Invoice, InvoiceStatus } from '../../services/api';
import './InvoicesList.scss';

type InvoiceStatusCode = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

interface InvoicesListProps {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  onView: (invoiceId: number) => void;
  onEdit: (invoiceId: number) => void;
  onDelete: (invoiceId: number) => void;
  onStatusChange: (invoiceId: number, newStatus: InvoiceStatusCode) => void;
  onDownloadPdf: (invoiceId: number, invoiceNumber: string) => void;
  invoiceStatuses: InvoiceStatus[];
  statusLabels: Record<string, string>;
  downloadingIds: Set<number>;
  selectedInvoiceIds: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  menuAnchor: { [key: number]: HTMLElement | null };
  onMenuOpen: (invoiceId: number, anchor: HTMLElement) => void;
  onMenuClose: (invoiceId: number) => void;
}

const InvoicesList = ({
  invoices,
  loading,
  error,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  onDownloadPdf,
  invoiceStatuses,
  statusLabels,
  downloadingIds,
  selectedInvoiceIds,
  onSelectionChange,
  menuAnchor,
  onMenuOpen,
  onMenuClose,
}: InvoicesListProps) => {
  if (error) {
    return (
      <div className="invoices-list">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="invoices-list">
      {invoices.length === 0 ? (
        <p className="no-invoices">Nuk u gjetën fatura.</p>
      ) : (
        <Box sx={{ 
          height: 600, 
          width: '100%',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <DataGrid
            rows={invoices}
            columns={[
              {
                field: 'invoice_number',
                headerName: 'Numri i Faturës',
                flex: 1,
                renderCell: (params: GridRenderCellParams<Invoice>) => {
                  return (
                    <Link
                      to={`/invoices/${params.row.id}`}
                      style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {params.value}
                    </Link>
                  );
                },
              },
              {
                field: 'invoice_date',
                headerName: 'Data',
                flex: 0.8,
                valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
              },
              {
                field: 'due_date',
                headerName: 'Data e Maturimit',
                flex: 1,
                valueFormatter: (value: string) => new Date(value).toLocaleDateString(),
              },
              {
                field: 'issuer',
                headerName: 'Fatura Nga',
                flex: 1.2,
                valueGetter: (_value: unknown, row: Invoice) => row.issuer?.business_name || 'N/A',
              },
              {
                field: 'receiver',
                headerName: 'Fatura Për',
                flex: 1.2,
                valueGetter: (_value: unknown, row: Invoice) => row.receiver?.business_name || 'N/A',
              },
              {
                field: 'status',
                headerName: 'Statusi',
                flex: 1,
                renderCell: (params: GridRenderCellParams<Invoice>) => (
                  <Select
                    value={params.value}
                    onChange={(e) => onStatusChange(params.row.id, e.target.value as InvoiceStatusCode)}
                    size="small"
                    sx={{ 
                      width: '100%',
                      '& .MuiSelect-select': {
                        padding: '4px 8px',
                      }
                    }}
                  >
                    {invoiceStatuses.map((status) => (
                      <MenuItem key={status.id} value={status.code}>
                        {statusLabels[status.code] || status.code}
                      </MenuItem>
                    ))}
                  </Select>
                ),
              },
              {
                field: 'total',
                headerName: 'Totali',
                flex: 0.8,
                valueFormatter: (value: string) => `${parseFloat(value).toFixed(2)} €`,
              },
              {
                field: 'actions',
                headerName: 'Veprimet',
                flex: 0.8,
                sortable: false,
                filterable: false,
                renderCell: (params: GridRenderCellParams<Invoice>) => {
                  const open = Boolean(menuAnchor[params.row.id]);
                  return (
                    <Box sx={{ 
                      display: 'flex', 
                      gap: 1, 
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      width: '100%'
                    }}>
                      <IconButton
                        size="small"
                        onClick={() => onDownloadPdf(params.row.id, params.row.invoice_number)}
                        disabled={downloadingIds.has(params.row.id)}
                        title="Shkarko PDF"
                      >
                        <PrintIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => onMenuOpen(params.row.id, e.currentTarget)}
                        title="Më shumë veprime"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      <Menu
                        anchorEl={menuAnchor[params.row.id]}
                        open={open}
                        onClose={() => onMenuClose(params.row.id)}
                      >
                        <MenuItem onClick={() => {
                          onView(params.row.id);
                          onMenuClose(params.row.id);
                        }}>
                          Shiko
                        </MenuItem>
                        <MenuItem onClick={() => {
                          onEdit(params.row.id);
                          onMenuClose(params.row.id);
                        }}>
                          Ndrysho
                        </MenuItem>
                        <MenuItem onClick={() => {
                          onDelete(params.row.id);
                          onMenuClose(params.row.id);
                        }} sx={{ color: 'error.main' }}>
                          Fshi
                        </MenuItem>
                      </Menu>
                    </Box>
                  );
                },
              },
            ]}
            getRowId={(row: Invoice) => row.id}
            checkboxSelection
            rowSelectionModel={selectedInvoiceIds}
            onRowSelectionModelChange={(newSelection) => {
              onSelectionChange(newSelection as number[]);
            }}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: {
                paginationModel: { pageSize: 25 },
              },
            }}
            loading={loading}
            sx={{
              width: '100%',
              maxWidth: '100%',
            }}
          />
        </Box>
      )}
    </div>
  );
};

export default InvoicesList;
