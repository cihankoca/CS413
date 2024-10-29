import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, ScrollView, Text } from 'react-native';
import { fetchEvents, initDatabase, getDBConnection } from '@/utils/database';

export default function TestScreen() {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [radius, setRadius] = useState('5000');
  const [results, setResults] = useState<any[]>([]);
  const [source, setSource] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        await initDatabase();
        setDbInitialized(true);
        console.log('Database initialized successfully');
      } catch (err) {
        console.error('Error initializing database:', err);
        setError('Failed to initialize database');
      }
    };

    initDB();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        radius: parseInt(radius)
      };

      console.log('Search params:', params);
      const events = await fetchEvents(params);
      console.log(`Found ${events.length} events`);
      if (events.length > 0) {
        console.log('Sample event:', JSON.stringify(events[0], null, 2));
      }
      setResults(events);

    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Latitude (e.g., 41.8781)"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Longitude (e.g., -87.6298)"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Category ID (e.g., 13000)"
          value={categoryId}
          onChangeText={setCategoryId}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Radius in meters (default: 5000)"
          value={radius}
          onChangeText={setRadius}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Search'}
          </Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      {source && (
        <Text style={styles.source}>Data source: {source}</Text>
      )}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTitle}>{result.name || 'Unnamed Venue'}</Text>
            <Text>ID: {result.fsq_id || 'N/A'}</Text>
            <Text>Distance: {result.distance ? `${result.distance}m` : 'N/A'}</Text>
            <Text>Categories: {
              result.categories
                ? result.categories.map((c: any) => c.name).join(', ')
                : 'None'
            }</Text>
            <Text>Location: {
              result.location
                ? `${result.location.address || ''}, ${result.location.locality || ''}`
                : 'No address'
            }</Text>
            {result.geocodes && result.geocodes.main && (
              <Text>
                Coordinates: {result.geocodes.main.latitude}, {result.geocodes.main.longitude}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
  source: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  results: {
    marginTop: 20,
  },
  resultItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    gap: 5,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});