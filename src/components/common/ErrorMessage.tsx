// ===============================
// ERROR MESSAGE COMPONENT - PRESUPUESTOS APP
// ===============================

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type ErrorVariant = 'default' | 'banner' | 'inline' | 'card';
type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorMessageProps {
  message: string;
  variant?: ErrorVariant;
  severity?: ErrorSeverity;
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  dismissText?: string;
  showIcon?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  visible?: boolean;
}

// ===============================
// ERROR MESSAGE COMPONENT
// ===============================

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = 'default',
  severity = 'error',
  onRetry,
  onDismiss,
  retryText = 'Reintentar',
  dismissText = 'Cerrar',
  showIcon = true,
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

  const getSeverityColors = () => {
    const colorMap: Record<ErrorSeverity, { bg: string; border: string; text: string; icon: string }> = {
      error: {
        bg: COLORS.errorLight + '20',
        border: COLORS.error,
        text: COLORS.error,
        icon: '❌',
      },
      warning: {
        bg: COLORS.warningLight + '20',
        border: COLORS.warning,
        text: COLORS.warning,
        icon: '⚠️',
      },
      info: {
        bg: COLORS.infoLight + '20',
        border: COLORS.info,
        text: COLORS.info,
        icon: 'ℹ️',
      },
    };
    return colorMap[severity];
  };

  const getContainerStyles = (): ViewStyle => {
    const colors = getSeverityColors();
    const baseStyle: ViewStyle = {
      borderRadius: LAYOUT.BORDER_RADIUS.MD,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.bg,
    };

    const variantStyles: Record<ErrorVariant, ViewStyle> = {
      default: {
        padding: LAYOUT.SPACING.MD,
        margin: LAYOUT.SPACING.MD,
      },
      banner: {
        paddingHorizontal: LAYOUT.SPACING.MD,
        paddingVertical: LAYOUT.SPACING.SM,
        marginHorizontal: 0,
        marginVertical: 0,
        borderRadius: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
      },
      inline: {
        padding: LAYOUT.SPACING.SM,
        margin: 0,
      },
      card: {
        padding: LAYOUT.SPACING.LG,
        margin: LAYOUT.SPACING.MD,
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  const getContentStyles = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'flex-start',
    };
  };

  const getIconStyles = (): ViewStyle => {
    return {
      marginRight: LAYOUT.SPACING.SM,
      marginTop: 2,
    };
  };

  const getTextContainerStyles = (): ViewStyle => {
    return {
      flex: 1,
    };
  };

  const getMessageStyles = (): TextStyle => {
    const colors = getSeverityColors();

    return {
      fontSize: TYPOGRAPHY.FONT_SIZE.MD,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.REGULAR,
      color: colors.text,
      lineHeight: TYPOGRAPHY.LINE_HEIGHT.NORMAL * TYPOGRAPHY.FONT_SIZE.MD,
    };
  };

  const getActionsStyles = (): ViewStyle => {
    return {
      flexDirection: 'row',
      marginTop: LAYOUT.SPACING.MD,
      gap: LAYOUT.SPACING.SM,
    };
  };

  const getActionButtonStyles = (isPrimary = false): ViewStyle => {
    const colors = getSeverityColors();

    return {
      paddingHorizontal: LAYOUT.SPACING.MD,
      paddingVertical: LAYOUT.SPACING.SM,
      borderRadius: LAYOUT.BORDER_RADIUS.SM,
      backgroundColor: isPrimary ? colors.border : 'transparent',
      borderWidth: isPrimary ? 0 : 1,
      borderColor: colors.border,
    };
  };

  const getActionTextStyles = (isPrimary = false): TextStyle => {
    const colors = getSeverityColors();

    return {
      fontSize: TYPOGRAPHY.FONT_SIZE.SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
      color: isPrimary ? COLORS.background : colors.text,
    };
  };

  // ===============================
  // RENDER
  // ===============================

  return (
    <View style={[getContainerStyles(), style]}>
      <View style={getContentStyles()}>
        {/* Icon */}
        {showIcon && (
          <View style={getIconStyles()}>
            <Text style={{ fontSize: 16 }}>
              {getSeverityColors().icon}
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={getTextContainerStyles()}>
          {/* Message */}
          <Text style={[getMessageStyles(), textStyle]}>
            {message}
          </Text>

          {/* Actions */}
          {(onRetry || onDismiss) && (
            <View style={getActionsStyles()}>
              {onRetry && (
                <TouchableOpacity
                  style={getActionButtonStyles(true)}
                  onPress={onRetry}
                  activeOpacity={0.7}
                >
                  <Text style={getActionTextStyles(true)}>
                    {retryText}
                  </Text>
                </TouchableOpacity>
              )}

              {onDismiss && (
                <TouchableOpacity
                  style={getActionButtonStyles(false)}
                  onPress={onDismiss}
                  activeOpacity={0.7}
                >
                  <Text style={getActionTextStyles(false)}>
                    {dismissText}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ===============================
// ERROR MESSAGE VARIANTS
// ===============================

/**
 * Banner de error para la parte superior de la pantalla
 */
export const ErrorBanner: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="banner" />
);

/**
 * Error inline para usar dentro de formularios
 */
export const ErrorInline: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="inline" />
);

/**
 * Card de error con más prominencia
 */
export const ErrorCard: React.FC<Omit<ErrorMessageProps, 'variant'>> = (props) => (
  <ErrorMessage {...props} variant="card" />
);

/**
 * Mensaje de advertencia
 */
export const WarningMessage: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage {...props} severity="warning" />
);

/**
 * Mensaje informativo
 */
export const InfoMessage: React.FC<Omit<ErrorMessageProps, 'severity'>> = (props) => (
  <ErrorMessage {...props} severity="info" />
);

export default ErrorMessage;