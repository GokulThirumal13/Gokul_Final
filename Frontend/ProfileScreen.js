import React, { useState } from "react";
import { Text, TextInput, StyleSheet, View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const ProfileScreen = ({ navigation }) => {
  const [name, setName] = useState("Gokul");
  const [email, setEmail] = useState("gokulthirumal13@gmail.com");
  const [profilePic, setProfilePic] = useState("https://i.pinimg.com/736x/33/7a/f4/337af42c991a8e267f03a9bdce9fdd73.jpg");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");

  const handleSave = () => {
    alert("Profile Updated");
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
            value={dob}
            onChangeText={setDob}
            placeholder="Date of Birth"
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
    backgroundColor: "#121212",
    padding: 20,
    alignItems: "center",
    paddingBottom: 50,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  logoutButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  profileImageContainer: {
    marginTop: 70,
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 5,
    backgroundColor: "purple",
    borderRadius: 15,
    padding: 5,
  },
  infoCard: {
    backgroundColor: "#1A1A1A",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    marginTop: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    paddingBottom: 5,
  },
  input: {
    flex: 1,
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  saveButton: {
    backgroundColor: "purple",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  saveText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

export default ProfileScreen;
