import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

const DATABASE_NAME = 'FindFun.db';

// Documentation here: https://docs.expo.dev/versions/latest/sdk/sqlite/`
/*
 // `runAsync()` is useful when you want to execute some write operations.
const result = await db.runAsync('INSERT INTO test (value, intValue) VALUES (?, ?)', 'aaa', 100);
console.log(result.lastInsertRowId, result.changes);
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', 999, 'aaa'); // Binding unnamed parameters from variadic arguments
await db.runAsync('UPDATE test SET intValue = ? WHERE value = ?', [999, 'aaa']); // Binding unnamed parameters from array
await db.runAsync('DELETE FROM test WHERE value = $value', { $value: 'aaa' }); // Binding named parameters from object

// `getFirstAsync()` is useful when you want to get a single row from the database.
const firstRow = await db.getFirstAsync('SELECT * FROM test');
console.log(firstRow.id, firstRow.value, firstRow.intValue);

// `getAllAsync()` is useful when you want to get all results as an array of objects.
const allRows = await db.getAllAsync('SELECT * FROM test');
for (const row of allRows) {
  console.log(row.id, row.value, row.intValue);
 */
export const getDBConnection = () => {
  console.log('Opening database connection');
  return SQLite.openDatabaseSync(DATABASE_NAME);
};

export async function initDatabase() {
  console.log('Initializing database');

  // UNCOMMENT THIS CODE TO DELETE THE DATABASE FILE
  //// Check if the database file exists
  //const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
  //const fileInfo = await FileSystem.getInfoAsync(dbPath);
  //
  //if (fileInfo.exists) {
  //  console.log('Existing database found. Deleting it.');
  //  await FileSystem.deleteAsync(dbPath);
  //}

  // Open (or create) the database
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);

  try {
    console.log('Creating tables');
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        date TEXT
      );

      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itinerary_id INTEGER,
        name TEXT,
        date TEXT,
        time TEXT,
        latitude REAL,
        longitude REAL,
        address TEXT,
        FOREIGN KEY (itinerary_id) REFERENCES itineraries (id) ON DELETE CASCADE
      );
    `);
    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }

  return db;
}

// Itinerary functions
export async function addItinerary(db: SQLite.SQLiteDatabase, name: string, date: string) {
  const result = await db.runAsync(
    'INSERT INTO itineraries (name, date) VALUES (?, ?)',
    [name, date]
  );
  return result.lastInsertRowId;
}

export async function editItinerary(db: SQLite.SQLiteDatabase, id: number, name: string, date: string) {
  await db.runAsync(
    'UPDATE itineraries SET name = ?, date = ? WHERE id = ?',
    [name, date, id]
  );
}

export async function removeItinerary(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM itineraries WHERE id = ?', [id]);
}

export async function getItineraries(db: SQLite.SQLiteDatabase) {
  return await db.getAllAsync('SELECT * FROM itineraries');
}

// Event functions
export async function addEvent(db: SQLite.SQLiteDatabase, itineraryId: number, name: string, date: string, time: string, latitude: number, longitude: number, address: string) {
  const result = await db.runAsync(
    'INSERT INTO events (itinerary_id, name, date, time, latitude, longitude, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [itineraryId, name, date, time, latitude, longitude, address]
  );
  return result.lastInsertRowId;
}

export async function editEvent(db: SQLite.SQLiteDatabase, id: number, name: string, date: string, time: string, latitude: number, longitude: number, address: string) {
  await db.runAsync(
    'UPDATE events SET name = ?, date = ?, time = ?, latitude = ?, longitude = ?, address = ? WHERE id = ?',
    [name, date, time, latitude, longitude, address, id]
  );
}

export async function removeEvent(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM events WHERE id = ?', [id]);
}

export async function getEventsForItinerary(db: SQLite.SQLiteDatabase, itineraryId: number) {
  return await db.getAllAsync('SELECT * FROM events WHERE itinerary_id = ?', [itineraryId]);
}