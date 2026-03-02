export type ApplicationStatus = 'Applied' | 'In Progress' | 'Archived';

export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Application {
    id: string;
    user_id: string;
    company: string;
    position: string;
    description: string;
    status: ApplicationStatus;
    feedback?: string;
    created_at: string;
    updated_at: string;
}
