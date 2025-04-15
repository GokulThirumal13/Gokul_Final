import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// Tab Navigator and screens
const Tab = createBottomTabNavigator();

function MySpaceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Subscribe to enjoy</Text>
      <Text style={styles.subTitle}>JioHotstar</Text>
      <TouchableOpacity style={styles.subscribeBtn}>
        <Text style={styles.subscribeText}>Subscribe</Text>
      </TouchableOpacity>
      <Text style={styles.smallText}>Plans start at ₹149</Text>

      <Text style={styles.sectionTitle}>Profiles</Text>

      <View style={styles.profiles}>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>😊</Text>
          <Text style={styles.profileLabel}>Gokul</Text>
        </View>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>🎈</Text>
          <Text style={styles.profileLabel}>Kids</Text>
        </View>
        <View style={styles.profileIcon}>
          <Text style={styles.profileText}>➕</Text>
          <Text style={styles.profileLabel}>Add</Text>
        </View>
      </View>

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Played Jeeto Dhan Dhana Dhan?</Text>
        <Text style={styles.bannerLink}>See Winnings »</Text>
      </View>
    </ScrollView>
  );
}

const DummyScreen = ({ title }) => (
  <View style={styles.dummyContainer}>
    <Text style={styles.dummyText}>{title}</Text>
  </View>
);

export default function Dummy() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home': iconName = 'home'; break;
            case 'Search': iconName = 'search'; break;
            case 'Sparks': iconName = 'play-circle'; break;
            case 'Downloads': iconName = 'download'; break;
            case 'My Space': iconName = 'person-circle'; break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#aaa',
        tabBarStyle: { backgroundColor: '#000' },
      })}
    >
      <Tab.Screen name="Home" children={() => <DummyScreen title="Home" />} />
      <Tab.Screen name="Search" children={() => <DummyScreen title="Search" />} />
      <Tab.Screen name="Sparks" children={() => <DummyScreen title="Sparks" />} />
      <Tab.Screen name="Downloads" children={() => <DummyScreen title="Downloads" />} />
      <Tab.Screen name="My Space" component={MySpaceScreen} />
    </Tab.Navigator>
  );
}

// Styles remain unchanged


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0c0c',
    padding: 20,
  },
  title: {
    color: '#aaa',
    fontSize: 18,
    marginTop: 10,
  },
  subTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subscribeBtn: {
    backgroundColor: '#ff248a',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  subscribeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  smallText: {
    color: '#999',
    marginTop: 5,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    marginVertical: 20,
  },
  profiles: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  profileIcon: {
    alignItems: 'center',
  },
  profileText: {
    fontSize: 40,
  },
  profileLabel: {
    color: '#fff',
    marginTop: 5,
  },
  banner: {
    backgroundColor: '#1a1a3f',
    padding: 15,
    borderRadius: 10,
    marginTop: 30,
  },
  bannerText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bannerLink: {
    color: '#f0c040',
    marginTop: 5,
  },
  dummyContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dummyText: {
    color: '#fff',
    fontSize: 24,
  },
});
