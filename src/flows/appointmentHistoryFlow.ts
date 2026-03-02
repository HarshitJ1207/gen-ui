import type { AssistantMessage } from '../chatTypes';
import { mockFetchAppointmentHistory } from '../mockApi/appointments';

export async function createAppointmentHistoryMessage(): Promise<AssistantMessage> {
    const history = await mockFetchAppointmentHistory();

    return {
        id: `a-${Date.now()}`,
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: 'Here is your appointment history.',
            },
            {
                type: 'widget',
                widgetId: 'table',
                props: {
                    title: 'Appointment history',
                    columns: [
                        { id: 'id', label: 'ID' },
                        { id: 'date', label: 'Date' },
                        { id: 'time', label: 'Time' },
                        { id: 'agent', label: 'Agent' },
                        { id: 'status', label: 'Status' },
                    ],
                    rows: history.map((item) => ({
                        id: item.id,
                        date: item.date,
                        time: item.time,
                        agent: item.agent,
                        status: item.status,
                    })),
                },
                flowId: 'show_appointment_history',
                stepId: 'table',
            },
        ],
    };
}
