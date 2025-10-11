import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseEnrollment } from './entities/course.entity';
import { CreateCourseDto, CreateEnrollmentDto } from './dto/create-course.dto';
import { UpdateCourseDto, UpdateEnrollmentDto } from './dto/update-course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
  ) {}

  // Course Methods
  async createCourse(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepository.create(createCourseDto);
    return await this.courseRepository.save(course);
  }

  async findAllCourses(
    organizationId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: Course[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10, search } = paginationDto;
    const skip = (page - 1) * limit;

    const query = this.courseRepository
      .createQueryBuilder('course')
      .where('course.organizationId = :organizationId', { organizationId });

    if (search) {
      query.andWhere(
        '(course.title ILIKE :search OR course.category ILIKE :search OR course.instructor ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [data, total] = await query
      .orderBy('course.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCourseById(id: string): Promise<Course> {
    const course = await this.courseRepository.findOne({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    return course;
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findCourseById(id);
    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async deleteCourse(id: string): Promise<void> {
    const course = await this.findCourseById(id);
    await this.courseRepository.remove(course);
  }

  // Enrollment Methods
  async enrollEmployee(createEnrollmentDto: CreateEnrollmentDto): Promise<CourseEnrollment> {
    const enrollment = this.enrollmentRepository.create(createEnrollmentDto);
    const saved = await this.enrollmentRepository.save(enrollment);

    // Increment enrollment count
    await this.courseRepository.increment(
      { id: createEnrollmentDto.courseId },
      'enrollmentCount',
      1,
    );

    return saved;
  }

  async findEnrollmentsByCourse(
    courseId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: CourseEnrollment[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.enrollmentRepository.findAndCount({
      where: { courseId },
      relations: ['employee'],
      order: { enrollmentDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findEnrollmentsByEmployee(
    employeeId: string,
    paginationDto: PaginationDto,
  ): Promise<{ data: CourseEnrollment[]; total: number; page: number; totalPages: number }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await this.enrollmentRepository.findAndCount({
      where: { employeeId },
      relations: ['course'],
      order: { enrollmentDate: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findEnrollmentById(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
      relations: ['course', 'employee'],
    });
    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    return enrollment;
  }

  async updateEnrollment(
    id: string,
    updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<CourseEnrollment> {
    const enrollment = await this.findEnrollmentById(id);
    Object.assign(enrollment, updateEnrollmentDto);
    return await this.enrollmentRepository.save(enrollment);
  }

  async updateProgress(
    id: string,
    completedLessons: string[],
    progressPercentage: number,
  ): Promise<CourseEnrollment> {
    const enrollment = await this.findEnrollmentById(id);
    enrollment.completedLessons = completedLessons;
    enrollment.progressPercentage = progressPercentage;
    
    if (progressPercentage >= 100) {
      enrollment.status = 'COMPLETED' as any;
      enrollment.completionDate = new Date();
      
      // Increment completion count
      await this.courseRepository.increment(
        { id: enrollment.courseId },
        'completionCount',
        1,
      );
    }
    
    return await this.enrollmentRepository.save(enrollment);
  }

  async deleteEnrollment(id: string): Promise<void> {
    const enrollment = await this.findEnrollmentById(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async getStats(organizationId: string) {
    const [totalCourses, publishedCourses, totalEnrollments, completedEnrollments] = await Promise.all([
      this.courseRepository.count({ where: { organizationId } }),
      this.courseRepository.count({ where: { organizationId, status: 'PUBLISHED' } }),
      this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoin('enrollment.course', 'course')
        .where('course.organizationId = :organizationId', { organizationId })
        .getCount(),
      this.enrollmentRepository
        .createQueryBuilder('enrollment')
        .leftJoin('enrollment.course', 'course')
        .where('course.organizationId = :organizationId', { organizationId })
        .andWhere('enrollment.status = :status', { status: 'COMPLETED' })
        .getCount(),
    ]);

    return {
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedEnrollments,
      completionRate: totalEnrollments > 0 ? (completedEnrollments / totalEnrollments) * 100 : 0,
    };
  }
}
