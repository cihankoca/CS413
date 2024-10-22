import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

const buildPageBackground = require('../assets/images/buildpage.png');

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

const BuildYourDay: React.FC = () => {
    const [step, setStep] = useState<number>(1);
    const [chat, setChat] = useState([{ text: "Where are you going?", fromAI: true }]);
    const [inputText, setInputText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // Loading state for API requests
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chat]);

    const fetchAIResponse = async (input: string) => {
        setLoading(true);
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {  // Adjusted endpoint for GPT-3.5/4
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',  // Updated to GPT-3.5 model
                    messages: [
                        { role: 'system', content: 'You are a helpful assistant.' },  // System message to set the context
                        { role: 'user', content: input }  // User input
                    ],
                    max_tokens: 100,
                }),
            });

            const data = await response.json();

            // Check if 'choices' exists and has a valid structure
            if (data && data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content.trim();  // Return the response message from the AI
            } else {
                console.error('Unexpected response format from OpenAI:', data);
                return 'Sorry, something went wrong. Please try again.';
            }
        } catch (error) {
            console.error('Error fetching AI response:', error);
            return 'Sorry, something went wrong. Please try again.';
        } finally {
            setLoading(false);
        }
    };



    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        setChat([
            ...chat,
            { text: inputText, fromAI: false }
        ]);

        let aiResponse = '';

        if (step === 1) {
            aiResponse = 'What type of places do you want to explore today?';
            setStep(2);
        } else if (step === 2) {
            aiResponse = `Great! You chose: ${inputText}. How long do you have to explore?`;
            setStep(3);
        } else if (step === 3) {
            aiResponse = await fetchAIResponse(`Build a day trip itinerary for exploring ${inputText}.`);
            setStep(4);
        }

        setChat([
            ...chat,
            { text: inputText, fromAI: false },
            { text: aiResponse, fromAI: true }
        ]);

        setInputText('');
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#f9f9f9',
            paddingHorizontal: 20,
            paddingTop: 40
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            textAlign: 'center',
            marginVertical: 10,
            color: '#333'
        },
        chatContainer: {
            flexGrow: 1,
            marginVertical: 20,
        },
        aiMessage: {
            backgroundColor: '#dfe6e9',
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            maxWidth: '80%', // Keep AI message width limited
        },
        userMessage: {
            backgroundColor: '#74b9ff',
            padding: 10,
            marginVertical: 5,
            borderRadius: 10,
            alignSelf: 'flex-end',
            maxWidth: '80%', // Keep user message width limited
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
            backgroundColor: '#fff',
            borderRadius: 10,
            padding: 5,
            borderWidth: 1,
            borderColor: '#ccc',
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
        },
        loadingIndicator: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
        }
    });

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ flex: 1 }}>
            <ImageBackground source={buildPageBackground} style={styles.container}>
                <Text style={styles.title}>Build Your Day</Text>

                <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} style={styles.chatContainer}>
                    {chat.map((message, index) => (
                        <View key={index} style={message.fromAI ? styles.aiMessage : styles.userMessage}>
                            <Text>{message.text}</Text>
                        </View>
                    ))}
                </ScrollView>

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

                {loading && (
                    <View style={styles.loadingIndicator}>
                        <ActivityIndicator size="large" color="#00cec9" />
                    </View>
                )}
            </ImageBackground>
        </KeyboardAvoidingView>
    );
};

export default BuildYourDay;
