export async function mockBookAppointment(values: Record<string, string>) {
    console.log('Mock book appointment called with:', values);

    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
        confirmationId: `CONF-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };
}

export type AppointmentHistoryItem = {
    id: string;
    date: string;
    time: string;
    agent: string;
    status: string;
};

export async function mockFetchAppointmentHistory(): Promise<AppointmentHistoryItem[]> {
    console.log('Mock fetch appointment history');

    await new Promise((resolve) => setTimeout(resolve, 400));

    return [
        {
            id: 'APT-001',
            date: '2026-03-01',
            time: '10:00',
            agent: 'Dr. Smith',
            status: 'Completed',
        },
        {
            id: 'APT-002',
            date: '2026-03-05',
            time: '14:30',
            agent: 'Dr. Patel',
            status: 'Cancelled',
        },
        {
            id: 'APT-003',
            date: '2026-03-10',
            time: '16:00',
            agent: 'Dr. Lee',
            status: 'Upcoming',
        },
    ];
}

export async function mockFetchUpcomingAppointments(): Promise<AppointmentHistoryItem[]> {
    console.log('Mock fetch upcoming appointments');
    const history = await mockFetchAppointmentHistory();
    return history.filter((item) => item.status === 'Upcoming');
}

export async function mockRescheduleAppointment(values: Record<string, string>) {
    console.log('Mock reschedule appointment called with:', values);

    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
        confirmationId: `RES-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };
}
