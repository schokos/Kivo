(function(){
  const SUPABASE_URL = 'https://mfnlugxssqwihiwkryzi.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mbmx1Z3hzc3F3aWhpd2tyeXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3OTI5NDgsImV4cCI6MjA5MDM2ODk0OH0.x3xyGK5b8F3ZI9SL26vE9rOuT00Ds3vKVeCc7xQsDGY';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const edgeHeaders = async () => {
    const { data: { session } } = await sb.auth.getSession();
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + (session?.access_token || '')
    };
  };

  window.KivoSupabase = {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    sb,
    edgeHeaders
  };
})();
