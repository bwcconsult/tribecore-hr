import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async getHeadcountTrends(organizationId: string, startDate: Date, endDate: Date) {
    return {
      organizationId,
      period: { startDate, endDate },
      trends: [
        { month: '2024-01', headcount: 50, newHires: 5, terminations: 2 },
        { month: '2024-02', headcount: 53, newHires: 4, terminations: 1 },
        { month: '2024-03', headcount: 56, newHires: 6, terminations: 3 },
      ],
      growth: {
        total: 12,
        percentage: 24,
      },
    };
  }

  async getAttritionAnalysis(organizationId: string, year: number) {
    return {
      organizationId,
      year,
      totalAttrition: 15,
      attritionRate: 12.5,
      voluntaryAttrition: 10,
      involuntaryAttrition: 5,
      byDepartment: [
        { department: 'Engineering', count: 5, rate: 10 },
        { department: 'Sales', count: 4, rate: 15 },
        { department: 'Marketing', count: 3, rate: 12 },
      ],
      averageTenure: 2.5,
      costOfAttrition: 450000,
    };
  }

  async getCompensationAnalysis(organizationId: string) {
    return {
      organizationId,
      averageSalary: 65000,
      medianSalary: 62000,
      byDepartment: [
        { department: 'Engineering', average: 85000, median: 82000 },
        { department: 'Sales', average: 70000, median: 68000 },
        { department: 'Marketing', average: 60000, median: 58000 },
      ],
      genderPayGap: 0.97,
      salaryBands: [
        { range: '40k-60k', count: 25, percentage: 30 },
        { range: '60k-80k', count: 35, percentage: 42 },
        { range: '80k-100k', count: 15, percentage: 18 },
        { range: '100k+', count: 8, percentage: 10 },
      ],
    };
  }

  async getProductivityMetrics(organizationId: string) {
    return {
      organizationId,
      averageHoursPerWeek: 42.5,
      overtimeHours: 120,
      billableUtilization: 78,
      projectCompletionRate: 92,
      timeToHire: 45,
      trainingHoursPerEmployee: 25,
    };
  }

  async getDiversityMetrics(organizationId: string) {
    return {
      organizationId,
      genderDistribution: {
        male: 55,
        female: 43,
        nonBinary: 2,
      },
      ageDistribution: [
        { range: '18-25', count: 15 },
        { range: '26-35', count: 45 },
        { range: '36-45', count: 28 },
        { range: '46-55', count: 10 },
        { range: '56+', count: 2 },
      ],
      ethnicityDistribution: [],
      leadershipDiversity: {
        female: 38,
        minority: 25,
      },
    };
  }

  async getPredictiveAnalytics(organizationId: string) {
    return {
      organizationId,
      attritionRisk: {
        highRisk: [
          { employeeId: 'emp-123', name: 'John Doe', probability: 0.85, factors: ['Low engagement', 'Below market pay'] },
        ],
        mediumRisk: [],
        lowRisk: [],
      },
      hiringNeeds: {
        nextQuarter: 12,
        byDepartment: [
          { department: 'Engineering', count: 5 },
          { department: 'Sales', count: 4 },
        ],
      },
      budgetForecasts: {
        nextQuarter: 850000,
        nextYear: 3400000,
      },
    };
  }
}
