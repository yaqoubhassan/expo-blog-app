import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Feather";
import * as SecureStore from "expo-secure-store";
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
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
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
        await SecureStore.setItemAsync("authToken", result.data.token);
        Alert.alert("Success", "Logged in successfully");
        router.replace("/(post)"); // Redirect to posts screen
      } else {
        Alert.alert("Error", result.message || "Login failed");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 justify-center px-6" style={styles.background}>
          {/* Header with "View Posts" link */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.replace("/(post)")}>
              <Text style={styles.viewPostsText}>Go To Posts Screen</Text>
            </TouchableOpacity>
          </View>

          <Text
            className="text-3xl font-extrabold text-center mb-6"
            style={styles.primaryText}
          >
            Welcome Back!
          </Text>

          {/* Email Field */}
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
                placeholderTextColor="#A0AEC0"
                value={value}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
                onChangeText={onChange}
              />
            )}
          />
          {errors.email && (
            <Text className="text-red-500 text-sm">{errors.email.message}</Text>
          )}

          {/* Password Field */}
          <View style={styles.passwordContainer}>
            <Controller
              name="password"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    focusedField === "password" && styles.inputFocused,
                  ]}
                  placeholder="Password"
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={!showPassword}
                  value={value}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={onChange}
                />
              )}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.iconContainer}
            >
              <Icon
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#A0AEC0"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm">{errors.password.message}</Text>
          )}

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6B46C1" />
            </View>
          )}

          {/* Redirect to Register */}
          <TouchableOpacity onPress={() => router.push("/(auth)/(register)")}>
            <Text style={styles.linkText}>
              Don't have an account? Register here
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F7FAFC",
  },
  primaryText: {
    color: "#6B46C1",
  },
  header: {
    position: "absolute",
    top: 50,
    right: 20, // Align to the right
  },
  viewPostsText: {
    color: "#319795",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline", // Add underline
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#2D3748",
  },
  inputFocused: {
    borderColor: "#6B46C1",
    borderWidth: 2,
  },
  passwordContainer: {
    position: "relative",
  },
  passwordInput: {
    paddingRight: 40,
  },
  iconContainer: {
    position: "absolute",
    right: 16,
    top: 16,
  },
  button: {
    backgroundColor: "#6B46C1",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: "#A0AEC0",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  linkText: {
    color: "#319795",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
});
