import React, { useEffect, useState } from 'react';
import { 
    View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator 
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecentStories() {
    const [stories, setStories] = useState([]);
    const [sound, setSound] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentAudio, setCurrentAudio] = useState(null);
    useEffect(() => {
        const fetchStories = async () => {
            try {
                const response = await fetch('http://192.168.1.26:3001/story');
                if (!response.ok) throw new Error('Failed to fetch stories');
                const data = await response.json();
                setStories(data);
            } catch (error) {
                console.error('Error fetching stories:', error);
                Alert.alert('Error', 'Failed to load recent stories');
            }
        };
        fetchStories();
    }, []);

    const toggleAudio=async(audioUrl)=>{
        try {
            if (sound && currentAudio === audioUrl) {
                if (isPlaying) {
                    await sound.pauseAsync();
                    setIsPlaying(false);
                } 
                else 
                {
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
            const response = await fetch('http://192.168.1.26:3001/story', {
                method: 'DELETE', 
            });
            if (!response.ok) throw new Error('Failed to delete stories');
            setStories([]);
            Alert.alert('Success', 'All stories have been deleted');
        } catch (error) {
            console.error('Error deleting stories:', error);
            Alert.alert('Error', 'Failed to delete stories');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Recent Stories</Text>

            <TouchableOpacity style={styles.clearButton} onPress={clearAllStories}>
                <Ionicons name="trash-bin" size={24} color="white" />
                <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>

            {stories.length === 0 ? (
                <ActivityIndicator size="large" color="#6B46C1" />
            ) : (
                stories.map((story, index) => (
                    <LinearGradient 
                        key={index} 
                        colors={['#242038', '#5D576B']} 
                        style={styles.storyCard}
                    >
                        <View style={styles.cardHeader}>
                            <Text style={styles.storyTitle}>{story.username}</Text>
                        </View>

                        <Text style={styles.storyText}>
                            {story.storyText.length > 100 
                                ? story.storyText.slice(0, 100) + "..." 
                                : story.storyText}
                        </Text>
                        {story.audioUrl ? (
                            <TouchableOpacity
                                style={styles.audioButton}
                                onPress={() => toggleAudio(story.audioUrl)}
                            >
                                <Ionicons 
                                    name={isPlaying && currentAudio === story.audioUrl ? "pause-circle" : "play-circle"} 
                                    size={32} 
                                    color="white" 
                                />
                                <Text style={styles.buttonText}>
                                    {isPlaying && currentAudio === story.audioUrl ? "Pause" : "Play"} Audio
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={styles.noAudioText}>No audio available</Text>
                        )}
                    </LinearGradient>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: 
    {
         padding: 10 
        },
    title: 
    { 
        fontSize: 22, fontWeight: "bold", color: "white", marginBottom: 10 
    },
    storyCard: 
    { 
        padding: 15, borderRadius: 10, marginBottom: 10 
    },
    cardHeader: 
    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" 

    },
    storyTitle: 
    { 
        fontSize: 18, fontWeight: "bold", color: "white" 
    },
    storyText: 
    { color: "white", marginTop: 5 },
    audioButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
    buttonText: { color: "white", marginLeft: 5 },
    noAudioText: { color: "gray", marginTop: 5 },
    clearButton: { 
        flexDirection: "row", 
        alignItems: "center", 
        backgroundColor: "#e74c3c", 
        padding: 10, 
        borderRadius: 5, 
        marginBottom: 15
    },
    clearButtonText: { 
        color: "white", 
        marginLeft: 10, 
        fontSize: 16 
    }
});
