document.addEventListener('DOMContentLoaded', () => {

let globalOrderStatus = 'searching';
let fakeUserHasCard = false;
let fakeDriverAcceptsCard = false;
let passenger_archive = []; // Архів для пасажира
let driver_archive = [];    // Архів для водія
let orders_database = [];
let currentOfferIdForConfirmation = null;
let driverStatus = 'online'; // Можливі статуси: 'online', 'offline'

// Тимчасова база даних водіїв
const drivers_database = [
    {
        id: 1,
        name: 'Сергій Авдєєв',
        rating: 4.9,
        trips: 152,
        car: 'Skoda Octavia, сірий',
        tags: [
            { icon: 'fa-solid fa-music', text: 'Рок/Альтернатива' },
            { icon: 'fa-solid fa-paw', text: 'Можна з тваринами' },
            { icon: 'fa-solid fa-ban-smoking', text: 'Не палю' }
        ],
        reviews: [
            { name: 'Вікторія', rating: 5.0, text: 'Дуже приємний водій, комфортна поїздка. Дякую!' },
            { name: 'Олексій', rating: 5.0, text: 'Все супер, швидко і безпечно.' },
            { name: 'Марина', rating: 4.0, text: 'В салоні був трохи дивний запах, але в цілому нормально.' }
        ]
    },
    {
        id: 2,
        name: 'Олена Петренко',
        rating: 5.0,
        trips: 211,
        car: 'Renault Megane, білий',
        tags: [
            { icon: 'fa-solid fa-volume-xmark', text: 'Тиша в салоні' },
            { icon: 'fa-solid fa-child', text: 'Є дитяче крісло' }
        ],
        reviews: [
            { name: 'Іван', rating: 5.0, text: 'Найкраща водійка в місті!' }
        ]
    },
    {
        id: 3,
        name: 'Максим Новенький',
        rating: 0, // Рейтинг 0, бо ще немає поїздок
        trips: 3,  // Мало поїздок
        car: 'Daewoo Lanos, зелений',
        tags: [
            { icon: 'fa-solid fa-music', text: 'Поп-музика' }
        ],
        reviews: [] // Відгуків ще немає
    }
];

// Тимчасова база даних для всіх сповіщень
const notifications_database = [];


// Тимчасова база даних пасажирів
const passengers_database = [
    {
        id: 1,
        name: 'Віта Білецька',
        trips: 27,
        bio: 'Валки.',
        reviews: [] // Поки що відгуків немає
    }
];

// Тимчасова база даних запитів на поїздки Валки-Харків
const vh_requests_database = [];
// Тимчасова база даних пропозицій від водіїв на маршруті В-Х
const vh_offers_database = [];

// Тимчасова база даних для активних поїздок
const active_trips_database = [];


    // == 2. ЗБІР ЕЛЕМЕНТІВ DOM ==
    const screens = document.querySelectorAll('.screen');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
// -- Елементи керування поїздкою водія --
    const driverArrivedBtn = document.getElementById('driver-arrived-btn');
    const driverStartTripBtn = document.getElementById('driver-start-trip-btn');
    const driverFinishTripBtn = document.getElementById('driver-finish-trip-btn');
// -- Елементи екрану оцінки --
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const submitRatingBtn = document.getElementById('submit-rating-btn');

    // -- Навігація --
    const showDriverLoginBtn = document.getElementById('show-driver-login');
    const showPassengerLoginBtn = document.getElementById('show-passenger-login');
    const driverTelegramLoginBtn = document.querySelector('#login-screen-driver .btn-telegram-login');
    const passengerTelegramLoginBtn = document.querySelector('#login-screen-passenger .btn-telegram-login');
    
    // -- Елементи пасажира --
    const showMyOrdersBtn = document.getElementById('show-my-orders-btn');
    const findDriverBtn = document.getElementById('find-driver-btn');
    const showQuickOrderBtn = document.getElementById('show-quick-order-btn');
    const showHelpBtn = document.getElementById('show-help-btn');
    const showPassengerValkyKharkivBtn = document.getElementById('show-passenger-valky-kharkiv-btn');
    const showPassengerBusScheduleBtn = document.getElementById('show-passenger-bus-schedule-btn');
    const showPassengerProfileBtn = document.getElementById('show-passenger-profile-btn');
    const showPassengerSupportBtn = document.getElementById('show-passenger-support-btn');
    const showPassengerSettingsBtn = document.getElementById('show-passenger-settings-btn');
    const vhPassengerCreateRequestBtn = document.getElementById('vh-passenger-create-request-btn');

    // -- Елементи водія --
    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const showDriverValkyKharkivBtn = document.getElementById('show-driver-valky-kharkiv-btn');
    const showDriverProfileBtn = document.getElementById('show-driver-profile-btn');
    const showDriverHelpBtn = document.getElementById('show-driver-help-btn');
    const showDriverSupportBtn = document.getElementById('show-driver-support-btn');
    const showDriverSettingsBtn = document.getElementById('show-driver-settings-btn');
    
    // == 3. ОСНОВНІ ФУНКЦІЇ І ЛОГІКА ==
    function showScreen(screenId) {
        screens.forEach(screen => {
            screen.classList.add('hidden');
            screen.classList.remove('active');
        });
        const activeScreen = document.getElementById(screenId);
        if (activeScreen) {
            activeScreen.classList.remove('hidden');
            activeScreen.classList.add('active');
        }
    }

    function navigateTo(screenId) {
        setTimeout(() => showScreen(screenId), 250);
    }
    
    // == ЛОГІКА "ШВИДКЕ ЗАМОВЛЕННЯ" ==
    const quickOrderScreen = document.getElementById('quick-order-screen');
    const quickOrderSummaryCard = document.getElementById('quick-order-summary-card');
    const summaryFrom = document.getElementById('summary-from');
    const summaryTo = document.getElementById('summary-to');
    const summaryTime = document.getElementById('summary-time');
    const summaryFromContainer = document.getElementById('summary-from-container');
    const summaryToContainer = document.getElementById('summary-to-container');
    const summaryTimeContainer = document.getElementById('summary-time-container');
    const addressStep = document.getElementById('address-step');
    const timeStep = document.getElementById('time-step');
    const fromAddressInput = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const addressNextBtn = document.getElementById('address-next-btn');
    const settlementButtons = document.querySelectorAll('.btn-settlement');
    const fromVillageContainer = document.getElementById('from-village-container');
    const toVillageContainer = document.getElementById('to-village-container');
    const fromVillageSelect = document.getElementById('from-village-select');
    const toVillageSelect = document.getElementById('to-village-select');
    const timeChoiceContainer = document.getElementById('time-choice-container');
    const timeChoiceButtons = document.querySelectorAll('[data-time-choice]');
    const timeResultContainer = document.getElementById('time-result-container');
    const timeResultText = document.getElementById('time-result-text');
    const editTimeBtn = document.getElementById('edit-time-btn');
    const pickerInput = document.getElementById('datetime-picker');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    const paymentStep = document.getElementById('payment-step');
    const timeNextBtn = document.getElementById('time-next-btn');
    const paymentCashBtn = document.getElementById('payment-cash-btn');
    const paymentCardBtn = document.getElementById('payment-card-btn');
    let orderData = {};

    function updateSummary() {
        if (orderData.from || orderData.to) { quickOrderSummaryCard.classList.remove('hidden'); }
        if (orderData.from) { summaryFrom.textContent = orderData.from; summaryFromContainer.style.display = 'flex'; }
        if (orderData.to) { summaryTo.textContent = orderData.to; summaryToContainer.style.display = 'flex'; }
        if (orderData.time) { summaryTime.textContent = orderData.time; summaryTimeContainer.style.display = 'flex'; } 
        else { summaryTimeContainer.style.display = 'none'; }
    }

function goToStep(stepToShow) {
    addressStep.classList.remove('active');
    timeStep.classList.remove('active');
    paymentStep.classList.remove('active');

    if (stepToShow === 'address') {
        addressStep.classList.add('active');
    } else if (stepToShow === 'time') {
        timeStep.classList.add('active');
    } else if (stepToShow === 'payment') {
        paymentStep.classList.add('active');
    }
}




function resetQuickOrder() {
    orderData = {};
    fromAddressInput.value = '';
    toAddressInput.value = '';
    document.getElementById('comment').value = '';
    quickOrderSummaryCard.classList.add('hidden');
    summaryFromContainer.style.display = 'none';
    summaryToContainer.style.display = 'none';
    summaryTimeContainer.style.display = 'none';
    
    // Ховаємо блок з інфо про водія, якщо він був
    document.getElementById('summary-driver-container').style.display = 'none'; 

    addressNextBtn.classList.add('disabled');
    document.getElementById('from-address-container').style.display = 'block';
    fromVillageContainer.style.display = 'none';
    document.getElementById('to-address-container').style.display = 'block';
    toVillageContainer.style.display = 'none';
    fromVillageSelect.selectedIndex = 0;
    toVillageSelect.selectedIndex = 0;
    settlementButtons.forEach(btn => {
        if (btn.dataset.type === 'valky') btn.classList.add('active');
        else btn.classList.remove('active');
    });
    timeChoiceContainer.style.display = 'flex';
    timeResultContainer.style.display = 'none';
    pickerInput.style.display = 'none';
    goToStep('address');
}


    function showTimeResult(text) {
        orderData.time = text;
        timeResultText.textContent = text;
        timeChoiceContainer.style.display = 'none';
        timeResultContainer.style.display = 'flex';
        updateSummary();
    }
    function checkAddressInputs() {
        const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
        const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
        const isFromValid = (fromType === 'valky' && fromAddressInput.value.trim() !== '') || (fromType === 'village' && fromVillageSelect.selectedIndex > 0);
        const isToValid = (toType === 'valky' && toAddressInput.value.trim() !== '') || (toType === 'village' && toVillageSelect.selectedIndex > 0);
        if (isFromValid && isToValid) {
            addressNextBtn.classList.remove('disabled');
        } else {
            addressNextBtn.classList.add('disabled');
        }
    }
    // == ЛОГІКА ДЛЯ ЕКРАНУ "МОЇ ПОЇЗДКИ" (ПАСАЖИР) ==
    function runActiveTripSimulation() {
        if (window.tripInterval) clearInterval(window.tripInterval);
        const activeCard = document.querySelector('#active-trip-card');
        if (!activeCard || activeCard.style.display === 'none') return;
        const statusIcon = activeCard.querySelector('#status-icon');
        const statusText = activeCard.querySelector('#status-text');
        const carIcon = activeCard.querySelector('#car-icon');
        const dotsContainer = activeCard.querySelector('.dots-container');
        const endPoint = activeCard.querySelector('#progress-end-point');
        const totalDurationSeconds = 15;
        let progress = 0;
        statusIcon.className = 'fa-solid fa-spinner fa-spin';
        statusText.textContent = 'Водій прямує до вас';
        endPoint.classList.remove('arrived');
        carIcon.style.left = '0%';
        dotsContainer.innerHTML = '';
        for (let i = 0; i < 18; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dotsContainer.appendChild(dot);
        }
        window.tripInterval = setInterval(() => {
            progress += (100 / (totalDurationSeconds * 4));
            if (progress >= 100) {
                clearInterval(window.tripInterval);
                carIcon.style.left = '100%';
                statusIcon.className = 'fa-solid fa-circle-check';
                statusText.textContent = 'Водій прибув';
                endPoint.classList.add('arrived');
                return;
            }
            carIcon.style.left = `${progress}%`;
        }, 500);
    }

    // == ЛОГІКА ДЛЯ ЕКРАНУ "ШУКАЮТЬ ВОДІЯ" ==


    const detailsPassengerName = document.getElementById('details-passenger-name');
    const detailsPassengerRating = document.getElementById('details-passenger-rating');
    const detailsFromAddress = document.getElementById('details-from-address');
    const detailsToAddress = document.getElementById('details-to-address');
    const detailsCommentContainer = document.getElementById('details-comment-container');
    const detailsCommentText = document.getElementById('details-comment-text');
    const detailsTotalPrice = document.getElementById('details-total-price');
    const detailsCommission = document.getElementById('details-commission');
    const detailsDriverEarning = document.getElementById('details-driver-earning');
    
    function createDriverOrderCard(order) {
        const li = document.createElement('li');
        li.className = 'order-card driver-view';
        const timeIcon = order.time === 'Зараз' ? '<div class="status-dot online"></div>' : '<i class="fa-solid fa-clock"></i>';
        li.innerHTML = `
            <div class="order-main-info"><div class="passenger-info"><div class="avatar-convex"><i class="fa-solid fa-user"></i></div><div class="passenger-details"><strong>${order.passengerName}</strong><span>${order.rating} <i class="fa-solid fa-star"></i></span></div></div><div class="price-info"><span class="price-amount">~ ${order.price} грн</span><span class="price-label">Ваш дохід</span></div></div>
            <div class="order-route-info"><div class="address-line"><i class="fa-solid fa-circle start-address-icon"></i><span>${order.from}</span></div><div class="address-line"><i class="fa-solid fa-location-dot end-address-icon"></i><span>${order.to}</span></div></div>
            <div class="order-time-info">${timeIcon}<span>${order.time}</span></div>
        `;
        return li;
    }

function displayDriverOrders() {
    const orderList = document.getElementById('driver-order-list');
    if (!orderList) return;
    orderList.innerHTML = '';

    // Правильний цикл forEach
    orders_database.forEach(order => {
        const cardElement = createDriverOrderCard(order);

        // Ця логіка має бути ВСЕРЕДИНІ циклу
        if (order.paymentMethod === 'card' && !fakeDriverAcceptsCard) {
            cardElement.classList.add('disabled-for-driver');
        } else {
            cardElement.addEventListener('click', () => {
                displayOrderDetails(order);
                navigateTo('driver-order-details-screen');
            });
        }

        orderList.appendChild(cardElement);
    });
}

    function displayOrderDetails(order) {
    if(detailsPassengerName) detailsPassengerName.textContent = order.passengerName;
    if(detailsPassengerRating) detailsPassengerRating.innerHTML = `${order.rating} <i class="fa-solid fa-star"></i> • ${Math.floor(Math.random() * 50) + 5} поїздок`;
    if(detailsFromAddress) detailsFromAddress.textContent = order.from;
    if(detailsToAddress) detailsToAddress.textContent = order.to;

    const commission = Math.round(order.price * 0.05);
    if(detailsTotalPrice) detailsTotalPrice.textContent = `${order.price} грн`;
    if(detailsCommission) detailsCommission.textContent = `- ${commission} грн`;
    if(detailsDriverEarning) detailsDriverEarning.textContent = `~ ${order.price - commission} грн`;

    const randomComment = "Буду з дитиною 6 років, потрібно автокрісло.";
    if (Math.random() > 0.5) {
        if(detailsCommentText) detailsCommentText.textContent = randomComment;
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'block';
    } else {
        if(detailsCommentContainer) detailsCommentContainer.style.display = 'none';
    }

    const acceptOrderBtn = document.getElementById('accept-order-btn');
    const declineOrderBtn = document.getElementById('decline-order-btn');

if(acceptOrderBtn) acceptOrderBtn.onclick = () => {
    globalOrderStatus = 'trip_active';

    // === НОВИЙ КОД: ОНОВЛЮЄМО ЕКРАН ПАСАЖИРА ===
    const passengerSearchingCard = document.getElementById('searching-card');
    const passengerActiveCard = document.getElementById('active-trip-card');
    if (passengerSearchingCard && passengerActiveCard) {
        passengerSearchingCard.style.display = 'none';
        passengerActiveCard.style.display = 'block';
        runActiveTripSimulation(); // Запускаємо анімацію машинки
    }
    // === КІНЕЦЬ НОВОГО КОДУ ===

    const activeCard = document.getElementById('driver-active-trip-card');
    if(activeCard) {
        document.getElementById('driver-active-passenger-name').textContent = order.passengerName;
        document.getElementById('driver-active-passenger-rating').innerHTML = `${order.rating} <i class="fa-solid fa-star"></i>`;
        document.getElementById('driver-active-from-address').textContent = order.from;
        document.getElementById('driver-active-to-address').textContent = order.to;
        activeCard.style.display = 'block';

        activeCard.onclick = () => {
            document.getElementById('details-active-passenger-name').textContent = order.passengerName;
            document.getElementById('details-active-passenger-rating').innerHTML = `${order.rating} <i class="fa-solid fa-star"></i>`;
            document.getElementById('details-active-from-address').textContent = order.from;
            document.getElementById('details-active-to-address').textContent = order.to;
            navigateTo('driver-active-trip-details-screen');
        };
    }

    const noOrdersMsg = document.getElementById('no-active-driver-orders');
    if(noOrdersMsg) noOrdersMsg.style.display = 'none';

    navigateTo('driver-orders-screen'); 
    alert('Замовлення прийнято!');
};

if(declineOrderBtn) declineOrderBtn.onclick = () => {
    navigateTo('driver-find-passengers-screen');
};
}

// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ АРХІВІВ v2.1 (клікабельно для всіх) ==
function displayArchives() {
    // --- Архів пасажира ---
    const passengerArchiveList = document.querySelector('#passenger-orders-screen .order-list.passenger');
    if (passengerArchiveList) {
        passengerArchiveList.innerHTML = '';
        if (passenger_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            passengerArchiveList.appendChild(li);
        } else {
            passenger_archive.forEach(order => {
                const driver = drivers_database.find(d => d.id === (order.driverId || 1));
                const driverName = driver ? driver.name : 'Водій';
                const driverCar = driver ? driver.car : '';
                const driverRating = driver ? driver.rating.toFixed(1) : 'N/A';
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.style.cursor = 'pointer';
                li.innerHTML = `...`; // (весь HTML картки, залишаємо як є)
                li.addEventListener('click', () => {
                    document.getElementById('archived-details-date').textContent = new Date(order.id).toLocaleString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    document.getElementById('archived-details-from').textContent = order.from;
                    document.getElementById('archived-details-to').textContent = order.to;
                    document.getElementById('archived-details-price').textContent = `~ ${order.price || 125} грн`;
                    document.getElementById('archived-details-payment').textContent = order.paymentMethod === 'card' ? 'Картка' : 'Готівка';
                    document.getElementById('archived-details-driver-name').textContent = driverName;
                    document.getElementById('archived-details-driver-car').textContent = driverCar;
                    document.getElementById('archived-details-driver-rating').innerHTML = `${driverRating} <i class="fa-solid fa-star"></i>`;
                    navigateTo('archived-trip-details-screen');
                });
                passengerArchiveList.appendChild(li);
            });
        }
    }

    // --- Архів водія ---
    const driverArchiveList = document.querySelector('#driver-orders-screen .order-list.driver');
    if (driverArchiveList) {
        driverArchiveList.innerHTML = '';
        if (driver_archive.length === 0) {
            const li = document.createElement('li');
            li.innerHTML = `<p class="list-placeholder" style="font-style: italic; text-align: center; color: var(--md-on-surface-variant);">Архів поїздок порожній.</p>`;
            driverArchiveList.appendChild(li);
        } else {
            driver_archive.forEach(order => {
                const passenger = passengers_database.find(p => p.id === (order.passengerId || 1));
                const passengerName = passenger ? passenger.name : 'Пасажир';
                const passengerRating = passenger ? '4.8 <i class="fa-solid fa-star"></i>' : 'N/A'; // поки хардкод
                const li = document.createElement('li');
                li.className = 'order-card archived';
                li.style.cursor = 'pointer';
                li.innerHTML = `
                    <div class="archived-info">
                        <span class="archived-date">${new Date(order.id).toLocaleDateString('uk-UA')}</span>
                        <div class="route">
                            <span><i class="fa-solid fa-circle"></i> ${order.from}</span>
                            <span><i class="fa-solid fa-location-dot"></i> ${order.to}</span>
                        </div>
                        <div class="driver-details">Пасажир: ${passengerName}</div>
                    </div>
                    <button class="details-btn-arrow"><i class="fa-solid fa-circle-chevron-right"></i></button>
                `;
                li.addEventListener('click', () => {
                    document.getElementById('driver-archived-passenger-name').textContent = passengerName;
                    document.getElementById('driver-archived-passenger-rating').innerHTML = passengerRating;
                    document.getElementById('driver-archived-from').textContent = order.from;
                    document.getElementById('driver-archived-to').textContent = order.to;
                    navigateTo('driver-archived-trip-details-screen');
                });
                driverArchiveList.appendChild(li);
            });
        }
    }
}

// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ВОДІЯ ==

// Спочатку збираємо всі елементи профілю, щоб до них звертатись
const profileDriverNameHeader = document.getElementById('profile-driver-name-header');
const profileDriverName = document.getElementById('profile-driver-name');
const profileDriverRating = document.getElementById('profile-driver-rating');
const profileDriverTrips = document.getElementById('profile-driver-trips');
const profileDriverCar = document.getElementById('profile-driver-car');
const profileDriverTags = document.getElementById('profile-driver-tags');
const profileDriverReviews = document.getElementById('profile-driver-reviews');
const profileRequestRideBtn = document.getElementById('profile-request-ride-btn');

function displayDriverProfile(driverId) {
    // Знаходимо потрібного водія в нашій базі по його ID
    const driver = drivers_database.find(d => d.id === driverId);

    // Якщо раптом водія не знайшли, нічого не робимо
    if (!driver) {
        console.error('Водія з ID', driverId, 'не знайдено.');
        return;
    }

 // 1. Заповнюємо прості текстові поля
profileDriverNameHeader.textContent = `Профіль: ${driver.name}`;
profileDriverName.textContent = driver.name;
profileDriverTrips.textContent = driver.trips;
profileDriverCar.textContent = driver.car;

// Ось тут нова логіка для рейтингу!
if (driver.trips < 5) {
    profileDriverRating.innerHTML = `<small style="font-weight: 400; font-size: 14px;">Рейтинг формується</small>`;
} else {
    profileDriverRating.textContent = driver.rating.toFixed(1);
}

    // 2. Генеруємо список тегів "Про мене"
    profileDriverTags.innerHTML = ''; // Очищуємо старі теги
    driver.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.innerHTML = `<i class="${tag.icon}"></i> ${tag.text}`;
        profileDriverTags.appendChild(tagElement);
    });

    // 3. Генеруємо список відгуків
    const reviewsSectionTitle = document.querySelector('#driver-rating-screen .details-section h4');
    reviewsSectionTitle.textContent = `Відгуки (${driver.reviews.length})`;
    profileDriverReviews.innerHTML = ''; // Очищуємо старі відгуки
    driver.reviews.forEach(review => {
        const reviewElement = document.createElement('div');
        reviewElement.className = 'review-card';
        reviewElement.innerHTML = `
            <div class="review-header">
                <strong>${review.name}</strong>
                <span class="review-rating">${review.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span>
            </div>
            <p class="review-text">${review.text}</p>
        `;
        profileDriverReviews.appendChild(reviewElement);
    });
    // "Оживляємо" кнопку "Замовити поїздку"
profileRequestRideBtn.onclick = () => {
    // Запам'ятовуємо ID водія, якого обрали
    currentOfferIdForConfirmation = `driver_${driver.id}`; 

    // Заповнюємо даними екран підтвердження
    document.getElementById('confirm-ride-driver-name').textContent = driver.name;
    document.getElementById('confirm-ride-driver-car').textContent = driver.car;

    // Переходимо на екран підтвердження
    navigateTo('driver-confirm-ride-screen');
};

    // Показуємо сам екран профілю
    navigateTo('driver-rating-screen');
}

// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ПАСАЖИРА ==

// Збираємо елементи пасажирського профілю
const profilePassengerNameHeader = document.getElementById('profile-passenger-name-header');
const profilePassengerName = document.getElementById('profile-passenger-name');
const profilePassengerTrips = document.getElementById('profile-passenger-trips');
const profilePassengerBio = document.getElementById('profile-passenger-bio');

function displayPassengerProfile(passengerId) {
    const passenger = passengers_database.find(p => p.id === passengerId);

    if (!passenger) {
        console.error('Пасажира з ID', passengerId, 'не знайдено.');
        return;
    }

    // Заповнюємо поля даними
    profilePassengerNameHeader.textContent = `Профіль: ${passenger.name}`;
    profilePassengerName.textContent = passenger.name;
    profilePassengerTrips.textContent = passenger.trips;
    profilePassengerBio.textContent = passenger.bio;
// Заповнюємо плейсхолдер для оцінок від водіїв
    document.getElementById('passenger-feedback-placeholder').innerHTML = `<i class="fa-solid fa-thumbs-up"></i> <strong>6 👍🏻 0 👎🏻</strong>`;

    // Тут в майбутньому буде логіка для відгуків

    navigateTo('passenger-profile-screen');
}


// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ СПИСКУ ДОСТУПНИХ ВОДІЇВ (ДЛЯ ПАСАЖИРА) ==
function displayAvailableDrivers() {
    const driverListContainer = document.querySelector('#passenger-find-driver-screen .driver-list');

    // Якщо контейнера немає, нічого не робимо
    if (!driverListContainer) return;

    // 1. Очищуємо старий статичний список з HTML
    driverListContainer.innerHTML = '';

    // 2. Пробігаємось по нашій базі водіїв і створюємо для кожного картку
    drivers_database.forEach(driver => {
        const li = document.createElement('li');
        li.className = 'driver-card online'; // Поки всі будуть онлайн для тесту
        
        li.innerHTML = `
            <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
            <div class="driver-info">
                <h4>${driver.name}</h4>
                <span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i></span>
                <small class="status-available">Доступний</small>
            </div>
            <div class="status-dot online"></div>
        `;

        // 3. Додаємо магію: обробник кліку, який відкриває профіль саме цього водія
        li.addEventListener('click', () => {
            displayDriverProfile(driver.id);
        });

        // 4. Додаємо готову картку в список
        driverListContainer.appendChild(li);
    });
}


