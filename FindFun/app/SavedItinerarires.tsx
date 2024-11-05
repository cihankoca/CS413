import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeleteIcon from '../assets/images/delete.png';

const SavedItineraries = () => {
    const [savedLocations, setSavedLocations] = useState([]);

    useEffect(() => {
        const fetchSavedLocations = async () => {
            try {
                const locations = await AsyncStorage.getItem('savedLocations');
                if (locations) {
                    setSavedLocations(JSON.parse(locations));
                }
            } catch (error) {
                console.error('Failed to fetch saved locations:', error);
            }
        };

        fetchSavedLocations();
    }, []);

    const handleDeleteLocation = async (index) => {
        try {
            const updatedLocations = savedLocations.filter((_, i) => i !== index);
            setSavedLocations(updatedLocations);
            await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
        } catch (error) {
            console.error('Failed to delete location:', error);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>SAVED ITINERARIES</Text>
            {savedLocations.length > 0 ? (
                savedLocations.map((location, index) => (
                    <View key={index} style={styles.locationCard}>
                        <View style={styles.locationInfo}>
                            <Text style={styles.locationLabel}>{location.label}</Text>
                            <Text style={styles.locationDescription}>{location.description || 'No description available.'}</Text>
                        </View>
                        <TouchableOpacity onPress={() => handleDeleteLocation(index)}>
                            <Image source={DeleteIcon} style={styles.deleteIcon} />
                        </TouchableOpacity>
                    </View>
                ))
            ) : (
                <Text style={styles.noDataText}>No saved locations yet.</Text>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingTop: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginVertical: 20,
        backgroundColor: '#FCEAEA',
        padding: 10,
    },
    locationCard: {
        backgroundColor: '#E5F7FF',
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    locationInfo: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    locationDescription: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    deleteIcon: {
        width: 24,
        height: 24,
    },
});

export default SavedItineraries;


