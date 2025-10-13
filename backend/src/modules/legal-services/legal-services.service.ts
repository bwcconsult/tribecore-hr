import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LegalAdviceRequest, AdviceRequestStatus } from './entities/legal-advice-request.entity';
import { DocumentTemplate } from './entities/document-template.entity';
import { HRInsuranceClaim, ClaimStatus } from './entities/hr-insurance-claim.entity';

@Injectable()
export class LegalServicesService {
  constructor(
    @InjectRepository(LegalAdviceRequest)
    private adviceRepo: Repository<LegalAdviceRequest>,
    @InjectRepository(DocumentTemplate)
    private templateRepo: Repository<DocumentTemplate>,
    @InjectRepository(HRInsuranceClaim)
    private claimRepo: Repository<HRInsuranceClaim>,
  ) {}

  // === LEGAL ADVICE ===
  async createAdviceRequest(data: Partial<LegalAdviceRequest>): Promise<LegalAdviceRequest> {
    const requestNumber = `ADV-${Date.now()}`;
    const request = this.adviceRepo.create({ ...data, requestNumber });
    return this.adviceRepo.save(request);
  }

  async findAllAdviceRequests(orgId: string): Promise<LegalAdviceRequest[]> {
    return this.adviceRepo.find({ 
      where: { organizationId: orgId }, 
      order: { createdAt: 'DESC' } 
    });
  }

  async respondToAdvice(id: string, response: string, respondedBy: string): Promise<LegalAdviceRequest> {
    const request = await this.adviceRepo.findOne({ where: { id } });
    if (!request) throw new NotFoundException('Request not found');
    
    request.response = response;
    request.respondedBy = respondedBy;
    request.respondedAt = new Date();
    request.status = AdviceRequestStatus.RESPONDED;
    
    return this.adviceRepo.save(request);
  }

  // === DOCUMENT TEMPLATES ===
  async createTemplate(data: Partial<DocumentTemplate>): Promise<DocumentTemplate> {
    const template = this.templateRepo.create(data);
    return this.templateRepo.save(template);
  }

  async findAllTemplates(category?: string): Promise<DocumentTemplate[]> {
    const query: any = { isActive: true };
    if (category) query.category = category;
    return this.templateRepo.find({ where: query, order: { usageCount: 'DESC' } });
  }

  async getTemplate(id: string): Promise<DocumentTemplate> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) throw new NotFoundException('Template not found');
    
    template.usageCount += 1;
    await this.templateRepo.save(template);
    
    return template;
  }

  async generateDocument(templateId: string, data: Record<string, any>): Promise<string> {
    const template = await this.getTemplate(templateId);
    let content = template.content;
    
    // Replace placeholders
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      content = content.replace(new RegExp(placeholder, 'g'), data[key]);
    });
    
    return content;
  }

  // === HR INSURANCE ===
  async createClaim(data: Partial<HRInsuranceClaim>): Promise<HRInsuranceClaim> {
    const claimNumber = `CLM-${Date.now()}`;
    const claim = this.claimRepo.create({ ...data, claimNumber });
    return this.claimRepo.save(claim);
  }

  async findAllClaims(orgId: string): Promise<HRInsuranceClaim[]> {
    return this.claimRepo.find({ 
      where: { organizationId: orgId }, 
      order: { createdAt: 'DESC' } 
    });
  }

  async updateClaimStatus(id: string, status: ClaimStatus): Promise<HRInsuranceClaim> {
    const claim = await this.claimRepo.findOne({ where: { id } });
    if (!claim) throw new NotFoundException('Claim not found');
    
    claim.status = status;
    return this.claimRepo.save(claim);
  }

  // === ANALYTICS ===
  async getAnalytics(orgId: string) {
    const adviceRequests = await this.adviceRepo.count({ where: { organizationId: orgId } });
    const activeClaims = await this.claimRepo.count({ 
      where: { organizationId: orgId, status: ClaimStatus.IN_LITIGATION } 
    });
    const templates = await this.templateRepo.count({ where: { isActive: true } });
    
    return { adviceRequests, activeClaims, templates, responseTime: '< 24hrs' };
  }
}