// --- Навігація ---
showDriverLoginBtn?.addEventListener('click', () => navigateTo('login-screen-driver'));
showPassengerLoginBtn?.addEventListener('click', () => navigateTo('login-screen-passenger'));
driverTelegramLoginBtn?.addEventListener('click', () => navigateTo('driver-dashboard'));
passengerTelegramLoginBtn?.addEventListener('click', () => {
    navigateTo('passenger-dashboard');
    // Тимчасово показуємо Tab Bar для пасажира
    document.getElementById('passenger-tab-bar').classList.remove('hidden');
});


// Кнопка на екрані підтвердження, яка веде в "Мої поїздки"
goToMyOrdersBtn?.addEventListener('click', () => showMyOrdersBtn.click());

// --- Навігація ПАСАЖИРА ---
showMyOrdersBtn?.addEventListener('click', () => {
    displayArchives();
    navigateTo('passenger-orders-screen');
    const searchingCard = document.getElementById('searching-card');
    const activeTripCard = document.getElementById('active-trip-card');
    if (globalOrderStatus === 'searching') {
        if(searchingCard) searchingCard.style.display = 'block';
        if(activeTripCard) activeTripCard.style.display = 'none';
    } else {
        if(searchingCard) searchingCard.style.display = 'none';
        if(activeTripCard) activeTripCard.style.display = 'block';
        runActiveTripSimulation();
    }
});
showQuickOrderBtn?.addEventListener('click', () => {
    navigateTo('quick-order-screen');
    resetQuickOrder();
});
findDriverBtn?.addEventListener('click', () => {
    displayAvailableDrivers(); // <-- Ось це ми додали
    navigateTo('passenger-find-driver-screen');
});

