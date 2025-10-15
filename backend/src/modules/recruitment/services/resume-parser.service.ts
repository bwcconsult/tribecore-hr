import { Injectable, Logger } from '@nestjs/common';

export interface ParsedResume {
  contactInfo: {
    name: string;
    email?: string;
    phone?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    location?: string;
  };
  summary?: string;
  skills: string[];
  experience: Array<{
    company: string;
    title: string;
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description: string;
    highlights: string[];
    technologies?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: Date;
    endDate?: Date;
    gpa?: number;
    honors?: string[];
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate?: Date;
    expiryDate?: Date;
    credentialId?: string;
  }>;
  languages: Array<{
    language: string;
    proficiency: 'NATIVE' | 'FLUENT' | 'PROFESSIONAL' | 'LIMITED' | 'BASIC';
  }>;
  projects: Array<{
    name: string;
    description: string;
    url?: string;
    technologies?: string[];
    startDate?: Date;
    endDate?: Date;
  }>;
  yearsExperience: number;
  confidence: number; // 0-100
  rawText?: string;
}

@Injectable()
export class ResumeParserService {
  private readonly logger = new Logger(ResumeParserService.name);

  /**
   * Parse resume from file buffer
   */
  async parseResume(params: {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
  }): Promise<ParsedResume> {
    try {
      // Extract text from file
      const text = await this.extractTextFromFile(params);

      // Parse sections
      const contactInfo = this.extractContactInfo(text);
      const summary = this.extractSummary(text);
      const skills = this.extractSkills(text);
      const experience = this.extractExperience(text);
      const education = this.extractEducation(text);
      const certifications = this.extractCertifications(text);
      const languages = this.extractLanguages(text);
      const projects = this.extractProjects(text);
      const yearsExperience = this.calculateYearsExperience(experience);

      // Calculate confidence based on extracted data
      const confidence = this.calculateConfidence({
        contactInfo,
        skills,
        experience,
        education,
      });

      this.logger.log(`Resume parsed with ${confidence}% confidence`);

      return {
        contactInfo,
        summary,
        skills,
        experience,
        education,
        certifications,
        languages,
        projects,
        yearsExperience,
        confidence,
        rawText: text,
      };
    } catch (error) {
      this.logger.error(`Failed to parse resume: ${error.message}`);
      throw error;
    }
  }

  /**
   * Parse resume using AI service (OpenAI, Azure, etc.)
   */
  async parseResumeWithAI(params: {
    fileBuffer: Buffer;
    fileName: string;
  }): Promise<ParsedResume> {
    try {
      const text = await this.extractTextFromFile(params);

      // TODO: Integrate with OpenAI GPT-4 or Azure Form Recognizer
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: 'You are a resume parser. Extract structured data from resumes in JSON format.',
      //     },
      //     {
      //       role: 'user',
      //       content: `Parse this resume and return JSON:\n\n${text}`,
      //     },
      //   ],
      //   response_format: { type: 'json_object' },
      // });

      // const parsed = JSON.parse(response.choices[0].message.content);

      // For now, fallback to rule-based parsing
      return await this.parseResume(params);
    } catch (error) {
      this.logger.error(`AI parsing failed, falling back to rules: ${error.message}`);
      return await this.parseResume(params);
    }
  }

  // Private helper methods

  private async extractTextFromFile(params: {
    fileBuffer: Buffer;
    fileName?: string;
    mimeType?: string;
  }): Promise<string> {
    // TODO: Implement file type detection and text extraction
    // PDF: use pdf-parse or pdfjs-dist
    // DOCX: use mammoth or docx-parser
    // TXT: direct buffer to string
    // Images (OCR): use Tesseract.js or Google Vision API

    // const mimeType = params.mimeType || this.detectMimeType(params.fileName);

    // switch (mimeType) {
    //   case 'application/pdf':
    //     return await this.extractFromPDF(params.fileBuffer);
    //   case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    //     return await this.extractFromDOCX(params.fileBuffer);
    //   case 'text/plain':
    //     return params.fileBuffer.toString('utf-8');
    //   default:
    //     throw new Error(`Unsupported file type: ${mimeType}`);
    // }

    // Mock extraction
    return params.fileBuffer.toString('utf-8');
  }

  private extractContactInfo(text: string): ParsedResume['contactInfo'] {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/([\w-]+)/i;
    const githubRegex = /github\.com\/([\w-]+)/i;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);
    const linkedinMatch = text.match(linkedinRegex);
    const githubMatch = text.match(githubRegex);

    // Extract name (usually first line or near top)
    const lines = text.split('\n').filter(l => l.trim());
    const name = lines[0]?.trim() || 'Unknown';

