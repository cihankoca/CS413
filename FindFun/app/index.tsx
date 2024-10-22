import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as SQLite from 'expo-sqlite';

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEOENCODING_API_KEY;
const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);
  const [location, setLocation] = useState(null);
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Retain Foursquare API Check
  async function foursquareTest() {
    try {
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: FOURSQUARE_API_KEY
        }
      };

      const final_URL = 'https://api.foursquare.com/v3/places/search?near=Chicago%2C%20IL&sort=RELEVANCE&'; // Test search
      const response = await fetch(final_URL, options);
      const data = await response.json();
      console.log(data); // Log Foursquare API response

    } catch (error) {
      console.error('Error fetching data from Foursquare:', error);
    }
  }

  useEffect(() => {
    foursquareTest(); // Run Foursquare API test
  }, []);

  const handleShareLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      return;
    }
    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation);
  };

  // Fetch cities using Google Geocoding API
  const handleSearch = async (text) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setFilteredCities([]);
      return;
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(text)}&key=${GEOCODING_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK') {
        const cities = data.results.map(result => {
          const cityComponent = result.address_components.find(comp => comp.types.includes('locality'));
          const stateComponent = result.address_components.find(comp => comp.types.includes('administrative_area_level_1'));

          if (cityComponent && stateComponent) {
            return {
              city: cityComponent.long_name,
              state: stateComponent.short_name,
            };
          }
          return null;
        }).filter(city => city); // Filter out any null results

        setFilteredCities(cities);
      } else {
        setFilteredCities([]);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city) => {
    setSearchQuery(`${city.city}, ${city.state}`);
    setFilteredCities([]);
    navigation.navigate('CityDescription', { city: city.city });
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
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.dropdownItem} onPress={() => handleCitySelect(item)}>
                  <Text style={styles.dropdownText}>{item.city}, {item.state}</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

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
  dropdown: {
    width: '80%',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
    maxHeight: 150,
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
