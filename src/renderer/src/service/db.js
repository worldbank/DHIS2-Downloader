import Dexie from 'dexie'

export const dictionaryDb = new Dexie('dictionary')
export const servicesDb = new Dexie('services')
export const queryDb = new Dexie('query')
servicesDb.version(1).stores({
  services: '++id'
})

export const queryHeaders = [
  'notes',
  'organizationLevel',
  'period',
  'dimension',
  'disaggregation',
  'url'
]

queryDb.version(1).stores({
  query: `++id,${queryHeaders.join(',')}`
})

dictionaryDb.version(1).stores({
  dataElements: '++id, category, displayName, displayDescription',
  indicators: '++id, category, displayName, displayDescription, numerator, denominator',
  programIndicators: '++id, category, displayName, displayDescription',
  catOptionCombos: '++id, displayName',
  dataSets: '++id, displayName'
})

export const changeSchema = async (db, schemaChanges) => {
  db.close()
  const newDb = new Dexie(db.name)

  newDb.on('blocked', () => false) // Silence console warning of blocked event.

  await db.delete()
  newDb.version(2).stores({
    ...schemaChanges
  })
  return await newDb.open()
}
