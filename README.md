# Generative UI Chat (React + TypeScript + Vite)

This app is a small playground for **LLM-driven UI flows**: a chat interface where the assistant can respond with both text and **widgets** (forms, tables, cards) that are rendered from a local **widget registry**.

The whole thing is wired to a local Ollama model (`qwen2.5:7b`) via Vite proxy.

---

## Intents

User messages are first classified into a small set of intents by `src/llm/intentRouter.ts`.

Current intents:

- `book_appointment`
- `show_appointment_history`
- `show_upcoming_appointments`
- `reschedule_appointment`
- `show_appointment_summary`
- `design_widget` (LLM-driven widget design)
- `unknown` (fallback to plain chat)

---

## Flows

Each non-trivial intent has a small flow module under `src/flows` that builds an `AssistantMessage` composed of text + a widget.

### 1. Book appointment (`book_appointment`)

File: `src/flows/bookAppointmentFlow.ts`

- Builds a **form** widget for booking an appointment.
- Fields:
    - `date` (text)
    - `time` (text)
    - `agent` (text)
- Initial values are inferred from the user utterance by `src/llm/appointmentFormPrefill.ts` (date/time/agent extraction + simple date normalization: today/tomorrow variants → real ISO date).
- On submit, `App.tsx` calls `mockBookAppointment` and responds with a confirmation text.

### 2. Appointment history (`show_appointment_history`)

File: `src/flows/appointmentHistoryFlow.ts`

- Renders a **table** widget with past appointments.
- Data comes from a mocked API in `src/mockApi/appointments.ts`.

### 3. Upcoming appointments (`show_upcoming_appointments`)

File: `src/flows/upcomingAppointmentsFlow.ts`

- Similar to history, but shows **upcoming** appointments in a table.

### 4. Reschedule appointment (`reschedule_appointment`)

File: `src/flows/rescheduleAppointmentFlow.ts`

- Renders a **form** to reschedule an existing appointment.
- Fields:
    - `appointmentId`
    - `newDate`
    - `newTime`
- On submit, `App.tsx` calls `mockRescheduleAppointment` and returns a confirmation text.

### 5. Appointment summary (`show_appointment_summary`)

File: `src/flows/appointmentSummaryFlow.ts`

- Renders **cards** summarizing appointment stats (e.g. total, upcoming, cancelled) using the `cards` widget.

---

## Widgets and Widget Registry

All widgets live in `src/widgets` and are registered in `src/widgets/registry.ts`.

Available widgets:

- `form` → `FormWidget`

    - Props schema: `FormWidgetPropsSchema` in `FormWidget.tsx`
    - Renders a simple text-input form (fields defined by code or the LLM).

- `table` → `TableWidget`

    - Props schema: `TableWidgetPropsSchema` in `TableWidget.tsx`
    - Renders a data table with configurable columns and rows.

- `cards` → `CardListWidget`
    - Props schema: `CardListWidgetPropsSchema` in `CardListWidget.tsx`
    - Renders a list of small stat/summary cards.

`App.tsx` uses the registry to look up the widget by `widgetId`, validates props via the Zod schema, and then renders the correct React component.

---

## LLM-driven Widget Design (`design_widget` intent)

When the user asks for UI directly (e.g. _"render a form with fields name, email, and message"_), the flow is:

1. `classifyIntent` in `src/llm/intentRouter.ts` returns `design_widget`.
2. `App.tsx` calls `designWidgetFromPrompt` in `src/llm/widgetDesigner.ts`.
3. `widgetDesigner`:
    - Describes the **widget registry** and each widget’s prop shape in a system prompt.
    - Asks the model to return **JSON** of the form:
        - `{ "widgetId": "form" | "table" | "cards", "props": { ... } }`.
    - Validates this with Zod and returns `{ widgetId, props }`.
4. `App.tsx` wraps that into an `AssistantMessage` with a text part plus a widget part pointing at the chosen `widgetId` and `props`.
5. The existing widget registry + Zod schema do final validation before rendering.

This means the LLM has **controlled access** to the widget catalog and **control over widget props**, but the app still owns:

- Which widgets exist.
- The exact prop schemas.
- What happens when the widget is submitted.

---

## Running the app

Assuming you have [Ollama](https://ollama.com/) installed and the `qwen2.5:7b` model pulled:

```bash
ollama pull qwen2.5:7b
ollama serve

npm install
npm run dev
```

Then open the printed localhost URL in a browser and start chatting, e.g.:

- `I want to book an appointment tomorrow at 3 with Dr. Smith`
- `show me my appointment history`
- `show my upcoming appointments`
- `help me reschedule an appointment`
- `give me a summary of my appointments`
- `render a form with fields: name, email, and message`
