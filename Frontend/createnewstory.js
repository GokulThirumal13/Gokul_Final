import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';

export default function NewStoryPrompt() {
    const [prompt, setPrompt] = useState('');
    const [story, setStory] = useState('');
    const [audioUrl, setAudioUrl] = useState(null);
    const navigation = useNavigation();
    
    const handleSubmit = async () => {
        if (prompt.trim().length === 0) {  
            Alert.alert('Error', 'Please enter a prompt.');
            return;
        }

        try {
            const response = await fetch('http://192.168.1.15:3000/generate-story', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status} - ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Generated story:', data.story);
            setStory(data.story);
            setPrompt('');

        }catch (error) {
            console.error('Error generating story:', error);
            Alert.alert('Error', 'Failed to generate story');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>Create Your Story</Text>

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
                <TouchableOpacity style={styles.micButton}>
                    <Icon name="microphone" size={24} color="#2563eb" />
                </TouchableOpacity>
            </View>

    
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Generate Story</Text>
            </TouchableOpacity>

            {story !== '' && (
                <View style={styles.storyCard}>
                    <Text style={styles.storyTitle}>Generated Story:</Text>
                    <Text style={styles.storyText}>{story}</Text>
                </View>
            )}

            {audioUrl && (
                <TouchableOpacity style={styles.audioButton}>
                    <Text style={styles.buttonText}>Play Audio</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#F3F4F6',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 20,
    },
    contentContainer: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    card: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    textArea: {
        height: 80,
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9FAFB',
        textAlignVertical: 'top',
    },
    micButton: {
        position: 'absolute',
        right: 16,
        bottom: 20,
    },
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginVertical: 10,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    storyCard: {
        backgroundColor: '#FFFFFF',
        padding: 18,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 4,
        marginTop: 20,
    },
    storyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    storyText: {
        fontSize: 16,
        color: '#374151',
        lineHeight: 24,
    },
    audioButton: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 12,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 4,
        elevation: 3,
    },
});

