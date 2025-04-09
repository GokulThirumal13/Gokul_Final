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
    const [isPlaying,setIsPlaying]=useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { category,  voiceId } = route.params || {};


    const favoriteImageUrls = {
        Horror: 'https://thumbs.dreamstime.com/b/pair-scared-children-sitting-bed-hiding-frightening-ghost-under-blanket-fearful-kids-imaginary-pair-scared-121266767.jpg',
        Adventure: 'https://img.freepik.com/free-vector/scene-with-many-children-park_1308-43397.jpg',
        Fantasy: 'https://img.freepik.com/free-vector/gradient-childrens-day-illustration_23-2149365424.jpg',
        Comedy: 'https://www.shutterstock.com/image-vector/happy-little-boys-april-fools-600nw-1320331298.jpg',
        Educational: 'https://static.vecteezy.com/system/resources/thumbnails/002/192/942/small_2x/education-children-concept-design-free-vector.jpg',
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

        try {
            const response = await fetch('http://192.168.1.26:3000/generate-story',{
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  prompt: prompt,
                  category,
                  voiceId, 
                }),
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
        if (!audioUrl && !sound) {
            Alert.alert('Error', 'No audio available');
            return;
        }
    
        try {
            if (sound) {
                const status = await sound.getStatusAsync();
                if (status.isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: audioUrl },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);
    
                newSound.setOnPlaybackStatusUpdate(async (status) => {
                    if (status.didJustFinish) {
                        await newSound.unloadAsync();
                        setSound(null);
                        setIsPlaying(false);
                    }
                });
            }
        } catch (error) {
            console.error('Error playing/pausing audio:', error);
            Alert.alert('Error', 'Audio playback failed');
        }
    };
    

    const FavoriteToggle = async () => {
        const newFavoriteStatus = !isFavorite;
        setIsFavorite(newFavoriteStatus);
    
        if (newFavoriteStatus && story !== '') {
            const favoriteImage = favoriteImageUrls[category] || null;
    
            try {
                const response = await fetch('http://192.168.1.26:3001/favorite', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username, 
                        story, 
                        isFavorite: newFavoriteStatus, 
                        audioUrl,
                        category,
                        favoriteImage 
                    }),
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
                <Ionicons name="arrow-back" size={28} color="#00A86B" />
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
            <Text style={{ fontSize: 16, color: '#333', marginVertical: 10 }}>
  Voice Selected: {voiceId}
</Text>

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
                <Text style={styles.buttonText}>{isPlaying ? 'Pause Audio' : 'Play Audio'}</Text>
            </TouchableOpacity>
            
            ) : (
                <Text style={{ fontSize: 20, textAlign: 'center', color: 'black' }}>No audio available</Text>
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
        backgroundColor: '#0D0D0D',
        paddingHorizontal: 16,
        paddingTop: 24,
    },
    contentContainer: {
        paddingBottom: 100,
    },
    title: {
        fontSize: 22,
        fontWeight: '600',
        color: '#EAEAEA',
        textAlign: 'center',
        marginVertical: 18,
    },
    card: {
        backgroundColor: '#1A1A1A',
        padding: 16,
        borderRadius: 10,
        marginBottom: 16,
        borderColor: '#2A2A2A',
        borderWidth: 1,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
        color: '#CFCFCF',
        marginBottom: 6,
    },
    textArea: {
        backgroundColor: '#262626',
        borderColor: '#333',
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        color: '#F2F2F2',
        textAlignVertical: 'top',
        height: 100,
    },
    button: {
        backgroundColor: '#10A37F',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 12,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    storyCard: {
        backgroundColor: '#141414',
        padding: 16,
        borderRadius: 10,
        marginTop: 30,
        borderColor: '#333',
        borderWidth: 1,
    },
    storyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#E0E0E0',
        marginBottom: 8,
    },
    storyText: {
        fontSize: 14,
        color: '#C8C8C8',
        lineHeight: 22,
    },
    favoriteButton: {
        alignSelf: 'flex-end',
        marginTop: 12,
    },
    audioButton: {
        backgroundColor: '#343434',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#4CAF50',
    },
    creditsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#1F1F1F',
        borderColor: '#2F2F2F',
        borderWidth: 1,
        marginBottom: 16,
    },
    creditsText: {
        color: '#B0F2B6',
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 8,
    }
});


