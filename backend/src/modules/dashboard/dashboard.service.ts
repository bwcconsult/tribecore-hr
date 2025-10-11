import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch, SavedSearchScope } from './entities/saved-search.entity';
import { WidgetConfig } from './entities/widget-config.entity';
import { CreateSavedSearchDto, UpdateSavedSearchDto, ExecuteSavedSearchDto } from './dto/create-saved-search.dto';
import { UserRole } from '../../common/enums';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(SavedSearch)
    private savedSearchRepository: Repository<SavedSearch>,
    @InjectRepository(WidgetConfig)
    private widgetConfigRepository: Repository<WidgetConfig>,
  ) {}

  /**
   * Create saved search
   */
  async createSavedSearch(userId: string, dto: CreateSavedSearchDto): Promise<SavedSearch> {
    const search = this.savedSearchRepository.create({
      ...dto,
      ownerId: userId,
      usageCount: 0,
    });

    return this.savedSearchRepository.save(search);
  }

  /**
   * Get user's saved searches
   */
  async getUserSavedSearches(userId: string, category?: string): Promise<SavedSearch[]> {
    const query: any = {
      ownerId: userId,
      isActive: true,
    };

    if (category) {
      query.category = category;
    }

    return this.savedSearchRepository.find({
      where: query,
      order: {
        isPinned: 'DESC',
        isFavorite: 'DESC',
        usageCount: 'DESC',
        name: 'ASC',
      },
    });
  }

  /**
   * Get shared searches accessible to user
   */
  async getSharedSearches(userId: string, userRoles: UserRole[]): Promise<SavedSearch[]> {
    // Get searches shared with this user or their roles
    const searches = await this.savedSearchRepository
      .createQueryBuilder('search')
      .where('search.isActive = :isActive', { isActive: true })
      .andWhere(
        '(search.scope = :org OR search.sharedWithUserIds @> ARRAY[:userId]::text[])',
        { org: SavedSearchScope.ORG, userId },
      )
      .orderBy('search.usageCount', 'DESC')
      .getMany();

    return searches;
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    searchId: string,
    userId: string,
    dto: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    const search = await this.savedSearchRepository.findOne({
      where: { id: searchId, ownerId: userId },
    });

    if (!search) {
      throw new NotFoundException('Saved search not found or access denied');
    }

    Object.assign(search, dto);
    return this.savedSearchRepository.save(search);
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(searchId: string, userId: string): Promise<void> {
    const search = await this.savedSearchRepository.findOne({
      where: { id: searchId, ownerId: userId },
    });

    if (!search) {
      throw new NotFoundException('Saved search not found or access denied');
    }

    await this.savedSearchRepository.remove(search);
  }

  /**
   * Execute saved search (increment usage counter)
   */
  async executeSavedSearch(searchId: string, userId: string): Promise<SavedSearch> {
    const search = await this.savedSearchRepository.findOne({
      where: { id: searchId },
    });

    if (!search) {
      throw new NotFoundException('Saved search not found');
    }

    // Check access
    if (
      search.ownerId !== userId &&
      search.scope === SavedSearchScope.PRIVATE
    ) {
      throw new ForbiddenException('Access denied');
    }

    // Increment usage
    search.usageCount++;
    search.lastUsedAt = new Date();

    return this.savedSearchRepository.save(search);
  }

  /**
   * Get widget configuration for a role
   */
  async getWidgetsForRole(role: UserRole): Promise<WidgetConfig[]> {
    return this.widgetConfigRepository.find({
      where: {
        role,
        isEnabled: true,
      },
      order: {
        defaultOrder: 'ASC',
      },
    });
  }

  /**
   * Get all widget configurations (admin only)
   */
  async getAllWidgetConfigs(): Promise<WidgetConfig[]> {
    return this.widgetConfigRepository.find({
      order: {
        role: 'ASC',
        defaultOrder: 'ASC',
      },
    });
  }

  /**
   * Update widget configuration (admin only)
   */
  async updateWidgetConfig(
    configId: string,
    updates: Partial<WidgetConfig>,
  ): Promise<WidgetConfig> {
    const config = await this.widgetConfigRepository.findOne({
      where: { id: configId },
    });

    if (!config) {
      throw new NotFoundException('Widget configuration not found');
    }

    Object.assign(config, updates);
    return this.widgetConfigRepository.save(config);
  }

  /**
   * Toggle widget enabled state
   */
  async toggleWidget(configId: string, isEnabled: boolean): Promise<WidgetConfig> {
    return this.updateWidgetConfig(configId, { isEnabled });
  }
}
