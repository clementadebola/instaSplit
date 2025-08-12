import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";

const { height, width } = Dimensions.get("window");
const TAB_BAR_HEIGHT = 200;

export default function CustomScrollView({
  children,
  style,
  contentContainerStyle,
}: {
  children: React.ReactNode;
  style?: any;
  contentContainerStyle?: any;
}) {
  return (
    <ScrollView
      style={style}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
    >
      {children}
      {/* <View style={styles.bottomPadding} /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    // Remove paddingBottom here to allow for our custom bottom padding
    minHeight: height + TAB_BAR_HEIGHT, // Ensure content is at least full screen + tab bar
  },
  bottomPadding: {
    height: TAB_BAR_HEIGHT + 20, // Extra padding to ensure content goes beyond tab bar
  },
});
