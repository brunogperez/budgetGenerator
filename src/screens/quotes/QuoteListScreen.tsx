// ===============================
// QUOTE LIST SCREEN - PRESUPUESTOS APP
// ===============================

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';

// Components
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';

// Context
import { useAuth } from '../../context/AuthContext';

// Services
import * as quoteService from '../../services/quoteService';

// Types
import { Quote, QuoteStackParamList } from '../../types';

// Constants
import { COLORS, LAYOUT, TYPOGRAPHY } from '../../constants/config';

// ===============================
// TYPES
// ===============================

type QuoteListScreenProps = StackScreenProps<QuoteStackParamList, 'QuoteList'>;

// ===============================
// QUOTE LIST SCREEN
// ===============================

const QuoteListScreen: React.FC<QuoteListScreenProps> = ({ navigation }) => {
  // ===============================
  // HOOKS
  // ===============================

  const { user } = useAuth();

  // ===============================
  // STATE
  // ===============================

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);

  // ===============================
  // EFFECTS
  // ===============================

  useEffect(() => {
    loadQuotes();
  }, []);

  useEffect(() => {
    filterQuotes();
  }, [quotes, searchQuery]);

  // ===============================
  // HANDLERS
  // ===============================

  const loadQuotes = async () => {
    try {
      setError('');
      const response = await quoteService.getQuotes({
        page: 1,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setQuotes(response.quotes);
    } catch (err: any) {
      setError(err.message || 'Error cargando presupuestos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadQuotes();
    setIsRefreshing(false);
  }, []);

  const filterQuotes = () => {
    if (!searchQuery.trim()) {
      setFilteredQuotes(quotes);
      return;
    }

    const filtered = quoteService.filterQuotes(quotes, {
      search: searchQuery.trim(),
    });
    setFilteredQuotes(filtered);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleQuotePress = (quote: Quote) => {
    navigation.navigate('QuoteDetail', { quoteId: quote.id });
  };

  const handleCreateQuote = () => {
    navigation.navigate('CreateQuote');
  };

  const handlePayQuote = (quote: Quote) => {
    // Navigate to payment creation
    navigation.navigate('PaymentQR', { paymentId: quote.paymentId || '' });
  };

  const canManageQuotes = user?.role === 'admin' || user?.role === 'seller';

  // ===============================
  // RENDER FUNCTIONS
  // ===============================

  const renderQuoteCard = ({ item }: { item: Quote }) => {
    const statusInfo = quoteService.formatQuoteStatus(item.status);
    const timeInfo = quoteService.getTimeUntilExpiration(item);
    const isExpiringSoon = timeInfo.urgency === 'high' && !timeInfo.expired;

    return (
      <Card
        variant="outlined"
        padding="md"
        onPress={() => handleQuotePress(item)}
        style={{
          marginBottom: LAYOUT.SPACING.MD,
          borderLeftWidth: 4,
          borderLeftColor: statusInfo.color,
        }}
      >
        <View style={{ marginBottom: LAYOUT.SPACING.SM }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: LAYOUT.SPACING.XS,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.LG,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
              color: COLORS.text,
              flex: 1,
            }}>
              {item.quoteNumber}
            </Text>

            <View style={{
              backgroundColor: statusInfo.color + '20',
              paddingHorizontal: LAYOUT.SPACING.SM,
              paddingVertical: LAYOUT.SPACING.XS,
              borderRadius: LAYOUT.BORDER_RADIUS.SM,
            }}>
              <Text style={{
                fontSize: TYPOGRAPHY.FONT_SIZE.XS,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
                color: statusInfo.color,
              }}>
                {statusInfo.label}
              </Text>
            </View>
          </View>

          <Text style={{
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
            color: COLORS.text,
            marginBottom: LAYOUT.SPACING.XS,
          }}>
            {item.customer.name}
          </Text>

          {item.customer.email && (
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
              marginBottom: LAYOUT.SPACING.SM,
            }}>
              {item.customer.email}
            </Text>
          )}
        </View>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: LAYOUT.SPACING.SM,
        }}>
          <View>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              Total
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XL,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.primary,
            }}>
              ${item.total.toLocaleString('es-AR')}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XS,
              color: COLORS.textSecondary,
            }}>
              {item.items.length} producto{item.items.length !== 1 ? 's' : ''}
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.XS,
              color: COLORS.textTertiary,
            }}>
              {new Date(item.createdAt).toLocaleDateString('es-AR')}
            </Text>
          </View>
        </View>

        {/* Expiration Warning */}
        {isExpiringSoon && (
          <View style={{
            backgroundColor: COLORS.warningLight + '20',
            padding: LAYOUT.SPACING.SM,
            borderRadius: LAYOUT.BORDER_RADIUS.SM,
            marginBottom: LAYOUT.SPACING.SM,
            borderWidth: 1,
            borderColor: COLORS.warning,
          }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.warning,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              textAlign: 'center',
            }}>
              ⏰ Expira en {timeInfo.timeLeft}
            </Text>
          </View>
        )}

        {/* Actions */}
        {item.status === 'pending' && canManageQuotes && (
          <View style={{
            flexDirection: 'row',
            gap: LAYOUT.SPACING.SM,
            marginTop: LAYOUT.SPACING.SM,
          }}>
            <TouchableOpacity
              onPress={() => handlePayQuote(item)}
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                paddingVertical: LAYOUT.SPACING.SM,
                borderRadius: LAYOUT.BORDER_RADIUS.MD,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: COLORS.background,
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                💳 Generar Pago
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleQuotePress(item)}
              style={{
                paddingHorizontal: LAYOUT.SPACING.MD,
                paddingVertical: LAYOUT.SPACING.SM,
                borderRadius: LAYOUT.BORDER_RADIUS.MD,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: COLORS.textSecondary,
                fontSize: TYPOGRAPHY.FONT_SIZE.SM,
                fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
              }}>
                Ver
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: LAYOUT.SPACING.XXL,
    }}>
      <Text style={{ fontSize: 48, marginBottom: LAYOUT.SPACING.MD }}>📋</Text>
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.LG,
        fontWeight: TYPOGRAPHY.FONT_WEIGHT.SEMIBOLD,
        color: COLORS.text,
        marginBottom: LAYOUT.SPACING.SM,
        textAlign: 'center',
      }}>
        {searchQuery ? 'No se encontraron presupuestos' : 'No hay presupuestos'}
      </Text>
      <Text style={{
        fontSize: TYPOGRAPHY.FONT_SIZE.MD,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: LAYOUT.SPACING.LG,
        paddingHorizontal: LAYOUT.SPACING.LG,
      }}>
        {searchQuery
          ? 'Intenta con otros términos de búsqueda'
          : 'Crea tu primer presupuesto para comenzar'
        }
      </Text>

      {!searchQuery && canManageQuotes && (
        <TouchableOpacity
          onPress={handleCreateQuote}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: LAYOUT.SPACING.LG,
            paddingVertical: LAYOUT.SPACING.MD,
            borderRadius: LAYOUT.BORDER_RADIUS.MD,
          }}
        >
          <Text style={{
            color: COLORS.background,
            fontSize: TYPOGRAPHY.FONT_SIZE.MD,
            fontWeight: TYPOGRAPHY.FONT_WEIGHT.MEDIUM,
          }}>
            Crear primer presupuesto
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // ===============================
  // LOADING STATE
  // ===============================

  if (isLoading) {
    return <Loading message="Cargando presupuestos..." />;
  }

  // ===============================
  // RENDER
  // ===============================

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Search Header */}
      <View style={{
        paddingHorizontal: LAYOUT.SPACING.LG,
        paddingVertical: LAYOUT.SPACING.MD,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
      }}>
        <Input
          placeholder="Buscar presupuestos..."
          value={searchQuery}
          onChangeText={handleSearchChange}
          leftIcon={
            <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
              🔍
            </Text>
          }
          rightIcon={searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ fontSize: 16, color: COLORS.textSecondary }}>
                ✕
              </Text>
            </TouchableOpacity>
          ) : undefined}
          onRightIconPress={searchQuery ? () => setSearchQuery('') : undefined}
        />
      </View>

      {/* Stats Summary */}
      {!searchQuery && quotes.length > 0 && (
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: LAYOUT.SPACING.LG,
          paddingVertical: LAYOUT.SPACING.MD,
          backgroundColor: COLORS.backgroundSecondary,
          gap: LAYOUT.SPACING.MD,
        }}>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              Total
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.text,
            }}>
              {quotes.length}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              Pendientes
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.warning,
            }}>
              {quotes.filter(q => q.status === 'pending').length}
            </Text>
          </View>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.SM,
              color: COLORS.textSecondary,
            }}>
              Pagados
            </Text>
            <Text style={{
              fontSize: TYPOGRAPHY.FONT_SIZE.MD,
              fontWeight: TYPOGRAPHY.FONT_WEIGHT.BOLD,
              color: COLORS.success,
            }}>
              {quotes.filter(q => q.status === 'paid').length}
            </Text>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          variant="banner"
          onRetry={loadQuotes}
        />
      )}

      {/* Quotes List */}
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={renderQuoteCard}
        contentContainerStyle={{
          padding: LAYOUT.SPACING.LG,
          flexGrow: 1,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default QuoteListScreen;