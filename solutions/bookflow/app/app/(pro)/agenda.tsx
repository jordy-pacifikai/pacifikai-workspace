import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

type ViewMode = 'day' | 'week' | 'month';

export default function Agenda() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // TODO: Fetch appointments from Supabase
  const appointments: any[] = [];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h - 19h

  return (
    <View style={styles.container}>
      {/* View Mode Tabs */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'day' && styles.viewModeTabActive]}
          onPress={() => setViewMode('day')}
        >
          <Text style={[styles.viewModeText, viewMode === 'day' && styles.viewModeTextActive]}>
            Jour
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'week' && styles.viewModeTabActive]}
          onPress={() => setViewMode('week')}
        >
          <Text style={[styles.viewModeText, viewMode === 'week' && styles.viewModeTextActive]}>
            Semaine
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeTab, viewMode === 'month' && styles.viewModeTabActive]}
          onPress={() => setViewMode('month')}
        >
          <Text style={[styles.viewModeText, viewMode === 'month' && styles.viewModeTextActive]}>
            Mois
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('prev')}
        >
          <Ionicons name="chevron-back" size={24} color="#6366f1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
          <Text style={styles.currentDate}>{formatDate(selectedDate)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateDate('next')}
        >
          <Ionicons name="chevron-forward" size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Day View */}
      {viewMode === 'day' && (
        <ScrollView style={styles.dayView}>
          {hours.map((hour) => (
            <View key={hour} style={styles.hourRow}>
              <Text style={styles.hourLabel}>{`${hour}:00`}</Text>
              <View style={styles.hourSlot}>
                {/* TODO: Render appointments for this hour */}
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <View style={styles.weekView}>
          <View style={styles.weekHeader}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, index) => (
              <View key={day} style={styles.weekDay}>
                <Text style={styles.weekDayName}>{day}</Text>
                <Text style={styles.weekDayNumber}>
                  {new Date(
                    selectedDate.getTime() +
                      (index - selectedDate.getDay() + 1) * 24 * 60 * 60 * 1000
                  ).getDate()}
                </Text>
              </View>
            ))}
          </View>
          <ScrollView style={styles.weekContent}>
            {hours.map((hour) => (
              <View key={hour} style={styles.weekHourRow}>
                <Text style={styles.hourLabel}>{`${hour}:00`}</Text>
                <View style={styles.weekHourSlots}>
                  {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                    <View key={dayIndex} style={styles.weekSlot} />
                  ))}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <View style={styles.monthView}>
          <View style={styles.monthHeader}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
              <Text key={index} style={styles.monthDayName}>
                {day}
              </Text>
            ))}
          </View>
          <View style={styles.monthGrid}>
            {/* TODO: Generate month calendar */}
            {Array.from({ length: 35 }, (_, i) => {
              const firstDay = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                1
              );
              const startOffset = (firstDay.getDay() + 6) % 7;
              const dayNumber = i - startOffset + 1;
              const daysInMonth = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth() + 1,
                0
              ).getDate();
              const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
              const isToday =
                isCurrentMonth &&
                dayNumber === new Date().getDate() &&
                selectedDate.getMonth() === new Date().getMonth() &&
                selectedDate.getFullYear() === new Date().getFullYear();

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.monthDay,
                    isToday && styles.monthDayToday,
                  ]}
                >
                  <Text
                    style={[
                      styles.monthDayNumber,
                      !isCurrentMonth && styles.monthDayNumberOther,
                      isToday && styles.monthDayNumberToday,
                    ]}
                  >
                    {isCurrentMonth ? dayNumber : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  viewModeContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 8,
    gap: 8,
  },
  viewModeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  viewModeTabActive: {
    backgroundColor: '#6366f1',
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  viewModeTextActive: {
    color: '#ffffff',
  },
  dateNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    padding: 8,
  },
  currentDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textTransform: 'capitalize',
  },
  dayView: {
    flex: 1,
    padding: 16,
  },
  hourRow: {
    flexDirection: 'row',
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  hourLabel: {
    width: 50,
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    paddingRight: 12,
  },
  hourSlot: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderLeftWidth: 2,
    borderLeftColor: '#e5e7eb',
    paddingLeft: 12,
  },
  weekView: {
    flex: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingLeft: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayName: {
    fontSize: 12,
    color: '#6b7280',
  },
  weekDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  weekContent: {
    flex: 1,
    padding: 8,
  },
  weekHourRow: {
    flexDirection: 'row',
    height: 48,
  },
  weekHourSlots: {
    flex: 1,
    flexDirection: 'row',
  },
  weekSlot: {
    flex: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  monthView: {
    flex: 1,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    paddingBottom: 12,
  },
  monthDayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthDay: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayToday: {
    backgroundColor: '#6366f1',
    borderRadius: 20,
  },
  monthDayNumber: {
    fontSize: 14,
    color: '#1f2937',
  },
  monthDayNumberOther: {
    color: '#d1d5db',
  },
  monthDayNumberToday: {
    color: '#ffffff',
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
