import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// RootStackParamList ile Route tanımları
type RootStackParamList = {
    SelectedActivities: { selected: string[] };
    ActivityPage: undefined;
};

// Navigation Prop ve Route Prop türleri
type ActivityPageNavigationProp = StackNavigationProp<RootStackParamList, 'ActivityPage'>;
type ActivityPageRouteProp = RouteProp<RootStackParamList, 'ActivityPage'>;

interface ActivityPageProps {
    //navigation: ActivityPageNavigationProp;
    //route: ActivityPageRouteProp;
}

const ActivityPage: React.FC<ActivityPageProps> = (/*{ navigation }*/) => {
    // Her bir aktivite için checkbox durumu
    const [selectedActivities, setSelectedActivities] = useState({
        food: false,
        museum: false,
        park: false,
        outdoor: false,
        adventurewildlife: false,
        concerts: false,
        theatre: false,
        nightlife: false,
    });

    // Seçim yapıldığında checkbox durumunu değiştiren fonksiyon
    const toggleActivity = (activity: keyof typeof selectedActivities) => {
        setSelectedActivities((prevState) => ({
            ...prevState,
            [activity]: !prevState[activity],
        }));
    };

    // Discover butonunu aktif/inaktif yapma
    const isDiscoverEnabled = Object.values(selectedActivities).some((selected) => selected);

    // Seçimleri başka sayfaya gönderme
    const handleDiscover = () => {
        if (isDiscoverEnabled) {
            // Filtreleme işlemi için explicit type (anahtarların tipini belirtme)
            const selected = (Object.keys(selectedActivities) as (keyof typeof selectedActivities)[])
                .filter((activity) => selectedActivities[activity]);

            //  navigation.navigate('SelectedActivities', { selected });
        }
    };


    return (
        <ImageBackground
            source={require('../../assets/images/activity/bos.jpg')} // Arka plan görseli burada tanımlanır
            style={styles.backgroundImage}
        >


            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.food && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('food')}
                    >
                        <Image source={require('../../assets/images/activity/food.jpg')} style={styles.image} />
                        <Text style={styles.text}>FOOD</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.museum && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('museum')}
                    >
                        <Image source={require('../../assets/images/activity/museum.jpg')} style={styles.image} />
                        <Text style={styles.text}>MUSEUM</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.park && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('park')}
                    >
                        <Image source={require('../../assets/images/activity/park.jpg')} style={styles.image} />
                        <Text style={styles.text}>PARK</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.outdoor && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('outdoor')}
                    >
                        <Image source={require('../../assets/images/activity/outdoor.jpg')} style={styles.image} />
                        <Text style={styles.text}>OUTDOOR</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.adventurewildlife && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('adventurewildlife')}
                    >
                        <Image source={require('../../assets/images/activity/adventurewildlife.jpg')} style={styles.image} />
                        <Text style={styles.text}>WILDLIFE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.concerts && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('concerts')}
                    >
                        <Image source={require('../../assets/images/activity/concerts.jpg')} style={styles.image} />
                        <Text style={styles.text}>CONCERTS</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.theatre && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('theatre')}
                    >
                        <Image source={require('../../assets/images/activity/theatre.jpg')} style={styles.image} />
                        <Text style={styles.text}>THEATRE</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.nightlife && styles.selectedActivity,
                        ]}
                        activeOpacity={1}
                        onPress={() => toggleActivity('nightlife')}
                    >
                        <Image source={require('../../assets/images/activity/nightlife.jpg')} style={styles.image} />
                        <Text style={styles.text}>NIGHTLIFE</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.discoverButton, !isDiscoverEnabled && styles.disabledButton]}
                onPress={() => { }}
                disabled={!isDiscoverEnabled}
            >
                <Text style={styles.discoverText}>DISCOVER</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover', // Arka planın nasıl sığdırılacağını belirler
    },
    scrollContainer: {
        paddingVertical: 20,
        padding: 10,
        marginTop: 40,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    activity: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: 'rgba(240, 240, 240, 0.4)',
        borderRadius: 10,
        padding: 10,
        borderColor: 'rgba(240, 240, 240, 0.0)',
        borderWidth: 2,
    },
    selectedActivity: {
        borderColor: '#007AFF',
        borderWidth: 2,

    },
    image: {
        width: '100%',
        height: 100,
        borderRadius: 10,
    },
    text: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    discoverButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#b0b0b0',
    },
    discoverText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ActivityPage;