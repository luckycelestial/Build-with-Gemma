import { BusinessEventBus, BusinessEvent } from '../events/BusinessEventBus';

export interface TimelineEntry {
  id: string;
  timestamp: string;
  category: 'Event' | 'Workflow' | 'Tool' | 'Approval';
  title: string;
  summary: string;
  actor: string;
  deepLink?: string;
}

export class TimelineService {
  /**
   * Compiles human-readable business storytelling timeline from events and audit logs.
   */
  static getExecutiveTimeline(): TimelineEntry[] {
    const rawEvents = BusinessEventBus.getEvents();
    const timeline: TimelineEntry[] = [];


    rawEvents.forEach(evt => {
      timeline.push({
        id: evt.id,
        timestamp: evt.timestamp,
        category: 'Event',
        title: evt.type,
        summary: evt.summary,
        actor: evt.source,
        deepLink: evt.deepLink
      });
    });

    return timeline.slice(0, 30);
  }
}

