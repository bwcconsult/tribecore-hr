import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CorpCardTxn } from '../entities/corp-card-txn.entity';
@ApiTags('Corporate Card')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/corp-card')
export class CorpCardController {
  constructor(
    @InjectRepository(CorpCardTxn)
    private corpCardRepo: Repository<CorpCardTxn>,
  ) {}

  @Post('import')
  @Roles(UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Import corporate card transactions from CSV' })
  @UseInterceptors(FileInterceptor('file'))
  async importTransactions(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Parse CSV manually (simple implementation)
    const csvText = file.buffer.toString('utf-8');
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim());
    
    const transactions: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = lines[i].split(',');
      const row: any = {};
      
      headers.forEach((header: string, index: number) => {
        row[header] = values[index]?.trim();
      });

      transactions.push({
        postedAt: new Date(row.date || row.postedAt),
        amount: parseFloat(row.amount),
        currencyCode: row.currency || row.currencyCode || 'GBP',
        merchant: row.merchant,
        last4: row.last4 || row.cardLast4,
        cardholderId: row.cardholderId || row.userId,
        matched: false,
      });
    }

    const saved = await this.corpCardRepo.save(transactions);
    
    return {
      message: 'Transactions imported successfully',
      count: saved.length,
      transactions: saved,
    };
  }

  @Get('unmatched')
  @Roles(UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get unmatched corporate card transactions' })
  async getUnmatched() {
    return this.corpCardRepo.find({
      where: { matched: false },
      order: { postedAt: 'DESC' },
    });
  }

  @Post(':id/match-item/:itemId')
  @Roles(UserRole.FINANCE, UserRole.ADMIN)
  @ApiOperation({ summary: 'Match corp card transaction to expense item' })
  async matchTransaction(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    const transaction = await this.corpCardRepo.findOne({ where: { id } });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.claimItemId = itemId;
    transaction.matched = true;

    return this.corpCardRepo.save(transaction);
  }
}
