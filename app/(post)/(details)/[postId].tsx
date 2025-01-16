import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Button,
    Alert,
} from "react-native";
import { useFocusEffect, useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

type PostDetailsScreen = {
    postId: string;
};

export default function PostDetailsScreen() {
    const route = useRoute<RouteProp<{ params: PostDetailsScreen }, "params">>();
    const postId = route.params?.postId;
    const navigation = useNavigation();
    const [postDetails, setPostDetails] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [authUserId, setAuthUserId] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null);


    const fetchAuthUser = async () => {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) return;
        const response = await fetch("https://express-blog-api-xf23.onrender.com/api/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setAuthUserId(data?.data?.id);
    };

    const fetchPostDetails = async () => {
        try {
            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/posts/${postId}`
            );
            if (!response.ok) throw new Error("Failed to fetch post details");
            const data = await response.json();
            setPostDetails(data.data.post);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/comments/${postId}`
            );
            if (!response.ok) throw new Error("Failed to fetch comments");
            const data = await response.json();
            setComments(data.data.comments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) return;

        try {
            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/comments/${commentId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to delete comment");
            setComments((prev) => prev.filter((comment) => comment._id !== commentId));
            Alert.alert("Success", "Comment deleted successfully!");
        } catch (err) {
            Alert.alert("Error", "Failed to delete comment. Please try again.");
        }
    };

    const handleUpdateComment = async () => {
        if (!editingComment) return;

        const token = await SecureStore.getItemAsync("authToken");
        if (!token) return;

        try {
            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/comments/${editingComment.id}`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: editingComment.content }),
                }
            );
            if (!response.ok) throw new Error("Failed to update comment");
            const updatedComment = await response.json();

            setComments((prev) =>
                prev.map((comment) =>
                    comment._id === editingComment.id ? updatedComment.data.updatedComment : comment
                )
            );
            Alert.alert("Success", "Comment updated successfully!");
        } catch (err) {
            Alert.alert("Error", "Failed to update comment. Please try again.");
        } finally {
            setEditingComment(null); // Exit edit mode
        }
    };


    const handleAddComment = async () => {
        const token = await SecureStore.getItemAsync("authToken");
        if (!token) {
            Alert.alert(
                "Login Required",
                "You need to be logged in to add a comment.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate("(auth)") }, // Update this route to match your auth flow
                ]
            );
            return;
        }

        setCommentLoading(true);
        try {
            const response = await fetch(
                `https://express-blog-api-xf23.onrender.com/api/comments/${postId}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ content: newComment }),
                }
            );
            if (!response.ok) throw new Error("Failed to add comment");
            const data = await response.json();
            setComments((prev) => [data.data.comment, ...prev]);
            setNewComment("");
            Alert.alert("Success", "Comment added successfully!");
        } catch (err) {
            Alert.alert("Error", "Failed to add comment. Please try again.");
        } finally {
            setCommentLoading(false);
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchPostDetails();
            fetchComments();
            fetchAuthUser();
        }, [postId])
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#6B46C1" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {postDetails?.postImage && (
                <Image
                    source={{ uri: postDetails.postImage }}
                    style={styles.image}
                    resizeMode="cover"
                />
            )}
            <Text style={styles.title}>{postDetails?.title}</Text>
            <Text style={styles.meta}>
                By {postDetails?.author?.name} ({postDetails?.author?.email})
            </Text>
            <Text style={styles.meta}>{new Date(postDetails?.createdAt).toDateString()}</Text>
            <Text style={styles.content}>{postDetails?.content}</Text>

            <View style={styles.commentsContainer}>
                <Text style={styles.sectionTitle}>Comments</Text>
                {comments.map((comment, index) => (
                    <View key={index} style={styles.comment}>
                        <View style={styles.commentHeader}>
                            <Text style={styles.commentAuthor}>
                                {comment.author?.name || "Unknown Author"}
                            </Text>
                            <Text style={styles.commentDate}>
                                {comment.createdAt ? new Date(comment.createdAt).toDateString() : "Unknown Date"}
                            </Text>
                        </View>
                        {editingComment?.id === comment._id ? (
                            <>
                                <TextInput
                                    value={editingComment?.content || ""}
                                    onChangeText={(text) =>
                                        setEditingComment((prev) => prev && { ...prev, content: text })
                                    }
                                    style={styles.input}
                                    multiline
                                />
                                <View style={styles.commentActions}>
                                    <Button
                                        title="Save"
                                        onPress={handleUpdateComment}
                                        color="#4cafb0"
                                    />
                                    <Button
                                        title="Cancel"
                                        onPress={() => setEditingComment(null)}
                                        color="#E53E3E"
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.commentText}>{comment.content || "No Content"}</Text>
                                {authUserId === comment.author?._id ? (
                                    <View style={styles.commentActions}>
                                        <Button
                                            title="Edit"
                                            onPress={() =>
                                                setEditingComment({ id: comment._id, content: comment.content })
                                            }
                                        />
                                        <Button
                                            title="Delete"
                                            onPress={() => handleDeleteComment(comment._id)}
                                            color="#E53E3E"
                                        />
                                    </View>
                                ) : null}
                            </>
                        )}
                    </View>
                ))}


            </View>

            <View style={styles.addCommentContainer}>
                <TextInput
                    value={newComment}
                    onChangeText={setNewComment}
                    placeholder="Write a comment..."
                    style={styles.input}
                    multiline
                />
                <Button
                    title={commentLoading ? "Posting..." : "Post Comment"}
                    onPress={() => handleAddComment()}
                    disabled={commentLoading || !newComment.trim()}
                    color="#4cafb0"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F7FAFC",
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#2D3748",
        marginBottom: 8,
    },
    meta: {
        fontSize: 14,
        color: "#718096",
        marginBottom: 16,
    },
    content: {
        fontSize: 16,
        color: "#4A5568",
        lineHeight: 24,
        marginBottom: 24,
    },
    commentsContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#2D3748",
        marginBottom: 16,
    },
    comment: {
        padding: 12,
        backgroundColor: "#EDF2F7",
        borderRadius: 8,
        marginBottom: 12,
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#2D3748",
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: "#4A5568",
    },
    addCommentContainer: {
        marginTop: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        backgroundColor: "#fff",
        textAlignVertical: "top",
        minHeight: 60,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F7FAFC",
    },
    errorText: {
        color: "#E53E3E",
        fontSize: 16,
    },
    commentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    commentDate: {
        fontSize: 12,
        color: "#718096",
    },
    commentActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
});
