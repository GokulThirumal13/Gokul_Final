import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 


const plans = [
  { name: 'Basic', amount: 49, credits: 100, perks: ['100 Credits'] },
  { name: 'Standard', amount: 99, credits: 250, perks: ['250 Credits'] },
  { name: 'Premium', amount: 199, credits: 600, perks: ['600 Credits'] },
];

const SubscriptionPage = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username').then(name => {
      setUsername(name);
    });
  }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan || !username) {
      Alert.alert('Error', 'Please select a plan and ensure you are logged in.');
      return;
    }
    try {
      const response = await axios.post('http://192.168.1.26:3001/add-credits', {
        username,
        credits: selectedPlan.credits,
      });
      if (response.data.success) {
        navigation.navigate('pages');
      } else {
        Alert.alert('Failed', response.data.message);
      }
    } catch (error) {
      console.log("Subscription error:", error);
      Alert.alert('Error', 'Could not subscribe. Please try again later.');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Welcome to CreditBoost!</Text>
            <Text style={styles.stepText}>Earn and spend credits for premium services.</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setCurrentStep(1)}>
              <Text style={styles.nextText}>Next</Text>
            </TouchableOpacity>
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Why Upgrade?</Text>
            <Text style={styles.stepText}>• Get more credits instantly</Text>
            <Text style={styles.stepText}>• Unlock premium features</Text>
            <Text style={styles.stepText}>• No hidden charges</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={() => setCurrentStep(2)}>
              <Text style={styles.nextText}>View Plans</Text>
            </TouchableOpacity>
          </View>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Choose Your Plan</Text>
            {plans.map((plan, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.planCard,
                  selectedPlan?.name === plan.name && styles.selectedCard,
                ]}
                onPress={() => setSelectedPlan(plan)}
              >
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planPrice}>₹{plan.amount} / month</Text>
                <View style={styles.perksContainer}>
                  {plan.perks.map((perk, idx) => (
                    <Text key={idx} style={styles.perk}>• {perk}</Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
              <Text style={styles.subscribeText}>
                {selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Select a Plan'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginText}>Back to Login</Text>
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {renderStepContent()}

      <View style={styles.topRightIcon}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={28} color="red" />
                    </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#0f1115',
    flexGrow: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 25,
  },
  planCard: {
    backgroundColor: '#1c1f26',
    padding: 25,
    borderRadius: 15,
    marginBottom: 20,
    width: '100%',
    borderColor: '#444',
    borderWidth: 2,
  },
  selectedCard: {
    borderColor: '#e50914',
    backgroundColor: '#2c2f36',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPrice: {
    fontSize: 18,
    color: '#bbb',
    marginTop: 5,
  },
  perksContainer: {
    marginTop: 10,
  },
  perk: {
    color: '#ccc',
    fontSize: 14,
    marginVertical: 2,
  },
  topRightIcon: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  
  subscribeBtn: {
    backgroundColor: '#e50914',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    marginTop: 20,
    color: '#999',
    textDecorationLine: 'underline',
  },
  stepContainer: {
    padding: 30,
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  stepText: {
    fontSize: 16,
    color: '#ccc',
    marginBottom: 10,
    textAlign: 'center',
  },
  nextBtn: {
    marginTop: 30,
    backgroundColor: '#e50914',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  nextText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
});

export default SubscriptionPage;
