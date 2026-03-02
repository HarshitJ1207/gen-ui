export type UserMessage = { id: string; role: 'user'; text: string };

export type AssistantMessage = {
    id: string;
    role: 'assistant';
    parts: MessagePart[];
};

export type ChatMessage = UserMessage | AssistantMessage;

export type WidgetMessagePart = {
    type: 'widget';
    widgetId: string;
    props: unknown;
    flowId?: string;
    stepId?: string;
};

export type TextMessagePart = {
    type: 'text';
    text: string;
};

export type MessagePart = TextMessagePart | WidgetMessagePart;
