import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Survey, SurveyResponse, SurveyStatus, SurveyType } from './entities/survey.entity';
import { CreateSurveyDto } from './dto/create-survey.dto';
import { UpdateSurveyDto } from './dto/update-survey.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(SurveyResponse)
    private responseRepo: Repository<SurveyResponse>,
  ) {}

  async create(createDto: CreateSurveyDto): Promise<Survey> {
    const survey = this.surveyRepo.create(createDto);
    return await this.surveyRepo.save(survey);
  }

  async findAll(organizationId: string, filters?: any): Promise<Survey[]> {
    const where: any = { organizationId };
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.type) {
      where.type = filters.type;
    }
    
    if (filters?.search) {
      return await this.surveyRepo.find({
        where: [
          { organizationId, title: Like(`%${filters.search}%`) },
          { organizationId, description: Like(`%${filters.search}%`) },
        ],
      });
    }
    
    return await this.surveyRepo.find({ 
      where,
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Survey> {
    const survey = await this.surveyRepo.findOne({ where: { id } });
    if (!survey) {
      throw new NotFoundException(`Survey with ID ${id} not found`);
    }
    return survey;
  }

  async update(id: string, updateDto: UpdateSurveyDto): Promise<Survey> {
    const survey = await this.findOne(id);
    Object.assign(survey, updateDto);
    return await this.surveyRepo.save(survey);
  }

  async remove(id: string): Promise<void> {
    const survey = await this.findOne(id);
    await this.surveyRepo.remove(survey);
  }

  async publish(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    if (survey.status !== SurveyStatus.DRAFT) {
      throw new BadRequestException('Only draft surveys can be published');
    }
    survey.status = SurveyStatus.ACTIVE;
    return await this.surveyRepo.save(survey);
  }

  async close(id: string): Promise<Survey> {
    const survey = await this.findOne(id);
    survey.status = SurveyStatus.CLOSED;
    return await this.surveyRepo.save(survey);
  }

  // Response Management
  async submitResponse(responseDto: SubmitResponseDto): Promise<SurveyResponse> {
    const survey = await this.findOne(responseDto.surveyId);
    
    if (survey.status !== SurveyStatus.ACTIVE) {
      throw new BadRequestException('Survey is not accepting responses');
    }
    
    // Check if employee already responded (for non-anonymous surveys)
    if (!survey.isAnonymous && responseDto.employeeId) {
      const existing = await this.responseRepo.findOne({
        where: {
          surveyId: responseDto.surveyId,
          employeeId: responseDto.employeeId,
        },
      });
      
      if (existing) {
        throw new BadRequestException('You have already responded to this survey');
      }
    }
    
    const response = this.responseRepo.create({
      ...responseDto,
      submittedAt: new Date(),
    });
    
    const savedResponse = await this.responseRepo.save(response);
    
    // Update response count
    survey.responseCount = (survey.responseCount || 0) + 1;
    await this.surveyRepo.save(survey);
    
    return savedResponse;
  }

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    return await this.responseRepo.find({
      where: { surveyId },
      order: { submittedAt: 'DESC' },
    });
  }

  // Analytics
  async getAnalytics(surveyId: string) {
    const survey = await this.findOne(surveyId);
    const responses = await this.getResponses(surveyId);
    
    if (responses.length === 0) {
      return {
        surveyId,
        title: survey.title,
        totalResponses: 0,
        responseRate: 0,
        questionAnalytics: [],
      };
    }
    
    // Analyze each question
    const questionAnalytics = survey.questions.map(question => {
      const answers = responses.map(r => r.answers[question.id]).filter(a => a !== undefined);
      
      let analytics: any = {
        questionId: question.id,
        questionText: question.text,
        questionType: question.type,
        totalResponses: answers.length,
      };
      
      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'YES_NO') {
        // Count responses for each option
        const optionCounts: Record<string, number> = {};
        answers.forEach(answer => {
          optionCounts[answer] = (optionCounts[answer] || 0) + 1;
        });
        analytics.distribution = optionCounts;
      } else if (question.type === 'RATING' || question.type === 'SCALE') {
        // Calculate average rating
        const numericAnswers = answers.map(a => Number(a)).filter(n => !isNaN(n));
        const average = numericAnswers.reduce((sum, n) => sum + n, 0) / numericAnswers.length;
        analytics.average = Math.round(average * 10) / 10;
        analytics.distribution = this.getRatingDistribution(numericAnswers);
      } else if (question.type === 'TEXT') {
        analytics.responses = answers;
      }
      
      return analytics;
    });
    
    const responseRate = survey.targetCount > 0 
      ? (responses.length / survey.targetCount) * 100 
      : 0;
    
    return {
      surveyId,
      title: survey.title,
      totalResponses: responses.length,
      targetResponses: survey.targetCount,
      responseRate: Math.round(responseRate * 10) / 10,
      questionAnalytics,
      submissionTimeline: this.getSubmissionTimeline(responses),
    };
  }

  private getRatingDistribution(ratings: number[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    ratings.forEach(rating => {
      const key = rating.toString();
      distribution[key] = (distribution[key] || 0) + 1;
    });
    return distribution;
  }

  private getSubmissionTimeline(responses: SurveyResponse[]) {
    const timeline: Record<string, number> = {};
    responses.forEach(response => {
      const date = new Date(response.submittedAt).toISOString().split('T')[0];
      timeline[date] = (timeline[date] || 0) + 1;
    });
    return timeline;
  }

  async getStats(organizationId: string) {
    const surveys = await this.findAll(organizationId);
    
    const active = surveys.filter(s => s.status === SurveyStatus.ACTIVE).length;
    const draft = surveys.filter(s => s.status === SurveyStatus.DRAFT).length;
    const closed = surveys.filter(s => s.status === SurveyStatus.CLOSED).length;
    
    const totalResponses = surveys.reduce((sum, s) => sum + (s.responseCount || 0), 0);
    const avgResponseRate = surveys.length > 0
      ? surveys.reduce((sum, s) => {
          const rate = s.targetCount > 0 ? (s.responseCount / s.targetCount) * 100 : 0;
          return sum + rate;
        }, 0) / surveys.length
      : 0;
    
    return {
      total: surveys.length,
      active,
      draft,
      closed,
      totalResponses,
      avgResponseRate: Math.round(avgResponseRate * 10) / 10,
      byType: this.groupByType(surveys),
    };
  }

  private groupByType(surveys: Survey[]) {
    const grouped: Record<string, number> = {};
    surveys.forEach(survey => {
      grouped[survey.type] = (grouped[survey.type] || 0) + 1;
    });
    return grouped;
  }

  async checkEmployeeResponse(surveyId: string, employeeId: string): Promise<boolean> {
    const response = await this.responseRepo.findOne({
      where: { surveyId, employeeId },
    });
    return !!response;
  }
}
