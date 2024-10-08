import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated, PanResponder, ScrollView, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

const { height: screenHeight } = Dimensions.get('window');

const CityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { city } = route.params; // Get the city name passed from the previous screen

  // City descriptions
  const cityDescriptions = {
    'Boston': 'Boston is a city rich in history, known as the birthplace of the American Revolution. It boasts world-class educational institutions like Harvard and MIT, making it a hub for learning and innovation. The city features cobblestone streets and historic landmarks, such as the Freedom Trail, that give visitors a glimpse into the early history of the nation. Boston has a vibrant cultural scene with diverse neighborhoods, renowned art museums, and a passionate sports fan base. With scenic views along the Charles River and beautiful public parks like Boston Common, it offers a unique blend of old-world charm and modern energy.',
    'New York': 'New York City is a global hub of culture, entertainment, and finance, known as the city that never sleeps.',
    'Los Angeles': 'Los Angeles, home to Hollywood, is known for its Mediterranean climate and the entertainment industry.',
    'Chicago': 'Chicago is famed for its bold architecture, world-class museums, and the deep-dish pizza.',
  };

  const cityDescription = cityDescriptions[city] || 'A wonderful place to visit!';

  useEffect(() => {
    console.log('CityScreen mounted, navigation:', navigation);
  }, []);

  // Animation for pull-up tab with initial value set to 0 (bottom)
  const animation = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        if (gestureState.dy < 0) {
          animation.setValue(-gestureState.dy);
        }
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy < -100) {
          Animated.spring(animation, {
            toValue: screenHeight * 0.6, // Expand to 60% of the screen height when fully pulled up
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(animation, {
            toValue: 0, // Return to bottom position
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      {/* Fullscreen image with city name overlay */}
      <ImageBackground
        source={require('../assets/images/description.webp')}
        style={styles.imageContainer}
        resizeMode="cover"
      >
        <Animated.View
          style={[
            styles.overlay,
            {
              transform: [
                {
                  translateY: animation.interpolate({
                    inputRange: [0, screenHeight * 0.6],
                    outputRange: [0, -150], // Move up as the tab moves up
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.cityTitle}>{city}</Text>
        </Animated.View>
      </ImageBackground>

      {/* Navigation bar at the bottom */}
      <View style={styles.navBar}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Activity Choice Button */}
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.push('ActivityChoice')}
        >
          <FontAwesome name="male" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Pull-up tab for description positioned directly below the navigation bar */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.descriptionContainer,
          {
            height: animation.interpolate({
              inputRange: [0, screenHeight * 0.6],
              outputRange: [140, screenHeight * 0.6], // Dynamic height up to 60% of the screen
              extrapolate: 'clamp', // Prevent going beyond the max value
            }),
          },
        ]}
      >
        <View style={styles.pullTab}>
          <View style={styles.pullIndicator} />
          <Text style={styles.pullTabText}>Description of {city}</Text>
        </View>
        <ScrollView contentContainerStyle={styles.descriptionContent}>
          <Text style={styles.descriptionText}>{cityDescription}</Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    position: 'absolute',
  },
  cityTitle: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    backgroundColor: '#333',
    zIndex: 2,
  },
  navButton: {
    padding: 10,
    backgroundColor: '#444',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  descriptionContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
    zIndex: 1,
  },
  pullTab: {
    backgroundColor: '#eee',
    paddingVertical: 15,
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  pullIndicator: {
    width: 50,
    height: 5,
    backgroundColor: '#aaa',
    borderRadius: 3,
    marginBottom: 8,
  },
  pullTabText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  descriptionContent: {
    padding: 20,
    flexGrow: 1,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});

export default CityScreen;
