import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSimStore } from '../stores/useSimStore';
import { BRAND } from '../lib/theme';
import * as Haptics from 'expo-haptics';

interface FieldConfig {
  key: string;
  label: string;
}

const FIELDS: FieldConfig[] = [
  { key: 'salary', label: 'Yearly Pay' },
  { key: 'savings', label: 'Cash Savings' },
  { key: 'investments', label: 'Retirement & Investments' },
  { key: 'monthlyExpenses', label: 'Monthly Spending' },
  { key: 'debt', label: 'Money You Owe' },
];

function formatCurrency(value: number): string {
  return value.toLocaleString('en-US');
}

const MAX_VALUE = 99_999_999; // Cap inputs at ~$100M to prevent overflow

function parseCurrency(text: string): number {
  const cleaned = text.replace(/[^0-9]/g, '');
  const value = cleaned ? parseInt(cleaned, 10) : 0;
  return Math.min(value, MAX_VALUE);
}

export function ProfileScreen({ navigation }: any) {
  const profile = useSimStore((s) => s.profile);
  const setProfile = useSimStore((s) => s.setProfile);
  const simulate = useSimStore((s) => s.simulate);

  const [values, setValues] = useState<Record<string, number>>({
    salary: profile.salary,
    savings: profile.savings,
    investments: profile.investments,
    monthlyExpenses: profile.monthlyExpenses,
    debt: profile.debt,
  });

  const [editingField, setEditingField] = useState<string | null>(null);

  const updateValue = (key: string, text: string) => {
    setValues((prev) => ({ ...prev, [key]: parseCurrency(text) }));
  };

  const handleSave = () => {
    if (values.salary <= 0) {
      Alert.alert('How much do you earn?', 'We need your yearly pay to calculate your results. Even a rough guess works.');
      return;
    }
    if (values.monthlyExpenses <= 0) {
      Alert.alert('How much do you spend?', 'We need a rough idea of what you spend each month to figure out how long your money lasts.');
      return;
    }
    setProfile({
      salary: values.salary,
      savings: values.savings,
      investments: values.investments,
      monthlyExpenses: values.monthlyExpenses,
      debt: values.debt,
    });
    simulate();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your profile has been updated and your simulation recalculated.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={22} color={BRAND.textSecondary} />
            </Pressable>
          </View>

          <Text style={styles.title}>Your Profile</Text>
          <Text style={styles.subtitle}>
            Update your financial info to keep your simulation accurate.
          </Text>

          {/* Fields */}
          <View style={styles.fieldsContainer}>
            {FIELDS.map((field) => {
              const isEditing = editingField === field.key;
              return (
                <Pressable
                  key={field.key}
                  style={[styles.fieldRow, isEditing && styles.fieldRowActive]}
                  onPress={() => setEditingField(field.key)}
                >
                  <Text style={styles.fieldLabel}>{field.label}</Text>
                  {isEditing ? (
                    <View style={styles.inputWrapper}>
                      <Text style={styles.dollarSign}>$</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={formatCurrency(values[field.key])}
                        onChangeText={(text) => updateValue(field.key, text)}
                        autoFocus
                        selectionColor={BRAND.primary}
                        returnKeyType="done"
                        onSubmitEditing={() => setEditingField(null)}
                        onBlur={() => setEditingField(null)}
                        accessibilityLabel={field.label}
                        accessibilityHint={`Enter your ${field.label.toLowerCase()}`}
                      />
                    </View>
                  ) : (
                    <Text style={styles.fieldValue}>
                      ${formatCurrency(values[field.key])}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.spacer} />

          {/* Save Button */}
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
            ]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.bg,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: BRAND.text,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: BRAND.textMuted,
    fontSize: 15,
    marginBottom: 32,
    lineHeight: 21,
  },
  fieldsContainer: {
    gap: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: BRAND.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    paddingHorizontal: 16,
    height: 60,
  },
  fieldRowActive: {
    borderColor: BRAND.primary,
  },
  fieldLabel: {
    color: BRAND.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  fieldValue: {
    color: BRAND.text,
    fontSize: 20,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dollarSign: {
    color: BRAND.textSecondary,
    fontSize: 20,
    fontWeight: '600',
    marginRight: 2,
  },
  input: {
    color: BRAND.text,
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'right',
    minWidth: 80,
    paddingVertical: 0,
    fontVariant: ['tabular-nums'],
  },
  spacer: {
    flex: 1,
    minHeight: 32,
  },
  saveButton: {
    backgroundColor: BRAND.primary,
    borderRadius: 14,
    height: 56,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonPressed: {
    backgroundColor: '#0b8ec7',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
