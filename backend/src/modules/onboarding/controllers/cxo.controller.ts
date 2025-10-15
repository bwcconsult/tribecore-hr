import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CXOService } from '../services/cxo.service';
import { ClientAccount } from '../entities/client-account.entity';
import { ClientContact } from '../entities/client-contact.entity';
import { ClientOnboardingStatus } from '../entities/client-onboarding-case.entity';
import {
  CreateClientOnboardingCaseDto,
  UpdateClientOnboardingCaseDto,
} from '../dto/create-client-onboarding-case.dto';
import { CreateClientAccountDto, UpdateClientAccountDto } from '../dto/create-client-account.dto';
import { CreateClientContactDto } from '../dto/create-client-contact.dto';
import { CreateWorkstreamDto } from '../dto/create-workstream.dto';
import { CreateCOTaskDto, UpdateCOTaskDto } from '../dto/create-co-task.dto';
import { Workstream } from '../entities/workstream.entity';
import { COTask } from '../entities/co-task.entity';

@Controller('api/v1/cxo')
export class CXOController {
  constructor(
    private readonly cxoService: CXOService,
    @InjectRepository(ClientAccount)
    private readonly accountRepository: Repository<ClientAccount>,
    @InjectRepository(ClientContact)
    private readonly contactRepository: Repository<ClientContact>,
    @InjectRepository(Workstream)
    private readonly workstreamRepository: Repository<Workstream>,
    @InjectRepository(COTask)
    private readonly taskRepository: Repository<COTask>,
  ) {}

  // ========== CLIENT ACCOUNTS ==========
  @Post('accounts')
  async createAccount(@Body() dto: CreateClientAccountDto) {
    const account = this.accountRepository.create(dto);
    return this.accountRepository.save(account);
  }

  @Get('accounts')
  async getAccounts(@Query('organizationId') organizationId: string) {
    return this.accountRepository.find({
      where: { organizationId },
      relations: ['contacts'],
      order: { createdAt: 'DESC' },
    });
  }

  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.accountRepository.findOne({
      where: { id },
      relations: ['contacts', 'onboardingCases'],
    });
  }

  @Patch('accounts/:id')
  async updateAccount(@Param('id') id: string, @Body() dto: UpdateClientAccountDto) {
    await this.accountRepository.update(id, dto);
    return this.accountRepository.findOne({ where: { id } });
  }

  // ========== CLIENT CONTACTS ==========
  @Post('accounts/:accountId/contacts')
  async createContact(
    @Param('accountId') accountId: string,
    @Body() dto: CreateClientContactDto,
  ) {
    const contact = this.contactRepository.create({ ...dto, accountId });
    return this.contactRepository.save(contact);
  }

  @Get('accounts/:accountId/contacts')
  async getContacts(@Param('accountId') accountId: string) {
    return this.contactRepository.find({
      where: { accountId },
      order: { primaryContact: 'DESC', name: 'ASC' },
    });
  }

  // ========== CLIENT ONBOARDING CASES ==========
  @Post('cases')
  async createCase(@Body() dto: CreateClientOnboardingCaseDto) {
    return this.cxoService.createCaseFromIntake(dto);
  }

  @Get('cases')
  async getCases(
    @Query('organizationId') organizationId: string,
    @Query('status') status?: string,
    @Query('csmId') csmId?: string,
    @Query('tier') tier?: string,
    @Query('region') region?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.cxoService.getCases({
      organizationId,
      status: status as ClientOnboardingStatus,
      csmId,
      tier,
      region,
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('cases/:id')
  async getCase(@Param('id') id: string) {
    return this.cxoService.getCase(id);
  }

  @Patch('cases/:id/status')
  async updateCaseStatus(
    @Param('id') id: string,
    @Body('status') status: ClientOnboardingStatus,
  ) {
    return this.cxoService.updateCaseStatus(id, status);
  }

  @Patch('cases/:id')
  async updateCase(@Param('id') id: string, @Body() dto: UpdateClientOnboardingCaseDto) {
    return this.cxoService.updateCase(id, dto);
  }

  @Delete('cases/:id')
  async deleteCase(@Param('id') id: string) {
    await this.cxoService.deleteCase(id);
    return { message: 'Case deleted successfully' };
  }

  @Get('cases/:id/go-live-gate')
  async checkGoLiveGate(@Param('id') id: string) {
    return this.cxoService.checkGoLiveGate(id);
  }

  @Patch('cases/:id/gate/:gateName')
  async updateGateCheck(
    @Param('id') id: string,
    @Param('gateName') gateName: string,
    @Body('approved') approved: boolean,
  ) {
    return this.cxoService.updateGateCheck(id, gateName as any, approved);
  }

  @Get('cases/:id/completion')
  async getCompletion(@Param('id') id: string) {
    const percentage = await this.cxoService.calculateCompletionPercentage(id);
    return { completionPercentage: percentage };
  }

  // ========== WORKSTREAMS ==========
  @Post('cases/:caseId/workstreams')
  async createWorkstream(@Param('caseId') caseId: string, @Body() dto: CreateWorkstreamDto) {
    const workstream = this.workstreamRepository.create({ ...dto, caseId });
    return this.workstreamRepository.save(workstream);
  }

  @Get('workstreams/:id')
  async getWorkstream(@Param('id') id: string) {
    return this.workstreamRepository.findOne({
      where: { id },
      relations: ['tasks'],
    });
  }

  // ========== CO TASKS ==========
  @Post('workstreams/:workstreamId/tasks')
  async createTask(@Param('workstreamId') workstreamId: string, @Body() dto: CreateCOTaskDto) {
    const task = this.taskRepository.create({ ...dto, workstreamId });
    return this.taskRepository.save(task);
  }

  @Get('tasks/:id')
  async getTask(@Param('id') id: string) {
    return this.taskRepository.findOne({ where: { id } });
  }

  @Patch('tasks/:id')
  async updateTask(@Param('id') id: string, @Body() dto: UpdateCOTaskDto) {
    await this.taskRepository.update(id, dto);
    return this.taskRepository.findOne({ where: { id } });
  }

  @Delete('tasks/:id')
  async deleteTask(@Param('id') id: string) {
    await this.taskRepository.softDelete(id);
    return { message: 'Task deleted successfully' };
  }
}
