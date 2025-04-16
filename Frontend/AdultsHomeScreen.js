import React, { useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import RecentStories from "./recent";
import AdultFavoriteStories from "./Afav";

const AdultsHomeScreen = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState("Favorites");

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
        console.log('Upward swipe detected, navigating to adult section');
        
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
        <Ionicons name="person-circle" size={35} color="#A855F7" />
        <Text style={styles.profileLabel}>Adult</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0E0E" />
      <LinearGradient colors={["#0E0E0E", "#1C1C1C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appName}>StoryTime - Adult</Text>
            <View style={styles.iconRow}>
              <GestureDetector gesture={swipeGesture}>
                <TouchableOpacity onPress={() => navigation.navigate("profile")}>
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
                style={{ marginLeft: 15 }}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.adultsWelcome}>Explore Stories Crafted for You</Text>
          <Text style={styles.adultsDescription}>
            Dive into your favorites or discover fresh perspectives.
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.tabBar}>
        {["Favorites", "Recent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, currentTab === tab && styles.activeTab]}
            onPress={() => switchTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                currentTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentTab === "Recent" ? "Recently Explored" : "Your Favorites"}
          </Text>
        </View>

        {currentTab === "Favorites" && <AdultFavoriteStories />}
        {currentTab === "Recent" && <RecentStories />}
      </ScrollView>

      <View style={styles.createSection}>
        <Text style={styles.createPrompt}>Have a story to ask?</Text>
        <Text style={styles.createSubText}>Channel your thoughts into narratives.</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("asection")}
        >
          <Ionicons name="create-outline" size={20} color="white" />
          <Text style={styles.createButtonText}>Give me a New Story</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.swipeIndicator}>
        <Ionicons name="chevron-down" size={20} color="#888" />
        <Text style={styles.swipeText}>Swipe down for kids mode</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#0E0E0E" },
  header: { padding: 20, paddingTop: 50 },
  headerContent: { alignItems: "center" },
  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: { flexDirection: "row", alignItems: "center" },
  appName: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
  },
  adultsWelcome: {
    color: "#A855F7",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  adultsDescription: {
    color: "#BBBBBB",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  tabButton: {
    paddingVertical: 10,
    marginHorizontal: 12,
  },
  tabText: {
    color: "gray",
    fontSize: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#A855F7",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  createSection: {
    backgroundColor: "#1F1F1F",
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 4,
  },
  createPrompt: {
    fontSize: 18,
    color: "#A855F7",
    fontWeight: "700",
    textAlign: "center",
  },
  createSubText: {
    fontSize: 14,
    color: "#CCCCCC",
    textAlign: "center",
    marginVertical: 6,
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#A855F7",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  profileContainer: {
    alignItems: "center",
  },
  profileLabel: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    marginTop: 2,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 15,
    right: 85,
    alignItems: 'center',
    opacity: 0.7,
    flexDirection: 'row',
  },
  swipeText: {
    color: '#888',
    fontSize: 10,
    marginLeft: 4,
  },
  profileTouchable: {
    padding: 10, 
  },
});

export default AdultsHomeScreen;