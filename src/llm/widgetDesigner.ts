import { z } from 'zod';
import { ollamaChat, type OllamaMessage } from './ollama';

const DesignedWidgetSchema = z.object({
    widgetId: z.enum(['form', 'table', 'cards']),
    props: z.unknown(),
});

export type DesignedWidget = z.infer<typeof DesignedWidgetSchema>;

export async function designWidgetFromPrompt(userText: string): Promise<DesignedWidget | null> {
    const systemPrompt = [
        'You are a UI widget designer working inside a React app.',
        'You do NOT render HTML yourself. Instead, you choose a widget from a registry and provide props.',
        '',
        'Available widgets in the registry:',
        '',
        '1. form (widgetId: "form")',
        '- Renders a simple form with text inputs.',
        '- Props shape:',
        '  {',
        '    "title": string,                     // required - short title for the form header',
        '    "description"?: string,              // optional helper text',
        '    "fields": [                          // array of fields, in order',
        '      {',
        '        "id": string,                   // key used in submitted values',
        '        "label": string,                // label shown above the input',
        '        "type": "text",                // only "text" is supported right now',
        '        "required"?: boolean,           // optional',
        '        "placeholder"?: string          // optional',
        '      }',
        '      ...',
        '    ],',
        '    "initialValues"?: { [fieldId: string]: string }  // optional prefilled values',
        '  }',
        '',
        '2. table (widgetId: "table")',
        '- Renders a basic data table.',
        '- Props shape:',
        '  {',
        '    "title"?: string,',
        '    "description"?: string,',
        '    "columns": [',
        '      {',
        '        "id": string,',
        '        "label": string,',
        '        "width"?: string,               // e.g. "120px" or "20%"',
        '        "align"?: "left" | "center" | "right"',
        '      }',
        '      ...',
        '    ],',
        '    "rows": [                           // each row is a record keyed by column ids',
        '      { [columnId: string]: string },',
        '      ...',
        '    ],',
        '    "emptyState"?: string               // message when there are no rows',
        '  }',
        '',
        '3. cards (widgetId: "cards")',
        '- Renders a list of small summary cards.',
        '- Props shape:',
        '  {',
        '    "title"?: string,',
        '    "description"?: string,',
        '    "cards": [',
        '      {',
        '        "id": string,',
        '        "title": string,',
        '        "value": string,',
        '        "subtitle"?: string',
        '      }',
        '      ...',
        '    ]',
        '  }',
        '',
        'Your job:',
        '- Read the user request.',
        '- Choose exactly ONE widget that best matches what they asked for.',
        '- Design appropriate props for that widget.',
        '- Make IDs simple, lowercase, snake_case or camelCase (no spaces).',
        '- Make labels and titles human-friendly.',
        '- For forms, infer fields from phrases like "form with name, email, and message".',
        '- For tables, infer sensible columns from the request and include a few example rows if needed.',
        '- For cards, create a few cards with relevant titles/values.',
        '',
        'Output format (MUST be valid JSON, no extra commentary):',
        '{',
        '  "widgetId": "form" | "table" | "cards",',
        '  "props": { ... }   // props matching the shapes above',
        '}',
    ].join('\n');

    const messages: OllamaMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userText },
    ];

    try {
        const raw = await ollamaChat(messages);
        const parsed = JSON.parse(raw) as unknown;
        const result = DesignedWidgetSchema.safeParse(parsed);
        if (!result.success) {
            console.error('widgetDesigner: validation failed', result.error, parsed);
            return null;
        }
        return result.data;
    } catch (err) {
        console.error('widgetDesigner: failed to design widget via Ollama', err);
        return null;
    }
}
