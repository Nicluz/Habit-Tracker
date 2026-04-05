import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vjimgvsueahdtjtgiiqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaW1ndnN1ZWFoZHRqdGdpaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MDg5NDgsImV4cCI6MjA5MDk4NDk0OH0.KQ-0H3Wr3onXHsDLhbZIuv_98JgAavdy0XuNi507Q64'
)
