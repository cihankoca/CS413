import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SavedLocation {
    label: string;
    description: string;
    address: string;
    rating: string;
    hours: string;
    time: string;
    city: string;
}

export function useSavedLocationsListener() {
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

    const loadSavedLocations = async () => {
        try {
            const savedData = await AsyncStorage.getItem('savedLocations');
            setSavedLocations(savedData ? JSON.parse(savedData) : []);
        } catch (error) {
            console.error('Error loading saved locations:', error);
            setSavedLocations([]);
        }
    };

    useEffect(() => {
        loadSavedLocations();
    }, []);

    const updateLocations = async (newLocations: SavedLocation[]) => {
        try {
            await AsyncStorage.setItem('savedLocations', JSON.stringify(newLocations));
            setSavedLocations(newLocations);
        } catch (error) {
            console.error('Error saving locations:', error);
        }
    };

    return {
        savedLocations,
        updateLocations,
    };
}

// Export the update function separately if needed
export async function updateSavedLocations(locations: SavedLocation[]) {
    try {
        await AsyncStorage.setItem('savedLocations', JSON.stringify(locations));
    } catch (error) {
        console.error('Error saving locations:', error);
    }
}