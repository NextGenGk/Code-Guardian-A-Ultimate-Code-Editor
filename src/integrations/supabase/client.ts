
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bwrlnjtsunrwreimccec.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3cmxuanRzdW5yd3JlaW1jY2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3Nzc1ODIsImV4cCI6MjA2NjM1MzU4Mn0.XOKQKUeus-Sxt2eYrwt9deggFq1bb7oc6LykLL8fvjc'

export const supabase = createClient(supabaseUrl, supabaseKey)
