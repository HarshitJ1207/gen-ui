import { z } from 'zod';

export const TableColumnSchema = z.object({
    id: z.string(),
    label: z.string(),
    width: z.string().optional(),
    align: z.enum(['left', 'center', 'right']).optional(),
});

export type TableColumn = z.infer<typeof TableColumnSchema>;

export const TableWidgetPropsSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    columns: z.array(TableColumnSchema),
    rows: z.array(z.record(z.string(), z.string())),
    emptyState: z.string().optional(),
});

export type TableWidgetProps = z.infer<typeof TableWidgetPropsSchema>;

type Props = TableWidgetProps & {
    onSubmit: (values: unknown) => void;
};

export function TableWidget({ title, description, columns, rows }: Props) {
    const hasRows = rows.length > 0;

    return (
        <div className="table-widget">
            {title ? <h3>{title}</h3> : null}
            {description ? <p>{description}</p> : null}
            {hasRows ? (
                <table>
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.id}
                                    style={col.width ? { width: col.width } : undefined}
                                    className={col.align ? `align-${col.align}` : undefined}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td
                                        key={col.id}
                                        className={col.align ? `align-${col.align}` : undefined}
                                    >
                                        {row[col.id] ?? ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>{description ?? 'No data.'}</p>
            )}
        </div>
    );
}
