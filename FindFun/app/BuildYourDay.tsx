import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { updateSavedLocations, useSavedLocationsListener } from './SavedLocationsListener';

const buildPageBackground = require('../assets/images/buildpage.png');

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const Geocode_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEOENCODING_API_KEY;
const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;

interface Place { //maybe unnecessary...I just need a good way to give all json results to gpt in an organized way
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    hours: string | null;
    website: string | null;
    rating: number | null;

}

interface SearchParams { //basically a struct for search parameters. create one and change it as user messes with options/search. Then pass it to the function and a search will be made with these params
    query?: string;
    ll?: string; // latitude,longitude  /required
    radius?: number;
    categories?: string; // comma-separated category IDs. 
    fields?: string; // comma-separated fields
    min_price?: number;
    max_price?: number;
    open_now?: boolean;
    near?: string;
    sort?: string;
    limit?: number;
    exclude_all_chains?: boolean;

}

function extractPlaceInfo(data: any): Place[] {
    return data.results.map((place: any) => ({
        name: place.name,
        address: place.location?.formatted_address || place.location?.address || "Address not available",
        latitude: place.geocodes?.main?.latitude || 0, // defaulting to 0 if undefined
        longitude: place.geocodes?.main?.longitude || 0,
        hours: place.hours?.display || "Hours not available",
        website: place.website || "Website not available",
        rating: place.rating || "Rating not available"
    }));
}

