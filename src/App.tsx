import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { AppRouting } from '@/routing/app-routing';
import { AccountProvider } from "./provider/account-provider";
import { QueryClientProvider } from '@tanstack/react-query';
import { TranslationProvider } from '@/provider/translation-provider';
import { SettingsProvider } from '@/provider/settings-provider';
import { queryClient } from '@/lib/query-client';

const { BASE_URL } = import.meta.env;

function App() {
  return (
      <QueryClientProvider client={queryClient}>
          <TranslationProvider>
              <HelmetProvider>
                  <LoadingBarContainer>
                      <SettingsProvider>
                          <AccountProvider>
                              <Toaster />
                              <Sonner />
                              <BrowserRouter basename={BASE_URL}>
                                  <AppRouting />
                              </BrowserRouter>
                          </AccountProvider>
                      </SettingsProvider>
                  </LoadingBarContainer>
              </HelmetProvider>
          </TranslationProvider>
      </QueryClientProvider>
  )
}

export default App
