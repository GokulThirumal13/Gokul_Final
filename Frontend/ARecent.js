import React, { useEffect, useState } from 'react';
import {
    View, 
    Text, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView, 
    Alert, 
    ActivityIndicator
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ARecentStories() {
    const [stories, setStories] = useState([]);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    const [username, setUsername] = useState('');
    const API_URL = 'http://192.168.4.75';
    useEffect(() => {
        const fetchUserData = async () => {
            const savedUsername = await AsyncStorage.getItem('username');
            if (savedUsername) setUsername(savedUsername);
        };
        fetchUserData();
    }, []);
    useEffect(() => {
        if (!username) return;
        const fetchStories = async () => {
            try {
                const response = await fetch(`${API_URL}:3001/story?username=${username}&userType=adult`);
                if (!response.ok) throw new Error('Failed to fetch adult stories');
                const data = await response.json();
                setStories(data);
            } catch (error) {
                console.error('Error fetching adult stories:', error);
                Alert.alert('Error', 'Failed to load recent adult stories');
            }
        };
        fetchStories();
    }, [username]);
    const toggleAudio = async (audioUrl) => {
        try {
            if (sound && currentAudio === audioUrl) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } else {
                    await sound.playAsync();
                    setIsPlaying(true);
                }
                return;
            }

            if (sound) {
                await sound.unloadAsync();
            }

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: audioUrl },
                { shouldPlay: true }
            );

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentAudio(null);
                    newSound.unloadAsync();
                }
            });

            setSound(newSound);
            setIsPlaying(true);
            setCurrentAudio(audioUrl);
        } catch (error) {
            console.error('Error playing audio:', error);
            Alert.alert('Error', 'Failed to play audio');
        }
    };

    const clearAllStories = async () => {
        try {
            const response = await fetch(`${API_URL}:3001/story`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userType: 'adult' })
            });
            
            if (!response.ok) throw new Error('Failed to delete adult stories');
            setStories([]);
            Alert.alert('Success', 'All adult stories have been deleted');
        } catch (error) {
            console.error('Error deleting adult stories:', error);
            Alert.alert('Error', 'Failed to delete adult stories');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>🎧 Adult Stories</Text>
                <TouchableOpacity onPress={clearAllStories} style={styles.clearButton}>
                    <Ionicons name="trash" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {stories.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <ActivityIndicator size="large" color="#1DB954" />
                    <Text style={styles.emptyText}>No adult stories found</Text>
                </View>
            ) : (
                stories.map((story, index) => (
                    <LinearGradient
                        key={index}
                        colors={['#1e1e1e', '#2a2a2a']}
                        style={styles.storyCard}
                    >
                        <View style={styles.cardContent}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.storyTitle}>{story.username}</Text>
                                <Text style={styles.storyText}>
                                    {story.storyText.length > 100
                                        ? story.storyText.slice(0, 100) + "..."
                                        : story.storyText}
                                </Text>
                            </View>
                            {story.audioUrl ? (
                                <TouchableOpacity
                                    onPress={() => toggleAudio(story.audioUrl)}
                                    style={styles.playButton}
                                >
                                    <Ionicons
                                        name={
                                            isPlaying && currentAudio === story.audioUrl
                                                ? "pause"
                                                : "play"
                                        }
                                        size={24}
                                        color="white"
                                    />
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.noAudioText}>No audio</Text>
                            )}
                        </View>
                    </LinearGradient>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    clearButton: {
        backgroundColor: '#e74c3c',
        padding: 8,
        borderRadius: 20,
    },
    storyCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    storyTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    storyText: {
        color: '#b3b3b3',
        marginTop: 4,
        fontSize: 14,
    },
    playButton: {
        marginLeft: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1DB954',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1DB954',
        shadowOpacity: 0.5,
        shadowRadius: 4,
    },
    noAudioText: {
        color: 'gray',
        fontStyle: 'italic',
        marginLeft: 10,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
    emptyText: {
        color: '#b3b3b3',
        marginTop: 16,
        fontSize: 16,
        textAlign: 'center',
    }
});