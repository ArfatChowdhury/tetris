import { Skia, Image, TileMode } from '@shopify/react-native-skia';
import { Dimensions } from 'react-native';

export const screen = Dimensions.get('window');
export const canvasSize = { width: screen.width, height: screen.height };

export const createRepeatingShader = (img: Image, scale = 1) => {
  const { width, height } = img;
  const matrix = Skia.Matrix();
  matrix.scale(scale, scale);
  // Optional: translate to center or align differently
  // matrix.translate(-width / 2, -height / 2); 
  return img.makeShader(TileMode.Repeat, TileMode.Repeat, undefined, matrix);
};
