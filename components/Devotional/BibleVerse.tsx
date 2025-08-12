import { View, Text, StyleSheet } from 'react-native';

interface BibleVerseProps {
  verse: string;
  passage: string;
}

export default function BibleVerse({ verse, passage }: BibleVerseProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.verse}>{verse}</Text>
      <Text style={styles.passage}>{passage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    // marginBottom: 20,
  },
  verse: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passage: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  }
});