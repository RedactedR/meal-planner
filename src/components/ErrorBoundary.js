import { Component } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

// If any screen hits a bug, show what went wrong instead of closing the
// app, so it can be screenshotted and fixed.
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: '#141311', padding: 24, paddingTop: 64 }}>
        <Text style={{ color: '#F2EDE6', fontSize: 22, fontWeight: '800' }}>Something went wrong</Text>
        <Text style={{ color: '#9C948A', fontSize: 15, marginTop: 8, lineHeight: 21 }}>
          Take a screenshot of this screen and send it to Claude so it can be fixed. Your saved meals and settings are
          safe.
        </Text>
        <ScrollView style={{ marginTop: 16, flex: 1 }}>
          <Text style={{ color: '#F2B8B5', fontSize: 13 }}>{String(error?.message || error)}</Text>
          <Text style={{ color: '#9C948A', fontSize: 11, marginTop: 8 }}>{String(error?.stack || '').slice(0, 1500)}</Text>
        </ScrollView>
        <Pressable
          onPress={() => this.setState({ error: null })}
          style={{ backgroundColor: '#6FC29A', borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginTop: 16 }}
        >
          <Text style={{ color: '#0E1A14', fontWeight: '700', fontSize: 16 }}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}
