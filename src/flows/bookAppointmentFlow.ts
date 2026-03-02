import type { AssistantMessage } from '../chatTypes';
import { getAppointmentFormInitialValues } from '../llm/appointmentFormPrefill';
import { mockBookAppointment } from '../mockApi/appointments';

export async function createBookAppointmentMessage(userText: string): Promise<AssistantMessage> {
    const initialValues = await getAppointmentFormInitialValues(userText);

    return {
        id: `a-${Date.now()}`,
        role: 'assistant',
        parts: [
            {
                type: 'text',
                text: "Got it, let's book an appointment. Fill in this form.",
            },
            {
                type: 'widget',
                widgetId: 'form',
                props: {
                    title: 'Book appointment',
                    description: 'Provide the details and I will (mock) book it.',
                    fields: [
                        {
                            id: 'date',
                            label: 'Date',
                            type: 'text',
                            placeholder: 'e.g. 2026-03-02 or tomorrow',
                        },
                        {
                            id: 'time',
                            label: 'Time',
                            type: 'text',
                            placeholder: 'e.g. 15:00 or 3pm',
                        },
                        {
                            id: 'agent',
                            label: 'Agent',
                            type: 'text',
                            placeholder: 'e.g. Dr. Smith',
                        },
                    ],
                    initialValues,
                },
                flowId: 'book_appointment',
                stepId: 'appointment_form',
                onSubmit: async (values: unknown) => {
                    const castValues = values as Record<string, string>;
                    const result = await mockBookAppointment(castValues);
                    const confirmationMessage: AssistantMessage = {
                        id: `a-${Date.now()}`,
                        role: 'assistant',
                        parts: [
                            {
                                type: 'text',
                                text: `Booked appointment with ${
                                    castValues.agent || 'your selected agent'
                                } on ${castValues.date || 'your chosen date'} at ${
                                    castValues.time || 'your chosen time'
                                }. Confirmation: ${result.confirmationId}.`,
                            },
                        ],
                    };
                    return confirmationMessage;
                },
            },
        ],
    };
}
