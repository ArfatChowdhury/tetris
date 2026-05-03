import { Paint } from '@shopify/react-native-skia';

export interface SkinDefinition {
  name: string;
  background: React.FC;
  blockPaint: (row: number, col: number) => Paint;
  hudStyle: Record<string, any>;
}
