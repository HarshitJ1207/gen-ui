import type { ComponentType } from 'react';
import { z } from 'zod';
import { FormWidget, FormWidgetPropsSchema, type FormWidgetProps } from './FormWidget';
import { TableWidget, TableWidgetPropsSchema, type TableWidgetProps } from './TableWidget';
import {
    CardListWidget,
    CardListWidgetPropsSchema,
    type CardListWidgetProps,
} from './CardListWidget';

export type WidgetDef<P> = {
    widgetId: string;
    schema: z.ZodType<P>;
    Component: ComponentType<P & { onSubmit: (values: any) => void }>;
};

export const widgetRegistry = {
    form: {
        widgetId: 'form',
        schema: FormWidgetPropsSchema,
        Component: FormWidget,
    } satisfies WidgetDef<FormWidgetProps>,
    table: {
        widgetId: 'table',
        schema: TableWidgetPropsSchema,
        Component: TableWidget,
    } satisfies WidgetDef<TableWidgetProps>,
    cards: {
        widgetId: 'cards',
        schema: CardListWidgetPropsSchema,
        Component: CardListWidget,
    } satisfies WidgetDef<CardListWidgetProps>,
} as const;

export type WidgetId = keyof typeof widgetRegistry;
