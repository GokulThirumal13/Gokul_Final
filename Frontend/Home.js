import React, { useEffect, useState } from "react";
import {
  TouchableOpacity, View, Image, Text, SafeAreaView, StyleSheet, ScrollView, Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import RecentStories from "./recent";
const HomeScreen = ({ navigation, route }) => {
  const [currentTab, setCurrentTab] = useState(route?.params?.initialTab || "Stories");
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [credits, setCredits] = useState(25);
  useEffect(() => {
    if (currentTab === "Favorites") {
      loadFavoriteStories();
    }
  },[currentTab]);
  const loadFavoriteStories = async () => {
    try {
      const response = await fetch("http://192.168.1.26:3001/favorite");
      if (!response.ok) throw new Error("Failed to fetch favorite stories");

      const data = await response.json();
      setFavoriteStories(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Could not load favorites");
    }
  };
  const switchTab = (tab) => {
    setCurrentTab(tab);
  };
  const logoutUser = () => {
    Alert.alert("You have been logged out successfully.");
    navigation.navigate("onboarding");
  };

  const toggleFavorite = async (story) => {
    try {
      const response = await fetch(`http://192.168.1.26:3001/favorite/${story._id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to remove favorite");

      setFavoriteStories((prevFavorites) =>
        prevFavorites.filter((fav) => fav._id !== story._id)
      );
    } catch (error) {
      console.error("Error removing favorite:", error);
      Alert.alert("Could not remove from favorites");
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <LinearGradient colors={["#121212", "#1A202C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>StoryTime</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => navigation.navigate("profile")}>
              <Ionicons name="person-circle-outline" size={28} color="white" />
            </TouchableOpacity>
            <View style={styles.creditsContainer}>
    <Ionicons name="cash-outline" size={24} color="gold" />
    <Text style={styles.creditsText}>{credits}</Text>
  </View>
            <TouchableOpacity onPress={logoutUser}>
              <Ionicons name="log-out-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabBar}>
        {["Create", "Favorites", "Recent"].map((tab) => (
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
            {currentTab === "Recent" ? "Recently Played" : "Your Stories"}
          </Text>
        </View>
        {currentTab === "Create" && (
          <View style={styles.createStorySection}>
            <Text style={styles.createStoryDescription}>
              What’s your story today? A comedy? A horror thriller? Let AI craft an unforgettable journey just for you!
            </Text>
            <TouchableOpacity
              style={styles.createStoryButton}
              onPress={() => navigation.navigate("CreateStory")}
            >
              <LinearGradient colors={["#6B46C1", "#805AD5"]} style={styles.createButtonContainer}>
                <MaterialIcons name="add" size={24} color="white" />
                <Text style={styles.createButtonText}>Create New Story</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
        {currentTab === "Favorites" && (
          <View style={styles.favoritesSection}>
            <Text style={styles.favoritesHeading}>Favorite Stories</Text>
            {favoriteStories.length > 0 ? (
              favoriteStories.map((story, index) => (
                <View key={index} style={styles.storyCard}>
                  <Image
                    source={{ uri: story.imageUrl || "https://picsum.photos/200" }}
                    style={styles.storyThumbnail}
                  />
                  <View style={styles.storyDetails}>
                    <Text style={styles.storyAuthor}>{story.username}</Text>
                    <Text style={styles.storyExcerpt} numberOfLines={2} ellipsizeMode="tail">
                      {story.story || "No story text available"}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => toggleFavorite(story)}>
                    <Ionicons
                      name={
                        favoriteStories.some((fav) => fav._id === story._id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={30}
                      color={
                        favoriteStories.some((fav) => fav._id === story._id)
                          ? "red"
                          : "gray"
                      }
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noFavoritesText}>No favorites yet!</Text>
            )}
          </View>
        )}

        {currentTab === "Recent" && <RecentStories />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#121212" },
  header: { padding: 20, paddingTop: 50 },
  headerContent:{ 
    flexDirection: "row", justifyContent: "space-between", alignItems: "center" 
  },
  headerButtons: 
  {
    flexDirection: "row", gap: 15 
  },
  appName:
  { 
    color: "white", fontSize: 24, fontWeight: "bold" 
  },

  tabBar:{
     flexDirection: "row", justifyContent: "center", marginTop: 10 
    },
  tabButton: 
  { 
    padding: 10, marginHorizontal: 10 

  },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "purple" },
  tabText: { color: "gray", fontSize: 16 },
  activeTabText: { color: "white", fontWeight: "bold" },

  content: { padding: 20 },
  sectionHeader: { marginBottom: 10 },
  sectionTitle: { color: "white", fontSize: 20, fontWeight: "bold" },

  createStorySection: 
  { 
    marginBottom: 20 
  },
  createStoryDescription: { 
    color: "white", fontSize: 16, textAlign: "center", paddingHorizontal: 20, fontStyle: "italic" 
  },
  createStoryButton: 
  {
     marginTop: 10, marginBottom: 20 
    },
  createButtonContainer:{ 
    flexDirection: "row", alignItems: "center", padding: 15, borderRadius: 8 
  },
  createButtonText: 
  { 
    color: "white", marginLeft: 10, fontWeight: "bold" 
  },

  favoritesSection: 
  { 
    marginTop: 20 
  },
  favoritesHeading: 
  { 
    color: "white", fontSize: 18, fontWeight: "bold", marginBottom: 10 
  },
  storyCard:{ 
    flexDirection: "row", backgroundColor: "#1A1A1A", padding: 10, borderRadius: 10, marginBottom: 10 
  },
  storyThumbnail:{width: 50, height: 50, borderRadius: 10, marginRight: 10

  },
  storyDetails: { flex: 1 },
  storyAuthor: { color: "white", fontWeight: "bold" },
  storyExcerpt: { color: "gray", fontSize: 12 },
  noFavoritesText: { color: "gray", textAlign: "center", marginTop: 10 },
});
export default HomeScreen;
