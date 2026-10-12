import { WebView } from 'react-native-webview';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const START_URL = 'https://wxzcrm.uz';

export default function App() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleBackPress = useCallback(() => {
    if (!canGoBack) {
      return false;
    }

    webViewRef.current?.goBack();
    return true;
  }, [canGoBack]);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return undefined;
    }

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress,
    );

    return () => subscription.remove();
  }, [handleBackPress]);

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />

      <WebView
        ref={webViewRef}
        source={{ uri: START_URL }}
        style={styles.webView}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
        cacheEnabled={true}
        incognito={false}
        setSupportMultipleWindows={false}
        startInLoadingState={false}
        onShouldStartLoadWithRequest={(request) => {
          const scheme = request.url.split(':', 1)[0].toLowerCase();
          return scheme === 'http' || scheme === 'https' || scheme === 'about';
        }}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        onNavigationStateChange={(navigationState) => {
          setCanGoBack(navigationState.canGoBack);
        }}
      />

      {isLoading && !hasError && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#1769aa" />
          <Text style={styles.statusText}>Yuklanmoqda...</Text>
        </View>
      )}

      {hasError && (
        <View style={styles.overlay}>
          <Text style={styles.errorTitle}>Sahifani yuklab bo&apos;lmadi</Text>
          <Text style={styles.statusText}>
            Internet aloqasini tekshirib, qayta urinib ko&apos;ring.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={handleRetry}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Qayta urinish</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  webView: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
  },
  statusText: {
    marginTop: 12,
    color: '#555555',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#222222',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    borderRadius: 6,
    backgroundColor: '#1769aa',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});