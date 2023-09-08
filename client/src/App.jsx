import { RecoilRoot } from 'recoil';
import { RouterProvider } from 'react-router-dom';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query';
import { ScreenshotProvider, ThemeProvider, useApiErrorBoundary } from './hooks';
import { router } from './routes';
import { PostHogProvider } from 'posthog-js/react';

const options = {
  api_host: 'https://app.posthog.com',
  opt_in_site_apps: true,
};

const App = () => {
  const { setError } = useApiErrorBoundary();

  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (error?.response?.status === 401) {
          setError(error);
        }
      },
    }),
  });

  return (
    <QueryClientProvider client={queryClient}>
      <RecoilRoot>
        <ThemeProvider>
          <PostHogProvider
            apiKey={'phc_PaLbbj3kvxu2MYdpTshOkviNdQReoobWjFtnlKaGEoi'}
            options={options}
          >
            <RouterProvider router={router} />
            <ReactQueryDevtools initialIsOpen={false} position="top-right" />
          </PostHogProvider>
        </ThemeProvider>
      </RecoilRoot>
    </QueryClientProvider>
  );
};

export default () => (
  <ScreenshotProvider>
    <App />
  </ScreenshotProvider>
);
