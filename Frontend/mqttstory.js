import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Switch } from 'react-native';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import mqtt from 'precompiled-mqtt';
const API_URL = 'https://gar-on-midge.ngrok-free.app';
const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt'; 

export default function MqttStory() {
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('fantasy');
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [mqttStatus, setMqttStatus] = useState('Disconnected');
  const [mqttClient, setMqttClient] = useState(null);

  const [availableTopics, setAvailableTopics] = useState([
    'soundbox/commands',
    'soundbox/audio',
    'soundbox/status',
    'soundbox/test'
  ]);

  const [selectedTopic, setSelectedTopic] = useState('soundbox/commands');
  
  useEffect(() => {
    if (isSubscribed) {
      connectMqtt();
    } else {
      disconnectMqtt();
    }
    return () => disconnectMqtt();
  }, [isSubscribed]);

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  const connectMqtt = () => {
    try {
      setMqttStatus('Connecting...');

      const options = {
        keepalive: 60,
        clientId: `storysphere_${Math.random().toString(16).substr(2, 8)}`,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
      };
      
      const client = mqtt.connect(MQTT_BROKER, options);
      
      client.on('connect', () => {
        setMqttStatus('Connected');
        client.subscribe(selectedTopic);
      });

      client.on('message', (topic, message) => {
        console.log(`Message received on topic: ${topic}`);
        
        
        setStory(message.toString());
        
        if (topic === 'soundbox/audio') {
          try {
            const data = JSON.parse(message.toString());
            setAudioUrl(data.url);
            setImageUrl(data.imageUrl);
          } catch (e) {
            console.error('Error parsing audio data:', e);
          }
        }
      });

      client.on('error', (err) => {
        setMqttStatus(`Error: ${err.message}`);
      });

      setMqttClient(client);
    } catch (error) {
      setMqttStatus(`Failed: ${error.message}`);
    }
  };

  const disconnectMqtt = () => {
    if (mqttClient) {
      mqttClient.end();
      setMqttStatus('Disconnected');
      setMqttClient(null);
    }
  };

  const categories = [
    'fantasy', 'adventure', 'mystery', 'educational', 'animals'
  ];

  const generateStory = async () => {
    if (!prompt.trim()) {
      alert('Please enter a story prompt');
      return;
    }
    setLoading(true);
    setStory('');
    setAudioUrl(null);
    setImageUrl(null);

    try {
      const response = await fetch(`${API_URL}/generate-story`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          category,
          lang: 'English',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          userType: 'child',
          age: 8
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setStory(data.story);
        setAudioUrl(data.audioUrl);
        setImageUrl(data.imageUrl);
      } else {
        alert(`Error: ${data.error || 'Failed to generate story'}`);
      }
    } catch (error) {
      alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const playSound = async () => {
    if (audioUrl) {
      if (sound) await sound.unloadAsync();
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setIsPlaying(true);
      
      newSound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) setIsPlaying(false);
      });
    }
  };

  const pauseSound = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Story Time</Text>
      
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Subscribe:</Text>
        <Switch
          value={isSubscribed}
          onValueChange={setIsSubscribed}
        />
        <Text style={styles.mqttStatus}>{mqttStatus}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!isSubscribed ? (
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              value={prompt}
              onChangeText={setPrompt}
              placeholder="Enter your story idea..."
              multiline
            />
            
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Category:</Text>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                style={styles.picker}
              >
                {categories.map((cat) => (
                  <Picker.Item key={cat} label={cat} value={cat} />
                ))}
              </Picker>
            </View>

            <View style={styles.topicSelector}>
                <Text style={styles.label}>Topic:</Text>
                <Picker
                  selectedValue={selectedTopic}
                  onValueChange={(itemValue) => {
                    setSelectedTopic(itemValue);
                    if (mqttClient && mqttClient.connected) {
                      mqttClient.unsubscribe(selectedTopic);
                      mqttClient.subscribe(itemValue);
                    }
                  }}
                  style={styles.picker}
                >
                  {availableTopics.map((topic) => (
                    <Picker.Item key={topic} label={topic} value={topic} />
                  ))}
                </Picker>
            </View>
            
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateStory}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Generating...' : 'Create Story'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.subscribeContainer}>
            <Text style={styles.subscribeTitle}>Listening Mode</Text>
            <Text style={styles.subscribeText}>
              Connected to topic: {selectedTopic}
            </Text>
          </View>
        )}
        
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#000" />
          </View>
        )}
        
        {story && (
          <View style={styles.storyContainer}>
            {imageUrl && (
              <Image
                source={{ uri: imageUrl }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            )}
            
            <Text style={styles.storyText}>{story}</Text>
            
            {audioUrl && (
              <TouchableOpacity
                style={styles.audioButton}
                onPress={isPlaying ? pauseSound : playSound}
              >
                <Text style={styles.audioButtonText}>
                  {isPlaying ? 'Pause' : 'Play'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginHorizontal: 15,
    marginBottom: 10,
  },
  toggleLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  mqttStatus: {
    fontSize: 12,
    marginLeft: 8,
    color: '#555',
  },
  inputSection: {
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    marginBottom: 10,
    padding: 5,
  },
  picker: {
    height: 70,
  },
  generateButton: {
    backgroundColor: '#000',
    borderRadius: 4,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  loaderContainer: {
    padding: 20,
    alignItems: 'center',
  },
  storyContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 15,
    marginTop: 15,
  },
  storyImage: {
    width: '100%',
    height: 180,
    borderRadius: 4,
    marginBottom: 10,
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 10,
  },
  audioButton: {
    backgroundColor: '#000', 
    borderRadius: 4,
    padding: 10,
    alignItems: 'center', 
    marginTop: 5,
  },
  audioButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  subscribeContainer: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    padding: 15,
    alignItems: 'center',
  },
  subscribeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subscribeText: {
    fontSize: 14,
    textAlign: 'center',
  }
});