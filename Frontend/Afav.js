import React, { useEffect, useState } from "react";
import {View,Text,Image,StyleSheet,FlatList,Alert,ActivityIndicator,TouchableOpacity,Dimensions,}from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAudioPlayer from "./useAudioPlayer";

const CARD_WIDTH = (Dimensions.get("window").width - 60) / 2;
const PRIMARY_COLOR = "#2D3748"; 

export default function AdultFavoriteStories() {
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isPlaying, currentAudio, toggleAudio } = useAudioPlayer();

  useEffect(() => {
    loadFavoriteStories();
  }, []);

  const loadFavoriteStories = async () => {
    try {
      const response = await fetch("http://192.168.1.27:3001/adult/favorite");
      if (!response.ok) throw new Error("Failed to fetch adult stories");
      const data = await response.json();
      setFavoriteStories(data);
    } catch (error) {
      console.error("Error fetching adults' favorites:", error);
      Alert.alert("Could not load adult stories");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      "Remove from Favorites",
      "Are you sure you want to delete this story?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.27:3001/adult/favorite/${id}`, {
                method: "DELETE",
              });
              if (!response.ok) throw new Error("Delete failed");
              setFavoriteStories((prev) => prev.filter((story) => story._id !== id));
            } catch (error) {
              console.error("Error deleting story:", error);
              Alert.alert("Failed to delete");
            }
          },
        },
      ]
    );
  };

  const renderStoryCard = ({ item }) => (
    <View style={styles.storyCard}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: item.favoriteImage || "https://via.placeholder.com/150x150.png?text=Story",
          }}
          style={styles.storyThumbnail}
        />
        <TouchableOpacity
          style={styles.trashIcon}
          onPress={() => handleDelete(item._id)}
        >
          <Ionicons name="trash" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.storyDetails}>
        <Text style={styles.storyAuthor}>{item.username}</Text>
        <Text style={styles.storyExcerpt} numberOfLines={3}>
          {item.story || "No story text available"}
        </Text>

        {item.audioUrl ? (
          <TouchableOpacity
            style={styles.audioButton}
            onPress={() => toggleAudio(item.audioUrl)}
          >
            <Ionicons
              name={
                isPlaying && currentAudio === item.audioUrl
                  ? "pause-circle"
                  : "play-circle"
              }
              size={26}
              color={
                isPlaying && currentAudio === item.audioUrl
                  ? "#A0E3B2"
                  : "#CBD5E0"
              }
            />
            <Text style={styles.audioText}>
              {isPlaying && currentAudio === item.audioUrl ? "Pause" : "Play"}
            </Text>
            {isPlaying && currentAudio === item.audioUrl && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  backgroundColor: "#A0E3B2",
                  borderRadius: 4,
                  marginLeft: 8,
                }}
              />
            )}
          </TouchableOpacity>
        ) : (
          <Text style={styles.noAudioText}>No audio available</Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Adult Stories</Text>

      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      ) : favoriteStories.length > 0 ? (
        <FlatList
          data={favoriteStories}
          renderItem={renderStoryCard}
          keyExtractor={(_, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.noFavoritesText}>No stories saved yet.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 32,
    backgroundColor: "#1A202C", 
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
  listContainer: {
    paddingBottom: 60,
  },
  storyCard: {
    backgroundColor: "#2D3748",
    borderRadius: 12,
    marginBottom: 20,
    width: CARD_WIDTH,
    overflow: "hidden",
  },
  imageWrapper: {
    position: "relative",
  },
  storyThumbnail: {
    width: "100%",
    height: 120,
  },
  trashIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#E53E3E",
    padding: 4,
    borderRadius: 20,
  },
  storyDetails: {
    padding: 10,
  },
  storyAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#CBD5E0",
    marginBottom: 4,
  },
  storyExcerpt: {
    fontSize: 13,
    color: "#A0AEC0",
    marginBottom: 6,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  audioText: {
    color: "#A0AEC0",
    marginLeft: 6,
  },
  noAudioText: {
    color: "#718096",
    fontStyle: "italic",
    marginTop: 8,
  },
  noFavoritesText: {
    color: "#E2E8F0",
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
});
