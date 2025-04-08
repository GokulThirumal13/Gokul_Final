import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');

  const [storedUsername, setStoredUsername] = useState('');
  const [storedAge, setStoredAge] = useState('');

  const API_URL = 'http://192.168.1.26:3001';

  useEffect(() => {
    async function fetchStoredData() {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedAge = await AsyncStorage.getItem('userAge');

      if (savedUsername) setStoredUsername(savedUsername);
      if (savedAge) setStoredAge(savedAge);
    }
    fetchStoredData();
  }, []);

  async function handleLogin() {
    const endpoint = isLogin ? '/login' : '/signup';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, age }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(isLogin ? 'Login Successful' : 'Signup Successful', data.message);
        if (isLogin) {
          await AsyncStorage.setItem('userAge', data.age.toString());
          await AsyncStorage.setItem('username', data.username);

          setStoredUsername(data.username);
          setStoredAge(data.age.toString());

          navigation.navigate("pages");
        } else {
          setIsLogin(true);
          setUsername("");
          setPassword("");
          setAge("");
        }
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Network Error');
    }
  }

  function toggle() {
    setIsLogin((prev) => !prev);
  }

  async function clearStorage() {
    await AsyncStorage.clear();
    setStoredUsername('');
    setStoredAge('');
    Alert.alert('Storage Cleared');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Age"
          placeholderTextColor="#aaa"
          keyboardType="numeric"
          value={age}
          onChangeText={setAge}
        />
      )}

      {isLogin && (
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handleLogin} style={styles.signInButton}>
        <Text style={styles.signInText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggle}>
        <Text style={styles.link}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Text style={styles.linkAction}>
            {isLogin ? 'Sign up now.' : 'Sign in.'}
          </Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.storedText}>Stored Username: {storedUsername || 'Not Set'}</Text>
      <Text style={styles.storedText}>Stored Age: {storedAge || 'Not Set'}</Text>

      <TouchableOpacity onPress={clearStorage} style={styles.clearButton}>
        <Text style={styles.signInText}>Clear Storage</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 25,
    paddingTop: 80,
  },
  logo: {
    height: 60,
    marginBottom: 30,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  signInButton: {
    backgroundColor: '#e50914',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  forgotPassword: {
    color: '#aaa',
    textAlign: 'right',
    marginBottom: 15,
  },
  link: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  linkAction: {
    color: '#fff',
    textDecorationLine: 'underline',
  },
  storedText: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 5,
  },
  clearButton: {
    backgroundColor: '#b00020',
    borderRadius: 5,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
});