async function getCoordinates(address: string) {

    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${Geocode_API_KEY}`);

    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
    } else {
        throw new Error('Geocoding failed: ' + data.status);
    }
}

async function placesSearch(params: SearchParams) {
    try {


        const options: RequestInit = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                ...(FOURSQUARE_API_KEY ? { Authorization: FOURSQUARE_API_KEY } : {})
            }

        };


        const base_URL = 'https://api.foursquare.com/v3/places/search';

        const urlParams = new URLSearchParams();

        if (params.query) urlParams.append('query', params.query);
        if (params.ll) urlParams.append('ll', params.ll);
        if (params.radius) urlParams.append('radius', params.radius.toString());
        if (params.categories) urlParams.append('categories', params.categories);
        if (params.fields) urlParams.append('fields', params.fields);
        if (params.min_price !== undefined) urlParams.append('min_price', params.min_price.toString());
        if (params.max_price !== undefined) urlParams.append('max_price', params.max_price.toString());
        if (params.open_now) urlParams.append('open_now', params.open_now.toString());
        if (params.near) urlParams.append('near', params.near);
        if (params.sort) urlParams.append('sort', params.sort);
        if (params.limit) urlParams.append('limit', params.limit.toString());
        if (params.exclude_all_chains) urlParams.append('exclude_all_chains', params.exclude_all_chains.toString());



        const final_URL = `${base_URL}?${urlParams.toString()}`;

        const response = await fetch(final_URL, options);

        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        const data = await response.json();
        return data;

        //const response = await fetch(final_URL, options)
        //.then(response => response.json())
        //.then(response => console.log(response))
        //.catch(err => console.error(err));

    } catch (error) {

        console.error('Error fetching data from Foursquare:', error);

    }

}




const BuildYourDay: React.FC = () => {
    const { savedLocations, updateLocations } = useSavedLocationsListener();
    const [step, setStep] = useState<number>(1);
    const [chat, setChat] = useState([{ text: "Where are you going?", fromAI: true }]);
    const [inputText, setInputText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [tripLocation, setTripLocation] = useState<string>('');
    const [tripGuidelines, setTripGuidelines] = useState<string>('');
    const [tripLength, setTripLength] = useState<string>('');
    const [tripLat, setTripLat] = useState<number | null>(null);
    const [tripLong, setTripLong] = useState<number | null>(null);
    const [lastResponse, setLastResponse] = useState<string>('');
    const [jsonResponse, setJsonResponse] = useState<any>(null);
    const [jsonResponseDefault, setJsonResponseDefault] = useState<any>(null);
    const [isRateLimited, setIsRateLimited] = useState<boolean>(false);
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const scrollViewRef = useRef<ScrollView>(null);

    const saveItinerary = async (itineraryContent: string) => {
        try {
            const items = itineraryContent
                .split('\n\n')
                .map(item => {
                    const [timeLine, metaLine, description] = item.split('\n');
                    const [time, locationAndAddress] = timeLine.split(' - ');
                    const [location, address] = locationAndAddress.split(' - ');
                    const rating = metaLine.match(/\[RATING: (.*?)\/5\]/)?.[1];
                    const hours = metaLine.match(/\[HOURS: (.*?)\]/)?.[1];

                    return {
                        label: location.replace(/\*\*/g, ''),
                        description: description,
                        address: address,
                        rating: rating || '',
                        hours: hours || '',
                        time: time,
                        city: tripLocation
                    };
                });

            const currentLocations = savedLocations || [];
            const updatedLocations = [...currentLocations, ...items];
            await updateSavedLocations(updatedLocations);
        } catch (error) {
            console.error('Failed to save itinerary:', error);
        }
    };

    const fetchAIResponse = async (input: string, retryCount = 0): Promise<string> => {
        setLoading(true);
        try {
            console.log('Fetching AI response for input:', input);

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo', // Changed to 3.5-turbo which has higher rate limits
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a travel itinerary assistant. When creating an itinerary, always format your response exactly like this:\n\n[ITINERARY_START]\n9:00 AM - **Location Name** - Address\n[RATING: 4.5/5] [HOURS: 9:00 AM - 10:00 PM]\nDescription of activity (1-2 sentences)\n\n10:30 AM - **Next Location** - Address\n[RATING: 4.8/5] [HOURS: 8:00 AM - 9:00 PM]\nDescription of activity\n[ITINERARY_END]\n\nEach entry must include:\n- Time\n- Location name in bold (surrounded by **)\n- Full address\n- Rating (converted to 5-star scale)\n- Operating hours if available\n- Brief description\nMaintain chronological order with appropriate time gaps between activities.'
                        },
                        { role: 'user', content: input }
                    ],
                    max_tokens: 2000,
                }),
            });

            console.log('Response status:', response.status);

            if (response.status === 429 && retryCount < 3) {
                // If rate limited, wait and retry
                const retryAfter = response.headers.get('Retry-After') || '20';
                const waitTime = parseInt(retryAfter, 10) * 1000;
                console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);

                await delay(waitTime);
                return fetchAIResponse(input, retryCount + 1);
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('AI response data:', data);

            if (data.choices && data.choices.length > 0 && data.choices[0].message) {
                return data.choices[0].message.content.trim();
            } else {
                throw new Error('Unexpected response format from OpenAI');
            }
        } catch (error) {
            console.error('Error in fetchAIResponse:', error);

            // Show a more user-friendly error message
            const errorMessage = error.message.includes('429')
                ? "We're experiencing high traffic. Please try again in a few moments."
                : "Sorry, something went wrong. Please try again.";

            setChat(prevChat => [...prevChat, {
                text: errorMessage,
                fromAI: true
            }]);

            return errorMessage;
        } finally {
            setLoading(false);
        }
    };





    const sendMessage = async () => {
        if (inputText.trim() === '') return;

        // Add the user's message to chat immediately
        setChat(prevChat => [...prevChat, { text: inputText, fromAI: false }]);

        let aiResponse = '';

        try {
            if (step === 1) {
                // Save the location using setState instead of direct assignment
                setTripLocation(inputText);
                aiResponse = 'What type of places do you want to explore today?';
                setStep(2);
            } else if (step === 2) {
                // Save the guidelines
                setTripGuidelines(inputText);

                try {
                    // Get coordinates
                    const coords = await getCoordinates(tripLocation);
                    setTripLat(coords.latitude);
                    setTripLong(coords.longitude);

                    let search: SearchParams = {
                        ll: `${coords.latitude},${coords.longitude}`,
                        radius: 10000,
                        query: inputText,
                        limit: 10,
                        exclude_all_chains: true,
                        fields: "name,location,description,website,hours,rating,tips"
                    };

                    let defaultSearch: SearchParams = {
                        ll: `${coords.latitude},${coords.longitude}`,
                        radius: 10000,
                        limit: 10,
                        exclude_all_chains: true,
                        categories: "10000,13000,16000",
                        fields: "name,location,description,website,hours,rating,tips",
                        sort: "RATING"
                    };

                    const searchResponse = await placesSearch(search);
                    const defaultSearchResponse = await placesSearch(defaultSearch);

                    setJsonResponse(searchResponse);
                    setJsonResponseDefault(defaultSearchResponse);

                    aiResponse = `Great! You chose: ${inputText}. How long do you have to explore?`;
                    setStep(3);
                } catch (error) {
                    console.error('Error during step 2:', error);
                    aiResponse = 'Sorry, there was an error processing your request. Please try again.';
                }
            } else if (step === 3) {
                setTripLength(inputText);
                const now = new Date();

                try {
                    const jsonString = JSON.stringify(jsonResponse, null, 2);
                    const jsonStringDefault = JSON.stringify(jsonResponseDefault, null, 2);

                    aiResponse = await fetchAIResponse(
                        `Make a schedule for a trip in ${tripLocation} lasting ${inputText}. ` +
                        `The schedule should make sense with food at appropriate times (multiple of the same type of location in a day is strange - ` +
                        `there should not be two parks, or two museums). The current time is ${now}, so consider the time and distance between locations ` +
                        `when choosing the locations. Prioritize, but do not exclusively choose from these locations: ${jsonString} . ` +
                        `Use the following locations as backup and supplemental: ${jsonStringDefault}`
                    );

                    setLastResponse(aiResponse);
                    setStep(4);
                } catch (error) {
                    console.error('Error during step 3:', error);
                    aiResponse = 'Sorry, there was an error creating your itinerary. Please try again.';
                }
            } else if (step === 4) {
                try {
                    const now = new Date();
                    const jsonString = JSON.stringify(jsonResponse, null, 2);
                    const jsonStringDefault = JSON.stringify(jsonResponseDefault, null, 2);

                    aiResponse = await fetchAIResponse(
                        `The user would like you to change the schedule to fit these criteria: ${inputText}. ` +
                        `Your last schedule was ${lastResponse} \n Make a schedule for a trip in ${tripLocation} lasting ${tripLength}. ` +
                        `The schedule should make sense (multiple of the same type of location in a day is strange - there should not be two parks, or two museums). ` +
                        `The current time is ${now}, so consider the time and distance between locations when choosing the locations. ` +
                        `Prioritize, but do not exclusively choose from these locations: ${jsonString} . ` +
                        `Use the following locations as backup and supplemental: ${jsonStringDefault}`
                    );

                    setLastResponse(aiResponse);
                } catch (error) {
                    console.error('Error during step 4:', error);
                    aiResponse = 'Sorry, there was an error updating your itinerary. Please try again.';
                }
            }

            // Add AI response to chat
            if (aiResponse) {
                setChat(prevChat => [...prevChat, { text: aiResponse, fromAI: true }]);
            }

        } catch (error) {
            console.error('Error in sendMessage:', error);
            setChat(prevChat => [...prevChat, {
                text: 'Sorry, something went wrong. Please try again.',
                fromAI: true
            }]);
        }

        // Clear input
        setInputText('');
    };

    const renderMessage = (message: { text: string, fromAI: boolean }) => {
        if (!message || !message.text) return null;
    
        if (message.fromAI && message.text.includes('[ITINERARY_START]')) {
            const itineraryContent = message.text
                .replace('[ITINERARY_START]\n', '')
                .replace('\n[ITINERARY_END]', '')
                .split('\n\n')
                .filter(Boolean);
    
            return (
                <View style={styles.itineraryContainer}>
                    {itineraryContent.map((item, index) => {
                        if (!item) return null;
                        const [timeLine, metaLine, description] = item.split('\n');
                        const [time, locationAndAddress] = timeLine.split(' - ');
                        const [location, address] = locationAndAddress.split(' - ');
    
                        const rating = metaLine.match(/\[RATING: (.*?)\/5\]/)?.[1];
                        const hours = metaLine.match(/\[HOURS: (.*?)\]/)?.[1];
                        const formattedHours = hours ? formatHours(hours) : null;
    
                        // Add safety checks for rating
                        const numericRating = rating ? parseFloat(rating) : 0;
                        const validRating = !isNaN(numericRating) && isFinite(numericRating) 
                            ? Math.max(0, Math.min(5, numericRating)) 
                            : 0;
                        const filledStars = Math.round(validRating);
                        const emptyStars = 5 - filledStars;
    
                        return (
                            <View key={index} style={styles.itineraryItem}>
                                <Text style={styles.itineraryTime}>{time}</Text>
                                <Text style={styles.itineraryLocation}>
                                    {location.replace(/\*\*/g, '')}
                                </Text>
                                <Text style={styles.itineraryAddress}>{address}</Text>
                                <View style={styles.metaContainer}>
                                    {rating && (
                                        <Text style={styles.rating}>
                                            {'★'.repeat(Math.max(0, filledStars))}
                                            {'☆'.repeat(Math.max(0, emptyStars))}
                                        </Text>
                                    )}
                                    {formattedHours && (
                                        <Text style={styles.hours}>
                                            Open: {formattedHours}
                                        </Text>
                                    )}
                                </View>
                                <Text style={styles.itineraryDescription}>{description}</Text>
                            </View>
                        );
                    })}
                    <TouchableOpacity 
                        style={styles.saveButton}
                        onPress={() => saveItinerary(itineraryContent.join('\n\n'))}
                    >
                        <Text style={styles.saveButtonText}>Save Itinerary</Text>
                    </TouchableOpacity>
                </View>
            );
        }
    
        return (
            <View style={message.fromAI ? styles.aiMessage : styles.userMessage}>
                <Text>{message.text}</Text>
            </View>
        );
    };

    const formatHours = (hoursString: string): string => {
        // Get current day of week (0 = Sunday, 1 = Monday, etc.)
        const today = new Date().getDay();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        try {
            if (hoursString.includes(';')) {
                const dayHours = hoursString.split(';').map(s => s.trim());
                for (const schedule of dayHours) {
                    if (schedule.toLowerCase().startsWith(daysOfWeek[today].toLowerCase())) {
                        return schedule.split(' ').slice(1).join(' ');
                    }
                }
            }
            return hoursString;
        } catch (error) {
            return hoursString; // Return original if parsing fails
        }
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
        },
        itineraryContainer: {
            backgroundColor: '#fff',
            padding: 15,
            borderRadius: 10,
            marginVertical: 5,
            width: '100%',
        },
        itineraryItem: {
            marginBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: '#eee',
            paddingBottom: 10,
        },
        itineraryTime: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#2d3436',
        },
        itineraryLocation: {
            fontSize: 18,
            fontWeight: 'bold',
            color: '#0984e3',
            marginVertical: 5,
        },
        itineraryAddress: {
            fontSize: 14,
            color: '#636e72',
            fontStyle: 'italic',
        },
        itineraryDescription: {
            fontSize: 14,
            color: '#2d3436',
            marginTop: 5,
        },
        metaContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginVertical: 5,
        },
        rating: {
            color: '#f1c40f',
            fontSize: 16,
        },
        hours: {
            color: '#7f8c8d',
            fontSize: 14,
            fontStyle: 'italic',
        },
        rateLimitMessage: {
            backgroundColor: '#ffeaa7',
            padding: 10,
            borderRadius: 8,
            marginVertical: 10,
        },
        rateLimitText: {
            color: '#d35400',
            textAlign: 'center',
        },
    });

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "padding"} style={{ flex: 1 }}>
            <ImageBackground source={buildPageBackground} style={styles.container}>
                <Text style={styles.title}>Build Your Day</Text>

                <ScrollView ref={scrollViewRef} contentContainerStyle={{ flexGrow: 1 }} style={styles.chatContainer}>
                    {chat.map((message, index) => (
                        <React.Fragment key={index}>
                            {renderMessage(message)}
                        </React.Fragment>
                    ))}
                </ScrollView>

                {isRateLimited && (
                    <View style={styles.rateLimitMessage}>
                        <Text style={styles.rateLimitText}>
                            We're experiencing high traffic. Please wait a moment before trying again.
                        </Text>
                    </View>
                )}

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
