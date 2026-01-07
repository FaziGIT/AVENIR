import { z } from 'zod';

export const OrderSideEnum = z.enum(['BID', 'ASK']);
export const OrderBookTypeEnum = z.enum(['MARKET', 'LIMIT', 'STOP']);
export const OrderBookStateEnum = z.enum(['PENDING', 'PARTIAL', 'FILLED', 'CANCELLED', 'REJECTED']);

const PERIOD_ENUM = z.enum(['day', 'week', 'month', 'year']);
const LIMIT_VALIDATION_MESSAGE = 'La limite doit être entre 1 et 100';

const STOCK_ID_VALIDATION = z.string().min(1, 'ID de stock invalide');
const ORDER_ID_VALIDATION = z.string().min(1, 'ID d\'ordre invalide');
const QUANTITY_VALIDATION = z
    .number({ message: 'La quantité doit être un nombre' })
    .positive('La quantité doit être supérieure à 0');

export const purchaseStockSchema = z.object({
    stockId: STOCK_ID_VALIDATION,
    quantity: QUANTITY_VALIDATION,
});

export type PurchaseStockInput = z.infer<typeof purchaseStockSchema>;

export const placeOrderSchema = z.object({
    stockId: STOCK_ID_VALIDATION,
    side: OrderSideEnum,
    type: OrderBookTypeEnum,
    quantity: QUANTITY_VALIDATION,
    limitPrice: z
        .number({ message: 'Le prix limite doit être un nombre' })
        .positive('Le prix limite doit être positif')
        .optional(),
}).refine(
    (data) => data.type !== 'LIMIT' || !!data.limitPrice,
    {
        message: 'Le prix limite est requis pour les ordres de type LIMIT',
        path: ['limitPrice'],
    }
);

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export const cancelOrderSchema = z.object({
    orderId: ORDER_ID_VALIDATION,
});

export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const getUserOrdersQuerySchema = z.object({
    stockId: STOCK_ID_VALIDATION.optional(),
    state: OrderBookStateEnum.optional(),
});

export type GetUserOrdersQuery = z.infer<typeof getUserOrdersQuerySchema>;

export const getStockPricesQuerySchema = z.object({
    period: PERIOD_ENUM.optional().default('day'),
});

export type GetStockPricesQuery = z.infer<typeof getStockPricesQuerySchema>;

export const getPortfolioHistoryQuerySchema = z.object({
    period: PERIOD_ENUM.optional().default('week'),
});

export type GetPortfolioHistoryQuery = z.infer<typeof getPortfolioHistoryQuerySchema>;

export const getProfitsBreakdownQuerySchema = z.object({
    period: PERIOD_ENUM.optional().default('week'),
});

export type GetProfitsBreakdownQuery = z.infer<typeof getProfitsBreakdownQuerySchema>;

export const getRecentTradesQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 10))
        .refine((val) => val > 0 && val <= 100, { message: LIMIT_VALIDATION_MESSAGE }),
});

export type GetRecentTradesQuery = z.infer<typeof getRecentTradesQuerySchema>;

export const getStockTradesQuerySchema = z.object({
    limit: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : 50))
        .refine((val) => val > 0 && val <= 100, { message: LIMIT_VALIDATION_MESSAGE }),
});

export type GetStockTradesQuery = z.infer<typeof getStockTradesQuerySchema>;

export const stockIdParamSchema = z.object({
    stockId: STOCK_ID_VALIDATION,
});

export type StockIdParam = z.infer<typeof stockIdParamSchema>;

export const orderIdParamSchema = z.object({
    orderId: ORDER_ID_VALIDATION,
});

export type OrderIdParam = z.infer<typeof orderIdParamSchema>;

export const stockIdAdminParamSchema = z.object({
    id: z.string().min(1, 'ID invalide'),
});

export type StockIdAdminParam = z.infer<typeof stockIdAdminParamSchema>;
