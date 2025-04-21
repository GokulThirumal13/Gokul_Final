import React, { useRef, useState, useEffect } from 'react';
import {View,Text,StyleSheet,Dimensions,TouchableOpacity,StatusBar,ScrollView,Image,Animated}from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Create Stories',
    description: 'Make your own unique audio stories with just a few taps',
    icon: 'magic',
    gradientColors: ['#121212', '#1DB954'],
  },
  {
    id: '2',
    title: 'Lifelike Voices',
    description: 'Hear your stories come to life with natural-sounding narration',
    icon: 'volume-up',
    gradientColors: ['#121212', '#1565C0'],
  },
  {
    id: '3',
    title: 'Easy to Use',
    description: 'Simple interface to quickly generate or customize your stories',
    icon: 'wand-magic-sparkles',
    gradientColors: ['#121212', '#9C27B0'],
  },
  {
    id: '4',
    title: 'Full Control',
    description: 'Play, pause, and manage your audio stories however you want',
    icon: 'musical-notes',
    gradientColors: ['#121212', '#1DB954'],
  },
];

const OnboardingScreen = ({ navigation }) => {
  const scrollRef = useRef();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, [currentIndex]);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
  
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start();
    }
  };

  const goToNext = () => {
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

  const getIcon = (iconName, index) => {
    if (iconName === 'volume-up') return <MaterialIcons name={iconName} size={80} color="#1DB954" />;
    if (iconName === 'wand-magic-sparkles') return <FontAwesome5 name="magic" size={80} color="#1DB954" />;
    if (iconName === 'musical-notes') return <Ionicons name={iconName} size={80} color="#1DB954" />;
    if (iconName === 'magic') return <FontAwesome5 name={iconName} size={80} color="#1DB954" />;
    return <FontAwesome5 name={iconName} size={80} color="#1DB954" />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      <View style={styles.header}>

        <Text style={styles.appName}>StoryTime</Text>
      </View>

      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.slideContainer}
      >
        {slides.map((slide, index) => (
          <View key={slide.id} style={styles.slide}>
            <LinearGradient 
              colors={slide.gradientColors} 
              style={styles.gradientBackground}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            >
              <Animated.View 
                style={[
                  styles.slideContent,
                  { 
                    opacity: currentIndex === index ? fadeAnim : 1,
                    transform: [{ translateY: currentIndex === index ? slideAnim : 0 }]
                  }
                ]}
              >
                <View style={styles.iconContainer}>
                  {getIcon(slide.icon, index)}
                </View>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </Animated.View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                currentIndex === index && styles.activeDot
              ]} 
            />
          ))}
        </View>

        <TouchableOpacity 
          onPress={goToNext} 
          style={styles.nextButton}
          activeOpacity={0.7}
        >
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'GET STARTED' : 'NEXT'}
          </Text>
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton}>
            <Text style={styles.skipText}>SKIP</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logo: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  appName: {
    fontSize: 24,
    color: '#1DB954',
    fontWeight: 'bold',
  },
  slideContainer: {
    flex: 1,
  },
  slide: {
    width,
    height: height * 0.7,
  },
  gradientBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  slideContent: {
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '800',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  description: {
    color: '#B3B3B3', 
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8,
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#333',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#1DB954',
    width: 24,
  },
  nextButton: {
    backgroundColor: '#1DB954',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  nextText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  skipButton: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#B3B3B3',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default OnboardingScreen;