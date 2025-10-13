import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface Payslip {
  id: string;
  employeeId: string;
  payRunId?: string;
  periodStart: string;
  periodEnd: string;
  payDate: string;
  country: string;
  currency: string;
  exchangeRateToBase: number;
  locale: string;
  status: 'DRAFT' | 'ISSUED' | 'AMENDED' | 'VOID';
  generatedAt?: string;
  signedBy?: string;
  version: number;
  supersedesPayslipId?: string;
  grossPay: number;
  totalDeductions: number;
  totalEmployerContributions: number;
  netPay: number;
  paymentMethod: string;
  bankInstructions?: any;
  ytdSnapshot?: any;
  meta?: any;
  earnings?: PayslipEarning[];
  preTaxDeductions?: PayslipDeduction[];
  taxes?: PayslipTax[];
  postTaxDeductions?: PayslipDeduction[];
  garnishments?: PayslipGarnishment[];
  employerContributions?: PayslipEmployerContribution[];
  allowances?: PayslipAllowance[];
  reimbursements?: PayslipReimbursement[];
  leaveBalances?: any;
  equityWithholding?: any[];
  retroAdjustments?: any[];
  messages?: any[];
  pdfUrl?: string;
  emailSent?: boolean;
  emailSentAt?: string;
  calculationTrace?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipEarning {
  id: string;
  code: string;
  label: string;
  qty: number;
  rate: number;
  units: string;
  periodAmount: number;
  taxable: boolean;
  niable: boolean;
  pensionable: boolean;
  bonusFlag: boolean;
  overtimeClass?: string;
  costCenter?: string;
  calcTrace?: any;
}

export interface PayslipDeduction {
  id: string;
  code: string;
  label: string;
  periodAmount: number;
  isPreTax: boolean;
  calcTrace?: any;
}

export interface PayslipTax {
  id: string;
  jurisdiction: string;
  taxCode: string;
  basis: string;
  taxableBase: number;
  rate?: number;
  amount: number;
  calcTrace?: any;
}

export interface PayslipGarnishment {
  id: string;
  type: string;
  courtRef?: string;
  priority: number;
  amount: number;
  calcTrace?: any;
}

export interface PayslipEmployerContribution {
  id: string;
  code: string;
  label: string;
  amount: number;
  calcTrace?: any;
}

export interface PayslipAllowance {
  id: string;
  code: string;
  label: string;
  periodAmount: number;
  taxable: boolean;
  calcTrace?: any;
}

export interface PayslipReimbursement {
  id: string;
  code: string;
  label: string;
  periodAmount: number;
  taxable: boolean;
}

export interface EarningCode {
  id: string;
  code: string;
  label: string;
  description?: string;
  countries: string[];
  taxable: boolean;
  niable: boolean;
  pensionable: boolean;
  isBonusType: boolean;
  isOvertimeType: boolean;
  defaultUnits?: string;
  glMapping?: any;
  countryRules?: any;
  isActive: boolean;
  displayOrder: number;
}

export interface DeductionCode {
  id: string;
  code: string;
  label: string;
  description?: string;
  countries: string[];
  isPreTax: boolean;
  isStatutory: boolean;
  defaultRate?: number;
  defaultAmount?: number;
  maxAmount?: number;
  glMapping?: any;
  countryRules?: any;
  isActive: boolean;
  displayOrder: number;
}

export interface TaxCode {
  id: string;
  country: string;
  code: string;
  label: string;
  description?: string;
  basis: string;
  effectiveFrom: string;
  effectiveTo?: string;
  rateStructure: any;
  formula?: any;
  glMapping?: any;
  legislationRef?: string;
  isActive: boolean;
}

const payslipService = {
  // ==================== Payslip Generation ====================
  
  generatePayslip: async (data: any): Promise<Payslip> => {
    const response = await axios.post(`${API_URL}/payslips/generate`, data);
    return response.data;
  },

  bulkGeneratePayslips: async (data: {
    payRunId: string;
    employeeIds: string[];
    periodStart: string;
    periodEnd: string;
    payDate: string;
  }): Promise<{ success: number; failed: number; results: any[]; errors: any[] }> => {
    const response = await axios.post(`${API_URL}/payslips/bulk-generate`, data);
    return response.data;
  },

  regeneratePayslip: async (id: string, reason: string): Promise<Payslip> => {
    const response = await axios.post(`${API_URL}/payslips/${id}/regenerate`, { reason });
    return response.data;
  },

  previewPayslip: async (data: any): Promise<Payslip> => {
    const response = await axios.post(`${API_URL}/payslips/preview`, data);
    return response.data;
  },

  // ==================== Payslip Access ====================

  getPayslips: async (filters?: {
    employeeId?: string;
    payRunId?: string;
    year?: string;
    period?: string;
    status?: string;
    country?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Payslip[]; meta: any }> => {
    const response = await axios.get(`${API_URL}/payslips`, { params: filters });
    return response.data;
  },

  getEmployeePayslips: async (employeeId: string, filters?: any): Promise<{ data: Payslip[]; meta: any }> => {
    const response = await axios.get(`${API_URL}/payslips/employees/${employeeId}`, { params: filters });
    return response.data;
  },

  getPayslipById: async (id: string): Promise<Payslip> => {
    const response = await axios.get(`${API_URL}/payslips/${id}`);
    return response.data;
  },

  downloadPayslipPDF: async (id: string): Promise<Blob> => {
    const response = await axios.get(`${API_URL}/payslips/${id}/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  verifyPayslip: async (id: string, token: string): Promise<{ valid: boolean; message: string }> => {
    const response = await axios.get(`${API_URL}/payslips/${id}/verify`, {
      params: { token },
    });
    return response.data;
  },

  comparePayslips: async (payslip1Id: string, payslip2Id: string): Promise<any> => {
    const response = await axios.post(`${API_URL}/payslips/compare`, {
      payslip1Id,
      payslip2Id,
    });
    return response.data;
  },

  // ==================== Disputes ====================

  createDispute: async (data: {
    payslipId: string;
    reason: string;
    description?: string;
    affectedLines?: string[];
    attachments?: string[];
  }): Promise<any> => {
    const response = await axios.post(`${API_URL}/payslips/${data.payslipId}/disputes`, data);
    return response.data;
  },

  // ==================== Publishing ====================

  publishPayslips: async (data: {
    payslipIds: string[];
    sendEmail?: boolean;
    generatePDF?: boolean;
  }): Promise<{ total: number; results: any[] }> => {
    const response = await axios.post(`${API_URL}/payslips/publish`, data);
    return response.data;
  },

  // ==================== Catalog ====================

  getEarningCodes: async (country?: string): Promise<EarningCode[]> => {
    const response = await axios.get(`${API_URL}/payslips/catalog/earning-codes`, {
      params: { country },
    });
    return response.data;
  },

  createEarningCode: async (data: Partial<EarningCode>): Promise<EarningCode> => {
    const response = await axios.post(`${API_URL}/payslips/catalog/earning-codes`, data);
    return response.data;
  },

  getDeductionCodes: async (country?: string): Promise<DeductionCode[]> => {
    const response = await axios.get(`${API_URL}/payslips/catalog/deduction-codes`, {
      params: { country },
    });
    return response.data;
  },

  createDeductionCode: async (data: Partial<DeductionCode>): Promise<DeductionCode> => {
    const response = await axios.post(`${API_URL}/payslips/catalog/deduction-codes`, data);
    return response.data;
  },

  getTaxCodes: async (country?: string): Promise<TaxCode[]> => {
    const response = await axios.get(`${API_URL}/payslips/catalog/tax-codes`, {
      params: { country },
    });
    return response.data;
  },

  createTaxCode: async (data: Partial<TaxCode>): Promise<TaxCode> => {
    const response = await axios.post(`${API_URL}/payslips/catalog/tax-codes`, data);
    return response.data;
  },

  getBenefitPlans: async (country?: string): Promise<any[]> => {
    const response = await axios.get(`${API_URL}/payslips/catalog/benefit-plans`, {
      params: { country },
    });
    return response.data;
  },

  getPayslipTemplate: async (country: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/payslips/templates/${country}`);
    return response.data;
  },

  // ==================== Audit ====================

  getPayslipAudit: async (id: string): Promise<any> => {
    const response = await axios.get(`${API_URL}/payslips/${id}/audit`);
    return response.data;
  },
};

export default payslipService;
