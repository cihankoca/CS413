import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

const ResultsPage = () => {
    const route = useRoute();
    const { selectedActivities, city, latitude, longitude } = route.params; // Pull the latitude and longitude from route params

    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivityLocations = async () => {
            try {
                const activityPromises = selectedActivities.map(async (activity) => {
                    const url = `https://api.foursquare.com/v3/places/search?query=${activity}&limit=5&near=${city}`;
                    console.log(`Fetching data for activity: ${activity} in city: ${city}`);

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
                            address: detailsData.location?.formatted_address || 'Address not available',
                            categories: detailsData.categories?.map(cat => cat.name) || [],
                            hours: detailsData.closed_bucket || 'Hours not available',
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

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#00b894" style={styles.loader} />
            ) : (
                <>
                    {/* Map Section - Top Half */}
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: latitude,
                            longitude: longitude,
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

                    {/* Results Section - Lower Half */}
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
});

export default ResultsPage;
