import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PostLayout() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push("/(auth)/(login)");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const handleCreatePost = () => {
    // router.push("/posts/create");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <View className="bg-emerald-500 flex-row items-center justify-between px-4 py-3 shadow-md">
        <Text className="text-white text-xl font-bold">My Blog</Text>
        {!isLoggedIn ? (
          <TouchableOpacity
            onPress={handleLogin}
            className="bg-white px-4 py-2 rounded-md"
          >
            <Text className="text-emerald-500 font-semibold">Login</Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center space-x-4">
            <TouchableOpacity onPress={handleCreatePost}>
              <Ionicons name="create-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaView>
  );
}
