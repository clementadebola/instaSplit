import { View, Text, StyleSheet } from 'react-native';

interface PrayerProps {
  title: string;
  text: string;
}

export default function Prayer({ title, text }: PrayerProps) {
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
    backgroundColor: '#484848',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
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
    fontStyle: 'italic',
    lineHeight: 24,
  }
});