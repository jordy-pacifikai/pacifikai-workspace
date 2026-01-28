import { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function WelcomeScreen() {
  const { isAuthenticated, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // Check user role and redirect
      const role = user?.user_metadata?.role;
      if (role === 'pro') {
        router.replace('/(pro)');
      } else {
        router.replace('/(client)');
      }
    }
  }, [isAuthenticated, loading, user]);

  if (loading) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>BookFlow</Text>
        <Text style={styles.tagline}>Prise de rendez-vous simplifiee</Text>
      </View>

      <View style={styles.illustration}>
        <Text style={styles.illustrationEmoji}>📅</Text>
      </View>

      <View style={styles.features}>
        <FeatureItem icon="✨" text="Reservez en quelques clics" />
        <FeatureItem icon="🔔" text="Rappels automatiques" />
        <FeatureItem icon="🎁" text="Points fidelite" />
      </View>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/auth/signup')}
        >
          <Text style={styles.primaryButtonText}>Commencer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.secondaryButtonText}>J'ai deja un compte</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.proButton}
          onPress={() => router.push('/auth/signup?role=pro')}
        >
          <Text style={styles.proButtonText}>Je suis professionnel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  tagline: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  illustration: {
    alignItems: 'center',
    marginBottom: 40,
  },
  illustrationEmoji: {
    fontSize: 100,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
  },
  buttons: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
  },
  proButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  proButtonText: {
    color: '#6366f1',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
