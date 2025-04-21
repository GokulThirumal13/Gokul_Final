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
    const [imageUrl, setImageUrl] = useState(null);
    
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState();
    const [recordingStatus, setRecordingStatus] = useState('idle');
    const [transcribingStatus, setTranscribingStatus] = useState(false);

    const navigation = useNavigation();
    const route = useRoute();
    const {category, voiceId, lang} = route.params || {};

    const USER_TYPE = 'adult';
    const API_URL = 'http://192.168.4.75:3001';

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
            try {
                const response = await fetch(`${API_URL}/favorite`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        username, 
                        story, 
                        isFavorite: newFavoriteStatus, 
                        audioUrl,
                        category,
                        imageUrl,
                        userType: USER_TYPE
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
                
                const response = await fetch(`${API_URL}/get-credits?username=${username}&userType=${USER_TYPE}`);
                const data = await response.json();
                if (data.success) setCredits(data.credits);
            } catch (error) {
                console.error("Error fetching credits:", error);
            }
        };
        if (username) fetchCredits();
    }, [username]);

    const requestPermissions = async () => {
        try {
            const { status } = await Audio.requestPermissionsAsync();
            return status === 'granted';
        } catch (error) {
            console.error('Error requesting recording permissions:', error);
            Alert.alert('Error', 'Could not request recording permissions');
            return false;
        }
    };

    const startRecording = async () => {
        try {
            const hasPermission = await requestPermissions();
            if (!hasPermission) {
                Alert.alert('Permission Required', 'Please grant microphone permissions to record audio');
                return;
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            
            setRecording(recording);
            setIsRecording(true);
            setRecordingStatus('recording');
            
            console.log('Recording started');
        } catch (error) {
            console.error('Failed to start recording', error);
            Alert.alert('Error', 'Failed to start recording');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recording) return;
            
            console.log('Stopping recording..');
            setIsRecording(false);
            setRecordingStatus('processing');
            
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            
            if (uri) {
                console.log('Recording stopped, file URI:', uri);
                setRecordingStatus('transcribing');
                await transcribeAudio(uri);
            }
            
            setRecording(undefined);
        } catch (error) {
            console.error('Failed to stop recording', error);
            Alert.alert('Error', 'Failed to stop recording');
            setRecordingStatus('idle');
            setIsRecording(false);
        }
    };

    const transcribeAudio = async (fileUri) => {
        try {
            setTranscribingStatus(true);

            const formData = new FormData();
            
            formData.append('audio', {
                uri: fileUri,
                type: 'audio/m4a', 
                name: 'speech.m4a',
            });
        
            formData.append('userType', USER_TYPE);
            
            console.log('Sending audio for transcription...');
            const response = await fetch(`${API_URL}/transcribe`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Transcription failed: ${errorData.error || response.statusText}`);
            }
            
            const result = await response.json();
            console.log('Transcription result:', result);
            
            if (result.success && result.text) {
                setPrompt(result.text);
                Alert.alert('Success', 'Your speech has been transcribed');
            } else {
                Alert.alert('Transcription Error', 'Failed to transcribe audio');
            }
        } catch (error) {
            console.error('Error in transcribeAudio:', error);
            Alert.alert('Error', `Failed to transcribe audio: ${error.message}`);
        } finally {
            setTranscribingStatus(false);
            setRecordingStatus('idle');
        }
    };

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
        const ageAdjustedPrompt = `Generate a story suitable for an adult in the category '${category}' and write the story in ${lang}. User prompt: ${prompt}.`;
        try {
            const response = await fetch('http://192.168.4.75:3000/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: ageAdjustedPrompt, 
                    category, 
                    voiceId, 
                    lang,
                    userType: USER_TYPE 
                }),
            });

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            const data = await response.json();
            setStory(data.story);
            setAudioUrl(data.audioUrl);
            setImageUrl(data.imageUrl); 
            setPrompt("");
            setIsFavorite(false);
            await sendStoryToBackend(data.story, data.audioUrl, data.imageUrl);
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
            const response = await fetch(`${API_URL}/deduct-credits`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, userType: USER_TYPE }),
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

    const sendStoryToBackend = async (storyText, audioUrl, imageUrl) => {
        try {
            const response = await fetch(`${API_URL}/story`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt,
                    username, 
                    storyText, 
                    audioUrl,
                    imageUrl,
                    userType: USER_TYPE 
                }),
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

                <View style={styles.recordingControls}>
                    {transcribingStatus ? (
                        <View style={styles.transcribingContainer}>
                            <ActivityIndicator size="small" color="#00A86B" />
                            <Text style={styles.transcribingText}>Converting speech to text...</Text>
                        </View>
                    ) : (
                        <>
                            <TouchableOpacity 
                                style={[styles.recordButton, isRecording && styles.recordingActive]} 
                                onPress={isRecording ? stopRecording : startRecording}
                            >
                                <Ionicons 
                                    name={isRecording ? "stop" : "mic"} 
                                    size={24} 
                                    color="white" 
                                />
                            </TouchableOpacity>
                            <Text style={styles.recordingText}>
                                {isRecording 
                                    ? 'Tap to stop recording' 
                                    : recordingStatus === 'processing' 
                                    ? 'Processing...' 
                                    : recordingStatus === 'transcribing' 
                                    ? 'Transcribing...' 
                                    : 'Tap to record your story idea'}
                            </Text>
                        </>
                    )}
                </View>
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
                            source={{ uri: imageUrl || 'https://img.freepik.com/free-vector/gradient-childrens-day-illustration_23-2149365424.jpg' }} 
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
                                <Ionicons name="close-circle" size={28} color="#00B074" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView 
                            style={styles.modalContentScrollView}
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{paddingBottom: 20}}
                        >
                            {imageUrl && (
                                <Image 
                                    source={{ uri: imageUrl }} 
                                    style={styles.storyImage}
                                    resizeMode="cover"
                                />
                            )}
                            
                            <View style={styles.storyTextContainer}>
                                <Text style={styles.storyModalText}>{story}</Text>
                            </View>

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
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: '#121212', 
      paddingHorizontal: 16, 
      paddingTop: 24 
    },
    contentContainer: { 
      paddingBottom: 100 
    },
    title: { 
      fontSize: 26, 
      fontWeight: '700', 
      color: '#FFFFFF', 
      textAlign: 'center', 
      marginVertical: 24,
      letterSpacing: 0.5
    },
    card: {
      backgroundColor: '#1E1E1E', 
      padding: 20, 
      borderRadius: 16, 
      marginBottom: 24,
      borderColor: '#333333', 
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4
    },
    label: { 
      fontSize: 16, 
      fontWeight: '600', 
      color: '#E0E0E0', 
      marginBottom: 10,
      letterSpacing: 0.3
    },
    textArea: {
      backgroundColor: '#2A2A2A', 
      color: '#FFFFFF', 
      borderColor: '#444444',
      borderWidth: 1, 
      borderRadius: 12, 
      padding: 16, 
      fontSize: 16,
      minHeight: 100,
      textAlignVertical: 'top'
    },
    button: {
      backgroundColor: '#00B074', 
      padding: 16, 
      borderRadius: 12,
      marginVertical: 20, 
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5
    },
    buttonText: { 
      color: 'white', 
      fontSize: 18, 
      fontWeight: 'bold',
      letterSpacing: 0.5
    },
    storyCard: { 
      backgroundColor: '#232323', 
      padding: 20, 
      borderRadius: 16,
      marginVertical: 16
    },
    storyTitle: { 
      fontSize: 20, 
      fontWeight: 'bold', 
      color: '#FFFFFF', 
      marginBottom: 12 
    },
    storyText: { 
      fontSize: 16, 
      color: '#DDDDDD',
      lineHeight: 24 
    },
    favoriteButton: { 
      alignItems: 'center', 
      marginTop: 16,
      flexDirection: 'row',
      justifyContent: 'center'
    },
    audioContainer: { 
      marginTop: 24,
      backgroundColor: '#242424',
      borderRadius: 16,
      padding: 16,
      borderColor: '#333333',
      borderWidth: 1
    },
    audioButton: {
      backgroundColor: '#00B074', 
      padding: 14, 
      borderRadius: 12,
      alignItems: 'center', 
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'center'
    },
    seekButton: {
      backgroundColor: '#00B074',
      padding: 12,
      borderRadius: 50,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 3
    },
    audioTime: { 
      color: '#BBBBBB', 
      textAlign: 'center', 
      marginTop: 8,
      fontSize: 14
    },
    creditsContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginTop: 20,
      marginBottom: 10, 
      position: 'absolute',
      right: 16,
      top: 10,
      backgroundColor: 'rgba(30, 30, 30, 0.8)',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20
    },
    creditsText: { 
      color: '#FFFFFF', 
      marginLeft: 8, 
      fontSize: 16,
      fontWeight: '600' 
    },

    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(3px)'
    },
    loadingContainer: {
      backgroundColor: '#1E1E1E',
      borderRadius: 16,
      padding: 24,
      width: '85%',
      alignItems: 'center',
      borderColor: '#333333',
      borderWidth: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8
    },
    loadingText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '500',
      marginTop: 20,
      marginBottom: 24,
    },
    loadingImage: {
      width: 220,
      height: 170,
      borderRadius: 12,
      marginTop: 16,
      borderColor: '#333333',
      borderWidth: 1
    },
    
    storyModalContainer: {
        backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '90%', 
    borderColor: '#333333',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10
      },
      
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: '#333333',
      paddingBottom: 16,
    },
    modalTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#00B074',
      letterSpacing: 0.5
    },
    storyScrollView: {
        flex: 1, 
        minHeight: 250, 
        maxHeight: 350, 
        borderRadius: 12,
        backgroundColor: '#2A2A2A',
        padding: 16,
        borderColor: '#444444',
        borderWidth: 1,
        marginBottom: 8
    },
    storyModalText: {
      color: '#FFFFFF',
      fontSize: 16,
      lineHeight: 26,
    },
    storyImage: {
      width: '75%',
      height: 200,
      marginLeft:30,
      borderRadius: 12,
      marginBottom: 20,
      borderColor: '#444444',
      borderWidth: 1,
    },
    favoriteButtonModal: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 16,
      padding: 14,
      backgroundColor: '#2A2A2A',
      borderRadius: 12,
      borderColor: '#444444',
      borderWidth: 1,
    },
    audioControlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginVertical: 16,
      borderTopWidth: 1,
      borderTopColor: '#333333',
      paddingTop: 16
    },
    audioControlButton: {
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#2A2A2A',
      borderRadius: 10,
      minWidth: 80
    },
    playbackControlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      marginTop: 16,
      marginBottom: 8
    },
    recordingControls: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 16,
      justifyContent: 'flex-start'
    },
    recordButton: {
      backgroundColor: '#E53935',
      padding: 12,
      borderRadius: 50,
      width: 50,
      height: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
    },
    recordingActive: {
      backgroundColor: '#B71C1C',
      borderWidth: 2,
      borderColor: '#FF5252'
    },
    recordingText: {
      color: '#BBBBBB',
      fontSize: 14
    },
    transcribingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 8
    },
    transcribingText: {
      color: '#00B074',
      marginLeft: 10,
      fontSize: 14,
      fontWeight: '500'
    },
    viewStoryButton: {
      backgroundColor: '#00B074',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    }
  });