    return {
      name,
      email: emailMatch?.[0],
      phone: phoneMatch?.[0],
      linkedinUrl: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : undefined,
      githubUrl: githubMatch ? `https://github.com/${githubMatch[1]}` : undefined,
    };
  }

  private extractSummary(text: string): string | undefined {
    const summaryRegex = /(summary|profile|objective)[:\s]+(.*?)(?=\n\n|experience|education)/is;
    const match = text.match(summaryRegex);
    return match?.[2]?.trim();
  }

  private extractSkills(text: string): string[] {
    const skills = new Set<string>();

    // Common tech skills
    const techSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'PHP', 'Go', 'Rust',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'NestJS', 'Django', 'Flask', 'Spring',
      'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform',
      'Git', 'CI/CD', 'Jenkins', 'GitLab', 'GitHub Actions',
      'REST', 'GraphQL', 'gRPC', 'WebSockets',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'Bootstrap',
      'Agile', 'Scrum', 'Kanban', 'JIRA',
      'Machine Learning', 'AI', 'Data Science', 'TensorFlow', 'PyTorch',
    ];

    const lowerText = text.toLowerCase();
    techSkills.forEach(skill => {
      if (lowerText.includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    });

    // Extract from skills section
    const skillsSection = text.match(/skills[:\s]+(.*?)(?=\n\n|experience|education)/is);
    if (skillsSection) {
      const extractedSkills = skillsSection[1]
        .split(/[,;•·\n]/)
        .map(s => s.trim())
        .filter(s => s.length > 2 && s.length < 50);
      extractedSkills.forEach(skill => skills.add(skill));
    }

    return Array.from(skills);
  }

  private extractExperience(text: string): ParsedResume['experience'] {
    const experience: ParsedResume['experience'] = [];

    // TODO: Implement sophisticated experience extraction
    // Look for patterns like:
    // - Company Name
    // - Job Title
    // - Dates (Jan 2020 - Present)
    // - Bullet points with responsibilities

    // For now, return empty array (would require complex NLP)
    return experience;
  }

  private extractEducation(text: string): ParsedResume['education'] {
    const education: ParsedResume['education'] = [];

    // Common degree keywords
    const degrees = ['Bachelor', 'Master', 'PhD', 'MBA', 'B.S.', 'M.S.', 'B.A.', 'M.A.'];

    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const hasDegree = degrees.some(d => line.includes(d));

      if (hasDegree) {
        // Try to extract degree info
        // This is simplified - production would need better parsing
        education.push({
          institution: line.trim(),
          degree: 'Bachelor',
          field: 'Computer Science',
        });
      }
    }

    return education;
  }

  private extractCertifications(text: string): ParsedResume['certifications'] {
    const certifications: ParsedResume['certifications'] = [];

    // Common certification keywords
    const certKeywords = ['certified', 'certification', 'certificate', 'AWS', 'Azure', 'GCP', 'PMP'];

    const lines = text.split('\n');
    for (const line of lines) {
      const hasCert = certKeywords.some(k => line.toLowerCase().includes(k.toLowerCase()));
      if (hasCert) {
        certifications.push({
          name: line.trim(),
          issuer: 'Unknown',
        });
      }
    }

    return certifications;
  }

  private extractLanguages(text: string): ParsedResume['languages'] {
    const languages: ParsedResume['languages'] = [];

    const languageKeywords = [
      'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
      'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Italian', 'Korean',
    ];

    const lowerText = text.toLowerCase();
    languageKeywords.forEach(lang => {
      if (lowerText.includes(lang.toLowerCase())) {
        languages.push({
          language: lang,
          proficiency: 'PROFESSIONAL', // Default
        });
      }
    });

    return languages;
  }

  private extractProjects(text: string): ParsedResume['projects'] {
    const projects: ParsedResume['projects'] = [];

    // Look for projects section
    const projectSection = text.match(/projects[:\s]+(.*?)(?=\n\n|experience|education|$)/is);
    if (projectSection) {
      // Extract project details
      // This would require more sophisticated parsing
    }

    return projects;
  }

  private calculateYearsExperience(experience: ParsedResume['experience']): number {
    if (experience.length === 0) return 0;

    let totalMonths = 0;
    experience.forEach(exp => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    });

    return Math.round(totalMonths / 12);
  }

  private calculateConfidence(data: {
    contactInfo: ParsedResume['contactInfo'];
    skills: string[];
    experience: ParsedResume['experience'];
    education: ParsedResume['education'];
  }): number {
    let score = 0;

    // Contact info (30 points)
    if (data.contactInfo.name !== 'Unknown') score += 10;
    if (data.contactInfo.email) score += 10;
    if (data.contactInfo.phone) score += 5;
    if (data.contactInfo.linkedinUrl) score += 5;

    // Skills (30 points)
    if (data.skills.length > 0) score += 15;
    if (data.skills.length > 5) score += 10;
    if (data.skills.length > 10) score += 5;

    // Experience (25 points)
    if (data.experience.length > 0) score += 15;
    if (data.experience.length > 2) score += 10;

    // Education (15 points)
    if (data.education.length > 0) score += 15;

    return Math.min(100, score);
  }
}
