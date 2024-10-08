import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ResultsPage = () => {
    const route = useRoute();
    const { selectedActivities } = route.params; // Get the selected activities from the previous screen

    // Coordinates for mock markers (to be replaced by real data)
    const mockLocations = {
        food: [
            { latitude: 42.3601, longitude: -71.0589, label: 'Food Place 1' },
            { latitude: 42.3624, longitude: -71.0567, label: 'Food Place 2' },
        ],
        museum: [
            { latitude: 42.3634, longitude: -71.0557, label: 'Museum 1' },
            { latitude: 42.3645, longitude: -71.0545, label: 'Museum 2' },
        ],
        concerts: [
            { latitude: 42.3655, longitude: -71.0530, label: 'Concert Venue' },
        ],
    };

    // Combine selected activity locations
    const selectedLocations = [];
    selectedActivities.forEach(activity => {
        if (mockLocations[activity]) {
            selectedLocations.push(...mockLocations[activity]);
        }
    });

    return (
        <View style={styles.container}>
            {/* Google Map View - Top Half */}
            <MapView
                style={styles.map}
                initialRegion={{
                    latitude: 42.3601,
                    longitude: -71.0589,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                }}
            >
                {selectedLocations.map((location, index) => (
                    <Marker
                        key={index}
                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        title={location.label}
                    >

                    </Marker>
                ))}
            </MapView>

            {/* Results Section - Lower Half */}
            <ScrollView style={styles.resultsContainer}>
                {selectedActivities.map(activity => (
                    <View key={activity} style={styles.categoryContainer}>
                        <Text style={styles.categoryTitle}>{activity.toUpperCase()}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {mockLocations[activity].map((location, index) => (
                                <View key={index} style={styles.activityCard}>

                                    <Text style={styles.activityLabel}>{location.label}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                ))}
            </ScrollView>
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
        height: '50%', // Top half of the screen
    },
    markerImage: {
        width: 30,
        height: 30,
        borderRadius: 15,
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
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
        width: width * 0.7,
        overflow: 'hidden',
        elevation: 3,
    },
    activityImage: {
        width: '100%',
        height: 150,
    },
    activityLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        padding: 10,
    },
});

export default ResultsPage;
