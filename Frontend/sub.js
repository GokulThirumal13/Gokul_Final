import React, { useState, useEffect } from 'react';
import {View,Text,StyleSheet,ScrollView,TouchableOpacity,ImageBackground,StatusBar,Alert,SafeAreaView,ToastAndroid,Platform} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SubscriptionPage = ({ navigation, route }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [username, setUsername] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('username');
        if (name) {
          setUsername(name);
          await checkSubscriptionStatus(name);
        } else {

          navigation.replace('Login');
        }
        setLoading(false);
      } catch (error) {
        console.log("Error loading user data:", error);
        setLoading(false);
      }
    };

    checkUserData();
  }, []);

  const checkSubscriptionStatus = async (username) => {
    try {
      const response = await axios.get(`http://192.168.1.27:3001/subscription-status?username=${username}`);
      if (response.data.success && response.data.subscription) {
        setUserSubscription(response.data.subscription);
        
        const daysLeft = calculateDaysLeft(response.data.subscription.expiryDate);
        if (daysLeft > 0) {
          if (Platform.OS === 'android') {
            ToastAndroid.showWithGravity(
              `You have an active ${response.data.subscription.plan} plan (${daysLeft} days left)`,
              ToastAndroid.LONG,
              ToastAndroid.CENTER
            );
          } else {
            Alert.alert('Active Subscription', 
              `You have an active ${response.data.subscription.plan} plan (${daysLeft} days left)`,
              [{ text: 'Continue to Stories', onPress: () => navigation.navigate('pages') }]
            );
          }
        }
      }
    } catch (error) {
      console.log("Error checking subscription:", error);
    }
  };

  const calculateDaysLeft = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const plans = [{id: 'free',name: 'Free',
      price: '₹0',
      period: '',
      color: '#444',features: [{ text: 'Limited Story Credits', included: true },{ text: 'Basic Stories', included: true },{ text: 'With Ads', included: true },
        { text: 'Limited Downloads', included: true },
        { text: 'Premium Stories', included: false },
        { text: '24/7 Support', included: false },
      ],
      credits: 20
    },
    {
      id: 'individual',
      name: 'Individual',
      price: '₹119',
      period: '/month',
      color: '#1DB954', 
      features: [
        { text: '250 Story Credits', included: true },
        { text: 'All Stories', included: true },
        { text: 'Ad-free Experience', included: true },
        { text: 'Unlimited Downloads', included: true },
        { text: 'Offline Mode', included: true },
        { text: 'Premium Support', included: true },
      ],
      credits: 250
    },
    {
      id: 'family',
      name: 'Family',
      price: '₹199',
      period: '/month',
      color: '#6C33C5',
      features: [
        { text: '600 Story Credits', included: true },
        { text: 'All Stories + Exclusives', included: true },
        { text: 'Ad-free Experience', included: true },
        { text: 'Unlimited Downloads', included: true },
        { text: 'Share with Family', included: true },
        { text: 'Priority 24/7 Support', included: true },
      ],
      credits: 600
    }
  ];

  const handleSubscribe = async () => {
    if (!selectedPlan || !username) {
      Alert.alert('Error', 'Please select a plan and ensure you are logged in.');
      return;
    }
    try{
      console.log("Attempting to subscribe with data:",{
        username,
        credits:selectedPlan.credits,
        plan:selectedPlan.id,
        expiryDate:calculateExpiryDate(2)
      });

      const response = await axios.post('http://192.168.1.27:3001/add-credits', {
        username,
        credits: selectedPlan.credits,
        plan: selectedPlan.id,
        expiryDate: calculateExpiryDate(30) 
      });
      console.log("Subscription response:",response.data);
      if (response.data.success) {
        setUserSubscription({
          plan:selectedPlan.id,
          expiryDate:calculateExpiryDate(2),
        });
        await checkSubscriptionStatus(username);
        Alert.alert('Success', 'Subscription activated successfully!', [
          { text: 'OK', onPress: () => navigation.navigate('pages') }
        ]);
      } else {
        Alert.alert('Failed', response.data.message);
      }
    } catch (error) {
      console.log("Subscription error:", error);
      console.log("Error details:",error.response?.data||"No response data");
      if(error.response?.status===404){

      Alert.alert('Connection Error', 'Could not connect to subscription service.');
      }else{
        Alert.alert('Error',error.response?.data?.message||'could not subscribe.Please try again later')
      }
    }
  };

  const calculateExpiryDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  };

  const navigateToPages = () => {
    navigation.navigate('pages');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading subscription information...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ImageBackground
        source={{ uri: 'https://img.freepik.com/free-photo/abstract-colorful-splash-3d-background-generative-ai-background_60438-2509.jpg' }}
        style={styles.headerBg}
        blurRadius={20}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Choose your plan</Text>
          <Text style={styles.headerSubtitle}>Listen to stories without limits</Text>
        </View>
      </ImageBackground>

      {userSubscription && (
        <View style={styles.activeSubscription}>
          <Text style={styles.activeSubscriptionText}>
            Your current plan: {userSubscription.plan.charAt(0).toUpperCase() + userSubscription.plan.slice(1)}
          </Text>
          <Text style={styles.activeSubscriptionExpiry}>
            Expires in: {calculateDaysLeft(userSubscription.expiryDate)} days
          </Text>
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={navigateToPages}
          >
            <Text style={styles.continueButtonText}>Continue to Stories</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.content}>
        <View style={styles.plansContainer}>
          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan?.id === plan.id && { borderColor: plan.color, borderWidth: 2 }
              ]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={[styles.planHeader, { backgroundColor: plan.color }]}>
                <Text style={styles.planName}>{plan.name}</Text>
              </View>
              
              <View style={styles.planDetails}>
                <Text style={styles.planPrice}>{plan.price}<Text style={styles.planPeriod}>{plan.period}</Text></Text>
                
                {plan.features.map((feature, index) => (
                  <View key={index} style={styles.featureRow}>
                    {feature.included ? (
                      <Ionicons name="checkmark-circle" size={20} color={plan.color} />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#666" />
                    )}
                    <Text style={[
                      styles.featureText,
                      !feature.included && styles.featureTextDisabled
                    ]}>
                      {feature.text}
                    </Text>
                  </View>
                ))}
              </View>
              
              {selectedPlan?.id === plan.id && (
                <View style={[styles.selectedIndicator, { backgroundColor: plan.color }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>
            Subscription automatically renews monthly unless canceled. 
            You can cancel anytime. Terms and conditions apply.
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            !selectedPlan && styles.disabledButton,
            selectedPlan && { backgroundColor: selectedPlan.color }
          ]}
          onPress={handleSubscribe}
          disabled={!selectedPlan}
        >
          <Text style={styles.subscribeButtonText}>
            {selectedPlan ? `GET ${selectedPlan.name.toUpperCase()}` : 'Select a plan'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212', 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  headerBg: {
    height: 180,
  },
  headerContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#ddd',
    marginTop: 8,
  },
  activeSubscription: {
    backgroundColor: '#1E1E1E',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1DB954',
  },
  activeSubscriptionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeSubscriptionExpiry: {
    color: '#ddd',
    fontSize: 14,
    marginTop: 4,
  },
  continueButton: {
    backgroundColor: '#1DB954',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  plansContainer: {
    padding: 16,
  },
  planCard: {
    backgroundColor: '#212121',
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#333',
  },
  planHeader: {
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  planDetails: {
    padding: 16,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  planPeriod: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 8,
    fontSize: 15,
    color: '#eee',
  },
  featureTextDisabled: {
    color: '#777',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#121212',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  subscribeButton: {
    backgroundColor: '#1DB954', 
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#444',
  },
  subscribeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default SubscriptionPage;