import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Loader } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  amount?: number;
  baseCurrency?: string;
  showConversion?: boolean;
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  amount,
  baseCurrency = 'GBP',
  showConversion = true,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  // Default currencies fallback
  const defaultCurrencies: Currency[] = [
    { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
    { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
    { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2 },
    { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2 },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2 },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2 },
    { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2 },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
    { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س', decimalPlaces: 2 },
  ];

  // Fetch supported currencies (with fallback to defaults)
  const { data: currenciesData, isLoading } = useQuery({
    queryKey: ['supported-currencies'],
    queryFn: async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/expenses/currency/supported`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!response.ok) throw new Error('Failed to fetch');
        return response.json();
      } catch (error) {
        // Return defaults on error
        return { currencies: defaultCurrencies };
      }
    },
  });

  const currencies: Currency[] = currenciesData?.currencies || defaultCurrencies;

  // Get selected currency details
  const selectedCurrency = currencies.find((c) => c.code === value);

  // Fetch conversion rate when amount and currency change
  useEffect(() => {
    if (amount && value && value !== baseCurrency && showConversion) {
      fetchConversion();
    } else {
      setConvertedAmount(null);
      setExchangeRate(null);
    }
  }, [amount, value, baseCurrency, showConversion]);

  const fetchConversion = async () => {
    if (!amount || !value || value === baseCurrency) return;

    try {
      const response = await fetch(
        `/api/v1/expenses/currency/rate?from=${value}&to=${baseCurrency}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      const data = await response.json();

      if (data.rate) {
        const converted = amount * data.rate;
        setConvertedAmount(converted);
        setExchangeRate(data.rate);
      }
    } catch (error) {
      console.error('Failed to fetch conversion rate:', error);
    }
  };

  const filteredCurrencies = currencies.filter(
    (currency) =>
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const popularCurrencies = ['GBP', 'USD', 'EUR', 'JPY', 'AUD', 'CAD'];

  const formatAmount = (amount: number, currency: Currency): string => {
    return `${currency.symbol}${amount.toFixed(currency.decimalPlaces)}`;
  };

  const formatBaseCurrency = (amount: number): string => {
    const baseCurr = currencies.find((c) => c.code === baseCurrency);
    if (baseCurr) {
      return `${baseCurr.symbol}${amount.toFixed(baseCurr.decimalPlaces)}`;
    }
    return `${baseCurrency} ${amount.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 p-3 border border-gray-300 rounded-md bg-gray-50">
        <Loader className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-500">Loading currencies...</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Currency Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 border border-gray-300 rounded-md text-left bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {selectedCurrency ? `${selectedCurrency.code} - ${selectedCurrency.name}` : 'Select Currency'}
              </div>
              {selectedCurrency && (
                <div className="text-xs text-gray-500">
                  Symbol: {selectedCurrency.symbol}
                </div>
              )}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Conversion Display */}
      {showConversion && convertedAmount !== null && exchangeRate !== null && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-700 font-medium">Converted to {baseCurrency}</p>
              <p className="text-lg font-bold text-blue-900">
                {formatBaseCurrency(convertedAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-blue-700">Exchange Rate</p>
              <p className="text-sm font-semibold text-blue-900">
                1 {value} = {exchangeRate.toFixed(4)} {baseCurrency}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search currencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Popular Currencies */}
          {!searchQuery && (
            <div className="p-3 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Popular</p>
              <div className="flex flex-wrap gap-2">
                {popularCurrencies.map((code) => {
                  const currency = currencies.find((c) => c.code === code);
                  if (!currency) return null;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        onChange(code);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        value === code
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currency.symbol} {code}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Currency List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCurrencies.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No currencies found
              </div>
            ) : (
              filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  type="button"
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    value === currency.code ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-semibold text-gray-700 w-8">
                        {currency.symbol}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{currency.code}</div>
                        <div className="text-xs text-gray-500">{currency.name}</div>
                      </div>
                    </div>
                    {value === currency.code && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
};

export default CurrencySelector;
