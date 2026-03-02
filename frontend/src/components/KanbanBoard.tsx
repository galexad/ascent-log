import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Application, ApplicationStatus } from '../types';
import { KanbanColumn } from './KanbanColumn';
import { ApplicationModal } from './ApplicationModal';
import { DndContext, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

const fetchApplications = async (): Promise<Application[]> => {
    const res = await fetch('/api/applications');
    if (res.status === 401) {
        throw new Error('Unauthorized');
    }
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Fetch applications error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch applications');
    }
    return res.json();
};

export function KanbanBoard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingApp, setEditingApp] = useState<Application | null>(null);
    const queryClient = useQueryClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const { data: applications, isError, error } = useQuery({
        queryKey: ['applications'],
        queryFn: fetchApplications,
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
            const app = applications?.find((a) => a.id === id);
            if (!app) return;
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...app, status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey: ['applications'] });
            const previousApps = queryClient.getQueryData<Application[]>(['applications']);

            if (previousApps) {
                queryClient.setQueryData<Application[]>(['applications'], (old) =>
                    old?.map(app => app.id === id ? { ...app, status } : app)
                );
            }
            return { previousApps };
        },
        onError: (_err, _newApp, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(['applications'], context.previousApps);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        },
    });

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over) return;

        const applicationId = String(active.id);
        const newStatus = over.id as ApplicationStatus;

        const app = applications?.find(a => a.id === applicationId);
        if (app && app.status !== newStatus) {
            updateStatusMutation.mutate({ id: applicationId, status: newStatus });
        }
    };

    const handleEdit = (app: Application) => {
        setEditingApp(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingApp(null);
    };


    if (isError) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-red-500 gap-4">
                <p>Error loading applications: {error instanceof Error ? error.message : 'Unknown error'}</p>
                <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ['applications'] })}
                    className="rounded-xl bg-mint-500 px-4 py-2 text-sm font-semibold text-white hover:bg-mint-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    const columns: { title: string; status: ApplicationStatus }[] = [
        { title: 'Applied', status: 'Applied' },
        { title: 'In Progress', status: 'In Progress' },
        { title: 'Archived', status: 'Archived' },
    ];

    return (
        <div className="flex h-full flex-col p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Job Applications</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Track and manage your job hunt process.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-xl bg-mint-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-mint-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-500 transition-colors"
                >
                    New Application
                </button>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
                <div className="flex flex-1 gap-6 overflow-x-auto pb-4">
                    {columns.map((col) => (
                        <KanbanColumn
                            key={col.status}
                            title={col.title}
                            status={col.status}
                            applications={applications?.filter((app) => app.status === col.status) || []}
                            onEdit={handleEdit}
                            onStatusChange={(id, newStatus) => updateStatusMutation.mutate({ id, status: newStatus })}
                        />
                    ))}
                </div>
            </DndContext>

            {isModalOpen && (
                <ApplicationModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    application={editingApp}
                />
            )}
        </div>
    );
}
