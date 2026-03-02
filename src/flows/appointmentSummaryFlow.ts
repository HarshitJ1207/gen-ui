import type { AssistantMessage } from '../chatTypes';
import { mockFetchAppointmentHistory } from '../mockApi/appointments';

export async function createAppointmentSummaryMessage(): Promise<AssistantMessage> {
    const history = await mockFetchAppointmentHistory();

    const total = history.length;
    const completed = history.filter((h) => h.status === 'Completed').length;
    const upcoming = history.filter((h) => h.status === 'Upcoming').length;
    const cancelled = history.filter((h) => h.status === 'Cancelled').length;

    return {
        id: `a-${Date.now()}`,
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'Here is a quick summary of your appointments.',
            },
            {
                type: 'widget',
                widgetId: 'cards',
                props: {
                    title: 'Appointment summary',
                    cards: [
                        { id: 'total', title: 'Total', value: String(total) },
                        { id: 'completed', title: 'Completed', value: String(completed) },
                        { id: 'upcoming', title: 'Upcoming', value: String(upcoming) },
                        { id: 'cancelled', title: 'Cancelled', value: String(cancelled) },
                    ],
                },
                flowId: 'show_appointment_summary',
                stepId: 'cards',
            },
        ],
    };
}
