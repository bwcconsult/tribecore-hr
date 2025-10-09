import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
  ) {}

  async create(createDto: CreateDocumentDto): Promise<Document> {
    const document = this.documentsRepository.create(createDto);
    return this.documentsRepository.save(document);
  }

  async findByEmployee(employeeId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });
  }

  async findByOrganization(organizationId: string): Promise<Document[]> {
    return this.documentsRepository.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async verifyDocument(id: string, verifiedBy: string): Promise<Document> {
    const document = await this.findOne(id);
    document.isVerified = true;
    document.verifiedBy = verifiedBy;
    document.verifiedAt = new Date();
    return this.documentsRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.documentsRepository.softDelete(id);
  }
}
