import Dexie from 'dexie'

export const db = new Dexie('myDatabase')
db.version(1).stores({
  services: '++id'
})

export const changeSchema = async (db, schemaChanges) => {
  db.close()
  const newDb = new Dexie(db.name)

  newDb.on('blocked', () => false) // Silence console warning of blocked event.

  await db.delete()
  newDb.version(1).stores(schemaChanges)
  return await newDb.open()
}
