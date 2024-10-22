import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, TextInput, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Boston'];


//Don't commit API keys until we get them as environment variables
const PLACES_API_KEY = 'fsq33xss/5S2efhJGAbF3I194EWy2+VuqgpTPFoZ4NcbjQY='//zach has this (also pinned in discord)
const OPENAI_API_KEY = '' //cole has this (also pinned in discord)
const Geocode_API_KEY = '' //zach has this 

//we can use this to basically make our own categories and name them whatever. When user does a search, come here and splice the respective values together with a comma between them and add it to the API request
const categoryMap: { [key: string]: string } = {  //took the keys from Chihan's work in the UI. Probably want to refine
  'Food': '13065',
  'Museum': '10027',
  'Adventure': '',  //bunch of stuff
  'Concert': '', 
  //'Park': '',        //should just be part of outdoor
  'Outdoor': '16000',  //landmark/outdoor. might have stuff we dont want (lol hill)
  'Theater': '',           //does this mean movies or live shows? If live shows, it should be with concert somehow
  'Nightlife': '10008,10032,10033,10052,13003',  //casino,nightclub,pachinko,strip club, bar, 


  // Can Add more categories and their Foursquare IDs
}; 

interface SearchParams { //basically a struct for search parameters. create one and change it as user messes with options/search. Then pass it to the function and a search will be made with these params
  query?: string;
  ll?: string; // latitude,longitude
  radius?: number;
  categories?: string; // comma-separated category IDs. 
  fields?: string; // comma-separated fields
  min_price?: number;
  max_price?: number;
  open_now?: boolean;
  near?: string;
  sort?: string;
  limit?: number;
}


const WelcomeScreen = () => {
  const navigation = useNavigation(); // Use navigation hook
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCities, setFilteredCities] = useState([]);



  async function placesSearch(params: SearchParams)
  {
    try {


    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: PLACES_API_KEY
      }

    };

    
    const base_URL = 'https://api.foursquare.com/v3/places/search';

    const urlParams = new URLSearchParams();

    if (params.query) urlParams.append('query', params.query);
    if (params.ll) urlParams.append('ll', params.ll);
    if (params.radius) urlParams.append('radius', params.radius.toString());
    if (params.categories) urlParams.append('categories', params.categories);
    if (params.fields) urlParams.append('fields', params.fields);
    if (params.min_price !== undefined) urlParams.append('min_price', params.min_price.toString());
    if (params.max_price !== undefined) urlParams.append('max_price', params.max_price.toString());
    if (params.open_now) urlParams.append('open_now', 'true');
    if (params.near) urlParams.append('near', params.near);
    if (params.sort) urlParams.append('sort', params.sort);
    if (params.limit) urlParams.append('limit', params.limit.toString());


    const final_URL = `${base_URL}?${urlParams.toString()}`;

    const response = await fetch(final_URL, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

    } catch (error) {

      console.error('Error fetching data from Foursquare:', error);

    }

  }


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

  useEffect(() => {

    placesSearch({
      query: 'nightlife',
      ll: '41.8781,-87.6298',
      radius: 1000,
      categories: '13065,13032',
      open_now: true,
      limit: 10,
    });  //an example usage. categories section can use the interface for our own categories. You shoudlnt have to worry about inputting raw category codes...

    



  },[]);



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
