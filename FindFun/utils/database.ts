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
// Example Foursquare API response: https://docs.foursquare.com/developer/reference/response-fields


export const getDBConnection = () => {
  console.log('Opening database connection');
  return SQLite.openDatabaseSync(DATABASE_NAME);
};

export async function initDatabase() {
  console.log('Initializing database');

  /////////////////////////////////////////////////////////////////
  // UNCOMMENT THIS CODE TO DELETE THE DATABASE FILE ON APP STARTUP
  // Check if the database file exists
  const dbPath = `${FileSystem.documentDirectory}SQLite/${DATABASE_NAME}`;
  const fileInfo = await FileSystem.getInfoAsync(dbPath);
  
  if (fileInfo.exists) {
    console.log('Existing database found. Deleting it.');
    await FileSystem.deleteAsync(dbPath);
  }
  /////////////////////////////////////////////////////////////////

  // Ensure the SQLite directory exists
  await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}SQLite`, { intermediates: true });

  // Open (or create) the database
  const db = await SQLite.openDatabaseSync(DATABASE_NAME);

  try {
    console.log('Creating tables');
    await db.execAsync(`
      -- Create the user's itinerary table
      CREATE TABLE IF NOT EXISTS itineraries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        date TEXT
      );

      -- Create the main events table
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fsq_id TEXT UNIQUE,
        name TEXT,
        description TEXT,
        distance INTEGER,
        email TEXT,
        fax TEXT,
        closed_bucket TEXT,
        date_closed TEXT,
        link TEXT,
        menu TEXT,
        popularity REAL,
        price INTEGER,
        rating REAL,
        store_id TEXT,
        tel TEXT,
        timezone TEXT,
        venue_reality_bucket TEXT,
        verified BOOLEAN,
        website TEXT
      );

      -- Create itinerary_events table
      CREATE TABLE IF NOT EXISTS itinerary_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        itinerary_id INTEGER,
        event_id INTEGER,
        FOREIGN KEY (itinerary_id) REFERENCES itineraries (id) ON DELETE CASCADE,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create categories table
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        category_id INTEGER,
        name TEXT,
        icon_id TEXT,
        icon_prefix TEXT,
        icon_suffix TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create chains table
      CREATE TABLE IF NOT EXISTS chains (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        chain_id TEXT,
        name TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create geocodes table
      CREATE TABLE IF NOT EXISTS geocodes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        type TEXT,
        latitude REAL,
        longitude REAL,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create hours table
      CREATE TABLE IF NOT EXISTS hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        display TEXT,
        is_local_holiday BOOLEAN,
        open_now BOOLEAN,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create regular_hours table
      CREATE TABLE IF NOT EXISTS regular_hours (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hours_id INTEGER,
        day INTEGER,
        open TEXT,
        close TEXT,
        FOREIGN KEY (hours_id) REFERENCES hours (id) ON DELETE CASCADE
      );

      -- Create location table
      CREATE TABLE IF NOT EXISTS locations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        address TEXT,
        address_extended TEXT,
        admin_region TEXT,
        census_block TEXT,
        country TEXT,
        cross_street TEXT,
        dma TEXT,
        formatted_address TEXT,
        locality TEXT,
        po_box TEXT,
        post_town TEXT,
        postcode TEXT,
        region TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create neighborhoods table
      CREATE TABLE IF NOT EXISTS neighborhoods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        location_id INTEGER,
        name TEXT,
        FOREIGN KEY (location_id) REFERENCES locations (id) ON DELETE CASCADE
      );

      -- Create photos table
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        photo_id TEXT,
        created_at TEXT,
        prefix TEXT,
        suffix TEXT,
        width INTEGER,
        height INTEGER,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create social_media table
      CREATE TABLE IF NOT EXISTS social_media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        facebook_id TEXT,
        instagram TEXT,
        twitter TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create stats table
      CREATE TABLE IF NOT EXISTS stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        total_photos INTEGER,
        total_ratings INTEGER,
        total_tips INTEGER,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create tastes table
      CREATE TABLE IF NOT EXISTS tastes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        taste TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create tips table
      CREATE TABLE IF NOT EXISTS tips (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        tip_id TEXT,
        created_at TEXT,
        text TEXT,
        url TEXT,
        lang TEXT,
        agree_count INTEGER,
        disagree_count INTEGER,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
      );

      -- Create features table
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id INTEGER,
        feature_type TEXT,
        feature_name TEXT,
        value TEXT,
        FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
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
export async function addEventToItinerary(db: SQLite.SQLiteDatabase, itineraryId: number, eventId: number) {
  const result = await db.runAsync(
    'INSERT INTO itinerary_events (itinerary_id, event_id) VALUES (?, ?)',
    [itineraryId, eventId]
  );
  return result.lastInsertRowId;
}

