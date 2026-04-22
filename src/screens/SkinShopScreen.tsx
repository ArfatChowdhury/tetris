import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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
      <LinearGradient
        colors={['#050510', '#0a0a1a', '#000000']}
        style={StyleSheet.absoluteFillObject}
      />
      
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
              <View key={skin.id} style={[styles.card, isActive && styles.activeCard]}>
                <View style={styles.previewContainer}>
                  {skin.image ? (
                    <Image source={skin.image} style={styles.previewImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.placeholderPreview}>
                      <Text style={styles.placeholderText}>{skin.preview}</Text>
                    </View>
                  )}
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
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(222, 184, 135, 0.2)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backBtnText: {
    color: '#deb887',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
    textShadowColor: '#deb887',
    textShadowRadius: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(222, 184, 135, 0.2)',
  },
  activeCard: {
    borderColor: '#00ffff',
    borderWidth: 2,
    shadowColor: '#00ffff',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  previewContainer: {
    height: 150,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  placeholderText: {
    fontSize: 40,
  },
  premiumBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(222, 184, 135, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  cardInfo: {
    padding: 12,
    alignItems: 'center',
  },
  skinName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 1,
  },
  actionBtn: {
    width: '100%',
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: '#deb887',
  },
  ownedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(222, 184, 135, 0.4)',
  },
  activeBtn: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    borderColor: '#00ffff',
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  activeBtnText: {
    color: '#00ffff',
  },
});
