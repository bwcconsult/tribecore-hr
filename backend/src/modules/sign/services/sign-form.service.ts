import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SignForm, SignFormStatus } from '../entities/sign-form.entity';
import { CreateSignFormDto } from '../dto/create-sign-form.dto';
import { TemplateService } from './template.service';

@Injectable()
export class SignFormService {
  constructor(
    @InjectRepository(SignForm)
    private signFormRepository: Repository<SignForm>,
    private templateService: TemplateService,
  ) {}

  async create(
    createSignFormDto: CreateSignFormDto,
    userId: string,
  ): Promise<SignForm> {
    const signForm = this.signFormRepository.create({
      ...createSignFormDto,
      ownerId: userId,
    });

    const savedSignForm = await this.signFormRepository.save(signForm);

    // Increment active sign forms count on template
    if (savedSignForm.templateId) {
      await this.templateService.incrementActiveSignForms(
        savedSignForm.templateId,
      );
    }

    return savedSignForm;
  }

  async findAll(userId: string, filters?: any): Promise<SignForm[]> {
    const query = this.signFormRepository.createQueryBuilder('signForm');

    query.where('signForm.ownerId = :userId', { userId });

    if (filters?.status) {
      query.andWhere('signForm.status = :status', { status: filters.status });
    }

    query.leftJoinAndSelect('signForm.template', 'template');
    query.orderBy('signForm.createdAt', 'DESC');

    return await query.getMany();
  }

  async findOne(id: string): Promise<SignForm> {
    const signForm = await this.signFormRepository.findOne({
      where: { id },
      relations: ['template'],
    });

    if (!signForm) {
      throw new NotFoundException('SignForm not found');
    }

    return signForm;
  }

  async update(
    id: string,
    updateSignFormDto: Partial<CreateSignFormDto>,
  ): Promise<SignForm> {
    const signForm = await this.findOne(id);

    Object.assign(signForm, updateSignFormDto);

    return await this.signFormRepository.save(signForm);
  }

  async delete(id: string): Promise<void> {
    const signForm = await this.findOne(id);

    // Decrement active sign forms count on template
    if (signForm.templateId) {
      await this.templateService.decrementActiveSignForms(signForm.templateId);
    }

    await this.signFormRepository.remove(signForm);
  }

  async incrementResponse(id: string): Promise<void> {
    const signForm = await this.findOne(id);
    signForm.responseCount += 1;

    // Check if limit reached
    if (
      signForm.responseLimit &&
      signForm.responseCount >= signForm.responseLimit
    ) {
      signForm.status = SignFormStatus.LIMIT_REACHED;
    }

    await this.signFormRepository.save(signForm);
  }

  async checkExpiration(): Promise<void> {
    const expiredForms = await this.signFormRepository
      .createQueryBuilder('signForm')
      .where('signForm.validUntil < :now', { now: new Date() })
      .andWhere('signForm.status = :status', {
        status: SignFormStatus.ACTIVE,
      })
      .getMany();

    for (const form of expiredForms) {
      form.status = SignFormStatus.EXPIRED;
      await this.signFormRepository.save(form);
    }
  }
}
