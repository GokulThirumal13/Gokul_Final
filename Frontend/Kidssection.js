import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

const categories = ["Horror", "Adventure", "Fantasy", "Comedy", "Educational"];
const Voices = ["Daniel", "Brian", "Lily", "Eric", "Jessica"];
const Languages = ["English", "Tamil", "Hindi"];
const CategoryDetails = {
  Horror: {
    avatar:
      "https://e7.pngegg.com/pngimages/581/432/png-clipart-zombie-animated-illustration-t-shirt-drawing-ferocious-masks-avatar-heroes-head-thumbnail.png",
  },
  Adventure: {
    avatar:
      "https://img.freepik.com/free-photo/three-dimensional-kids-adventure-explore-moon-space_23-2151639517.jpg?semt=ais_hybrid&w=740",
  },
  Fantasy: {
    avatar:
      "https://kidscreen.com/wp/wp-content/uploads/2018/07/TheDragonPrince.jpg",
  },
  Comedy: {
    avatar:
      "https://c8.alamy.com/comp/TC7AK9/young-kids-avatar-carton-character-TC7AK9.jpg",
  },
  Educational: {
    avatar:
      "https://thumbs.dreamstime.com/b/subject-school-chemistry-two-children-conduct-chemical-experiments-d-avatar-boy-girl-back-to-327790600.jpg",
  },
};

const VoiceDetails = {
  Daniel: {
    description: "Daniel has a calm, friendly tone suited for storytelling.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    avatar:
      "https://img.freepik.com/premium-photo/cartoonish-3d-animation-boy-glasses-with-blue-hoodie-orange-shirt_899449-25777.jpg",
  },
  Brian: {
    description: "Brian's voice is energetic and fun, perfect for adventures!",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "nPczCjzI2devNBz1zQrb",
    avatar:
      "https://cdn4.iconfinder.com/data/icons/facely-v2-metapeople-3d-avatars/512/17._Uncle_small_brain_glasses.png",
  },
  Lily: {
    description: "Lily offers a gentle, engaging tone for fantasy stories.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    avatar:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOkjGnxzh9EF_Kjejmuprk3-WmV6JAERRTUg&s",
  },
  Eric: {
    description: "Eric's voice is bold and expressive, great for horror themes.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "cjVigY5qzO86Huf0OWal",
    avatar:
      "https://img.recraft.ai/gZEnPatwfxrUjKqd_rsAxMKm6WkUkxIb5lfZTnKPBco/rs:fit:1024:1365:0/q:95/g:no/plain/abs://prod/images/4ef0d4b1-e1bf-48f5-8062-dfb762b97968@jpg",
  },
  Jessica: {
    description: "Jessica brings a warm, educational style for young learners.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "cgSgspJ2msm6clMCkdW9",
    avatar:
      "https://img.freepik.com/premium-vector/confident-businesswoman-avatar_1322560-110090.jpg?semt=ais_hybrid",
  },
};

