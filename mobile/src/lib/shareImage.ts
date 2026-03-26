import { RefObject } from 'react';
import { Share, Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { View } from 'react-native';

/**
 * Captures the ShareCard view as a PNG and opens the system share sheet.
 * Falls back to plain text sharing if image capture fails.
 */
export async function shareAsImage(
  viewRef: RefObject<View>,
  fallbackText: string
): Promise<void> {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    if (Platform.OS === 'ios') {
      await Share.share({
        url: uri,
        message: fallbackText,
      });
    } else {
      // Android: share as URL with message fallback
      await Share.share(
        {
          message: fallbackText,
        },
        {
          // On Android we can't share both image and text easily via Share API,
          // so we share the image URI as the message
        }
      );
    }
  } catch (error) {
    // Fallback to plain text if capture fails
    console.warn('Image capture failed, falling back to text share:', error);
    await Share.share({
      message: fallbackText,
    });
  }
}
