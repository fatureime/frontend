// Default labels for invoice statuses (Albanian)
const DEFAULT_LABELS: Record<string, string> = {
  'draft': 'Draft',
  'sent': 'Dërguar',
  'paid': 'Paguar',
  'overdue': 'Vonuar',
  'cancelled': 'Anuluar',
};

const STORAGE_KEY = 'invoice_status_labels';

/**
 * Get all status labels (defaults + custom from localStorage)
 */
export const getStatusLabels = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const customLabels = JSON.parse(stored);
      return { ...DEFAULT_LABELS, ...customLabels };
    }
  } catch (error) {
    console.error('Error loading status labels from localStorage:', error);
  }
  return { ...DEFAULT_LABELS };
};

/**
 * Get label for a specific status code
 */
export const getStatusLabel = (code: string): string => {
  const labels = getStatusLabels();
  return labels[code] || code;
};

/**
 * Set label for a status code (saves to localStorage)
 */
export const setStatusLabel = (code: string, label: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const customLabels = stored ? JSON.parse(stored) : {};
    customLabels[code] = label;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customLabels));
  } catch (error) {
    console.error('Error saving status label to localStorage:', error);
  }
};

/**
 * Reset label to default (removes from localStorage)
 */
export const resetStatusLabel = (code: string): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const customLabels = JSON.parse(stored);
      delete customLabels[code];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customLabels));
    }
  } catch (error) {
    console.error('Error resetting status label in localStorage:', error);
  }
};

/**
 * Reset all labels to defaults
 */
export const resetAllStatusLabels = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting all status labels in localStorage:', error);
  }
};
