function selectOffer(offerId) {
    const offer = vh_offers_database.find(o => o.id === offerId);
    if (!offer) return;
    const driver = drivers_database.find(d => d.id === offer.driverId);
    if (!driver) return;

    const newNotification = {
        id: Date.now(),
        userId: offer.driverId,
        text: `<strong>Нове замовлення!</strong> Пасажир хоче поїхати з вами за маршрутом <strong>${offer.direction}</strong>.`,
        type: 'new_order',
        isRead: false,
        offerId: offerId
    };
    notifications_database.push(newNotification);

    const notificationBadge = document.getElementById('driver-notification-badge');
    if (notificationBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.classList.remove('hidden');
    }

    alert(`Ваш запит надіслано водію ${driver.name}. Очікуйте на підтвердження.`);
    navigateTo('passenger-home-screen');
}
