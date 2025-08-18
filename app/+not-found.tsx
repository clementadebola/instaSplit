import { Link, Stack, useRouter } from 'expo-router';
import { StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function NotFoundScreen() {
  const router = useRouter();

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Page Not Found' }} />
      <ThemedView style={styles.container}>
        <ThemedView style={styles.iconContainer}>
          <Ionicons 
            name="alert-circle-outline" 
            size={80} 
            color="#666" 
            style={styles.icon}
          />
        </ThemedView>
        
        <ThemedView style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            404
          </ThemedText>
          <ThemedText type="subtitle" style={styles.subtitle}>
            Page Not Found
          </ThemedText>
          <ThemedText style={styles.description}>
            Sorry, the page you're looking for doesn't exist or has been moved.
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Pressable 
            style={styles.primaryButton}
            onPress={handleGoBack}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Ionicons name="arrow-back" size={20} color="white" style={styles.buttonIcon} />
            <ThemedText style={styles.primaryButtonText}>
              Go Back
            </ThemedText>
          </Pressable>

          <Link href="/(auth)/login" asChild>
            <Pressable 
              style={styles.secondaryButton}
              android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
            >
              <Ionicons name="home" size={20} color="#007AFF" style={styles.buttonIcon} />
              <ThemedText style={styles.secondaryButtonText}>
                Go to Home
              </ThemedText>
            </Pressable>
          </Link>
        </ThemedView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
    opacity: 0.8,
  },
  icon: {
    opacity: 0.6,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 72,
    fontWeight: '300',
    color: '#666',
    marginBottom: 8,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});