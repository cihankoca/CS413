import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const BottomNavigationBar = () => {
    const navigation = useNavigation();

    return (
        <View style={styles.bottomNavigation}>
            {/* Home Button */}
            <TouchableOpacity
                style={styles.navButton}
            //onPress={() => navigation.navigate('Home')}
            >
                <Ionicons name="home" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Build Your Day Button */}
            <TouchableOpacity
                style={styles.navButton}
            //onPress={() => navigation.navigate('BuildYourDay')}
            >
                <Text style={styles.buttonText}>Build Your Day</Text>
            </TouchableOpacity>

            {/* Profile Button */}
            <TouchableOpacity
                style={styles.navButton}
            // onPress={() => navigation.navigate('Profile')}
            >
                <Ionicons name="person" size={24} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-between', // Butonları yatayda yayar
        backgroundColor: '#4f6d7a',
        padding: 10,
        width: '100%',
        height: 50,
        position: 'absolute',
        bottom: 0,
    },
    navButton: {
        justifyContent: 'center', // Hem ikon hem metni dikeyde ortalar
        flexDirection: 'column',
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default BottomNavigationBar;
