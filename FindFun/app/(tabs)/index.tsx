import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';


const API_KEY = ''


const WelcomeScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');


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
    



    const base_URL = 'https://api.foursquare.com/v3/places/search';
    var final_URL = 'finalURL';



    //if the variable is active, make it like these below:
    var query = '?query='; //A string to be matched against all content for this place, including but not limited to venue name, category, telephone number, taste, and tips.
    //^ if the user wants to just ask for anything. have not tested enough yet. 
    
    var ll = '&ll=';
    //^ should just be current location lat long (unless user changes location manually)
   
    var radius = '&radius=';  
    //^meter radius from ll. we can automatically resize for good results maybe?

    var categories = '&categories='; //Filters the response and returns FSQ Places matching the specified categories. Supports multiple Category IDs, separated by commas.
    //^probably most important. order doesnt seem to matter, so as user requests more categories, add it here. should be finite number to be programmed in
    
    var fields = '&fields=';
    //^ should be hardcoded only once. We dont need *all* of the info probably. can customize for specific use cases if we want.

    var min_price = '&min_price=';
    var max_price = '&max_price=';
    //^just append number to the end
    var open_now = '&open_now='; 
    //^probably always true?
    
    var near = '&near=';
    //^can put city name? maybe dont bother and just use lat long?

    var sort = '&sort=';
    //^Specifies the order in which results are listed. Possible values are: relevance (default), rating, distance

    var limit = '&limit=';
    //^limit the number of results

    //if the variable is not asked for by search, it can (should?) just be empty:
    var query = ''; 
    var ll = '';
    var radius = '';  
    var categories = ''; 
    var fields = '';
    var min_price = '';
    var max_price = '';
    var open_now = '';
    var near = '';
    var sort = '';
    var limit = '';



    var exampleURL = 'https://api.foursquare.com/v3/places/search?query=query&ll=41.8781%2C-87.6298&radius=10&categories=29348&fields=social_media%2C%20website&min_price=1&max_price=4&open_now=true&near=Chicago%2C%20IL&sort=RELEVANCE&limit=10'

    final_URL = base_URL + query + ll + radius + categories + fields + min_price + max_price + open_now + near + sort + limit;





    final_URL = 'https://api.foursquare.com/v3/places/search?near=Chicago%2C%20IL&sort=RELEVANCE&'; //test search that works guarantee


    const response = await fetch(final_URL, options)
      .then(response => response.json())
      .then(response => console.log(response))
      .catch(err => console.error(err));

      


    } catch (error) {

      console.error('Error fetching data from Foursquare:', error);

    }

  }

  useEffect(() => {

    foursquareTest();


  },[]);

  return (
    <ImageBackground
         source={require('../../assets/images/pexels-rickyrecap-1563256.png')}
         style={styles.background}>
      <View style={styles.overlay}>
        <Text style={styles.title}>FindFun</Text>

        <TouchableOpacity style={styles.button} onPress={() => {  }}>
          <Text style={styles.buttonText}>Enable Location Sharing</Text>
        </TouchableOpacity>

        <View style={styles.container}>
              <TextInput placeholderTextColor="#ccc" style={styles.searchField}
                placeholder="Search by City..."
                value={searchQuery}
                onChangeText={(text) => setSearchQuery(text)}/>
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
});
export default WelcomeScreen;


