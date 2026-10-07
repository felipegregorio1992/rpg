import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// IP IPv6 resolvido de db.awueufzhsuecongbzkql.supabase.co
const client = new pg.Client({
  host: '2600:1f1e:dbb:f601:76ee:814:40bd:2aee',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: '@Lone81303930',
  ssl: { rejectUnauthorized: false },
});

const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
  '003_seed_data.sql',
];

async function run() {
  console.log('🔌 Conectando ao banco de dados...');
  await client.connect();
  console.log('✅ Conectado!\n');

  for (const file of migrations) {
    const filePath = join(__dirname, '..', 'supabase', 'migrations', file);
    const sql = readFileSync(filePath, 'utf8');
    console.log(`📄 Executando migration: ${file}`);
    try {
      await client.query(sql);
      console.log(`✅ ${file} executado com sucesso!\n`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.log(`⚠️  ${file} — alguns objetos já existem, continuando...\n`);
      } else {
        console.error(`❌ Erro em ${file}:`, err.message);
        await client.end();
        process.exit(1);
      }
    }
  }

  console.log('🎉 Todas as migrations executadas com sucesso!');
  await client.end();
}

run().catch(async (err) => {
  console.error('❌ Erro fatal:', err.message);
  await client.end().catch(() => {});
  process.exit(1);
});
