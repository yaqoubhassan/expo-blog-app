import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Keyboard,
    TouchableWithoutFeedback,
    Image,
} from "react-native";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as ImagePicker from "expo-image-picker";

export default function CreatePostScreen({ navigation }: { navigation: any }) {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // Specify 'images' for picking images
            allowsEditing: true, // Enable editing (optional)
            aspect: [4, 3], // Aspect ratio (optional)
            quality: 1, // Image quality (1 is the highest)
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri); // Set the picked image URI
        }
    };



    const handleCreatePost = async () => {
        if (!title || !content) {
            Alert.alert("Validation Error", "Title and Content are required.");
            return;
        }

        try {
            setLoading(true);

            const token = await SecureStore.getItemAsync("authToken");
            if (!token) {
                Alert.alert("Error", "You must be logged in to create a post.");
                router.replace("/(auth)/(login)");
                return;
            }

            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);

            if (image) {
                formData.append("postImage", {
                    uri: image,
                    name: "post-image.jpg",
                    type: "image/jpeg",
                } as any); // Ensure type matches the file type
            }

            const response = await fetch(
                "https://express-blog-api-xf23.onrender.com/api/posts",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                console.error("Error:", response);
                throw new Error("Failed to create the post.");
            }

            Alert.alert("Success", "Post created successfully!");
            // router.replace("/(post)");
            // navigation.navigate("Home");
            router.back();

        } catch (error) {
            Alert.alert("Failed to create the post.");
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={styles.container}>
                    <Text style={styles.header}>Create a New Post</Text>

                    {/* Title Input */}
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Title"
                        style={styles.input}
                        placeholderTextColor="#A0AEC0"
                    />

                    {/* Content Input */}
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Content"
                        style={[styles.input, styles.textArea]}
                        placeholderTextColor="#A0AEC0"
                        multiline
                        numberOfLines={6}
                    />

                    {/* Image Picker */}
                    <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : (
                            <Text style={styles.imagePickerText}>Select an Image</Text>
                        )}
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreatePost}
                        style={[styles.button, loading && styles.buttonDisabled]}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? "Creating Post..." : "Create Post"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F7FAFC",
        flexGrow: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#2D3748",
    },
    input: {
        backgroundColor: "#FFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: "#2D3748",
        marginBottom: 12,
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    imagePicker: {
        backgroundColor: "#E2E8F0",
        borderRadius: 8,
        height: 200,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    imagePickerText: {
        fontSize: 16,
        color: "#4A5568",
    },
    imagePreview: {
        width: "100%",
        height: "100%",
        borderRadius: 8,
    },
    button: {
        backgroundColor: "#4CAF50",
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonDisabled: {
        backgroundColor: "#A0AEC0",
    },
    buttonText: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
