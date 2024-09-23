import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BottomNavigationBar from '../../components/BottomNavigationBar';

const BostonScreen = () => {
    return (
        <View style={styles.container}>
            {/* Boston City Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/images/Boston_Back_Bay.jpg')} // Yerel resim dosyasına referans
                    style={styles.cityImage}
                />
                <View style={styles.overlay}>
                    <Text style={styles.title}>Boston, MA</Text>
                </View>
            </View>

            {/* Title and Description */}
            <View style={styles.descriptionContainer}>
                <Text style={styles.description}>A quick background about Boston, MA ...</Text>
            </View>
            <BottomNavigationBar />
        </View>




    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        position: 'relative',
    },
    cityImage: {
        width: '100%',
        height: 300,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Saydam arkaplan
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    descriptionContainer: {
        padding: 20,
        alignItems: 'center',
    },
    description: {
        fontSize: 18,
        textAlign: 'center',
    },
});

export default BostonScreen;
