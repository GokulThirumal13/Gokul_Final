import React, { useState,useEffect} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation,useRoute} from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function NewStoryPrompt() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [username, setUsername] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [age, setAge] = useState('');
    const [sound, setSound] = useState(null);
    const [credits, setCredits] = useState(100);
    const [isLoading,setLoading]=useState(false);
    

    const navigation = useNavigation();
    const route = useRoute();
    const { category } = route.params || {};


    const voiceMap = {
        Horror: 'XrExE9yKIg1WjnnlVkGX', 
    Adventure: 'MF3mGyEYCl7XYWbV9V6O',
    Fantasy: 'ErXwobaYiN019PkySvjV',
    Comedy: 'AZnzlk1XvdvUeBnXmlld',
    Educational: 'EXAVITQu4vr4xnSDxMaL', 
    };

    useEffect(() => {
        async function fetchStoredData() {
            const savedUsername = await AsyncStorage.getItem('username');
            const savedAge = await AsyncStorage.getItem('userAge');
            if (savedUsername) setUsername(savedUsername);
            if (savedAge) setAge(savedAge);
        }
        fetchStoredData();
    }, []);

    useEffect(() => {
        async function fetchCredits() {
            try {
                const response = await fetch(`http://192.168.1.26:3001/get-credits?username=${username}`);
                const data = await response.json();
                if (data.success) setCredits(data.credits);
            } catch (error) {
                console.error("Error fetching credits:", error);
            }
        }
        if (username) fetchCredits();
    }, [username]);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.stopAsync();
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const handleSubmit = async () => {
        if (prompt.trim().length === 0) {
            Alert.alert("Error", "Please enter a prompt.");
            return;
        }
        if (!age) {
            Alert.alert("Error", "Age is not set. Please log in first.");
            return;
        }

        const success = await deductCredits();
        if (!success) return;
        setLoading(true);

        const ageAdjustedPrompt = `Generate a story suitable for a ${age}-year-old under category: ${category}. ${prompt}`;
        const voiceId = voiceMap[category];

        try {
            const response = await fetch("http://192.168.1.26:3000/generate-story", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: ageAdjustedPrompt, voiceId }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            setStory(data.story);
            setAudioUrl(data.audioUrl);
            setPrompt("");
            setIsFavorite(false);
            await sendStoryToBackend(data.story, data.audioUrl);
        } catch (error) {
            console.error("Error generating story:", error);
            Alert.alert("Error", "Failed to generate story");
        }
        finally{
            setLoading(false);
        }
    };

    const deductCredits = async () => {
        try {
            const response = await fetch("http://192.168.1.26:3001/deduct-credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message || "Failed to deduct credits");
                return false;
            }

            const data = await response.json();
            setCredits(data.newCredits);
            return true;
        } catch (error) {
            console.error("Error deducting credits:", error);
            Alert.alert("Error", "Failed to deduct credits");
            return false;
        }
    };

    const sendStoryToBackend = async (storyText, audioUrl) => {
        try {
            const response = await fetch('http://192.168.1.26:3001/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, storyText, audioUrl }),
            });

            if (!response.ok) throw new Error(`Error`);
            const data = await response.json();
            console.log(data.message);
            setCredits(data.newCredits);
        } catch (error) {
            console.error('Error storing story:', error);
            Alert.alert('Error', 'Failed to store the story');
        }
    };

    const AudioPlay = async () => {
        if (!audioUrl) {
            Alert.alert('Error', 'No audio available');
            return;
        }
        try {
            const { sound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );
            setSound(sound);
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate(async (status) => {
                if (status.didJustFinish) {
                    await sound.unloadAsync();
                    setSound(null);
                }
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio');
        }
    };

    const FavoriteToggle = async () => {
        const newFavoriteStatus = !isFavorite;
        setIsFavorite(newFavoriteStatus);
        if (newFavoriteStatus && story !== '') {
            try {
                const response = await fetch('http://192.168.1.26:3001/favorite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, story, isFavorite: newFavoriteStatus, audioUrl }),
                });

                if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);
                const data = await response.json();
                console.log(data.message);
            } catch (error) {
                console.error('Error storing favorite status:', error);
                Alert.alert('Error', 'Failed to store favorite status');
            }
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={28} color="red" />
            </TouchableOpacity>

            <View style={styles.creditsContainer}>
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.creditsText}>{credits} Credits</Text>
            </View>

            <Text style={styles.title}>Create Your Story in {category}</Text>

            <View style={styles.card}>
                <Text style={styles.label}>Enter Story Prompt</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={3}
                    value={prompt}
                    onChangeText={(text) => setPrompt(text)}
                    placeholder='Type your story here..'
                    placeholderTextColor="#777"
                />
            </View>

            <TouchableOpacity
    style={[styles.button, isLoading && { backgroundColor: '#888' }]}
    onPress={handleSubmit}
    disabled={isLoading}
>
    <Text style={styles.buttonText}>
        {isLoading ? 'Generating...' : 'Generate Story'}
    </Text>
</TouchableOpacity>

            {story !== '' && (
                <View style={styles.storyCard}>
                    <Text style={styles.storyTitle}>Generated Story:</Text>
                    <Text style={styles.storyText}>{story}</Text>
                    <TouchableOpacity onPress={FavoriteToggle} style={styles.favoriteButton}>
                        <Ionicons
                            name={isFavorite ? 'heart' : 'heart-outline'}
                            size={32}
                            color={isFavorite ? 'red' : 'gray'}
                        />
                    </TouchableOpacity>
                </View>
            )}

            {audioUrl ? (
                <TouchableOpacity style={styles.audioButton} onPress={AudioPlay}>
                    <Text style={styles.buttonText}>Play Audio</Text>
                </TouchableOpacity>
            ) : (
                <Text style={{ fontSize: 20, textAlign: 'center', color: 'red' }}>No audio available</Text>
            )}

            <TouchableOpacity onPress={() => navigation.navigate("mq")}>
                <Text style={styles.buttonText}></Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop:20,
        padding: 16,
        backgroundColor: '#121212'
    },
    contentContainer: {
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'yellow',
        textAlign: 'center',
        marginVertical: 16,
    },
    card: {
        backgroundColor: '#1E1E1E',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#F0F0F0',
        marginBottom: 8,
    },
    textArea: {
        backgroundColor: '#2B2B2B',
        borderColor: '#444',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        color: '#fff',
        textAlignVertical: 'top',
        height: 90,
    },
    button: {
        backgroundColor: 'red',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    storyCard: {
        backgroundColor:'black',
        padding: 16,
        borderRadius: 12,
        marginTop: 49,
        borderColor: '#444',
        borderWidth: 1,
    },
    storyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FAFAFA',
        marginBottom: 8,
    },
    storyText: {
        fontSize: 15,
        color: '#CCCCCC',
    },
    favoriteButton: {
        alignSelf: 'flex-end',
        marginTop: 10,
    },
    audioButton: {
        backgroundColor: '#4CAF50',
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    creditsContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: '#1E1E1E',
        borderRadius: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#444',
    },
    creditsText: {
        color: "#FAFAFA",
        fontSize: 14,
        fontWeight: "bold",
        marginLeft: 6,
    }
});

