import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Boston'];

const WelcomeScreen = () => {
  const navigation = useNavigation(); // Use navigation hook
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);

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

        <TouchableOpacity style={styles.button} onPress={() => { }}>
          <Text style={styles.buttonText}>Enable Location Sharing</Text>
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