export async function removeEventFromItinerary(db: SQLite.SQLiteDatabase, itineraryId: number, eventId: number) {
  await db.runAsync('DELETE FROM itinerary_events WHERE itinerary_id = ? AND event_id = ?', [itineraryId, eventId]);
}

export async function getEventsInItinerary(db: SQLite.SQLiteDatabase, itineraryId: number) {
  return await db.getAllAsync(`
    SELECT e.* 
    FROM events e
    JOIN itinerary_events ie ON e.id = ie.event_id
    WHERE ie.itinerary_id = ?
  `, [itineraryId]);
}

// Foursquare functions

// New functions for handling events
export async function getEventById(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getFirstAsync('SELECT * FROM events WHERE id = ?', [eventId]);
}

export async function getEventCategories(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getAllAsync('SELECT * FROM categories WHERE event_id = ?', [eventId]);
}

export async function getEventLocation(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getFirstAsync('SELECT * FROM locations WHERE event_id = ?', [eventId]);
}

export async function getEventHours(db: SQLite.SQLiteDatabase, eventId: number) {
  const hours = await db.getFirstAsync('SELECT * FROM hours WHERE event_id = ?', [eventId]);
  if (hours) {
    hours.regular = await db.getAllAsync('SELECT * FROM regular_hours WHERE hours_id = ?', [hours.id]);
  }
  return hours;
}

export async function getEventPhotos(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getAllAsync('SELECT * FROM photos WHERE event_id = ?', [eventId]);
}

export async function getEventTips(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getAllAsync('SELECT * FROM tips WHERE event_id = ?', [eventId]);
}

export async function getEventFeatures(db: SQLite.SQLiteDatabase, eventId: number) {
  return await db.getAllAsync('SELECT * FROM features WHERE event_id = ?', [eventId]);
}

// Function to get full event data
export async function getFullEventData(db: SQLite.SQLiteDatabase, eventId: number) {
  const event = await getEventById(db, eventId);
  if (!event) return null;

  event.categories = await getEventCategories(db, eventId);
  event.location = await getEventLocation(db, eventId);
  event.hours = await getEventHours(db, eventId);
  event.photos = await getEventPhotos(db, eventId);
  event.tips = await getEventTips(db, eventId);
  event.features = await getEventFeatures(db, eventId);

  return event;
}

// Insert function for events table
export async function insertEvent(db: SQLite.SQLiteDatabase, event: any) {
  const result = await db.runAsync(`
    INSERT OR REPLACE INTO events (
      fsq_id, name, description, distance, email, fax, closed_bucket, date_closed,
      link, menu, popularity, price, rating, store_id, tel, timezone,
      venue_reality_bucket, verified, website
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    event.fsq_id, event.name, event.description, event.distance, event.email,
    event.fax, event.closed_bucket, event.date_closed, event.link, event.menu,
    event.popularity, event.price, event.rating, event.store_id, event.tel,
    event.timezone, event.venue_reality_bucket, event.verified ? 1 : 0, event.website
  ]);
  return result.lastInsertRowId;
}

export async function insertCategory(db: SQLite.SQLiteDatabase, eventId: number, category: any) {
  await db.runAsync(`
    INSERT INTO categories (event_id, category_id, name, icon_id, icon_prefix, icon_suffix)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [eventId, category.id, category.name, category.icon.id, category.icon.prefix, category.icon.suffix]);
}

export async function insertChain(db: SQLite.SQLiteDatabase, eventId: number, chain: any) {
  await db.runAsync(`
    INSERT INTO chains (event_id, chain_id, name)
    VALUES (?, ?, ?)
  `, [eventId, chain.id, chain.name]);
}

