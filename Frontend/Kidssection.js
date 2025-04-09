import React, { useEffect, useState } from "react";
import {View,Text,TouchableOpacity,StyleSheet,Modal,Alert,ScrollView,FlatList,Image,} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from "expo-linear-gradient";
// import { Picker } from "@react-native-picker/picker";
const categories = ["Horror", "Adventure", "Fantasy", "Comedy", "Educational"];
const Voices=['Daniel','Brian', 'Lily', 'Eric','Jessica']

const CategoryDetails={
  Horror:{
    avatar:"https://e7.pngegg.com/pngimages/581/432/png-clipart-zombie-animated-illustration-t-shirt-drawing-ferocious-masks-avatar-heroes-head-thumbnail.png"
  },
  Adventure:{
    avatar:"https://img.freepik.com/free-photo/three-dimensional-kids-adventure-explore-moon-space_23-2151639517.jpg?semt=ais_hybrid&w=740"
  },
  Fantasy:{
    avatar:"https://kidscreen.com/wp/wp-content/uploads/2018/07/TheDragonPrince.jpg"
  },
  Comedy:{
    avatar:"https://c8.alamy.com/comp/TC7AK9/young-kids-avatar-carton-character-TC7AK9.jpg"
  },
  Educational:{
    avatar:"https://thumbs.dreamstime.com/b/subject-school-chemistry-two-children-conduct-chemical-experiments-d-avatar-boy-girl-back-to-327790600.jpg"
  }
}
const VoiceDetails = {
  Daniel: {
    description: "Daniel has a calm, friendly tone suited for storytelling.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "onwK4e9ZLuTAKqWW03F9",
    avatar: "https://img.freepik.com/premium-photo/cartoonish-3d-animation-boy-glasses-with-blue-hoodie-orange-shirt_899449-25777.jpg"
  },
  Brian: {
    description: "Brian's voice is energetic and fun, perfect for adventures!",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "nPczCjzI2devNBz1zQrb",
    avatar: "https://cdn4.iconfinder.com/data/icons/facely-v2-metapeople-3d-avatars/512/17._Uncle_small_brain_glasses.png"
  },
  Lily: {
    description: "Lily offers a gentle, engaging tone for fantasy stories.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "pFZP5JQG7iQjIQuC4Bku",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOkjGnxzh9EF_Kjejmuprk3-WmV6JAERRTUg&s"
  },
  Eric: {
    description: "Eric's voice is bold and expressive, great for horror themes.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "cjVigY5qzO86Huf0OWal",
    avatar: "https://img.recraft.ai/gZEnPatwfxrUjKqd_rsAxMKm6WkUkxIb5lfZTnKPBco/rs:fit:1024:1365:0/q:95/g:no/plain/abs://prod/images/4ef0d4b1-e1bf-48f5-8062-dfb762b97968@jpg"
  },
  Jessica: {
    description: "Jessica brings a warm, educational style for young learners.",
    link: "https://www.elevenlabs.io/voice-lab",
    voice_id: "cgSgspJ2msm6clMCkdW9",
    avatar: "https://img.freepik.com/premium-vector/confident-businesswoman-avatar_1322560-110090.jpg?semt=ais_hybrid"
  },
};