showPassengerValkyKharkivBtn?.addEventListener('click', () => {
    // == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ СПИСКУ ПРОПОЗИЦІЙ "В-Х" (ДЛЯ ПАСАЖИРА) v2.0 ==
function displayVhOffers(filter = 'all') { // Додали параметр фільтру
    const offerListContainer = document.getElementById('vh-driver-list');
    const placeholder = offerListContainer?.querySelector('.list-placeholder');

    if (!offerListContainer || !placeholder) return;

    // Фільтруємо базу даних перед відображенням
    const filteredOffers = vh_offers_database.filter(offer => {
        if (filter === 'all') {
            return true; // Якщо фільтр 'all', показуємо всі
        }
        return offer.direction === filter; // Інакше - тільки ті, що збігаються
    });

    offerListContainer.innerHTML = '';
    offerListContainer.appendChild(placeholder);

    if (filteredOffers.length === 0) {
        placeholder.style.display = 'block';
        placeholder.textContent = 'За цим напрямком пропозицій поки немає.';
    } else {
        placeholder.style.display = 'none';

        filteredOffers.forEach(offer => {
            const driver = drivers_database.find(d => d.id === offer.driverId);
            if (!driver) return;

            const li = document.createElement('li');
            li.className = 'driver-card online';

            li.innerHTML = `
                <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
                <div class="driver-info">
                    <h4>${driver.name}</h4>
                    <span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i> • ${offer.direction}</span>
                    <small class="status-available">${offer.time}</small>
                </div>
                <button class="btn-main-action accept" style="padding: 10px 16px; font-size: 14px;">Обрати</button>
            `;
            offerListContainer.appendChild(li);
        });
    }
}

    navigateTo('passenger-valky-kharkiv-screen');
});

showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
showPassengerProfileBtn?.addEventListener('click', () => {
    // Викликаємо функцію і передаємо ID нашого тестового пасажира (Віти)
    displayPassengerProfile(1); 
});
// == ЛОГІКА ДЛЯ TAB BAR ==
const passengerTabBar = document.getElementById('passenger-tab-bar');
const passengerTabItems = passengerTabBar?.querySelectorAll('.tab-item');

function handleTabClick(clickedItem) {
    // 1. Знімаємо клас 'active' з усіх кнопок
    passengerTabItems.forEach(item => {
        item.classList.remove('active');
    });

    // 2. Додаємо клас 'active' тій, яку натиснули
    clickedItem.classList.add('active');

    // 3. Переходимо на екран, вказаний в data-target
    const targetScreen = clickedItem.dataset.target;
    if (targetScreen) {
        navigateTo(targetScreen);
    }
}

passengerTabItems?.forEach(item => {
    item.addEventListener('click', () => {
        handleTabClick(item);
    });
});

showPassengerSupportBtn?.addEventListener('click', () => navigateTo('passenger-support-screen'));
showPassengerSettingsBtn?.addEventListener('click', () => navigateTo('passenger-settings-screen'));
showHelpBtn?.addEventListener('click', () => navigateTo('help-screen'));
// --- Навігація для "Валки-Харків" ---
vhPassengerCreateRequestBtn?.addEventListener('click', () => navigateTo('vh-passenger-form-screen'));


// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ПАСАЖИР) v2.0 ==

// --- Логіка для перемикача напрямку зі стрілками ---
const vhSwapRouteBtn = document.getElementById('vh-swap-route-btn');
const vhFromLocationSpan = document.getElementById('vh-from-location')?.querySelector('span');
const vhToLocationSpan = document.getElementById('vh-to-location')?.querySelector('span');

vhSwapRouteBtn?.addEventListener('click', () => {
    if (!vhFromLocationSpan || !vhToLocationSpan) return;
    const tempLocation = vhFromLocationSpan.textContent;
    vhFromLocationSpan.textContent = vhToLocationSpan.textContent;
    vhToLocationSpan.textContent = tempLocation;

    const container = vhSwapRouteBtn.closest('.route-swap-container');
    container?.classList.add('swapped');
    setTimeout(() => container?.classList.remove('swapped'), 300);
});

// --- Логіка для вибору часу ---
const vhTimeChoiceButtons = document.querySelectorAll('#vh-passenger-form-screen .btn-segment');
const vhPickerInput = document.getElementById('vh-form-datetime-picker-specific');

vhTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        vhTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(vhPickerInput) vhPickerInput.style.display = 'none';
        } else {
            if(vhPickerInput) vhPickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: (selectedDates, dateStr) => {
                    if (!dateStr) e.currentTarget.classList.remove('active');
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.dateFormat = "H:i";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
            }
            if(vhPickerInput) flatpickr(vhPickerInput, pickerOptions).open();
        }
    });
});

// --- Логіка для кнопки "Опублікувати запит" v2.0 (ПРАВИЛЬНА) ---
const vhFormSubmitBtn = document.getElementById('vh-form-submit-btn-specific');

vhFormSubmitBtn?.addEventListener('click', () => {
    // 1. Збираємо дані з форми (новий, правильний спосіб)
    const fromLocation = vhFromLocationSpan?.textContent || 'Н/Д';
    const toLocation = vhToLocationSpan?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;
    
    const fromSpecific = document.getElementById('vh-form-from-address-specific').value.trim();
    const toSpecific = document.getElementById('vh-form-to-address-specific').value.trim();
    
    let time;
    const activeTimeButton = document.querySelector('#vh-passenger-form-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = vhPickerInput?.value;
        }
    }

    // 2. Робимо базову перевірку
    if (!time) {
        alert('Будь ласка, оберіть час поїздки.');
        return;
    }

    // 3. Створюємо об'єкт запиту
    const newRequest = {
        id: Date.now(),
        passengerId: 1,
        direction: direction,
        fromSpecific: fromSpecific,
        toSpecific: toSpecific,
        time: time
    };

    // 4. Додаємо запит в нашу "базу даних"
    vh_requests_database.push(newRequest);
    console.log('Новий запит В-Х додано:', newRequest);

    // 5. Сповіщаємо користувача і повертаємо на екран-список
    alert('Ваш запит успішно опубліковано!');
    navigateTo('passenger-valky-kharkiv-screen');
});

// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ВОДІЙ) ==

// --- Збираємо елементи водійської форми ---
const vhDriverSwapRouteBtn = document.getElementById('vh-driver-swap-route-btn');
const vhDriverFromLocationSpan = document.getElementById('vh-driver-from-location')?.querySelector('span');
const vhDriverToLocationSpan = document.getElementById('vh-driver-to-location')?.querySelector('span');
const vhDriverTimeChoiceButtons = document.querySelectorAll('#vh-driver-form-screen .btn-segment');
const vhDriverPickerInput = document.getElementById('vh-driver-form-datetime-picker');
const vhDriverFormSubmitBtn = document.getElementById('vh-driver-form-submit-btn');

// --- Логіка для перемикача напрямку (аналогічно до пасажирської) ---
vhDriverSwapRouteBtn?.addEventListener('click', () => {
    if (!vhDriverFromLocationSpan || !vhDriverToLocationSpan) return;
    const tempLocation = vhDriverFromLocationSpan.textContent;
    vhDriverFromLocationSpan.textContent = vhDriverToLocationSpan.textContent;
    vhDriverToLocationSpan.textContent = tempLocation;
});

