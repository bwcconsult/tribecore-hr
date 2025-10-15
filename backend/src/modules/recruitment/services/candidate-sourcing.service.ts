import { Injectable, Logger } from '@nestjs/common';

export interface SearchCriteria {
  jobTitle?: string;
  skills: string[];
  requiredSkills?: string[];
  optionalSkills?: string[];
  location?: string;
  yearsExperience?: {
    min?: number;
    max?: number;
  };
  education?: string[];
  companies?: string[];
  excludeCompanies?: string[];
  keywords?: string[];
  excludeKeywords?: string[];
}

export interface SourcedCandidate {
  source: 'LINKEDIN' | 'GITHUB' | 'STACKOVERFLOW' | 'TWITTER' | 'ANGELLIST' | 'CUSTOM';
  profileUrl: string;
  name: string;
  headline?: string;
  currentCompany?: string;
  currentTitle?: string;
  location?: string;
  skills?: string[];
  education?: string[];
  yearsExperience?: number;
  email?: string;
  phone?: string;
  matchScore: number; // 0-100
  matchReasons: string[];
  profileImageUrl?: string;
  summary?: string;
  rawData?: any;
}

export interface BooleanSearchQuery {
  mustHave: string[]; // AND
  shouldHave: string[]; // OR
  mustNotHave: string[]; // NOT
}

@Injectable()
export class CandidateSourcingService {
  private readonly logger = new Logger(CandidateSourcingService.name);

  /**
   * Generate Boolean search string from criteria
   */
  generateBooleanSearch(criteria: SearchCriteria): string {
    const parts: string[] = [];

    // Job title
    if (criteria.jobTitle) {
      parts.push(`"${criteria.jobTitle}"`);
    }

    // Required skills (AND)
    if (criteria.requiredSkills && criteria.requiredSkills.length > 0) {
      const skillsAnd = criteria.requiredSkills.map(s => `"${s}"`).join(' AND ');
      parts.push(`(${skillsAnd})`);
    }

    // Optional skills (OR)
    if (criteria.optionalSkills && criteria.optionalSkills.length > 0) {
      const skillsOr = criteria.optionalSkills.map(s => `"${s}"`).join(' OR ');
      parts.push(`(${skillsOr})`);
    }

    // Location
    if (criteria.location) {
      parts.push(`location:"${criteria.location}"`);
    }

    // Companies
    if (criteria.companies && criteria.companies.length > 0) {
      const companiesOr = criteria.companies.map(c => `company:"${c}"`).join(' OR ');
      parts.push(`(${companiesOr})`);
    }

    // Exclude companies
    if (criteria.excludeCompanies && criteria.excludeCompanies.length > 0) {
      const excludeCompanies = criteria.excludeCompanies.map(c => `NOT company:"${c}"`).join(' ');
      parts.push(excludeCompanies);
    }

    // Keywords
    if (criteria.keywords && criteria.keywords.length > 0) {
      const keywordsOr = criteria.keywords.map(k => `"${k}"`).join(' OR ');
      parts.push(`(${keywordsOr})`);
    }

    // Exclude keywords
    if (criteria.excludeKeywords && criteria.excludeKeywords.length > 0) {
      const excludeKeywords = criteria.excludeKeywords.map(k => `NOT "${k}"`).join(' ');
      parts.push(excludeKeywords);
    }

    return parts.join(' AND ');
  }

