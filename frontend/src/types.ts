export type ApplicationStatus = 'Applied' | 'In Progress' | 'Archived';

export interface User {
    id: number;
    email: string;
    name: string;
}

export interface Application {
    id: number;
    user_id: number;
    company: string;
    position: string;
    description: string;
    status: ApplicationStatus;
    feedback?: string;
    created_at: string;
    updated_at: string;
}