// --- Логіка для вибору часу (аналогічно до пасажирської) ---
vhDriverTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        vhDriverTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(vhDriverPickerInput) vhDriverPickerInput.style.display = 'none';
        } else {
            if(vhDriverPickerInput) vhDriverPickerInput.style.display = 'block';
            let pickerOptions = {
                enableTime: true, minDate: "today", time_24hr: true,
                onClose: (selectedDates, dateStr) => {
                    if (!dateStr) e.currentTarget.classList.remove('active');
                }
            };
            if (choice === 'today') {
                pickerOptions.noCalendar = true;
                pickerOptions.dateFormat = "H:i";
            } else {
                pickerOptions.dateFormat = "d.m.Y H:i";
            }
            if(vhDriverPickerInput) flatpickr(vhDriverPickerInput, pickerOptions).open();
        }
    });
});

// --- Логіка для кнопки "Опублікувати пропозицію" ---
vhDriverFormSubmitBtn?.addEventListener('click', () => {
    // 1. Збираємо дані
    const fromLocation = vhDriverFromLocationSpan?.textContent || 'Н/Д';
    const toLocation = vhDriverToLocationSpan?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;
    const fromSpecific = document.getElementById('vh-driver-form-from-specific').value.trim();
    const isFlexible = document.getElementById('vh-driver-flexible-route').checked;

    let time;
    const activeTimeButton = document.querySelector('#vh-driver-form-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = vhDriverPickerInput?.value;
        }
    }

    // 2. Перевірка
    if (!time) {
        alert('Будь ласка, оберіть час поїздки.');
        return;
    }

    // 3. Створюємо об'єкт пропозиції
    const newOffer = {
        id: Date.now(),
        driverId: 1, // Поки що хардкод, ID водія "Сергій"
        direction: direction,
        fromSpecific: fromSpecific,
        isFlexible: isFlexible,
        time: time
    };

    // 4. Додаємо пропозицію в нашу "базу даних"
    vh_offers_database.push(newOffer);
    console.log('Нову пропозицію В-Х додано:', newOffer);
    console.log('Поточний стан бази пропозицій:', vh_offers_database);


    // 5. Сповіщаємо і повертаємо назад
    alert('Вашу пропозицію успішно опубліковано!');
    navigateTo('driver-valky-kharkiv-screen');
});

// == ЛОГІКА ДЛЯ ФІЛЬТРІВ "В-Х" (ПАСАЖИР) ==
const vhFilterButtons = document.querySelectorAll('#passenger-valky-kharkiv-screen .btn-filter');

vhFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Знімаємо клас active з усіх кнопок
        vhFilterButtons.forEach(btn => btn.classList.remove('active'));
        // Додаємо клас active тій, яку натиснули
        button.classList.add('active');

        const direction = button.dataset.direction;
        displayVhOffers(direction); // Викликаємо оновлення списку з фільтром
    });
});

// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ СПИСКУ ЗАПИТІВ "В-Х" (ДЛЯ ВОДІЯ) ==
function displayVhRequests() {
    const requestListContainer = document.getElementById('vh-passenger-request-list');
    const placeholder = requestListContainer?.querySelector('.list-placeholder');

    if (!requestListContainer || !placeholder) return;

    // Очищуємо попередні результати, але залишаємо заглушку
    requestListContainer.innerHTML = '';
    requestListContainer.appendChild(placeholder);

    // Перевіряємо, чи є взагалі запити
    if (vh_requests_database.length === 0) {
        placeholder.style.display = 'block'; // Показуємо заглушку
    } else {
        placeholder.style.display = 'none'; // Ховаємо заглушку
        
        // Створюємо картку для кожного запиту
        vh_requests_database.forEach(request => {
            // Знаходимо ім'я пасажира по його ID
            const passenger = passengers_database.find(p => p.id === request.passengerId);
            const passengerName = passenger ? passenger.name : 'Невідомий пасажир';

            const li = document.createElement('li');
            li.className = 'order-card driver-view'; // Перевикористовуємо стиль
            
            li.innerHTML = `
                <div class="order-main-info">
                    <div class="passenger-info">
                        <div class="avatar-convex"><i class="fa-solid fa-user"></i></div>
                        <div class="passenger-details">
                            <strong>${passengerName}</strong>
                            <span>${request.direction}</span>
                        </div>
                    </div>
                </div>
                <div class="order-route-info">
                    <div class="address-line">
                        <i class="fa-solid fa-circle start-address-icon"></i>
                        <span>${request.fromSpecific || 'Точка не вказана'}</span>
                    </div>
                    <div class="address-line">
                        <i class="fa-solid fa-location-dot end-address-icon"></i>
                        <span>${request.toSpecific || 'Точка не вказана'}</span>
                    </div>
                </div>
                <div class="order-time-info">
                    <i class="fa-solid fa-clock"></i>
                    <span>${request.time}</span>
                </div>
                <button class="btn-main-action accept" style="width: 100%; margin-top: 12px;">Відгукнутись</button>
            `;
            requestListContainer.appendChild(li);
        });
    }
}

// == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ СПИСКУ ПРОПОЗИЦІЙ "В-Х" (ДЛЯ ПАСАЖИРА) v2.2 (з робочою кнопкою) ==
function displayVhOffers(filter = 'all') {
    const offerListContainer = document.getElementById('vh-driver-list');
    const placeholder = offerListContainer?.querySelector('.list-placeholder');

    if (!offerListContainer || !placeholder) return;

    const filteredOffers = vh_offers_database.filter(offer => {
        if (filter === 'all') return true;
        if (filter === 'vk') return offer.direction.startsWith('Валки');
        if (filter === 'kv') return offer.direction.startsWith('Харків');
        return false;
    });

    offerListContainer.innerHTML = '';
    offerListContainer.appendChild(placeholder);

    if (filteredOffers.length === 0) {
        placeholder.style.display = 'block';
        placeholder.textContent = 'За цим напрямком пропозицій поки немає.';
    } else {
        placeholder.style.display = 'none';

        filteredOffers.forEach(offer => {
            const driver = drivers_database.find(d => d.id === offer.driverId);
            if (!driver) return;

            const li = document.createElement('li');
            li.className = 'driver-card online';

            li.innerHTML = `
                <div class="avatar-convex"><i class="fa-solid fa-user-tie"></i></div>
                <div class="driver-info">
                    <h4>${driver.name}</h4>
                    <span>${driver.rating.toFixed(1)} <i class="fa-solid fa-star"></i> • ${offer.direction}</span>
                    <small class="status-available">${offer.time}</small>
                </div>
                <button class="btn-main-action accept select-offer-btn" style="padding: 10px 16px; font-size: 14px;">Обрати</button>
            `;

            // Ось ключова зміна: знаходимо кнопку всередині картки і вішаємо на неї обробник
            const selectBtn = li.querySelector('.select-offer-btn');
            selectBtn.addEventListener('click', () => {
                selectOffer(offer.id);
            });

            offerListContainer.appendChild(li);
        });
    }
}


function selectOffer(offerId) {
    const offer = vh_offers_database.find(o => o.id === offerId);
    if (!offer) return;
    const driver = drivers_database.find(d => d.id === offer.driverId);
    if (!driver) return;

    // 1. Створюємо нове сповіщення і додаємо його в базу
    const newNotification = {
        id: Date.now(),
        userId: offer.driverId, // Для якого юзера це сповіщення
        text: `<strong>Нове замовлення!</strong> Пасажир хоче поїхати з вами за маршрутом <strong>${offer.direction}</strong>.`,
        type: 'new_order',
        isRead: false,
        offerId: offerId
        };
    notifications_database.push(newNotification);

    // 2. Показуємо значок сповіщення у водія
    const notificationBadge = document.getElementById('driver-notification-badge');
    if (notificationBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.classList.remove('hidden');
    }

    // 3. Кажемо пасажиру, що все ок
    alert(`Ваш запит надіслано водію ${driver.name}. Очікуйте на підтвердження.`);
    
    // 4. Перекидаємо пасажира на головний екран
    navigateTo('passenger-dashboard');
}


