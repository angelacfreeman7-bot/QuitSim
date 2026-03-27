import { Share } from 'react-native';

const APP_STORE_URL = 'https://apps.apple.com/app/quitsim/id6761015566';

/**
 * Opens the system share sheet with a fun challenge message
 * that includes the user's confidence score and an App Store link.
 */
export async function challengeShare(confidenceScore: number): Promise<void> {
  const message = `I'm ${confidenceScore}% ready to quit my job. Think you can beat me? 🏆\n\nFind out your score: ${APP_STORE_URL}`;

  await Share.share({
    message,
    url: APP_STORE_URL, // iOS shows this as a rich link
  });
}
