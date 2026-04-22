import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { GameScreen } from './src/screens/GameScreen';
import { SkinShopScreen } from './src/screens/SkinShopScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';

type Screen = 'home' | 'game' | 'shop' | 'gameover';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('home');
  const [lastStats, setLastStats] = useState<any>(null);

  const navigateTo = useCallback((screen: Screen) => {
    setCurrentScreen(screen);
  }, []);

  const handleGameOver = useCallback((stats: any) => {
    setLastStats(stats);
    setCurrentScreen('gameover');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onPlay={() => navigateTo('game')}
            onOpenShop={() => navigateTo('shop')}
          />
        );
      case 'game':
        return (
          <GameScreen
            onBack={() => navigateTo('home')}
            onGameOver={handleGameOver}
          />
        );
      case 'shop':
        return (
          <SkinShopScreen
            onBack={() => navigateTo('home')}
          />
        );
      case 'gameover':
        return (
          <GameOverScreen
            stats={lastStats}
            onRestart={() => navigateTo('game')}
            onExit={() => navigateTo('home')}
          />
        );
      default:
        return <HomeScreen onPlay={() => navigateTo('game')} onOpenShop={() => navigateTo('shop')} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {renderScreen()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default App;
