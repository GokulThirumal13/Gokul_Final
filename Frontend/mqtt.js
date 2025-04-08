import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import axios from 'axios';
import MQTT from 'react-native-mqtt';

const MQTT_BROKER_URL = 'mqtts://beb012dc0fcc4a7c9b4dc857f1be38db.s1.eu.hivemq.cloud';
const API_BASE_URL = 'http://192.168.1.13:3002'; 
const Mt= () => {
  const [mqttClient, setMqttClient] = useState(null);
  useEffect(() => {
    MQTT.createClient({
      uri: MQTT_BROKER_URL,
      clientId: 'react_native_client',
    }).then(client => {
      setMqttClient(client);
      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client.subscribe('audio/control');
      });

      client.on('message', (topic, message) => {
        console.log(`Received message on topic ${topic}: ${message}`);
      });

      client.connect();
    });

    return () => {
      if (mqttClient) {
        mqttClient.disconnect();
      }
    };
  }, [mqttClient]);

  const handlePlay = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/play`);
      console.log(response.data.message);

      if (mqttClient) {
        mqttClient.publish('audio/control', 'play');
      }
    } catch (error) {
      console.error('Error sending play command:', error);
    }
  };

  const handlePause = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/pause`);
      console.log(response.data.message);

      if (mqttClient) {
        mqttClient.publish('audio/control', 'pause');
      }
    } catch (error) {
      console.error('Error sending pause command:', error);
    }
  };

  const handleClear = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/clear`);
      console.log(response.data.message);

      if (mqttClient) {
        mqttClient.publish('audio/control', 'clear');
      }
    } catch (error) {
      console.error('Error sending clear command:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Control</Text>
      <Button title="Play" onPress={handlePlay} />
      <Button title="Pause" onPress={handlePause} />
      <Button title="Clear" onPress={handleClear} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default Mt;
