import { useState } from 'react';
import './App.css';
import type { AssistantMessage, ChatMessage, MessagePart, UserMessage } from './chatTypes';
import { classifyIntent } from './llm/intentRouter';
import { widgetRegistry } from './widgets/registry';
import { ollamaChat } from './llm/ollama';
import { mockBookAppointment, mockRescheduleAppointment } from './mockApi/appointments';
import { createBookAppointmentMessage } from './flows/bookAppointmentFlow';
import { createAppointmentHistoryMessage } from './flows/appointmentHistoryFlow';
import { createUpcomingAppointmentsMessage } from './flows/upcomingAppointmentsFlow';
import { createRescheduleAppointmentMessage } from './flows/rescheduleAppointmentFlow';
import { createAppointmentSummaryMessage } from './flows/appointmentSummaryFlow';
import { designWidgetFromPrompt } from './llm/widgetDesigner';

function App() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const appendMessage = (message: ChatMessage) => {
        setMessages((prev) => [...prev, message]);
    };

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isProcessing) return;

        const userMessage: UserMessage = {
            id: `u-${Date.now()}`,
            role: 'user',
            text: trimmed,
        };
        appendMessage(userMessage);
        setInput('');
        setIsProcessing(true);

	        try {
	            const intentResult = await classifyIntent(trimmed);

	            if (intentResult.intent === 'book_appointment' && intentResult.confidence > 0.4) {
	                const assistant = await createBookAppointmentMessage(trimmed);
	                appendMessage(assistant);
	                return;
	            }

	            if (
	                intentResult.intent === 'show_appointment_history' &&
	                intentResult.confidence > 0.4
	            ) {
	                const assistant = await createAppointmentHistoryMessage();
	                appendMessage(assistant);
	                return;
	            }

	            if (
	                intentResult.intent === 'show_upcoming_appointments' &&
	                intentResult.confidence > 0.4
	            ) {
	                const assistant = await createUpcomingAppointmentsMessage();
	                appendMessage(assistant);
	                return;
	            }

	            if (intentResult.intent === 'reschedule_appointment' && intentResult.confidence > 0.4) {
	                const assistant = createRescheduleAppointmentMessage();
	                appendMessage(assistant);
	                return;
	            }

	            if (
	                intentResult.intent === 'show_appointment_summary' &&
	                intentResult.confidence > 0.4
	            ) {
	                const assistant = await createAppointmentSummaryMessage();
	                appendMessage(assistant);
	                return;
	            }

	            if (intentResult.intent === 'design_widget' && intentResult.confidence > 0.4) {
	                const designed = await designWidgetFromPrompt(trimmed);
	                if (designed) {
	                    const assistant: AssistantMessage = {
	                        id: `a-${Date.now()}`,
	                        role: 'assistant',
	                        parts: [
	                            {
	                                type: 'text',
	                                text: 'Here is the UI you asked for.',
	                            },
	                            {
	                                type: 'widget',
	                                widgetId: designed.widgetId,
	                                props: designed.props,
	                            },
	                        ],
	                    };
	                    appendMessage(assistant);
	                    return;
	                }
	            }

	            // Unknown or low-confidence intent → let the LLM answer normally as a chatbot.
	            try {
	                const replyText = await ollamaChat([
	                    {
	                        role: 'system',
	                        content:
	                            'You are a helpful, concise assistant. Respond conversationally to the user.',
	                    },
	                    { role: 'user', content: trimmed },
	                ]);
	                const assistant: AssistantMessage = {
	                    id: `a-${Date.now()}`,
	                    role: 'assistant',
	                    parts: [{ type: 'text', text: replyText }],
	                };
	                appendMessage(assistant);
	            } catch (err) {
	                console.error('Fallback chat with Ollama failed:', err);
	                const assistant: AssistantMessage = {
	                    id: `a-${Date.now()}`,
	                    role: 'assistant',
	                    parts: [
	                        {
	                            type: 'text',
	                            text: "I'm having trouble contacting the language model right now.",
	                        },
	                    ],
	                };
	                appendMessage(assistant);
	            }
	        } finally {
	            setIsProcessing(false);
	        }
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const handleWidgetSubmit = async (part: MessagePart, values: unknown) => {
        if (part.type !== 'widget') return;
        if (part.widgetId === 'form' && part.flowId === 'book_appointment') {
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
            appendMessage(confirmationMessage);
        } else if (part.widgetId === 'form' && part.flowId === 'reschedule_appointment') {
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
            appendMessage(confirmationMessage);
        }
    };

    return (
        <div className="app-root">
            <h1 className="app-title">Generative UI Chat</h1>
            <div className="chat-container">
                <div className="messages">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={
                                message.role === 'user'
                                    ? 'message message-user'
                                    : 'message message-assistant'
                            }
                        >
                            {message.role === 'user' ? (
                                <p>{message.text}</p>
                            ) : (
                                <AssistantMessageView
                                    parts={message.parts}
                                    onWidgetSubmit={handleWidgetSubmit}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="input-row">
                    <input
                        className="chat-input"
                        placeholder="Type something like 'I want to book an appointment tomorrow at 3 with Dr. Smith'"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="send-button"
                        onClick={() => void handleSend()}
                        disabled={isProcessing}
                    >
                        {isProcessing ? 'Thinking…' : 'Send'}
                    </button>
                </div>
            </div>
        </div>
    );
}

type AssistantMessageViewProps = {
    parts: MessagePart[];
    onWidgetSubmit: (part: MessagePart, values: unknown) => void | Promise<void>;
};

function AssistantMessageView({ parts, onWidgetSubmit }: AssistantMessageViewProps) {
    return (
        <div className="assistant-parts">
            {parts.map((part, index) => {
                if (part.type === 'text') {
                    return (
                        <p key={index} className="assistant-text">
                            {part.text}
                        </p>
                    );
                }

                if (part.type === 'widget') {
                    const def = widgetRegistry[part.widgetId as keyof typeof widgetRegistry];
                    if (!def) {
                        return (
                            <p key={index} className="assistant-text">
                                Unknown widget: {part.widgetId}
                            </p>
                        );
                    }

                    const parsed = def.schema.safeParse(part.props);
                    if (!parsed.success) {
                        console.error('Invalid widget props', parsed.error, part.props);
                        return (
                            <p key={index} className="assistant-text">
                                There was a problem rendering this widget.
                            </p>
                        );
                    }

                    const Cmp = def.Component as React.ComponentType<any>;
                    return (
                        <div key={index} className="assistant-widget">
                            <Cmp
                                {...(parsed.data as any)}
                                onSubmit={(values: any) => void onWidgetSubmit(part, values)}
                            />
                        </div>
                    );
                }

                return null;
            })}
        </div>
    );
}

export default App;
