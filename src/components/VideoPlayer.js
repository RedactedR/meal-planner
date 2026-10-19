import { Linking, Modal, Platform, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useStyles } from '../theme';

// Plays a YouTube video (or shows YouTube search results for a technique)
// inside the app. Browser previews can't show in-app web views, so they
// open YouTube in a new tab instead.
export function openVideo(url, setPlaying) {
  if (Platform.OS === 'web') {
    Linking.openURL(url.replace('/embed/', '/watch?v=').replace('?playsinline=1&rel=0', ''));
  } else {
    setPlaying(url);
  }
}

export default function VideoPlayer({ url, title, onClose }) {
  const styles = useStyles(makeStyles);
  return (
    <Modal visible={!!url} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {title || 'Video'}
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.close}>Done</Text>
          </Pressable>
        </View>
        {url && Platform.OS !== 'web' && (
          <WebView
            source={{ uri: url }}
            style={{ flex: 1 }}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        )}
      </SafeAreaView>
    </Modal>
  );
}

const makeStyles = (c) => ({
  safe: { flex: 1, backgroundColor: c.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  title: { flex: 1, fontSize: 17, fontWeight: '700', color: c.text },
  close: { fontSize: 16, color: c.primary, fontWeight: '700' },
});
