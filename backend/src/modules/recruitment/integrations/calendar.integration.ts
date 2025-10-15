import { Injectable, Logger } from '@nestjs/common';

export interface CalendarEvent {
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    email: string;
    name?: string;
    optional?: boolean;
  }>;
  meetingLink?: string;
  reminders?: Array<{
    method: 'email' | 'popup';
    minutes: number;
  }>;
  conferenceData?: {
    createRequest: {
      requestId: string;
      conferenceSolutionKey: {
        type: 'hangoutsMeet' | 'eventHangout';
      };
    };
  };
}

export interface UpdateCalendarEventParams {
  eventId: string;
  summary?: string;
  description?: string;
  location?: string;
  startTime?: Date;
  endTime?: Date;
  attendees?: Array<{
    email: string;
    name?: string;
  }>;
}

@Injectable()
export class CalendarIntegrationService {
  private readonly logger = new Logger(CalendarIntegrationService.name);

  /**
   * Create calendar event for interview
   */
  async createInterviewEvent(params: {
    interviewId: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    interviewType: string;
    startTime: Date;
    endTime: Date;
    location?: string;
    meetingLink?: string;
    panelEmails: string[];
    organizerEmail: string;
  }): Promise<string | null> {
    try {
      const event: CalendarEvent = {
        summary: `Interview: ${params.candidateName} - ${params.jobTitle}`,
        description: this.generateInterviewDescription(params),
        location: params.location,
        startTime: params.startTime,
        endTime: params.endTime,
        attendees: [
          { email: params.candidateEmail, name: params.candidateName },
          ...params.panelEmails.map(email => ({ email })),
        ],
        meetingLink: params.meetingLink,
        reminders: [
          { method: 'email', minutes: 1440 }, // 24 hours before
          { method: 'popup', minutes: 60 },   // 1 hour before
        ],
      };

      // For Google Meet integration
      if (!params.meetingLink) {
        event.conferenceData = {
          createRequest: {
            requestId: `interview-${params.interviewId}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      }

      const eventId = await this.createEvent(event, params.organizerEmail);
      this.logger.log(`Calendar event created: ${eventId}`);
      return eventId;
    } catch (error) {
      this.logger.error(`Failed to create calendar event: ${error.message}`);
      return null;
    }
  }

  /**
   * Update existing calendar event
   */
  async updateInterviewEvent(params: UpdateCalendarEventParams): Promise<boolean> {
    try {
      await this.updateEvent(params);
      this.logger.log(`Calendar event updated: ${params.eventId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to update calendar event: ${error.message}`);
      return false;
    }
  }

  /**
   * Cancel calendar event
   */
  async cancelInterviewEvent(params: {
    eventId: string;
    organizerEmail: string;
    cancellationReason?: string;
  }): Promise<boolean> {
    try {
      await this.deleteEvent(params.eventId, params.organizerEmail);
      this.logger.log(`Calendar event cancelled: ${params.eventId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to cancel calendar event: ${error.message}`);
      return false;
    }
  }

  /**
   * Check availability for given time slot
   */
  async checkAvailability(params: {
    emails: string[];
    startTime: Date;
    endTime: Date;
  }): Promise<Map<string, boolean>> {
    try {
      const availability = new Map<string, boolean>();

      // TODO: Integrate with Google Calendar Free/Busy API
      // const response = await calendar.freebusy.query({
      //   timeMin: params.startTime.toISOString(),
      //   timeMax: params.endTime.toISOString(),
      //   items: params.emails.map(email => ({ id: email })),
      // });

      // For now, assume everyone is available
      params.emails.forEach(email => availability.set(email, true));

      return availability;
    } catch (error) {
      this.logger.error(`Failed to check availability: ${error.message}`);
      return new Map();
    }
  }

  /**
   * Get user's busy time slots
   */
  async getBusySlots(params: {
    email: string;
    startDate: Date;
    endDate: Date;
  }): Promise<Array<{ start: Date; end: Date }>> {
    try {
      // TODO: Integrate with Google Calendar API
      // const response = await calendar.events.list({
      //   calendarId: params.email,
      //   timeMin: params.startDate.toISOString(),
      //   timeMax: params.endDate.toISOString(),
      //   singleEvents: true,
      //   orderBy: 'startTime',
      // });

      // return response.data.items.map(event => ({
      //   start: new Date(event.start.dateTime),
      //   end: new Date(event.end.dateTime),
      // }));

      return [];
    } catch (error) {
      this.logger.error(`Failed to get busy slots: ${error.message}`);
      return [];
    }
  }

  // Private helper methods

  private async createEvent(event: CalendarEvent, organizerEmail: string): Promise<string> {
    // TODO: Integrate with Google Calendar API
    // const { google } = require('googleapis');
    // const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    
    // const response = await calendar.events.insert({
    //   calendarId: organizerEmail,
    //   conferenceDataVersion: event.conferenceData ? 1 : 0,
    //   requestBody: {
    //     summary: event.summary,
    //     description: event.description,
    //     location: event.location,
    //     start: {
    //       dateTime: event.startTime.toISOString(),
    //       timeZone: 'UTC',
    //     },
    //     end: {
    //       dateTime: event.endTime.toISOString(),
    //       timeZone: 'UTC',
    //     },
    //     attendees: event.attendees.map(a => ({
    //       email: a.email,
    //       displayName: a.name,
    //       optional: a.optional || false,
    //     })),
    //     reminders: {
    //       useDefault: false,
    //       overrides: event.reminders,
    //     },
    //     conferenceData: event.conferenceData,
    //   },
    //   sendUpdates: 'all', // Send email invites to all attendees
    // });

    // return response.data.id;

    // Mock response
    return `event_${Date.now()}`;
  }

  private async updateEvent(params: UpdateCalendarEventParams): Promise<void> {
    // TODO: Integrate with Google Calendar API
    // const { google } = require('googleapis');
    // const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    
    // const updateData: any = {};
    // if (params.summary) updateData.summary = params.summary;
    // if (params.description) updateData.description = params.description;
    // if (params.location) updateData.location = params.location;
    // if (params.startTime) {
    //   updateData.start = {
    //     dateTime: params.startTime.toISOString(),
    //     timeZone: 'UTC',
    //   };
    // }
    // if (params.endTime) {
    //   updateData.end = {
    //     dateTime: params.endTime.toISOString(),
    //     timeZone: 'UTC',
    //   };
    // }
    // if (params.attendees) {
    //   updateData.attendees = params.attendees.map(a => ({
    //     email: a.email,
    //     displayName: a.name,
    //   }));
    // }

    // await calendar.events.patch({
    //   calendarId: 'primary',
    //   eventId: params.eventId,
    //   requestBody: updateData,
    //   sendUpdates: 'all',
    // });

    this.logger.debug(`Event ${params.eventId} would be updated`);
  }

  private async deleteEvent(eventId: string, organizerEmail: string): Promise<void> {
    // TODO: Integrate with Google Calendar API
    // const { google } = require('googleapis');
    // const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    
    // await calendar.events.delete({
    //   calendarId: organizerEmail,
    //   eventId: eventId,
    //   sendUpdates: 'all', // Notify all attendees of cancellation
    // });

    this.logger.debug(`Event ${eventId} would be deleted`);
  }

  private generateInterviewDescription(params: any): string {
    return `
Interview for ${params.jobTitle}

Candidate: ${params.candidateName}
Type: ${params.interviewType}

${params.meetingLink ? `Video Meeting: ${params.meetingLink}` : ''}
${params.location ? `Location: ${params.location}` : ''}

Please ensure you have reviewed the candidate's resume and job description before the interview.
    `.trim();
  }
}
