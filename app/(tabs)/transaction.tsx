import {
  Image,
  StyleSheet,
  Platform,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import CustomScrollView from "@/components/CustomScrollView";
import Meditation from "@/components/Devotional/Meditation";
import BibleVerse from "@/components/Devotional/BibleVerse";
import Prayer from "@/components/Devotional/Prayer";
import { getTodaysDevotional } from "@/utils/dailyDevotional";

const { height, width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 70; // Adjust this based on your tab bar height

export default function transactionScreen() {
  const navigation = useNavigation();
  const todaysDevotional = getTodaysDevotional();

  return (
    <CustomScrollView contentContainerStyle={{ paddingHorizontal: 0 }}>
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar barStyle="light-content" />

        <View style={styles.topContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.topTextWrap}>
            <Text style={styles.topText}>Verse of the day</Text>
            <BibleVerse
              verse={todaysDevotional.verse}
              passage={todaysDevotional.passage}
            />
            {/* <Text style={styles.biblePassage}>
              {" "}
              Sing unto the lord with thanksgiving; sing upon the harp unto our
              God:
            </Text> */}
          </View>
        </View>

        <View style={styles.bottomContainer}>
          <View style={styles.mainContent}>
            <Text style={styles.topicText}>
              Topic: {todaysDevotional.topic}
            </Text>
            <Text style={styles.biblePassage}>{todaysDevotional.content}</Text>

            <Meditation title="Meditation" text={todaysDevotional.meditation} />

            <Prayer title="Prayer" text={todaysDevotional.prayer} />

            <TouchableOpacity style={styles.shareButton}>
              <FontAwesome name="share-alt" size={20} color="#fff" />
              <Text style={styles.shareText}>Share Today's Devotional</Text>
            </TouchableOpacity>
          </View>

          {/* This is an empty view that ensures the content extends beyond the tab bar */}
          <View style={styles.bottomPadding} />
        </View>
      </SafeAreaView>
    </CustomScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6F2BD4FF",
  },
  topContent: {
    alignItems: "center",
    height: height * 0.28,
    justifyContent: "center",
    position: "relative",
    padding: 20,
  },
  backButton: {
    position: "absolute",
    top: 15,
    left: 16,
    backgroundColor: "#2f2f2f",
    padding: 7,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    zIndex: 10,
  },
  topTextWrap: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  topText: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
  },
  bibleVerse: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "semibold",
  },
  biblePassage: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "semibold",
    marginBottom: 20,
  },
  bottomContainer: {
    backgroundColor: "#2f2f2f",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    // Extend it past the visible area to ensure it covers everything
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    // Add a subtle shadow for depth
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  mainContent: {
    padding: 35,
    paddingBottom: 20,
    alignItems: "center",
  },
  topicText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
    marginBottom: 15,
  },
  meditationSection: {
    width: "100%",
    backgroundColor: "#3d3d3d",
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
  },
  meditationTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  meditationText: {
    color: "#ddd",
    fontSize: 16,
    lineHeight: 24,
  },
  prayerSection: {
    width: "100%",
    backgroundColor: "#484848",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  prayerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  prayerText: {
    color: "#ddd",
    fontSize: 16,
    fontStyle: "italic",
    lineHeight: 24,
  },
  shareButton: {
    flexDirection: "row",
    backgroundColor: "#cc5200",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  shareText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: TAB_BAR_HEIGHT + 20, // Extra padding to ensure content goes beyond tab bar
  },
});
