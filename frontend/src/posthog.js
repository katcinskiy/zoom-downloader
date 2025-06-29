import posthog from 'posthog-js'

// Initialize PostHog with environment variables
if (import.meta.env.VITE_POSTHOG_KEY) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
    person_profiles: 'identified_only',
    loaded: (posthog) => {
      if (import.meta.env.DEV) console.log('PostHog loaded')
    }
  })
} else {
  console.warn('PostHog not initialized: VITE_POSTHOG_KEY not found')
}

export default posthog