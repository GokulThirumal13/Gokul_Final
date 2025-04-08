import React, { useEffect, useState } from "react";
import {
  TouchableOpacity, View, Image, Text, SafeAreaView, StyleSheet, ScrollView, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import RecentStories from "./recent";
import FavoriteStories from "./Fav";
const KidsHomeScreen = ({ navigation }) => {
  const [currentTab, setCurrentTab] = useState("Favorites");
  const [favoriteStories, setFavoriteStories] = useState([]);

 
  const switchTab = (tab) => {
    setCurrentTab(tab);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LinearGradient colors={["#121212", "#1A202C"]} style={styles.header}>
      <View style={styles.headerContent}>
  <View style={styles.headerTopRow}>
    <Text style={styles.appName}>StoryTime - Kids</Text>
    <View style={styles.iconRow}>
      <TouchableOpacity onPress={() => navigation.navigate("profile")}>
        <Ionicons name="person-circle-outline" size={28} color="white" />
      </TouchableOpacity>
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

{/* <Text style={styles.kidsWelcome}>Enter the magical world of stories!</Text>
  <Text style={styles.kidsDescription}>
    Tap your favorite or discover a recent one to begin your journey!
  </Text> */}
      </LinearGradient>

      <View style={styles.tabBar}>
        {["Favorites", "Recent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, currentTab === tab && styles.activeTab]}
            onPress={() => switchTab(tab)}
          >
            <Text style={[styles.tabText, currentTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {currentTab === "Recent" ? "Recently Played" : "Favorite Stories"}
          </Text>
        </View>

        {currentTab === "Favorites" && <FavoriteStories />}
        {currentTab === "Recent" && <RecentStories />}
      </ScrollView>

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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, paddingTop: 50 },

  kidsWelcome: {
    color: "#FFD700",
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
  
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "purple",
  },
  tabText: {
    color: "gray",
    fontSize: 16,
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
  createSection: {
    backgroundColor: "#2D2D2D",
    padding: 20,
    borderRadius: 15,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  
  createPrompt: {
    fontSize: 18,
    color: "#FFD700",
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
    backgroundColor: "#7B68EE",
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
});

export default KidsHomeScreen;
