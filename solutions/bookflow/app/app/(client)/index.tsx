import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function ClientHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const userName = user?.user_metadata?.name || 'Client';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour, {userName}</Text>
        <Text style={styles.subGreeting}>Qu'est-ce qu'on se fait aujourd'hui ?</Text>
      </View>

      {/* Prochain RDV */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Prochain rendez-vous</Text>
        <View style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Aucun RDV prévu</Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(client)/explore')}
          >
            <Text style={styles.ctaButtonText}>Prendre rendez-vous</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Salons favoris */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes favoris</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyCard}>
          <Ionicons name="heart-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>Pas encore de favoris</Text>
          <Text style={styles.emptySubtext}>
            Explorez les professionnels et ajoutez vos préférés
          </Text>
        </View>
      </View>

      {/* Points fidélité */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ma fidélité</Text>
        <View style={styles.loyaltyCard}>
          <View style={styles.loyaltyHeader}>
            <Ionicons name="star" size={24} color="#f59e0b" />
            <Text style={styles.loyaltyPoints}>0 points</Text>
          </View>
          <Text style={styles.loyaltyText}>
            Gagnez des points à chaque rendez-vous et profitez de récompenses exclusives
          </Text>
        </View>
      </View>

      {/* Actions rapides */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(client)/explore')}
          >
            <Ionicons name="search" size={24} color="#6366f1" />
            <Text style={styles.quickActionText}>Explorer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(client)/chat')}
          >
            <Ionicons name="chatbubble" size={24} color="#6366f1" />
            <Text style={styles.quickActionText}>Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(client)/appointments')}
          >
            <Ionicons name="time" size={24} color="#6366f1" />
            <Text style={styles.quickActionText}>Historique</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subGreeting: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loyaltyCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loyaltyPoints: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#92400e',
  },
  loyaltyText: {
    fontSize: 14,
    color: '#92400e',
    marginTop: 8,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 8,
  },
});
