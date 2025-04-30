import React, { useEffect, useState } from "react";
import {View,Text,Image,StyleSheet,FlatList,Alert,ActivityIndicator,TouchableOpacity,Dimensions,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useAudioPlayer from "./useAudioPlayer";
import AsyncStorage from "@react-native-async-storage/async-storage";
const CARD_WIDTH = (Dimensions.get("window").width - 60) / 2;
const SPOTIFY_GREEN = "#1DB954";
export default function FavoriteStories() {
  const [favoriteStories, setFavoriteStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username,setUsername]=useState('');

  const { isPlaying, currentAudio, toggleAudio } = useAudioPlayer();


  useEffect(()=>{
    const fetchUserData=async()=>{
      const savedUsername=await AsyncStorage.getItem('username');
      if (savedUsername) setUsername(savedUsername);

    };
    fetchUserData();
  },[]);
  useEffect(() => {
    loadFavoriteStories();
  }, [username]);

  const loadFavoriteStories = async () => {
    if(!username) return;

    try {
      const response = await fetch(`http://192.168.4.55:3001/favorite?username=${username}&userType=child`);
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
            uri: item.imageUrl || "https://cdn.pixabay.com/photo/2019/08/27/03/17/bird-skull-4433244_640.jpg",
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
            size={26}
            color={
              isPlaying && currentAudio === item.audioUrl
                ? SPOTIFY_GREEN
                : "white"
            }
          />
          <Text style={styles.audioText}>
            {isPlaying && currentAudio === item.audioUrl
              ? "Pause Audio"
              : "Play Audio"}
          </Text>
        
          {isPlaying && currentAudio === item.audioUrl && (
            <View
              style={{
                width: 8,
                height: 8,
                backgroundColor: SPOTIFY_GREEN,
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
              const response = await fetch(`http://192.168.4.55:3001/favorite/${id}`, {
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    alignSelf: "center",
  },
  listContainer: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  storyCard: {
    backgroundColor: "#181818",
    width: CARD_WIDTH,
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  storyThumbnail: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
  },
  imageWrapper: {
    position: "relative",
  },
  trashIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 6,
  },
  storyDetails: {
    flex: 1,
  },
  storyAuthor: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  storyExcerpt: {
    color: "#ccc",
    fontSize: 12,
    marginBottom: 8,
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  audioText: {
    color: SPOTIFY_GREEN,
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  noAudioText: {
    color: "gray",
    fontStyle: "italic",
    fontSize: 12,
  },
  noFavoritesText: {
    color: "gray",
    textAlign: "center",
    marginTop: 40,
    fontSize: 14,
  },
});
