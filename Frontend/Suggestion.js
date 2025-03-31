import React, { useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

const SuggestionsScreen = () => {
    const stories = ['The Hidden Castle', 'Moonlight Mystery', 'Adventures of Tom', 'Lost in the Woods'];
    const [suggestion, setSuggestion] = useState('');

    const getRandomSuggestion = () => {
        const randomStory = stories[Math.floor(Math.random()*stories.length)];
        setSuggestion(randomStory);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Suggestions</Text>
            <FlatList
                data={stories}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => <Text style={styles.listItem}>{item}</Text>}
            />
            <Button title="Get Random Suggestion" onPress={getRandomSuggestion} />
            {suggestion ? <Text style={styles.suggestionText}>Try: {suggestion}</Text> : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop:20,
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    listItem: {
        fontSize: 18,
        padding: 10,
        backgroundColor: '#fff',
        marginVertical: 5,
        width: '100%',
        textAlign: 'center',
        borderRadius: 8,
        elevation: 2,
    },
    suggestionText: {
        fontSize: 20,
        marginTop: 20,
        fontWeight: 'bold',
        color: '#007BFF',
    },
});

export default SuggestionsScreen;
