import React, { useState, useEffect } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,Image,Alert,StatusBar,ScrollView,KeyboardAvoidingView,}from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('Set your heart ablaze');

  const [storedUsername, setStoredUsername] = useState('');
  const [storedAge, setStoredAge] = useState('');
  const [storedEmail, setStoredEmail] = useState('');
  const [storedPhone, setStoredPhone] = useState('');
  const [storedLocation, setStoredLocation] = useState('');

  const API_URL = 'http://192.168.1.27:3001';

  useEffect(() => {
    async function fetchStoredData() {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedAge = await AsyncStorage.getItem('userAge');
      const savedEmail = await AsyncStorage.getItem('userEmail');
      const savedPhone = await AsyncStorage.getItem('userPhone');
      const savedLocation = await AsyncStorage.getItem('userLocation');

      if (savedUsername) setStoredUsername(savedUsername);
      if (savedAge) setStoredAge(savedAge);
      if (savedEmail) setStoredEmail(savedEmail);
      if (savedPhone) setStoredPhone(savedPhone);
      if (savedLocation) setStoredLocation(savedLocation);
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
          await AsyncStorage.setItem('userEmail', data.email || email);
          await AsyncStorage.setItem('userPhone', data.phone || phone);
          await AsyncStorage.setItem('userLocation', data.location || location);
          await AsyncStorage.setItem('userBio', data.bio || bio);

          setStoredUsername(data.username);
          setStoredAge(data.age.toString());
          setStoredEmail(data.email || email);
          setStoredPhone(data.phone || phone);
          setStoredLocation(data.location || location);

          navigation.navigate('sub');
        } else {
          await AsyncStorage.setItem('username', username);
          await AsyncStorage.setItem('userAge', age);
          await AsyncStorage.setItem('userEmail', email);
          await AsyncStorage.setItem('userPhone', phone);
          await AsyncStorage.setItem('userLocation', location);
          await AsyncStorage.setItem('userBio', bio);

          setIsLogin(true);
          setUsername('');
          setPassword('');
          setAge('');
          setEmail('');
          setPhone('');
          setLocation('');
          setBio('Set your heart ablaze');
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
    setStoredEmail('');
    setStoredPhone('');
    setStoredLocation('');
    Alert.alert('Storage Cleared');
  }

  return (
    <ScrollView  style={{ backgroundColor: '#121212' }} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        }}
        style={styles.logo}
        resizeMode="contain"
      />

      <Image
        source={require('./assets/login.png')} 
        style={styles.authImage}
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
        <>
          <TextInput
            style={styles.input}
            placeholder="Age"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            style={styles.input}
            placeholder="Location"
            placeholderTextColor="#aaa"
            value={location}
            onChangeText={setLocation}
          />
          <TextInput
            style={styles.input}
            placeholder="Bio"
            placeholderTextColor="#aaa"
            value={bio}
            onChangeText={setBio}
          />
        </>
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
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Text style={styles.linkAction}>
            {isLogin ? 'Sign up now.' : 'Sign in.'}
          </Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.storedText}>Stored Username: {storedUsername || 'Not Set'}</Text>
      <Text style={styles.storedText}>Stored Age: {storedAge || 'Not Set'}</Text>
      <Text style={styles.storedText}>Stored Email: {storedEmail || 'Not Set'}</Text>
      <Text style={styles.storedText}>Stored Phone: {storedPhone || 'Not Set'}</Text>
      <Text style={styles.storedText}>Stored Location: {storedLocation || 'Not Set'}</Text>

      <TouchableOpacity onPress={clearStorage} style={styles.clearButton}>
        <Text style={styles.signInText}>Clear Storage</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    marginTop: -10,
    justifyContent: 'center',
    paddingHorizontal: 25,
    paddingBottom: 60, 
  
  },
  logo: {
    height: 60,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    color: '#1DB954',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 25,
  },
  input: {
    backgroundColor: '#2A2A2A',
    color: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  signInButton: {
    backgroundColor: '#1DB954',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 25,
  },
  signInText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  forgotPassword: {
    color: '#B3B3B3',
    textAlign: 'right',
    marginBottom: 20,
  },
  authImage: {
  width: '50%',      
  height: 100,        
  marginBottom: 20,   
  borderRadius: 10,   
  alignSelf: 'center',
  resizeMode: 'contain' 
},

  link: {
    color: '#B3B3B3',
    textAlign: 'center',
    fontSize: 15,
  },
  linkAction: {
    color: '#1DB954',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  storedText: {
    color: '#888',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 3,
  },
  clearButton: {
    backgroundColor: '#3E3E3E',
    borderRadius: 30,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 15,
  },
});