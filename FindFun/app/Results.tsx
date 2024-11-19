import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import SaveIcon from '../assets/images/save.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateSavedLocations, useSavedLocationsListener } from './SavedLocationsListener';

const { width } = Dimensions.get('window');

const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;
const Geocode_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEOENCODING_API_KEY;

const ResultsPage = () => {
    const route = useRoute();
    const { selectedActivities, city } = route.params;

    const { savedLocations, isSaved } = useSavedLocationsListener();

    const [locations, setLocations] = useState([]);
    const [cityCoordinates, setCityCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch city coordinates using Google Geocoding API
    const fetchCityCoordinates = async (cityName) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${Geocode_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'OK' && data.results.length > 0) {
                const { lat, lng } = data.results[0].geometry.location;
                setCityCoordinates({ latitude: lat, longitude: lng });
            } else {
                console.error('No results found for the city:', cityName);
            }
        } catch (error) {
            console.error('Error fetching city coordinates:', error);
        }
    };

    // Fetch data based on selected activities
    useEffect(() => {
        const fetchActivityLocations = async () => {
            setLoading(true);
            try {
                // Fetch city coordinates first
                await fetchCityCoordinates(city);

                const activityPromises = selectedActivities.map(async (activity) => {
                    const url = `https://api.foursquare.com/v3/places/search?query=${activity}&limit=5&near=${city}`;
                    const response = await fetch(url, {
                        headers: {
                            Authorization: FOURSQUARE_API_KEY,
                        },
                    });
                    const data = await response.json();

                    if (!data.results || data.results.length === 0) {
                        console.warn(`No results found for activity: ${activity}`);
                        return [];
                    }

                    const placesWithDetails = await Promise.all(data.results.map(async (place) => {
                        const detailsUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}`;
                        const detailsResponse = await fetch(detailsUrl, {
                            headers: {
                                Authorization: FOURSQUARE_API_KEY,
                            },
                        });
                        const detailsData = await detailsResponse.json();

                        return {
                            latitude: place.geocodes.main.latitude,
                            longitude: place.geocodes.main.longitude,
                            label: place.name,
                            category: activity,
                            description: detailsData.description || 'No description available.',
                            city: city, // Şehir bilgisini ekliyoruz
                        };
                    }));

                    return placesWithDetails;
                });

                const allLocations = await Promise.all(activityPromises);
                setLocations(allLocations.flat());
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLocations();
    }, [selectedActivities, city]);

    // Toggle Save/Unsave Location
    const handleToggleSave = useCallback(async (location) => {
        if (isSaved(location)) {
            await handleDeleteLocation(location);
        } else {
            await saveLocation(location);
        }
    }, [savedLocations]);

    // Save location to AsyncStorage
    const saveLocation = async (location) => {
        try {
            // Get saved locations from AsyncStorage
            const savedLocationsString = await AsyncStorage.getItem('savedLocations');
            let currentLocations = savedLocationsString ? JSON.parse(savedLocationsString) : [];

            // Add the new location
            currentLocations.push(location);

            // Save the updated locations back to AsyncStorage
            await AsyncStorage.setItem('savedLocations', JSON.stringify(currentLocations));
            await updateSavedLocations(currentLocations);
            console.log('Location saved successfully!');
        } catch (error) {
            console.error('Failed to save the location:', error);
        }
    };

    // Delete location from AsyncStorage
    const handleDeleteLocation = async (location) => {
        try {
            const savedLocationsString = await AsyncStorage.getItem('savedLocations');
            if (!savedLocationsString) {
                throw new Error("No saved locations found.");
            }
            const savedLocations = JSON.parse(savedLocationsString);
            const updatedLocations = savedLocations.filter((item) => item.label !== location.label);

            // Save the updated locations back to AsyncStorage
            await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
            await updateSavedLocations(updatedLocations);
            console.log('Location deleted successfully!');
        } catch (error) {
            console.error('Failed to delete location:', error);
        }
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#00b894" style={styles.loader} />
            ) : (
                <>
                    {cityCoordinates ? (
                        <MapView
                            style={styles.map}
                            initialRegion={{
                                latitude: cityCoordinates.latitude,
                                longitude: cityCoordinates.longitude,
                                latitudeDelta: 0.05,
                                longitudeDelta: 0.05,
                            }}
                        >
                            {locations.map((location, index) => (
                                <Marker
                                    key={index}
                                    coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                    title={location.label}
                                />
                            ))}
                        </MapView>
                    ) : (
                        <Text>Loading map...</Text>
                    )}

                    <ScrollView style={styles.resultsContainer}>
                        {selectedActivities.map((activity, activityIndex) => {
                            const filteredLocations = locations.filter(loc => loc.category === activity);

                            return (
                                <View key={activityIndex} style={styles.categoryContainer}>
                                    <Text style={styles.categoryTitle}>{activity.toUpperCase()}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {filteredLocations.length > 0 ? (
                                            filteredLocations.map((location, index) => (
                                                <View key={index} style={styles.activityCard}>
                                                    <Text style={styles.activityLabel}>{location.label}</Text>
                                                    <Text style={styles.descriptionText}>{location.description}</Text>
                                                    <TouchableOpacity onPress={() => handleToggleSave(location)}>
                                                        <Image source={SaveIcon} style={{ width: 20, height: 20, marginTop: 5, tintColor: isSaved(location) ? 'green' : 'gray' }} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        ) : (
                                            <Text style={styles.noDataText}>No data available for {activity}</Text>
                                        )}
                                    </ScrollView>
                                </View>
                            );
                        })}
                    </ScrollView>
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    map: {
        width: '100%',
        height: '50%',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        backgroundColor: '#fff',
    },
    categoryContainer: {
        marginBottom: 20,
    },
    categoryTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    activityCard: {
        marginRight: 15,
        backgroundColor: '#a4c2e0',
        borderRadius: 10,
        width: width * 0.7,
        overflow: 'hidden',
        elevation: 3,
        padding: 10,
    },
    activityLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
});

export default ResultsPage;
