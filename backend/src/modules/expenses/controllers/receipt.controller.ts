import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
  Res,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { OcrService } from '../services/ocr.service';
import { StorageService } from '../services/storage.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receipt } from '../entities/receipt.entity';
import { ExpenseItem } from '../entities/expense-item.entity';

@ApiTags('Receipts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/receipts')
export class ReceiptController {
  constructor(
    private ocrService: OcrService,
    private storageService: StorageService,
    @InjectRepository(Receipt)
    private receiptRepository: Repository<Receipt>,
    @InjectRepository(ExpenseItem)
    private expenseItemRepository: Repository<ExpenseItem>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload receipt and extract data with OCR' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Receipt uploaded and processed' })
  async uploadReceipt(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: any,
    @Body('expenseItemId') expenseItemId?: string,
    @Body('claimId') claimId?: string,
    @Body('processOcr') processOcr: string = 'true',
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    if (!this.ocrService.isSupportedFormat(file.mimetype)) {
      throw new BadRequestException(
        'Unsupported file format. Please upload JPG, PNG, TIFF, or PDF.',
      );
    }

    // Validate file size
    if (!this.ocrService.isValidSize(file.size)) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Generate hash for duplicate detection
    const imageHash = this.ocrService.generateImageHash(file.buffer);

    // Check for duplicate
    const existingReceipt = await this.receiptRepository.findOne({
      where: { fileHash: imageHash.hash },
    });

    if (existingReceipt) {
      throw new BadRequestException('This receipt has already been uploaded');
    }

    // Upload to storage
    const uploadResult = await this.storageService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      user.id,
      claimId,
    );

    // Process OCR if requested
    let ocrResult = null;
    if (processOcr === 'true') {
      try {
        ocrResult = await this.ocrService.analyzeReceipt(file.buffer);
      } catch (error) {
        // OCR failed, but we still save the receipt
        console.error('OCR processing failed:', error.message);
      }
    }

    // Create receipt record
    const receipt = this.receiptRepository.create({
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
      storageKey: uploadResult.key,
      storageBucket: uploadResult.bucket,
      fileUrl: uploadResult.url,
      fileHash: imageHash.hash,
      hashAlgorithm: imageHash.algorithm,
      uploadedBy: user.id,
      ocrProcessed: ocrResult !== null,
      ocrData: ocrResult,
      ocrConfidence: ocrResult?.confidence,
      extractedAmount: ocrResult?.amount,
      extractedDate: ocrResult?.date ? new Date(ocrResult.date) : undefined,
      extractedVendor: ocrResult?.vendor,
      extractedCurrency: ocrResult?.currency,
    });

    // If expenseItemId is provided, link it
    if (expenseItemId) {
      const expenseItem = await this.expenseItemRepository.findOne({
        where: { id: expenseItemId },
      });
      
      if (expenseItem) {
        receipt.expenseItemId = expenseItemId;
      }
    }

    const savedReceipt = await this.receiptRepository.save(receipt);

    // Validate OCR result if processed
    let validation = null;
    if (ocrResult) {
      validation = this.ocrService.validateOcrResult(ocrResult);
    }

    return {
      receipt: savedReceipt,
      ocrResult,
      validation,
      message: ocrResult
        ? 'Receipt uploaded and processed successfully'
        : 'Receipt uploaded successfully (OCR not processed)',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get receipt by ID' })
  @ApiResponse({ status: 200, description: 'Receipt details' })
  async getReceipt(@Param('id') id: string) {
    const receipt = await this.receiptRepository.findOne({
      where: { id },
      relations: ['expenseItem', 'expenseItem.claim'],
    });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    // Generate fresh presigned URL if needed
    if (receipt.storageKey) {
      receipt.fileUrl = await this.storageService.getPresignedUrl(receipt.storageKey);
    }

    return receipt;
  }

  @Get('file/:key')
  @ApiOperation({ summary: 'Download receipt file' })
  @ApiResponse({ status: 200, description: 'File content' })
  async downloadReceipt(@Param('key') key: string, @Res() res: Response) {
    try {
      // Decode key
      const decodedKey = decodeURIComponent(key);

      // Get file from storage
      const fileBuffer = await this.storageService.getFile(decodedKey);

      // Get receipt info for mime type
      const receipt = await this.receiptRepository.findOne({
        where: { storageKey: decodedKey },
      });

      const mimeType = receipt?.mimeType || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${receipt?.fileName || 'receipt'}"`);
      res.send(fileBuffer);
    } catch (error) {
      throw new NotFoundException('File not found');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete receipt' })
  @ApiResponse({ status: 204, description: 'Receipt deleted' })
  async deleteReceipt(@Param('id') id: string, @CurrentUser() user: any) {
    const receipt = await this.receiptRepository.findOne({ where: { id } });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    // Check permission (only uploader or admin can delete)
    if (receipt.uploadedBy !== user.id && user.role !== 'ADMIN') {
      throw new BadRequestException('You do not have permission to delete this receipt');
    }

    // Delete from storage
    if (receipt.storageKey) {
      try {
        await this.storageService.deleteFile(receipt.storageKey);
      } catch (error) {
        console.error('Failed to delete file from storage:', error.message);
      }
    }

    // Delete from database
    await this.receiptRepository.remove(receipt);

    return { message: 'Receipt deleted successfully' };
  }

  @Post(':id/reprocess')
  @ApiOperation({ summary: 'Reprocess receipt with OCR' })
  @ApiResponse({ status: 200, description: 'Receipt reprocessed' })
  async reprocessReceipt(@Param('id') id: string) {
    const receipt = await this.receiptRepository.findOne({ where: { id } });

    if (!receipt) {
      throw new NotFoundException('Receipt not found');
    }

    if (!receipt.storageKey) {
      throw new BadRequestException('Receipt file not found in storage');
    }

    // Get file from storage
    const fileBuffer = await this.storageService.getFile(receipt.storageKey);

    // Process with OCR
    const ocrResult = await this.ocrService.analyzeReceipt(fileBuffer);

    // Update receipt
    receipt.ocrProcessed = true;
    receipt.ocrData = ocrResult;
    receipt.ocrConfidence = ocrResult.confidence;
    receipt.extractedAmount = ocrResult.amount;
    receipt.extractedDate = ocrResult.date ? new Date(ocrResult.date) : undefined;
    receipt.extractedVendor = ocrResult.vendor;
    receipt.extractedCurrency = ocrResult.currency;

    const updatedReceipt = await this.receiptRepository.save(receipt);

    const validation = this.ocrService.validateOcrResult(ocrResult);

    return {
      receipt: updatedReceipt,
      ocrResult,
      validation,
      message: 'Receipt reprocessed successfully',
    };
  }

  @Get('item/:expenseItemId')
  @ApiOperation({ summary: 'Get receipts for expense item' })
  @ApiResponse({ status: 200, description: 'List of receipts' })
  async getReceiptsForItem(@Param('expenseItemId') expenseItemId: string) {
    const receipts = await this.receiptRepository.find({
      where: { expenseItemId },
      order: { createdAt: 'DESC' },
    });

    // Update presigned URLs
    for (const receipt of receipts) {
      if (receipt.storageKey) {
        receipt.fileUrl = await this.storageService.getPresignedUrl(receipt.storageKey);
      }
    }

    return receipts;
  }

  @Post('extract-text')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Extract raw text from receipt (without analysis)' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Extracted text' })
  async extractText(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.ocrService.isSupportedFormat(file.mimetype)) {
      throw new BadRequestException('Unsupported file format');
    }

    const text = await this.ocrService.extractText(file.buffer);

    return {
      text,
      fileName: file.originalname,
      message: 'Text extracted successfully',
    };
  }
}
