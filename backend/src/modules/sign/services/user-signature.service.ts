import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSignature } from '../entities/user-signature.entity';
import { UpdateUserSignatureDto } from '../dto/update-user-signature.dto';

@Injectable()
export class UserSignatureService {
  constructor(
    @InjectRepository(UserSignature)
    private userSignatureRepository: Repository<UserSignature>,
  ) {}

  async findOrCreate(userId: string): Promise<UserSignature> {
    let userSignature = await this.userSignatureRepository.findOne({
      where: { userId },
    });

    if (!userSignature) {
      userSignature = this.userSignatureRepository.create({ userId });
      await this.userSignatureRepository.save(userSignature);
    }

    return userSignature;
  }

  async update(
    userId: string,
    updateDto: UpdateUserSignatureDto,
  ): Promise<UserSignature> {
    const userSignature = await this.findOrCreate(userId);

    Object.assign(userSignature, updateDto);

    return await this.userSignatureRepository.save(userSignature);
  }

  async getProfile(userId: string): Promise<UserSignature> {
    return await this.findOrCreate(userId);
  }
}
