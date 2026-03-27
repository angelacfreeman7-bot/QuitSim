import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../lib/theme';

interface DisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  /** If true, shows a close button instead of requiring acceptance */
  dismissible?: boolean;
  onDismiss?: () => void;
}

const DISCLAIMER_TEXT = `IMPORTANT DISCLAIMER — PLEASE READ CAREFULLY

QuitSim is an educational financial simulation tool. It is NOT financial advice, and should never be treated as such.

BY USING THIS APP, YOU ACKNOWLEDGE AND AGREE:

1. NOT FINANCIAL ADVICE
QuitSim does not provide personalized financial, tax, legal, or investment advice. All simulations are hypothetical estimates based on simplified models. No simulation can predict actual financial outcomes.

2. SIMPLIFIED MODEL
This simulation makes significant simplifying assumptions including but not limited to:
  - No federal, state, or local income taxes on withdrawals or income
  - No healthcare, dental, or vision insurance costs
  - Inflation estimated at ~3% — actual inflation may be significantly higher
  - No Social Security, pension, or disability considerations
  - Investment returns assume average market conditions with no guarantee of actual returns
  - No modeling of major life events (divorce, disability, lawsuits, natural disasters)

3. CONSULT A PROFESSIONAL
Before making any decision to quit your job, reduce income, or change your financial situation, you should consult with:
  - A licensed financial advisor (CFP or equivalent)
  - A tax professional (CPA or enrolled agent)
  - An attorney if contractual obligations are involved

4. NO LIABILITY
The creators of QuitSim accept no responsibility or liability for any financial decisions made based on simulation results. You use this app entirely at your own risk.

5. ACCURACY NOT GUARANTEED
While we strive for reasonable estimates, QuitSim cannot account for all variables affecting your financial future. Real-world outcomes will differ — potentially significantly — from any simulation.

6. DATA PRIVACY
All calculations run on your device. Your financial data is not transmitted to our servers unless you explicitly use AI-powered features, which is disclosed separately.`;

export function DisclaimerModal({
  visible,
  onAccept,
  dismissible = false,
  onDismiss,
}: DisclaimerModalProps) {
  const BRAND = useTheme();
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isBottom) setScrolledToBottom(true);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={dismissible ? onDismiss : undefined}
    >
      <View style={[styles.container, { backgroundColor: BRAND.bg }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={[styles.title, { color: BRAND.text }]}>Legal Disclaimer</Text>
          {dismissible && (
            <Pressable style={[styles.closeButton, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]} onPress={onDismiss}>
              <Text style={{ color: BRAND.textMuted, fontSize: 16 }}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Scrollable disclaimer text */}
        <ScrollView
          style={[styles.scrollArea, { backgroundColor: BRAND.card, borderColor: BRAND.cardBorder }]}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={100}
        >
          <Text style={[styles.disclaimerText, { color: BRAND.textSecondary }]}>{DISCLAIMER_TEXT}</Text>
        </ScrollView>

        {/* Accept / Close button */}
        {dismissible ? (
          <Pressable style={[styles.acceptButton, { backgroundColor: BRAND.sunset }]} onPress={onDismiss}>
            <Text style={styles.acceptText}>Close</Text>
          </Pressable>
        ) : (
          <>
            {!scrolledToBottom && (
              <Text style={[styles.scrollHint, { color: BRAND.warning }]}>
                Scroll to the bottom to accept
              </Text>
            )}
            <Pressable
              style={[
                styles.acceptButton,
                { backgroundColor: BRAND.sunset },
                !scrolledToBottom && styles.acceptDisabled,
              ]}
              onPress={onAccept}
              disabled={!scrolledToBottom}
            >
              <Text
                style={[
                  styles.acceptText,
                  !scrolledToBottom && { color: BRAND.textMuted },
                ]}
              >
                I Understand and Accept
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: { fontSize: 40, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '800' },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollArea: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  scrollContent: {
    padding: 16,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
  },
  scrollHint: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  acceptButton: {
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptDisabled: {
    backgroundColor: '#E7E5E4',
  },
  acceptText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
