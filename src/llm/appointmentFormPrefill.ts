import { z } from 'zod';
import { ollamaChat, type OllamaMessage } from './ollama';

const AppointmentFormPrefillSchema = z.object({
    date: z.string().optional(),
    time: z.string().optional(),
    agent: z.string().optional(),
});

export type AppointmentFormPrefill = z.infer<typeof AppointmentFormPrefillSchema>;

function normalizeRelativeDate(raw: string): string {
    const lower = raw.trim().toLowerCase();
    const today = new Date();
    const format = (d: Date) => d.toISOString().slice(0, 10);

    if (['tomorrow', 'tommorow', 'tomo', 'tmrw', 'tmr'].includes(lower)) {
        const d = new Date(today);
        d.setDate(d.getDate() + 1);
        return format(d);
    }

    if (['today', 'tod'].includes(lower)) {
        return format(today);
    }

    return raw;
}

export async function getAppointmentFormInitialValues(
    userText: string,
): Promise<Record<string, string>> {
    const systemPrompt = [
        'You extract structured appointment details from user requests.',
        'You must respond with VALID JSON only, no extra text.',
        'Fields: "date", "time", "agent".',
        'Only include fields you are reasonably confident about. If unsure, omit the field.',
        'Return dates either as an explicit YYYY-MM-DD (preferred) or simple phrases like "next Monday".',
        'Example input: "Book me tomorrow at 3pm with Dr. Smith"',
        'Example output: { "date": "tomorrow", "time": "3pm", "agent": "Dr. Smith" }',
    ].join('\n');

    const messages: OllamaMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
    ];

    try {
        const raw = await ollamaChat(messages);
        const parsed = JSON.parse(raw) as unknown;
        const result = AppointmentFormPrefillSchema.safeParse(parsed);

        if (!result.success) {
            console.error('Appointment form prefill validation failed', result.error, parsed);
            return {};
        }

        const initial: Record<string, string> = {};
        if (result.data.date) initial.date = normalizeRelativeDate(result.data.date);
        if (result.data.time) initial.time = result.data.time;
        if (result.data.agent) initial.agent = result.data.agent;
        return initial;
    } catch (err) {
        console.error('Failed to get appointment form initial values via Ollama:', err);
        return {};
    }
}
