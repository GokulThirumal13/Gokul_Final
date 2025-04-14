import React, { useState, useEffect } from "react";
import { Text, TextInput, StyleSheet, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("https://i.pinimg.com/736x/33/7a/f4/337af42c991a8e267f03a9bdce9fdd73.jpg");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const loadProfileData = async () => {
    try {
      const storedName = await AsyncStorage.getItem("username");
      const storedEmail = await AsyncStorage.getItem("userEmail");
      const storedPhone = await AsyncStorage.getItem("userPhone");
      const storedAge = await AsyncStorage.getItem("userAge");
      const storedLocation = await AsyncStorage.getItem("userLocation");
      const storedBio = await AsyncStorage.getItem("userBio");

      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
      if (storedPhone) setPhone(storedPhone);
      if (storedAge) setAge(storedAge);
      if (storedLocation) setLocation(storedLocation);
      if (storedBio) setBio(storedBio);
    } catch (error) {
      console.error("Failed to load profile data:", error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem("username", name);
      await AsyncStorage.setItem("userEmail", email);
      await AsyncStorage.setItem("userPhone", phone);
      await AsyncStorage.setItem("userAge", age);
      await AsyncStorage.setItem("userLocation", location);
      await AsyncStorage.setItem("userBio", bio);

      alert("Profile Updated ✅");
      loadProfileData(); 
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const handleLogout = () => {
    alert("Logged Out!");
    navigation.navigate("Login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Ionicons name="log-out-outline" size={28} color="white" />
      </TouchableOpacity>

      <View style={styles.profileImageContainer}>
        <Image source={{ uri: profilePic }} style={styles.profileImage} />
        <TouchableOpacity style={styles.editIcon}>
          <Ionicons name="camera" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={24} color="gray" />
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={24} color="gray" />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholder="Email Address"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={24} color="gray" />
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone Number"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="calendar-today" size={24} color="gray" />
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="Age"
            placeholderTextColor="gray"
          />
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={24} color="gray" />
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="Location"
            placeholderTextColor="gray"
          />
        </View>

        <View style={[styles.infoRow, { alignItems: "flex-start" }]}>
          <MaterialIcons name="info" size={24} color="gray" style={{ marginTop: 5 }} />
          <TextInput
            style={[styles.input, { height: 80, textAlignVertical: "top" }]}
            value={bio}
            onChangeText={setBio}
            placeholder="About Me"
            placeholderTextColor="gray"
            multiline
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#0D0D0D',
    flexGrow: 1,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    color:"#00A86B",
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },
  profileImageContainer: {
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 110,
    backgroundColor: "#000",
    padding: 6,
    borderRadius: 15,
  },
  infoCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    paddingVertical: 5,
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#00A86B",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileScreen;
