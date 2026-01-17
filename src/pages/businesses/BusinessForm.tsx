import { useState } from 'react';
import { businessesApi, Business, CreateBusinessData } from '../../services/api';
import './BusinessForm.scss';

interface BusinessFormProps {
  business?: Business | null;
  onSave: () => void;
  onCancel: () => void;
}

const BusinessForm = ({ business, onSave, onCancel }: BusinessFormProps) => {
  const isEditMode = !!business;

  const [formData, setFormData] = useState<CreateBusinessData>({
    business_name: business?.business_name || '',
    trade_name: business?.trade_name || '',
    business_type: business?.business_type || '',
    unique_identifier_number: business?.unique_identifier_number || '',
    business_number: business?.business_number || '',
    fiscal_number: business?.fiscal_number || '',
    number_of_employees: business?.number_of_employees || undefined,
    registration_date: business?.registration_date || '',
    municipality: business?.municipality || '',
    address: business?.address || '',
    phone: business?.phone || '',
    email: business?.email || '',
    capital: business?.capital || '',
    arbk_status: business?.arbk_status || '',
    vat_number: business?.vat_number || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business?.logo || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Clean up empty strings to undefined
      const cleanedData: CreateBusinessData = {
        business_name: formData.business_name.trim(),
        trade_name: formData.trade_name?.trim() || undefined,
        business_type: formData.business_type?.trim() || undefined,
        unique_identifier_number: formData.unique_identifier_number?.trim() || undefined,
        business_number: formData.business_number?.trim() || undefined,
        fiscal_number: formData.fiscal_number?.trim() || undefined,
        number_of_employees: formData.number_of_employees || undefined,
        registration_date: formData.registration_date || undefined,
        municipality: formData.municipality?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined,
        capital: formData.capital?.trim() || undefined,
        arbk_status: formData.arbk_status?.trim() || undefined,
        vat_number: formData.vat_number?.trim() || undefined,
      };

      if (isEditMode && business) {
        await businessesApi.updateBusiness(business.id, cleanedData, logoFile || undefined);
      } else {
        await businessesApi.createBusiness(cleanedData, logoFile || undefined);
      }
      onSave();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(errorMessage || (isEditMode ? 'Dështoi përditësimi i subjektit' : 'Dështoi krijimi i subjektit'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      if (type === 'number') {
        if (value === '') {
          return { ...prev, [name]: undefined };
        }
        // For capital field, use parseFloat for decimal numbers
        if (name === 'capital') {
          return { ...prev, [name]: parseFloat(value).toString() };
        }
        // For other number fields (like number_of_employees), use parseInt
        return { ...prev, [name]: parseInt(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format i pavlefshëm i skedarit. Ju lutem zgjidhni një imazh (jpg, png, gif, svg, webp).');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('Skedari është shumë i madh. Madhësia maksimale është 5MB.');
        return;
      }
      
      setLogoFile(file);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const parseBulkInput = () => {
    if (!bulkInput.trim()) {
      setError('Ju lutem vendosni të dhënat për të analizuar');
      return;
    }

    try {
      const lines = bulkInput.split('\n').filter(line => line.trim());
      const parsed: Partial<CreateBusinessData> = {};

      // Mapping of Albanian field names to form field names
      const fieldMapping: { [key: string]: keyof CreateBusinessData } = {
        'Emri i subjektit': 'business_name',
        'Emri tregtar': 'trade_name',
        'Lloji i subjektit': 'business_type',
        'Numri unik identifikues': 'unique_identifier_number',
        'Numri i biznesit': 'business_number',
        'Numri Fiskal': 'fiscal_number',
        'Numri punëtorëve': 'number_of_employees',
        'Data e regjistrimit': 'registration_date',
        'Komuna': 'municipality',
        'Adresa': 'address',
        'Telefoni': 'phone',
        'E-mail': 'email',
        'Kapitali': 'capital',
        'Statusi në ARBK': 'arbk_status',
        'Numri i TVSH-së': 'vat_number',
        'VAT Number': 'vat_number',
      };

      let parsedCount = 0;

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine) return;

        // Split by tab first (most common), then by multiple spaces
        let fieldName = '';
        let fieldValue = '';
        
        if (trimmedLine.includes('\t')) {
          const parts = trimmedLine.split('\t');
          fieldName = parts[0]?.trim() || '';
          fieldValue = parts.slice(1).join('\t').trim();
        } else {
          // Try to split by multiple spaces (2 or more)
          const match = trimmedLine.match(/^(.+?)\s{2,}(.+)$/);
          if (match) {
            fieldName = match[1].trim();
            fieldValue = match[2].trim();
          } else {
            // Try single space as last resort
            const spaceIndex = trimmedLine.indexOf(' ');
            if (spaceIndex > 0) {
              fieldName = trimmedLine.substring(0, spaceIndex).trim();
              fieldValue = trimmedLine.substring(spaceIndex + 1).trim();
            }
          }
        }

        if (!fieldName) return;

        // Handle empty values (like "," or just whitespace)
        if (fieldValue === ',' || fieldValue === '' || fieldValue === '-') {
          fieldValue = '';
        }

        const mappedField = fieldMapping[fieldName];
        if (mappedField) {
          if (mappedField === 'number_of_employees') {
            const num = parseInt(fieldValue);
            if (!isNaN(num) && fieldValue !== '') {
              parsed[mappedField] = num;
              parsedCount++;
            }
          } else if (mappedField === 'registration_date') {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const dateMatch = fieldValue.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (dateMatch) {
              const [, day, month, year] = dateMatch;
              parsed[mappedField] = `${year}-${month}-${day}`;
              parsedCount++;
            } else if (fieldValue) {
              parsed[mappedField] = fieldValue;
              parsedCount++;
            }
          } else if (mappedField === 'capital') {
            // Handle formatted capital values like "2,500.00 €" or "2500.00"
            if (fieldValue && fieldValue !== '' && fieldValue !== ',' && fieldValue !== '-') {
              // Remove currency symbols (€, $, etc.), thousands separators (commas), and whitespace
              const cleanValue = fieldValue.replace(/[€$£¥,\s]/g, '');
              // Parse as float
              const numValue = parseFloat(cleanValue);
              if (!isNaN(numValue) && numValue >= 0) {
                // Convert to string with 2 decimal places
                parsed[mappedField] = numValue.toFixed(2);
                parsedCount++;
              }
            }
          } else {
            // Set value even if empty (for fields like address, phone, etc.)
            parsed[mappedField] = fieldValue || '';
            parsedCount++;
          }
        }
      });

      if (parsedCount === 0) {
        setError('Nuk u gjetën fusha të vlefshme. Ju lutem kontrolloni formatin e të dhënave.');
        return;
      }

      // Update form data with parsed values
      setFormData(prev => ({
        ...prev,
        ...parsed,
      }));

      setBulkInput('');
      setError(null);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Dështoi analizimi i të dhënave. Ju lutem kontrolloni formatin.');
    }
  };

  return (
    <div className="business-form">
      <h2>{isEditMode ? 'Ndrysho Subjektin' : 'Krijo Subjekt'}</h2>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isEditMode && business?.created_by && (
          <div className="form-group info-group">
            <label>Krijuar nga</label>
            <div className="info-value">{business.created_by.email}</div>
          </div>
        )}

        {!isEditMode && (
          <div className="form-group bulk-input-group">
            <label htmlFor="bulk_input">Vendos të dhënat e subjektit (kopjo-ngjis formatin e plotë)</label>
            <textarea
              id="bulk_input"
              name="bulk_input"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              rows={15}
              disabled={loading}
              className="bulk-textarea"
            />
            <button
              type="button"
              onClick={parseBulkInput}
              className="btn btn-secondary btn-parse"
              disabled={loading || !bulkInput.trim()}
            >
              Analizo dhe Plotëso Automatikisht
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="business_name">Emri i biznesit *</label>
          <input
            type="text"
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="trade_name">Emri tregtar</label>
          <input
            type="text"
            id="trade_name"
            name="trade_name"
            value={formData.trade_name || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="business_type">Lloji i subjektit</label>
          <input
            type="text"
            id="business_type"
            name="business_type"
            value={formData.business_type || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="unique_identifier_number">Numri unik identifikues</label>
          <input
            type="text"
            id="unique_identifier_number"
            name="unique_identifier_number"
            value={formData.unique_identifier_number || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="business_number">Numri i subjektit</label>
          <input
            type="text"
            id="business_number"
            name="business_number"
            value={formData.business_number || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="fiscal_number">Numri Fiskal</label>
          <input
            type="text"
            id="fiscal_number"
            name="fiscal_number"
            value={formData.fiscal_number || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="vat_number">Numri i TVSH-së</label>
          <input
            type="text"
            id="vat_number"
            name="vat_number"
            value={formData.vat_number || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group form-group-logo">
          <label htmlFor="logo">Logo</label>
          <div className="logo-upload-container">
            <label htmlFor="logo" className="logo-upload-label">
              <input
                type="file"
                id="logo"
                name="logo"
                accept="image/jpeg,image/png,image/gif,image/svg+xml,image/webp"
                onChange={handleLogoChange}
                disabled={loading}
                className="logo-input"
              />
              <div className="logo-upload-area">
                {logoPreview ? (
                  <div className="logo-preview-container">
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      className="logo-preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview(null);
                        const fileInput = document.getElementById('logo') as HTMLInputElement;
                        if (fileInput) fileInput.value = '';
                      }}
                      className="logo-remove-btn"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="logo-upload-placeholder">
                    <span className="logo-upload-icon">📷</span>
                    <span className="logo-upload-text">Kliko për të zgjedhur logo</span>
                    <span className="logo-upload-hint">JPG, PNG, GIF, SVG ose WEBP (max 5MB)</span>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="number_of_employees">Numri punëtorëve</label>
          <input
            type="number"
            id="number_of_employees"
            name="number_of_employees"
            value={formData.number_of_employees || ''}
            onChange={handleChange}
            min="0"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="registration_date">Data e regjistrimit</label>
          <input
            type="date"
            id="registration_date"
            name="registration_date"
            value={formData.registration_date || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="municipality">Komuna</label>
          <input
            type="text"
            id="municipality"
            name="municipality"
            value={formData.municipality || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Adresa</label>
          <textarea
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Telefoni</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="capital">Kapitali</label>
          <input
            type="number"
            id="capital"
            name="capital"
            value={formData.capital || ''}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="0.00"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="arbk_status">Statusi në ARBK</label>
          <input
            type="text"
            id="arbk_status"
            name="arbk_status"
            value={formData.arbk_status || ''}
            onChange={handleChange}
            disabled={loading}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Duke u ruajtur...' : 'Ruaj Ndryshimet'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Anulo
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessForm;
