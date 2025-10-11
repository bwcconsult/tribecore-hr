import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { SavedSearchCategory, SavedSearchScope } from '../entities/saved-search.entity';

export class CreateSavedSearchDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsEnum(SavedSearchCategory)
  category: SavedSearchCategory;

  @IsNotEmpty()
  @IsEnum(SavedSearchScope)
  scope: SavedSearchScope;

  @IsNotEmpty()
  @IsObject()
  query: {
    filters: Array<{
      field: string;
      operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'like' | 'between';
      value: any;
    }>;
    sort?: Array<{
      field: string;
      direction: 'ASC' | 'DESC';
    }>;
    columns?: string[];
    groupBy?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWithUserIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWithRoles?: string[];

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @IsOptional()
  @IsBoolean()
  autoRefresh?: boolean;

  @IsOptional()
  @IsNumber()
  refreshIntervalMinutes?: number;
}

export class UpdateSavedSearchDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SavedSearchScope)
  scope?: SavedSearchScope;

  @IsOptional()
  @IsObject()
  query?: any;

  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;
}

export class ExecuteSavedSearchDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
