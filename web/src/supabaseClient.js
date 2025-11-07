import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mvesrtopeiutcaytyxmg.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12ZXNydG9wZWl1dGNheXR5eG1nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzE2NzUsImV4cCI6MjA3NzkwNzY3NX0.itwioYZhWSwhG11vrzxqFr-Z83-tLb8lo5kQoBCjBB4"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);