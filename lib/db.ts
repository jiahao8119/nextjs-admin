import pkg from "pg"
const { Pool } = pkg

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: InstanceType<typeof Pool> | undefined
}

export const pool =
  global._pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })

if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool
}
