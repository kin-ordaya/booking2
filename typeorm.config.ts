// typeorm.config.ts
import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

// 👇 Usar ruta ABSOLUTA desde la raíz del proyecto
const envPath = path.resolve(process.cwd(), '.env');
console.log("Buscando .env en:", envPath);

dotenv.config({ path: envPath });

// Verificar después de cargar
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_PORT:", process.env.DB_PORT);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASS:", process.env.DB_PASS ? "******" : "undefined");
console.log("DB_NAME:", process.env.DB_NAME);

export default new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost', // valor por defecto
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'test',
    synchronize: false,
    migrations: ['src/migrations/*.ts'],
    entities: ['dist/**/*.entity.ts'],
    logging: process.env.NODE_ENV === 'development',
    extra: {
        options: '-c timezone=UTC'
    },
});