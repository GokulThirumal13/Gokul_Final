import React, { useState } from "react";
import {
  TouchableOpacity, View, Text, SafeAreaView, StyleSheet, ScrollView, Alert, Image
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import ARecentStories from "./ARecent";
import AdultFavoriteStories from "./Afav";

const AdultsHomeScreen = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState("Home");

  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)  
    .minDistance(50) 
    .onUpdate((event) => {
      console.log('Swiping: ', event.translationY);
    })
    .onEnd((event) => {
      if (event.translationY < -30) {
        console.log('Upward swipe detected, navigating to kids section');
        
        requestAnimationFrame(() => {
          try {
            navigation.navigate("khome");
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
        <Ionicons name="person-circle-outline" size={35} color="#A855F7" />
        <Text style={styles.profileLabel}>Adult</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0E" />
      
      <LinearGradient colors={["#0E0E0E", "#2D2D2D"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appName}>StoryTime</Text>
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
          <View style={styles.swipeIndicator}>
            <Ionicons name="chevron-up" size={20} color="#777" />
            <Text style={styles.swipeText}>Swipe up for kids mode</Text>
          </View>
          <Text style={styles.adultWelcome}>Immerse yourself in captivating stories</Text>
          <Text style={styles.adultDescription}>
            Discover new narratives or continue where you left off
          </Text>
        </View>
      </LinearGradient>

      <View style={{ flex: 1, backgroundColor: "#1A1A1A" }}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentTab === "Recent" ? "Recently Played" : 
               currentTab === "Favorites" ? "Favorite Stories" :
               currentTab === "MQTT" ? "MQTT Connection" :
               currentTab === "Home" ? "Featured Stories" : "Welcome Home"}
            </Text>
          </View>

          {currentTab === "Favorites" && <AdultFavoriteStories />}
          {currentTab === "Recent" && <ARecentStories />}
          {currentTab === "MQTT" && (
            <View style={styles.mqttContent}>
              <Text style={styles.mqttTitle}>MQTT Connection Status</Text>
              <View style={styles.mqttStatusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: '#FF6347' }]} />
                <Text style={styles.mqttStatusText}>Disconnected</Text>
              </View>
              <TouchableOpacity style={styles.mqttConnectButton}>
                <Text style={styles.mqttConnectText}>Connect</Text>
              </TouchableOpacity>
              <View style={styles.mqttInfoContainer}>
                <Text style={styles.mqttInfoTitle}>Connection Info</Text>
                <View style={styles.mqttInfoRow}>
                  <Text style={styles.mqttInfoLabel}>Broker:</Text>
                  <Text style={styles.mqttInfoValue}>mqtt.example.com</Text>
                </View>
                <View style={styles.mqttInfoRow}>
                  <Text style={styles.mqttInfoLabel}>Port:</Text>
                  <Text style={styles.mqttInfoValue}>1883</Text>
                </View>
                <View style={styles.mqttInfoRow}>
                  <Text style={styles.mqttInfoLabel}>Topic:</Text>
                  <Text style={styles.mqttInfoValue}>/storytime/adults/updates</Text>
                </View>
              </View>
            </View>
          )}
          
          {currentTab === "Home" && (
            <View style={styles.homeContent}>
              <Text style={styles.homeWelcome}>Welcome back to StoryTime</Text>
              <Text style={styles.homeDescription}>Select a story to begin your literary journey</Text>
              <Image
                source={{
                  uri: "https://cdn.animeloved.com/animeloved/b8306c1b-969c-44db-9dea-b9f60eab8eba20220128_172705-1-min.webp",
                }}
                style={styles.topImage}
              />
            </View>
          )}
          <View style={styles.createSection}>
            <LinearGradient
              colors={["#A855F7", "#7928CA"]}
              style={styles.createGradient}
            >
              <Text style={styles.createPrompt}>Have a story to tell?</Text>
              <Text style={styles.createSubText}>Bring your narrative to life with our creative tools</Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate("asection")}
              >
                <Ionicons name="create-outline" size={20} color="#A855F7" />
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
            { name: "MQTT", icon: "wifi-outline", activeIcon: "wifi" }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabButton, currentTab === tab.name && styles.activeTab]}
              onPress={() => switchTab(tab.name)}
            >
              <Ionicons
                name={currentTab === tab.name ? tab.activeIcon : tab.icon}
                size={24}
                color={currentTab === tab.name ? "#A855F7" : "#888"}
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
    backgroundColor: "#1A1A1A" 
  },
  header: { 
    padding: 20, 
    paddingTop: 50,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    alignItems: "center",
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
    backgroundColor: "rgba(168, 85, 247, 0.2)",
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
    backgroundColor: "rgba(168, 85, 247, 0.2)",
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
    color: '#777',
    fontSize: 12,
    marginLeft: 4,
  },
  adultWelcome: {
    color: "white",
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  adultDescription: {
    color: "#A99BF0",
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
    borderLeftColor: "#A855F7",
    paddingLeft: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  homeContent: {
    alignItems: "center",
    backgroundColor: "#2D2D2D",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  homeWelcome: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  homeDescription: {
    color: "#BBBBBB",
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
    backgroundColor: "#2D2D2D",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mqttTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
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
    color: "#DDDDDD",
  },
  mqttConnectButton: {
    backgroundColor: "#A855F7",
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
    backgroundColor: "#3D3D3D",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  mqttInfoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DDDDDD",
    marginBottom: 10,
  },
  mqttInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  mqttInfoLabel: {
    fontSize: 14,
    color: "#AAAAAA",
    width: 70,
  },
  mqttInfoValue: {
    fontSize: 14,
    color: "#FFFFFF",
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
    color: "#E6E0FF",
    textAlign: "center",
    marginVertical: 10,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
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
    color: "#A855F7",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#2D2D2D',
    height: 70,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
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
    borderTopColor: '#A855F7',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#A855F7',
    fontWeight: '600',
  }
});

export default AdultsHomeScreen;