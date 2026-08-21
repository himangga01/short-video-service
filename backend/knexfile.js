require('dotenv').config();
const path = require('path');

function resolveFromBackend(configuredPath, fallbackPath) {
  const targetPath = configuredPath || fallbackPath;
  return path.isAbsolute(targetPath) ? targetPath : path.resolve(__dirname, targetPath);
}

module.exports = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: resolveFromBackend(process.env.DATABASE_PATH, 'data/ssulmaker.db')
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
    },
  },
};

