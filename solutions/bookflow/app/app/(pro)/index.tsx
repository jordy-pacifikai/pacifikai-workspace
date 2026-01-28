import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

export default function ProDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const businessName = user?.user_metadata?.name || 'Mon établissement';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  // TODO: Fetch from Supabase
  const todayAppointments: any[] = [];
  const stats = {
    todayCount: 0,
    weekCount: 0,
    monthRevenue: 0,
    pendingConfirmations: 0,
  };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{businessName}</Text>
          <Text style={styles.date}>{today}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#ffffff" />
          {stats.pendingConfirmations > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{stats.pendingConfirmations}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={24} color="#6366f1" />
          <Text style={styles.statValue}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>RDV aujourd'hui</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trending-up" size={24} color="#10b981" />
          <Text style={styles.statValue}>{stats.weekCount}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="cash" size={24} color="#f59e0b" />
          <Text style={styles.statValue}>{stats.monthRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>XPF ce mois</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(pro)/agenda')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="add" size={24} color="#6366f1" />
            </View>
            <Text style={styles.quickActionText}>Nouveau RDV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => router.push('/(pro)/clients')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="person-add" size={24} color="#10b981" />
            </View>
            <Text style={styles.quickActionText}>Nouveau client</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="share-social" size={24} color="#f59e0b" />
            </View>
            <Text style={styles.quickActionText}>Partager</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Today's Schedule */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Programme du jour</Text>
          <TouchableOpacity onPress={() => router.push('/(pro)/agenda')}>
            <Text style={styles.seeAll}>Voir agenda</Text>
          </TouchableOpacity>
        </View>

        {todayAppointments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="sunny-outline" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>Journée libre</Text>
            <Text style={styles.emptyText}>Aucun rendez-vous prévu pour aujourd'hui</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(pro)/agenda')}
            >
              <Ionicons name="add" size={18} color="#6366f1" />
              <Text style={styles.emptyButtonText}>Ajouter un RDV</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.appointmentsList}>
            {todayAppointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <View style={styles.appointmentTime}>
                  <Text style={styles.appointmentTimeText}>
                    {appointment.start_time.slice(0, 5)}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentClient}>
                    {appointment.client?.name || appointment.guest_name || 'Client'}
                  </Text>
                  <Text style={styles.appointmentService}>
                    {appointment.service?.name || 'Service'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.appointmentStatus,
                    appointment.status === 'confirmed' && styles.statusConfirmed,
                    appointment.status === 'pending' && styles.statusPending,
                  ]}
                >
                  <Ionicons
                    name={appointment.status === 'confirmed' ? 'checkmark' : 'time'}
                    size={16}
                    color={appointment.status === 'confirmed' ? '#10b981' : '#f59e0b'}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Public Link */}
      <View style={styles.section}>
        <View style={styles.publicLinkCard}>
          <View style={styles.publicLinkHeader}>
            <Ionicons name="link" size={24} color="#6366f1" />
            <View style={styles.publicLinkInfo}>
              <Text style={styles.publicLinkTitle}>Votre lien public</Text>
              <Text style={styles.publicLinkUrl}>bookflow.app/pro/...</Text>
            </View>
          </View>
          <Text style={styles.publicLinkDescription}>
            Partagez ce lien sur vos réseaux pour permettre à vos clients de réserver directement
          </Text>
          <View style={styles.publicLinkActions}>
            <TouchableOpacity style={styles.publicLinkButton}>
              <Ionicons name="copy-outline" size={18} color="#6366f1" />
              <Text style={styles.publicLinkButtonText}>Copier</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.publicLinkButton}>
              <Ionicons name="qr-code-outline" size={18} color="#6366f1" />
              <Text style={styles.publicLinkButtonText}>QR Code</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.publicLinkButton, styles.publicLinkButtonPrimary]}>
              <Ionicons name="share-outline" size={18} color="#ffffff" />
              <Text style={[styles.publicLinkButtonText, styles.publicLinkButtonTextPrimary]}>
                Partager
              </Text>
            </TouchableOpacity>
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6366f1',
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  date: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
    textTransform: 'capitalize',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4b5563',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  appointmentsList: {
    gap: 8,
  },
  appointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  appointmentTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  appointmentService: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  appointmentStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusConfirmed: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  publicLinkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  publicLinkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  publicLinkInfo: {
    flex: 1,
  },
  publicLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  publicLinkUrl: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 2,
  },
  publicLinkDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
    lineHeight: 20,
  },
  publicLinkActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  publicLinkButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  publicLinkButtonPrimary: {
    backgroundColor: '#6366f1',
  },
  publicLinkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6366f1',
  },
  publicLinkButtonTextPrimary: {
    color: '#ffffff',
  },
});
