import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = 'https://xxyewnkrulnmgtcshcfx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eWV3bmtydWxubWd0Y3NoY2Z4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMDM0NzMsImV4cCI6MjA5MzU3OTQ3M30.NSqupSPEw9ItFJHTqhTbyNpO6O8y-7-ZT7YfWUypGwk'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
