import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { SkinEngine } from '../components/skins/SkinEngine';
import { useSkinStore } from '../hooks/useSkinStore';

const { width } = Dimensions.get('window');

interface SkinShopScreenProps {
  onBack: () => void;
}

export const SkinShopScreen: React.FC<SkinShopScreenProps> = ({ onBack }) => {
  const { allSkins, ownedSkins, activeSkinId, unlockSkin, applySkin } = useSkinStore();

  const handlePurchase = (skin: any) => {
    if (ownedSkins.includes(skin.id)) {
      applySkin(skin.id);
      return;
    }

    Alert.alert(
      'Purchase Skin',
      `Unlock ${skin.name} for $${(skin.price / 100).toFixed(2)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Buy', 
          onPress: () => {
            unlockSkin(skin.id);
            Alert.alert('Success', `${skin.name} unlocked!`);
          } 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>SKINS SHOP</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {allSkins.map((skin) => {
            const isOwned = ownedSkins.includes(skin.id);
            const isActive = activeSkinId === skin.id;

            return (
              <View key={skin.id} style={styles.card}>
                <View style={styles.previewContainer}>
                  <SkinEngine skinId={skin.id} />
                  <View style={styles.premiumBadge}>
                    <Text style={styles.badgeText}>{skin.price === 0 ? 'FREE' : 'PREMIUM'}</Text>
                  </View>
                </View>
                
                <View style={styles.cardInfo}>
                  <Text style={styles.skinName}>{skin.name}</Text>
                  
                  <TouchableOpacity
                    style={[
                      styles.actionBtn,
                      isOwned ? styles.ownedBtn : styles.buyBtn,
                      isActive && styles.activeBtn
                    ]}
                    onPress={() => handlePurchase(skin)}
                  >
                    <Text style={[styles.actionBtnText, isActive && styles.activeBtnText]}>
                      {isActive ? '✓ ACTIVE' : (isOwned ? 'APPLY' : `BUY $${(skin.price / 100).toFixed(2)}`)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 50,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  card: {
    width: (width - 45) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewContainer: {
    height: 150,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardInfo: {
    padding: 12,
    alignItems: 'center',
  },
  skinName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  actionBtn: {
    width: '100%',
    height: 35,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: '#fff',
  },
  ownedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeBtn: {
    backgroundColor: '#00f0f0',
    borderColor: '#00f0f0',
  },
  actionBtnText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '900',
  },
  activeBtnText: {
    color: '#fff',
  },
});
