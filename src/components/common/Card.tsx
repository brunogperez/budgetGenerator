// ===============================
// CARD COMPONENT - PRESUPUESTOS APP
// ===============================

import React from 'react';
import {
  View,
  TouchableOpacity,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';

// Constants
import { COLORS, LAYOUT } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled';
type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends Omit<TouchableOpacityProps, 'style'> {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

// ===============================
// CARD COMPONENT
// ===============================

const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  disabled = false,
  style,
  ...props
}) => {
  // ===============================
  // STYLES
  // ===============================

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: LAYOUT.BORDER_RADIUS.LG,
      backgroundColor: COLORS.surface,
    };

    // Variant styles
    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: COLORS.surface,
      },
      elevated: {
        backgroundColor: COLORS.surface,
        shadowColor: COLORS.text,
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
      },
      filled: {
        backgroundColor: COLORS.backgroundSecondary,
      },
    };

    // Padding styles
    const paddingStyles: Record<CardPadding, ViewStyle> = {
      none: {},
      sm: { padding: LAYOUT.SPACING.SM },
      md: { padding: LAYOUT.SPACING.MD },
      lg: { padding: LAYOUT.SPACING.LG },
      xl: { padding: LAYOUT.SPACING.XL },
    };

    // Disabled styles
    const disabledStyle: ViewStyle = disabled ? {
      opacity: 0.6,
    } : {};

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...disabledStyle,
    };
  };

  // ===============================
  // HANDLERS
  // ===============================

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress();
    }
  };

  // ===============================
  // RENDER
  // ===============================

  // If onPress is provided, render as TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        style={[getCardStyles(), style]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.8}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  // Otherwise, render as regular View
  return (
    <View style={[getCardStyles(), style]}>
      {children}
    </View>
  );
};

export default Card;