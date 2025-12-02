// state.js

export const state = {
    currentUser: null,
    globalOrderStatus: 'idle',
    driverStatus: 'offline',
    currentOfferIdForConfirmation: null,
    
    // Статуси оплати
    userHasLinkedCard: false,
    driverAcceptsOnlinePayment: false,

    // Кеш даних
    orderData: {},
    active_trips: [],
    notifications_database: [],
    vh_requests_database: [],
    vh_offers_database: [],
    driver_archive: [],
    passenger_archive: [],
    drivers_database: [],
    passengers_database: [],
    orders_database: [],
    custom_trips_database: [],
    active_trips_database: []
};

// Тимчасовий юзер телеграм (до логіну)
export let tempTelegramUser = null;

export function setTempTelegramUser(user) {
    tempTelegramUser = user;
}
