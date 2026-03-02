import type { AssistantMessage } from '../chatTypes';

export function createRescheduleAppointmentMessage(): AssistantMessage {
    return {
        id: `a-${Date.now()}`,
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: "Okay, let's reschedule an appointment. Fill in these details.",
            },
            {
                type: 'widget',
                widgetId: 'form',
                props: {
                    title: 'Reschedule appointment',
                    description: 'Specify which appointment to reschedule and the new time.',
                    fields: [
                        {
                            id: 'appointmentId',
                            label: 'Appointment ID',
                            type: 'text',
                            placeholder: 'e.g. APT-001',
                        },
                        {
                            id: 'newDate',
                            label: 'New date',
                            type: 'text',
                            placeholder: 'e.g. 2026-03-15',
                        },
                        {
                            id: 'newTime',
                            label: 'New time',
                            type: 'text',
                            placeholder: 'e.g. 15:30',
                        },
                    ],
                    initialValues: {},
                },
                flowId: 'reschedule_appointment',
                stepId: 'reschedule_form',
            },
        ],
    };
}
