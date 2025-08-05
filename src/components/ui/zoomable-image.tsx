import React from 'react';
import { View, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import R2Image from './r2-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ZoomableImageProps {
  url: string;
  style?: any;
  fallback?: React.ReactNode;
  maxZoom?: number;
  minZoom?: number;
}

export default function ZoomableImage({ 
  url, 
  style, 
  fallback, 
  maxZoom = 3, 
  minZoom = 1 
}: ZoomableImageProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      scale.value = Math.min(Math.max(newScale, minZoom), maxZoom);
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      
      // Reset if zoomed out too much
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        const maxTranslateX = (screenWidth * (scale.value - 1)) / 2;
        const maxTranslateY = (screenWidth * (scale.value - 1)) / 2; // Using screenWidth for square image
        
        translateX.value = Math.min(
          Math.max(savedTranslateX.value + event.translationX, -maxTranslateX),
          maxTranslateX
        );
        translateY.value = Math.min(
          Math.max(savedTranslateY.value + event.translationY, -maxTranslateY),
          maxTranslateY
        );
      }
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      if (scale.value > 1) {
        // Reset zoom
        scale.value = withSpring(1);
        savedScale.value = 1;
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        savedTranslateX.value = 0;
        savedTranslateY.value = 0;
      } else {
        // Zoom in to 2x at tap location
        const newScale = 2;
        scale.value = withSpring(newScale);
        savedScale.value = newScale;
        
        // Calculate translation to center on tap point
        const tapX = event.x - screenWidth / 2;
        const tapY = event.y - screenWidth / 2; // Using screenWidth for square image
        
        translateX.value = withSpring(-tapX * (newScale - 1) / newScale);
        translateY.value = withSpring(-tapY * (newScale - 1) / newScale);
        savedTranslateX.value = -tapX * (newScale - 1) / newScale;
        savedTranslateY.value = -tapY * (newScale - 1) / newScale;
      }
    });

  const composedGesture = Gesture.Simultaneous(
    Gesture.Race(doubleTapGesture, pinchGesture),
    panGesture
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[animatedStyle]}>
          <R2Image
            url={url}
            style={{ width: '100%', height: '100%' }}
            fallback={fallback}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}