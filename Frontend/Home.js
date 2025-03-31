import React, { useState,useEffect } from "react";
import {
  TouchableOpacity,View,Image,Text,SafeAreaView,StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {Ionicons,MaterialIcons,FontAwesome5,
} from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ScrollView } from "react-native-gesture-handler";

const HomePage = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState("Stories");

  const storyItems = [
    {
      id: "1",
      title: "The Magic Garden",
      duration: "5:23",
      //image: require("./assets/The_magic_garden.png"),
    },
    {
      id: "2",
      title: "Space Adventure",
      duration: "7:15",
      //image: require("./assets/Space_adventures.png"),
    },
    {
      id: "3",
      title: "Dragons Quest",
      duration: "8:40",
      //image: require("./assets/Dragon_Quest.png"),
    },
  ];

  const StoryItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.storyCard}
      onPress={() => navigation.navigate("StoryDetail", { storyId: item.id })}
    >
      <Image source={item.image} style={styles.storyImage} />
      <View style={styles.storyInfo}>
        <Text style={styles.storyTitle}>{item.title}</Text>
        <Text style={styles.storyDuration}>{item.duration}</Text>
      </View>
      <TouchableOpacity style={styles.playButton}>
        <Ionicons name="play" size={24} color="purple" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
  function Logout(){
    navigation.replace('onboarding')
  }
  function setting(){
    navigation.navigate('Setting')
  }
  function suggestion(){
    navigation.navigate('suggestion')
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <LinearGradient colors={["#121212", "#1A202C"]} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.appTitle}>StoryTime</Text>
          <TouchableOpacity style={styles.profileButton} onPress={Logout}>
            <Ionicons name="person-circle-outline" size={28} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateStory")}
      >
        <LinearGradient
          colors={["#6B46C1", "#805AD5"]}
          style={styles.createButtonGradient}
        >
          <MaterialIcons name="add" size={24} color="white" />
          <Text style={styles.createButtonText}>Create New Story</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        {["Stories", "Favorites", "Recent"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your stories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {storyItems.map(StoryItem)}

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIconContainer}>
                <FontAwesome5 name="random" size={20} color="#6846C1" />
              </View>
              <Text style={styles.actionText}>Random</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={suggestion}>
              <View style={styles.actionIconContainer}>
                <MaterialIcons
                  name="auto-awesome"
                  size={20}
                  color="#6B46C1"
                />
              </View>
              <Text style={styles.actionText}>Suggestions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={setting}>
              <View style={styles.actionIconContainer}>
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color="#6B46C1"
                />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.miniPlayer}>
        <Image
          //source={require("./assets/The_magic_garden.png")}
          style={styles.miniPlayerImage}
        />
        <View style={styles.miniPlayerInfo}>
          <Text style={styles.miniPlayerTitle}>The Magic Garden</Text>
          <Text style={styles.miniPlayerStatus}>Playing...</Text>
        </View>
        <TouchableOpacity style={styles.miniPlayerButton}>
          <Ionicons name="pause" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerContent: {
    position:"relative",
    top:20,
    padding:10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  appTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  profileButton: {
    padding: 5,
  },
  createButton: {
    margin: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#6B46C1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: "#2D3748",
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: "#1A202C",
  },
  tabText: {
    color: "#A0AEC0",
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllText: {
    color: "#6B46C1",
    fontSize: 14,
  },
  storyCard: {
    flexDirection: "row",
    backgroundColor: "#1A202C",
    borderRadius: 12,
    marginBottom: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  storyImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    margin: 10,
  },
  storyInfo: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 10,
  },
  storyTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  storyDuration: {
    color: "#A0AEC0",
    fontSize: 14,
  },
  playButton: {
    width: 46,
    height: 46,
    backgroundColor: "#2D3748",
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginRight: 15,
  },
  quickActions: {
    marginTop: 10,
    marginBottom: 100,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    alignItems: "center",
    width: "30%",
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(107, 70, 193, 0.1)",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    color: "#A0AEC0",
    fontSize: 14,
  },
  miniPlayer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: "#2D3748",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: "#4A5568",
  },
  miniPlayerImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 10,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  miniPlayerStatus: {
    color: "#A0AEC0",
    fontSize: 12,
  },
  miniPlayerButton: {
    padding: 10,
  },
});

export default HomePage;
