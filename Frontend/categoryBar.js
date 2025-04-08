import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const categories = ["All", "Horror", "Adventure", "Fairy Tale", "Comedy", "Educational", "CreateStory"];

const CategoryBar = ({ onSelectCategory }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    async function getStoredCategory() {
      const storedCategory = await AsyncStorage.getItem("selectedCategory");
      if (storedCategory) {
        setSelectedCategory(storedCategory);
        onSelectCategory(storedCategory);
      }
    }
    getStoredCategory();
  }, []);

  const handleCategoryPress = async (category) => {
    setSelectedCategory(category);
    await AsyncStorage.setItem("selectedCategory", category);
    onSelectCategory(category);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollView}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category}
          style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
          onPress={() => handleCategoryPress(category)}
        >
          <Text style={[styles.categoryText, selectedCategory === category && styles.selectedCategoryText]}>
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  categoryScrollView: { flexDirection: "row", paddingHorizontal: 10, marginBottom: 10 },
  categoryButton: {
    padding: 10,
    marginRight: 10,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,
  },
  selectedCategory: { backgroundColor: "#FF6A88" },
  categoryText: { fontSize: 16 },
  selectedCategoryText: { color: "#FFF", fontWeight: "bold" },
});

export default CategoryBar;
