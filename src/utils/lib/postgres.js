const { Pool } = require('pg');

class PostgresDb {
    constructor(options) {
        this.pool = new Pool({
            host: options.host,
            port: options.port ?? 5432,
            user: options.user,
            password: options.password,
            database: options.database ?? 'postgres',
            max: options.maxPoolSize ?? 10,
            connectionTimeoutMillis: options.connectionTimeoutMs ?? 30000,
            idleTimeoutMillis: options.idleTimeoutMs ?? 10000,
        });
    }

    async query(text, params) {
        const start = Date.now();
        try {
            console.log(`Executing query: ${text} with params: ${JSON.stringify(params)}`);
            const result = await this.pool.query(text, params);
            const duration = Date.now() - start;
            console.log(`Query executed successfully in ${duration}ms`);
            return result;
        } catch (error) {
            console.log(`Query failed: ${error}`);
            throw error;
        }
    }

    async connect() {
        const client = await this.pool.connect();
        return client;
    }

    async close() {
        await this.pool.end();
        console.log('Database connection pool closed.');
    }
}

module.exports = PostgresDb;
