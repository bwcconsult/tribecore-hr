import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course, CourseEnrollment, EnrollmentStatus } from '../entities/course.entity';
import { CourseModule } from '../entities/course-module.entity';
import { Lesson } from '../entities/lesson.entity';
import { LessonProgress, LessonProgressStatus } from '../entities/lesson-progress.entity';
import { MandatoryTrainingTemplate } from '../entities/mandatory-training.entity';

@Injectable()
export class LearningEnhancedService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepository: Repository<CourseEnrollment>,
    @InjectRepository(CourseModule)
    private readonly moduleRepository: Repository<CourseModule>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(LessonProgress)
    private readonly progressRepository: Repository<LessonProgress>,
    @InjectRepository(MandatoryTrainingTemplate)
    private readonly mandatoryTrainingRepository: Repository<MandatoryTrainingTemplate>,
  ) {}

  // Course Module Management
  async createModule(courseId: string, data: any): Promise<CourseModule> {
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const module = this.moduleRepository.create({
      ...data,
      courseId,
    });

    return await this.moduleRepository.save(module);
  }

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    const modules = await this.moduleRepository.find({
      where: { courseId, isActive: true },
      relations: ['lessons'],
      order: { orderIndex: 'ASC' },
    });
    return modules;
  }

  async updateModule(id: string, data: any): Promise<CourseModule> {
    const module = await this.moduleRepository.findOne({ where: { id } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    Object.assign(module, data);
    return await this.moduleRepository.save(module);
  }

  async deleteModule(id: string): Promise<void> {
    await this.moduleRepository.delete(id);
  }

  // Lesson Management
  async createLesson(moduleId: string, data: any): Promise<Lesson> {
    const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const lesson = this.lessonRepository.create({
      ...data,
      moduleId,
    });

    return await this.lessonRepository.save(lesson);
  }

  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      where: { moduleId, isActive: true },
      order: { orderIndex: 'ASC' },
    });
  }

  async getLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({ where: { id } });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    return lesson;
  }

  async updateLesson(id: string, data: any): Promise<Lesson> {
    const lesson = await this.getLessonById(id);
    Object.assign(lesson, data);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: string): Promise<void> {
    await this.lessonRepository.delete(id);
  }

  // Real-time Progress Tracking
  async startLesson(enrollmentId: string, lessonId: string, employeeId: string): Promise<LessonProgress> {
    const enrollment = await this.enrollmentRepository.findOne({ where: { id: enrollmentId } });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    let progress = await this.progressRepository.findOne({
      where: { enrollmentId, lessonId, employeeId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        enrollmentId,
        lessonId,
        employeeId,
        status: LessonProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    } else {
      progress.status = LessonProgressStatus.IN_PROGRESS;
      progress.lastAccessedAt = new Date();
      if (!progress.startedAt) {
        progress.startedAt = new Date();
      }
    }

    const saved = await this.progressRepository.save(progress);
    await this.updateEnrollmentProgress(enrollmentId);
    return saved;
  }

  async updateLessonProgress(
    progressId: string,
    data: {
      progressPercentage?: number;
      timeSpentSeconds?: number;
      metadata?: any;
    },
  ): Promise<LessonProgress> {
    const progress = await this.progressRepository.findOne({ where: { id: progressId } });
    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    progress.progressPercentage = data.progressPercentage ?? progress.progressPercentage;
    progress.timeSpentSeconds = data.timeSpentSeconds ?? progress.timeSpentSeconds;
    progress.lastAccessedAt = new Date();

    if (data.metadata) {
      progress.metadata = { ...progress.metadata, ...data.metadata };
    }

    // Auto-complete if 100%
    if (progress.progressPercentage >= 100 && progress.status !== LessonProgressStatus.COMPLETED) {
      progress.status = LessonProgressStatus.COMPLETED;
      progress.completedAt = new Date();
    }

    const saved = await this.progressRepository.save(progress);
    await this.updateEnrollmentProgress(progress.enrollmentId);
    return saved;
  }

  async submitQuiz(
    progressId: string,
    answers: Array<{ questionId: string; answer: string | string[] }>,
  ): Promise<{ progress: LessonProgress; score: number; passed: boolean }> {
    const progress = await this.progressRepository.findOne({
      where: { id: progressId },
      relations: ['lesson'],
    });
    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    const lesson = await this.getLessonById(progress.lessonId);
    if (!lesson.quiz) {
      throw new BadRequestException('This lesson does not have a quiz');
    }

    // Check attempts
    if (progress.quizAttempts >= lesson.quiz.attempts) {
      throw new BadRequestException('Maximum quiz attempts reached');
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = lesson.quiz.questions.length;
    const quizAnswers = [];

    for (const answer of answers) {
      const question = lesson.quiz.questions.find((q) => q.id === answer.questionId);
      if (!question) continue;

      const isCorrect = this.checkAnswer(question.correctAnswer, answer.answer);
      if (isCorrect) correctAnswers++;

      quizAnswers.push({
        questionId: answer.questionId,
        answer: answer.answer,
        isCorrect,
        attemptNumber: progress.quizAttempts + 1,
        timestamp: new Date(),
      });
    }

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= lesson.quiz.passingScore;

    progress.quizAttempts++;
    progress.quizScore = score;
    progress.quizAnswers = [...(progress.quizAnswers || []), ...quizAnswers];

    if (passed) {
      progress.status = LessonProgressStatus.COMPLETED;
      progress.completedAt = new Date();
      progress.progressPercentage = 100;
    } else {
      progress.status = LessonProgressStatus.FAILED;
    }

    const saved = await this.progressRepository.save(progress);
    await this.updateEnrollmentProgress(progress.enrollmentId);

    return { progress: saved, score, passed };
  }

  private checkAnswer(correct: string | string[], provided: string | string[]): boolean {
    if (Array.isArray(correct)) {
      if (!Array.isArray(provided)) return false;
      return correct.length === provided.length && correct.every((c) => provided.includes(c));
    }
    return correct.toString().toLowerCase() === provided.toString().toLowerCase();
  }

  async completeLesson(progressId: string): Promise<LessonProgress> {
    const progress = await this.progressRepository.findOne({ where: { id: progressId } });
    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    progress.status = LessonProgressStatus.COMPLETED;
    progress.completedAt = new Date();
    progress.progressPercentage = 100;

    const saved = await this.progressRepository.save(progress);
    await this.updateEnrollmentProgress(progress.enrollmentId);
    return saved;
  }

  async updateEnrollmentProgress(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course'],
    });
    if (!enrollment) return;

    // Get all lessons for the course
    const modules = await this.getCourseModules(enrollment.courseId);
    const allLessons = modules.flatMap((m) => m.lessons);

    // Get progress for all lessons
    const allProgress = await this.progressRepository.find({
      where: { enrollmentId },
    });

    const completedLessons = allProgress.filter(
      (p) => p.status === LessonProgressStatus.COMPLETED,
    ).length;

    const progressPercentage = allLessons.length > 0
      ? (completedLessons / allLessons.length) * 100
      : 0;

    enrollment.progressPercentage = progressPercentage;
    enrollment.completedLessons = allProgress
      .filter((p) => p.status === LessonProgressStatus.COMPLETED)
      .map((p) => p.lessonId);

    // Calculate total time
    const totalTime = allProgress.reduce((sum, p) => sum + p.timeSpentSeconds, 0);
    enrollment.hoursCompleted = Math.round(totalTime / 3600);

    // Update status
    if (progressPercentage >= 100 && enrollment.status !== EnrollmentStatus.COMPLETED) {
      enrollment.status = EnrollmentStatus.COMPLETED;
      enrollment.completionDate = new Date();

      // Update course completion count
      await this.courseRepository.increment(
        { id: enrollment.courseId },
        'completionCount',
        1,
      );
    } else if (progressPercentage > 0 && enrollment.status === EnrollmentStatus.ENROLLED) {
      enrollment.status = EnrollmentStatus.IN_PROGRESS;
      enrollment.startDate = new Date();
    }

    await this.enrollmentRepository.save(enrollment);
  }

  async getEnrollmentProgress(enrollmentId: string): Promise<any> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id: enrollmentId },
      relations: ['course'],
    });
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const modules = await this.getCourseModules(enrollment.courseId);
    const progress = await this.progressRepository.find({
      where: { enrollmentId },
      relations: ['lesson'],
    });

    const modulesWithProgress = modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => {
        const lessonProgress = progress.find((p) => p.lessonId === lesson.id);
        return {
          ...lesson,
          progress: lessonProgress || null,
        };
      }),
    }));

    return {
      enrollment,
      modules: modulesWithProgress,
      overallProgress: enrollment.progressPercentage,
      completedLessons: progress.filter((p) => p.status === LessonProgressStatus.COMPLETED).length,
      totalLessons: modules.reduce((sum, m) => sum + m.lessons.length, 0),
    };
  }

  // Mandatory Training Management
  async createMandatoryTraining(data: any): Promise<MandatoryTrainingTemplate> {
    const template = this.mandatoryTrainingRepository.create(data);
    return await this.mandatoryTrainingRepository.save(template);
  }

  async getAllMandatoryTraining(): Promise<MandatoryTrainingTemplate[]> {
    return await this.mandatoryTrainingRepository.find({
      where: { isActive: true },
      order: { category: 'ASC', title: 'ASC' },
    });
  }

  async getMandatoryTrainingById(id: string): Promise<MandatoryTrainingTemplate> {
    const template = await this.mandatoryTrainingRepository.findOne({ where: { id } });
    if (!template) {
      throw new NotFoundException('Mandatory training template not found');
    }
    return template;
  }

  // Compliance Dashboard
  async getComplianceDashboard(organizationId: string): Promise<any> {
    const allEnrollments = await this.enrollmentRepository
      .createQueryBuilder('enrollment')
      .leftJoin('enrollment.course', 'course')
      .leftJoin('enrollment.employee', 'employee')
      .where('course.organizationId = :organizationId', { organizationId })
      .andWhere('course.isMandatory = :mandatory', { mandatory: true })
      .getMany();

    const completed = allEnrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;
    const inProgress = allEnrollments.filter((e) => e.status === EnrollmentStatus.IN_PROGRESS).length;
    const notStarted = allEnrollments.filter((e) => e.status === EnrollmentStatus.ENROLLED).length;
    const expired = allEnrollments.filter((e) => e.status === EnrollmentStatus.EXPIRED).length;

    const complianceRate = allEnrollments.length > 0
      ? (completed / allEnrollments.length) * 100
      : 0;

    return {
      totalMandatoryEnrollments: allEnrollments.length,
      completed,
      inProgress,
      notStarted,
      expired,
      complianceRate: Math.round(complianceRate * 100) / 100,
    };
  }

  async getEmployeeLearningDashboard(employeeId: string): Promise<any> {
    const enrollments = await this.enrollmentRepository.find({
      where: { employeeId },
      relations: ['course'],
      order: { enrollmentDate: 'DESC' },
    });

    const mandatory = enrollments.filter((e) => e.isMandatory);
    const optional = enrollments.filter((e) => !e.isMandatory);

    const totalHours = enrollments.reduce((sum, e) => sum + e.hoursCompleted, 0);
    const completedCourses = enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;

    return {
      totalEnrollments: enrollments.length,
      completedCourses,
      inProgressCourses: enrollments.filter((e) => e.status === EnrollmentStatus.IN_PROGRESS).length,
      totalLearningHours: totalHours,
      mandatoryTraining: {
        total: mandatory.length,
        completed: mandatory.filter((e) => e.status === EnrollmentStatus.COMPLETED).length,
        pending: mandatory.filter((e) => e.status !== EnrollmentStatus.COMPLETED).length,
      },
      optionalTraining: {
        total: optional.length,
        completed: optional.filter((e) => e.status === EnrollmentStatus.COMPLETED).length,
      },
      recentEnrollments: enrollments.slice(0, 5),
    };
  }
}