export async function insertGeocode(db: SQLite.SQLiteDatabase, eventId: number, type: string, geocode: any) {
  await db.runAsync(`
    INSERT INTO geocodes (event_id, type, latitude, longitude)
    VALUES (?, ?, ?, ?)
  `, [eventId, type, geocode.latitude, geocode.longitude]);
}

export async function insertHours(db: SQLite.SQLiteDatabase, eventId: number, hours: any) {
  await db.runAsync(`
    INSERT INTO hours (event_id, display, is_local_holiday, open_now)
    VALUES (?, ?, ?, ?)
  `, [eventId, hours.display, hours.is_local_holiday ? 1 : 0, hours.open_now ? 1 : 0]);
}

export async function insertLocation(db: SQLite.SQLiteDatabase, eventId: number, location: any) {
  await db.runAsync(`
    INSERT INTO locations (event_id, address, address_extended, admin_region, census_block, country, cross_street, dma, formatted_address, locality, po_box, post_town, postcode, region)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [eventId, location.address, location.address_extended, location.admin_region, location.census_block, location.country, location.cross_street, location.dma, location.formatted_address, location.locality, location.po_box, location.post_town, location.postcode, location.region]);
}

export async function insertPhoto(db: SQLite.SQLiteDatabase, eventId: number, photo: any) {
  await db.runAsync(`
    INSERT INTO photos (event_id, photo_id, created_at, prefix, suffix, width, height)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [eventId, photo.id, photo.created_at, photo.prefix, photo.suffix, photo.width, photo.height]);
}

export async function insertSocialMedia(db: SQLite.SQLiteDatabase, eventId: number, socialMedia: any) {
  await db.runAsync(`
    INSERT INTO social_media (event_id, facebook_id, instagram, twitter)
    VALUES (?, ?, ?, ?)
  `, [eventId, socialMedia.facebook_id, socialMedia.instagram, socialMedia.twitter]);
}

export async function insertStats(db: SQLite.SQLiteDatabase, eventId: number, stats: any) {
  await db.runAsync(`
    INSERT INTO stats (event_id, total_photos, total_ratings, total_tips)
    VALUES (?, ?, ?, ?)
  `, [eventId, stats.total_photos, stats.total_ratings, stats.total_tips]);
}

export async function insertTaste(db: SQLite.SQLiteDatabase, eventId: number, taste: any) {
  await db.runAsync(`
    INSERT INTO tastes (event_id, taste) VALUES (?, ?)
  `, [eventId, taste]);
}

