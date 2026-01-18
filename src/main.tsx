import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { PostHogProvider } from './lib/posthog'
import { AuthProvider } from './lib/auth'
import './styles/globals.css'

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || 'https://example.convex.cloud')

// Initialize Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

// Create router
const router = createRouter({
  routeTree,
  context: {
    queryClient,
    convex,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Type registration for router
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Service worker registration failed - app will work without offline support
    })
  })
}

console.log('App mounting...')

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <PostHogProvider>
        <ConvexProvider client={convex}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RouterProvider router={router} />
            </AuthProvider>
          </QueryClientProvider>
        </ConvexProvider>
      </PostHogProvider>
    </StrictMode>,
  )
  console.log('App mounted successfully')
} catch (error) {
  console.error('App failed to mount:', error)
  document.getElementById('root')!.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error}</div>`
}
