import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBusiness } from '../../hooks/useBusiness';

const CATEGORIES = [
  { id: 'coiffure', name: 'Coiffure', icon: 'cut-outline' },
  { id: 'ongles', name: 'Ongles', icon: 'hand-left-outline' },
  { id: 'bien-etre', name: 'Bien-être', icon: 'leaf-outline' },
  { id: 'sport', name: 'Sport', icon: 'fitness-outline' },
  { id: 'beaute', name: 'Beauté', icon: 'sparkles-outline' },
  { id: 'autre', name: 'Autre', icon: 'ellipsis-horizontal-outline' },
];

export default function ProOnboarding() {
  const router = useRouter();
  const { createBusiness } = useBusiness();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    phone: '',
    email: '',
  });

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer le nom de votre établissement');
      return;
    }
    if (step === 2 && !formData.category) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      router.back();
    } else {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setLoading(true);

    const { error } = await createBusiness({
      name: formData.name.trim(),
      category: formData.category as any,
      phone: formData.phone.trim() || undefined,
      email: formData.email.trim() || undefined,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Erreur', error.message);
    } else {
      router.replace('/(pro)');
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress */}
      <View style={styles.progress}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>Étape {step}/3</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Step 1: Business Name */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIcon}>
                <Ionicons name="storefront-outline" size={32} color="#6366f1" />
              </View>
              <Text style={styles.stepTitle}>Comment s'appelle votre établissement ?</Text>
              <Text style={styles.stepSubtitle}>
                C'est le nom qui apparaîtra à vos clients
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ex: Salon Marie, Studio Nails..."
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                autoFocus
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        )}

        {/* Step 2: Category */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIcon}>
                <Ionicons name="grid-outline" size={32} color="#6366f1" />
              </View>
              <Text style={styles.stepTitle}>Quelle est votre activité ?</Text>
              <Text style={styles.stepSubtitle}>
                Cela aide les clients à vous trouver
              </Text>
            </View>

            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryCard,
                    formData.category === category.id && styles.categoryCardActive,
                  ]}
                  onPress={() => setFormData({ ...formData, category: category.id })}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={28}
                    color={formData.category === category.id ? '#ffffff' : '#6366f1'}
                  />
                  <Text
                    style={[
                      styles.categoryName,
                      formData.category === category.id && styles.categoryNameActive,
                    ]}
                  >
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Contact Info */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <View style={styles.stepHeader}>
              <View style={styles.stepIcon}>
                <Ionicons name="call-outline" size={32} color="#6366f1" />
              </View>
              <Text style={styles.stepTitle}>Comment vous contacter ?</Text>
              <Text style={styles.stepSubtitle}>
                Ces informations seront visibles par vos clients (optionnel)
              </Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Ex: 87 12 34 56"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email professionnel</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9ca3af" style={styles.inputIcon} />
                <TextInput
                  style={styles.inputWithIcon}
                  placeholder="Ex: contact@monsalon.pf"
                  value={formData.email}
                  onChangeText={(text) => setFormData({ ...formData, email: text })}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color="#6b7280" />
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>

        {step < 3 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Continuer</Text>
            <Ionicons name="arrow-forward" size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextButton, loading && styles.nextButtonDisabled]}
            onPress={handleFinish}
            disabled={loading}
          >
            <Text style={styles.nextButtonText}>
              {loading ? 'Création...' : 'Créer mon établissement'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  progress: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  stepContent: {
    flex: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 18,
    color: '#1f2937',
    textAlign: 'center',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  categoryCard: {
    width: '45%',
    aspectRatio: 1.5,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 8,
  },
  categoryNameActive: {
    color: '#ffffff',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: 8,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
