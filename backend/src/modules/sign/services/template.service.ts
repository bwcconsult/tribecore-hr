import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplateService {
  constructor(
    @InjectRepository(Template)
    private templateRepository: Repository<Template>,
  ) {}

  async create(
    createTemplateDto: CreateTemplateDto,
    userId: string,
  ): Promise<Template> {
    const template = this.templateRepository.create({
      ...createTemplateDto,
      ownerId: userId,
    });

    return await this.templateRepository.save(template);
  }

  async findAll(userId: string): Promise<Template[]> {
    return await this.templateRepository.find({
      where: { ownerId: userId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Template> {
    const template = await this.templateRepository.findOne({ where: { id } });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async update(
    id: string,
    updateTemplateDto: Partial<CreateTemplateDto>,
  ): Promise<Template> {
    const template = await this.findOne(id);

    Object.assign(template, updateTemplateDto);

    return await this.templateRepository.save(template);
  }

  async delete(id: string): Promise<void> {
    const template = await this.findOne(id);
    await this.templateRepository.remove(template);
  }

  async incrementActiveSignForms(id: string): Promise<void> {
    const template = await this.findOne(id);
    template.activeSignForms += 1;
    await this.templateRepository.save(template);
  }

  async decrementActiveSignForms(id: string): Promise<void> {
    const template = await this.findOne(id);
    template.activeSignForms = Math.max(0, template.activeSignForms - 1);
    await this.templateRepository.save(template);
  }
}
