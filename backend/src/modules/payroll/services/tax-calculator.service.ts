import { Injectable } from '@nestjs/common';
import { Country, PayrollFrequency } from '../../../common/enums';
import { UKTaxService } from './uk-tax.service';
import { USATaxService } from './usa-tax.service';
import { NigeriaTaxService } from './nigeria-tax.service';

export interface TaxCalculation {
  incomeTax: number;
  nationalInsurance: number;
  pensionContribution: number;
  totalDeductions: number;
  breakdown?: any;
}

@Injectable()
export class TaxCalculatorService {
  constructor(
    private ukTaxService: UKTaxService,
    private usaTaxService: USATaxService,
    private nigeriaTaxService: NigeriaTaxService,
  ) {}

  async calculateTax(
    country: Country,
    grossPay: number,
    frequency: PayrollFrequency,
  ): Promise<TaxCalculation> {
    switch (country) {
      case Country.UK:
        return this.ukTaxService.calculateTax(grossPay, frequency);
      case Country.USA:
        return this.usaTaxService.calculateTax(grossPay, frequency);
      case Country.NIGERIA:
        return this.nigeriaTaxService.calculateTax(grossPay, frequency);
      default:
        throw new Error(`Tax calculation not supported for country: ${country}`);
    }
  }
}
