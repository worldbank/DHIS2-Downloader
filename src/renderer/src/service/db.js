// db.js
import Dexie from 'dexie'

export const dictionaryDb = new Dexie('dictionary')
export const servicesDb = new Dexie('services')
export const queryDb = new Dexie('query')

// ---- services
servicesDb.version(1).stores({
  services: '++id'
})

// ---- dictionary
dictionaryDb.version(1).stores({
  elements: '++id, category, displayName, displayDescription, numerator, denominator'
})
dictionaryDb.version(1).stores({
  facility: '++id, displayName, level, geometry, coordinates, organisationUnitGroups'
})

// ---- query (fresh schema; no legacy versions)
export const queryHeaders = [
  'id',
  'notes',
  'organizationLevel',
  'period',
  'dimension',
  'dimensionName',
  'disaggregation',
  'url'
]

queryDb.version(1).stores({
  // history of saved queries (same as before)
  query: '++id, notes, organizationLevel, period, dimension, dimensionName, disaggregation, url',

  // 2️⃣ Runs table – just marks each execution
  runs: '++id, ok', // ok = boolean, true if fully successful

  // 3️⃣ Many-to-many mapping between runs and queries
  runQueries: '++id, [runId+queryId], runId, queryId',

  // 4️⃣ Per-chunk results (optimized indices)
  results: '++id, runId, [runId+queryId], ok, createdAt'
})

// Optional helper if you ever want to nuke the DB on demand
export async function resetQueryDb() {
  await queryDb.delete() // drops the whole 'query' DB
  await queryDb.open() // recreates with version(1) schema above
}
