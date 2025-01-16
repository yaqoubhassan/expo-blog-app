import React, { useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
    View,
    Text,
    TextInput,
    Button,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";
import { useRoute, RouteProp } from "@react-navigation/native";


type EditPostScreenParams = {
    postId: string;
};
export default function EditPostScreen() {
    const router = useRouter();
    const route = useRoute<RouteProp<{ params: EditPostScreenParams }, 'params'>>();
    const postId = route.params?.postId;

    if (!postId) {
        Alert.alert("Error", "Post ID not found.");
        router.back();
        return null;
    }

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postImage, setPostImage] = useState<string | null>(null);
    const [newImage, setNewImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchPost = async () => {
                try {
                    const token = await SecureStore.getItemAsync("authToken");
                    if (!token) throw new Error("Authentication token not found");

                    const response = await fetch(
                        `https://express-blog-api-xf23.onrender.com/api/posts/${postId}`,
                        {
                            headers: { Authorization: `Bearer ${token}` },
                        }
                    );

                    if (!response.ok) throw new Error("Failed to fetch post details");

                    const result = await response.json();
                    const { title, content, postImage } = result.data.post;
                    setTitle(title);
                    setContent(content);
                    setPostImage(postImage);
                } catch (error) {
                    console.error("Error fetching post details:", error);
                    Alert.alert("Error", "Could not fetch post details.");
                    router.back();
                } finally {
                    setLoading(false);
                }
            };

            fetchPost();

        }, [route])
    );

    const handleImagePick = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Specify 'images' for picking images
            allowsEditing: true, // Enable editing (optional)
            // aspect: [4, 3], // Aspect ratio (optional)
            quality: 1, // Image quality (1 is the highest)
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setNewImage(result.assets[0].uri);
        }
    };

    const handleSaveChanges = async () => {
        setSaving(true);

        try {
            const token = await SecureStore.getItemAsync("authToken");
            if (!token) throw new Error("Authentication token not found");

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);

            if (newImage) {
                const uriParts = newImage.split(".");
                const fileType = uriParts[uriParts.length - 1];
                formData.append("postImage", {
                    uri: newImage,
                    name: `image.${fileType}`,
                    type: `image/${fileType}`,
                } as unknown as Blob);
            }

            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/posts/${postId}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    body: formData,
                }
            );

            if (!response.ok) throw new Error("Failed to update post");

            const result = await response.json();
            const updatedPost = result.data;

            // // Update the state with the new image URL
            setPostImage(updatedPost.updatedPost.postImage);

            Alert.alert("Success", "Post updated successfully.");
            router.back();
        } catch (error) {
            console.error("Error saving changes:", error);
            Alert.alert("Error", "Failed to update post. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#6B46C1" style={{ marginTop: 20 }} />;
    }

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#f8f9fa" }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>Edit Post</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Post Title"
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 16,
                    backgroundColor: "#fff",
                }}
            />
            <TextInput
                value={content}
                onChangeText={setContent}
                placeholder="Post Content"
                multiline
                style={{
                    borderWidth: 1,
                    borderColor: "#ccc",
                    borderRadius: 8,
                    padding: 12,
                    height: 150,
                    marginBottom: 16,
                    textAlignVertical: "top",
                    backgroundColor: "#fff",
                }}
            />
            <View style={{ alignItems: "center", marginBottom: 16 }}>
                {newImage ? (
                    <Image
                        source={{ uri: newImage }}
                        style={{ width: 150, height: 150, borderRadius: 8 }}
                    />
                ) : postImage ? (
                    // <Image
                    //     source={{ uri: `${postImage}?timestamp=${new Date().getTime()}` }}
                    //     style={{ width: 150, height: 150, borderRadius: 8 }}
                    // />
                    <Image
                        source={{ uri: postImage }}
                        style={{ width: 150, height: 150, borderRadius: 8 }}
                    />
                ) : (
                    <Text style={{ color: "#666" }}>No Image</Text>
                )}
            </View>
            <TouchableOpacity
                onPress={handleImagePick}
                style={{
                    backgroundColor: "#6B46C1",
                    padding: 12,
                    borderRadius: 8,
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Change Image</Text>
            </TouchableOpacity>
            <Button
                title={saving ? "Saving Changes..." : "Save Changes"}
                onPress={handleSaveChanges}
                disabled={saving}
                color="#4cafb0"
            />
        </View>
    );
}
