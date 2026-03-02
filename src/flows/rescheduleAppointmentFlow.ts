import type { AssistantMessage } from '../chatTypes';
import { mockRescheduleAppointment } from '../mockApi/appointments';

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
                onSubmit: async (values: unknown) => {
                    const castValues = values as Record<string, string>;
                    const result = await mockRescheduleAppointment(castValues);
                    const confirmationMessage: AssistantMessage = {
                        id: `a-${Date.now()}`,
                        role: 'assistant',
                        parts: [
                            {
                                type: 'text',
                                text: `Rescheduled appointment ${castValues.appointmentId || ''} to ${
                                    castValues.newDate || 'your new date'
                                } at ${castValues.newTime || 'your new time'}. Confirmation: ${
                                    result.confirmationId
                                }.`,
                            },
                        ],
                    };
                    return confirmationMessage;
                },
            },
        ],
    };
}
