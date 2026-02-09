// typeorm.config.ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
import { glob } from "glob";

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const isProduction = process.env.NODE_ENV === 'production';

// Función para cargar rutas de entidades
const getEntityPaths = () => {
  if (isProduction) {
    return ['dist/**/*.entity.js'];
  }
  
  // En desarrollo, encontrar todos los archivos .entity.ts
  const entityFiles = glob.sync('src/**/*.entity.ts');
  return entityFiles;
};

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    entities: getEntityPaths(),
    
    migrations: isProduction
        ? ['dist/migrations/*.js']
        : ['src/migrations/*.ts'],

    schema: process.env.DB_SCHEMA || 'public', // 👈 Agrega esta línea
    
    logging: process.env.NODE_ENV === 'development',
    extra: {
        options: '-c timezone=UTC'
    },
});