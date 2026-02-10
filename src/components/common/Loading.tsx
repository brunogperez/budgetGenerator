// ===============================
// LOADING COMPONENT - PRESUPUESTOS APP
// ===============================

import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type LoadingSize = 'small' | 'medium' | 'large';
type LoadingVariant = 'default' | 'overlay' | 'inline';

interface LoadingProps {
  size?: LoadingSize;
  variant?: LoadingVariant;
  message?: string;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  visible?: boolean;
}

// ===============================
// LOADING COMPONENT
// ===============================

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  variant = 'default',
  message,
  color,
  style,
  textStyle,
  visible = true,
}) => {
  // ===============================
  // EARLY RETURN
  // ===============================

  if (!visible) {
    return null;
  }

  // ===============================
  // STYLES
  // ===============================

  const getContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
    };

    const variantStyles: Record<LoadingVariant, ViewStyle> = {
      default: {
        flex: 1,
        backgroundColor: COLORS.background,
      },
      overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: COLORS.overlay,
        zIndex: 9999,
      },
      inline: {
        padding: LAYOUT.SPACING.LG,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getLoadingContentStyles = (): ViewStyle => {
    return {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: variant === 'overlay' ? COLORS.surface : 'transparent',
      borderRadius: variant === 'overlay' ? LAYOUT.BORDER_RADIUS.LG : 0,
      padding: variant === 'overlay' ? LAYOUT.SPACING.XL : 0,
      minWidth: variant === 'overlay' ? 120 : undefined,
      shadowColor: variant === 'overlay' ? COLORS.text : undefined,
      shadowOffset: variant === 'overlay' ? { width: 0, height: 2 } : undefined,
      shadowOpacity: variant === 'overlay' ? 0.1 : undefined,
      shadowRadius: variant === 'overlay' ? 8 : undefined,
      elevation: variant === 'overlay' ? 4 : undefined,
    };
  };

  const getIndicatorSize = (): 'small' | 'large' => {
    const sizeMap: Record<LoadingSize, 'small' | 'large'> = {
      small: 'small',
      medium: 'large',
      large: 'large',
    };
    return sizeMap[size];
  };

  const getIndicatorColor = (): string => {
    if (color) return color;
    return variant === 'overlay' ? COLORS.primary : COLORS.primary;
  };

  const getMessageStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      marginTop: LAYOUT.SPACING.MD,
      textAlign: 'center',
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
      color: variant === 'overlay' ? COLORS.text : COLORS.text,
    };

    const sizeStyles: Record<LoadingSize, TextStyle> = {
      small: { fontSize: TYPOGRAPHY.FONT_SIZE.SM },
      medium: { fontSize: TYPOGRAPHY.FONT_SIZE.MD },
      large: { fontSize: TYPOGRAPHY.FONT_SIZE.LG },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <View style={[getContainerStyles(), style]}>
      <View style={getLoadingContentStyles()}>
        <ActivityIndicator
          size={getIndicatorSize()}
          color={getIndicatorColor()}
        />

        {message && (
          <Text style={[getMessageStyles(), textStyle]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );
};

// ===============================
// LOADING VARIANTS
// ===============================

/**
 * Loading overlay para cubrir toda la pantalla
 */
export const LoadingOverlay: React.FC<Omit<LoadingProps, 'variant'>> = (props) => (
  <Loading {...props} variant="overlay" />
);

/**
 * Loading inline para usar dentro de componentes
 */
export const LoadingInline: React.FC<Omit<LoadingProps, 'variant'>> = (props) => (
  <Loading {...props} variant="inline" />
);

/**
 * Loading pequeño para botones
 */
export const LoadingButton: React.FC<Omit<LoadingProps, 'size' | 'variant'>> = (props) => (
  <Loading {...props} size="small" variant="inline" />
);

export default Loading;