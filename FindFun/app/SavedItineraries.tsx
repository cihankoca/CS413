import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ImageBackground } from 'react-native';
import { useSavedLocationsListener, updateSavedLocations } from './SavedLocationsListener';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeleteIcon from '../assets/images/delete.png';
import BackgroundImage from '../assets/images/buildpage.png';

const SavedItineraries = () => {
    const { savedLocations } = useSavedLocationsListener();

    // Mekanları şehirlerine göre gruplandırıyoruz
    const groupedLocations = savedLocations.reduce((acc, location) => {
        if (!location.city) {
            location.city = "Unknown"; // Eğer şehir bilgisi yoksa "Unknown" olarak ayarla
        }
        if (!acc[location.city]) {
            acc[location.city] = [];
        }
        acc[location.city].push(location);
        return acc;
    }, {});

    const handleDeleteLocation = async (locationToDelete) => {
        try {
            // Belirli bir lokasyonu tüm kaydedilen lokasyonlardan kaldırıyoruz
            const updatedLocations = savedLocations.filter(
                (loc) => !(loc.city === locationToDelete.city && loc.label === locationToDelete.label)
            );

            // Yeni güncellenmiş listeyi kaydet
            await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
            await updateSavedLocations(updatedLocations);
        } catch (error) {
            console.error('Failed to delete location:', error);
        }
    };

    return (
        <ImageBackground source={BackgroundImage} style={styles.backgroundImage}>
            <View style={styles.overlay} />
            <View style={styles.container}>
                {/* Başlık kısmı */}
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Saved Itineraries</Text>
                </View>

                <ScrollView style={styles.scrollContainer}>
                    {Object.keys(groupedLocations).length > 0 ? (
                        Object.keys(groupedLocations).map((city, cityIndex) => (
                            <View key={cityIndex}>
                                <Text style={styles.cityTitle}>{city.toUpperCase()}</Text>
                                {groupedLocations[city].map((location, index) => (
                                    <View key={index} style={styles.locationCard}>
                                        <View style={styles.locationInfo}>
                                            <Text style={styles.locationLabel}>{location.label}</Text>
                                            <Text style={styles.locationDescription}>{location.description || 'No description available.'}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteLocation(location)}>
                                            <Image source={DeleteIcon} style={styles.deleteIcon} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        <Text style={styles.noDataText}>No saved locations yet.</Text>
                    )}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    headerContainer: {
        paddingVertical: 30,
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    cityTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 15,
        marginLeft: 15,
    },
    locationCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 15,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
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
        color: '#fff',
        textAlign: 'center',
        marginTop: 20,
    },
    deleteIcon: {
        width: 24,
        height: 24,
    },
});

export default SavedItineraries;
