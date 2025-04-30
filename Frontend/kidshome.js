import React, { useEffect, useState } from "react";
import {
  TouchableOpacity, View, Image, Text, SafeAreaView, StyleSheet, ScrollView, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import RecentStories from "./recent";
import FavoriteStories from "./Fav";
import ProfileScreen from "./ProfileScreen";



const KidsHomeScreen = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState("Favorites");
  const [favoriteStories, setFavoriteStories] = useState([]);

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };
  const API_URL='http://192.168.4.55'

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)  
    .minDistance(50)
    .onUpdate((event) => {
      console.log('Swiping: ', event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY < -30) {
        console.log('Upward swipe detected, navigating to adult section');
       
        requestAnimationFrame(() => {
          try {
            navigation.navigate("Adults");
          } catch (e) {
            console.error("Navigation error:", e);
          }
        });
      }
    })
    .simultaneousWithExternalGesture()  
    .activeOffsetY(-10);  

  const renderProfileIcon = () => {
    return (
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={35} color="#00A86B" />
        <Text style={styles.profileLabel}>Kids</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0A7C50" />
      
      <LinearGradient colors={["#0A7C50", "#00A86B"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appName}>StoryTime Kids</Text>
            <View style={styles.iconRow}>
              <GestureDetector gesture={swipeGesture}>
                <TouchableOpacity onPress={() => navigation.navigate("profile")} style={styles.profileTouchable}>
                  {renderProfileIcon()}
                </TouchableOpacity>
              </GestureDetector>
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("Logout", "Are you sure you want to logout?", [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Logout",
                      onPress: () => navigation.replace("Login"),
                      style: "destructive",
                    },
                  ])
                }
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.kidsWelcome}>Enter the magical world of stories!</Text>
          
          <Text style={styles.kidsDescription}>Tap your favorite or discover a recent one to begin your journey!</Text>
        </View>
      </LinearGradient>
      <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentTab === "Recent" ? "Recently Played" : 
               currentTab === "Favorites" ? "Favorite Stories" :
      
               "Welcome Home"}
            </Text>
          </View>
          {currentTab === "Home" && (
            <View style={styles.homeContent}>
              <Text style={styles.homeWelcome}>Welcome back, explorer!</Text>
              <Text style={styles.homeDescription}>Choose a story to begin your adventure.</Text>
              <Image source={{uri: "https://media.istockphoto.com/id/639573662/vector/story-time-multicultural-group.jpg?s=612x612&w=0&k=20&c=upYwVTnTusORWeilH25JNhkAHZDIBn0gbaH6FCumWs8=",}}
                style={styles.topImage}
              />
            </View>
          )}
          {currentTab === "Favorites" && <FavoriteStories/>}
          {currentTab === "Recent" && <RecentStories/>}
          
          
          <View style={styles.createSection}>
            <LinearGradient
              colors={["#00A86B", "#008C59"]}
              style={styles.createGradient}
            >
              <Text style={styles.createPrompt}>Have a story in your heart?</Text>
              <Text style={styles.createSubText}>Bring it to life with colors and imagination!</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("kids")}
              >
                <Ionicons name="create-outline" size={20} color="#00A86B" />
                <Text style={styles.createButtonText}>Create Your Own Story</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </ScrollView>

        <View style={styles.bottomTabBar}>
          {[
            { name: "Home", icon: "home-outline", activeIcon: "home" },
            { name: "Favorites", icon: "heart-outline", activeIcon: "heart" },
            { name: "Recent", icon: "time-outline", activeIcon: "time" },
           
          ].map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabButton, currentTab === tab.name && styles.activeTab]}
              onPress={() => switchTab(tab.name)}
            >
              <Ionicons
                name={currentTab === tab.name ? tab.activeIcon : tab.icon}
                size={24}
                color={currentTab === tab.name ? "#00A86B" : "#888"}
              />
              <Text style={[styles.tabText, currentTab === tab.name && styles.activeTabText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  header: { 
    padding: 10, 
    paddingTop: 50,
    borderBottomLeftRadius:30,
    borderBottomRightRadius:30,
  },
  headerContent: {
    alignItems: "center",
    marginTop:-10,
  },
  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileContainer: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    padding: 5,
    borderRadius: 20,
  },
  profileLabel: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  profileTouchable: {
    padding: 5,
  },
  logoutButton: {
    marginLeft: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  swipeIndicator: {
    alignItems: 'center',
    opacity: 0.8,
    flexDirection: 'row',
    marginBottom: 10,
  },
  swipeText: {
    color: '#E6FFF6',
    fontSize: 12,
    marginLeft: 4,
  },
  kidsWelcome: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  kidsDescription: {
    color: "#E6FFF6",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 15,
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#00A86B",
    paddingLeft: 10,
  },
  sectionTitle: {
    color: "#333333",
    fontSize: 20,
    fontWeight: "bold",
  },
  homeContent: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeWelcome: {
    color: "#333333",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  homeDescription: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  topImage: {
    width: '90%',
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 5
  },
  mqttContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mqttTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 15,
    textAlign: "center",
  },
  mqttStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  mqttStatusText: {
    fontSize: 16,
    color: "#444",
  },
  mqttConnectButton: {
    backgroundColor: "#00A86B",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: "center",
    marginBottom: 20,
  },
  mqttConnectText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  mqttInfoContainer: {
    backgroundColor: "#F7F7F7",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  mqttInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  mqttInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  mqttInfoLabel: {
    fontSize: 14,
    color: "#666",
    width: 70,
  },
  mqttInfoValue: {
    fontSize: 14,
    color: "#333",
    flex: 1,
  },
  createSection: {
    marginTop: 30,
    marginBottom: 40,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  createGradient: {
    padding: 20,
    alignItems: "center",
  },
  createPrompt: {
    fontSize: 18,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
  },
  createSubText: {
    fontSize: 14,
    color: "#E6FFF6",
    textAlign: "center",
    marginVertical: 10,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  createButtonText: {
    color: "#00A86B",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 10,
  },
  activeTab: {
    borderTopWidth: 3,
    borderTopColor: '#00A86B',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#00A86B',
    fontWeight: '600',
  }
});

export default KidsHomeScreen;