// ===============================
// BUTTON COMPONENT - PRESUPUESTOS APP
// ===============================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

// ===============================
// BUTTON COMPONENT
// ===============================

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  onPress,
  ...props
}) => {
  // ===============================
  // STYLES
  // ===============================

  const getButtonStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: LAYOUT.BORDER_RADIUS.MD,
      borderWidth: 1,
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, ViewStyle> = {
      sm: {
        paddingHorizontal: LAYOUT.SPACING.MD,
        paddingVertical: LAYOUT.SPACING.SM,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: LAYOUT.SPACING.LG,
        paddingVertical: LAYOUT.SPACING.MD,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: LAYOUT.SPACING.XL,
        paddingVertical: LAYOUT.SPACING.LG,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
      },
      secondary: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: COLORS.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: COLORS.error,
        borderColor: COLORS.error,
      },
    };

    // Disabled styles
    const disabledStyle: ViewStyle = disabled || loading ? {
      opacity: 0.6,
    } : {};

    // Full width styles
    const fullWidthStyle: ViewStyle = fullWidth ? {
      width: '100%',
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...fullWidthStyle,
    };
  };

  const getTextStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
      textAlign: 'center',
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, TextStyle> = {
      sm: {
        fontSize: TYPOGRAPHY.FONT_SIZE.SM,
      },
      md: {
        fontSize: TYPOGRAPHY.FONT_SIZE.MD,
      },
      lg: {
        fontSize: TYPOGRAPHY.FONT_SIZE.LG,
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, TextStyle> = {
      primary: {
        color: COLORS.background,
      },
      secondary: {
        color: COLORS.background,
      },
      outline: {
        color: COLORS.primary,
      },
      ghost: {
        color: COLORS.primary,
      },
      danger: {
        color: COLORS.background,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  // ===============================
  // HANDLERS
  // ===============================

  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <TouchableOpacity
      style={[getButtonStyles(), style]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {/* Left Icon */}
      {leftIcon && !loading && (
        <>{leftIcon}</>
      )}

      {/* Loading Indicator */}
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : COLORS.background}
          style={{ marginRight: leftIcon || rightIcon ? LAYOUT.SPACING.SM : 0 }}
        />
      )}

      {/* Title */}
      <Text style={[getTextStyles(), textStyle]}>
        {loading ? 'Cargando...' : title}
      </Text>

      {/* Right Icon */}
      {rightIcon && !loading && (
        <>{rightIcon}</>
      )}
    </TouchableOpacity>
  );
};

export default Button;