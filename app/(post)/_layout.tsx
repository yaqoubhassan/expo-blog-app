import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PostList from "./index";
import CreatePostScreen from "./create";
import DetailsScreen from "./(details)/[postId]";
import MyPostsScreen from "../(userPost)";
import EditPostScreen from "../(userPost)/(edit)/[myPostId]";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import "../../global.css"

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

const CustomHeader = ({ navigation, route }: { navigation: any; route: any }) => {
  const isCreatePostScreen = route.name === "CreatePost";
  const isMyPostsScreen = route.name === 'MyPosts';

  return (
    <SafeAreaView style={{ backgroundColor: "#6B46C1" }}>
      <View className="h-16 flex-row items-center justify-between px-4">
        <TouchableOpacity
          onPress={() =>
            isCreatePostScreen ? navigation.navigate("PostList") : navigation.toggleDrawer()
          }
        >
          <Ionicons
            name={isCreatePostScreen ? "arrow-back" : "menu"}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-white">
          {isCreatePostScreen ? "Create Post" : isMyPostsScreen ? "My Posts" : "Posts"}
        </Text>
        <View style={{ width: 28 }} />
      </View>
    </SafeAreaView>
  );
};

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

          const response = await fetch(
            "https://express-blog-api-xf23.onrender.com/api/users/profile",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (!response.ok) throw new Error("Failed to fetch user profile");

          const result = await response.json();
          const { name, profilePicture } = result.data;
          setUser({ name, profileImage: profilePicture });
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
        {isLoggedIn && (
          <>
            <Image
              source={imageSource}
              className="w-20 h-20 rounded-full mb-4"
            />
            <Text className="text-lg font-semibold text-gray-800 mb-6">
              {user?.name || "Loading..."}
            </Text>
          </>
        )}
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          className="absolute top-4 right-4"
        >
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View className="px-4">
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
          }}
          onPress={() => props.navigation.navigate("PostList")}
        >
          <MaterialIcons name="list-alt" size={24} color="#4cafb0" />
          <Text style={{ marginLeft: 12, fontSize: 16, color: "#4cafb0" }}>
            All Posts
          </Text>
        </TouchableOpacity>
        {isLoggedIn && (
          <>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderBottomColor: "#e0e0e0",
              }}
              onPress={() => props.navigation.navigate("MyPosts")}
            >
              <MaterialIcons name="person" size={24} color="#4cafb0" />
              <Text style={{ marginLeft: 12, fontSize: 16, color: "#4cafb0" }}>
                My Posts
              </Text>
            </TouchableOpacity>
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

          </>
        )}
      </View>

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

const PostStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Home"
      component={PostList}
      options={{
        header: ({ navigation, route }) => (
          <CustomHeader navigation={navigation} route={route} />
        ),
      }}
    />
    <Stack.Screen
      name="[postId]"
      component={DetailsScreen}
      options={{
        title: "Post Details",
        headerStyle: { backgroundColor: "#6B46C1" },
        headerTintColor: "#fff",
        headerShown: true,
      }}
    />
  </Stack.Navigator>
);

const MyPostStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="UserPost"
      component={MyPostsScreen}
      options={{
        header: ({ navigation, route }) => (
          <CustomHeader navigation={navigation} route={route} />
        ),
      }}
    />
    <Stack.Screen
      name="[myPostId]"
      component={EditPostScreen}
      options={{
        title: "Edit Post",
        headerStyle: { backgroundColor: "#6B46C1" },
        headerTintColor: "#fff",
        headerShown: true,
      }}
    />
  </Stack.Navigator>
);

export default function PostLayout() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { width: 240 },
      }}
    >
      <Drawer.Screen
        name="PostList"
        component={PostStack}
        options={{
          headerShown: false,
        }}
      />
      <Drawer.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          header: ({ navigation, route }) => (
            <CustomHeader navigation={navigation} route={route} />
          ),
          title: "Create Post",
        }}
      />
      <Drawer.Screen
        name="MyPosts"
        component={MyPostStack}
        options={{
          headerShown: false,
        }}
      />
    </Drawer.Navigator>
  );
}
