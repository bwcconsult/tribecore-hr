import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { UserRole } from '../../../common/enums';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpenseCategory } from '../entities/expense-category.entity';
import { CreateExpenseCategoryDto } from '../dto/create-expense-category.dto';

@ApiTags('Expense Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses/categories')
export class CategoryController {
  constructor(
    @InjectRepository(ExpenseCategory)
    private categoryRepository: Repository<ExpenseCategory>,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Create expense category' })
  @ApiResponse({ status: 201, description: 'Category created' })
  async create(@Body() createDto: CreateExpenseCategoryDto) {
    const category = this.categoryRepository.create(createDto);
    return this.categoryRepository.save(category);
  }

  @Get()
  @ApiOperation({ summary: 'Get all expense categories' })
  @ApiResponse({ status: 200, description: 'List of categories' })
  async findAll() {
    return this.categoryRepository.find({
      where: { isActive: true },
      relations: ['parent', 'children'],
      order: { name: 'ASC' },
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({ status: 200, description: 'Category details' })
  async findOne(@Param('id') id: string) {
    return this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Update expense category' })
  @ApiResponse({ status: 200, description: 'Category updated' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: Partial<CreateExpenseCategoryDto>,
  ) {
    await this.categoryRepository.update(id, updateDto);
    return this.findOne(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete expense category' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  async delete(@Param('id') id: string) {
    await this.categoryRepository.delete(id);
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Seed default expense categories' })
  @ApiResponse({ status: 201, description: 'Categories seeded' })
  async seedCategories() {
    const categories = [
      {
        name: 'Travel',
        code: 'TRAVEL',
        description: 'Travel expenses including flights, trains, etc.',
        type: 'TRAVEL',
        requiresReceipt: true,
        defaultMaxAmount: 5000,
      },
      {
        name: 'Accommodation',
        code: 'ACCOMMODATION',
        description: 'Hotel and lodging expenses',
        type: 'ACCOMMODATION',
        requiresReceipt: true,
        defaultMaxAmount: 1500,
      },
      {
        name: 'Meals & Entertainment',
        code: 'MEALS',
        description: 'Food and client entertainment',
        type: 'MEALS',
        requiresReceipt: true,
        defaultMaxAmount: 500,
      },
      {
        name: 'Transport',
        code: 'TRANSPORT',
        description: 'Taxis, Uber, public transport',
        type: 'TRANSPORT',
        requiresReceipt: false,
        defaultMaxAmount: 200,
      },
      {
        name: 'Mileage',
        code: 'MILEAGE',
        description: 'Personal vehicle mileage',
        type: 'MILEAGE',
        requiresReceipt: false,
        defaultMaxAmount: 1000,
      },
      {
        name: 'Office Supplies',
        code: 'OFFICE_SUPPLIES',
        description: 'Stationery and office equipment',
        type: 'OFFICE_SUPPLIES',
        requiresReceipt: true,
        defaultMaxAmount: 300,
      },
      {
        name: 'Software & Subscriptions',
        code: 'SOFTWARE',
        description: 'Software licenses and subscriptions',
        type: 'SOFTWARE_SUBSCRIPTION',
        requiresReceipt: true,
        defaultMaxAmount: 1000,
      },
      {
        name: 'Training & Education',
        code: 'TRAINING',
        description: 'Courses, certifications, books',
        type: 'TRAINING',
        requiresReceipt: true,
        defaultMaxAmount: 2000,
      },
      {
        name: 'Communication',
        code: 'COMMUNICATION',
        description: 'Phone, internet, data',
        type: 'COMMUNICATION',
        requiresReceipt: true,
        defaultMaxAmount: 150,
      },
      {
        name: 'Parking',
        code: 'PARKING',
        description: 'Parking fees and charges',
        type: 'PARKING',
        requiresReceipt: false,
        defaultMaxAmount: 50,
      },
      {
        name: 'Other',
        code: 'OTHER',
        description: 'Miscellaneous expenses',
        type: 'OTHER',
        requiresReceipt: true,
        defaultMaxAmount: 500,
      },
    ];

    const savedCategories = [];
    for (const catData of categories) {
      const existing = await this.categoryRepository.findOne({
        where: { code: catData.code },
      });
      
      if (!existing) {
        const category = this.categoryRepository.create(catData);
        savedCategories.push(await this.categoryRepository.save(category));
      }
    }

    return {
      message: 'Categories seeded successfully',
      count: savedCategories.length,
      categories: savedCategories,
    };
  }
}
