import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';
import { LoadingBarContainer } from 'react-top-loading-bar';
import { AppRouting } from '@/routing/app-routing';
import { AccountsProvider } from "./context/AccountsContext";
import { AuthProvider } from '@/auth/auth-provider';

const { BASE_URL } = import.meta.env;

function App() {
  return (
      <HelmetProvider>
          <LoadingBarContainer>
              <AuthProvider>
                  <AccountsProvider>
                      <BrowserRouter basename={BASE_URL}>
                          <AppRouting />
                      </BrowserRouter>
                  </AccountsProvider>
              </AuthProvider>
          </LoadingBarContainer>
      </HelmetProvider>
  )
}

export default App
