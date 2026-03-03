import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import type { Application, ApplicationStatus } from '../types';

export function useApplications() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const queryKey = ['applications', user?.id];

    // GET Query
    const query = useQuery({
        queryKey,
        queryFn: async () => {
            if (!user?.id) return [];
            const res = await fetch(`/api/users/${user.id}/applications`);
            if (!res.ok) throw new Error('Failed to fetch applications');
            return res.json();
        },
        enabled: !!user?.id,
    });

    // UPDATE Status Mutation (with Optimistic Updates)
    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status, app }: { id: string; status: ApplicationStatus; app: Application }) => {
            const res = await fetch(`/api/applications/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...app, status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            return res.json();
        },
        onMutate: async ({ id, status }) => {
            await queryClient.cancelQueries({ queryKey });
            const previousApps = queryClient.getQueryData<Application[]>(queryKey);

            if (previousApps) {
                queryClient.setQueryData<Application[]>(queryKey, (old) =>
                    old?.map((app) => (app.id === id ? { ...app, status } : app))
                );
            }
            return { previousApps };
        },
        onError: (_err, _variables, context) => {
            if (context?.previousApps) {
                queryClient.setQueryData(queryKey, context.previousApps);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // CREATE/EDIT Mutation
    const saveMutation = useMutation({
        mutationFn: async ({ id, data }: { id?: string; data: any }) => {
            const url = id ? `/api/applications/${id}` : '/api/applications';
            const method = id ? 'PUT' : 'POST';
            const payload = id ? data : { ...data, user_id: user?.id };

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to save application');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    // DELETE Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
    });

    return {
        applications: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        updateStatus: updateStatusMutation.mutate,
        saveApplication: saveMutation.mutateAsync,
        deleteApplication: deleteMutation.mutate,
        isSaving: saveMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
