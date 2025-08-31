import { useSettings } from '../context/SettingsContext';

export const useCurrency = () => {
  const { settings, formatCurrency, getCurrencySymbol, getCurrencyName } = useSettings();

  // Format currency with current settings
  const format = (amount) => {
    return formatCurrency(amount);
  };

  // Get just the symbol
  const symbol = getCurrencySymbol();

  // Get currency name
  const name = getCurrencyName();

  // Get current currency code
  const code = settings.currency;

  // Format with custom options
  const formatWithOptions = (amount, options = {}) => {
    const {
      showSymbol = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2
    } = options;

    if (amount === null || amount === undefined || isNaN(amount)) {
      return showSymbol ? `${symbol}0.00` : '0.00';
    }

    try {
      const formatter = new Intl.NumberFormat(settings.currencyLocale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency: settings.currency,
        minimumFractionDigits,
        maximumFractionDigits
      });
      
      return formatter.format(amount);
    } catch (error) {
      // Fallback formatting
      const formattedNumber = Number(amount).toFixed(maximumFractionDigits);
      return showSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
    }
  };

  // Format for display in tables or compact spaces
  const formatCompact = (amount) => {
    return formatWithOptions(amount, { 
      minimumFractionDigits: 0,
      maximumFractionDigits: 2 
    });
  };

  // Format without currency symbol (for calculations display)
  const formatNumber = (amount) => {
    return formatWithOptions(amount, { showSymbol: false });
  };

  // Parse currency string back to number
  const parse = (currencyString) => {
    if (!currencyString) return 0;
    
    // Remove currency symbols and spaces, keep numbers and decimal points
    const cleanString = currencyString.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanString);
    
    return isNaN(parsed) ? 0 : parsed;
  };

  // Validate if a string is a valid currency amount
  const isValidAmount = (value) => {
    if (typeof value === 'number') return !isNaN(value) && isFinite(value);
    if (typeof value === 'string') {
      const parsed = parse(value);
      return !isNaN(parsed) && isFinite(parsed);
    }
    return false;
  };

  // Convert between currencies (placeholder for future implementation)
  const convert = (amount, fromCurrency, toCurrency) => {
    // For now, just return the same amount
    // In the future, this could integrate with exchange rate APIs
    console.warn('Currency conversion not implemented yet');
    return amount;
  };

  return {
    format,
    formatWithOptions,
    formatCompact,
    formatNumber,
    parse,
    isValidAmount,
    convert,
    symbol,
    name,
    code,
    locale: settings.currencyLocale
  };
};

export default useCurrency;
