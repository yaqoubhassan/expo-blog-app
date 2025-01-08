import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import "../../../global.css";
import Icon from "react-native-vector-icons/Feather";

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

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
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
        console.log(result); // Navigate or handle token here
      } else {
        Alert.alert("Error", result.message || "Registration failed");
      }
    } catch (error) {
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-gray-50">
      <Text className="text-3xl font-extrabold text-center text-green-600 mb-6">
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
                  placeholderTextColor="#9CA3AF"
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
                      color="#9CA3AF"
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
        className="bg-green-500 p-4 rounded mt-6"
      >
        <Text className="text-white text-center font-medium text-lg">Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(post)")}
        className="mt-4"
      >
        <Text className="text-green-600 text-center font-medium text-lg">
          Already have an account? Login here
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  inputFocused: {
    borderColor: "#10B981",
    borderWidth: 2,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: "#374151",
  },
});
