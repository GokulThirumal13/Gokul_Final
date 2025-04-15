import React, { useState, useEffect } from 'react';
import {
  View, 
  Text, 
  TextInput,
  TouchableOpacity, 
  StyleSheet,
  Alert, 
  ScrollView,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { Image } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export default function NewStoryPromptAdults() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const [username, setUsername] = useState('');
    const [isFavorite, setIsFavorite] = useState(false);
    const [age, setAge] = useState('');
    const [sound, setSound] = useState(null);
    const [credits, setCredits] = useState(100);
    const [isLoading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [durationMillis, setDurationMillis] = useState(0);
    const [positionMillis, setPositionMillis] = useState(0);
    const [isLooping, setIsLooping] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [modalVisible, setModalVisible] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const {category, voiceId, lang} = route.params || {};
    const favoriteImageUrls = {
        Horror: 'https://thumbs.dreamstime.com/b/pair-scared-children-sitting-bed-hiding-frightening-ghost-under-blanket-fearful-kids-imaginary-pair-scared-121266767.jpg',
        Adventure: 'https://img.freepik.com/free-vector/scene-with-many-children-park_1308-43397.jpg',
        Fantasy: 'https://img.freepik.com/free-vector/gradient-childrens-day-illustration_23-2149365424.jpg',
        Comedy: 'https://www.shutterstock.com/image-vector/happy-little-boys-april-fools-600nw-1320331298.jpg',
        Educational: 'https://static.vecteezy.com/system/resources/thumbnails/002/192/942/small_2x/education-children-concept-design-free-vector.jpg',
    };


    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    staysActiveInBackground: true,
                    playThroughEarpieceAndroid: false
                });
                console.log('Audio system initialized');
            } catch (error) {
                console.error('Audio setup error:', error);
            }
        };
        
        setupAudio();
        
        return () => {
            if (sound) {
                console.log('Unloading sound');
                sound.unloadAsync();
            }
        };
    }, []);

    const FavoriteToggle = async () => {
        const newFavoriteStatus = !isFavorite;
        setIsFavorite(newFavoriteStatus);
    
        if (newFavoriteStatus && story !== '') {
            const favoriteImage = favoriteImageUrls[category] || null;
    
            try {
                const response = await fetch('http://192.168.1.27:3001/adult/favorite', {
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
    
    useEffect(() => {
        const fetchStoredData = async () => {
            const savedUsername = await AsyncStorage.getItem('username');
            const savedAge = await AsyncStorage.getItem('userAge');
            if (savedUsername) setUsername(savedUsername);
            if (savedAge) setAge(savedAge);
        };
        fetchStoredData();
    }, []);

    useEffect(() => {
        const fetchCredits = async () => {
            try {
                const response = await fetch(`http://192.168.1.27:3001//adult/get-credits?username=${username}`);
                const data = await response.json();
                if (data.success) setCredits(data.credits);
            } catch (error) {
                console.error("Error fetching credits:", error);
            }
        };
        if (username) fetchCredits();
    }, [username]);


    const getAudioPermission = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting audio permissions:', error);
            return false;
        }
    };
    const checkNetworkConnectivity = async () => {
        try {
            const networkState = await NetInfo.fetch();
            return networkState.isConnected;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    };

    const handleSubmit = async () => {
        if (!prompt.trim()) {
            Alert.alert("Error", "Please enter a prompt.");
            return;
        }

        if (!age) {
            Alert.alert("Error", "Age is not set. Please log in first.");
            return;
        }
        const isConnected = await checkNetworkConnectivity();
        if (!isConnected) {
            Alert.alert("Network Error", "Please check your internet connection");
            return;
        }

        const success = await deductCredits();
        if (!success) return;

        setLoading(true);
        const ageAdjustedPrompt = `Generate a story suitable for a ${age}-year-old in the category '${category}' and write the story in ${lang}. User prompt: ${prompt}.`;
        try {
            const response = await fetch('http://192.168.1.27:3000/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt:ageAdjustedPrompt, category, voiceId, lang }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setStory(data.story);
            setAudioUrl(data.audioUrl);
            setPrompt("");
            setIsFavorite(false);
            await sendStoryToBackend(data.story, data.audioUrl);
            setLoading(false);
            setModalVisible(true); 
        } catch (error) {
            console.error("Error generating story:", error);
            Alert.alert("Error", `Failed to generate story: ${error.message}`);
            setLoading(false);
        }
    };

    const deductCredits = async () => {
        try {
            const response = await fetch("http://192.168.1.27:3001//adult/deduct-credits", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setCredits(data.newCredits);
            return true;
        } catch (error) {
            console.error("Credit deduction error:", error);
            Alert.alert("Error", `Failed to deduct credits: ${error.message}`);
            return false;
        }
    };

    const sendStoryToBackend = async (storyText, audioUrl) => {
        try {
            const response = await fetch('http://192.168.1.27:3001//adult/story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt,username, storyText, audioUrl }),
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Story saved successfully:', data);
        } catch (error) {
            console.error('Error storing story:', error);
            Alert.alert('Error', `Failed to store the story: ${error.message}`);
        }
    };

    const AudioPlay = async () => {
        try {
        
            const hasPermission = await getAudioPermission();
            if (!hasPermission) {
                Alert.alert('Permission Needed', 'Audio playback requires permission');
                return;
            }

      
            if (!audioUrl) {
                Alert.alert('Error', 'No audio file available to play');
                return;
            }

            if (sound) {
     
                const status = await sound.getStatusAsync();
                console.log('Current sound status:', status);
                
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    } else {
                        await sound.playAsync();
                        setIsPlaying(true);
                    }
                } else {
                    console.log('Sound object exists but is not loaded. Recreating...');
                    if (sound) {
                        await sound.unloadAsync();
                    }
                    await createAndPlaySound();
                }
            } else {
                await createAndPlaySound();
            }
        } catch (error) {
            console.error('Audio playback error:', error);
            Alert.alert('Error', `Audio playback failed: ${error.message}`);
        }
    };

    const createAndPlaySound = async () => {
        try {
            setAudioLoading(true);
            console.log('Creating new sound with URL:', audioUrl);
            
            
            const isConnected = await checkNetworkConnectivity();
            if (!isConnected) {
                Alert.alert("Network Error", "Please check your internet connection");
                setAudioLoading(false);
                return;
            }
            
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true, isLooping: isLooping, volume: 1.0, rate: playbackSpeed },
                onPlaybackStatusUpdate
            );
            
            console.log('Sound created successfully');
            setSound(newSound);
            setIsPlaying(true);
            setAudioLoading(false);
        } catch (error) {
            setAudioLoading(false);
            throw error; 
        }
    };

    const onPlaybackStatusUpdate = (status) => {
        if (status.isLoaded) {
            setPositionMillis(status.positionMillis);
            setDurationMillis(status.durationMillis);

            if (status.didJustFinish && !status.isLooping) {
                console.log('Playback finished');
                setIsPlaying(false);
            }
        } else if (status.error) {
            console.error('Playback error:', status.error);
        }
    };

    const forward = async () => {
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (!status.isLoaded) return;
                
                let newPosition = status.positionMillis + 10000;
                if (newPosition > status.durationMillis) {
                    newPosition = status.durationMillis;
                }
                await sound.setPositionAsync(newPosition);
            } catch (error) {
                console.error('Error seeking forward:', error);
            }
        }
    };

    const backward = async () => {
        if (sound) {
            try {
                const status = await sound.getStatusAsync();
                if (!status.isLoaded) return;
                
                let newPosition = status.positionMillis - 10000;
                if (newPosition < 0) {
                    newPosition = 0;
                }
                await sound.setPositionAsync(newPosition);
            } catch (error) {
                console.error('Error seeking backward:', error);
            }
        }
    };
   
    const formatTime = (millis) => {
        if (!millis && millis !== 0) return "0:00";
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const renderAudioControls = () => {
        return (
            <View style={styles.audioContainer}>
                <Slider
                    style={{ width: '100%', height: 40 }}
                    minimumValue={0}
                    maximumValue={durationMillis > 0 ? durationMillis : 1}
                    value={positionMillis}
                    minimumTrackTintColor="#00A86B"
                    maximumTrackTintColor="#333"
                    thumbTintColor="#00A86B" 
                    onSlidingComplete={async (value) => {
                        if (sound) {
                            try {
                                const status = await sound.getStatusAsync();
                                if (status.isLoaded) {
                                    await sound.setPositionAsync(value);
                                }
                            } catch (error) {
                                console.error('Error setting position:', error);
                            }
                        }
                    }}
                    disabled={audioLoading}
                />
                <Text style={styles.audioTime}>
                    {formatTime(positionMillis)} / {formatTime(durationMillis)}
                </Text>
                
                <View style={styles.audioControlsRow}>
                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                const newLooping = !isLooping;
                                setIsLooping(newLooping);
                                if (sound) {
                                    const status = await sound.getStatusAsync();
                                    if (status.isLoaded) {
                                        await sound.setIsLoopingAsync(newLooping);
                                    }
                                }
                            } catch (error) {
                                console.error('Error toggling loop:', error);
                            }
                        }}
                        style={styles.audioControlButton}
                        disabled={audioLoading}
                    >
                        <Ionicons
                            name="repeat"
                            size={24}
                            color={isLooping ? '#00A86B' : '#ccc'}
                        />
                        <Text style={{color: isLooping ? '#00A86B' : '#ccc', fontSize: 12}}>
                            {isLooping ? 'Loop On' : 'Loop'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={async () => {
                            try {
                                const newSpeed = playbackSpeed === 1.0 ? 1.5 : playbackSpeed === 1.5 ? 2.0 : 1.0;
                                setPlaybackSpeed(newSpeed);
                                if (sound) {
                                    const status = await sound.getStatusAsync();
                                    if (status.isLoaded) {
                                        await sound.setRateAsync(newSpeed, true);
                                    }
                                }
                            } catch (error) {
                                console.error('Error changing playback speed:', error);
                            }
                        }}
                        style={styles.audioControlButton}
                        disabled={audioLoading}
                    >
                        <Ionicons
                            name="speedometer"
                            size={24}
                            color="#00A86B"
                        />
                        <Text style={{color: '#00A86B', fontSize: 12}}>
                            {playbackSpeed}x
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.playbackControlsRow}>
                    <TouchableOpacity 
                        onPress={backward} 
                        style={styles.seekButton}
                        disabled={audioLoading}
                    >
                        <Ionicons name="play-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={AudioPlay} 
                        style={[styles.seekButton, {width: 65, height: 65}]}
                        disabled={audioLoading}
                    >
                        {audioLoading ? (
                            <ActivityIndicator color="#fff" size="large" />
                        ) : (
                            <Ionicons name={isPlaying ? 'pause' : 'play'} size={30} color="#fff" />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={forward} 
                        style={styles.seekButton}
                        disabled={audioLoading}
                    >
                        <Ionicons name="play-forward" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.creditsContainer}>
                <Ionicons name="wallet-outline" size={24} color="white" />
                <Text style={styles.creditsText}>{credits}</Text>
            </View>
            
            <View style={{marginTop: 8}}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="#00A86B" />
                </TouchableOpacity>
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

            <Text style={{ fontSize: 15, color: '#CFCFCF', marginBottom: 10 }}>
                Voice Selected: {voiceId}
            </Text>

            <TouchableOpacity
                style={[styles.button, isLoading && { backgroundColor: '#666' }]}
                onPress={handleSubmit}
                disabled={isLoading}
            >
                <Text style={styles.buttonText}>
                    {isLoading ? 'Generating...' : 'Generate Story'}
                </Text>
            </TouchableOpacity>

            <Modal
                transparent={true}
                animationType="fade"
                visible={isLoading}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00A86B" />
                        <Text style={styles.loadingText}>Creating your story...</Text>
                        <Image 
                            source={{ uri: favoriteImageUrls[category] || 'https://img.freepik.com/free-vector/gradient-childrens-day-illustration_23-2149365424.jpg' }} 
                            style={styles.loadingImage}
                        />
                    </View>
                </View>
            </Modal>

            <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible && story !== ''}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.storyModalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Your {category} Story</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={28} color="#00A86B" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.storyScrollView}>
                            <Text style={styles.storyModalText}>{story}</Text>
                        </ScrollView>

                        <TouchableOpacity onPress={FavoriteToggle} style={styles.favoriteButtonModal}>
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={24}
                                color={isFavorite ? 'red' : 'white'}
                            />
                            <Text style={{color: 'white', marginLeft: 8, fontSize: 16}}>
                                {isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
                            </Text>
                        </TouchableOpacity>

                        {audioUrl && renderAudioControls()}
                    </View>
                </View>
            </Modal>



            
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0D0D', paddingHorizontal: 16, paddingTop: 24 },
    contentContainer: { paddingBottom: 100 },
    title: { fontSize: 22, fontWeight: '600', color: '#EAEAEA', textAlign: 'center', marginVertical: 18 },
    card: {
        backgroundColor: '#1A1A1A', padding: 16, borderRadius: 10, marginBottom: 16,
        borderColor: '#2A2A2A', borderWidth: 1
    },
    label: { fontSize: 15, fontWeight: '500', color: '#CFCFCF', marginBottom: 6 },
    textArea: {
        backgroundColor: '#262626', color: '#fff', borderColor: '#333',
        borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16
    },
    button: {
        backgroundColor: '#00A86B', padding: 14, borderRadius: 10,
        marginVertical: 16, alignItems: 'center'
    },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    storyCard: { backgroundColor: '#1E1E1E', padding: 16, borderRadius: 10 },
    storyTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
    storyText: { fontSize: 16, color: '#ccc' },
    favoriteButton: { alignItems: 'center', marginTop: 10 },
    audioContainer: { marginTop: 20 },
    audioButton: {
        backgroundColor: '#00A86B', padding: 12, borderRadius: 10,
        alignItems: 'center', marginBottom: 10
    },
    seekButton: {
        backgroundColor: '#00A86B',
        padding: 12,
        borderRadius: 50,
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    audioTime: { color: '#ccc', textAlign: 'center', marginTop: 5 },
    creditsContainer: { flexDirection: 'row', alignItems: 'center', marginTop:20,marginBottom: 10, marginLeft: 250 },
    creditsText: { color: 'white', marginLeft: 8, fontSize: 16 },
    
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        alignItems: 'center',
        borderColor: '#2A2A2A',
        borderWidth: 1,
    },
    loadingText: {
        color: '#EAEAEA',
        fontSize: 18,
        fontWeight: '500',
        marginTop: 15,
        marginBottom: 20,
    },
    loadingImage: {
        width: 200,
        height: 150,
        borderRadius: 10,
        marginTop: 15,
    },
    storyModalContainer: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 20,
        width: '90%',
        maxHeight: '85%',
        borderColor: '#2A2A2A',
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00A86B',
    },
    storyScrollView: {
        maxHeight: 300,
        borderRadius: 8,
        backgroundColor: '#262626',
        padding: 12,
        borderColor: '#333',
        borderWidth: 1,
    },
    storyModalText: {
        color: '#EAEAEA',
        fontSize: 16,
        lineHeight: 24,
    },
    favoriteButtonModal: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 15,
        padding: 10,
        backgroundColor: '#262626',
        borderRadius: 8,
        borderColor: '#333',
        borderWidth: 1,
    },
    audioControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 12,
    },
    audioControlButton: {
        alignItems: 'center',
        padding: 8,
    },
    playbackControlsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginTop: 10,
    },
    viewStoryButton: {
        backgroundColor: '#00A86B',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
});