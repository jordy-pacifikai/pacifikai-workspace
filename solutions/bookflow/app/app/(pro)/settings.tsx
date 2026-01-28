import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function ProSettings() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  const businessName = user?.user_metadata?.name || 'Mon établissement';

  const handleSignOut = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Business Profile */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon établissement</Text>

        <TouchableOpacity style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="storefront" size={32} color="#6366f1" />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{businessName}</Text>
            <Text style={styles.profileSlug}>bookflow.app/pro/...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="image-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Photos et couverture</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Adresse</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="call-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Contact</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="logo-instagram" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Réseaux sociaux</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Booking Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Réservations</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="time-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Horaires d'ouverture</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="calendar-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Jours fermés</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="options-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Paramètres de réservation</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <View style={styles.menuItemSwitch}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="eye-outline" size={22} color="#6b7280" />
            <View style={styles.menuItemTextContainer}>
              <Text style={styles.menuItemText}>Visible dans l'annuaire</Text>
              <Text style={styles.menuItemSubtext}>
                Les clients peuvent vous trouver via l'exploration
              </Text>
            </View>
          </View>
          <Switch
            value={isVisible}
            onValueChange={setIsVisible}
            trackColor={{ false: '#e5e7eb', true: '#c7d2fe' }}
            thumbColor={isVisible ? '#6366f1' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Loyalty */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fidélité</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="star-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Programme fidélité</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="gift-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Récompenses</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Paramètres de notification</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="alarm-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Rappels clients</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abonnement</Text>

        <TouchableOpacity style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>FREE</Text>
            </View>
            <Text style={styles.subscriptionTitle}>Plan Gratuit</Text>
          </View>
          <Text style={styles.subscriptionText}>
            30 RDV/mois • Pas de chatbot IA • Pas de fidélité
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Passer à Pro</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Centre d'aide</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color="#6b7280" />
          <Text style={styles.menuItemText}>Nous contacter</Text>
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        </TouchableOpacity>
      </View>

      {/* Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.signOutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.version}>BookFlow Pro v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  profileSlug: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  subscriptionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  planBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  subscriptionText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  upgradeButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 24,
    marginBottom: 32,
  },
});