// Функція, яка малює список сповіщень v2.2 (зберігає ID для підтвердження)
function displayNotifications(userType) {
    const listContainer = document.getElementById('notification-list');
    const placeholder = listContainer.querySelector('.list-placeholder');

    const backBtn = document.querySelector('#notifications-screen .btn-back');
    if (userType === 'driver') {
        backBtn.dataset.target = 'driver-dashboard';
    } else {
        backBtn.dataset.target = 'passenger-dashboard';
    }

    listContainer.innerHTML = '';
    listContainer.appendChild(placeholder);

    const currentUserId = (userType === 'driver') ? 1 : 1; 
    const userNotifications = notifications_database.filter(n => n.userId === currentUserId);

    if (userNotifications.length === 0) {
        placeholder.style.display = 'block';
    } else {
        placeholder.style.display = 'none';
        userNotifications.slice().reverse().forEach(notif => {
            const li = document.createElement('li');
            li.className = 'notification-card';
            if(notif.isRead) li.classList.add('is-read');

            const iconClass = notif.type === 'new_order' ? 'fa-solid fa-file-circle-plus' : 'fa-solid fa-file-circle-info';

            li.innerHTML = `
                <i class="notification-icon ${iconClass}"></i>
                <p class="notification-text">${notif.text}</p>
            `;

            if (notif.type === 'new_order' && userType === 'driver') {
                li.style.cursor = 'pointer';
                li.addEventListener('click', () => {
                    const offer = vh_offers_database.find(o => o.id === notif.offerId);
                    const passenger = passengers_database.find(p => p.id === 1);
                    if (!offer || !passenger) return;

                    document.getElementById('vh-confirm-passenger-name').textContent = passenger.name;
                    document.getElementById('vh-confirm-passenger-rating').innerHTML = `4.8 <i class="fa-solid fa-star"></i> • 27 поїздок`;
                    document.getElementById('vh-confirm-direction').textContent = offer.direction;
                    document.getElementById('vh-confirm-specifics').textContent = `${offer.fromSpecific || 'Точка не вказана'} - ${offer.toSpecific || 'Точка не вказана'}`;
                    document.getElementById('vh-confirm-time').textContent = offer.time;

                    // Ось цей рядок ми додаємо!
                    currentOfferIdForConfirmation = notif.offerId; // ЗАПИСУЄМО ID В ПАМ'ЯТЬ

                    navigateTo('driver-vh-confirmation-screen');
                });
            }

            listContainer.appendChild(li);
        });
    }
}

// Функція, яка показує/ховає картку активної поїздки для водія v2.0 (клікабельна)
function displayDriverActiveTrip() {
    const activeTripCard = document.getElementById('driver-active-trip-card');
    const noOrdersMsg = document.getElementById('no-active-driver-orders');

    if (active_trips_database.length > 0) {
        const trip = active_trips_database[0];

        // Заповнюємо картку-прев'ю в "Моїх замовленнях"
        document.getElementById('driver-active-passenger-name').textContent = trip.passengerName;
        document.getElementById('driver-active-passenger-rating').innerHTML = `${trip.passengerRating} <i class="fa-solid fa-star"></i>`;
        document.getElementById('driver-active-from-address').textContent = trip.from;
        document.getElementById('driver-active-to-address').textContent = trip.to;

        // Робимо картку клікабельною
        activeTripCard.onclick = () => {
            // Заповнюємо даними детальний екран активної поїздки
            document.getElementById('details-active-passenger-name').textContent = trip.passengerName;
            document.getElementById('details-active-passenger-rating').innerHTML = `${trip.passengerRating} <i class="fa-solid fa-star"></i>`;
            document.getElementById('details-active-from-address').textContent = trip.from;
            document.getElementById('details-active-to-address').textContent = trip.to;

            // Переходимо на детальний екран
            navigateTo('driver-active-trip-details-screen');
        };

        if(activeTripCard) activeTripCard.style.display = 'block';
        if(noOrdersMsg) noOrdersMsg.style.display = 'none';
    } else {
        if(activeTripCard) activeTripCard.style.display = 'none';
        if(activeTripCard) activeTripCard.onclick = null; // Прибираємо обробник, якщо поїздок немає
        if(noOrdersMsg) noOrdersMsg.style.display = 'block';
    }
}

// == ЛОГІКА КНОПОК ПІДТВЕРДЖЕННЯ/ВІДХИЛЕННЯ ЗАМОВЛЕННЯ В-Х ==
const vhConfirmBtn = document.getElementById('vh-confirm-btn');
const vhDeclineBtn = document.getElementById('vh-decline-btn');

vhConfirmBtn?.addEventListener('click', () => {
    if (!currentOfferIdForConfirmation) return;
    const offerIndex = vh_offers_database.findIndex(o => o.id === currentOfferIdForConfirmation);
    if (offerIndex === -1) return;

    const offer = vh_offers_database[offerIndex];
    const passenger = passengers_database.find(p => p.id === 1);
    if (!passenger) return;

    // КРОК 1: Створюємо об'єкт активної поїздки
    const newActiveTrip = {
        id: offer.id,
        passengerName: passenger.name,
        passengerRating: 4.8, // поки хардкод
        from: offer.direction.split(' - ')[0],
        to: offer.direction.split(' - ')[1],
        time: offer.time
    };
    active_trips_database.push(newActiveTrip);

    // КРОК 2: Видаляємо пропозицію із загального списку
    vh_offers_database.splice(offerIndex, 1);

    currentOfferIdForConfirmation = null;

    // КРОК 3: Сповіщаємо пасажира
    const newNotification = {
        id: Date.now(),
        userId: passenger.id,
        text: `<strong>Вашу поїздку підтверджено!</strong> Водій скоро буде на місці.`,
        type: 'trip_confirmed',
        isRead: false
    };
    notifications_database.push(newNotification);

    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === passenger.id).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    alert('Замовлення підтверджено! Пасажира сповіщено.');
    navigateTo('driver-dashboard');
});

vhDeclineBtn?.addEventListener('click', () => {
    // Знаходимо пасажира "Віту" (поки що ID=1)
    const passenger = passengers_database.find(p => p.id === 1);
    if (!passenger) return;

    // 1. Створюємо сповіщення для пасажира про відхилення
    const newNotification = {
        id: Date.now(),
        userId: passenger.id, // ID пасажира
        text: `<strong>На жаль, водій відхилив ваше замовлення.</strong> Спробуйте обрати іншого водія.`,
        type: 'trip_declined',
        isRead: false
    };
    notifications_database.push(newNotification);

    // 2. Показуємо значок сповіщення у пасажира
    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === passenger.id).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    // 3. Скидаємо тимчасову пам'ять
    currentOfferIdForConfirmation = null;

    alert('Замовлення відхилено. Пасажира сповіщено.');
    navigateTo('notifications-screen'); // Повертаємо водія до списку сповіщень
});

// == ЛОГІКА ПІДТВЕРДЖЕННЯ ВИБОРУ ВОДІЯ З ПРОФІЛЮ ==
const cancelRideBtn = document.getElementById('cancel-ride-btn');
const confirmRideWithDriverBtn = document.getElementById('confirm-ride-with-driver-btn');

cancelRideBtn?.addEventListener('click', () => {
    // Просто повертаємось назад на профіль водія
    navigateTo('driver-rating-screen'); 
});

confirmRideWithDriverBtn?.addEventListener('click', () => {
    // 1. Витягуємо ID водія з нашого "блокноту"
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (!driverIdString) return;
    const driverId = parseInt(driverIdString);
    const driver = drivers_database.find(d => d.id === driverId);
    if (!driver) return;

    // 2. Переходимо на екран Швидкого замовлення
    navigateTo('quick-order-screen');
    resetQuickOrder();

    // 3. Заповнюємо картку-саммарі даними про водія і показуємо її
    const summaryCard = document.getElementById('quick-order-summary-card');
    const summaryDriverContainer = document.getElementById('summary-driver-container');
    const summaryDriver = document.getElementById('summary-driver');

    if (summaryDriverContainer && summaryDriver) {
        summaryDriver.textContent = `${driver.name} (${driver.car})`;
        summaryDriverContainer.style.display = 'flex';
        summaryCard.classList.remove('hidden');
    }
});


// Оновлений обробник для дзвіночка
const driverNotificationsBtn = document.getElementById('driver-notifications-btn');
driverNotificationsBtn?.addEventListener('click', () => {
    const notificationBadge = document.getElementById('driver-notification-badge');

    // Очищуємо значок нових сповіщень
    if (notificationBadge) {
        notificationBadge.classList.add('hidden');
        notificationBadge.textContent = '';
    }

    // Позначаємо всі сповіщення як прочитані
    notifications_database.forEach(n => n.isRead = true);

    // Показуємо екран зі сповіщеннями
    displayNotifications('driver');
    navigateTo('notifications-screen');
});


// Обробник для дзвіночка ПАСАЖИРА
const passengerNotificationsBtn = document.getElementById('passenger-notifications-btn');
passengerNotificationsBtn?.addEventListener('click', () => {
    const notificationBadge = document.getElementById('passenger-notification-badge');

    if (notificationBadge) {
        notificationBadge.classList.add('hidden');
        notificationBadge.textContent = '';
    }

    notifications_database.forEach(n => n.isRead = true);

    displayNotifications('passenger'); // <-- Зверни увагу, передаємо 'passenger'
    navigateTo('notifications-screen');
});



