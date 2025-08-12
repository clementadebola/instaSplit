import { useRouter } from "expo-router";
import React from "react";
import {
  View,
  Text,
  Button,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/onboard.png")}
        style={styles.image}
      ></Image>

      <View style={styles.textBox}>
        <Text style={styles.title}> No more confusion on who owes what.</Text>
        <Text style={styles.subtitle}>
          Track all your group payments in one place.
        </Text>
      </View>

      <View style={styles.bottomWrap}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => router.push("/(auth)/welcome")}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push("/(auth)/login")}
        >
          <Text style={styles.getStartedText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // background: {
  //   flex: 1,
  //   justifyContent: "flex-end",
  // },
  container: {
    flex: 1,
    // padding: 20,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    // backgroundColor: "#b891f1",
  },
  image: {
    width: width,
    height: height * 0.55,
    resizeMode: "cover",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  textBox: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: "poppins",
    fontWeight: "bold",
    textAlign: "left",
    color: "#000",
    paddingHorizontal: 18,
  },
  subtitle: {
    fontFamily: "poppins",
    textAlign: "left",
    fontSize: 14,
    color: "#333",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  bottomWrap: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  dot: {
    width: 10,
    height: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  activeDot: {
    backgroundColor: "purple",
  },
  nextButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  getStartedButton: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 16,
  },
});
