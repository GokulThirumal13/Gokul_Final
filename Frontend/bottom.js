import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import KidsHomeScreen from './kidshome';
import FavoriteStories from './Fav';
import RecentStories from './recent';
import ProfileScreen from './ProfileScreen';
import NewStoryPrompt from './createnewstory';
export default function BottomNavigate() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    checkUserLogin();
  }, []);
  
  async function checkUserLogin() {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      if (savedUsername) {
        setUsername(savedUsername);
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error checking login status:", error);
    }
  }

  const Tab = createBottomTabNavigator();

  return (
      <Tab.Navigator 
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#00A86B',
          tabBarInactiveTintColor: 'gray',
          tabBarActiveBackgroundColor: '#0D0D0D',
          tabBarInactiveBackgroundColor: '#0D0D0D',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#333',
            borderTopWidth: 1,
            paddingTop: 5,
            height: 60
          }
        }}
      >
        <Tab.Screen
          name="Home"
          component={KidsHomeScreen}
          initialParams={{ username: username }}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ size, focused }) => 
              focused ? 
                <Ionicons name="home" color={'#00A86B'} size={size} /> : 
                <Ionicons name="home-outline" color={'gray'} size={size} />
          }}
        />
        
        <Tab.Screen 
          name="Create Story" 
          component={NewStoryPrompt}
          initialParams={{ username: username }}
          options={{
            tabBarIcon: ({ size, focused }) => 
              focused ? 
                <Ionicons name="create" color={'#00A86B'} size={size} /> : 
                <Ionicons name="create-outline" color={'gray'} size={size} />
          }}
        />
        
        <Tab.Screen 
          name="Favorites" 
          component={FavoriteStories}
          initialParams={{ username: username }}
          options={{
            tabBarIcon: ({ size, focused }) => 
              focused ? 
                <Ionicons name="heart" color={'#00A86B'} size={size} /> : 
                <Ionicons name="heart-outline" color={'gray'} size={size} />
          }}
        />
        
        <Tab.Screen 
          name="Recent" 
          component={RecentStories}
          initialParams={{ username: username }}
          options={{
            tabBarIcon: ({ size, focused }) => 
              focused ? 
                <Ionicons name="time" color={'#00A86B'} size={size} /> : 
                <Ionicons name="time-outline" color={'gray'} size={size} />
          }}
        />
        
        <Tab.Screen 
          name="Profile" 
          component={ProfileScreen}
          initialParams={{ username: username }}
          options={{
            tabBarIcon: ({ size, focused }) => 
              focused ? 
                <Ionicons name="person" color={'#00A86B'} size={size} /> : 
                <Ionicons name="person-outline" color={'gray'} size={size} />
          }}
        />
      </Tab.Navigator>

  );
}