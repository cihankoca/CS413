import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

type RootStackParamList = {
    SelectedActivities: { selected: string[] };
    ActivityPage: undefined;
    ResultsPage: { selectedActivities: string[] };
};

interface ActivityPageProps {}

const ActivityPage: React.FC<ActivityPageProps> = () => {
    const navigation = useNavigation(); // Use navigation hook to navigate to other screens

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

    const toggleActivity = (activity: keyof typeof selectedActivities) => {
        setSelectedActivities((prevState) => ({
            ...prevState,
            [activity]: !prevState[activity],
        }));
    };

    const isDiscoverEnabled = Object.values(selectedActivities).some((selected) => selected);

    const handleDiscover = () => {
        if (isDiscoverEnabled) {
            const selected = (Object.keys(selectedActivities) as (keyof typeof selectedActivities)[])
                .filter((activity) => selectedActivities[activity]);

            // Navigate to the Results Page and pass the selected activities
            navigation.navigate('Results', { selectedActivities: selected });
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/appBackground.avif')}
            style={styles.backgroundImage}
        >
            <LinearGradient
                colors={['rgba(0,0,0,0.6)', 'transparent']}
                style={styles.gradientOverlay}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.food && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('food')}
                    >
                        <Image source={require('../assets/images/activity/food.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <MaterialIcons name="restaurant" size={24} color="#fff" />
                            <Text style={styles.text}>FOOD</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.museum && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('museum')}
                    >
                        <Image source={require('../assets/images/activity/museum.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <MaterialIcons name="museum" size={24} color="#fff" />
                            <Text style={styles.text}>MUSEUM</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.park && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('park')}
                    >
                        <Image source={require('../assets/images/activity/park.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <Ionicons name="leaf" size={24} color="#fff" />
                            <Text style={styles.text}>PARK</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.outdoor && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('outdoor')}
                    >
                        <Image source={require('../assets/images/activity/outdoor.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <Ionicons name="bicycle" size={24} color="#fff" />
                            <Text style={styles.text}>OUTDOOR</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.adventurewildlife && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('adventurewildlife')}
                    >
                        <Image source={require('../assets/images/activity/adventurewildlife.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <MaterialIcons name="terrain" size={24} color="#fff" />
                            <Text style={styles.text}>WILDLIFE</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.concerts && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('concerts')}
                    >
                        <Image source={require('../assets/images/activity/concerts.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <Ionicons name="musical-notes" size={24} color="#fff" />
                            <Text style={styles.text}>CONCERTS</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.theatre && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('theatre')}
                    >
                        <Image source={require('../assets/images/activity/theatre.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <MaterialIcons name="theaters" size={24} color="#fff" />
                            <Text style={styles.text}>THEATRE</Text>
                        </View>
                    </TouchableOpacity>


                    <TouchableOpacity
                        style={[
                            styles.activity,
                            selectedActivities.nightlife && styles.selectedActivity,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => toggleActivity('nightlife')}
                    >
                        <Image source={require('../assets/images/activity/nightlife.jpg')} style={styles.image} />
                        <View style={styles.iconLabel}>
                            <Ionicons name="moon" size={24} color="#fff" />
                            <Text style={styles.text}>NIGHTLIFE</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.discoverButton, !isDiscoverEnabled && styles.disabledButton]}
                onPress={handleDiscover} // Call handleDiscover when pressed
                disabled={!isDiscoverEnabled}
                activeOpacity={0.7}
            >
                <Text style={styles.discoverText}>DISCOVER</Text>
            </TouchableOpacity>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    scrollContainer: {
        paddingVertical: 43,
        paddingHorizontal: 20,
        marginTop: 60
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    activity: {
        width: '48%',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        borderRadius: 15,
        padding: 10,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        overflow: 'hidden',
        elevation: 4,
    },
    selectedActivity: {
        borderColor: '#00b894',
        borderWidth: 3,
        backgroundColor: 'rgba(0, 184, 148, 0.3)',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 10,
    },
    iconLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    text: {
        marginLeft: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
    },
    discoverButton: {
        backgroundColor: '#00b894',
        padding: 17,
        alignItems: 'center',
        margin: 20,
        borderRadius: 30,
        elevation: 5,
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
