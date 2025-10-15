import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

export interface ChatSession {
  id: string;
  candidateId?: string;
  candidateName?: string;
  jobPostingId?: string;
  messages: ChatMessage[];
  context: ChatContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatContext {
  companyName: string;
  jobTitle?: string;
  jobDescription?: string;
  companyInfo?: string;
  faqKnowledgeBase?: Array<{ question: string; answer: string }>;
  candidateInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    experience?: number;
  };
}

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private sessions = new Map<string, ChatSession>();

  /**
   * Initialize chat session
   */
  async initializeSession(params: {
    candidateId?: string;
    jobPostingId?: string;
    context: ChatContext;
  }): Promise<ChatSession> {
    const session: ChatSession = {
      id: `session_${Date.now()}`,
      candidateId: params.candidateId,
      jobPostingId: params.jobPostingId,
      messages: [],
      context: params.context,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add system message
    const systemMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'system',
      content: this.generateSystemPrompt(params.context),
      timestamp: new Date(),
    };
    session.messages.push(systemMessage);

    // Add welcome message
    const welcomeMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: this.generateWelcomeMessage(params.context),
      timestamp: new Date(),
    };
    session.messages.push(welcomeMessage);

    this.sessions.set(session.id, session);
    this.logger.log(`Chat session initialized: ${session.id}`);

    return session;
  }

  /**
   * Send message and get response
   */
  async sendMessage(params: {
    sessionId: string;
    message: string;
    metadata?: any;
  }): Promise<ChatMessage> {
    const session = this.sessions.get(params.sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: params.message,
      timestamp: new Date(),
      metadata: params.metadata,
    };
    session.messages.push(userMessage);

    // Check for quick answers first
    const quickAnswer = this.checkQuickAnswers(params.message, session.context);
    if (quickAnswer) {
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: quickAnswer,
        timestamp: new Date(),
      };
      session.messages.push(assistantMessage);
      session.updatedAt = new Date();
      return assistantMessage;
    }

    // Generate AI response
    const response = await this.generateAIResponse(session);
    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    session.messages.push(assistantMessage);
    session.updatedAt = new Date();

    return assistantMessage;
  }

  /**
   * Get chat session
   */
  getSession(sessionId: string): ChatSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * End chat session
   */
  async endSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
    this.logger.log(`Chat session ended: ${sessionId}`);
  }

  /**
   * Get suggested questions
   */
  getSuggestedQuestions(context: ChatContext): string[] {
    const suggestions: string[] = [
      'What is the application process?',
      'What are the working hours?',
      'Is this position remote?',
      'What is the salary range?',
      'What benefits do you offer?',
      'When will I hear back?',
      'What is the interview process?',
      'What technologies does the team use?',
    ];

    if (context.jobTitle) {
      suggestions.unshift(`Tell me more about the ${context.jobTitle} role`);
    }

    return suggestions;
  }

  // Private helper methods

  private generateSystemPrompt(context: ChatContext): string {
    return `You are a friendly and helpful recruitment assistant for ${context.companyName}. 
Your role is to help candidates learn about open positions, answer questions about the application process, 
and provide information about the company. Be professional, concise, and helpful.

${context.jobTitle ? `You are currently helping with the ${context.jobTitle} position.` : ''}
${context.jobDescription ? `Job Description: ${context.jobDescription}` : ''}
${context.companyInfo ? `Company Info: ${context.companyInfo}` : ''}

Guidelines:
- Be friendly and professional
- Keep responses concise (2-3 sentences)
- If you don't know the answer, say so and offer to connect them with the recruitment team
- Never make promises about hiring decisions
- Respect privacy and don't ask for sensitive information
- Encourage qualified candidates to apply`;
  }

  private generateWelcomeMessage(context: ChatContext): string {
    if (context.jobTitle) {
      return `Hi! 👋 I'm here to help you learn more about the ${context.jobTitle} position at ${context.companyName}. Feel free to ask me anything about the role, our company, or the application process!`;
    }
    return `Hi! 👋 Welcome to ${context.companyName}'s recruitment chat. I'm here to help you with any questions about our open positions. How can I assist you today?`;
  }

  private checkQuickAnswers(message: string, context: ChatContext): string | null {
    const lowerMessage = message.toLowerCase();

    // FAQ check
    if (context.faqKnowledgeBase) {
      for (const faq of context.faqKnowledgeBase) {
        if (lowerMessage.includes(faq.question.toLowerCase())) {
          return faq.answer;
        }
      }
    }

    // Common questions
    if (lowerMessage.includes('working hours') || lowerMessage.includes('work hours')) {
      return 'Our standard working hours are 9 AM to 5 PM, Monday through Friday. However, this can vary by role and team. Would you like to know more about a specific position?';
    }

    if (lowerMessage.includes('remote') || lowerMessage.includes('work from home')) {
      return 'We offer flexible work arrangements including remote and hybrid options for many roles. The specific details depend on the position and team requirements.';
    }

    if (lowerMessage.includes('salary') || lowerMessage.includes('compensation')) {
      return 'Salary ranges vary by role, experience level, and location. We provide competitive compensation packages including base salary, bonuses, and benefits. Specific salary discussions happen during the interview process.';
    }

    if (lowerMessage.includes('benefits')) {
      return 'We offer a comprehensive benefits package including health insurance, retirement plans, paid time off, professional development opportunities, and more. The full details will be shared during your interview process.';
    }

    if (lowerMessage.includes('application process') || lowerMessage.includes('how to apply')) {
      return 'The application process typically includes: 1) Submit your application, 2) Phone screening, 3) Technical/behavioral interviews, 4) Final interviews, 5) Offer. The timeline is usually 2-4 weeks from start to finish.';
    }

    if (lowerMessage.includes('when will i hear') || lowerMessage.includes('timeline')) {
      return 'We typically respond to applications within 1-2 weeks. After each interview stage, you can expect to hear back within 3-5 business days. We strive to keep all candidates informed throughout the process.';
    }

    if (lowerMessage.includes('interview process')) {
      return 'Our interview process usually consists of: 1) Initial phone screen (30 min), 2) Technical assessment or case study, 3) Team interviews (2-3 rounds), 4) Final interview with leadership. The entire process takes about 2-4 weeks.';
    }

    return null;
  }

  private async generateAIResponse(session: ChatSession): Promise<string> {
    try {
      // TODO: Integrate with OpenAI GPT-4 or similar
      // const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      // const messages = session.messages
      //   .filter(m => m.role !== 'system' || m.id === session.messages[0].id)
      //   .map(m => ({
      //     role: m.role,
      //     content: m.content,
      //   }));

      // const completion = await openai.chat.completions.create({
      //   model: 'gpt-4',
      //   messages: messages,
      //   max_tokens: 200,
      //   temperature: 0.7,
      // });

      // return completion.choices[0].message.content;

      // Fallback response
      return "Thanks for your question! While I'd love to help, I recommend reaching out to our recruitment team directly for detailed information. You can email us at careers@company.com or apply directly on our careers page.";
    } catch (error) {
      this.logger.error(`AI response generation failed: ${error.message}`);
      return "I apologize, but I'm having trouble processing your request right now. Please try again or contact our recruitment team at careers@company.com.";
    }
  }

  /**
   * Analyze sentiment of candidate messages
   */
  async analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      // TODO: Use sentiment analysis API or ML model
      // const sentiment = await sentimentAnalysis.analyze(message);
      // return sentiment.label;

      // Simple keyword-based sentiment (fallback)
      const positiveKeywords = ['great', 'excellent', 'amazing', 'perfect', 'love', 'excited', 'interested'];
      const negativeKeywords = ['bad', 'terrible', 'awful', 'disappointed', 'frustrated', 'confused'];

      const lowerMessage = message.toLowerCase();
      const hasPositive = positiveKeywords.some(k => lowerMessage.includes(k));
      const hasNegative = negativeKeywords.some(k => lowerMessage.includes(k));

      if (hasPositive && !hasNegative) return 'positive';
      if (hasNegative && !hasPositive) return 'negative';
      return 'neutral';
    } catch (error) {
      return 'neutral';
    }
  }

  /**
   * Extract intent from candidate message
   */
  async extractIntent(message: string): Promise<{
    intent: 'question' | 'application' | 'complaint' | 'feedback' | 'other';
    confidence: number;
  }> {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('?') || lowerMessage.startsWith('what') || 
        lowerMessage.startsWith('how') || lowerMessage.startsWith('when') ||
        lowerMessage.startsWith('where') || lowerMessage.startsWith('why')) {
      return { intent: 'question', confidence: 0.9 };
    }

    if (lowerMessage.includes('apply') || lowerMessage.includes('submit') || 
        lowerMessage.includes('application')) {
      return { intent: 'application', confidence: 0.85 };
    }

    if (lowerMessage.includes('issue') || lowerMessage.includes('problem') || 
        lowerMessage.includes('frustrated')) {
      return { intent: 'complaint', confidence: 0.8 };
    }

    if (lowerMessage.includes('feedback') || lowerMessage.includes('suggestion')) {
      return { intent: 'feedback', confidence: 0.75 };
    }

    return { intent: 'other', confidence: 0.5 };
  }
}
