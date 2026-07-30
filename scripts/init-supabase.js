const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ connectionString: 'postgresql://postgres.rxjfdsnnfedqgljnzbrc:Surgeonsafar01@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres', ssl: { rejectUnauthorized: false } });
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS attempts (
      id SERIAL PRIMARY KEY,
      section VARCHAR(32) NOT NULL,
      task_label VARCHAR(128) NOT NULL,
      band_score REAL NOT NULL,
      raw_score INTEGER,
      total_questions INTEGER,
      user_response TEXT NOT NULL,
      feedback JSONB NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS listening_tests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      intro TEXT NOT NULL,
      transcript TEXT NOT NULL,
      questions JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reading_tests (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      passage TEXT NOT NULL,
      questions JSONB NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS writing_tasks (
      id SERIAL PRIMARY KEY,
      task_number INTEGER NOT NULL,
      label VARCHAR(200) NOT NULL,
      prompt TEXT NOT NULL,
      min_words INTEGER NOT NULL,
      time_minutes INTEGER NOT NULL,
      data_description TEXT,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS speaking_prompts (
      id SERIAL PRIMARY KEY,
      part INTEGER NOT NULL,
      label VARCHAR(200) NOT NULL,
      prompt TEXT,
      questions JSONB,
      time_minutes INTEGER NOT NULL,
      is_active BOOLEAN DEFAULT TRUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key VARCHAR(128) PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);
  
  const res = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema=\'public\'');
  console.log('Supabase tables successfully created via SQL:', res.rows.map(r => r.table_name));
  await pool.end();
})();
