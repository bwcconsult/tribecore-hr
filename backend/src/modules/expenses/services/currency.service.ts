import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ExchangeRate } from '../entities/exchange-rate.entity';
import axios from 'axios';

export interface ConversionResult {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  convertedCurrency: string;
  exchangeRate: number;
  date: Date;
  source: string;
}

export interface SupportedCurrency {
  code: string;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private baseCurrency: string;
  private apiProvider: string;
  private apiKey: string;

  constructor(
    private configService: ConfigService,
    @InjectRepository(ExchangeRate)
    private exchangeRateRepository: Repository<ExchangeRate>,
  ) {
    this.baseCurrency = this.configService.get('BASE_CURRENCY', 'GBP');
    this.apiProvider = this.configService.get('EXCHANGE_RATE_PROVIDER', 'exchangerate-api');
    this.apiKey = this.configService.get('EXCHANGE_RATE_API_KEY', '');
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: Date,
  ): Promise<ConversionResult> {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        convertedCurrency: toCurrency,
        exchangeRate: 1,
        date: date || new Date(),
        source: 'no-conversion',
      };
    }

    // Get exchange rate
    const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);

    const convertedAmount = amount * rate.rate;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount: Number(convertedAmount.toFixed(2)),
      convertedCurrency: toCurrency,
      exchangeRate: rate.rate,
      date: rate.date,
      source: rate.source,
    };
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    date?: Date,
  ): Promise<ExchangeRate> {
    const queryDate = date || new Date();
    const dateString = queryDate.toISOString().split('T')[0];

    // Try to get from cache (database)
    const cachedRate = await this.exchangeRateRepository.findOne({
      where: {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
        date: new Date(dateString),
      },
    });

    if (cachedRate) {
      this.logger.log(`Using cached rate: ${fromCurrency} → ${toCurrency}`);
      return cachedRate;
    }

    // Fetch from API
    this.logger.log(`Fetching rate from API: ${fromCurrency} → ${toCurrency}`);
    const rate = await this.fetchExchangeRateFromApi(fromCurrency, toCurrency, queryDate);

    // Cache the rate
    await this.cacheExchangeRate(rate);

    return rate;
  }

  /**
   * Fetch exchange rate from external API
   */
  private async fetchExchangeRateFromApi(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<ExchangeRate> {
    if (this.apiProvider === 'exchangerate-api') {
      return this.fetchFromExchangeRateApi(fromCurrency, toCurrency, date);
    } else if (this.apiProvider === 'openexchangerates') {
      return this.fetchFromOpenExchangeRates(fromCurrency, toCurrency, date);
    } else {
      // Fallback to ExchangeRate-API (free, no key required)
      return this.fetchFromExchangeRateApi(fromCurrency, toCurrency, date);
    }
  }

  /**
   * Fetch from ExchangeRate-API (free, no API key required)
   * https://www.exchangerate-api.com/
   */
  private async fetchFromExchangeRateApi(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<ExchangeRate> {
    try {
      const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
      const response = await axios.get(url);

      if (!response.data.rates || !response.data.rates[toCurrency]) {
        throw new Error(`Exchange rate not found for ${fromCurrency} → ${toCurrency}`);
      }

      const rate = response.data.rates[toCurrency];

      return {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
        rate: Number(rate),
        date,
        source: 'exchangerate-api',
        metadata: {
          provider: 'ExchangeRate-API',
          timestamp: response.data.time_last_updated,
        },
      } as ExchangeRate;
    } catch (error) {
      this.logger.error(`Failed to fetch from ExchangeRate-API: ${error.message}`);
      throw new Error(`Currency conversion failed: ${error.message}`);
    }
  }

  /**
   * Fetch from Open Exchange Rates (requires API key)
   * https://openexchangerates.org/
   */
  private async fetchFromOpenExchangeRates(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<ExchangeRate> {
    if (!this.apiKey) {
      throw new Error('Open Exchange Rates API key not configured');
    }

    try {
      const url = `https://openexchangerates.org/api/latest.json?app_id=${this.apiKey}&base=${fromCurrency}`;
      const response = await axios.get(url);

      if (!response.data.rates || !response.data.rates[toCurrency]) {
        throw new Error(`Exchange rate not found for ${fromCurrency} → ${toCurrency}`);
      }

      const rate = response.data.rates[toCurrency];

      return {
        baseCurrency: fromCurrency,
        targetCurrency: toCurrency,
        rate: Number(rate),
        date,
        source: 'openexchangerates',
        metadata: {
          provider: 'Open Exchange Rates',
          timestamp: response.data.timestamp,
        },
      } as ExchangeRate;
    } catch (error) {
      this.logger.error(`Failed to fetch from Open Exchange Rates: ${error.message}`);
      throw new Error(`Currency conversion failed: ${error.message}`);
    }
  }

  /**
   * Cache exchange rate in database
   */
  private async cacheExchangeRate(rate: ExchangeRate): Promise<void> {
    try {
      const existing = await this.exchangeRateRepository.findOne({
        where: {
          baseCurrency: rate.baseCurrency,
          targetCurrency: rate.targetCurrency,
          date: rate.date,
        },
      });

      if (existing) {
        // Update existing
        existing.rate = rate.rate;
        existing.source = rate.source;
        existing.metadata = rate.metadata;
        await this.exchangeRateRepository.save(existing);
      } else {
        // Create new
        const newRate = this.exchangeRateRepository.create(rate);
        await this.exchangeRateRepository.save(newRate);
      }

      this.logger.log(
        `Cached exchange rate: ${rate.baseCurrency} → ${rate.targetCurrency} = ${rate.rate}`,
      );
    } catch (error) {
      this.logger.error(`Failed to cache exchange rate: ${error.message}`);
    }
  }

  /**
   * Get all exchange rates for a base currency
   */
  async getAllRates(baseCurrency: string): Promise<{ [currency: string]: number }> {
    try {
      const url =
        this.apiProvider === 'openexchangerates' && this.apiKey
          ? `https://openexchangerates.org/api/latest.json?app_id=${this.apiKey}&base=${baseCurrency}`
          : `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`;

      const response = await axios.get(url);
      return response.data.rates || {};
    } catch (error) {
      this.logger.error(`Failed to fetch all rates: ${error.message}`);
      return {};
    }
  }

  /**
   * Refresh exchange rates for all common currencies
   */
  async refreshRates(baseCurrency: string = this.baseCurrency): Promise<number> {
    const commonCurrencies = [
      'USD',
      'EUR',
      'GBP',
      'JPY',
      'AUD',
      'CAD',
      'CHF',
      'CNY',
      'INR',
      'MXN',
      'BRL',
      'ZAR',
      'NZD',
      'SGD',
      'HKD',
    ];

    let refreshCount = 0;
    const today = new Date();

    for (const targetCurrency of commonCurrencies) {
      if (targetCurrency === baseCurrency) continue;

      try {
        await this.getExchangeRate(baseCurrency, targetCurrency, today);
        refreshCount++;
      } catch (error) {
        this.logger.warn(
          `Failed to refresh rate for ${baseCurrency} → ${targetCurrency}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Refreshed ${refreshCount} exchange rates for ${baseCurrency}`);
    return refreshCount;
  }

  /**
   * Clean up old exchange rates (older than specified days)
   */
  async cleanupOldRates(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.exchangeRateRepository.delete({
      date: LessThan(cutoffDate),
    });

    const deletedCount = result.affected || 0;
    this.logger.log(`Cleaned up ${deletedCount} old exchange rates`);
    return deletedCount;
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): SupportedCurrency[] {
    return [
      { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
      { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
      { code: 'GBP', name: 'British Pound', symbol: '£', decimalPlaces: 2 },
      { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
      { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', decimalPlaces: 2 },
      { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', decimalPlaces: 2 },
      { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', decimalPlaces: 2 },
      { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', decimalPlaces: 2 },
      { code: 'INR', name: 'Indian Rupee', symbol: '₹', decimalPlaces: 2 },
      { code: 'MXN', name: 'Mexican Peso', symbol: '$', decimalPlaces: 2 },
      { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', decimalPlaces: 2 },
      { code: 'ZAR', name: 'South African Rand', symbol: 'R', decimalPlaces: 2 },
      { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', decimalPlaces: 2 },
      { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
      { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', decimalPlaces: 2 },
      { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', decimalPlaces: 2 },
      { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', decimalPlaces: 2 },
      { code: 'DKK', name: 'Danish Krone', symbol: 'kr', decimalPlaces: 2 },
      { code: 'PLN', name: 'Polish Zloty', symbol: 'zł', decimalPlaces: 2 },
      { code: 'THB', name: 'Thai Baht', symbol: '฿', decimalPlaces: 2 },
      { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', decimalPlaces: 2 },
      { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0 },
      { code: 'PHP', name: 'Philippine Peso', symbol: '₱', decimalPlaces: 2 },
      { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', decimalPlaces: 2 },
      { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', decimalPlaces: 2 },
      { code: 'KRW', name: 'South Korean Won', symbol: '₩', decimalPlaces: 0 },
      { code: 'TWD', name: 'Taiwan Dollar', symbol: 'NT$', decimalPlaces: 0 },
      { code: 'TRY', name: 'Turkish Lira', symbol: '₺', decimalPlaces: 2 },
      { code: 'RUB', name: 'Russian Ruble', symbol: '₽', decimalPlaces: 2 },
      { code: 'ILS', name: 'Israeli Shekel', symbol: '₪', decimalPlaces: 2 },
    ];
  }

  /**
   * Format amount with currency symbol
   */
  formatAmount(amount: number, currencyCode: string): string {
    const currency = this.getSupportedCurrencies().find(c => c.code === currencyCode);

    if (!currency) {
      return `${currencyCode} ${amount.toFixed(2)}`;
    }

    const formattedAmount = amount.toFixed(currency.decimalPlaces);
    return `${currency.symbol}${formattedAmount}`;
  }

  /**
   * Get historical exchange rate for a specific date
   */
  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<number> {
    const rate = await this.getExchangeRate(fromCurrency, toCurrency, date);
    return rate.rate;
  }

  /**
   * Batch convert multiple amounts
   */
  async batchConvert(
    conversions: Array<{
      amount: number;
      fromCurrency: string;
      toCurrency: string;
      date?: Date;
    }>,
  ): Promise<ConversionResult[]> {
    const results: ConversionResult[] = [];

    for (const conversion of conversions) {
      try {
        const result = await this.convertCurrency(
          conversion.amount,
          conversion.fromCurrency,
          conversion.toCurrency,
          conversion.date,
        );
        results.push(result);
      } catch (error) {
        this.logger.error(`Batch conversion failed: ${error.message}`);
      }
    }

    return results;
  }
}
