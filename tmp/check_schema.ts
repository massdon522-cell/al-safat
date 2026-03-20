import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ppscvvjhnqmigjkoxbzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwc2N2dmpobnFtaWdqa294YnpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTkyMTAsImV4cCI6MjA4OTQ5NTIxMH0.KNTJVF0eOXEFkss2Pqf4V8PLae9v0cFeT2ESl_jMqOU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkColumns() {
  const { data, error } = await supabase
    .from('withdrawal_code_submissions')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching data:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
  } else {
    // Try to get a single record to at least find columns
    const { data: colsData } = await supabase
      .from('withdrawal_code_submissions')
      .select('*')
      .limit(1);
    
    if (colsData) {
       console.log('Attempted columns search result:', colsData);
    }
  }
}

checkColumns();
