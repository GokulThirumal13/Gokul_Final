import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity, StatusBar, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Create Stories',
    description: 'Make your own unique audio stories with just a few taps',
    icon: 'robot',
  },
  {
    id: '2',
    title: 'Lifelike Voices',
    description: 'Hear your stories come to life with natural-sounding narration',
    icon: 'volume-up',
  },
  {
    id: '3',
    title: 'Easy to Use',
    description: 'Simple interface to quickly generate or customize your stories',
    icon: 'auto-awesome',
  },
  {
    id: '4',
    title: 'Full Control',
    description: 'Play, pause, and manage your audio stories however you want',
    icon: 'musical-notes',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    setCurrentIndex(index);
  };

  function goToNext(){
    if (currentIndex < slides.length - 1) {
      scrollRef.current.scrollTo({ x: width * (currentIndex + 1), animated: true });
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    navigation.replace('Login');
  };

  const getIcon = (iconName) => {
    if (iconName === 'auto-awesome') return <MaterialIcons name={iconName} size={80} color="#6B46C1" />;
    if (iconName === 'musical-notes') return <Ionicons name={iconName} size={80} color="#6B46C1" />;
    return <FontAwesome5 name={iconName} size={80} color="#6B46C1" />;
  };

  return (
    <LinearGradient colors={['#121212', '#2D3748']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Text style={styles.appName}>StoryCraft</Text>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.slide}>
          {getIcon(slides[0].icon)}
          <Text style={styles.title}>{slides[0].title}</Text>
          <Text style={styles.description}>{slides[0].description}</Text>
        </View>
        <View style={styles.slide}>
          {getIcon(slides[1].icon)}
          <Text style={styles.title}>{slides[1].title}</Text>
          <Text style={styles.description}>{slides[1].description}</Text>
        </View>
        <View style={styles.slide}>
          {getIcon(slides[2].icon)}
          <Text style={styles.title}>{slides[2].title}</Text>
          <Text style={styles.description}>{slides[2].description}</Text>
        </View>
        <View style={styles.slide}>
          {getIcon(slides[3].icon)}
          <Text style={styles.title}>{slides[3].title}</Text>
          <Text style={styles.description}>{slides[3].description}</Text>
        </View>
      </ScrollView>

      <View style={styles.pagination}>
        <View style={[styles.dot, currentIndex === 0 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 1 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 2 && styles.activeDot]} />
        <View style={[styles.dot, currentIndex === 3 && styles.activeDot]} />
      </View>

      <TouchableOpacity onPress={goToNext} style={styles.nextButton}>
        <LinearGradient colors={['#6B46C1', '#805AD5']} style={styles.gradient}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {currentIndex < slides.length - 1 && (
        <TouchableOpacity onPress={finishOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 50,
  },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 20,
  },
  description: {
    color: '#CBD5E0',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: width * 0.8,
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#aaa',
    margin: 5,
  },
  activeDot: {
    backgroundColor: '#6B46C1',
    width: 20,
  },
  nextButton: {
    width: width * 0.8,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  skipText: {
    color: '#CBD5E0',
    fontSize: 16,
    marginBottom: 20,
  },
});

export default OnboardingScreen;
