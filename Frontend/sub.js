import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const plans = [
  {
    name: 'Basic',
    amount: 49,
    credits: 100,
    perks: [
      '100 Credits',
      'Access to Free Stories',
      'Limited Downloads',
      'Email Support',
    ],
  },
  {
    name: 'Standard',
    amount: 99,
    credits: 250,
    perks: [
      '250 Credits',
      'Free + Premium Stories',
      'Unlimited Downloads',
      'Priority Support',
      'Ad-Free Experience',
    ],
  },
  {
    name: 'Premium',
    amount: 199,
    credits: 600,
    perks: [
      '600 Credits',
      'All Stories Access',
      'Offline Mode',
      '24/7 Support',
      'Early Access + Bonuses',
    ],
  },
];

const SubscriptionPage = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('username').then(name => {
      setUsername(name);
    });
  }, []);

  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  const goToSlide = (index) => {
    scrollRef.current.scrollTo({ x: index * width, animated: true });
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !username) {
      Alert.alert('Error', 'Please select a plan and ensure you are logged in.');
      return;
    }
    try {
      const response = await axios.post('http://192.168.1.27:3001/add-credits', {
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

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        pagingEnabled
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {/* Step 1 */}
        <View style={styles.slide}>
          <Text style={styles.stepTitle}>Welcome to StoryTime</Text>
          <Text style={styles.stepText}>Earn and spend credits for premium services.</Text>
        </View>

        {/* Step 2 */}
        <View style={styles.slide}>
          <Text style={styles.stepTitle}>Why Upgrade?</Text>
          <Text style={styles.stepText}>✓ Get more credits instantly</Text>
          <Text style={styles.stepText}>✓ Unlock premium features</Text>
          <Text style={styles.stepText}>✓ No hidden charges</Text>
        </View>

        {/* Step 3 - Plans */}
        <View style={styles.slide}>
  <ScrollView
    style={{ width: '100%' }}
    contentContainerStyle={styles.planContainer}
    showsVerticalScrollIndicator={false}
  >
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
        {plan.perks.map((perk, idx) => (
          <View key={idx} style={styles.perkRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color="#0f0" />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </TouchableOpacity>
    ))}

    <TouchableOpacity
      style={[styles.subscribeBtn, !selectedPlan && { backgroundColor: '#555' }]}
      onPress={handleSubscribe}
      disabled={!selectedPlan}
    >
      <Text style={styles.subscribeText}>
        {selectedPlan ? `Subscribe to ${selectedPlan.name}` : 'Select a Plan'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
      <Text style={styles.loginText}>Back to Login</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.prevBtn} onPress={() => goToSlide(1)}>
      <Text style={styles.prevText}>Previous</Text>
    </TouchableOpacity>
  </ScrollView>
</View>


      </ScrollView>

      {/* Navigation buttons */}
      <View style={styles.navigation}>
        {currentIndex > 0 && (
          <TouchableOpacity style={styles.navBtn} onPress={() => goToSlide(currentIndex - 1)}>
            <Text style={styles.navText}>◀ Prev</Text>
          </TouchableOpacity>
        )}
        {currentIndex < 2 && (
          <TouchableOpacity style={styles.navBtn} onPress={() => goToSlide(currentIndex + 1)}>
            <Text style={styles.navText}>Next ▶</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1115',
  },
  slide: {
    width,
    marginTop:50,
    padding: 25,
    justifyContent: 'center',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#1c1f26',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    borderWidth: 2,
    borderColor: '#444',
  },
  selectedCard: {
    borderColor: '#e50914',
    backgroundColor: '#2c2f36',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  planPrice: {
    fontSize: 16,
    color: '#bbb',
    marginTop: 4,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  loginText: {
    marginTop: 12,
    color: '#bbb',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  
  prevBtn: {
    marginTop: 10,
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },
  
  prevText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  
  perkText: {
    color: '#ccc',
    marginLeft: 6,
  },
  subscribeBtn: {
    backgroundColor: '#e50914',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  subscribeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  navBtn: {
    padding: 10,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  navText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SubscriptionPage;
