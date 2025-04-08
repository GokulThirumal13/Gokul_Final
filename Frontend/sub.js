import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const plans = [
  { name: 'Basic', amount: 49, credits: 100 },
  { name: 'Standard', amount: 99, credits: 250 },
  { name: 'Premium', amount: 199, credits: 600 },
];
const SubscriptionPage = ({ username ,navigation}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe=async()=>{
    if (!selectedPlan) {
      return Alert.alert('Please select a plan');
    }
    try{
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
      Alert.alert('Error', 'Could not subscribe. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
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
          <Text style={styles.planPrice}>₹{plan.amount}</Text>
          <Text style={styles.planCredits}>{plan.credits} credits</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.subscribeBtn} onPress={handleSubscribe}>
        <Text style={styles.subscribeText}>Subscribe</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>navigation.navigate('Login')}>
        <Text>Subscribe</Text>
      </TouchableOpacity>
    </View>

  );
};
const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 20,
    },
    planCard: {
      padding: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#ccc',
      marginBottom: 15,
    },
    selectedCard: {
      borderColor: '#007bff',
      backgroundColor: '#e6f0ff',
    },
    planName: {
      fontSize: 18,
      fontWeight: '600',
    },
    planPrice: {
      fontSize: 16,
      color: '#555',
    },
    planCredits: {
      fontSize: 14,
      color: '#888',
    },
    subscribeBtn: {
      backgroundColor: '#007bff',
      padding: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    subscribeText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });
export default SubscriptionPage;
