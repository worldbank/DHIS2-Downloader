import Dexie from 'dexie'

export const dictionaryDb = new Dexie('dictionary')
export const servicesDb = new Dexie('services')
servicesDb.version(1).stores({
  services: '++id'
})

dictionaryDb.version(1).stores({
  dataElements: '++id, displayName, displayDescription',
  indicators: '++id, displayName, displayDescription, numerator, denominator',
  catOptionCombos: '++id, displayName'
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
