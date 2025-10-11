import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrencyService } from '../services/currency.service';

class ConvertCurrencyDto {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  date?: string;
}

class BatchConvertDto {
  conversions: Array<{
    amount: number;
    fromCurrency: string;
    toCurrency: string;
    date?: string;
  }>;
}

@ApiTags('Currency')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/currency')
export class CurrencyController {
  constructor(private currencyService: CurrencyService) {}

  @Post('convert')
  @ApiOperation({ summary: 'Convert amount between currencies' })
  @ApiResponse({ status: 200, description: 'Conversion result' })
  async convertCurrency(@Body() dto: ConvertCurrencyDto) {
    const date = dto.date ? new Date(dto.date) : undefined;

    return this.currencyService.convertCurrency(
      dto.amount,
      dto.fromCurrency,
      dto.toCurrency,
      date,
    );
  }

  @Get('rate')
  @ApiOperation({ summary: 'Get exchange rate between two currencies' })
  @ApiQuery({ name: 'from', required: true, type: String })
  @ApiQuery({ name: 'to', required: true, type: String })
  @ApiQuery({ name: 'date', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Exchange rate' })
  async getExchangeRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('date') date?: string,
  ) {
    const queryDate = date ? new Date(date) : undefined;
    return this.currencyService.getExchangeRate(fromCurrency, toCurrency, queryDate);
  }

  @Get('rates')
  @ApiOperation({ summary: 'Get all exchange rates for a base currency' })
  @ApiQuery({ name: 'base', required: true, type: String })
  @ApiResponse({ status: 200, description: 'All exchange rates' })
  async getAllRates(@Query('base') baseCurrency: string) {
    const rates = await this.currencyService.getAllRates(baseCurrency);

    return {
      baseCurrency,
      rates,
      timestamp: new Date(),
    };
  }

  @Get('supported')
  @ApiOperation({ summary: 'Get list of supported currencies' })
  @ApiResponse({ status: 200, description: 'Supported currencies' })
  async getSupportedCurrencies() {
    return {
      currencies: this.currencyService.getSupportedCurrencies(),
      count: this.currencyService.getSupportedCurrencies().length,
    };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh exchange rates for common currencies' })
  @ApiQuery({ name: 'base', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Refresh result' })
  async refreshRates(@Query('base') baseCurrency?: string) {
    const refreshCount = await this.currencyService.refreshRates(baseCurrency);

    return {
      message: 'Exchange rates refreshed successfully',
      refreshedCount: refreshCount,
      baseCurrency: baseCurrency || 'GBP',
      timestamp: new Date(),
    };
  }

  @Post('batch-convert')
  @ApiOperation({ summary: 'Convert multiple amounts in batch' })
  @ApiResponse({ status: 200, description: 'Batch conversion results' })
  async batchConvert(@Body() dto: BatchConvertDto) {
    const conversions = dto.conversions.map(c => ({
      ...c,
      date: c.date ? new Date(c.date) : undefined,
    }));

    const results = await this.currencyService.batchConvert(conversions);

    return {
      results,
      count: results.length,
      timestamp: new Date(),
    };
  }

  @Get('format')
  @ApiOperation({ summary: 'Format amount with currency symbol' })
  @ApiQuery({ name: 'amount', required: true, type: Number })
  @ApiQuery({ name: 'currency', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Formatted amount' })
  async formatAmount(@Query('amount') amount: number, @Query('currency') currency: string) {
    const formatted = this.currencyService.formatAmount(Number(amount), currency);

    return {
      amount: Number(amount),
      currency,
      formatted,
    };
  }

  @Get('historical')
  @ApiOperation({ summary: 'Get historical exchange rate for specific date' })
  @ApiQuery({ name: 'from', required: true, type: String })
  @ApiQuery({ name: 'to', required: true, type: String })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Historical exchange rate' })
  async getHistoricalRate(
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
    @Query('date') date: string,
  ) {
    const queryDate = new Date(date);
    const rate = await this.currencyService.getHistoricalRate(fromCurrency, toCurrency, queryDate);

    return {
      fromCurrency,
      toCurrency,
      date: queryDate,
      rate,
      timestamp: new Date(),
    };
  }
}
