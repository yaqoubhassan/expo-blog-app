import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Post = {
  id: string;
  title: string;
  createdAt: string;
  author: { name: string; email: string };
  postImage?: string;
};

export default function PostsScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const defaultImage = "https://via.placeholder.com/150?text=No+Image";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          "https://express-blog-api-xf23.onrender.com/api/posts"
        );
        const result = await response.json();
        setPosts(result.data.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const renderPost = ({ item }: { item: Post }) => (
    <TouchableOpacity className="bg-white rounded-lg shadow-md overflow-hidden">
      <Image
        source={{ uri: item.postImage || defaultImage }}
        className="w-full h-40"
        resizeMode="cover"
      />
      <View className="p-4">
        <Text className="text-lg font-bold text-emerald-600 mb-2">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500 mb-1">By {item.author.name}</Text>
        <Text className="text-xs text-gray-400">
          {new Date(item.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#10B981" />
      </SafeAreaView>
    );
  }

  if (posts.length === 0) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
        <Text className="text-lg text-gray-500">No posts available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="px-4 pt-3">
        <Text className="text-lg font-semibold text-gray-800">
          Total Number of Posts: {posts.length}
        </Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item, index) => item.id || index.toString()}
        renderItem={renderPost}
        contentContainerStyle={{ padding: 16 }}
      />
    </SafeAreaView>
  );
}
