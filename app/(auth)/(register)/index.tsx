import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import "../../../global.css";
import Icon from "react-native-vector-icons/Feather";
import * as SecureStore from "expo-secure-store";

const registerSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords must match",
  });

export default function RegisterScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  const router = useRouter();
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const saveToken = async (token: string) => {
    try {
      await SecureStore.setItemAsync("authToken", token);
      console.log("Token saved successfully");
    } catch (error) {
      console.error("Failed to save token:", error);
    }
  };

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://express-blog-api-xf23.onrender.com/api/users/register",
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
        Alert.alert("Success", "Registration successful");
        if (result.data.token) {
          await saveToken(result.data.token);
        }
        router.push("/(post)");
      } else {
        Alert.alert("Error", result.message || "Registration failed");
      }
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert(
        "Error",
        "Something went wrong. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6" style={styles.background}>
      <Text className="text-3xl font-extrabold text-center mb-6" style={styles.primaryText}>
        Create Account
      </Text>

      {[
        {
          name: "name" as const,
          placeholder: "Name",
          isPassword: false,
        },
        {
          name: "email" as const,
          placeholder: "Email",
          isPassword: false,
        },
        {
          name: "password" as const,
          placeholder: "Password",
          isPassword: true,
          show: showPassword,
          toggleShow: () => setShowPassword((prev) => !prev),
        },
        {
          name: "confirmPassword" as const,
          placeholder: "Confirm Password",
          isPassword: true,
          show: showConfirmPassword,
          toggleShow: () => setShowConfirmPassword((prev) => !prev),
        },
      ].map(({ name, placeholder, isPassword, show, toggleShow }) => (
        <View key={name} style={{ marginBottom: 16 }}>
          <Controller
            name={name}
            control={control}
            render={({ field: { onChange, value } }) => (
              <View
                style={[
                  styles.inputContainer,
                  focusedField === name && styles.inputFocused,
                  isPassword && { flexDirection: "row", alignItems: "center" },
                ]}
              >
                <TextInput
                  style={[styles.textInput, isPassword && { flex: 1 }]}
                  placeholder={placeholder}
                  placeholderTextColor="#A0AEC0"
                  secureTextEntry={isPassword && !show}
                  value={value}
                  onFocus={() => setFocusedField(name)}
                  onBlur={() => setFocusedField(null)}
                  onChangeText={onChange}
                />
                {isPassword && toggleShow && (
                  <TouchableOpacity
                    onPress={toggleShow}
                    style={{ paddingHorizontal: 8 }}
                  >
                    <Icon
                      name={show ? "eye-off" : "eye"}
                      size={20}
                      color="#A0AEC0"
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          />
          {errors[name] && (
            <Text className="text-red-500 text-sm mt-1">
              {errors[name]?.message}
            </Text>
          )}
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className={`p-4 rounded mt-6 ${loading ? "bg-gray-400" : "bg-purple-600"}`}
        style={[styles.button, loading && styles.buttonDisabled]}
      >
        <Text style={styles.buttonText}>Register</Text>

      </TouchableOpacity>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#6B46C1" />
        </View>
      )}

      <TouchableOpacity
        onPress={() => router.push("/(auth)/(login)")}
        className="mt-4"
      >
        <Text style={styles.linkText}>
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    backgroundColor: "#F7FAFC",
  },
  primaryText: {
    color: "#6B46C1",
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#CBD5E0",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#6B46C1",
    borderWidth: 2,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: "#2D3748",
  },
  button: {
    backgroundColor: "#6B46C1",
    padding: 16,
    borderRadius: 8,
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
