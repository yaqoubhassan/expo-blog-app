import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import "../../../global.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof loginSchema>>({ resolver: zodResolver(loginSchema) });

  const router = useRouter();

  const [focusedField, setFocusedField] = useState<string | null>(null);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    try {
      const response = await fetch(
        "https://express-blog-api-xf23.onrender.com/api/users/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Logged in successfully");
        console.log(result); // Handle token storage or navigation here
      } else {
        Alert.alert("Error", result.message || "Login failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-3xl font-extrabold text-center text-green-600 mb-6">
        Welcome Back!
      </Text>

      <Controller
        name="email"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              focusedField === "email" && styles.inputFocused,
            ]}
            placeholder="Email"
            placeholderTextColor="#9CA3AF"
            value={value}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            onChangeText={onChange}
          />
        )}
      />
      {errors.email && <Text className="text-red-500 text-sm">{errors.email.message}</Text>}

      <Controller
        name="password"
        control={control}
        render={({ field: { onChange, value } }) => (
          <TextInput
            style={[
              styles.input,
              focusedField === "password" && styles.inputFocused,
            ]}
            placeholder="Password"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={value}
            onFocus={() => setFocusedField("password")}
            onBlur={() => setFocusedField(null)}
            onChangeText={onChange}
          />
        )}
      />
      {errors.password && <Text className="text-red-500 text-sm">{errors.password.message}</Text>}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="bg-green-500 p-4 rounded mb-6"
      >
        <Text className="text-white text-center font-medium text-lg">Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(auth)/(register)")}
        className="mt-4"
      >
        <Text className="text-green-600 text-center font-medium text-lg">
          Don't have an account? Register here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB", // Thin gray border
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#374151",
  },
  inputFocused: {
    borderColor: "#10B981", // Green border when focused
    borderWidth: 2,
  },
});
