import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://vjimgvsueahdtjtgiiqd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqaW1ndnN1ZWFoZHRqdGdpaXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM4MDg5NDgsImV4cCI6MjA1OTM4NDk0OH0.KQ-0H3Wr3onXHsDLhbZIuv_98JgAavdy0XuNi507Q64'
)