  /**
   * Search LinkedIn (via API or scraping)
   */
  async searchLinkedIn(criteria: SearchCriteria): Promise<SourcedCandidate[]> {
    try {
      // TODO: Integrate with LinkedIn Recruiter API or use browser automation
      // Option 1: LinkedIn Recruiter API (requires enterprise account)
      // Option 2: Browser automation with Puppeteer/Playwright
      // Option 3: Third-party services like Lusha, Hunter.io

      // const searchQuery = this.generateBooleanSearch(criteria);
      
      // Using LinkedIn Recruiter API:
      // const response = await fetch('https://api.linkedin.com/v2/talentSolutions/search', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${process.env.LINKEDIN_RECRUITER_TOKEN}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     keywords: searchQuery,
      //     location: criteria.location,
      //     count: 25,
      //   }),
      // });

      // const data = await response.json();
      // return this.parseLinkedInResults(data);

      this.logger.log(`LinkedIn search for: ${criteria.jobTitle}`);
      return [];
    } catch (error) {
      this.logger.error(`LinkedIn search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search GitHub for developers
   */
  async searchGitHub(criteria: SearchCriteria): Promise<SourcedCandidate[]> {
    try {
      // GitHub API is great for sourcing developers
      // const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

      // Build search query
      const query = this.buildGitHubQuery(criteria);

      // const { data } = await octokit.search.users({
      //   q: query,
      //   per_page: 25,
      //   sort: 'repositories',
      //   order: 'desc',
      // });

      // const candidates = await Promise.all(
      //   data.items.map(async (user) => {
      //     const userDetails = await octokit.users.getByUsername({ username: user.login });
      //     return this.parseGitHubUser(userDetails.data, criteria);
      //   })
      // );

      this.logger.log(`GitHub search for: ${query}`);
      return [];
    } catch (error) {
      this.logger.error(`GitHub search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search Stack Overflow for developers
   */
  async searchStackOverflow(criteria: SearchCriteria): Promise<SourcedCandidate[]> {
    try {
      // Stack Overflow API
      // const response = await fetch('https://api.stackexchange.com/2.3/users', {
      //   params: {
      //     site: 'stackoverflow',
      //     inname: criteria.jobTitle,
      //     sort: 'reputation',
      //     order: 'desc',
      //   },
      // });

      this.logger.log(`Stack Overflow search for: ${criteria.jobTitle}`);
      return [];
    } catch (error) {
      this.logger.error(`Stack Overflow search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Search Twitter for professionals
   */
  async searchTwitter(criteria: SearchCriteria): Promise<SourcedCandidate[]> {
    try {
      // Twitter/X API v2
      // const client = new TwitterApi(process.env.TWITTER_BEARER_TOKEN);
      
      // const query = `(${criteria.skills.join(' OR ')}) ${criteria.jobTitle}`;
      // const tweets = await client.v2.search(query, {
      //   'user.fields': 'description,location,url',
      //   max_results: 25,
      // });

      this.logger.log(`Twitter search for: ${criteria.jobTitle}`);
      return [];
    } catch (error) {
      this.logger.error(`Twitter search failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Multi-source search (aggregate from all sources)
   */
  async multiSourceSearch(criteria: SearchCriteria): Promise<SourcedCandidate[]> {
    const results = await Promise.allSettled([
      this.searchLinkedIn(criteria),
      this.searchGitHub(criteria),
      this.searchStackOverflow(criteria),
      this.searchTwitter(criteria),
    ]);

    const candidates: SourcedCandidate[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        candidates.push(...result.value);
      } else {
        const source = ['LinkedIn', 'GitHub', 'Stack Overflow', 'Twitter'][index];
        this.logger.warn(`${source} search failed: ${result.reason}`);
      }
    });

    // Deduplicate by email/profile URL
    const uniqueCandidates = this.deduplicateCandidates(candidates);

    // Sort by match score
    uniqueCandidates.sort((a, b) => b.matchScore - a.matchScore);

    this.logger.log(`Found ${uniqueCandidates.length} unique candidates`);
    return uniqueCandidates;
  }

  /**
   * Find email addresses for candidates
   */
  async findEmail(params: {
    name: string;
    company?: string;
    linkedinUrl?: string;
  }): Promise<string[]> {
    try {
      // TODO: Integrate with email finding services
      // - Hunter.io
      // - Lusha
      // - RocketReach
      // - Clearbit
      
      // const hunter = require('hunter');
      // const result = await hunter.emailFinder({
      //   domain: params.company,
      //   first_name: params.name.split(' ')[0],
      //   last_name: params.name.split(' ')[1],
      // });

      return [];
    } catch (error) {
      this.logger.error(`Email finding failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Enrich candidate profile with additional data
   */
  async enrichProfile(candidate: SourcedCandidate): Promise<SourcedCandidate> {
    try {
      // TODO: Use data enrichment services
      // - Clearbit Enrichment API
      // - FullContact
      // - Pipl

      // Add email if not present
      if (!candidate.email && candidate.name) {
        const emails = await this.findEmail({
          name: candidate.name,
          company: candidate.currentCompany,
          linkedinUrl: candidate.profileUrl,
        });
        if (emails.length > 0) {
          candidate.email = emails[0];
        }
      }

      return candidate;
    } catch (error) {
      this.logger.error(`Profile enrichment failed: ${error.message}`);
      return candidate;
    }
  }

  /**
   * Calculate match score between candidate and criteria
   */
  calculateMatchScore(candidate: SourcedCandidate, criteria: SearchCriteria): number {
    let score = 0;
    const reasons: string[] = [];

    // Skills match (40 points)
    const candidateSkills = candidate.skills || [];
    const requiredSkills = criteria.requiredSkills || criteria.skills;
    const matchedSkills = requiredSkills.filter(req =>
      candidateSkills.some(cs => cs.toLowerCase().includes(req.toLowerCase()))
    );

    if (matchedSkills.length > 0) {
      const skillScore = (matchedSkills.length / requiredSkills.length) * 40;
      score += skillScore;
      reasons.push(`Matched ${matchedSkills.length}/${requiredSkills.length} required skills`);
    }

    // Job title match (20 points)
    if (criteria.jobTitle && candidate.currentTitle) {
      const titleMatch = candidate.currentTitle.toLowerCase().includes(criteria.jobTitle.toLowerCase());
      if (titleMatch) {
        score += 20;
        reasons.push('Job title matches');
      }
    }

    // Experience match (20 points)
    if (criteria.yearsExperience && candidate.yearsExperience) {
      const { min = 0, max = 99 } = criteria.yearsExperience;
      if (candidate.yearsExperience >= min && candidate.yearsExperience <= max) {
        score += 20;
        reasons.push('Experience level matches');
      }
    }

    // Location match (10 points)
    if (criteria.location && candidate.location) {
      const locationMatch = candidate.location.toLowerCase().includes(criteria.location.toLowerCase());
      if (locationMatch) {
        score += 10;
        reasons.push('Location matches');
      }
    }

    // Education match (10 points)
    if (criteria.education && candidate.education) {
      const educationMatch = criteria.education.some(edu =>
        candidate.education?.some(ce => ce.toLowerCase().includes(edu.toLowerCase()))
      );
      if (educationMatch) {
        score += 10;
        reasons.push('Education matches');
      }
    }

    candidate.matchScore = Math.round(score);
    candidate.matchReasons = reasons;

    return Math.round(score);
  }

  // Private helper methods

  private buildGitHubQuery(criteria: SearchCriteria): string {
    const parts: string[] = [];

    if (criteria.location) {
      parts.push(`location:${criteria.location}`);
    }

    if (criteria.skills && criteria.skills.length > 0) {
      parts.push(`language:${criteria.skills.join(' language:')}`);
    }

    if (criteria.yearsExperience?.min) {
      const joinDate = new Date();
      joinDate.setFullYear(joinDate.getFullYear() - criteria.yearsExperience.min);
      parts.push(`created:<${joinDate.toISOString().split('T')[0]}`);
    }

    return parts.join(' ');
  }

  private deduplicateCandidates(candidates: SourcedCandidate[]): SourcedCandidate[] {
    const seen = new Set<string>();
    const unique: SourcedCandidate[] = [];

    candidates.forEach(candidate => {
      const key = candidate.email || candidate.profileUrl || candidate.name;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(candidate);
      }
    });

    return unique;
  }

  private parseLinkedInResults(data: any): SourcedCandidate[] {
    // Parse LinkedIn API response
    return [];
  }

  private parseGitHubUser(user: any, criteria: SearchCriteria): SourcedCandidate {
    // Parse GitHub user data
    return {
      source: 'GITHUB',
      profileUrl: user.html_url,
      name: user.name || user.login,
      headline: user.bio,
      location: user.location,
      email: user.email,
      profileImageUrl: user.avatar_url,
      matchScore: 0,
      matchReasons: [],
    };
  }
}
