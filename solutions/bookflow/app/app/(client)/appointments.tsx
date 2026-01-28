import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'upcoming' | 'past';

export default function Appointments() {
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  // TODO: Fetch appointments from Supabase
  const upcomingAppointments: any[] = [];
  const pastAppointments: any[] = [];

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // TODO: Fetch data
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const appointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upcoming' && styles.tabActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.tabTextActive]}>
            À venir
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'past' && styles.tabActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.tabText, activeTab === 'past' && styles.tabTextActive]}>
            Passés
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name={activeTab === 'upcoming' ? 'calendar-outline' : 'time-outline'}
              size={64}
              color="#d1d5db"
            />
            <Text style={styles.emptyTitle}>
              {activeTab === 'upcoming'
                ? 'Aucun rendez-vous prévu'
                : 'Aucun rendez-vous passé'}
            </Text>
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming'
                ? 'Explorez les professionnels et réservez votre prochain RDV'
                : 'Votre historique de rendez-vous apparaîtra ici'}
            </Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.dateBox}>
                  <Text style={styles.dateDay}>
                    {new Date(appointment.date).getDate()}
                  </Text>
                  <Text style={styles.dateMonth}>
                    {new Date(appointment.date).toLocaleDateString('fr-FR', {
                      month: 'short',
                    })}
                  </Text>
                </View>
                <View style={styles.appointmentInfo}>
                  <Text style={styles.appointmentTime}>
                    {appointment.start_time.slice(0, 5)}
                  </Text>
                  <Text style={styles.appointmentService}>
                    {appointment.service?.name || 'Service'}
                  </Text>
                  <Text style={styles.appointmentBusiness}>
                    {appointment.business?.name || 'Établissement'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    appointment.status === 'confirmed' && styles.statusConfirmed,
                    appointment.status === 'pending' && styles.statusPending,
                    appointment.status === 'completed' && styles.statusCompleted,
                    appointment.status === 'cancelled' && styles.statusCancelled,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {appointment.status === 'confirmed' && 'Confirmé'}
                    {appointment.status === 'pending' && 'En attente'}
                    {appointment.status === 'completed' && 'Terminé'}
                    {appointment.status === 'cancelled' && 'Annulé'}
                  </Text>
                </View>
              </View>

              {activeTab === 'upcoming' && appointment.status !== 'cancelled' && (
                <View style={styles.appointmentActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Ionicons name="create-outline" size={16} color="#6366f1" />
                    <Text style={styles.actionButtonText}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, styles.actionButtonDanger]}>
                    <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
                    <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
                      Annuler
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {activeTab === 'past' && appointment.status === 'completed' && (
                <TouchableOpacity style={styles.reviewButton}>
                  <Ionicons name="star-outline" size={16} color="#f59e0b" />
                  <Text style={styles.reviewButtonText}>Laisser un avis</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#9ca3af',
  },
  tabTextActive: {
    color: '#6366f1',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  appointmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    width: 48,
    height: 48,
    backgroundColor: '#eef2ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  dateMonth: {
    fontSize: 10,
    color: '#6366f1',
    textTransform: 'uppercase',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 2,
  },
  appointmentBusiness: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusConfirmed: {
    backgroundColor: '#d1fae5',
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusCompleted: {
    backgroundColor: '#e0e7ff',
  },
  statusCancelled: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  appointmentActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#eef2ff',
  },
  actionButtonDanger: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6366f1',
  },
  actionButtonTextDanger: {
    color: '#ef4444',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#92400e',
  },
});
