import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput,
  StyleSheet,
  Modal,
  Button,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";

type Post = {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  author: { name: string; email: string };
  postImage?: string;
};

export default function Home() {
  const navigation = useNavigation();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [authorFocused, setAuthorFocused] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSortModal, setShowSortModal] = useState(false);
  const router = useRouter();
  const defaultImage = "https://via.placeholder.com/150?text=No+Image";
  const POSTS_PER_PAGE = 10;

  useFocusEffect(
    React.useCallback(() => {
      fetchPosts();
    }, [currentPage, sortOrder, searchQuery, authorFilter])
  );

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://express-blog-api-xf23.onrender.com/api/posts?sort=${sortOrder}&page=${currentPage}&limit=${POSTS_PER_PAGE}&search=${searchQuery}&author=${authorFilter}`
      );
      if (response.ok) {
        const result = await response.json();
        const newPosts = result.data.posts || [];

        // Append new posts to the existing list
        setPosts((prevPosts) => (currentPage === 1 ? newPosts : [...prevPosts, ...newPosts]));

        setTotalPages(result.metadata.totalPages);
      } else {
        Alert.alert("Error", "Unable to fetch posts. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch posts. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };


  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order);
    setCurrentPage(1);
    setPosts([]); // Clear posts to avoid appending filtered data to the existing list
    setShowSortModal(false);
  };


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 bg-gray-50">
        {/* Search Field */}
        <View
          style={[
            styles.searchContainer,
            searchFocused && styles.searchContainerFocused,
          ]}
        >
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search posts..."
            placeholderTextColor="#A0AEC0"
            style={styles.searchInput}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          {searchQuery && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#319795" />
            </TouchableOpacity>
          )}
        </View>

        <View
          style={[
            styles.searchContainer,
            authorFocused && styles.searchContainerFocused,
          ]}
        >
          <TextInput
            value={authorFilter}
            onChangeText={setAuthorFilter}
            placeholder="Filter by author..."
            placeholderTextColor="#A0AEC0" // Gray-400
            style={styles.searchInput}
            onFocus={() => setAuthorFocused(true)}
            onBlur={() => setAuthorFocused(false)}
          />
          {authorFilter?.length > 0 ? (
            <TouchableOpacity
              onPress={() => setAuthorFilter("")}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#319795" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Sort Field */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          {Platform.OS === "android" ? (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={sortOrder}
                style={styles.sortDropdown}
                onValueChange={handleSortChange}
              >
                <Picker.Item label="Descending" value="desc" />
                <Picker.Item label="Ascending" value="asc" />
              </Picker>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={styles.modalTrigger}
                onPress={() => setShowSortModal(true)}
              >
                <Text>{sortOrder === "desc" ? "Descending" : "Ascending"}</Text>
              </TouchableOpacity>
              {/* Sort Modal for iOS */}
              <Modal
                visible={showSortModal}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Sort by:</Text>
                    <Button
                      title="Descending"
                      onPress={() => handleSortChange("desc")}
                    />
                    <Button
                      title="Ascending"
                      onPress={() => handleSortChange("asc")}
                    />
                    <Button
                      title="Cancel"
                      onPress={() => setShowSortModal(false)}
                    />
                  </View>
                </View>
              </Modal>
            </>
          )}
        </View>

        {/* Posts */}
        {loading ? (
          <ActivityIndicator size="large" color="#6B46C1" />
        ) : posts.length === 0 ? (
          <Text style={styles.noPosts}>No posts available.</Text>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="bg-white rounded-lg shadow-md overflow-hidden mb-4"
                onPress={() => navigation.navigate("[postId]", { postId: item._id })}
              >
                <Image
                  source={{ uri: item.postImage || defaultImage }}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View style={styles.postDetails}>
                  <Text style={styles.postTitle}>{item.title}</Text>
                  <Text style={styles.postAuthor}>By {item.author.name}</Text>
                  <Text style={styles.postDate}>
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ padding: 16 }}
            onEndReachedThreshold={0.5} // Trigger `onEndReached` when 50% away from the bottom
            onEndReached={() => {
              if (currentPage < totalPages) {
                setCurrentPage((prevPage) => prevPage + 1);
              }
            }}
            ListFooterComponent={
              currentPage < totalPages && !loading ? (
                <ActivityIndicator size="small" color="#6B46C1" />
              ) : null
            }
          />

        )}
      </View>
    </TouchableWithoutFeedback>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7FAFC",
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  searchContainerFocused: {
    borderColor: "#319795", // Teal-500
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2D3748",
    padding: 8,
  },
  clearButton: {
    justifyContent: "center",
    padding: 8,
  },
  sortContainer: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  sortLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  sortDropdown: {
    // padding: 12,
    borderWidth: 1,
    borderColor: "#319795",
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#FFF",
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  noPosts: {
    textAlign: "center",
    marginTop: 20,
    color: "#6B46C1",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postDetails: {
    padding: 16,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  postAuthor: {
    fontSize: 14,
    color: "#319795",
  },
  postDate: {
    fontSize: 12,
    color: "#718096",
  },
  modalTrigger: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 8,
    // backgroundColor: "#fff",
  },
});
