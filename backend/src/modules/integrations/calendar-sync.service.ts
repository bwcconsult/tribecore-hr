import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface CalendarEvent {
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
  location?: string;
  attendees?: string[];
}

/**
 * CalendarSyncService
 * Syncs absence events to Outlook and Google Calendar
 */
@Injectable()
export class CalendarSyncService {
  private readonly logger = new Logger(CalendarSyncService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Sync to Outlook Calendar (Microsoft Graph API)
   */
  async syncToOutlook(
    userEmail: string,
    accessToken: string,
    event: CalendarEvent,
  ): Promise<string | null> {
    try {
      const graphApiUrl = 'https://graph.microsoft.com/v1.0/me/events';

      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: event.description || '',
        },
        start: {
          dateTime: event.startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: event.endDate.toISOString(),
          timeZone: 'UTC',
        },
        location: {
          displayName: event.location || '',
        },
        isAllDay: event.allDay,
        attendees: event.attendees?.map((email) => ({
          emailAddress: {
            address: email,
          },
          type: 'required',
        })),
      };

      const response = await axios.post(graphApiUrl, outlookEvent, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Synced event to Outlook: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error(`Failed to sync to Outlook: ${error.message}`);
      return null;
    }
  }

  /**
   * Sync to Google Calendar
   */
  async syncToGoogle(
    accessToken: string,
    event: CalendarEvent,
  ): Promise<string | null> {
    try {
      const calendarApiUrl =
        'https://www.googleapis.com/calendar/v3/calendars/primary/events';

      const googleEvent = {
        summary: event.title,
        description: event.description || '',
        location: event.location || '',
        start: event.allDay
          ? { date: event.startDate.toISOString().split('T')[0] }
          : { dateTime: event.startDate.toISOString(), timeZone: 'UTC' },
        end: event.allDay
          ? { date: event.endDate.toISOString().split('T')[0] }
          : { dateTime: event.endDate.toISOString(), timeZone: 'UTC' },
        attendees: event.attendees?.map((email) => ({ email })),
      };

      const response = await axios.post(calendarApiUrl, googleEvent, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      this.logger.log(`Synced event to Google Calendar: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      this.logger.error(`Failed to sync to Google Calendar: ${error.message}`);
      return null;
    }
  }

  /**
   * Delete event from Outlook
   */
  async deleteFromOutlook(accessToken: string, eventId: string): Promise<boolean> {
    try {
      await axios.delete(`https://graph.microsoft.com/v1.0/me/events/${eventId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      this.logger.log(`Deleted event from Outlook: ${eventId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete from Outlook: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteFromGoogle(accessToken: string, eventId: string): Promise<boolean> {
    try {
      await axios.delete(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      this.logger.log(`Deleted event from Google Calendar: ${eventId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete from Google Calendar: ${error.message}`);
      return false;
    }
  }

  /**
   * Generate ICS file for calendar import
   */
  generateICSFile(event: CalendarEvent): string {
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//TribeCore HR//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@tribecore.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(event.startDate)}`,
      `DTEND:${formatDate(event.endDate)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      'END:VEVENT',
      'END:VCALENDAR',
    ];

    return ics.filter((line) => line).join('\r\n');
  }

  /**
   * Sync absence request to calendars
   */
  async syncAbsenceToCalendars(
    userEmail: string,
    accessTokens: { outlook?: string; google?: string },
    absenceType: string,
    startDate: Date,
    endDate: Date,
  ): Promise<{ outlookEventId?: string; googleEventId?: string }> {
    const event: CalendarEvent = {
      title: `${absenceType} - Out of Office`,
      description: `Approved ${absenceType.toLowerCase()} absence`,
      startDate,
      endDate,
      allDay: true,
    };

    const result: { outlookEventId?: string; googleEventId?: string } = {};

    if (accessTokens.outlook) {
      result.outlookEventId =
        (await this.syncToOutlook(userEmail, accessTokens.outlook, event)) || undefined;
    }

    if (accessTokens.google) {
      result.googleEventId =
        (await this.syncToGoogle(accessTokens.google, event)) || undefined;
    }

    return result;
  }
}
