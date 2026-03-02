import { useState, type FormEvent } from 'react';
import { z } from 'zod';

export const FormFieldSchema = z.object({
    id: z.string(),
    label: z.string(),
    type: z.enum(['text']),
    required: z.boolean().optional(),
    placeholder: z.string().optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

export const FormWidgetPropsSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    fields: z.array(FormFieldSchema),
    initialValues: z.record(z.string(), z.string()).optional(),
});

export type FormWidgetProps = z.infer<typeof FormWidgetPropsSchema>;

type Props = FormWidgetProps & {
    onSubmit: (values: Record<string, string>) => void;
};

export function FormWidget({ title, description, fields, initialValues, onSubmit }: Props) {
    console.log('FormWidget', { title, description, fields, initialValues });
    const [values, setValues] = useState<Record<string, string>>(() => {
        const base: Record<string, string> = {};
        for (const field of fields) {
            const initial = initialValues?.[field.id];
            base[field.id] = typeof initial === 'string' ? initial : '';
        }
        return base;
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (id: string, next: string) => {
        setValues((prev) => ({ ...prev, [id]: next }));
    };

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            onSubmit(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="appointment-form" onSubmit={handleSubmit}>
            <h3>{title}</h3>
            {description ? <p>{description}</p> : null}
            {fields.map((field) => (
                <div key={field.id} className="field-row">
                    <label>
                        {field.label}
                        <input
                            type="text"
                            value={values[field.id] ?? ''}
                            onChange={(e) => handleChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                        />
                    </label>
                </div>
            ))}
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
        </form>
    );
}
