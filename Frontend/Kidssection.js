import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
const categories = ["Horror", "Adventure", "Fantasy", "Comedy", "Educational"];
const KidsSection = ({ navigation }) => {
  const [age, setAge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const storedAge = await AsyncStorage.getItem("userAge");
      const recent = await AsyncStorage.getItem("recentlyPlayed");
      setAge(storedAge);
      if (recent) setRecentlyPlayed(JSON.parse(recent));
    }
    fetchData();
  }, []);

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

  return (
    <View style={styles.container}>
    
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("profile")}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" style={styles.iconSpacing} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

 
      <Text style={styles.header}>Stories for Age {age}</Text>


      <TouchableOpacity style={styles.recentButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="time-outline" size={18} color="#fff" />
        <Text style={styles.recentText}>Recently Played</Text>
      </TouchableOpacity>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Select Category:</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedCategory}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
            dropdownIconColor="#fff"
            style={styles.picker}
          >
            <Picker.Item label="Choose a Category" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
          
        </View>
        {selectedCategory && (
  <View style={styles.createStoryContainer}>
    <TouchableOpacity onPress={() => navigation.navigate("CreateStory", { category: selectedCategory })}>
      <Text style={styles.createStoryHeader}>Create a New Story in {selectedCategory}</Text>
    </TouchableOpacity>
  </View>
)}
      </View>
      {selectedCategory ? (
        <Text style={styles.infoText}>
          No stories available for "{selectedCategory}" yet.
        </Text>
      ) : (
        <Text style={styles.infoText}>Please select a category to view stories.</Text>
      )}

  
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Recently Played</Text>
            {recentlyPlayed.length > 0 ? (
              <ScrollView>
                {recentlyPlayed.map((item, index) => (
                  <View key={index} style={styles.modalItem}>
                    <Ionicons name="play-circle-outline" size={24} color="#FF6A88" />
                    <Text style={styles.modalText}>{item.title}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.modalText}>No recent stories.</Text>
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    flex: 1,
    backgroundColor: "#121212",
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
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
    color: "yellow",
  },
  recentButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#E50914",
    padding: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    marginBottom: 20,
  },
  createStoryContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#222",
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
  },
  createStoryHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  
  recentText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 14,
    fontWeight: "bold",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  pickerLabel: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#E50914",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  picker: {
    color: "#fff",
    height: 50,
  },
  infoText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#E50914",
    marginBottom: 15,
    textAlign: "center",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#fff",
  },
  modalClose: {
    marginTop: 20,
    backgroundColor: "#E50914",
    padding: 10,
    borderRadius: 10,
  },
  modalCloseText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default KidsSection;
