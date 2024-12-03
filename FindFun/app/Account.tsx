import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

const Account = () => {
    const navigation = useNavigation();

    return (
        <ImageBackground
            source={require('../assets/images/buildpage.png')}
            style={styles.background}
        >
            <View style={styles.overlay} />
            <View style={styles.container}>
                <Text style={styles.header}>Account</Text>

                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <MaterialIcons name="account-circle" size={24} color="#333" />
                    <Text style={styles.buttonText}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <MaterialIcons name="event" size={24} color="#333" />
                    <Text style={styles.buttonText}>Plans</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <MaterialIcons name="history" size={24} color="#333" />
                    <Text style={styles.buttonText}>Trip History</Text>
                </TouchableOpacity>


                <TouchableOpacity
                    style={[styles.button, styles.activeButton]}
                    onPress={() => navigation.navigate('SavedItineraries')}
                >
                    <MaterialIcons name="bookmark" size={24} color="#333" />
                    <Text style={styles.buttonText}>Saved Itineraries</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={() => { }}>
                    <MaterialIcons name="settings" size={24} color="#333" />
                    <Text style={styles.buttonText}>Settings</Text>
                </TouchableOpacity>

            </View>
        </ImageBackground>
    );
};

export default Account;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: 'cover',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        paddingVertical: 30,
        textAlign: 'center',
        color: '#ffffff',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },

    buttonText: {
        color: '#333',
        fontSize: 18,
        fontWeight: '500',
        marginLeft: 15,
        textAlign: 'left',
        flex: 1,
    },
});
