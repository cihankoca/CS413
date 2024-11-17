import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Dimensions, ImageBackground, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';

const buildPageBackground = require('../assets/images/buildpage.png');

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const Geocode_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_GEOENCODING_API_KEY;
const FOURSQUARE_API_KEY = process.env.EXPO_PUBLIC_FOURSQUARE_API_KEY;



let tripLocation: string;
let tripGuidelines: string;
let tripLength: string;

let tripLat: any;
let tripLong: any;

let jsonResponse: any;
let placesList: any;


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
    const [step, setStep] = useState<number>(1);
    const [chat, setChat] = useState([{ text: "Where are you going?", fromAI: true }]); //this shouldnt be like this. I need a location Foursquare can use...
    const [inputText, setInputText] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false); // Loading state for API requests
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [chat]);

    const fetchAIResponse = async (input: string) => {
        setLoading(true);
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a travel itinerary assistant. When creating an itinerary, always format your response exactly like this:\n\n[ITINERARY_START]\n9:00 AM - **Location Name** - Address\n[RATING: 4.5/5] [HOURS: 9:00 AM - 10:00 PM]\nDescription of activity (1-2 sentences)\n\n10:30 AM - **Next Location** - Address\n[RATING: 4.8/5] [HOURS: 8:00 AM - 9:00 PM]\nDescription of activity\n[ITINERARY_END]\n\nEach entry must include:\n- Time\n- Location name in bold (surrounded by **)\n- Full address\n- Rating (converted to 5-star scale)\n- Operating hours if available\n- Brief description\nMaintain chronological order with appropriate time gaps between activities.'
                        },
                        { role: 'user', content: input }
                    ],
                    max_tokens: 3000,
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
            tripLocation = inputText; //is this the issue? I really think it is....
            console.log(tripLocation); //use inputText to find a latitude and longitude using geocoding

            aiResponse = 'What type of places do you want to explore today?';
            setStep(2);
        } else if (step === 2) {
            //do a foursquare request using their activities and chosen location...
            tripGuidelines = `${inputText}`; //this works as well
            let userAddress = "1600 Amphitheatre Parkway, Mountain View, CA"; // This can come from a user input (can be imperfect...havent tested thoroughly though)
            userAddress = "Boston"; //this works too...
            await getCoordinates(userAddress)  //can't get it to work with other than the example string(s)
                .then(coords => {
                    tripLat = coords.latitude;
                    tripLong = coords.longitude;
                    console.log("Latitude:", tripLat, "Longitude:", tripLong);
                })
                .catch(error => console.error(error));


            let search: SearchParams = {};
            search.ll = `${tripLat},${tripLong}`; //using geocoded lat/long
            search.radius = 100000; //max radius for testing
            search.query = tripGuidelines; //this might suck (not work at all)...if so we need a way for user to clearly choose foursquare categories
            search.limit = 5; //limit of 5 for testing
            search.exclude_all_chains = true;
            search.fields = "name,location,description,website,hours,rating,tips";


            jsonResponse = await placesSearch(search); //saving the json response from a foursquare search
            //app gets stuck somewhere around here....the Places search is complete and outputted, so maybe the issue is extract?...fixed, returning was brokey
            placesList = extractPlaceInfo(jsonResponse); //taking the important bits out to send to gpt
            console.log("\n THE JSON RESPONSE IS: \n");
            console.log(jsonResponse);
            //console.log("\n THE PLACES LIST IS: \n");    //basically just trying to limit tokens given to gpt, but it hasnt mattered much so far...i jsut want to gmake sure gpt understands what attributes belong to which place
            //console.log(placesList);



            aiResponse = `Great! You chose: ${inputText}. How long do you have to explore?`;
            setStep(3);
        } else if (step === 3) {
            tripLength = inputText;
            //send all results to gpt and ask them to make a schedule using the results (maybe add more results too like restaurants or popular stuff if user asks for long schedule or doesn't give enough to work with to fill time)
            const jsonString = JSON.stringify(jsonResponse, null, 2);
            console.log(tripLocation);
            console.log(jsonResponse);
            console.log(`Make a schedule for a trip in ${tripLocation} lasting ${tripLength} based on ${jsonString}`);
            aiResponse = await fetchAIResponse(`Make a schedule for a trip in ${tripLocation} lasting ${tripLength} based on ${jsonString}`); //this will change a bunch....
            setStep(4);
        }

        setChat([
            ...chat,
            { text: inputText, fromAI: false },
            { text: aiResponse, fromAI: true }
        ]);

        setInputText('');
    };

    const renderMessage = (message: { text: string, fromAI: boolean }) => {
        if (message.fromAI && message.text.includes('[ITINERARY_START]')) {
            const itineraryContent = message.text
                .replace('[ITINERARY_START]\n', '')
                .replace('\n[ITINERARY_END]', '')
                .split('\n\n');
    
            return (
                <View style={styles.itineraryContainer}>
                    {itineraryContent.map((item, index) => {
                        const [timeLine, metaLine, description] = item.split('\n');
                        const [time, locationAndAddress] = timeLine.split(' - ');
                        const [location, address] = locationAndAddress.split(' - ');
                        
                        const rating = metaLine.match(/\[RATING: (.*?)\/5\]/)?.[1];
                        const hours = metaLine.match(/\[HOURS: (.*?)\]/)?.[1];
                        const formattedHours = hours ? formatHours(hours) : null;
                        
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
                                            {'★'.repeat(Math.round(Number(rating)))}
                                            {'☆'.repeat(5 - Math.round(Number(rating)))}
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
