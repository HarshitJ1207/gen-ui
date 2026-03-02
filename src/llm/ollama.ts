export type OllamaMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

// Use a relative URL so the browser hits the Vite dev server,
// which proxies to the local Ollama instance.
const OLLAMA_URL = '/ollama/api/chat';
// Use your local Ollama model
const OLLAMA_MODEL = 'qwen2.5:7b';

export async function ollamaChat(messages: OllamaMessage[]): Promise<string> {
    const res = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: OLLAMA_MODEL,
            messages,
            stream: false,
        }),
    });

    if (!res.ok) {
        throw new Error(`Ollama request failed with status ${res.status}`);
    }

    const data = await res.json();
    // Non-streaming Ollama returns { message: { role, content }, ... }
    return (data?.message?.content as string) ?? '';
}
