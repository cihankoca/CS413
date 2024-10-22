import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Animated, PanResponder, ScrollView, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for the navigation route params
type RootStackParamList = {
  CityScreen: { city: string };
  ActivityChoice: undefined; // ActivityChoice expects no parameters
};

// Define navigation type
type CityScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'CityScreen'
>;

type CityScreenRouteProp = RouteProp<RootStackParamList, 'CityScreen'>;

const { height: screenHeight } = Dimensions.get('window');

const CityScreen = () => {
  const navigation = useNavigation<CityScreenNavigationProp>();
  const route = useRoute<CityScreenRouteProp>();
  const { city } = route.params;

  // City descriptions
  const cityDescriptions: { [key: string]: string } = {
    'Boston': 'Boston is a city rich in history...',
    'New York': 'New York City is a global hub...',
    'Los Angeles': 'Los Angeles, home to Hollywood...',
    'Chicago': 'Chicago is famed for its bold architecture...',
  };

  const cityDescription = cityDescriptions[city] || 'A wonderful place to visit!';

  useEffect(() => {
    console.log('CityScreen mounted, navigation:', navigation);
  }, [navigation]);

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
            toValue: screenHeight * 0.6,
            useNativeDriver: false,
          }).start();
        } else {
          Animated.spring(animation, {
            toValue: 0,
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
          onPress={() => navigation.navigate('ActivityChoice')}
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
              outputRange: [140, screenHeight * 0.6],
              extrapolate: 'clamp',
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
