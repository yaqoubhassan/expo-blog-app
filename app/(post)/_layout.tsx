import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, Alert, SafeAreaView } from "react-native";
import { createDrawerNavigator, DrawerContentScrollView } from "@react-navigation/drawer";
import PostsScreen from "./index"; // Adjust the import path if needed
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const Drawer = createDrawerNavigator();

// Custom Header with Drawer Toggle Button
const CustomHeader = ({ navigation }: { navigation: any }) => (
  <SafeAreaView style={{ backgroundColor: "#6B46C1" }}>
    <View className="h-16 flex-row items-center justify-between px-4">
      <TouchableOpacity onPress={() => navigation.toggleDrawer()}>
        <Ionicons name="menu" size={28} color="#fff" />
      </TouchableOpacity>
      <Text className="text-lg font-semibold text-white">Posts</Text>
      <View style={{ width: 28 }} /> {/* Spacer for symmetry */}
    </View>
  </SafeAreaView>
);

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; profileImage: string | null } | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = await SecureStore.getItemAsync("authToken");
        if (token) {
          setIsLoggedIn(true);

          // Fetch user profile if logged in
          const response = await fetch(
            "https://express-blog-api-xf23.onrender.com/api/users/profile",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch user profile");
          }

          const result = await response.json();
          const { name, profilePicture } = result.data;
          setUser({
            name,
            profileImage: profilePicture,
          });
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      }
    };

    checkAuthentication();
  }, []);

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync("authToken");
      setIsLoggedIn(false);
      setUser(null);
      Alert.alert("Success", "You have been logged out.");
      router.replace("/(auth)/(login)");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  const handleLoginRedirect = () => {
    router.replace("/(auth)/(login)");
  };

  const imageSource = user?.profileImage
    ? { uri: user.profileImage }
    : require("../../assets/images/avatar.png");

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View className="px-4 py-6">
        {isLoggedIn ? (
          <>
            <Image
              source={imageSource}
              className="w-20 h-20 rounded-full mb-4"
            />
            <Text className="text-lg font-semibold text-gray-800 mb-6">
              {user?.name || "Loading..."}
            </Text>
          </>
        ) : null}
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          className="absolute top-4 right-4"
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View className="px-4">
        {isLoggedIn ? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
            onPress={() => props.navigation.navigate("CreatePost")}
          >
            <MaterialIcons name="add-circle-outline" size={24} color="#4cafb0" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#4cafb0" }}>
              Create Post
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Spacer to push Login/Logout to the bottom */}
      <View style={{ flex: 1 }} />

      <View className="px-4">
        {isLoggedIn ? (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
            }}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#d32f2f" }}>
              Logout
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 10,
            }}
            onPress={handleLoginRedirect}
          >
            <Ionicons name="log-in-outline" size={24} color="#4cafb0" />
            <Text style={{ marginLeft: 12, fontSize: 16, color: "#4cafb0" }}>
              Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </DrawerContentScrollView>
  );
};


export default function PostLayout() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          width: 240, // Adjust the width as needed
        },
      }}
    >
      <Drawer.Screen
        name="Posts"
        component={PostsScreen}
        options={{
          header: ({ navigation }) => <CustomHeader navigation={navigation} />,
        }}
      />
      {/* Add additional screens if necessary */}
    </Drawer.Navigator>
  );
}
