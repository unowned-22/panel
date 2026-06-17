import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AppRouting } from '@/routing/app-routing';
import { AccountsProvider } from "./context/AccountsContext";
import { QueryClientProvider } from '@tanstack/react-query';
import { StoriesProvider } from "./context/StoriesContext";
import { RepostsProvider } from "./context/RepostsContext";
import { PlayerProvider } from "@/context/PlayerContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { MessengerProvider } from "@/context/MessengerContext";
import { TranslationProvider } from '@/i18n/context';
import { queryClient } from '@/lib/query-client';

const { BASE_URL } = import.meta.env;

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <TranslationProvider>
              <HelmetProvider>
                  <LoadingBarContainer>
                      <StoriesProvider>
                          <RepostsProvider>
                              <NotificationsProvider>
                                  <MessengerProvider>
                                      <PlayerProvider>
                                          <AccountsProvider>
                                              <Toaster />
                                              <Sonner />
                                              <BrowserRouter basename={BASE_URL}>
                                                  <AppRouting />
                                              </BrowserRouter>
                                          </AccountsProvider>
                                      </PlayerProvider>
                                  </MessengerProvider>
                              </NotificationsProvider>
                          </RepostsProvider>
                      </StoriesProvider>
                  </LoadingBarContainer>
              </HelmetProvider>
          </TranslationProvider>
      </QueryClientProvider>
  )
}

export default App

// ─── Пример использования в компонентах ──────────────────────────────────────

// 1. Auth данные и actions
// import { useAuth } from '@/auth/use-auth';
// const { user, isAdmin, login, logout } = useAuth();

// 2. Обычный запрос через React Query
// import { useQuery } from '@tanstack/react-query';
// import { apiClient } from '@/lib/api-client';
//
// const { data, isLoading } = useQuery({
//     queryKey: ['posts'],
//     queryFn: () => apiClient.get<{ data: Post[] }>('/posts'),
// });

// 3. Мутация через React Query с тостом в компоненте
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { authActions } from '@/auth/auth-actions';
// import { toast } from '@/hooks/use-toast';
//
// const qc = useQueryClient();
// const { mutate: updatePost } = useMutation({
//     mutationFn: (body: UpdatePost) => apiClient.patch('/posts/' + id, body),
//     onSuccess: () => {
//         qc.invalidateQueries({ queryKey: ['posts'] });
//         toast({ title: 'Сохранено' });
//     },
//     onError: (err: any) => toast({ title: 'Ошибка', description: err.message, variant: 'destructive' }),
// });

