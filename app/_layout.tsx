import { Stack } from "expo-router";
import React from "react";

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: '(post)/index',
};

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="(post)">
      <Stack.Screen name="(post)" />
      <Stack.Screen name="(userPost)" />
      <Stack.Screen name="(auth)" />
    </Stack>

  );
}