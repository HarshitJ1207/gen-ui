import type { AssistantMessage } from '../chatTypes';
import { mockFetchUpcomingAppointments } from '../mockApi/appointments';

export async function createUpcomingAppointmentsMessage(): Promise<AssistantMessage> {
    const upcoming = await mockFetchUpcomingAppointments();

    return {
        id: `a-${Date.now()}`,
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'Here are your upcoming appointments.',
            },
            {
                type: 'widget',
                widgetId: 'table',
                props: {
                    title: 'Upcoming appointments',
                    columns: [
                        { id: 'id', label: 'ID' },
                        { id: 'date', label: 'Date' },
                        { id: 'time', label: 'Time' },
                        { id: 'agent', label: 'Agent' },
                        { id: 'status', label: 'Status' },
                    ],
                    rows: upcoming.map((item) => ({
                        id: item.id,
                        date: item.date,
                        time: item.time,
                        agent: item.agent,
                        status: item.status,
                    })),
                },
                flowId: 'show_upcoming_appointments',
                stepId: 'table',
            },
        ],
    };
}
