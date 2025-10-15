import { Injectable, Logger } from '@nestjs/common';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: 'TECHNICAL' | 'BEHAVIORAL' | 'SITUATIONAL' | 'CULTURE_FIT' | 'LEADERSHIP';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  expectedAnswer?: string;
  followUpQuestions?: string[];
  scoringCriteria?: string[];
}

export interface JobAnalysis {
  requiredSkills: string[];
  optionalSkills: string[];
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'EXECUTIVE';
  keyResponsibilities: string[];
  redFlags: string[];
  idealCandidateProfile: string;
}

@Injectable()
export class AIEnhancementsService {
  private readonly logger = new Logger(AIEnhancementsService.name);

  /**
   * Generate interview questions using GPT-4
   */
  async generateInterviewQuestions(params: {
    jobTitle: string;
    jobDescription: string;
    skills: string[];
    experienceLevel: string;
    numberOfQuestions: number;
    questionTypes?: string[];
  }): Promise<InterviewQuestion[]> {
    try {
      // TODO: Integrate with OpenAI GPT-4
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // const prompt = this.buildInterviewQuestionsPrompt(params);
      
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4-turbo-preview',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: 'You are an expert technical recruiter and interviewer. Generate high-quality interview questions.',
      //     },
      //     {
      //       role: 'user',
      //       content: prompt,
      //     },
      //   ],
      //   response_format: { type: 'json_object' },
      //   temperature: 0.7,
      //   max_tokens: 2000,
      // });

      // const questions = JSON.parse(response.choices[0].message.content);
      // return questions;

      // Mock response for now
      return this.getMockQuestions(params);
    } catch (error) {
      this.logger.error(`Failed to generate questions: ${error.message}`);
      return this.getMockQuestions(params);
    }
  }

