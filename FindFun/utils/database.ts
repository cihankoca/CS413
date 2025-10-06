// In-memory dummy data store (replaces SQLite)
interface Itinerary {
  id: number;
  name: string;
  date: string;
}

interface Event {
  id: number;
  itinerary_id: number;
  name: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  address: string;
}

// In-memory storage
let itineraries: Itinerary[] = [];
let events: Event[] = [];
let nextItineraryId = 1;
let nextEventId = 1;

// Mock database connection
export const getDBConnection = () => {
  console.log('Using in-memory dummy data (no database connection)');
  return null;
};

export async function initDatabase() {
  console.log('Initializing in-memory dummy data store');

  // Initialize with some dummy data
  itineraries = [
    { id: 1, name: 'Summer Vacation', date: '2024-07-15' },
    { id: 2, name: 'Weekend Getaway', date: '2024-08-20' }
  ];

  events = [
    { id: 1, itinerary_id: 1, name: 'Beach Day', date: '2024-07-15', time: '10:00:00', latitude: 40.7128, longitude: -74.0060, address: 'New York Beach' },
    { id: 2, itinerary_id: 1, name: 'Dinner at Restaurant', date: '2024-07-15', time: '19:00:00', latitude: 40.7580, longitude: -73.9855, address: 'Times Square, NY' },
    { id: 3, itinerary_id: 2, name: 'Museum Visit', date: '2024-08-20', time: '14:00:00', latitude: 40.7794, longitude: -73.9632, address: 'Metropolitan Museum' }
  ];

  nextItineraryId = 3;
  nextEventId = 4;

  console.log('Dummy data initialized successfully');
  return null; // Return null instead of db object
}

// Itinerary functions
export async function addItinerary(db: any, name: string, date: string) {
  const newItinerary = {
    id: nextItineraryId++,
    name,
    date
  };
  itineraries.push(newItinerary);
  console.log('Added itinerary:', newItinerary);
  return newItinerary.id;
}

export async function editItinerary(db: any, id: number, name: string, date: string) {
  const index = itineraries.findIndex(i => i.id === id);
  if (index !== -1) {
    itineraries[index] = { id, name, date };
    console.log('Updated itinerary:', itineraries[index]);
  }
}

export async function removeItinerary(db: any, id: number) {
  itineraries = itineraries.filter(i => i.id !== id);
  events = events.filter(e => e.itinerary_id !== id);
  console.log('Removed itinerary:', id);
}

export async function getItineraries(db: any) {
  console.log('Getting all itineraries:', itineraries);
  return itineraries;
}

// Event functions
export async function addEvent(db: any, itineraryId: number, name: string, date: string, time: string, latitude: number, longitude: number, address: string) {
  const newEvent = {
    id: nextEventId++,
    itinerary_id: itineraryId,
    name,
    date,
    time,
    latitude,
    longitude,
    address
  };
  events.push(newEvent);
  console.log('Added event:', newEvent);
  return newEvent.id;
}

export async function editEvent(db: any, id: number, name: string, date: string, time: string, latitude: number, longitude: number, address: string) {
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], name, date, time, latitude, longitude, address };
    console.log('Updated event:', events[index]);
  }
}

export async function removeEvent(db: any, id: number) {
  events = events.filter(e => e.id !== id);
  console.log('Removed event:', id);
}

export async function getEventsForItinerary(db: any, itineraryId: number) {
  const filteredEvents = events.filter(e => e.itinerary_id === itineraryId);
  console.log('Getting events for itinerary', itineraryId, ':', filteredEvents);
  return filteredEvents;
}