import { z } from 'zod';

export const CardSchema = z.object({
    id: z.string(),
    title: z.string(),
    value: z.string(),
    subtitle: z.string().optional(),
});

export type Card = z.infer<typeof CardSchema>;

export const CardListWidgetPropsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    cards: z.array(CardSchema),
});

export type CardListWidgetProps = z.infer<typeof CardListWidgetPropsSchema>;

type Props = CardListWidgetProps & {
    onSubmit: (values: unknown) => void;
};

export function CardListWidget({ title, description, cards }: Props) {
    return (
        <div className="card-list-widget">
            {title ? <h3>{title}</h3> : null}
            {description ? <p>{description}</p> : null}
            <div className="card-list">
                {cards.map((card) => (
                    <div key={card.id} className="card-item">
                        <div className="card-title">{card.title}</div>
                        <div className="card-value">{card.value}</div>
                        {card.subtitle ? (
                            <div className="card-subtitle">{card.subtitle}</div>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}
