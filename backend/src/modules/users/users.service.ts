import { Injectable, ConflictException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePersonalDetailsDto } from './dto/update-personal-details.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { OrganizationService } from '../organization/organization.service';
import { UserRole, Country, Currency } from '../../common/enums';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => OrganizationService))
    private organizationService: OrganizationService,
  ) {}

  async create(registerDto: RegisterDto): Promise<User> {
    const existingUser = await this.findByEmail(registerDto.email);
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create organization for the new user
    const organization = await this.organizationService.create({
      name: `${registerDto.firstName} ${registerDto.lastName}'s Organization`,
      email: registerDto.email,
      phoneNumber: registerDto.phoneNumber || '',
      address: '',
      city: '',
      country: Country.USA, // Default country
      currency: Currency.USD, // Default currency
    });

    // Create user with organization and ADMIN role
    const user = this.usersRepository.create({
      ...registerDto,
      organizationId: organization.id,
      roles: [UserRole.ADMIN], // First user becomes admin
    });
    
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'email', 'firstName', 'lastName', 'roles', 'isActive', 'createdAt'],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.usersRepository.update(id, { lastLoginAt: new Date() });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.softDelete(id);
  }

  /**
   * Update personal details for a user
   */
  async updatePersonalDetails(id: string, updateDto: UpdatePersonalDetailsDto): Promise<User> {
    const user = await this.findOne(id);
    
    Object.assign(user, {
      ...updateDto,
      dateOfBirth: updateDto.dateOfBirth ? new Date(updateDto.dateOfBirth) : user.dateOfBirth,
    });
    
    return this.usersRepository.save(user);
  }

  /**
   * Update address for a user
   */
  async updateAddress(id: string, updateDto: UpdateAddressDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateDto);
    return this.usersRepository.save(user);
  }

  /**
   * Get user's personal details (excluding sensitive data)
   */
  async getPersonalDetails(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'email',
        'firstName',
        'lastName',
        'preferredName',
        'pronouns',
        'dateOfBirth',
        'gender',
        'nationality',
        'maritalStatus',
        'personalEmail',
        'workPhone',
        'personalPhone',
        'phoneNumber',
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postcode',
        'country',
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
