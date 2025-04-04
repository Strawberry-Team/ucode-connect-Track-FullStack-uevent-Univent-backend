// src/setup_database.ts
import { createConnection, Connection } from 'mysql2/promise';
import { rootConfig } from './config/database.root.config';
import databaseConfig from './config/database.app.config';

async function setupDatabase(): Promise<void> {
    let connection: Connection | null = null;

    try {
        const config = databaseConfig();
        const shadowDbName = `${config.database.name}_shadow`;

        connection = await createConnection({
            host: rootConfig.host,
            port: rootConfig.port,
            user: rootConfig.user,
            password: rootConfig.password,
        });

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${config.database.name}\``,
        );
        console.log(`Database "${config.database.name}" created successfully.`);

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS \`${shadowDbName}\``,
        );
        console.log(`Shadow database "${shadowDbName}" created successfully.`);

        await connection.query(
            `CREATE USER IF NOT EXISTS '${config.database.username}'@'%' IDENTIFIED BY '${config.database.password}'`,
        );
        console.log(`User "${config.database.username}" created successfully.`);

        await connection.query(
            `GRANT ALL PRIVILEGES ON \`${config.database.name}\`.* TO '${config.database.username}'@'%'`,
        );
        console.log(`Privileges granted to user "${config.database.username}" for database "${config.database.name}"`);

        await connection.query(
            `GRANT ALL PRIVILEGES ON \`${shadowDbName}\`.* TO '${config.database.username}'@'%'`,
        );
        console.log(`Privileges granted to user "${config.database.username}" for shadow database "${shadowDbName}"`);

        await connection.query(`FLUSH PRIVILEGES`);
        console.log('All privileges have been flushed successfully.');

    } catch (error) {
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

setupDatabase().catch((error) => {
    console.error('Failed to setup database:', error);
    process.exit(1);
});
