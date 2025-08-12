import { View, Text, StyleSheet } from 'react-native';

interface MeditationProps {
  title: string;
  text: string;
}

export default function Meditation({ title, text }: MeditationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#3d3d3d',
    borderRadius: 15,
    padding: 20,
    marginVertical: 15,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    color: '#ddd',
    fontSize: 16,
    lineHeight: 24,
  }
});