import { ollamaChat, type OllamaMessage } from './ollama';

export type Intent =
    | 'book_appointment'
    | 'show_appointment_history'
    | 'show_upcoming_appointments'
    | 'reschedule_appointment'
    | 'show_appointment_summary'
    | 'design_widget'
    | 'unknown';

export type IntentResult = {
    intent: Intent;
    confidence: number;
};

export async function classifyIntent(userText: string): Promise<IntentResult> {
    const systemPrompt = [
        'You are an intent classifier for a scheduling assistant and UI helper.',
        'You must respond with VALID JSON only, no extra text.',
        'Supported intents: "book_appointment", "show_appointment_history", "show_upcoming_appointments", "reschedule_appointment", "show_appointment_summary", "design_widget", or "unknown".',
        'Pick "book_appointment" whenever the user wants to create/schedule an appointment.',
        'Pick "show_appointment_history" whenever the user wants to view past appointments or a general appointment history list.',
        'Pick "show_upcoming_appointments" whenever the user asks about upcoming / future appointments.',
        'Pick "reschedule_appointment" whenever the user wants to change/move an existing appointment to a new time or date.',
        'Pick "show_appointment_summary" whenever the user asks for stats, summary, overview, or dashboard for their appointments.',
        'Pick "design_widget" whenever the user asks you to design or render UI widgets, forms, tables, or cards (for example: "render a form with fields name, email, and message").',
        'Otherwise, use "unknown".',
        'You are NOT responsible for actually designing UI in this step. Only classify intent.',
        'JSON format:',
        '{',
        '  "intent": "book_appointment" | "show_appointment_history" | "show_upcoming_appointments" | "reschedule_appointment" | "show_appointment_summary" | "design_widget" | "unknown",',
        '  "confidence": 0.0-1.0',
        '}',
    ].join('\n');

    const messages: OllamaMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
    ];

    try {
        const raw = await ollamaChat(messages);
        const parsed = JSON.parse(raw) as Partial<IntentResult>;

        console.log('classifyIntent', { raw, parsed });

        const validIntents: Intent[] = [
            'book_appointment',
            'show_appointment_history',
            'show_upcoming_appointments',
            'reschedule_appointment',
            'show_appointment_summary',
            'design_widget',
            'unknown',
        ];
        const intent = validIntents.includes(parsed.intent as Intent)
            ? (parsed.intent as Intent)
            : 'unknown';

        return {
            intent,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        };
    } catch (err) {
        console.error('Failed to classify intent via Ollama:', err);
        return { intent: 'unknown', confidence: 0 };
    }
}
