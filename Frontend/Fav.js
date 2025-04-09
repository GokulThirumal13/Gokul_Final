import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAudioPlayer from "./useAudioPlayer";

const CARD_WIDTH = (Dimensions.get("window").width - 60) / 2;

export default function FavoriteStories() {
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isPlaying, currentAudio, toggleAudio } = useAudioPlayer();
  useEffect(() => {
    loadFavoriteStories();
  }, []);

  const loadFavoriteStories = async () => {
    try {
      const response = await fetch("http://192.168.1.26:3001/favorite");
      if (!response.ok) throw new Error("Failed to fetch favorite stories");
      const data = await response.json();
      setFavoriteStories(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      Alert.alert("Could not load favorites");
    } finally {
      setLoading(false);
    }
  };

  const renderStoryCard = ({ item }) => (
    <View style={styles.storyCard}>
      <View style={styles.imageWrapper}>
        <Image
          source={{
            uri: item.favoriteImage || "https://cdn.pixabay.com/photo/2019/08/27/03/17/bird-skull-4433244_640.jpg",
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
        <Text style={styles.storyExcerpt} numberOfLines={2}>
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
              size={24}
              color="white"
            />
            <Text style={styles.audioText}>
              {isPlaying && currentAudio === item.audioUrl
                ? "Pause Audio"
                : "Play Audio"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.noAudioText}>No audio available</Text>
        )}
      </View>
    </View>
  );
  const handleDelete = async (id) => {
    Alert.alert(
      "Delete Favorite",
      "Are you sure you want to delete this favorite?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`http://192.168.1.26:3001/favorite/${id}`, {
                method: "DELETE",
              });
              if (!response.ok) throw new Error("Delete failed");
              setFavoriteStories(prev => prev.filter(story => story._id !== id));
            } catch (error) {
              console.error("Error deleting favorite:", error);
              Alert.alert("Failed to delete");
            }
          },
        },
      ]
    );
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favorite Stories</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" />
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
        <Text style={styles.noFavoritesText}>No favorites yet!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  title: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    alignSelf: "center",
  },
  listContainer: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  storyCard: {
    backgroundColor: "#1A1A1A",
    width: CARD_WIDTH,
    borderRadius: 12,
    padding: 10,
  },
  storyThumbnail: {
    width: "100%",
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  storyDetails: {
    flex: 1,
  },
  storyAuthor: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 4,
  },
  storyExcerpt: {
    color: "gray",
    fontSize: 12,
    marginBottom: 6,
  },
  noFavoritesText: {
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  imageWrapper: {
    position: "relative",
  },
  trashIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  audioText: {
    color: "white",
    marginLeft: 6,
    fontSize: 13,
  },
  noAudioText: {
    color: "gray",
    fontStyle: "italic",
    fontSize: 12,
  },
});