// --- Навігація ВОДІЯ ---
showDriverOrdersBtn?.addEventListener('click', () => {
    displayDriverActiveTrip(); // <-- ОСЬ ТУТ викликаємо нашу нову функцію
    displayArchives();
    navigateTo('driver-orders-screen');
});

showFindPassengersBtn?.addEventListener('click', () => {
    navigateTo('driver-find-passengers-screen');
    displayDriverOrders();
});
showDriverValkyKharkivBtn?.addEventListener('click', () => {
    displayVhRequests(); // <-- Оновлюємо список перед показом
    navigateTo('driver-valky-kharkiv-screen');
});



showDriverProfileBtn?.addEventListener('click', () => navigateTo('driver-rating-screen'));
showDriverHelpBtn?.addEventListener('click', () => navigateTo('driver-help-screen'));
showDriverSupportBtn?.addEventListener('click', () => navigateTo('driver-support-screen'));
showDriverSettingsBtn?.addEventListener('click', () => navigateTo('driver-settings-screen'));
// Обробник для кнопки "Запропонувати поїздку" на екрані Валки-Харків
const vhDriverCreateOfferBtn = document.getElementById('vh-driver-create-offer-btn');
vhDriverCreateOfferBtn?.addEventListener('click', () => {
    navigateTo('vh-driver-form-screen');
});

