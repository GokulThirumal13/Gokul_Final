// App.js
import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  TextInput, 
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import MQTT from 'sp-react-native-mqtt';

export default function Mtt() {
  const [mqttClient, setMqttClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [category, setCategory] = useState('fantasy');
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState('');

 
  useEffect(() => {
    setupMqtt();
    return () => {
      if (mqttClient) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const setupMqtt = async () => {
    try {
      const client = await MQTT.createClient({
        uri: 'mqtt://192:1883', 
        clientId: `mobile_control_${Math.random().toString(16).substr(2, 8)}`,
      });

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        setIsConnected(true);
        client.subscribe('soundbox/status', 0);
      });

      client.on('message', (msg) => {
        console.log('Received message:', msg);
        // Handle incoming messages if needed
      });

      client.on('error', (err) => {
        console.log('MQTT Error:', err);
        setError('MQTT connection error');
      });

      client.connect();
      setMqttClient(client);
    } catch (error) {
      console.log('MQTT Setup Error:', error);
      setError('Failed to setup MQTT client');
    }
  };

  // API call to generate story
  const generateStory = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt for your story');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://192.168.1.34:3000/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt,
          category: category,
          lang: 'English',
          voiceId: '21m00Tcm4TlvDq8ikWAM', // Default voice ID
          userType: 'children',
          age: 8
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        return;
      }

      setStory(data.story);
      setAudioUrl(data.audioUrl);
      setImageUrl(data.imageUrl);
      
      // Create QR data for controlling audio playback
      const controlData = {
        type: 'audio_control',
        audioUrl: data.audioUrl,
        imageUrl: data.imageUrl
      };
      
      setQrData(JSON.stringify(controlData));
      
    } catch (error) {
      console.error('Error generating story:', error);
      setError('Failed to generate story. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Playback control functions
  const sendControl = (command) => {
    if (!mqttClient || !isConnected) {
      setError('MQTT not connected');
      return;
    }

    try {
      mqttClient.publish('soundbox/control', JSON.stringify({ command }), 0, false);
    } catch (error) {
      console.error('Error sending command:', error);
      setError('Failed to send command');
    }
  };

  const play = () => sendControl('play');
  const pause = () => sendControl('pause');
  const stop = () => sendControl('stop');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Story Generator</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Story Prompt:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a story idea..."
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />
        
        <Text style={styles.label}>Category:</Text>
        <View style={styles.categoryContainer}>
          {['fantasy', 'adventure', 'mystery', 'educational'].map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.selectedCategory,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={generateStory}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Generate Story</Text>
          )}
        </TouchableOpacity>
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      
      {story ? (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Your Story:</Text>
          <Text style={styles.storyText}>{story}</Text>
          
          {imageUrl ? (
            <View style={styles.mediaContainer}>
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.storyImage} 
                resizeMode="contain"
              />
            </View>
          ) : null}
          
          <View style={styles.controlsContainer}>
            <Text style={styles.controlsTitle}>Audio Controls:</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity style={styles.controlButton} onPress={play}>
                <Text style={styles.controlButtonText}>▶️ Play</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={pause}>
                <Text style={styles.controlButtonText}>⏸️ Pause</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={stop}>
                <Text style={styles.controlButtonText}>⏹️ Stop</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {qrData ? (
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Scan to control on another device:</Text>
              <View style={styles.qrCode}>
                <QRCode
                  value={qrData}
                  size={200}
                />
              </View>
              <Text style={styles.qrInstructions}>
                Scan this QR code with the SoundBox Scanner app
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
      
      <View style={styles.connectionStatus}>
        <Text style={isConnected ? styles.connected : styles.disconnected}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4a6da7',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  inputContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 80,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginRight: 10,
    marginBottom: 10,
  },
  selectedCategory: {
    backgroundColor: '#4a6da7',
  },
  categoryText: {
    color: '#333',
  },
  generateButton: {
    backgroundColor: '#4a6da7',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    padding: 15,
    textAlign: 'center',
  },
  resultContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 15,
    marginTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  storyText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  mediaContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  storyImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  controlsContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  controlsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlButton: {
    flex: 1,
    backgroundColor: '#4a6da7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  qrCode: {
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  qrInstructions: {
    marginTop: 15,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  connectionStatus: {
    padding: 15,
    alignItems: 'center',
  },
  connected: {
    color: 'green',
    fontWeight: 'bold',
  },
  disconnected: {
    color: 'red',
    fontWeight: 'bold',
  },
});