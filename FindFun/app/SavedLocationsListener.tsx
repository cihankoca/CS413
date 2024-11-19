import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';

export const useSavedLocationsListener = () => {
    const [savedLocations, setSavedLocations] = useState([]);

    const getSavedLocations = async () => {
        try {
            const locationsString = await AsyncStorage.getItem('savedLocations');
            const locations = locationsString ? JSON.parse(locationsString) : [];
            setSavedLocations(locations);
            DeviceEventEmitter.emit('savedLocationsChanged', locations);
        } catch (error) {
            console.error('Failed to fetch saved locations:', error);
        }
    };

    useEffect(() => {
        // İlk veri yüklemesi
        getSavedLocations();

        // Dinleyici ekleniyor
        const listener = (locations) => {
            setSavedLocations(locations);
        };
        const subscription = DeviceEventEmitter.addListener('savedLocationsChanged', listener);

        // Dinleyici temizleniyor (component unmount sırasında)
        return () => {
            subscription.remove(); // Dinleyici kaldırılıyor
        };
    }, []);

    const isSaved = (location) => {
        if (!savedLocations) {
            return false;
        }
        return savedLocations.some((savedLocation) => savedLocation.label === location.label);
    };

    return { savedLocations, isSaved };
};

export const updateSavedLocations = async (newLocations) => {
    try {
        await AsyncStorage.setItem('savedLocations', JSON.stringify(newLocations));
        DeviceEventEmitter.emit('savedLocationsChanged', newLocations);
    } catch (error) {
        console.error('Failed to update saved locations:', error);
    }
};