const KidsSection = ({ navigation }) => {
  const [age, setAge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVoice,setSelectedVoice]=useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
  const [isVoiceModalVisible, setVoiceModalVisible] = useState(false);
  const [favoriteStories,setFavoriteStories]=useState([]);

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
        const response = await fetch(`http://192.168.1.26:3001/favorite?category=${selectedCategory}`);
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

  const resetSelections=()=>{
    setSelectedCategory(null);
    setSelectedVoice(null);
    setFavoriteStories([]);
  };
  

  return (
    <ScrollView style={styles.container}>
    <LinearGradient
  colors={['#d6ccf2', '#bfa2db', '#8367c7', '#5e60ce']}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.background}
/>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <Ionicons name="person-circle-outline" size={28} color="black" style={styles.iconSpacing} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="black" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="black" />
      </TouchableOpacity>

      <Image
  source={{
    uri: "https://picture.lk/files/preview/960x1713/11711108495m56bmjnrrlvsptxcjuysdabwkf6vvbou1jxu6pjivrapeoyqyu5m6qg1qgjj4r4tepsgekixvixqgpo9lvdxeagdinqksa48rsb7.jpg",
  }}
  style={styles.topImage}
/>
 
      <Text style={styles.header}>Stories for Age {age}</Text>


      {/* <TouchableOpacity style={styles.recentButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="time-outline" size={18} color="#fff" />
        <Text style={styles.recentText}>Recently Played</Text>
      </TouchableOpacity> */}

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Category:</Text>
        <View style={styles.pickerWrapper}>
        <TouchableOpacity onPress={() => setCategoryModalVisible(true)} style={styles.selectionButton}>
  <Text style={styles.selectionText}>
    {selectedCategory || "Choose a Category"}
  </Text>
</TouchableOpacity>
        </View>


        <View style={styles.pickerWrapper}>
        <TouchableOpacity onPress={() => setVoiceModalVisible(true)} style={styles.selectionButton}>
  <Text style={styles.selectionText}>
    {selectedVoice || "Choose a Voice"}
  </Text>
</TouchableOpacity>
        </View>

        {selectedVoice !== "" && VoiceDetails[selectedVoice] && (
  <View style={styles.voiceInfoContainer}>
    <Text style={styles.voiceDescription}>
      {VoiceDetails[selectedVoice].description}
    </Text>
    <TouchableOpacity
      onPress={() => {
        Linking.openURL(VoiceDetails[selectedVoice].link);
      }}
    >
      <Text style={styles.voiceLink}>Know more about this voice</Text>
    </TouchableOpacity>
  </View>
)}

<Modal visible={isCategoryModalVisible} animationType="slide" transparent={true}>
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

      <TouchableOpacity onPress={() => setCategoryModalVisible(false)} style={styles.modalClose}>
        <Text style={styles.modalCloseText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


<Modal visible={isVoiceModalVisible} animationType="slide" transparent={true}>
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

      <TouchableOpacity onPress={() => setVoiceModalVisible(false)} style={styles.modalClose}>
        <Text style={styles.modalCloseText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

{selectedCategory && (
  <View style={styles.createStoryContainer}>
    <TouchableOpacity onPress={() =>
      navigation.navigate("CreateStory", {
        category: selectedCategory,
        voiceId: VoiceDetails[selectedVoice]?.voice_id, 
      })
    }>
      <Text style={styles.createStoryHeader}>
        Create a New Story in {selectedCategory}
      </Text>
    </TouchableOpacity>
  </View>
)}
    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
  <Text style={{ fontSize: 18, fontWeight: 'bold'}}></Text>
  <TouchableOpacity onPress={resetSelections}>
    <Icon name="refresh" size={24} color="#00A86B" />
  </TouchableOpacity>
</View>

</View>
{favoriteStories.length > 0 ? (
  <ScrollView style={styles.favoritesSection}>
    <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
      {favoriteStories.map((item, index) => (
        <View key={index} style={styles.favoriteCard}>
          <Image source={{ uri: item.favoriteImage }} style={styles.favoriteImage} />
          <Text style={styles.favoriteText}>{item.story}</Text>
        </View>
      ))}
    </ScrollView>
  </ScrollView>
) : selectedCategory && (
  <Text style={styles.infoText}>
    No favorite stories available for "{selectedCategory}" yet.
  </Text>
)}



    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "white", 
    padding: 20,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginBottom: 10,
  },
  iconSpacing: {
    marginRight: 15,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "#333", 
  },
  pickerContainer: {
    marginTop: 20,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginBottom: 8,
  },

  
  pickerWrapper: {
    marginBottom: 15,
    borderColor:'black',
   
  },
  selectionButton: { 
    padding: 12,
    borderRadius: 12,
    marginLeft:10,
    backgroundColor:'black'
  },
  selectionText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  voiceInfoContainer: {
    marginTop: 10,
    backgroundColor: "#FFF3E0", 
    padding: 10,
    borderRadius: 10,
  },
  voiceDescription: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  favoritesSection: {
    marginTop: 20,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginLeft: 10,
  },
  favoriteCard: {
    width: 125, 
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  topImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  
  
  favoriteImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
  },
  favoriteText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  
  voiceLink: {
    color: "#007AFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  gridItem: {
    width: "48%",
    marginBottom: 15,
    alignItems: "center",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginBottom: 8,
  },
  gridText: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
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
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#00A86B",
  },
  modalClose: {
    marginTop: 10,
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#FF5252",
    fontWeight: "bold",
  },
  createStoryContainer: {
    marginVertical: 20,
    alignItems: "center",
  },
  createStoryHeader: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    borderColor:'black',
    backgroundColor:'white'
  },
  infoText: {
    marginTop: 20,
    fontSize: 16,
    color: "#777",
    textAlign: "center",
  },
});


export default KidsSection;
