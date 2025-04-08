import { Text, View, TextInput, TouchableOpacity, StyleSheet} from 'react-native'
import React, { useState } from 'react'

const ForgotPassword=({navigation})=>{
    const[email,setEmail]=useState('');

    function handleResetPassword(){

        console.log("Reset link sent to: ",email);
        alert("A password reset link sent to an email");
        navigation.goBack();
        
    }
    return (
        <View style={styles.container}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.description}>Enter your email to receive a password reset link.</Text>
    
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#A0AEC0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
    
          <TouchableOpacity onPress={handleResetPassword} style={styles.button}>
            <Text style={styles.buttonText}>Send Reset Link</Text>
          </TouchableOpacity>
    
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back to Login</Text>
          </TouchableOpacity>
        </View>
      );
    };
    
    export default ForgotPassword;
    
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#1A202C',
        padding: 20,
        justifyContent: 'center',
      },
      title: {
        fontSize: 24,
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
      },
      description: {
        color: '#CBD5E0',
        textAlign: 'center',
        marginBottom: 20,
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
      backLink: {
        color: '#9F7AEA',
        textAlign: 'center',
        marginTop: 15,
        textDecorationLine: 'underline',
      },
    });
