import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import axios from 'axios';

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  date: Date;
  provider: string;
}

@Injectable()
export class FxConversionService {
  private readonly logger = new Logger(FxConversionService.name);
  private ratesCache: Map<string, { rate: number; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION_MS = 3600000; // 1 hour

  constructor() {
    this.initializeCache();
  }

  private async initializeCache() {
    // Initialize with some default rates
    this.logger.log('Initializing FX rates cache');
    await this.refreshRates();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async refreshRates() {
    try {
      this.logger.log('Refreshing FX rates from API');
      
      // Using exchangerate-api.com (free tier)
      const baseCurrency = 'USD';
      const response = await axios.get(
        `https://open.exchangerate-api.com/v6/latest/${baseCurrency}`
      );

      if (response.data && response.data.rates) {
        const rates = response.data.rates;
        const timestamp = new Date();

        // Cache all rates
        Object.keys(rates).forEach(currency => {
          const key = `${baseCurrency}_${currency}`;
          this.ratesCache.set(key, {
            rate: rates[currency],
            timestamp,
          });
        });

        this.logger.log(`Cached ${Object.keys(rates).length} exchange rates`);
      }
    } catch (error) {
      this.logger.error('Failed to refresh FX rates:', error.message);
    }
  }

  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<{ amount: number; rate: number; timestamp: Date }> {
    if (fromCurrency === toCurrency) {
      return { amount, rate: 1, timestamp: new Date() };
    }

    // Try to get rate from cache
    const cacheKey = `${fromCurrency}_${toCurrency}`;
    const cached = this.ratesCache.get(cacheKey);

    if (cached && this.isCacheValid(cached.timestamp)) {
      return {
        amount: amount * cached.rate,
        rate: cached.rate,
        timestamp: cached.timestamp,
      };
    }

    // If not in cache, try reverse conversion
    const reverseCacheKey = `${toCurrency}_${fromCurrency}`;
    const reverseCached = this.ratesCache.get(reverseCacheKey);

    if (reverseCached && this.isCacheValid(reverseCached.timestamp)) {
      const rate = 1 / reverseCached.rate;
      return {
        amount: amount * rate,
        rate,
        timestamp: reverseCached.timestamp,
      };
    }

    // If still not found, fetch from API
    const rate = await this.fetchRate(fromCurrency, toCurrency);
    const convertedAmount = amount * rate;

    return {
      amount: convertedAmount,
      rate,
      timestamp: new Date(),
    };
  }

  private async fetchRate(fromCurrency: string, toCurrency: string): Promise<number> {
    try {
      const response = await axios.get(
        `https://open.exchangerate-api.com/v6/latest/${fromCurrency}`
      );

      if (response.data && response.data.rates && response.data.rates[toCurrency]) {
        const rate = response.data.rates[toCurrency];
        
        // Cache the rate
        this.ratesCache.set(`${fromCurrency}_${toCurrency}`, {
          rate,
          timestamp: new Date(),
        });

        return rate;
      }

      throw new Error(`Rate not found for ${fromCurrency} to ${toCurrency}`);
    } catch (error) {
      this.logger.error(`Failed to fetch rate: ${error.message}`);
      // Return fallback rate of 1
      return 1;
    }
  }

  private isCacheValid(timestamp: Date): boolean {
    const now = new Date().getTime();
    const cacheTime = timestamp.getTime();
    return now - cacheTime < this.CACHE_DURATION_MS;
  }

  async getRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const result = await this.convert(1, fromCurrency, toCurrency);
    return result.rate;
  }

  async batchConvert(
    conversions: Array<{ amount: number; fromCurrency: string; toCurrency: string }>,
  ): Promise<Array<{ amount: number; rate: number; originalAmount: number }>> {
    return Promise.all(
      conversions.map(async ({ amount, fromCurrency, toCurrency }) => {
        const result = await this.convert(amount, fromCurrency, toCurrency);
        return {
          amount: result.amount,
          rate: result.rate,
          originalAmount: amount,
        };
      }),
    );
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'MXN',
      'BRL', 'ZAR', 'NGN', 'KES', 'GHS', 'AED', 'SAR', 'EGP', 'MAD', 'TZS',
      'UGX', 'RWF', 'ETB', 'ZMW', 'MWK', 'BWP', 'MUR', 'SCR', 'SLL', 'GMD',
    ];
  }

  async getHistoricalRate(
    fromCurrency: string,
    toCurrency: string,
    date: Date,
  ): Promise<number> {
    // For now, return current rate
    // In production, integrate with historical data API
    return this.getRate(fromCurrency, toCurrency);
  }

  // Convert payroll amounts to base currency for reporting
  async normalizePayrollAmounts(
    payrolls: Array<{ amount: number; currency: string }>,
    baseCurrency: string,
  ): Promise<{ total: number; breakdown: Record<string, number> }> {
    const breakdown: Record<string, number> = {};
    let total = 0;

    for (const payroll of payrolls) {
      const converted = await this.convert(payroll.amount, payroll.currency, baseCurrency);
      total += converted.amount;
      
      if (!breakdown[payroll.currency]) {
        breakdown[payroll.currency] = 0;
      }
      breakdown[payroll.currency] += payroll.amount;
    }

    return { total, breakdown };
  }
}
