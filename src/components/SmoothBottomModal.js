import React, { useEffect, useRef, useImperativeHandle, useCallback, forwardRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

/**
 * Bottom sheet: slides up from the bottom with a dimmed backdrop. Use a ref and call
 * requestClose() to animate it closed; when the animation ends, onClose runs and the parent
 * should set visible to false. Good for time picker, filters, or any short form.
 */
const SmoothBottomModal = forwardRef(function SmoothBottomModal(
  { visible, onClose, children, contentContainerStyle },
  ref
) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardTranslateY = useRef(new Animated.Value(screenHeight)).current;

  const requestClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cardTranslateY, {
        toValue: screenHeight,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  }, [onClose, backdropOpacity, cardTranslateY]);

  useImperativeHandle(ref, () => ({ requestClose }), [requestClose]);

  useEffect(() => {
    if (visible) {
      backdropOpacity.setValue(0);
      cardTranslateY.setValue(screenHeight);
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(cardTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 68,
          friction: 12,
        }),
      ]).start();
    }
  }, [visible, backdropOpacity, cardTranslateY]);

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={requestClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: backdropOpacity }]}
          pointerEvents="box-none"
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={requestClose} />
        </Animated.View>
        <Animated.View
          style={[
            styles.card,
            contentContainerStyle,
            { transform: [{ translateY: cardTranslateY }] },
          ]}
        >
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  card: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    maxHeight: '90%',
  },
});

export default SmoothBottomModal;
