import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, TextInput, FlatList } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { initDatabase, addItinerary, addEvent, getItineraries, getEventsForItinerary } from '@/utils/database';
import * as SQLite from 'expo-sqlite';

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Boston'];


type LocationObject = {
  coords: {
    latitude: number;
    longitude: number;
  };
};

const API_KEY = '='//zach has this

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [location, setLocation] = useState<LocationObject | null>(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  async function foursquareTest()
  {
    try {


    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: API_KEY
      }

    };
    
    var final_URL = 'https://api.foursquare.com/v3/places/search?near=Chicago%2C%20IL&sort=RELEVANCE&'; //test search that works guarantee


    const response = await fetch(final_URL, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

    } catch (error) {

      console.error('Error fetching data from Foursquare:', error);

    }

  }


  useEffect(() => {
    const setupDatabase = async () => {
      const database = await initDatabase();
      setDb(database);
    };
    setupDatabase();
  }, []);

  useEffect(() => {

    foursquareTest(); //just test api call

  },[]);


  const handleTestDatabase = async () => {
    if (db) {
      try {
        // Get current date and time
        const now = new Date();
        const formattedDate = now.toISOString().split('T')[0];
        const formattedTime = now.toTimeString().split(' ')[0];

        // Add a test itinerary
        const itineraryId = await addItinerary(db, 'Test Itinerary', formattedDate);
        
        // Add a test event to the itinerary
        await addEvent(db, itineraryId as number, 'Test Event', formattedDate, formattedTime, 40.7128, -74.0060, 'New York City');

        // Retrieve all itineraries
        const itineraries = await getItineraries(db);
        
        // Retrieve events for the test itinerary
        const events = await getEventsForItinerary(db, itineraryId as number);

        // Display the test results
        setTestResult(
          `Database test successful!\n` +
          `Created itinerary: ${itineraries[0].name} (ID: ${itineraries[0].id})\n` +
          `Added event: ${events[0].name} at ${events[0].time}`
        );
      } catch (error) {
        console.error('Error testing database:', error);
        setTestResult('Error testing database');
      }
    }
  };

  const handleShareLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation as LocationObject);
  };

  // Filter cities based on user input
    const handleSearch = (text) => {
      setSearchQuery(text);
      if (text) {
        const filtered = cities.filter(city =>
          city.toLowerCase().startsWith(text.toLowerCase())
        );
        setFilteredCities(filtered);
      } else {
        setFilteredCities([]);
      }
    };

// Handle city selection
  const handleCitySelect = (city) => {
    setSearchQuery(city);
    setFilteredCities([]);

    // Navigate to the City screen and pass the city name as a parameter
    // Add this line to navigate to 'city-description'
    navigation.navigate('CityDescription', { city });

  };

  return (
    <ImageBackground
      source={require('../assets/images/pexels-rickyrecap-1563256.png')}
      style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>FindFun</Text>

        <TouchableOpacity style={styles.button} onPress={handleShareLocation}>
          <Text style={styles.buttonText}>
            {location
              ? `Lat: ${location.coords.latitude.toFixed(4)}, Long: ${location.coords.longitude.toFixed(4)}`
              : 'Share location'}
          </Text>
        </TouchableOpacity>


        <View style={styles.container}>
                  <TextInput
                    placeholderTextColor="#ccc"
                    style={styles.searchField}
                    placeholder="Search by City..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                  />
                  {filteredCities.length > 0 && (
                    <FlatList
                      style={styles.dropdown}
                      data={filteredCities}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity style={styles.dropdownItem} onPress={() => handleCitySelect(item)}>
                          <Text style={styles.dropdownText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                </View>
                <TouchableOpacity style={styles.button} onPress={handleTestDatabase}>
          <Text style={styles.buttonText}>Test Database</Text>
        </TouchableOpacity>

        {testResult && (
          <View style={styles.eventContainer}>
            <Text style={styles.eventText}>{testResult}</Text>
          </View>
        )}

      </View>

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 100,
  },
  button: {
    backgroundColor: '#5465FF',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  bottomText: {
    color: 'white',
    fontSize: 18,
  },
  searchField: {
    width: '80%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    fontSize: 16,
    color: 'white',
    backgroundColor: '#333',
  },
  eventContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  eventText: {
    color: 'black',
    fontSize: 16,
  },
  dropdown: {
      width: '80%',
      backgroundColor: '#fff',
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 10,
      marginTop: 5,
      maxHeight: 150, // Limit height of dropdown
    },
    dropdownItem: {
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
    },
    dropdownText: {
      fontSize: 16,
      color: '#333',
    },
});
export default WelcomeScreen;


