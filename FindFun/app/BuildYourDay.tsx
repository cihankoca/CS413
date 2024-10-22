import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet, Dimensions, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';

const { width } = Dimensions.get('window');

type Activity = {
    name: string;
    image: any;
};

type ChatMessage = {
    text: React.ReactNode; // JSX component or string
    fromAI: boolean;
};
const buildPageBackground = require('../assets/images/buildpage.png');
const robotIcon = require('../assets/images/ai.png');
const BuildYourDay: React.FC = () => {
    const [step, setStep] = useState<number>(1); // Aşamaları kontrol edeceğimiz state
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]); // Seçilen aktiviteler
    const [chat, setChat] = useState<ChatMessage[]>([
        { text: <Text>Where are you going?</Text>, fromAI: true }
    ]);
    const [inputText, setInputText] = useState<string>(''); // Kullanıcı input'u
    const scrollViewRef = useRef<ScrollView>(null);

    const activities: Activity[] = [
        { name: 'Food', image: require('../assets/images/activity/food.jpg') },
        { name: 'Museum', image: require('../assets/images/activity/museum.jpg') },
        { name: 'Adventure & Wildlife', image: require('../assets/images/activity/adventurewildlife.jpg') },
        { name: 'Concerts', image: require('../assets/images/activity/concerts.jpg') },
        { name: 'Park', image: require('../assets/images/activity/park.jpg') },
        { name: 'Outdoor', image: require('../assets/images/activity/outdoor.jpg') },
        { name: 'Theater', image: require('../assets/images/activity/theatre.jpg') },
        { name: 'Nightlife', image: require('../assets/images/activity/nightlife.jpg') },
    ];

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chat]);

    const styles = StyleSheet.create({

        robotIcon: {
            width: 30,
            height: 30,
            marginRight: 10
        },

        container: {
            flex: 1,
            backgroundColor: '#f9f9f9',
            paddingHorizontal: 10,
            paddingTop: 40 // Başlığı biraz aşağıya kaydırmak için padding ekledik
        },
        title: {
            fontSize: 24,
            fontWeight: 'bold',
            textAlign: 'center',
            marginVertical: 20
        },
        activityContainer: {
            backgroundColor: '#fff',  // Aktivite kısmının arka planı beyaz olacak
            padding: 10,
            borderRadius: 10,
            marginVertical: 10
        },
        activitySelection: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
        },
        activity: {
            width: '40%',
            margin: 10,
            padding: 10,
            borderRadius: 10,
            borderColor: '#ccc',
            borderWidth: 1,
            alignItems: 'center',
            opacity: 0.9, // Opaklığı artırarak daha belirgin yapıyoruz
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Arka plan rengini daha belirgin yapmak için ekledik
            shadowColor: '#000', // Gölge rengi
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5, // Android için gölge efekti
        },

        selectedActivity: {
            opacity: 1,  // Seçildiğinde opacity artırılır
            backgroundColor: '#d0eaff',  // Seçildiğinde arka plan rengini mavi yapıyoruz
            borderColor: '#007bff',
            borderWidth: 2,
            transform: [{ scale: 1.1 }]  // Seçildiğinde biraz büyütülür
        },
        activityImage: {
            width: 100,
            height: 100,
            borderRadius: 10
        },
        activityText: {
            marginTop: 10,
            fontSize: 16
        },
        chatContainer: {
            flexGrow: 1,
            marginVertical: 20
        },
        aiMessage: {
            backgroundColor: '#dfe6e9',
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: 'flex-start'
        },
        userMessage: {
            backgroundColor: '#74b9ff',
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: 'flex-end'
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // Arka plan rengi ve opaklık
            borderRadius: 10,
            padding: 5,
        },
        input: {
            flex: 1,
            borderColor: '#ccc',
            color: '#000',
            borderWidth: 1,
            borderRadius: 10,
            paddingHorizontal: 10,
            height: 40
        },
        sendButton: {
            backgroundColor: '#00cec9',
            padding: 10,
            borderRadius: 10,
            marginLeft: 10
        },
        sendButtonText: {
            color: '#fff',
            fontWeight: 'bold'
        }
    });

    // Aktivite seçim fonksiyonu
    const toggleActivity = (activity: string) => {
        if (selectedActivities.includes(activity)) {
            setSelectedActivities(selectedActivities.filter(a => a !== activity));
        } else {
            setSelectedActivities([...selectedActivities, activity]);
        }
    };

    // Mesaj gönderme fonksiyonu
    const sendMessage = () => {
        if (inputText.trim() === '') return;

        if (step === 1) {
            // Kullanıcının ilk cevabını aldıktan sonra AI sorusu ve aktiviteler gösterilecek
            setChat([
                ...chat,
                { text: <Text> {inputText} </Text>, fromAI: false },
                { text: <Text>What type of places do you want to explore today? You can be more specific!</Text>, fromAI: true }
            ]);
            setInputText('');
            setStep(2); // Bir sonraki adıma geç

        } else if (step === 2) {
            // Kullanıcı spesifik bilgi girdikten sonra mesaj aktivite seçiminin en altında gösterilecek
            const selectedActivityString = selectedActivities.join(', ');
            setChat([
                ...chat,
                { text: <Text> {inputText} </Text>, fromAI: false },
                { text: <Text>Great! You chose: {selectedActivityString}. How long do you have to explore?</Text>, fromAI: true }
            ]);
            setInputText('');
            setStep(3);
        } else if (step === 3) {
            // Kullanıcı ne kadar süre olduğunu belirttikten sonra AI programı oluşturacak
            setChat([
                ...chat,
                { text: <Text> {inputText} </Text>, fromAI: false },
                { text: <Text>Awesome! Let's start building your schedule.</Text>, fromAI: true },
                { text: <Text>Here is a schedule of how you can spend your {inputText} in Boston!</Text>, fromAI: true }
            ]);
            setInputText('');
            setStep(4);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "padding"}
            style={{ flex: 1 }}
        >
            <ImageBackground source={buildPageBackground} style={styles.container}>
                {/* Başlık */}
                <Text style={styles.title}>Build Your Day</Text>

                {/* Chat ve Aktivite Seçim Bölümü */}
                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={{ flexGrow: 1 }}
                    style={styles.chatContainer}
                    keyboardShouldPersistTaps="handled" // Kullanıcının yazması sırasında klavyenin açık kalmasını sağlar
                >
                    {chat.map((message, index) => (
                        <View key={index} style={message.fromAI ? styles.aiMessage : styles.userMessage}>
                            {message.fromAI && <Image source={robotIcon} style={styles.robotIcon} />}
                            <Text>{message.text}</Text>
                        </View>
                    ))}

                    {/* Aktivite Seçim Alanı */}
                    {(step === 2 || step === 3) && (
                        <View style={styles.activitySelection}>
                            {activities.map((activity, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.activity,
                                        selectedActivities.includes(activity.name) && styles.selectedActivity
                                    ]}
                                    onPress={() => toggleActivity(activity.name)}
                                >
                                    <Image source={activity.image} style={styles.activityImage} />
                                    <Text style={styles.activityText}>{activity.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>

                {/* Mesaj Gönderme Alanı */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Start chatting!" placeholderTextColor="#000"
                        value={inputText}
                        onChangeText={setInputText}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </KeyboardAvoidingView>
    );
}


export default BuildYourDay;