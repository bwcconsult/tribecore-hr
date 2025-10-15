import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../entities/application.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobPosting } from '../entities/job-posting.entity';

export interface ScoringResult {
  overallScore: number; // 0-100
  breakdown: {
    skillsMatch: number;
    experienceMatch: number;
    educationMatch: number;
    locationMatch: number;
    cultureMatch: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  flags: Array<{
    type: 'RED' | 'AMBER' | 'GREEN';
    reason: string;
    confidence: number;
  }>;
  recommendations: string[];
}

@Injectable()
export class AIScoringService {
  private readonly logger = new Logger(AIScoringService.name);

  constructor(
    @InjectRepository(Application)
    private readonly applicationRepo: Repository<Application>,
    @InjectRepository(Candidate)
    private readonly candidateRepo: Repository<Candidate>,
    @InjectRepository(JobPosting)
    private readonly jobPostingRepo: Repository<JobPosting>,
  ) {}

  /**
   * Score candidate against job requirements
   */
  async scoreApplication(applicationId: string): Promise<ScoringResult> {
    const application = await this.applicationRepo.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'jobPosting'],
    });

    if (!application || !application.candidate || !application.jobPosting) {
      throw new Error('Application, candidate, or job posting not found');
    }

    const candidate = application.candidate;
    const jobPosting = application.jobPosting;

    // Extract job requirements
    const requiredSkills = this.extractSkillsFromJob(jobPosting);
    const candidateSkills = candidate.skills || [];

    // Calculate scores
    const skillsMatch = this.calculateSkillsMatch(candidateSkills, requiredSkills);
    const experienceMatch = this.calculateExperienceMatch(
      candidate.yearsExperience || 0,
      jobPosting.metadata?.minExperience || 0,
      jobPosting.metadata?.maxExperience || 99
    );
    const educationMatch = this.calculateEducationMatch(candidate, jobPosting);
    const locationMatch = this.calculateLocationMatch(candidate, jobPosting);
    const cultureMatch = this.calculateCultureMatch(candidate, jobPosting);

    // Weighted overall score
    const weights = {
      skills: 0.35,
      experience: 0.25,
      education: 0.15,
      location: 0.10,
      culture: 0.15,
    };

    const overallScore = Math.round(
      skillsMatch * weights.skills +
      experienceMatch * weights.experience +
      educationMatch * weights.education +
      locationMatch * weights.location +
      cultureMatch * weights.culture
    );

    // Identify matched and missing skills
    const matchedSkills = candidateSkills.filter(skill =>
      requiredSkills.some(req => this.fuzzyMatch(skill, req))
    );
    const missingSkills = requiredSkills.filter(req =>
      !candidateSkills.some(skill => this.fuzzyMatch(skill, req))
    );

    // Generate flags
    const flags = this.generateFlags(candidate, jobPosting, {
      skillsMatch,
      experienceMatch,
      educationMatch,
      locationMatch,
      cultureMatch,
      matchedSkills,
      missingSkills,
    });

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      skillsMatch,
      experienceMatch,
      educationMatch,
      locationMatch,
      cultureMatch,
      matchedSkills,
      missingSkills,
    });

    const result: ScoringResult = {
      overallScore,
      breakdown: {
        skillsMatch,
        experienceMatch,
        educationMatch,
        locationMatch,
        cultureMatch,
      },
      matchedSkills,
      missingSkills,
      flags,
      recommendations,
    };

    // Store score in application
    application.scoreTotal = overallScore;
    await this.applicationRepo.save(application);

    this.logger.log(`Scored application ${applicationId}: ${overallScore}/100`);

    return result;
  }

  /**
   * Batch score applications
   */
  async batchScoreApplications(applicationIds: string[]): Promise<Map<string, ScoringResult>> {
    const results = new Map<string, ScoringResult>();

    for (const id of applicationIds) {
      try {
        const result = await this.scoreApplication(id);
        results.set(id, result);
      } catch (error) {
        this.logger.error(`Failed to score application ${id}:`, error);
      }
    }

    return results;
  }

  /**
   * Extract skills from job posting
   */
  private extractSkillsFromJob(jobPosting: JobPosting): string[] {
    const skills: string[] = [];

    // From metadata
    if (jobPosting.metadata?.requiredSkills) {
      skills.push(...jobPosting.metadata.requiredSkills);
    }
    if (jobPosting.metadata?.preferredSkills) {
      skills.push(...jobPosting.metadata.preferredSkills);
    }

    // Extract from description using NLP (simplified)
    if (jobPosting.description) {
      const extracted = this.extractSkillsFromText(jobPosting.description);
      skills.push(...extracted);
    }

    return [...new Set(skills)]; // Deduplicate
  }

  /**
   * Extract skills from text using keywords
   */
  private extractSkillsFromText(text: string): string[] {
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
      'Node.js', 'Express', 'NestJS', 'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Azure',
      'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum', 'REST API', 'GraphQL',
      'HTML', 'CSS', 'Leadership', 'Communication', 'Project Management', 'Teamwork',
    ];

    const found: string[] = [];
    const lowerText = text.toLowerCase();

    for (const skill of skillKeywords) {
      if (lowerText.includes(skill.toLowerCase())) {
        found.push(skill);
      }
    }

    return found;
  }

  /**
   * Calculate skills match percentage
   */
  private calculateSkillsMatch(candidateSkills: string[], requiredSkills: string[]): number {
    if (requiredSkills.length === 0) return 100;

    let matchCount = 0;
    for (const required of requiredSkills) {
      if (candidateSkills.some(skill => this.fuzzyMatch(skill, required))) {
        matchCount++;
      }
    }

    return Math.round((matchCount / requiredSkills.length) * 100);
  }

  /**
   * Fuzzy match two strings
   */
  private fuzzyMatch(str1: string, str2: string): boolean {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    // Exact match
    if (s1 === s2) return true;

    // Contains
    if (s1.includes(s2) || s2.includes(s1)) return true;

    // Levenshtein distance < 3
    return this.levenshtein(s1, s2) < 3;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshtein(s1: string, s2: string): number {
    const len1 = s1.length;
    const len2 = s2.length;
    const matrix: number[][] = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calculate experience match
   */
  private calculateExperienceMatch(candidateYears: number, minYears: number, maxYears: number): number {
    if (candidateYears < minYears) {
      // Penalty for under-qualified
      const deficit = minYears - candidateYears;
      return Math.max(0, 100 - (deficit * 20));
    } else if (candidateYears > maxYears) {
      // Penalty for over-qualified
      const excess = candidateYears - maxYears;
      return Math.max(50, 100 - (excess * 10));
    } else {
      return 100;
    }
  }

  /**
   * Calculate education match
   */
  private calculateEducationMatch(candidate: Candidate, jobPosting: JobPosting): number {
    // Simplified - check if candidate has required education level
    const requiredLevel = jobPosting.metadata?.requiredEducation;
    if (!requiredLevel) return 100;

    const candidateEducation = candidate.metadata?.educationHistory;
    if (!candidateEducation || candidateEducation.length === 0) return 50;

    // For now, return 80 if has education, 100 if matches exactly
    return 80;
  }

  /**
   * Calculate location match
   */
  private calculateLocationMatch(candidate: Candidate, jobPosting: JobPosting): number {
    const jobLocation = jobPosting.location;
    const candidateLocation = candidate.currentLocation;

    if (!jobLocation) return 100; // Remote or location not specified

    if (jobPosting.metadata?.remote === true) return 100;

    if (!candidateLocation) return 50;

    // Simple string match (improve with geo-coding)
    if (candidateLocation.toLowerCase().includes(jobLocation.toLowerCase())) return 100;
    if (candidate.willingToRelocate) return 80;

    return 30; // Location mismatch
  }

  /**
   * Calculate culture match (simplified)
   */
  private calculateCultureMatch(candidate: Candidate, jobPosting: JobPosting): number {
    // This would use ML model in production
    // For now, return neutral score
    return 75;
  }

  /**
   * Generate flags
   */
  private generateFlags(candidate: Candidate, jobPosting: JobPosting, scores: any): Array<any> {
    const flags: Array<any> = [];

    // Green flags
    if (scores.overallScore >= 85) {
      flags.push({ type: 'GREEN', reason: 'Excellent match', confidence: 0.9 });
    }
    if (scores.matchedSkills.length >= 5) {
      flags.push({ type: 'GREEN', reason: 'Strong technical skills', confidence: 0.85 });
    }

    // Amber flags
    if (scores.missingSkills.length > 3) {
      flags.push({ type: 'AMBER', reason: `Missing ${scores.missingSkills.length} required skills`, confidence: 0.8 });
    }
    if (scores.experienceMatch < 70) {
      flags.push({ type: 'AMBER', reason: 'Experience level concern', confidence: 0.75 });
    }

    // Red flags
    if (scores.skillsMatch < 40) {
      flags.push({ type: 'RED', reason: 'Significant skills gap', confidence: 0.9 });
    }
    if (scores.locationMatch < 30 && !candidate.willingToRelocate) {
      flags.push({ type: 'RED', reason: 'Location mismatch', confidence: 0.85 });
    }

    return flags;
  }

  /**
   * Generate recommendations
   */
  private generateRecommendations(scores: any): string[] {
    const recommendations: string[] = [];

    if (scores.skillsMatch >= 80) {
      recommendations.push('Strong technical fit - proceed to interview');
    } else if (scores.skillsMatch >= 60) {
      recommendations.push('Moderate skills match - consider for phone screen');
    } else {
      recommendations.push('Skills gap detected - assess trainability');
    }

    if (scores.missingSkills.length > 0) {
      recommendations.push(`Evaluate: ${scores.missingSkills.slice(0, 3).join(', ')}`);
    }

    if (scores.experienceMatch < 70) {
      recommendations.push('Discuss career trajectory and learning agility');
    }

    if (scores.locationMatch < 50) {
      recommendations.push('Confirm relocation willingness and timeline');
    }

    return recommendations;
  }
}
