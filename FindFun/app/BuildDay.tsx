import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { getEventsFromLocalDB, initDatabase, saveEventsToLocalDB } from '@/utils/database';
import * as SQLite from 'expo-sqlite';

const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

const BuildDayScreen = () => {

    const [events, setEvents] = useState([]);

    const fetchEventsFromAPI = async () => {
        try {
            if (!FOURSQUARE_API_KEY) {
                throw new Error('Foursquare API key is not defined');
            }
            const response = await fetch(
                'https://api.foursquare.com/v3/places/search?ll=42.3601%2C-71.0589&radius=1000&categories=13000',
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': FOURSQUARE_API_KEY
                    }
                }
            );
            const data = await response.json();
            return data.results || [];
        } catch (error) {
            console.error('Error fetching events from API:', error);
            return [];
        }
    };

    const fetchEvents = async () => {

        const db = await initDatabase();

        // Check local database
        let localEvents = await getEventsFromLocalDB(db);
        if (localEvents.length > 0) {
            setEvents(localEvents);
            return;
        }

        // Check Supabase
        //let supabaseEvents = await getEventsFromSupabase();
        //if (supabaseEvents.length > 0) {
        //    setEvents(supabaseEvents);
        //    await saveEventsToLocalDB(supabaseEvents);
        //    return;
        //}

        // Fetch from API
        let apiEvents = await fetchEventsFromAPI();
        if (apiEvents.length > 0) {
            setEvents(apiEvents);
            await saveEventsToLocalDB(db, apiEvents);
            //await saveEventsToSupabase(apiEvents);
        }
    };
    
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Build Your Day Screen</Text>
            <Button title="Fetch Events" onPress={fetchEvents} />
            <View style={styles.eventsContainer}>
                {events.map((event, index) => (
                    <Text key={index} style={styles.eventItem}>
                        {event.name || 'Unnamed Event'}
                    </Text>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
    eventsContainer: {
        marginTop: 20,
        width: '90%',
    },
    eventItem: {
        fontSize: 16,
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
});

export default BuildDayScreen;
