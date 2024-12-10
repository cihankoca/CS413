import React, { useEffect, useState, useCallback, useRef } from 'react';
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
    const { selectedActivities, city, latitude, longitude } = route.params; // Pull the latitude and longitude from route params
    const [selectedLocation, setSelectedLocation] = useState(null);

    const { savedLocations, isSaved } = useSavedLocationsListener();

    const [locations, setLocations] = useState([]);
    const [cityCoordinates, setCityCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const [markers, setMarkers] = useState([]);
    const markerRefs = useRef({});

    const [limit, setLimit] = useState(5);
    const [radius, setRadius] = useState(22000);
    let curLat = latitude;
    let curLong = longitude;
    const [region, setRegion] = useState({
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    const fetchActivityLocations = async () => {
        setLoading(true);
        try {
            const activityPromises = selectedActivities.map(async (activity) => {
                const url = `https://api.foursquare.com/v3/places/search?query=${activity}&ll=${curLat}%2C${curLong}&radius=${radius}&exclude_all_chains=true&sort=DISTANCE&limit=${limit}`
                //const url = `https://api.foursquare.com/v3/places/search?query=${activity}&radius=${radius}&limit=${limit}&near=${city}`;
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

                    // Ensure coordinates are numbers
                    const lat = Number(place.geocodes.main.latitude);
                    const lng = Number(place.geocodes.main.longitude);

                    return {
                        latitude: lat,
                        longitude: lng,
                        label: place.name,
                        category: activity,
                        description: detailsData.description || 'No description available.',
                        address: detailsData.location?.formatted_address || 'Address not available',
                        categories: detailsData.categories?.map(cat => cat.name) || [],
                        hours: detailsData.closed_bucket || 'Hours not available',
                    };
                }));

                return placesWithDetails;
            });

            const allLocations = await Promise.all(activityPromises);
            const flattenedLocations = allLocations.flat().reverse();
            setLocations(flattenedLocations);

            const newMarkers = flattenedLocations.map(location => ({
                coordinate: {
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude)
                },
                title: location.label,
                isSelected: selectedLocation?.label === location.label
            }));

            setMarkers(newMarkers);

            // Redraw all markers after a short delay
            setTimeout(() => {
                Object.values(markerRefs.current).forEach(ref => {
                    if (ref) {
                        ref.redraw();
                    }
                });
            }, 100);

        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreLocations = async (activity) => {
        try {
            const url = `https://api.foursquare.com/v3/places/search?query=${activity}&ll=${curLat}%2C${curLong}&radius=${radius}&exclude_all_chains=true&sort=DISTANCE&limit=${limit}`;
            const response = await fetch(url, {
                headers: {
                    Authorization: FOURSQUARE_API_KEY,
                },
            });
            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                console.warn(`No additional results found for activity: ${activity}`);
                return [];
            }

            const newPlacesWithDetails = await Promise.all(data.results.map(async (place) => {
                const detailsUrl = `https://api.foursquare.com/v3/places/${place.fsq_id}`;
                const detailsResponse = await fetch(detailsUrl, {
                    headers: {
                        Authorization: FOURSQUARE_API_KEY,
                    },
                });
                const detailsData = await detailsResponse.json();

                return {
                    latitude: Number(place.geocodes.main.latitude),
                    longitude: Number(place.geocodes.main.longitude),
                    label: place.name,
                    category: activity,
                    description: detailsData.description || 'No description available.',
                    address: detailsData.location?.formatted_address || 'Address not available',
                    categories: detailsData.categories?.map(cat => cat.name) || [],
                    hours: detailsData.closed_bucket || 'Hours not available',
                };
            }));

            // Filter out any locations that we already have
            const existingLabels = locations.map(loc => loc.label);
            const uniqueNewLocations = newPlacesWithDetails.filter(
                loc => !existingLabels.includes(loc.label)
            );

            // Update locations and markers states by appending new data
            setLocations(prevLocations => [...prevLocations, ...uniqueNewLocations]);

            // Create new markers only for the new locations
            const newMarkers = uniqueNewLocations.map(location => ({
                coordinate: {
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude)
                },
                title: location.label,
                isSelected: selectedLocation?.label === location.label
            }));

            setMarkers(prevMarkers => [...prevMarkers, ...newMarkers]);

        } catch (error) {
            console.error('Error fetching more locations:', error);
        }
    };

    useEffect(() => {


        fetchActivityLocations();
    }, [selectedActivities, city]);

    useEffect(() => {
        console.log('Current markers:', markers); // Debug log
    }, [markers]);

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

    const handleLocationSelect = (location) => {
        setSelectedLocation(location);

        // Update markers to reflect new selection
        setMarkers(prevMarkers =>
            prevMarkers.map(marker => ({
                ...marker,
                isSelected: marker.title === location.label
            }))
        );

        // Animate map to selected location
        const newRegion = {
            latitude: parseFloat(location.latitude),
            longitude: parseFloat(location.longitude),
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
        };

        mapRef.current?.animateToRegion(newRegion, 1000);
    };

    const loadMoreResults = (activity) => {

        console.log(activity);
        console.log(radius);
        console.log(limit);



        // I could adjust latitude and longitude as well
        setRadius((prevRadius) => prevRadius + 3000);
        setLimit((prevLimit) => prevLimit + 5);
        fetchMoreLocations(activity);



    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#00b894" style={styles.loader} />
            ) : (
                <>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={region}
                    >
                        {markers.map((marker, index) => (
                            <Marker
                                key={`marker-${index}-${marker.title}`}
                                coordinate={marker.coordinate}
                                title={marker.title}
                                pinColor={marker.isSelected ? '#00b894' : 'red'}
                                tracksViewChanges={true}
                            />
                        ))}
                    </MapView>

                    <ScrollView style={styles.resultsContainer}>
                        {selectedActivities.map((activity, activityIndex) => {
                            const filteredLocations = locations.filter(loc => loc.category === activity);

                            return (
                                <View key={activityIndex} style={styles.categoryContainer}>
                                    <Text style={styles.categoryTitle}>{activity.toUpperCase()}</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        {filteredLocations.length > 0 ? (
                                            filteredLocations.map((location, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    style={[
                                                        styles.activityCard,
                                                        selectedLocation?.label === location.label && styles.selectedCard
                                                    ]}
                                                    onPress={() => handleLocationSelect(location)}
                                                >
                                                    <Text style={styles.activityLabel}>{location.label}</Text>
                                                    <View style={styles.categoryTags}>
                                                        {location.categories.map((category, idx) => (
                                                            <Text key={idx} style={styles.categoryTag}>
                                                                {category}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                    <Text style={styles.addressText}>{location.address}</Text>
                                                    <Text style={styles.hoursText}>
                                                        Status: {location.hours.replace('Likely', ' Likely ')}
                                                    </Text>
                                                    {location.description !== 'No description available.' && (
                                                        <Text style={styles.descriptionText} numberOfLines={3}>
                                                            {location.description}
                                                        </Text>
                                                    )}
                                                    <TouchableOpacity
                                                        onPress={(e) => {
                                                            e.stopPropagation(); // Prevent triggering parent TouchableOpacity
                                                            handleToggleSave(location);
                                                        }}
                                                    >
                                                        <Image
                                                            source={SaveIcon}
                                                            style={{ width: 20, height: 20, marginTop: 5 }}
                                                        />
                                                    </TouchableOpacity>
                                                </TouchableOpacity>
                                            ))
                                        ) : (
                                            <Text style={styles.noDataText}>No data available for {activity}</Text>
                                        )}
                                        <TouchableOpacity
                                            style={styles.loadMoreButton}
                                            onPress={() => loadMoreResults(activity)}
                                        >
                                            <Text style={styles.loadMoreText}>Load More</Text>
                                        </TouchableOpacity>
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
        height: '50%',
        width: '100%',
    },
    mapContainer: {
        width: '100%',
        height: '50%',
        position: 'relative',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    resultsContainer: {
        flex: 1,
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
        backgroundColor: '#ffffff',
        borderRadius: 12,
        width: width * 0.8,
        overflow: 'hidden',
        elevation: 3,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    activityLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        marginLeft: 10,
    },
    categoryTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    categoryTag: {
        fontSize: 12,
        color: '#ffffff',
        backgroundColor: '#00b894',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 4,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    hoursText: {
        fontSize: 14,
        color: '#00b894',
        marginBottom: 8,
        fontWeight: '500',
    },
    selectedCard: {
        borderColor: '#00b894',
        borderWidth: 2,
    },
    loadMoreButton: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: 100,
        marginLeft: 10,
        borderRadius: 10,
        backgroundColor: '#dfe6e9',
    },
    loadMoreText: {
        fontSize: 14,
        color: '#2d3436',
        fontWeight: 'bold',
    },
});

export default ResultsPage;
