// ===============================
// INPUT COMPONENT - PRESUPUESTOS APP
// ===============================

import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// Theme
import { useTheme } from '../../context/ThemeContext';

// ===============================
// TYPES
// ===============================

type InputVariant = 'default' | 'outline' | 'filled';
type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
  size?: InputSize;
  disabled?: boolean;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  style?: ViewStyle | TextStyle;
}

// ===============================
// INPUT COMPONENT
// ===============================

const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  variant = 'outline',
  size = 'md',
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  value,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const { colors } = useTheme();

  // ===============================
  // STATE
  // ===============================

  const [isFocused, setIsFocused] = useState(false);

  // ===============================
  // HANDLERS
  // ===============================

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleRightIconPress = () => {
    if (onRightIconPress && !disabled) {
      onRightIconPress();
    }
  };

  // ===============================
  // STYLES
  // ===============================

  const getContainerStyles = (): ViewStyle => {
    return {
      marginBottom: LAYOUT.SPACING.SM,
    };
  };

  const getLabelStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      marginBottom: LAYOUT.SPACING.XS,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
      color: colors.text,
    };

    const sizeStyles: Record<InputSize, TextStyle> = {
      sm: { fontSize: TYPOGRAPHY.FONT_SIZE.SM },
      md: { fontSize: TYPOGRAPHY.FONT_SIZE.MD },
      lg: { fontSize: TYPOGRAPHY.FONT_SIZE.LG },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
    };
  };

  const getInputContainerStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: LAYOUT.BORDER_RADIUS.MD,
      borderWidth: 1,
    };

    // Size styles
    const sizeStyles: Record<InputSize, ViewStyle> = {
      sm: {
        paddingHorizontal: LAYOUT.SPACING.MD,
        paddingVertical: LAYOUT.SPACING.SM,
        minHeight: 36,
      },
      md: {
        paddingHorizontal: LAYOUT.SPACING.MD,
        paddingVertical: LAYOUT.SPACING.MD,
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: LAYOUT.SPACING.LG,
        paddingVertical: LAYOUT.SPACING.LG,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<InputVariant, ViewStyle> = {
      default: {
        backgroundColor: colors.background,
        borderColor: colors.border,
      },
      outline: {
        backgroundColor: colors.background,
        borderColor: isFocused ? colors.primary : colors.border,
      },
      filled: {
        backgroundColor: colors.backgroundSecondary,
        borderColor: isFocused ? colors.primary : 'transparent',
      },
    };

    // Error styles
    const errorStyles: ViewStyle = error ? {
      borderColor: colors.error,
    } : {};

    // Disabled styles
    const disabledStyle: ViewStyle = disabled ? {
      backgroundColor: colors.backgroundSecondary,
      opacity: 0.6,
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...errorStyles,
      ...disabledStyle,
    };
  };

  const getInputStyles = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: colors.text,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.REGULAR,
    };

    const sizeStyles: Record<InputSize, TextStyle> = {
      sm: { fontSize: TYPOGRAPHY.FONT_SIZE.SM },
      md: { fontSize: TYPOGRAPHY.FONT_SIZE.MD },
      lg: { fontSize: TYPOGRAPHY.FONT_SIZE.LG },
    };

    const disabledStyle: TextStyle = disabled ? {
      color: colors.textDisabled,
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...disabledStyle,
    };
  };

  const getMessageStyles = (): TextStyle => {
    return {
      marginTop: LAYOUT.SPACING.XS,
      fontSize: TYPOGRAPHY.FONT_SIZE.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.REGULAR,
    };
  };

  const getErrorStyles = (): TextStyle => {
    return {
      ...getMessageStyles(),
      color: colors.error,
    };
  };

  const getHelperStyles = (): TextStyle => {
    return {
      ...getMessageStyles(),
      color: colors.textSecondary,
    };
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <View style={[getContainerStyles(), containerStyle]}>
      {/* Label */}
      {label && (
        <Text style={[getLabelStyles(), labelStyle]}>
          {label}
          {required && (
            <Text style={{ color: colors.error }}> *</Text>
          )}
        </Text>
      )}

      {/* Input Container */}
      <View style={getInputContainerStyles()}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={{ marginRight: LAYOUT.SPACING.SM }}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          style={[getInputStyles(), inputStyle]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <TouchableOpacity
            onPress={handleRightIconPress}
            disabled={disabled || !onRightIconPress}
            style={{ marginLeft: LAYOUT.SPACING.SM }}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[getErrorStyles(), errorStyle]}>
          {error}
        </Text>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text style={[getHelperStyles(), helperStyle]}>
          {helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;