  /**
   * Analyze job description with AI
   */
  async analyzeJobDescription(jobDescription: string): Promise<JobAnalysis> {
    try {
      // TODO: Use GPT-4 to analyze job description
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4-turbo-preview',
      //   messages: [
      //     {
      //       role: 'system',
      //       content: 'You are an expert HR analyst. Analyze job descriptions and extract key information.',
      //     },
      //     {
      //       role: 'user',
      //       content: `Analyze this job description and return JSON:\n\n${jobDescription}`,
      //     },
      //   ],
      //   response_format: { type: 'json_object' },
      // });

      // return JSON.parse(response.choices[0].message.content);

      // Mock analysis
      return {
        requiredSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        optionalSkills: ['GraphQL', 'AWS', 'Docker'],
        experienceLevel: 'SENIOR',
        keyResponsibilities: [
          'Lead development of new features',
          'Mentor junior developers',
          'Participate in architecture decisions',
        ],
        redFlags: ['Candidate lacks communication skills', 'No team experience'],
        idealCandidateProfile: '5+ years of full-stack development with strong React expertise',
      };
    } catch (error) {
      this.logger.error(`Job analysis failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate candidate screening questions
   */
  async generateScreeningQuestions(params: {
    jobTitle: string;
    mustHaveSkills: string[];
    experienceYears: number;
  }): Promise<Array<{ question: string; expectedKeywords: string[] }>> {
    const questions: Array<{ question: string; expectedKeywords: string[] }> = [];

    // Experience question
    questions.push({
      question: `How many years of experience do you have with ${params.mustHaveSkills.slice(0, 3).join(', ')}?`,
      expectedKeywords: ['years', 'experience', ...params.mustHaveSkills],
    });

    // Technical depth questions
    params.mustHaveSkills.forEach(skill => {
      questions.push({
        question: `Describe a complex problem you solved using ${skill}.`,
        expectedKeywords: [skill, 'problem', 'solution', 'implemented'],
      });
    });

    // Role-specific question
    questions.push({
      question: `Why are you interested in the ${params.jobTitle} position?`,
      expectedKeywords: ['interested', 'excited', 'grow', 'learn'],
    });

    // Availability
    questions.push({
      question: 'What is your notice period and expected start date?',
      expectedKeywords: ['notice', 'weeks', 'start', 'available'],
    });

    return questions;
  }

  /**
   * Evaluate candidate response quality
   */
  async evaluateResponse(params: {
    question: string;
    answer: string;
    expectedKeywords?: string[];
  }): Promise<{
    score: number;
    feedback: string;
    keywordsFound: string[];
    strengths: string[];
    improvements: string[];
  }> {
    try {
      // TODO: Use GPT-4 to evaluate response
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // const prompt = `Evaluate this interview response:
      // Question: ${params.question}
      // Answer: ${params.answer}
      // Expected keywords: ${params.expectedKeywords?.join(', ')}
      
      // Provide score (0-100), feedback, strengths, and areas for improvement in JSON format.`;
      
      // const response = await openai.chat.completions.create({
      //   model: 'gpt-4-turbo-preview',
      //   messages: [
      //     { role: 'system', content: 'You are an expert interviewer evaluating candidate responses.' },
      //     { role: 'user', content: prompt },
      //   ],
      //   response_format: { type: 'json_object' },
      // });

      // return JSON.parse(response.choices[0].message.content);

      // Mock evaluation
      const keywordsFound = params.expectedKeywords?.filter(kw =>
        params.answer.toLowerCase().includes(kw.toLowerCase())
      ) || [];

      return {
        score: Math.min(100, (keywordsFound.length / (params.expectedKeywords?.length || 1)) * 100 + 20),
        feedback: 'Good response with relevant examples',
        keywordsFound,
        strengths: ['Clear communication', 'Relevant experience'],
        improvements: ['Could provide more specific metrics'],
      };
    } catch (error) {
      this.logger.error(`Response evaluation failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate personalized rejection email
   */
  async generateRejectionEmail(params: {
    candidateName: string;
    jobTitle: string;
    reason: string;
    tone: 'FORMAL' | 'FRIENDLY' | 'ENCOURAGING';
  }): Promise<string> {
    // TODO: Use GPT-4 to generate personalized rejection
    // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // const prompt = `Write a ${params.tone.toLowerCase()} rejection email for ${params.candidateName} 
    // who applied for ${params.jobTitle}. Reason: ${params.reason}. 
    // Keep it professional, empathetic, and encouraging.`;
    
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4-turbo-preview',
    //   messages: [
    //     { role: 'system', content: 'You are an empathetic HR professional writing rejection emails.' },
    //     { role: 'user', content: prompt },
    //   ],
    // });

    // return response.choices[0].message.content;

    // Mock email
    return `Dear ${params.candidateName},

Thank you for your interest in the ${params.jobTitle} position at our company.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.

We were impressed with your background and encourage you to apply for future openings that match your skills and experience.

Best regards,
Talent Acquisition Team`;
  }

  /**
   * Suggest interview panelists based on skills
   */
  async suggestInterviewPanel(params: {
    jobSkills: string[];
    availableInterviewers: Array<{
      id: string;
      name: string;
      skills: string[];
      currentLoad: number;
    }>;
    panelSize: number;
  }): Promise<Array<{
    id: string;
    name: string;
    matchScore: number;
    reason: string;
  }>> {
    const scored = params.availableInterviewers.map(interviewer => {
      const matchingSkills = params.jobSkills.filter(skill =>
        interviewer.skills.some(iSkill => iSkill.toLowerCase().includes(skill.toLowerCase()))
      );

      const skillScore = (matchingSkills.length / params.jobSkills.length) * 70;
      const loadScore = (1 - interviewer.currentLoad / 100) * 30; // Prefer less loaded
      const matchScore = skillScore + loadScore;

      return {
        id: interviewer.id,
        name: interviewer.name,
        matchScore: Math.round(matchScore),
        reason: `Matches ${matchingSkills.length} skills: ${matchingSkills.join(', ')}`,
      };
    });

    // Sort by score and return top N
    return scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, params.panelSize);
  }

  /**
   * Auto-tag candidates based on resume/profile
   */
  async autoTagCandidate(params: {
    skills: string[];
    experience: any[];
    education: any[];
  }): Promise<string[]> {
    const tags: string[] = [];

    // Tag by seniority
    const totalYears = params.experience.reduce((sum, exp) => {
      const years = this.calculateYears(exp.startDate, exp.endDate);
      return sum + years;
    }, 0);

    if (totalYears >= 10) tags.push('SENIOR');
    else if (totalYears >= 5) tags.push('MID_LEVEL');
    else if (totalYears >= 2) tags.push('JUNIOR');
    else tags.push('ENTRY_LEVEL');

    // Tag by skills
    if (params.skills.some(s => s.toLowerCase().includes('leader'))) tags.push('LEADERSHIP');
    if (params.skills.includes('JavaScript') || params.skills.includes('Python')) tags.push('DEVELOPER');
    if (params.skills.includes('AWS') || params.skills.includes('Azure')) tags.push('CLOUD');

    // Tag by education
    if (params.education.some(e => e.degree?.includes('PhD'))) tags.push('PHD');
    if (params.education.some(e => e.degree?.includes('Master'))) tags.push('MASTERS');

    return tags;
  }

  // Private helper methods

  private buildInterviewQuestionsPrompt(params: any): string {
    return `Generate ${params.numberOfQuestions} interview questions for a ${params.jobTitle} position.

Job Description: ${params.jobDescription}

Required Skills: ${params.skills.join(', ')}
Experience Level: ${params.experienceLevel}
Question Types: ${params.questionTypes?.join(', ') || 'Mix of technical and behavioral'}

For each question, provide:
- question: The interview question
- category: TECHNICAL, BEHAVIORAL, SITUATIONAL, CULTURE_FIT, or LEADERSHIP
- difficulty: EASY, MEDIUM, or HARD
- expectedAnswer: Key points the candidate should cover
- followUpQuestions: 2-3 follow-up questions
- scoringCriteria: What to evaluate in the answer

Return as JSON array.`;
  }

  private getMockQuestions(params: any): InterviewQuestion[] {
    return [
      {
        id: 'q1',
        question: 'Tell me about a challenging project you worked on recently.',
        category: 'BEHAVIORAL',
        difficulty: 'MEDIUM',
        expectedAnswer: 'Should describe problem, approach, solution, and outcome with metrics',
        followUpQuestions: [
          'What would you do differently?',
          'How did you handle team conflicts?',
        ],
        scoringCriteria: ['Problem-solving ability', 'Communication', 'Results orientation'],
      },
      {
        id: 'q2',
        question: `How would you implement ${params.skills[0]} in a scalable way?`,
        category: 'TECHNICAL',
        difficulty: 'HARD',
        expectedAnswer: 'Should demonstrate deep technical knowledge and architectural thinking',
        followUpQuestions: [
          'How would you handle edge cases?',
          'What about performance optimization?',
        ],
        scoringCriteria: ['Technical depth', 'Scalability thinking', 'Best practices'],
      },
    ];
  }

  private calculateYears(start: Date | string, end: Date | string | null): number {
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    return (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  }
}
