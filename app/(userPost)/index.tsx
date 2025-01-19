import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import "../../global.css"

const MyPostsScreen = () => {
    const navigation = useNavigation();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const defaultImage = "https://via.placeholder.com/150?text=No+Image";

    const fetchUserPosts = async () => {
        setLoading(true);
        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) throw new Error("Authentication token not found");

            const response = await fetch(
                "https://express-blog-api-xf23.onrender.com/api/posts/user-posts",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (!response.ok) {
                throw new Error("Failed to fetch user posts");
            }

            const result = await response.json();
            setPosts(result.data.posts);
        } catch (error) {
            console.error("Error fetching user posts:", error);
            Alert.alert("Error", "Could not load your posts. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchUserPosts()
        }, [])
    );

    const handleEditPost = (postId: string) => {
        // router.push(`/(post)/(userPost)/(edit)/${postId}`);
        // router.push(`/(userPosts)/(edit)/${postId}`)
        navigation.navigate("[myPostId]", { postId: postId })
    };

    const handleDeletePost = async (postId: string) => {
        Alert.alert(
            "Delete Post",
            "Are you sure you want to delete this post?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const token = await SecureStore.getItemAsync("authToken");
                            if (!token) throw new Error("Authentication token not found");

                            const response = await fetch(
                                `https://express-blog-api-xf23.onrender.com/api/posts/${postId}`,
                                {
                                    method: "DELETE",
                                    headers: { Authorization: `Bearer ${token}` },
                                }
                            );

                            if (!response.ok) {
                                throw new Error("Failed to delete post");
                            }

                            Alert.alert("Success", "Post deleted successfully.");
                            fetchUserPosts();
                        } catch (error) {
                            console.error("Error deleting post:", error);
                            Alert.alert("Error", "Failed to delete the post. Please try again.");
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    const renderPost = ({ item }: { item: any }) => (
        <View
            style={{
                backgroundColor: "#fff",
                marginVertical: 8,
                marginHorizontal: 16,
                borderRadius: 8,
                overflow: "hidden",
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            <Image
                source={{ uri: item.postImage || defaultImage }}
                style={{ height: 180, width: "100%" }}
            />
            <View style={{ padding: 16 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
                    {item.title}
                </Text>
                <Text
                    style={{
                        fontSize: 14,
                        color: "#666",
                        marginBottom: 16,
                        maxHeight: 60,
                        overflow: "hidden",
                    }}
                >
                    {item.content}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <TouchableOpacity
                        onPress={() => handleEditPost(item._id)}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#4cafb0",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                        }}
                    >
                        <MaterialIcons name="edit" size={20} color="#fff" />
                        <Text style={{ color: "#fff", marginLeft: 8 }}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDeletePost(item._id)}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: "#d32f2f",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            borderRadius: 8,
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#fff" />
                        <Text style={{ color: "#fff", marginLeft: 8 }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: "#f8f9fa" }}>
            {loading ? (
                <ActivityIndicator size="large" color="#6B46C1" style={{ marginTop: 20 }} />
            ) : posts.length > 0 ? (
                <FlatList
                    data={posts}
                    renderItem={renderPost}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingVertical: 8 }}
                />
            ) : (
                <Text
                    style={{
                        textAlign: "center",
                        marginTop: 20,
                        fontSize: 16,
                        color: "#666",
                    }}
                >
                    You haven't created any posts yet.
                </Text>
            )}
        </View>
    );
};

export default MyPostsScreen;
