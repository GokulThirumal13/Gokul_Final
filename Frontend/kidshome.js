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
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LinearGradient colors={["#121212", "#1A202C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTopRow}>
            <Text style={styles.appName}>StoryTime - Kids</Text>
            <View style={styles.iconRow}>
              <GestureDetector gesture={swipeGesture}>
                <TouchableOpacity onPress={() => navigation.navigate("profile")}  style={styles.profileTouchable}>
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

          <Text style={styles.kidsWelcome}>Enter the magical world of stories!</Text>
          <Text style={styles.kidsDescription}>
            Tap your favorite or discover a recent one to begin your journey!
          </Text>
        </View>
      </LinearGradient>

      <View style={{ flex: 1, paddingBottom: 70 }}>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 80 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {currentTab === "Recent" ? "Recently Played" : currentTab === "Favorites"
                ? "Favorite Stories"
                : "Welcome Home"}
            </Text>
          </View>

          {currentTab === "Favorites" && <FavoriteStories />}
          {currentTab === "Recent" && <RecentStories />}
          {currentTab === "Home" && (
            <View style={styles.homeContent}>
              <Text style={styles.kidsWelcome}>Welcome back, explorer!</Text>
              <Text style={styles.kidsDescription}>Choose a story to begin your adventure.</Text>
              <Image
                source={{
                  uri: "https://media.istockphoto.com/id/639573662/vector/story-time-multicultural-group.jpg?s=612x612&w=0&k=20&c=upYwVTnTusORWeilH25JNhkAHZDIBn0gbaH6FCumWs8=",
                }}
                style={styles.topImage}
              />
            </View>
          )}

          <View style={styles.createSection}>
            <Text style={styles.createPrompt}>Have a story in your heart?</Text>
            <Text style={styles.createSubText}>Bring it to life with colors and imagination!</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate("kids")}
            >
              <Ionicons name="create-outline" size={20} color="white" />
              <Text style={styles.createButtonText}>Create Your Own Story</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.bottomTabBar}>
          {[
            { name: "Home", icon: "home" },
            { name: "Favorites", icon: "heart" },
            { name: "Recent", icon: "time" }
          ].map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[styles.tabButton, currentTab === tab.name && styles.activeTab]}
              onPress={() => switchTab(tab.name)}
            >
              <Ionicons
                name={tab.icon}
                size={24}
                color={currentTab === tab.name ? "#1DB954" : "#888"}
              />
              <Text style={[styles.tabText, currentTab === tab.name && styles.activeTabText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.swipeIndicator}>
        <Ionicons name="chevron-up" size={20} color="#888" />
        <Text style={styles.swipeText}>Swipe up for adult mode</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, paddingTop: 50 },
  kidsWelcome: {
    color: "#00A86B",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
  kidsDescription: {
    color: "#DDDDDD",
    fontSize: 14,
    textAlign: "center",
    marginTop: 4,
  },
  headerContent: {
    alignItems: "center",
  },
  appName: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  tabButton: {
    padding: 10,
    marginHorizontal: 10,
  },
  headerTopRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
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
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "purple",
  },
  tabText: {
    color: "gray",
    fontSize: 16,
  },
  profileTouchable: {
    padding: 10, 
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  favoritesSection: {
    marginTop: 10,
  },
  storyCard: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    height: 70,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingTop: 10,
  },
  activeTab: {
    borderTopWidth: 2,
    borderTopColor: '#1DB954',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  activeTabText: {
    color: '#1DB954',
    fontWeight: '600',
  },
  createSection: {
    backgroundColor: "#2D2D2D",
    padding: 20,
    marginTop: 30,
    borderRadius: 15,
    marginBottom: 40,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  topImage: {
    width: '80%',
    height: 200,
    padding: 40,
    marginLeft: 5,
    marginTop: 20,
    borderRadius: 10,
    marginBottom: 5
  },
  createPrompt: {
    fontSize: 18,
    color: "#00A86B",
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
    backgroundColor: "#00A86B",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 8,
  },
  storyThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
  },
  storyDetails: {
    flex: 1,
  },
  storyAuthor: {
    color: "white",
    fontWeight: "bold",
  },
  storyExcerpt: {
    color: "gray",
    fontSize: 12,
  },
  noFavoritesText: {
    color: "gray",
    textAlign: "center",
    marginTop: 10,
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
  homeContent: {
    alignItems: "center",
  },
});

export default KidsHomeScreen;