export async function insertTip(db: SQLite.SQLiteDatabase, eventId: number, tip: any) {
  await db.runAsync(`
    INSERT INTO tips (event_id, tip_id, created_at, text, url, lang, agree_count, disagree_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [eventId, tip.id, tip.created_at, tip.text, tip.url, tip.lang, tip.agree_count, tip.disagree_count]);
}

export async function insertFeatures(db: SQLite.SQLiteDatabase, eventId: number, features: any) {
  await db.runAsync(`
    INSERT INTO features (event_id, feature_type, feature_name, value) VALUES (?, ?, ?, ?)
  `, [eventId, features.type, features.name, features.value]);
}

// Function to insert all data for an event
export async function insertFullEventData(db: SQLite.SQLiteDatabase, eventData: any) {
  const eventId = await insertEvent(db, eventData);
  
  for (const category of eventData.categories || []) {
    await insertCategory(db, eventId, category);
  }
  
  for (const chain of eventData.chains || []) {
    await insertChain(db, eventId, chain);
  }
  
  for (const [type, geocode] of Object.entries(eventData.geocodes || {})) {
    await insertGeocode(db, eventId, type, geocode);
  }
  
  if (eventData.hours) {
    await insertHours(db, eventId, eventData.hours);
  }
  
  if (eventData.location) {
    await insertLocation(db, eventId, eventData.location);
  }
  
  for (const photo of eventData.photos || []) {
    await insertPhoto(db, eventId, photo);
  }
  
  if (eventData.social_media) {
    await insertSocialMedia(db, eventId, eventData.social_media);
  }
  
  if (eventData.stats) {
    await insertStats(db, eventId, eventData.stats);
  }
  
  for (const taste of eventData.tastes || []) {
    await insertTaste(db, eventId, taste);
  }
  
  for (const tip of eventData.tips || []) {
    await insertTip(db, eventId, tip);
  }
  
  if (eventData.features) {
    await insertFeatures(db, eventId, eventData.features);
  }
}

// Function used by frontend to fetch events from DB
export async function getEventsFromLocalDB(db: SQLite.SQLiteDatabase): Promise<any[]> {
  try {
    // Fetch basic event data
    const events = await db.getAllAsync(`SELECT * FROM events`);

    // For each event, fetch related data
    const fullEvents = await Promise.all(events.map(async (event) => {
      const eventId = event.id;

      // Fetch categories
      event.categories = await db.getAllAsync('SELECT * FROM categories WHERE event_id = ?', [eventId]);

      // Fetch chains
      event.chains = await db.getAllAsync('SELECT * FROM chains WHERE event_id = ?', [eventId]);

      // Fetch geocodes
      event.geocodes = await db.getAllAsync('SELECT * FROM geocodes WHERE event_id = ?', [eventId]);

      // Fetch hours
      const hours = await db.getFirstAsync('SELECT * FROM hours WHERE event_id = ?', [eventId]);
      if (hours) {
        hours.regular = await db.getAllAsync('SELECT * FROM regular_hours WHERE hours_id = ?', [hours.id]);
        event.hours = hours;
      }

      // Fetch location
      event.location = await db.getFirstAsync('SELECT * FROM locations WHERE event_id = ?', [eventId]);
      if (event.location) {
        event.location.neighborhoods = await db.getAllAsync('SELECT name FROM neighborhoods WHERE location_id = ?', [event.location.id]);
      }

      // Fetch photos
      event.photos = await db.getAllAsync('SELECT * FROM photos WHERE event_id = ?', [eventId]);

      // Fetch social media
      event.social_media = await db.getFirstAsync('SELECT * FROM social_media WHERE event_id = ?', [eventId]);

      // Fetch stats
      event.stats = await db.getFirstAsync('SELECT * FROM stats WHERE event_id = ?', [eventId]);

      // Fetch tastes
      event.tastes = await db.getAllAsync('SELECT taste FROM tastes WHERE event_id = ?', [eventId]);

      // Fetch tips
      event.tips = await db.getAllAsync('SELECT * FROM tips WHERE event_id = ?', [eventId]);

      // Fetch features
      const features = await db.getAllAsync('SELECT * FROM features WHERE event_id = ?', [eventId]);
      event.features = features.reduce((acc, feature) => {
        if (!acc[feature.feature_type]) acc[feature.feature_type] = {};
        acc[feature.feature_type][feature.feature_name] = feature.value;
        return acc;
      }, {});

      return event;
    }));

    return fullEvents;
  } catch (error) {
    console.error('Error fetching events from local DB:', error);
    throw error;
  }
}

// Function used by frontend to save events to local DB
export async function saveEventsToLocalDB(db: SQLite.SQLiteDatabase, events: any[]): Promise<void> {
  try {
    await db.withTransactionAsync(async () => {
      for (const event of events) {
        // Insert main event data
        const result = await db.runAsync(
          `INSERT OR REPLACE INTO events (
            fsq_id, name, description, distance, email, fax, closed_bucket, date_closed,
            link, menu, popularity, price, rating, store_id, tel, timezone,
            venue_reality_bucket, verified, website
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            event.fsq_id, event.name, event.description, event.distance, event.email,
            event.fax, event.closed_bucket, event.date_closed, event.link, event.menu,
            event.popularity, event.price, event.rating, event.store_id, event.tel,
            event.timezone, event.venue_reality_bucket, event.verified ? 1 : 0, event.website
          ]
        );
        const eventId = result.lastInsertRowId;

        // Insert categories
        for (const category of event.categories || []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO categories (event_id, category_id, name, icon_id, icon_prefix, icon_suffix)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [eventId, category.id, category.name, category.icon?.id, category.icon?.prefix, category.icon?.suffix]
          );
        }

        // Insert chains
        for (const chain of event.chains || []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO chains (event_id, chain_id, name) VALUES (?, ?, ?)`,
            [eventId, chain.id, chain.name]
          );
        }

        // Insert geocodes
        for (const [type, geocode] of Object.entries(event.geocodes || {})) {
          await db.runAsync(
            `INSERT OR REPLACE INTO geocodes (event_id, type, latitude, longitude) VALUES (?, ?, ?, ?)`,
            [eventId, type, geocode.latitude, geocode.longitude]
          );
        }

        // Insert hours
        if (event.hours) {
          const hoursResult = await db.runAsync(
            `INSERT OR REPLACE INTO hours (event_id, display, is_local_holiday, open_now) VALUES (?, ?, ?, ?)`,
            [eventId, event.hours.display, event.hours.is_local_holiday ? 1 : 0, event.hours.open_now ? 1 : 0]
          );
          const hoursId = hoursResult.insertId;

          for (const regularHours of event.hours.regular || []) {
            await db.runAsync(
              `INSERT OR REPLACE INTO regular_hours (hours_id, day, open, close) VALUES (?, ?, ?, ?)`,
              [hoursId, regularHours.day, regularHours.open, regularHours.close]
            );
          }
        }

        // Insert location
        if (event.location) {
          const locationResult = await db.runAsync(
            `INSERT OR REPLACE INTO locations (
              event_id, address, address_extended, admin_region, census_block, country,
              cross_street, dma, formatted_address, locality, po_box, post_town, postcode, region
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              eventId, event.location.address, event.location.address_extended,
              event.location.admin_region, event.location.census_block, event.location.country,
              event.location.cross_street, event.location.dma, event.location.formatted_address,
              event.location.locality, event.location.po_box, event.location.post_town,
              event.location.postcode, event.location.region
            ]
          );
          const locationId = locationResult.insertId;

          for (const neighborhood of event.location.neighborhood || []) {
            await db.runAsync(
              `INSERT OR REPLACE INTO neighborhoods (location_id, name) VALUES (?, ?)`,
              [locationId, neighborhood]
            );
          }
        }

        // Insert photos
        for (const photo of event.photos || []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO photos (
              event_id, photo_id, created_at, prefix, suffix, width, height
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [eventId, photo.id, photo.created_at, photo.prefix, photo.suffix, photo.width, photo.height]
          );
        }

        // Insert social media
        if (event.social_media) {
          await db.runAsync(
            `INSERT OR REPLACE INTO social_media (event_id, facebook_id, instagram, twitter)
             VALUES (?, ?, ?, ?)`,
            [eventId, event.social_media.facebook_id, event.social_media.instagram, event.social_media.twitter]
          );
        }

        // Insert stats
        if (event.stats) {
          await db.runAsync(
            `INSERT OR REPLACE INTO stats (event_id, total_photos, total_ratings, total_tips)
             VALUES (?, ?, ?, ?)`,
            [eventId, event.stats.total_photos, event.stats.total_ratings, event.stats.total_tips]
          );
        }

        // Insert tastes
        for (const taste of event.tastes || []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO tastes (event_id, taste) VALUES (?, ?)`,
            [eventId, taste]
          );
        }

        // Insert tips
        for (const tip of event.tips || []) {
          await db.runAsync(
            `INSERT OR REPLACE INTO tips (
              event_id, tip_id, created_at, text, url, lang, agree_count, disagree_count
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [eventId, tip.id, tip.created_at, tip.text, tip.url, tip.lang, tip.agree_count, tip.disagree_count]
          );
        }

        // Insert features
        if (event.features) {
          for (const [featureType, featureGroup] of Object.entries(event.features)) {
            for (const [featureName, value] of Object.entries(featureGroup)) {
              await db.runAsync(
                `INSERT OR REPLACE INTO features (event_id, feature_type, feature_name, value)
                 VALUES (?, ?, ?, ?)`,
                [eventId, featureType, featureName, JSON.stringify(value)]
              );
            }
          }
        }
      }
    });

    console.log('Events saved to local database successfully');
  } catch (error) {
    console.error('Error saving events to local DB:', error);
    throw error;
  }
}