import React, { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../lib/theme';

interface InfoTipProps {
  text: string;
}

export function InfoTip({ text }: InfoTipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        style={styles.button}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="More info"
        accessibilityHint="Shows an explanation"
      >
        <Ionicons name="help-circle" size={18} color={BRAND.primary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setVisible(false)}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <View style={styles.card} accessibilityRole="alert">
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color={BRAND.primary} />
              <Text style={styles.cardTitle}>What does this mean?</Text>
            </View>
            <Text style={styles.cardText}>{text}</Text>
            <Text style={styles.tapHint}>Tap anywhere to close</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 2,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    borderRadius: 16,
    padding: 20,
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    color: BRAND.text,
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    color: BRAND.textSecondary,
    fontSize: 15,
    lineHeight: 23,
  },
  tapHint: {
    color: BRAND.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
  },
});