// Обробник для кнопки "Назад" на екрані деталей активної поїздки водія
document.querySelector('#driver-active-trip-details-screen .btn-back')?.addEventListener('click', () => navigateTo('driver-orders-screen'));


    // --- Обробники логіки "Швидкого замовлення" ---
    
    // КРОК 1: АДРЕСА
    settlementButtons.forEach(button => {
        button.addEventListener('click', () => {
            const group = button.dataset.group;
            const type = button.dataset.type;
            document.querySelectorAll(`.btn-settlement[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            if (group === 'from') {
                fromVillageContainer.style.display = type === 'village' ? 'block' : 'none';
            } else {
                toVillageContainer.style.display = type === 'village' ? 'block' : 'none';
            }
            checkAddressInputs();
        });
    });
    fromAddressInput.addEventListener('input', checkAddressInputs);
    toAddressInput.addEventListener('input', checkAddressInputs);
    fromVillageSelect.addEventListener('change', checkAddressInputs);
    toVillageSelect.addEventListener('change', checkAddressInputs);
    addressNextBtn.addEventListener('click', () => {
        if (addressNextBtn.classList.contains('disabled')) return;
        const fromType = document.querySelector('.btn-settlement[data-group="from"].active').dataset.type;
        const toType = document.querySelector('.btn-settlement[data-group="to"].active').dataset.type;
        if (fromType === 'village') {
            let fromAddress = fromVillageSelect.value;
            if (fromAddressInput.value.trim() !== '') { fromAddress += `, ${fromAddressInput.value.trim()}`; }
            orderData.from = fromAddress;
        } else { orderData.from = fromAddressInput.value.trim(); }
        if (toType === 'village') {
            let toAddress = toVillageSelect.value;
            if (toAddressInput.value.trim() !== '') { toAddress += `, ${toAddressInput.value.trim()}`; }
            orderData.to = toAddress;
        } else { orderData.to = toAddressInput.value.trim(); }
        updateSummary();
        goToStep('time');
    });

    // КРОК 2: ЧАС
    editTimeBtn.addEventListener('click', () => {
        orderData.time = null;
        timeChoiceContainer.style.display = 'flex';
        timeResultContainer.style.display = 'none';
        pickerInput.style.display = 'none';
        updateSummary();
    });
    timeChoiceButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const choice = e.currentTarget.dataset.timeChoice;
            timeChoiceContainer.style.display = 'none';
            if (choice === 'now') {
                const now = new Date();
                const timeString = now.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
                showTimeResult(`Зараз (${timeString})`);
            } else {
                pickerInput.style.display = 'block';
                let pickerOptions = {
                    enableTime: true, minDate: "today", time_24hr: true,
                    onClose: function(selectedDates, dateStr) {
                        if (selectedDates.length > 0) { showTimeResult(dateStr); } 
                        else { editTimeBtn.click(); }
                        pickerInput.style.display = 'none';
                    }
                };
                if (choice === 'today') {
                    pickerOptions.noCalendar = true;
                    pickerOptions.defaultDate = new Date();
                    pickerOptions.dateFormat = "H:i";
                    timeResultText.textContent = "Оберіть час на сьогодні...";
                } else {
                    pickerOptions.dateFormat = "d.m.Y H:i";
                    timeResultText.textContent = "Оберіть дату та час...";
                }
                timeResultContainer.style.display = 'flex';
                flatpickr(pickerInput, pickerOptions).open();
            }
        });
    });
// Новий обробник для кнопки "Далі" на кроці вибору часу
timeNextBtn?.addEventListener('click', () => {
    if (!orderData.time) {
        alert("Будь ласка, оберіть час поїздки");
        return;
    }
    orderData.comment = document.getElementById('comment').value.trim();
    
    // Перевіряємо, чи є у юзера картка
    if (fakeUserHasCard) {
        paymentCardBtn.classList.remove('disabled');
    } else {
        paymentCardBtn.classList.add('disabled');
    }
    
    goToStep('payment');
    submitOrderBtn.classList.add('disabled');
});


// Оновлений обробник для фінальної кнопки "Відправити замовлення"
submitOrderBtn.addEventListener('click', () => {
    // Додаємо базові дані
    orderData.passengerName = "Віта"; 
    orderData.rating = 4.8;
    orderData.id = Date.now();

    // А тепер перевіряємо, чи був обраний конкретний водій
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (driverIdString) {
        const driverId = parseInt(driverIdString);
        const driver = drivers_database.find(d => d.id === driverId);
        if (driver) {
            // Якщо так, додаємо ID водія до замовлення
            orderData.specificDriverId = driverId;

            // І змінюємо текст на екрані підтвердження!
            const confTitle = document.querySelector('#order-confirmation-screen .conf-title');
            const confText = document.querySelector('#order-confirmation-screen .conf-text');
            if(confTitle) confTitle.textContent = `Замовлення для ${driver.name}`;
            if(confText) confText.textContent = `⚡️ Запит надіслано! Очікуйте на підтвердження від водія.`;
        }
    } else {
        // Якщо водія не обрано, залишаємо стандартний текст
        const confTitle = document.querySelector('#order-confirmation-screen .conf-title');
        const confText = document.querySelector('#order-confirmation-screen .conf-text');
        if(confTitle) confTitle.textContent = `Замовлення #${orderData.id.toString().slice(-4)}`;
        if(confText) confText.textContent = `⚡️ Прийнято! Вже шукаємо для вас вільних водіїв!`;
    }

    orders_database.push(orderData);
    console.log('НОВЕ ЗАМОВЛЕННЯ ДОДАНО:', orders_database);

    // Скидаємо "пам'ять" про обраного водія
    currentOfferIdForConfirmation = null;

    showScreen('order-confirmation-screen');
});



// --- Обробники для вибору способу оплати (Додано новий блок з Кроку Б) ---
function handlePaymentChoice(choice) {
    // Зберігаємо вибір
    orderData.paymentMethod = choice;
    
    // Оновлюємо вигляд кнопок
    paymentCashBtn.classList.remove('active');
    paymentCardBtn.classList.remove('active');
    
    if (choice === 'cash') {
        paymentCashBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'none';
    } else if (choice === 'card') {
        paymentCardBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'block';
    }

    // Робимо фінальну кнопку активною
    submitOrderBtn.classList.remove('disabled');
}

paymentCashBtn?.addEventListener('click', () => handlePaymentChoice('cash'));
paymentCardBtn?.addEventListener('click', () => {
    // Якщо кнопка неактивна - показуємо попередження
    if (paymentCardBtn.classList.contains('disabled')) {
        alert('Ви не додали метод оплати онлайн. Перейдіть в налаштування, щоб додати картку.');
        // В майбутньому тут буде красиве модальне вікно з кнопкою "Додати"
        return;
    }
    // Якщо все ок - обробляємо клік
    handlePaymentChoice('card');
});



// --- Універсальна і розумна кнопка "Назад" ---
const quickOrderBackButton = document.querySelector('#quick-order-screen .btn-back');
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        const isQuickOrderScreen = button.closest('#quick-order-screen');
        if (isQuickOrderScreen) {
            const isOnTimeStep = timeStep.style.display === 'flex';
            if (isOnTimeStep) {
                editTimeBtn.click();
                goToStep('address');
            } else {
                if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) {
                    showScreen('passenger-dashboard');
                }
            }
        } else {
            showScreen(button.dataset.target || 'home-screen');
        }
    });
});

    // === ЛОГІКА ПЕРЕМИКАННЯ ТЕМ ===
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const themeCheckbox = themeToggle.querySelector('.toggle-checkbox');
        const body = document.body;
        function switchTheme(e) {
            if (e.target.checked) {
                body.classList.remove('light-theme');
                body.classList.add('dark-theme');
            } else {
                body.classList.remove('dark-theme');
                body.classList.add('light-theme');
            }
        }
        if (body.classList.contains('dark-theme')) {
            themeCheckbox.checked = true;
        }
        themeCheckbox.addEventListener('change', switchTheme);
    }

    // === ЛОГІКА ДЛЯ RIPPLE EFFECT ===
    function createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement("span");
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;
        const existingRipple = button.querySelector(".ripple");
        if (existingRipple) {
            existingRipple.remove();
        }
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - (button.getBoundingClientRect().left + radius)}px`;
        circle.style.top = `${event.clientY - (button.getBoundingClientRect().top + radius)}px`;
        circle.classList.add("ripple");
        button.appendChild(circle);
    }
    document.querySelectorAll(".btn-main, .menu-item").forEach(button => {
        button.addEventListener("click", createRipple);
    });

    // === ЛОГІКА ЗМІНИ ІКОНОК ПІНІВ ===
    const pin1 = document.getElementById('pin1');
    const pin2 = document.getElementById('pin2');
    const pathDots = document.querySelector('.path-dots');
    if (pin1 && pin2 && pathDots) {
        function swapPinIcons() {
            const isPin1Dot = pin1.classList.contains('fa-circle-dot');
            if (isPin1Dot) {
                pin1.classList.remove('fa-circle-dot');
                pin1.classList.add('fa-location-dot');
                pin2.classList.remove('fa-location-dot');
                pin2.classList.add('fa-circle-dot');
            } else {
                pin1.classList.remove('fa-location-dot');
                pin1.classList.add('fa-circle-dot');
                pin2.classList.remove('fa-circle-dot');
                pin2.classList.add('fa-location-dot');
            }
        }
        pathDots.addEventListener('animationiteration', swapPinIcons);
    }

// === ЛОГІКА КЕРУВАННЯ ПОЇЗДКОЮ (ВОДІЙ) v2.0 ===
driverArrivedBtn?.addEventListener('click', () => {
    // Створюємо сповіщення для пасажира
    const newNotification = {
        id: Date.now(),
        userId: 1, // ID пасажира "Віта"
        text: `<strong>Водій прибув!</strong> Ваш водій очікує на вас.`,
        type: 'driver_arrived',
        isRead: false
    };
    notifications_database.push(newNotification);

    // Оновлюємо значок сповіщень у пасажира
    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === 1).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    alert('Пасажира сповіщено, що ви прибули!');
    driverArrivedBtn.classList.add('disabled');
    driverStartTripBtn.classList.remove('disabled');
});

driverStartTripBtn?.addEventListener('click', () => {
    alert('Поїздку розпочато!');
    driverStartTripBtn.classList.add('disabled');
    driverFinishTripBtn.classList.remove('disabled');
    // В майбутньому тут можна додати сповіщення для пасажира
});

driverFinishTripBtn?.addEventListener('click', () => {
    // Знаходимо активну поїздку, щоб її завершити
    if (active_trips_database.length === 0) return;
    const finishedTrip = active_trips_database[0];

    // Додаємо поїздку в архів водія
    driver_archive.push(finishedTrip);
    // І в архів пасажира
    passenger_archive.push(finishedTrip);

    // Видаляємо поїздку з активних
    active_trips_database.splice(0, 1);

    // Тут в майбутньому буде логіка, яка покаже пасажиру екран оцінки
    // А поки що просто сповістимо його
    const newNotification = {
        id: Date.now(),
        userId: 1, // ID пасажира "Віта"
        text: `<strong>Поїздку завершено.</strong> Дякуємо, що обрали наш сервіс!`,
        type: 'trip_finished',
        isRead: false
    };
    notifications_database.push(newNotification);

    const passengerBadge = document.getElementById('passenger-notification-badge');
    if (passengerBadge) {
        const unreadCount = notifications_database.filter(n => !n.isRead && n.userId === 1).length;
        passengerBadge.textContent = unreadCount;
        passengerBadge.classList.remove('hidden');
    }

    alert('Поїздку завершено!');
    // Повертаємо водія на його головний екран
    navigateTo('driver-dashboard');
});


// === ЛОГІКА ЕКРАНУ ОЦІНКИ ПОЇЗДКИ ===
let currentRating = 0;

function updateStars(rating) {
    ratingStars.forEach(star => {
        if (star.dataset.value <= rating) {
            star.classList.add('fa-solid');
            star.classList.remove('fa-regular');
        } else {
            star.classList.add('fa-regular');
            star.classList.remove('fa-solid');
        }
    });
}

ratingStars.forEach(star => {
    star.addEventListener('mouseover', () => {
        updateStars(star.dataset.value);
    });

    star.addEventListener('mouseout', () => {
        updateStars(currentRating); // Повертаємо до обраного рейтингу
    });

    star.addEventListener('click', () => {
        currentRating = star.dataset.value;
        if(submitRatingBtn) submitRatingBtn.classList.remove('disabled'); // Активуємо кнопку
        updateStars(currentRating);
    });
});

submitRatingBtn?.addEventListener('click', () => {
    if (currentRating > 0) {
        const comment = document.getElementById('trip-comment').value.trim();
        alert(`Дякуємо за оцінку! Ваш рейтинг: ${currentRating} зірок. Коментар: "${comment}"`);

        // === НОВИЙ КОД: ДОДАЄМО ПОЇЗДКУ В АРХІВ ===
        // Створюємо копію замовлення, щоб не втратити дані
        const finishedOrder = { ...orderData }; 
        passenger_archive.push(finishedOrder);
        driver_archive.push(finishedOrder); // Поки що додаємо те саме і водію
        // ===========================================

        globalOrderStatus = 'searching';

        // Ховаємо активну картку і показуємо знову екран пошуку
        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        if(searchingCard) searchingCard.style.display = 'block';
        if(activeTripCard) activeTripCard.style.display = 'none';

        // Скидаємо все інше
        currentRating = 0;
        updateStars(0);
        document.getElementById('trip-comment').value = '';
        submitRatingBtn.classList.add('disabled');
        navigateTo('passenger-dashboard');
    }
});

// == ЧІТЕРСЬКА КНОПКА ДЛЯ ТЕСТУВАННЯ ==
const devCreateTestTripBtn = document.getElementById('dev-create-test-trip');
devCreateTestTripBtn?.addEventListener('click', () => {
    // Створюємо фейкову активну поїздку
    const testTrip = {
        id: Date.now(),
        passengerName: 'Тестовий Пасажир',
        passengerRating: 5.0,
        from: 'Точка А',
        to: 'Точка Б',
        time: 'Зараз'
    };

    // Очищуємо старі активні поїздки і додаємо нову
    active_trips_database.length = 0;
    active_trips_database.push(testTrip);

    alert('Тестову поїздку створено!');

    // Одразу переходимо в "Мої замовлення", щоб побачити результат
    showDriverOrdersBtn.click();
});
// == ЛОГІКА ДЛЯ КНОПКИ СТАТУСУ ВОДІЯ ==
const driverStatusIndicator = document.getElementById('driver-status-indicator');

driverStatusIndicator?.addEventListener('click', () => {
    const statusText = driverStatusIndicator.querySelector('.status-text');

    if (driverStatus === 'online') {
        // Переключаємо на "На перерві"
        driverStatus = 'offline';
        statusText.textContent = 'На перерві';
        driverStatusIndicator.classList.remove('online');
        driverStatusIndicator.classList.add('offline');
        alert('Ваш статус змінено на "На перерві". Вас тимчасово не видно пасажирам.');
    } else {
        // Переключаємо назад на "Онлайн"
        driverStatus = 'online';
        statusText.textContent = 'Онлайн';
        driverStatusIndicator.classList.remove('offline');
        driverStatusIndicator.classList.add('online');
        alert('Ви знову онлайн!');
    }
});
// == ЛОГІКА ДЛЯ КЛІКАБЕЛЬНИХ ПРОФІЛІВ В ХЕДЕРІ ==
const driverProfileBadge = document.querySelector('#driver-dashboard .profile-badge');
const passengerProfileBadge = document.querySelector('#passenger-dashboard .profile-badge');

driverProfileBadge?.addEventListener('click', () => {
    // Імітуємо клік на пункт меню "Мій профіль"
    showDriverProfileBtn.click(); 
});

passengerProfileBadge?.addEventListener('click', () => {
    // Імітуємо клік на пункт меню "Мій профіль"
    showPassengerProfileBtn.click();
});

});