const KidsSection = ({ navigation }) => {
  const [age, setAge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isVoiceModalVisible, setVoiceModalVisible] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);
  const [favoriteStories, setFavoriteStories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const storedAge = await AsyncStorage.getItem("userAge");
      const recent = await AsyncStorage.getItem("recentlyPlayed");
      setAge(storedAge);
      if (recent) setRecentlyPlayed(JSON.parse(recent));
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!selectedCategory) return;

      try {
        const response = await fetch(
          `http://192.168.4.55:3001/favorite?category=${selectedCategory}`
        );
        const data = await response.json();
        setFavoriteStories(data);
      } catch (error) {
        console.error("Failed to fetch favorites", error);
      }
    };

    fetchFavorites();
  }, [selectedCategory]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          navigation.navigate("Login");
        },
      },
    ]);
  };

  const resetSelections = () => {
    setSelectedCategory(null);
    setSelectedVoice(null);
    setSelectedLanguage(null);
    setFavoriteStories([]);
  };

  const renderProfileIcon = () => {
    return (
      <View style={styles.profileContainer}>
        <Ionicons name="person-circle-outline" size={35} color="white" />
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
              <TouchableOpacity 
                onPress={() => navigation.navigate("profile")} 
                style={styles.profileTouchable}
              >
                {renderProfileIcon()}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLogout}
                style={styles.logoutButton}
              >
                <Ionicons name="log-out-outline" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.kidsWelcome}>Enter the magical world of stories!</Text>
          <Text style={styles.kidsDescription}>
            Select your preferences to create your own adventure!
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#00A86B" />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Create Your Story</Text>
        </View>

        <Image
          source={{
            uri: "https://picture.lk/files/preview/960x1713/11711108495m56bmjnrrlvsptxcjuysdabwkf6vvbou1jxu6pjivrapeoyqyu5m6qg1qgjj4r4tepsgekixvixqgpo9lvdxeagdinqksa48rsb7.jpg",
          }}
          style={styles.topImage}
        />

        {age && (
          <View style={styles.ageCard}>
            <Text style={styles.ageText}>Stories for Age {age}</Text>
          </View>
        )}

        <View style={styles.settingsContainer}>
          <View style={styles.settingsHeader}>
            <Text style={styles.settingsTitle}>Story Settings</Text>
            <TouchableOpacity onPress={resetSelections}>
              <Text style={styles.resetButton}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Category:</Text>
            <TouchableOpacity
              onPress={() => setCategoryModalVisible(true)}
              style={styles.selectionButton}
            >
              <Text style={styles.selectionText}>
                {selectedCategory || "Choose Category"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Voice:</Text>
            <TouchableOpacity
              onPress={() => setVoiceModalVisible(true)}
              style={styles.selectionButton}
            >
              <Text style={styles.selectionText}>
                {selectedVoice || "Choose Voice"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Language:</Text>
            <TouchableOpacity
              onPress={() => setLanguageModalVisible(true)}
              style={styles.selectionButton}
            >
              <Text style={styles.selectionText}>
                {selectedLanguage || "Choose Language"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {selectedVoice !== "" && VoiceDetails[selectedVoice] && (
          <View style={styles.voiceInfoCard}>
            <Image
              source={{ uri: VoiceDetails[selectedVoice].avatar }}
              style={styles.voiceAvatar}
            />
            <View style={styles.voiceDetails}>
              <Text style={styles.voiceName}>{selectedVoice}</Text>
              <Text style={styles.voiceDescription}>
                {VoiceDetails[selectedVoice].description}
              </Text>
            </View>
          </View>
        )}

        {selectedCategory && (
          <View style={styles.createSection}>
            <LinearGradient
              colors={["#00A86B", "#008C59"]}
              style={styles.createGradient}
            >
              <Text style={styles.createPrompt}>Ready to create your story?</Text>
              <Text style={styles.createSubText}>
                Let your imagination run wild!
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() =>
                  navigation.navigate("CreateStory", {
                    category: selectedCategory,
                    voiceId: VoiceDetails[selectedVoice]?.voice_id,
                    lang: selectedLanguage,
                  })
                }
              >
                <Ionicons name="create-outline" size={20} color="#00A86B" />
                <Text style={styles.createButtonText}>
                  Create a New {selectedCategory} Story
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        <Modal
          visible={isCategoryModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalHeader}>Select Category</Text>

              <View style={styles.gridContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={styles.gridItem}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setCategoryModalVisible(false);
                    }}
                  >
                    <Image
                      source={{ uri: CategoryDetails[cat].avatar }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.gridText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isVoiceModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalHeader}>Select Voice</Text>
              <View style={styles.gridContainer}>
                {Voices.map((voice) => (
                  <TouchableOpacity
                    key={voice}
                    style={styles.gridItem}
                    onPress={() => {
                      setSelectedVoice(voice);
                      setVoiceModalVisible(false);
                    }}
                  >
                    <Image
                      source={{ uri: VoiceDetails[voice].avatar }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.gridText}>{voice}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setVoiceModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isLanguageModalVisible}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalHeader}>Select Language</Text>
              <View style={styles.gridContainer}>
                {Languages.map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={styles.gridItem}
                    onPress={() => {
                      setSelectedLanguage(lang);
                      setLanguageModalVisible(false);
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          lang === "English"
                            ? "https://cdn-icons-png.flaticon.com/512/197/197374.png"
                            : lang === "Tamil"
                            ? "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFWB-9oCllMe5ajBZ9D4eDWN_dYBdy56l28Q&s"
                            : "https://hindi.mapsofindia.com/maps/indian-flag.jpg",
                      }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                    <Text style={styles.gridText}>{lang}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => setLanguageModalVisible(false)}
                style={styles.modalClose}
              >
                <Text style={styles.modalCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F5F5",
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
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  backText: {
    color: "#00A86B",
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "500",
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
  topImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  ageCard: {
    backgroundColor: "#00A86B",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  ageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  settingsContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 10,
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333",
  },
  resetButton: {
    color: "#FF5252",
    fontWeight: "bold",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: "#333333",
    fontWeight: "500",
  },
  selectionButton: {
    backgroundColor: "#00A86B",
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minWidth: 150,
  },
  selectionText: {
    color: "white",
    fontSize: 14,
    marginRight: 5,
  },
  voiceInfoCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  voiceAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  voiceDetails: {
    flex: 1,
  },
  voiceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 5,
  },
  voiceDescription: {
    fontSize: 14,
    color: "#666666",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContainer: {
    margin: 20,
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333333",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  gridText: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  modalClose: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 25,
    padding: 10,
  },
  modalCloseText: {
    fontSize: 16,
    color: "#FF5252",
    fontWeight: "bold",
  },
  createSection: {
    marginVertical: 20,
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
});

export default KidsSection;