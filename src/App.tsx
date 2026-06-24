import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AppRouting } from '@/routing/app-routing';
import { AccountProvider } from "./provider/account-provider";
import { QueryClientProvider } from '@tanstack/react-query';
import { TranslationProvider } from '@/provider/translation-provider';
import { NotificationsProvider } from "@/provider/notification-provider";
import { FriendRequestsProvider } from "@/provider/friend-requests-provider";
import { SettingsProvider } from '@/provider/settings-provider';
import { StoriesProvider } from "@/provider/stories-provider";
import { TooltipsProvider } from "@/provider/tooltips-provider";
import { queryClient } from '@/lib/query-client';

const { BASE_URL } = import.meta.env;

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <TooltipsProvider>
              <TranslationProvider>
                  <HelmetProvider>
                      <LoadingBarContainer>
                          <NotificationsProvider>
                              <FriendRequestsProvider>
                                  <SettingsProvider>
                                      <AccountProvider>
                                          <StoriesProvider>
                                              <Toaster />
                                              <Sonner />
                                              <BrowserRouter basename={BASE_URL}>
                                                  <AppRouting />
                                              </BrowserRouter>
                                          </StoriesProvider>
                                      </AccountProvider>
                                  </SettingsProvider>
                              </FriendRequestsProvider>
                          </NotificationsProvider>
                      </LoadingBarContainer>
                  </HelmetProvider>
              </TranslationProvider>
          </TooltipsProvider>
      </QueryClientProvider>
  )
}

export default App
