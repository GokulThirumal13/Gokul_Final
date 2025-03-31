import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet ,Image} from 'react-native';
// import { SafeAreaView } from 'react-native-web';
import { Alert } from 'react-native';
const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const API_URL = 'http://192.168.1.41:3001'; 
  async function handleLogin() {
    const endpoint = isLogin ? '/login' : '/signup';
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert(isLogin ? 'Login Successful' : 'Signup Successful', data.message);
        navigation.replace('Home');
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Network Error',);
    }
  }
  function toggle(){
    setIsLogin((prev) =>!prev);
  }
  return (
    <View style={styles.container}> 
    <Image source={require('./assets/story-removebg-preview(2).png')} style={styles.logo}/>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Signup'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#A0AEC0"
        value={username}
        onChangeText={setUsername}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#A0AEC0"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

{isLogin && (
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity onPress={handleLogin} style={styles.button}>
        <Text style={styles.buttonText}>{isLogin ? 'Login' : 'Signup'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={toggle}>
        <Text style={styles.link}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <Text style={{ textDecorationLine: 'underline', color: '#9F7AEA' }}>
            {isLogin ? 'Signup' : 'Login'}
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A202C',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: 'white',
    marginBottom: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#2D3748',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#6B46C1',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    color: '#CBD5E0',
    marginTop: 20,
    textAlign: 'center',
  },
  logo: {
    width: 350,
    height: 200,
    alignSelf: 'center',
    marginBottom: 30,
  },
  forgotPassword: {
    color: '#9F7AEA',
    textAlign: 'right',
    marginBottom: 15,
    textDecorationLine: 'underline',
  },
  
});
