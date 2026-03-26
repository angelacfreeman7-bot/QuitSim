import { Alert } from 'react-native';
import { SimResult } from '../types';

/**
 * Shows a "Reality Check" alert when simulation confidence exceeds 80%.
 * Should be called after any simulation completes on a results screen.
 */
export function showRealityCheck(result: SimResult): void {
  if (result.quitConfidence <= 80) return;

  Alert.alert(
    '🔍 Reality Check',
    'Simulations are estimates only. This model does not account for:\n\n' +
      '• Emergency expenses (medical, car, home)\n' +
      '• Job market conditions in your field\n' +
      '• Health insurance costs without employer coverage\n' +
      '• Tax implications of retirement account withdrawals\n' +
      '• Inflation exceeding 3%\n\n' +
      'A high confidence score does NOT mean quitting is safe. ' +
      'Talk to a licensed financial advisor before making any major financial decision.',
    [
      { text: 'I understand', style: 'default' },
    ]
  );
}
