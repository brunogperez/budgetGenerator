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
import { LAYOUT } from '../../constants/config';

// Theme
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();

  // ===============================
  // STYLES
  // ===============================

  const getCardStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: LAYOUT.BORDER_RADIUS.LG,
      backgroundColor: colors.surface,
    };

    // Variant styles
    const variantStyles: Record<CardVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.surface,
      },
      elevated: {
        backgroundColor: colors.surface,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 1.75,
        elevation: 4,
      },
      outlined: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.backgroundSecondary,
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
