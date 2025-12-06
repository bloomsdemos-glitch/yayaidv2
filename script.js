// === ГЛОБАЛЬНІ ЗМІННІ (Тепер доступні для UI) ===
window.currentUser = null; 
let globalOrderStatus = 'idle'; 
let driverStatus = 'offline';
let currentOfferIdForConfirmation = null;

// Статус оплати
let userHasLinkedCard = false; 
let driverAcceptsOnlinePayment = false; 

// Тимчасові сховища даних (кеш) - робимо глобальними
window.orderData = {}; 
window.active_trips = [];
window.notifications_database = [];
window.vh_requests_database = [];
window.vh_offers_database = [];
window.driver_archive = [];
window.passenger_archive = [];
window.drivers_database = [];
window.passengers_database = [];
window.orders_database = [];
window.custom_trips_database = [];
window.active_trips_database = [];

// === 1. FIREBASE CONFIGURATION ===
const firebaseConfig = {
  apiKey: "AIzaSyAvgDO3ZB7FChDFuXgx5lErIVhui-nkW-s",
  authDomain: "yayidu-d743d.firebaseapp.com",
  databaseURL: "https://yayidu-d743d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yayidu-d743d",
  storageBucket: "yayidu-d743d.firebasestorage.app",
  messagingSenderId: "330892131306",
  appId: "1:330892131306:web:9b8f63ec738177c06e5093"
};

// Ініціалізуємо Firebase
let app, db;
if (typeof firebase !== 'undefined' && !firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.database();
    console.log("🔥 Firebase: Connected!");
} else if (typeof firebase !== 'undefined') {
    app = firebase.app();
    db = firebase.database();
} else {
    console.error("❌ CRITICAL: Firebase SDK missing.");
}
// === 2. ГОЛОВНА ЛОГІКА СТАРТУ ===
let tempTelegramUser = null; 

function initApp() {
    const tg = window.Telegram.WebApp;
    tg.expand(); 
    tg.ready();

    // Отримуємо дані з Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        tempTelegramUser = tg.initDataUnsafe.user;
        console.log("📲 Telegram User Detected:", tempTelegramUser);
    } else {
        // 🔥 ФІКС: Якщо не Телеграм — показуємо красивий екран замість алерту
        console.error("❌ Not in Telegram");
        
        const errorScreen = document.getElementById('telegram-error-screen');
        const appContainer = document.getElementById('app-container');

        if (errorScreen) {
            // Ховаємо додаток, щоб не миготів
            if (appContainer) appContainer.style.display = 'none';
            // Показуємо екран помилки
            errorScreen.classList.remove('hidden');
            errorScreen.style.display = 'flex'; 
        } else {
            // Про всяк випадок, якщо HTML не провантажився
            alert("Помилка: Відкрийте додаток через Telegram!");
        }
        return; 
    }

    // Перевіряємо наявність юзера в базі
    const userId = tempTelegramUser.id.toString();
    const userRef = db.ref('users/' + userId);
    
    userRef.once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const val = snapshot.val();
            // 🔥 ПЕРЕВІРКА: Чи є у юзера роль?
            if (val.role && (val.role === 'driver' || val.role === 'passenger')) {
                console.log("✅ Auto-login (Role exists)...");
                window.currentUser = val;
                updateUserInfoIfNeeded(userRef, tempTelegramUser);
                routeUserToScreen();
                startLiveUpdates();
            } else {
                console.log("⚠️ User exists (phone saved), but NO ROLE selected.");
                // Тут ми нічого не робимо — юзер бачить кнопки "Я водій / Пасажир" і обирає
            }
        } else {
            console.log("🆕 New User (Clean start).");
        }
    });
  }
    
function registerUser(selectedRole) {
    if (!tempTelegramUser) {
        alert("Помилка: Немає даних Telegram. Зайдіть через бота.");
        return;
    }

    const userId = tempTelegramUser.id.toString();
    const userRef = firebase.database().ref('users/' + userId);

    // Формуємо справжнє ім'я
    const realName = [tempTelegramUser.first_name, tempTelegramUser.last_name].filter(Boolean).join(' ');

    const newUser = {
        id: userId,
        name: realName || "Користувач", // Твоє ім'я з ТГ!
        username: tempTelegramUser.username || "",
        role: selectedRole,
        phone: "Не вказано", // Тут можна додати запит телефону пізніше
        rating: 5.0,
        trips: 0,
        last_login: new Date().toISOString()
    };

    // Зберігаємо в базу
    userRef.update(newUser).then(() => {
        console.log("✅ Успішна реєстрація/Вхід!");
        
        // 1. Оновлюємо глобальну змінну
        window.currentUser = newUser;
        
        // 2. ОНОВЛЮЄМО ІНТЕРФЕЙС ПРЯМО ЗАРАЗ
        if (selectedRole === 'passenger') {
            // Прибираємо "Віту Б." і ставимо твоє ім'я
            const nameEl = document.getElementById('profile-passenger-name');
            const headerNameEl = document.getElementById('profile-passenger-name-header');
            if(nameEl) nameEl.textContent = newUser.name;
            if(headerNameEl) headerNameEl.textContent = `Привіт, ${newUser.name}`;
            
            updateHeaderWithAvatar('passenger-home-screen');
            navigateTo('passenger-home-screen');
        } else {
            // Те саме для водія
            const nameEl = document.getElementById('profile-driver-name');
            if(nameEl) nameEl.textContent = newUser.name;
            
            updateHeaderWithAvatar('driver-home-screen');
            navigateTo('driver-home-screen');
        }
        
        // 3. Запускаємо прослуховування бази
        startLiveUpdates();

    }).catch((error) => {
        console.error("Помилка входу:", error);
        alert("Помилка бази даних: " + error.message);
    });
}


function routeUserToScreen() {
    document.getElementById('home-screen').classList.add('hidden');

    if (currentUser.role === 'driver') {
        navigateTo('driver-home-screen');
        document.getElementById('driver-tab-bar').classList.remove('hidden');
        updateHeaderWithAvatar('driver-home-screen');
    } else {
        navigateTo('passenger-home-screen');
        document.getElementById('passenger-tab-bar').classList.remove('hidden');
        updateHeaderWithAvatar('passenger-home-screen');
    }
}

function updateHeaderWithAvatar(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;

    const nameEl = screen.querySelector('h3');
    if (nameEl) nameEl.textContent = currentUser.name;

    const avatarContainer = screen.querySelector('.avatar-convex');
    if (avatarContainer) {
        if (currentUser.photoUrl) {
            avatarContainer.innerHTML = `<img src="${currentUser.photoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            avatarContainer.style.background = 'none';
            avatarContainer.style.display = 'flex';
            avatarContainer.style.overflow = 'hidden';
        } else {
            const initials = getInitials(currentUser.name);
            const color = getUserColor(currentUser.id);
            
            avatarContainer.innerHTML = `<span style="color:white; font-weight:bold; font-size:18px;">${initials}</span>`;
            avatarContainer.style.background = color;
            avatarContainer.style.display = 'flex';
            avatarContainer.style.alignItems = 'center';
            avatarContainer.style.justifyContent = 'center';
        }
    }
}

function getInitials(name) {
    if (!name) return '??';
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
}

function getUserColor(userId) {
    const colors = ['#e17076', '#7bc862', '#65aadd', '#a695e7', '#ee7aae', '#6ec9cb', '#faa774'];
    let hash = 0;
    const str = userId.toString();
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
}

// === 3. REALTIME UPDATES ===
function startLiveUpdates() {
    console.log("📡 Connecting to Live Data...");

    // Слухаємо користувачів
    db.ref('users').on('value', (snapshot) => {
        drivers_database = [];
        passengers_database = [];
        const users = snapshot.val();

        if (users) {
            Object.values(users).forEach(u => {
                // Глобальний фільтр: ігноруємо тестових юзерів (і водіїв, і пасажирів)
                if (u.name && (u.name.includes('Test') || u.name === 'User')) return;

                if (u.role === 'driver') {
                    if (!u.car) u.car = "Не вказано"; 
                    if (!u.rating) u.rating = 0.0;
                    drivers_database.push(u);
                } else {
                    passengers_database.push(u);
                }
            });
        }
        
        if (currentUser && currentUser.role === 'passenger') displayAvailableDrivers();
    });

    // Слухаємо активні поїздки
    db.ref('active_trips').on('value', (snapshot) => {
        const data = snapshot.val();
        const allTrips = data ? Object.values(data) : [];
        
        if (currentUser.role === 'driver') {
            active_trips = allTrips.filter(t => t.driverId == currentUser.id);
            updateAllDriverTripViews();
        } else {
            active_trips = allTrips.filter(t => t.passengerId == currentUser.id);
            updateHomeScreenView('passenger');
            
            const searchingCard = document.getElementById('searching-card');
            if (searchingCard && searchingCard.offsetParent !== null) {
                document.getElementById('show-my-orders-btn').click();
            }
        }
    });

    // Слухаємо пропозиції В-Х
    db.ref('vh_offers').on('value', (snapshot) => {
        const data = snapshot.val();
        vh_offers_database = data ? Object.values(data) : [];
        
        const vhScreen = document.getElementById('passenger-valky-kharkiv-screen');
        if (vhScreen && vhScreen.classList.contains('active')) {
            displayVhOffers();
        }
    });

    // Слухаємо запити В-Х
    db.ref('vh_requests').on('value', (snapshot) => {
        const data = snapshot.val();
        vh_requests_database = data ? Object.values(data) : [];
        
        const vhDriverScreen = document.getElementById('driver-valky-kharkiv-screen');
        if (vhDriverScreen && vhDriverScreen.classList.contains('active')) {
            displayVhRequests();
        }
    });

    // Слухаємо сповіщення
    db.ref('notifications').on('value', (snapshot) => {
        const data = snapshot.val();
        const allNotifs = data ? Object.values(data) : [];
        
        notifications_database = allNotifs.filter(n => n.userId == currentUser.id);
        
        const unreadCount = notifications_database.filter(n => !n.isRead).length;
        
        ['driver', 'passenger'].forEach(type => {
            const badgeHome = document.getElementById(`${type}-notification-badge-home`);
            const badgeMain = document.getElementById(`${type}-notification-badge`);
            
            if (unreadCount > 0) {
                // Прибираємо клас hidden -> спрацьовує CSS display: flex
                if(badgeHome) { badgeHome.textContent = unreadCount; badgeHome.classList.remove('hidden'); }
                if(badgeMain) { badgeMain.textContent = unreadCount; badgeMain.classList.remove('hidden'); }
            } else {
                // Додаємо клас hidden -> спрацьовує CSS display: none
                if(badgeHome) badgeHome.classList.add('hidden');
                if(badgeMain) badgeMain.classList.add('hidden');
            }
        });
        
        const notifScreen = document.getElementById('notifications-screen');
        if (notifScreen && notifScreen.classList.contains('active')) {
            UI.displayNotifications(notifications_database, currentUser.role);
        }
    });
}


// === ФУНКЦІЯ ЗБЕРЕЖЕННЯ ===
function saveState() {
    const tripsObj = {};
    active_trips.forEach(t => tripsObj[t.id] = t);
    db.ref('active_trips').update(tripsObj); 

    const vhOffersObj = {};
    vh_offers_database.forEach(o => vhOffersObj[o.id] = o);
    db.ref('vh_offers').set(vhOffersObj);

    const vhRequestsObj = {};
    vh_requests_database.forEach(r => vhRequestsObj[r.id] = r);
    db.ref('vh_requests').set(vhRequestsObj);

    notifications_database.forEach(n => {
        db.ref('notifications/' + n.id).set(n);
    });
    
    if (currentUser) {
        db.ref('users/' + currentUser.id).update({
            trips: currentUser.trips,
            rating: currentUser.rating
        });
    }
}

// === ЗАПУСК ===
document.addEventListener('DOMContentLoaded', () => {
    initApp();

    const screens = document.querySelectorAll('.screen');
    const requestListContainer = document.getElementById('vh-passenger-request-list');
    const backButtons = document.querySelectorAll('.btn-back');
    const goToMyOrdersBtn = document.getElementById('go-to-my-orders-btn');
    const fabIconOnline = document.getElementById('fab-icon-online');
    
    const driverArrivedBtn = document.getElementById('driver-arrived-btn');
    const driverStartTripBtn = document.getElementById('driver-start-trip-btn');
    const driverFinishTripBtn = document.getElementById('driver-finish-trip-btn');
    
    const ratingStars = document.querySelectorAll('.rating-stars i');
    const submitRatingBtn = document.getElementById('submit-rating-btn');

    const showDriverLoginBtn = document.getElementById('show-driver-login');
    const showPassengerLoginBtn = document.getElementById('show-passenger-login');
    const driverTelegramLoginBtn = document.querySelector('#login-screen-driver .btn-telegram-login');
    const passengerTelegramLoginBtn = document.querySelector('#login-screen-passenger .btn-telegram-login');
    
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

    const showFindPassengersBtn = document.getElementById('show-find-passengers-btn');
    
    
    // -- Елементи водія --
    const showDriverOrdersBtn = document.getElementById('show-driver-orders-btn');
    const showDriverValkyKharkivBtn = document.getElementById('show-driver-valky-kharkiv-btn');
    const showDriverProfileBtn = document.getElementById('show-driver-profile-btn');
    const showDriverHelpBtn = document.getElementById('show-driver-help-btn');
    const showDriverSupportBtn = document.getElementById('show-driver-support-btn');
    const showDriverSettingsBtn = document.getElementById('show-driver-settings-btn');
    
    // -- Елементи екрану вибору дії водія --
    const choiceCreateTripBtn = document.getElementById('choice-create-trip');
    const choiceFindPassengersBtn = document.getElementById('choice-find-    passengers');

// === 🔥 ФІКС: ГОЛОВНІ КНОПКИ ВОДІЯ ===
    if (choiceCreateTripBtn) {
        choiceCreateTripBtn.addEventListener('click', () => {
            navigateTo('driver-create-trip-choice-screen');
        });
    }

    if (choiceFindPassengersBtn) {
        choiceFindPassengersBtn.addEventListener('click', () => {
            // Переходимо на екран пошуку і одразу завантажуємо замовлення
            navigateTo('driver-find-passengers-screen');
            if (typeof displayDriverOrders === 'function') {
                displayDriverOrders();
            }
        });
    }

    // =======================================================
    // == ЛОГІКА ДЛЯ FAB-КНОПКИ ВОДІЯ ==
    // =======================================================

    const driverFabBtn = document.getElementById('driver-fab-btn');

    function updateFabButtonState() {
        if (!driverFabBtn) return;

        if (driverStatus === 'online') {
            driverFabBtn.classList.add('is-online');
            driverFabBtn.classList.remove('is-pulsing');
            driverFabBtn.style.background = 'var(--md-primary)';
        } else { 
            driverFabBtn.classList.remove('is-online');
            driverFabBtn.classList.add('is-pulsing');
        }
    }

    driverFabBtn?.addEventListener('click', () => {
        if (driverStatus === 'offline') {
            driverStatus = 'online';
            const driverStatusIndicator = document.getElementById('driver-status-indicator-home');
            if (driverStatusIndicator) {
                driverStatusIndicator.classList.remove('offline');
                driverStatusIndicator.classList.add('online');
                driverStatusIndicator.querySelector('.status-text').textContent = 'Онлайн';
            }
        } else { 
            navigateTo('driver-create-choice-screen');
        }
        updateFabButtonState();
    });

    // == 3. ОСНОВНІ ЕЛЕМЕНТИ DOM ==

    // Елементи Швидкого замовлення (Wizard)
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
    const paymentStep = document.getElementById('payment-step');
    
    const fromAddressInput = document.getElementById('from-address');
    const toAddressInput = document.getElementById('to-address');
    const addressNextBtn = document.getElementById('address-next-btn');
    const timeNextBtn = document.getElementById('time-next-btn');
    const submitOrderBtn = document.getElementById('submit-order-btn');
    
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
    
    const paymentCashBtn = document.getElementById('payment-cash-btn');
    const paymentCardBtn = document.getElementById('payment-card-btn');

// === 🔥 ФІКС: КНОПКИ НАСЕЛЕНИХ ПУНКТІВ (ПАСАЖИР) ===
    const passSettlementBtns = document.querySelectorAll('#quick-order-screen .btn-settlement');
    
    passSettlementBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const group = btn.dataset.group; // 'from' або 'to'
            const type = btn.dataset.type;   // 'valky' або 'village'

            // 1. Перемикання активного класу кнопок
            document.querySelectorAll(`#quick-order-screen .btn-settlement[data-group="${group}"]`)
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // 2. Показуємо/ховаємо відповідні поля
            const inputContainer = document.getElementById(`${group}-address-container`);
            const villageContainer = document.getElementById(`${group}-village-container`);
            
            // Очищаємо дані перед зміною типу
            if (group === 'from') orderData.from = '';
            if (group === 'to') orderData.to = '';

            if (type === 'valky') {
                if(inputContainer) inputContainer.style.display = 'block';
                if(villageContainer) villageContainer.style.display = 'none';
                // Скидаємо селект
                const select = document.getElementById(`${group}-village-select`);
                if(select) select.selectedIndex = 0;
            } else {
                if(inputContainer) inputContainer.style.display = 'none';
                if(villageContainer) villageContainer.style.display = 'block';
                // Очищаємо інпут
                const input = document.getElementById(`${group}-address`);
                if(input) input.value = '';
            }

            // 3. Перевіряємо, чи можна йти далі (оновлюємо кнопку "Далі")
            if(window.UI && UI.checkAddressInputs) UI.checkAddressInputs();
        });
    });


// === 🔥 ФІКС 1: СЛУХАЧІ ДЛЯ АДРЕСИ ===
    const addressInputs = [fromAddressInput, toAddressInput, fromVillageSelect, toVillageSelect];
    
    if (typeof addressInputs !== 'undefined') {
        addressInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    if (input === fromAddressInput) orderData.from = input.value;
                    if (input === toAddressInput) orderData.to = input.value;
                    if (input === fromVillageSelect) orderData.from = input.value;
                    if (input === toVillageSelect) orderData.to = input.value;
                    if(window.UI && UI.checkAddressInputs) UI.checkAddressInputs(); 
                });
                input.addEventListener('change', () => {
                    if (input === fromVillageSelect) orderData.from = input.value;
                    if (input === toVillageSelect) orderData.to = input.value;
                    if(window.UI && UI.checkAddressInputs) UI.checkAddressInputs();
                });
            }
        });
    }

    if (addressNextBtn) {
        addressNextBtn.addEventListener('click', () => {
            if (!addressNextBtn.classList.contains('disabled')) {
                if(window.UI && UI.goToStep) UI.goToStep('time');
                if(window.UI && UI.updateSummary) UI.updateSummary();
            }
        });
    }

    // === 🔥 ФІКС 2: ЛОГІКА ЧАСУ ===
    if (typeof timeChoiceButtons !== 'undefined') {
        timeChoiceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                timeChoiceButtons.forEach(btn => btn.classList.remove('active'));
                e.currentTarget.classList.add('active');

                const choice = e.currentTarget.dataset.timeChoice;

                if (choice === 'now') {
                    orderData.time = 'Зараз';
                    if(typeof pickerInput !== 'undefined' && pickerInput) pickerInput.style.display = 'none';
                    if(typeof timeResultContainer !== 'undefined' && timeResultContainer) timeResultContainer.style.display = 'none';
                    if(typeof timeChoiceContainer !== 'undefined' && timeChoiceContainer) timeChoiceContainer.style.display = 'flex';
                } else {
                    if(typeof pickerInput !== 'undefined' && pickerInput) pickerInput.style.display = 'block';
                    
                    let pickerOptions = {
                        enableTime: true, minDate: "today", time_24hr: true, disableMobile: "true",
                        onClose: (selectedDates, dateStr) => {
                            if (dateStr) {
                                orderData.time = dateStr;
                                if(window.UI && UI.showTimeResult) UI.showTimeResult(dateStr); 
                            } else {
                               e.currentTarget.classList.remove('active');
                               orderData.time = null;
                            }
                        }
                    };
                    if (choice === 'today') { pickerOptions.noCalendar = true; pickerOptions.dateFormat = "H:i"; } 
                    else { pickerOptions.dateFormat = "d.m.Y H:i"; }
                    
                    if(typeof flatpickr !== 'undefined' && pickerInput) flatpickr(pickerInput, pickerOptions).open();
                }
                if(window.UI && UI.updateSummary) UI.updateSummary();
            });
        });
    }

    // Елементи деталей замовлення (для водія)
    const detailsPassengerName = document.getElementById('details-passenger-name');
    const detailsPassengerRating = document.getElementById('details-passenger-rating');
    const detailsFromAddress = document.getElementById('details-from-address');
    const detailsToAddress = document.getElementById('details-to-address');
    const detailsCommentContainer = document.getElementById('details-comment-container');
    const detailsCommentText = document.getElementById('details-comment-text');
    const detailsTotalPrice = document.getElementById('details-total-price');
    const detailsCommission = document.getElementById('details-commission');
    const detailsDriverEarning = document.getElementById('details-driver-earning');



    // == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ВОДІЯ ==
    const profileDriverNameHeader = document.getElementById('profile-driver-name-header');
    const profileDriverName = document.getElementById('profile-driver-name');
    const profileDriverRating = document.getElementById('profile-driver-rating');
    const profileDriverTrips = document.getElementById('profile-driver-trips');
    const profileDriverCar = document.getElementById('profile-driver-car');
    const profileDriverTags = document.getElementById('profile-driver-tags');
    const profileDriverReviews = document.getElementById('profile-driver-reviews');
    const profileRequestRideBtn = document.getElementById('profile-request-ride-btn');

    document.getElementById('show-full-driver-profile-btn')?.addEventListener('click', () => {
        if (currentUser) {
            UI.displayDriverFullProfile(currentUser.id);
            navigateTo('driver-full-profile-screen');
        }
    });

    // == ЛОГІКА ДЛЯ ВІДОБРАЖЕННЯ ПРОФІЛЮ ПАСАЖИРА ==
    const profilePassengerNameHeader = document.getElementById('profile-passenger-name-header');
    const profilePassengerName = document.getElementById('profile-passenger-name');
    const profilePassengerTrips = document.getElementById('profile-passenger-trips');
    const profilePassengerBio = document.getElementById('profile-passenger-bio');

      // === ОБРОБНИКИ КНОПОК ГОЛОВНОГО ЕКРАНУ ===

    if (showDriverLoginBtn) {
        showDriverLoginBtn.addEventListener('click', () => {
            console.log("🚕 Обрано: Водій");
            registerUser('driver');
        });
    }

    if (showPassengerLoginBtn) {
        showPassengerLoginBtn.addEventListener('click', () => {
             console.log("🚶 Обрано: Пасажир");
             registerUser('passenger');
        });
    }


    // --- Навігація ПАСАЖИРА ---
    showMyOrdersBtn?.addEventListener('click', () => {
        displayArchives();
        
        const trip = active_trips.length > 0 ? active_trips[0] : null;
        
        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        
        if (trip) {
            searchingCard.style.display = 'none';
            activeTripCard.style.display = 'block';

            const statusIcon = activeTripCard.querySelector('#status-icon');
            const statusText = activeTripCard.querySelector('#status-text');
            const carIcon = activeTripCard.querySelector('#car-icon');
            const endPoint = activeTripCard.querySelector('#progress-end-point');

            if (trip.status === 'in_progress') {
                statusText.textContent = 'Ви в дорозі';
                statusIcon.className = 'fa-solid fa-route';
                carIcon.style.left = '50%';
                endPoint.classList.remove('arrived');
            } else if (trip.status === 'arrived') {
                statusText.textContent = 'Водій прибув і очікує';
                statusIcon.className = 'fa-solid fa-street-view';
                carIcon.style.left = '100%';
                endPoint.classList.add('arrived');
            } else {
                statusText.textContent = 'Водій прямує до вас';
                statusIcon.className = 'fa-solid fa-car-side';
                carIcon.style.left = '0%';
                endPoint.classList.remove('arrived');
            }
        } else {
            searchingCard.style.display = 'none';
            activeTripCard.style.display = 'none';
        }

        navigateTo('passenger-orders-screen');
    });

    showQuickOrderBtn?.addEventListener('click', () => {
        navigateTo('quick-order-screen');
        UI.resetQuickOrder();
    });

    findDriverBtn?.addEventListener('click', () => {
        displayAvailableDrivers();
        navigateTo('passenger-find-driver-screen');
    });

    showPassengerValkyKharkivBtn?.addEventListener('click', () => {
        displayVhOffers(); 
        navigateTo('passenger-valky-kharkiv-screen');
    });

    // === ЛОГІКА ДЛЯ КАРТОК-ШАБЛОНІВ ===
    document.querySelectorAll('.template-card').forEach(card => {
        card.addEventListener('click', () => {
            const template = card.dataset.template;
            
            if (template === 'vk') {
                document.getElementById('vh-from-location').querySelector('span').textContent = 'Валки';
                document.getElementById('vh-to-location').querySelector('span').textContent = 'Харків';
                navigateTo('vh-passenger-form-screen');
                
            } else if (template === 'kv') {
                document.getElementById('vh-from-location').querySelector('span').textContent = 'Харків';
                document.getElementById('vh-to-location').querySelector('span').textContent = 'Валки';
                navigateTo('vh-passenger-form-screen');
                
            } else if (template === 'custom') {
                navigateTo('vh-passenger-form-screen');
            }
        });
    });

    showPassengerBusScheduleBtn?.addEventListener('click', () => navigateTo('passenger-bus-schedule-screen'));
    
    showPassengerProfileBtn?.addEventListener('click', () => {
        if (currentUser) {
            UI.displayPassengerProfile(currentUser.id);
            navigateTo('passenger-profile-screen');
        }
    });

    // == ЛОГІКА ДЛЯ TAB BAR (ПАСАЖИР) ==
    const passengerTabBar = document.getElementById('passenger-tab-bar');
    const passengerTabItems = passengerTabBar?.querySelectorAll('.tab-item');

// === 🔥 ФІКС 3: БЕЗПЕЧНА НАВІГАЦІЯ (Тільки ця функція) ===
    function handleTabClick(clickedItem) {
        passengerTabItems.forEach(item => item.classList.remove('active'));
        clickedItem.classList.add('active');
        
        const targetScreen = clickedItem.dataset.target;
        
        try {
            if (targetScreen === 'passenger-profile-screen') {
                if (currentUser && window.UI && UI.displayPassengerProfile) {
                    UI.displayPassengerProfile(currentUser.id);
                }
                navigateTo('passenger-profile-screen');
                
            } else if (targetScreen === 'passenger-home-screen') {
                if (typeof updateHomeScreenView === 'function') {
                    updateHomeScreenView('passenger');
                }
                navigateTo('passenger-home-screen');
                
            } else if (targetScreen === 'passenger-valky-kharkiv-screen') {
                if (typeof displayVhOffers === 'function') {
                    displayVhOffers();
                }
                navigateTo('passenger-valky-kharkiv-screen');
                
            } else if (targetScreen === 'passenger-find-driver-screen') {
                if (typeof displayAvailableDrivers === 'function') {
                    displayAvailableDrivers();
                }
                navigateTo(targetScreen);
                
            } else if (targetScreen) {
                navigateTo(targetScreen);
            }
        } catch (error) {
            console.error("Navigation Error:", error);
            if (targetScreen) navigateTo(targetScreen);
        }
    }

    passengerTabItems?.forEach(item => {
        item.addEventListener('click', () => {
            handleTabClick(item);
        });
    });

    // --- Кнопка статусу водія в хедері ---
    const driverStatusIndicator = document.getElementById('driver-status-indicator-home');
    driverStatusIndicator?.addEventListener('click', () => {
        const statusText = driverStatusIndicator.querySelector('.status-text');
        if (driverStatus === 'online') {
            driverStatus = 'offline';
            statusText.textContent = 'На перерві';
            driverStatusIndicator.classList.remove('online');
            driverStatusIndicator.classList.add('offline');
            alert('Ваш статус змінено на "На перерві".');
        } else {
            driverStatus = 'online';
            statusText.textContent = 'Онлайн';
            driverStatusIndicator.classList.remove('offline');
            driverStatusIndicator.classList.add('online');
            alert('Ви знову онлайн!');
        }
    });

    // --- Tab Bar водія ---
    const driverTabItems = document.querySelectorAll('#driver-tab-bar .tab-item');
    driverTabItems.forEach(item => {
        item.addEventListener('click', () => {
            driverTabItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const target = item.dataset.target;

            if (target === 'driver-find-passengers-screen') {
                const targetBackBtn = document.querySelector('#driver-find-passengers-screen .btn-back');
                if (targetBackBtn) {
                    targetBackBtn.dataset.target = 'driver-home-screen';
                }
            }

            if (target === 'driver-profile-screen') {
                if (currentUser) UI.displayDriverProfile(currentUser.id);
                navigateTo(target);
            } else if (target === 'driver-valky-kharkiv-screen') { 
                displayVhRequests(); 
                navigateTo(target);
            } else if (target) {
                navigateTo(target);
            }
        });
    });

    // == ЛОГІКА ДЛЯ ЕКРАНІВ-МЕНЮ "ПРОФІЛЬ" ==
    document.getElementById('show-full-passenger-profile-btn')?.addEventListener('click', () => {
        navigateTo('passenger-full-profile-screen');
    });
    
    // Посилання на налаштування та підтримку
    const profileLinks = [
        { id: 'show-passenger-settings-btn-from-profile', target: 'passenger-settings-screen' },
        { id: 'show-help-btn-from-profile', target: 'help-screen' },
        { id: 'show-passenger-support-btn-from-profile', target: 'passenger-support-screen' },
        { id: 'show-driver-settings-btn-from-profile', target: 'driver-settings-screen' },
        { id: 'show-driver-help-btn-from-profile', target: 'driver-help-screen' },
        { id: 'show-driver-support-btn-from-profile', target: 'driver-support-screen' }
    ];

    profileLinks.forEach(link => {
        document.getElementById(link.id)?.addEventListener('click', () => navigateTo(link.target));
    });

// --- Навігація для "Валки-Харків" ---
vhPassengerCreateRequestBtn?.addEventListener('click', () => navigateTo('vh-passenger-form-screen'));

// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ПАСАЖИР) v2.0 ==
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

// == ЛОГІКА: "ОПУБЛІКУВАТИ ЗАПИТ" (ПАСАЖИР) ==
const vhFormSubmitBtn = document.getElementById('vh-form-submit-btn-specific');
vhFormSubmitBtn?.addEventListener('click', () => {
    const fromLocation = document.getElementById('vh-from-location')?.querySelector('span')?.textContent || 'Н/Д';
    const toLocation = document.getElementById('vh-to-location')?.querySelector('span')?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;

    const fromSpecific = document.getElementById('vh-form-from-address-specific').value.trim();
    const toSpecific = document.getElementById('vh-form-to-address-specific').value.trim();
    const seats = document.getElementById('vh-pass-seats-display').textContent;

    let time;
    const activeTimeButton = document.querySelector('#vh-passenger-form-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = document.getElementById('vh-form-datetime-picker-specific').value;
        }
    }

    if (!time || !seats) {
        alert('Будь ласка, оберіть час поїздки та вкажіть кількість місць.');
        return;
    }

    const newRequest = {
        id: Date.now(),
        passengerId: currentUser.id,
        direction: direction,
        fromSpecific: fromSpecific,
        toSpecific: toSpecific,
        time: time,
        seats: parseInt(seats)
    };

    vh_requests_database.push(newRequest);
    saveState();
    alert('Ваш запит успішно опубліковано!');
    navigateTo('passenger-valky-kharkiv-screen');
});


// == ЛОГІКА ДЛЯ ФОРМИ "ВАЛКИ-ХАРКІВ" (ВОДІЙ) ==
const vhDriverSwapRouteBtn = document.getElementById('vh-driver-swap-route-btn');
const vhDriverFromLocationSpan = document.getElementById('vh-driver-from-location')?.querySelector('span');
const vhDriverToLocationSpan = document.getElementById('vh-driver-to-location')?.querySelector('span');
const vhDriverTimeChoiceButtons = document.querySelectorAll('#vh-driver-form-screen .btn-segment');
const vhDriverPickerInput = document.getElementById('vh-driver-form-datetime-picker');
const vhDriverFormSubmitBtn = document.getElementById('vh-driver-form-submit-btn');

vhDriverSwapRouteBtn?.addEventListener('click', () => {
    if (!vhDriverFromLocationSpan || !vhDriverToLocationSpan) return;
    const tempLocation = vhDriverFromLocationSpan.textContent;
    vhDriverFromLocationSpan.textContent = vhDriverToLocationSpan.textContent;
    vhDriverToLocationSpan.textContent = tempLocation;
});

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

// --- Логіка: "Опублікувати пропозицію" ---
vhDriverFormSubmitBtn?.addEventListener('click', () => {
    const fromLocation = vhDriverFromLocationSpan?.textContent || 'Н/Д';
    const toLocation = vhDriverToLocationSpan?.textContent || 'Н/Д';
    const direction = `${fromLocation} - ${toLocation}`;
    const fromSpecific = document.getElementById('vh-driver-form-from-specific').value.trim();
    const isFlexible = document.getElementById('vh-driver-flexible-route').checked;
    const seats = document.getElementById('vh-driver-seats-display').textContent;

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

    if (!time || !seats) {
        alert('Будь ласка, оберіть час поїздки та вкажіть кількість місць.');
        return;
    }

    const newOffer = {
        id: Date.now(),
        driverId: currentUser.id,
        direction: direction,
        fromSpecific: fromSpecific,
        isFlexible: isFlexible,
        time: time,
        seats: seats
    };

    vh_offers_database.push(newOffer);
    saveState();

    alert('Вашу пропозицію успішно опубліковано!');
    navigateTo('driver-valky-kharkiv-screen');
});

// == ЛОГІКА ДЛЯ ФОРМИ ВЛАСНОГО МАРШРУТУ (ВОДІЙ) ==
const customTripTimeChoiceButtons = document.querySelectorAll('#driver-create-custom-trip-screen .btn-segment');
const customTripPickerInput = document.getElementById('custom-trip-datetime-picker');

customTripTimeChoiceButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const choice = e.currentTarget.dataset.timeChoice;
        customTripTimeChoiceButtons.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');

        if (choice === 'now') {
            if(customTripPickerInput) customTripPickerInput.style.display = 'none';
        } else {
            if(customTripPickerInput) customTripPickerInput.style.display = 'block';
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
            if(customTripPickerInput) flatpickr(customTripPickerInput, pickerOptions).open();
        }
    });
});

// == ЛОГІКА: "ОПУБЛІКУВАТИ ВЛАСНУ ПОЇЗДКУ" ==
const customTripSubmitBtn = document.getElementById('custom-trip-submit-btn');
customTripSubmitBtn?.addEventListener('click', () => {
    const fromType = document.querySelector('#driver-create-custom-trip-screen .btn-settlement[data-group="custom-from"].active').dataset.type;
    const fromLocation = fromType === 'village'
        ? document.getElementById('custom-from-village-select').value
        : document.getElementById('custom-trip-from').value.trim();

    const toType = document.querySelector('#driver-create-custom-trip-screen .btn-settlement[data-group="custom-to"].active').dataset.type;
    const toLocation = toType === 'village'
        ? document.getElementById('custom-to-village-select').value
        : document.getElementById('custom-trip-to').value.trim();

    const intermediateStops = [];
    const stopInputs = document.querySelectorAll('.intermediate-stop-input');
    stopInputs.forEach(input => {
        if (input.value.trim() !== '') {
            intermediateStops.push(input.value.trim());
        }
    });

    let time;
    const activeTimeButton = document.querySelector('#driver-create-custom-trip-screen .btn-segment.active');
    if (activeTimeButton) {
        const choice = activeTimeButton.dataset.timeChoice;
        if (choice === 'now') {
            time = 'Зараз';
        } else {
            time = document.getElementById('custom-trip-datetime-picker').value;
        }
    }

    const seats = document.getElementById('custom-trip-seats-display').textContent;
    const price = document.getElementById('custom-trip-price').value.trim();

    if (!fromLocation || fromLocation === 'Оберіть населений пункт...' || !toLocation || toLocation === 'Оберіть населений пункт...' || !time || !seats || !price) {
        alert('Будь ласка, заповніть всі основні поля.');
        return;
    }

    const newCustomTrip = {
        id: Date.now(),
        driverId: currentUser.id,
        from: fromLocation,
        to: toLocation,
        stops: intermediateStops,
        time: time,
        seats: seats,
        price: price,
        type: 'custom'
    };

    custom_trips_database.push(newCustomTrip);
    saveState();

    alert('Вашу поїздку успішно опубліковано!');
    navigateTo('driver-home-screen');
});


// == ЛОГІКА ДЛЯ ВИБОРУ Н.П. (ВЛАСНИЙ МАРШРУТ) ==
const customSettlementButtons = document.querySelectorAll('#driver-create-custom-trip-screen .btn-settlement');

customSettlementButtons.forEach(button => {
    button.addEventListener('click', () => {
        const group = button.dataset.group;
        const type = button.dataset.type;

        document.querySelectorAll(`.btn-settlement[data-group="${group}"]`).forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        if (group === 'custom-from') {
            document.getElementById('custom-from-village-container').style.display = type === 'village' ? 'block' : 'none';
            document.getElementById('custom-from-manual-container').style.display = type === 'manual' ? 'block' : 'none';
        } else {
            document.getElementById('custom-to-village-container').style.display = type === 'village' ? 'block' : 'none';
            document.getElementById('custom-to-manual-container').style.display = type === 'manual' ? 'block' : 'none';
        }
    });
});

// == ЛОГІКА ДЛЯ ДОДАВАННЯ ПРОМІЖНИХ ТОЧОК ==
const addStopBtn = document.getElementById('add-stop-btn');
const stopsContainer = document.getElementById('intermediate-stops-container');
let stopCounter = 0;

addStopBtn?.addEventListener('click', () => {
    stopCounter++;
    const newStopDiv = document.createElement('div');
    newStopDiv.className = 'intermediate-stop-group';
    newStopDiv.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 12px; padding: 0 12px;';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-location-arrow';
    icon.style.color = 'var(--md-on-surface-variant)';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input intermediate-stop-input';
    input.placeholder = `Проміжна точка ${stopCounter}`;
    input.style.flexGrow = '1';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn-icon-action';
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.style.cssText = 'width: 40px; height: 40px; flex-shrink: 0;';

    removeBtn.addEventListener('click', () => {
        newStopDiv.remove();
        const remainingInputs = stopsContainer.querySelectorAll('.intermediate-stop-input');
        stopCounter = 0;
        remainingInputs.forEach(inp => {
            stopCounter++;
            inp.placeholder = `Проміжна точка ${stopCounter}`;
        });
    });

    newStopDiv.appendChild(icon);
    newStopDiv.appendChild(input);
    newStopDiv.appendChild(removeBtn);
    stopsContainer.appendChild(newStopDiv);
});

// == ЛОГІКА ФІЛЬТРІВ "В-Х" ==
const vhFilterButtons = document.querySelectorAll('#passenger-valky-kharkiv-screen .btn-filter');
vhFilterButtons.forEach(button => {
    button.addEventListener('click', () => {
        vhFilterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const direction = button.dataset.direction;
        displayVhOffers(direction);
    });
});

// == ПІДТВЕРДЖЕННЯ / ВІДХИЛЕННЯ ЗАМОВЛЕННЯ В-Х (ВОДІЙ) ==
const vhConfirmBtn = document.getElementById('vh-confirm-btn');
const vhDeclineBtn = document.getElementById('vh-decline-btn');

vhConfirmBtn?.addEventListener('click', () => {
    if (!currentOfferIdForConfirmation) return;
    const offerIndex = vh_offers_database.findIndex(o => o.id === currentOfferIdForConfirmation);
    if (offerIndex === -1) return;

    const offer = vh_offers_database[offerIndex];
    
    // Шукаємо реального пасажира, а не ID=1
    const passenger = passengers_database.find(p => p.id === offer.passengerId);
    
    const newActiveTrip = {
        id: offer.id,
        passengerName: passenger ? passenger.name : 'Пасажир',
        passengerRating: passenger ? passenger.rating : 5.0,
        from: offer.direction.split(' - ')[0],
        to: offer.direction.split(' - ')[1],
        time: offer.time,
        status: 'pending'
    };
    active_trips_database.push(newActiveTrip); // Або active_trips, треба перевірити консистентність

    vh_offers_database.splice(offerIndex, 1);
    currentOfferIdForConfirmation = null;

    // Сповіщаємо пасажира
    if (passenger) {
        const newNotification = {
            id: Date.now(),
            userId: passenger.id,
            text: `<strong>Вашу поїздку підтверджено!</strong> Водій скоро буде на місці.`,
            type: 'trip_confirmed',
            isRead: false
        };
        notifications_database.push(newNotification);
        saveState();
    }

    alert('Замовлення підтверджено! Пасажира сповіщено.');
    navigateTo('driver-home-screen');
});

vhDeclineBtn?.addEventListener('click', () => {
    const offer = vh_offers_database.find(o => o.id === currentOfferIdForConfirmation);
    if (!offer) return;

    const passenger = passengers_database.find(p => p.id === offer.passengerId);
    if (passenger) {
        const newNotification = {
            id: Date.now(),
            userId: passenger.id,
            text: `<strong>На жаль, водій відхилив ваше замовлення.</strong> Спробуйте обрати іншого водія.`,
            type: 'trip_declined',
            isRead: false
        };
        notifications_database.push(newNotification);
        saveState();
    }

    currentOfferIdForConfirmation = null;
    alert('Замовлення відхилено. Пасажира сповіщено.');
    navigateTo('notifications-screen');
});

// == ЛОГІКА ПІДТВЕРДЖЕННЯ ВОДІЯ З ПРОФІЛЮ ==
const cancelRideBtn = document.getElementById('cancel-ride-btn');
const confirmRideWithDriverBtn = document.getElementById('confirm-ride-with-driver-btn');

cancelRideBtn?.addEventListener('click', () => {
    navigateTo('driver-full-profile-screen'); 
});

confirmRideWithDriverBtn?.addEventListener('click', () => {
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (!driverIdString) return;
    
    // Тут може бути нюанс з типами (string/number), тому краще перевіряти обидва
    const driverId = driverIdString; // ID у нас тепер стрічковий (з Telegram)
    const driver = drivers_database.find(d => d.id == driverId);
    
    if (!driver) return;

    navigateTo('quick-order-screen');
    UI.resetQuickOrder();

    const summaryCard = document.getElementById('quick-order-summary-card');
    const summaryDriverContainer = document.getElementById('summary-driver-container');
    const summaryDriver = document.getElementById('summary-driver');

    if (summaryDriverContainer && summaryDriver) {
        summaryDriver.textContent = `${driver.name} (${driver.car})`;
        summaryDriverContainer.style.display = 'flex';
        summaryCard.classList.remove('hidden');
    }
});

// == ДЗВІНОЧКИ (Спільна логіка) ==
const notificationBtns = [
    { btnId: 'driver-notifications-btn', badgeId: 'driver-notification-badge', type: 'driver' },
    { btnId: 'passenger-notifications-btn', badgeId: 'passenger-notification-badge', type: 'passenger' }
];

notificationBtns.forEach(item => {
    document.getElementById(item.btnId)?.addEventListener('click', () => {
        const badge = document.getElementById(item.badgeId);
        if (badge) {
            badge.classList.add('hidden');
            badge.textContent = '';
        }

        // Позначаємо тільки свої сповіщення
        notifications_database.forEach(n => {
            if (n.userId == currentUser.id) n.isRead = true;
        });
        saveState();

        showUserNotifications(item.type);
        navigateTo('notifications-screen');
    });
});

// --- Навігація ВОДІЯ (меню) ---
showDriverOrdersBtn?.addEventListener('click', () => {
    updateAllDriverTripViews(); 
    displayArchives();
    navigateTo('driver-orders-screen');
});

showFindPassengersBtn?.addEventListener('click', () => {
    navigateTo('driver-find-passengers-screen');
    displayDriverOrders();
});

showDriverValkyKharkivBtn?.addEventListener('click', () => {
    displayVhRequests(); 
    navigateTo('driver-valky-kharkiv-screen');
});

// Новий обробник для кнопки "Далі" на кроці вибору часу
timeNextBtn?.addEventListener('click', () => {
    if (!orderData.time) {
        alert("Будь ласка, оберіть час поїздки");
        return;
    }
    orderData.comment = document.getElementById('comment').value.trim();
    
    // Перевіряємо, чи є у юзера картка
    if (userHasLinkedCard) {
        paymentCardBtn.classList.remove('disabled');
    } else {
        paymentCardBtn.classList.add('disabled');
    }
    
    UI.goToStep('payment');
    submitOrderBtn.classList.add('disabled');
});

// == ОБРОБНИК: "ВІДПРАВИТИ ЗАМОВЛЕННЯ" ==
submitOrderBtn.addEventListener('click', () => {
    // 1. Формуємо дані
    orderData.passengerName = currentUser.name; 
    orderData.passengerId = currentUser.id;
    orderData.rating = currentUser.rating || 5.0; 
    orderData.id = Date.now();
    orderData.status = 'searching';

    // Перевірка на конкретного водія
    const driverIdString = currentOfferIdForConfirmation?.replace('driver_', '');
    if (driverIdString) {
        // Тут ID водія вже може бути стрічковим (з Telegram)
        orderData.specificDriverId = driverIdString; 
    }

        // 2. Додаємо в базу
    orders_database.push(orderData);
    saveState();
    
    // 3. Скидаємо "пам'ять"
    currentOfferIdForConfirmation = null;

    // 4. Оновлюємо текст на екрані підтвердження (динамічно)
    const confTitle = document.querySelector('.conf-title');
    const confText = document.querySelector('.conf-text');
    
    if (confTitle) confTitle.textContent = `Замовлення #${orderData.id.toString().slice(-4)}`;
    
    // 5. Очищаємо форму
    UI.resetQuickOrder();

    // 6. ПОКАЗУЄМО ЕКРАН ПІДТВЕРДЖЕННЯ
    navigateTo('order-confirmation-screen');
});

// === ЛОГІКА КНОПКИ "МОЇ ПОЇЗДКИ" НА ЕКРАНІ ПІДТВЕРДЖЕННЯ ===
document.getElementById('go-to-my-orders-btn')?.addEventListener('click', () => {
    const searchingCard = document.getElementById('searching-card');
    const activeTripCard = document.getElementById('active-trip-card');
    
    if (searchingCard) searchingCard.style.display = 'block';
    if (activeTripCard) activeTripCard.style.display = 'none';

    navigateTo('passenger-orders-screen');
});

// --- Обробники для вибору способу оплати ---
function handlePaymentChoice(choice) {
    orderData.paymentMethod = choice;
    
    paymentCashBtn.classList.remove('active');
    paymentCardBtn.classList.remove('active');
    
    if (choice === 'cash') {
        paymentCashBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'none';
    } else if (choice === 'card') {
        paymentCardBtn.classList.add('active');
        document.getElementById('card-payment-note').style.display = 'block';
    }

    submitOrderBtn.classList.remove('disabled');
}

paymentCashBtn?.addEventListener('click', () => handlePaymentChoice('cash'));
paymentCardBtn?.addEventListener('click', () => {
    if (paymentCardBtn.classList.contains('disabled')) {
        alert('Ви не додали метод оплати онлайн. Перейдіть в налаштування, щоб додати картку.');
        return;
    }
    handlePaymentChoice('card');
});

// Розумна кнопка "Назад"
backButtons.forEach(button => {
    button.addEventListener('click', () => {
        const currentScreen = button.closest('.screen');

        if (currentScreen && currentScreen.id === 'quick-order-screen') {
            const isOnTimeStep = timeStep.classList.contains('active');
            const isOnPaymentStep = paymentStep.classList.contains('active');

            if (isOnTimeStep) {
                UI.goToStep('address'); 
            } else if (isOnPaymentStep) {
                UI.goToStep('time'); 
            } else {
                if (confirm('Скасувати оформлення замовлення? Всі дані буде втрачено.')) {
                    navigateTo('passenger-home-screen'); 
                }
            }
        } else {
            const target = button.dataset.target || 'home-screen'; 
            navigateTo(target);
        }
    });
});

// === ЛОГІКА КЕРУВАННЯ ПОЇЗДКОЮ (ВОДІЙ) ===
driverArrivedBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) return;

    const trip = active_trips[0];
    trip.status = 'arrived';
    saveState(); 

    const newNotification = {
        id: Date.now(),
        userId: trip.passengerId,
        text: `<strong>Водій прибув!</strong> Ваш водій очікує на вас.`,
        type: 'driver_arrived',
        isRead: false
    };
    notifications_database.push(newNotification);
    saveState();

    updateAllDriverTripViews(); 
    updateHomeScreenView('passenger'); 

    driverArrivedBtn.classList.add('disabled');
    driverStartTripBtn.classList.remove('disabled');

    alert('Пасажира сповіщено, що ви прибули!');
});

driverStartTripBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) return;
    
    const trip = active_trips[0];
    trip.status = 'in_progress';
    saveState();
    
    updateAllDriverTripViews();
    updateHomeScreenView('passenger');

    driverStartTripBtn.classList.add('disabled');
    driverFinishTripBtn.classList.remove('disabled');
    
    alert('Поїздку розпочато!');
});

driverFinishTripBtn?.addEventListener('click', () => {
    if (active_trips.length === 0) {
        alert('Помилка: не знайдено активних поїздок для завершення.');
        return;
    }

    const finishedTrip = active_trips[0];
    const passengerId = finishedTrip.passengerId;

    driver_archive.push(finishedTrip);
    passenger_archive.push(finishedTrip);

    active_trips.splice(0, 1);
    saveState();

    const passenger = passengers_database.find(p => p.id === passengerId);
    if (passenger) {
        const newNotification = {
            id: Date.now(),
            userId: passenger.id,
            text: `<strong>Поїздку завершено.</strong> Дякуємо! Не забудьте оцінити водія.`,
            type: 'trip_finished',
            isRead: false
        };
        notifications_database.push(newNotification);
        saveState();
    }

    updateAllDriverTripViews();
    updateHomeScreenView('passenger');

    driverArrivedBtn.classList.remove('disabled');
    driverStartTripBtn.classList.add('disabled');
    driverFinishTripBtn.classList.add('disabled');

    alert('Поїздку успішно завершено!');
    navigateTo('driver-home-screen');
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
        updateStars(currentRating); 
    });

    star.addEventListener('click', () => {
        currentRating = star.dataset.value;
        if(submitRatingBtn) submitRatingBtn.classList.remove('disabled'); 
        updateStars(currentRating);
    });
});

submitRatingBtn?.addEventListener('click', () => {
    if (currentRating > 0) {
        const comment = document.getElementById('trip-comment').value.trim();
        alert(`Дякуємо за оцінку! Ваш рейтинг: ${currentRating} зірок. Коментар: "${comment}"`);

        const finishedOrder = { ...orderData }; 
        passenger_archive.push(finishedOrder);
        driver_archive.push(finishedOrder); 

        globalOrderStatus = 'searching';

        const searchingCard = document.getElementById('searching-card');
        const activeTripCard = document.getElementById('active-trip-card');
        if(searchingCard) searchingCard.style.display = 'block';
        if(activeTripCard) activeTripCard.style.display = 'none';

        currentRating = 0;
        updateStars(0);
        document.getElementById('trip-comment').value = '';
        submitRatingBtn.classList.add('disabled');
        navigateTo('passenger-home-screen');
    }
});

// --- Клікабельні дзвіночки в хедері ---
document.getElementById('passenger-notifications-btn-home')?.addEventListener('click', () => handleNotificationClick('passenger'));
document.getElementById('driver-notifications-btn-home')?.addEventListener('click', () => handleNotificationClick('driver'));

function handleNotificationClick(userType) {
    const badgeHome = document.getElementById(`${userType}-notification-badge-home`);
    const badgeMain = document.getElementById(`${userType}-notification-badge`);

    if (badgeHome) {
        badgeHome.classList.add('hidden');
        badgeHome.textContent = '';
    }
    if (badgeMain) {
        badgeMain.classList.add('hidden');
        badgeMain.textContent = '';
    }
    
    notifications_database.forEach(n => {
        if (n.userId === currentUser.id) { 
            n.isRead = true;
        }
    });

    showUserNotifications(userType);
    navigateTo('notifications-screen');
}

// == ЛОГІКА ДЛЯ МІНІ-КАРТКИ ПРОФІЛЮ (ПОПАП) ==
const profilePopup = document.getElementById('profile-popup');
const popupOverlay = document.getElementById('popup-overlay'); 
const driverProfileBadge = document.querySelector('#driver-home-screen .profile-badge');
const passengerProfileBadge = document.querySelector('#passenger-home-screen .profile-badge');
const popupViewProfileBtn = document.getElementById('popup-view-profile-btn');

driverProfileBadge?.addEventListener('click', () => {
    if (profilePopup.classList.contains('visible')) {
        UI.hideProfilePopup();
    } else {
        const driver = drivers_database.find(d => d.id === currentUser.id) || currentUser;
        const driverData = {
            icon: 'fa-solid fa-user-tie',
            name: driver.name,
            details: `${driver.rating ? driver.rating.toFixed(1) : 0} ★ • ${driver.trips} поїздок`
        };
        UI.showProfilePopup(driverData);

        popupViewProfileBtn.onclick = () => {
            UI.displayDriverProfile(driver.id);
            navigateTo('driver-full-profile-screen');
            UI.hideProfilePopup();
        };
    }
});

passengerProfileBadge?.addEventListener('click', () => {
    if (profilePopup.classList.contains('visible')) {
        UI.hideProfilePopup();
    } else {
        const passenger = currentUser;
        const passengerData = {
            icon: 'fa-solid fa-user',
            name: passenger.name,
            details: `${passenger.trips} поїздок`
        };
        UI.showProfilePopup(passengerData);

        popupViewProfileBtn.onclick = () => {
            UI.displayPassengerProfile(passenger.id);
            navigateTo('passenger-full-profile-screen');
            UI.hideProfilePopup();
        };
    }
});

popupOverlay?.addEventListener('click', UI.hideProfilePopup);

// == ЛОГІКА ДЛЯ КНОПКИ "ВІДГУКНУТИСЬ" ==
if (requestListContainer) {
    requestListContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.btn-main-action.accept[data-request-id]');
        if (!targetButton) return;

        const requestId = targetButton.dataset.requestId;
        const request = vh_requests_database.find(r => r.id == requestId);
        
        if (request) {
            const passenger = passengers_database.find(p => p.id === request.passengerId);
            const passengerName = passenger ? passenger.name : 'Невідомий пасажир';

            const driverAvailableSeats = 4;
            if (request.seats > driverAvailableSeats) {
                alert(`Недостатньо місць. Пасажиру потрібно ${request.seats}, а у вас є ${driverAvailableSeats}.`);
                return;
            }

            const newActiveVhTrip = {
                ...request,
                driverId: currentUser.id, 
                passengerName: passengerName,
                status: 'pending' 
            };

            active_trips.push(newActiveVhTrip);

            const requestIndex = vh_requests_database.findIndex(r => r.id == requestId);
            if (requestIndex > -1) {
                vh_requests_database.splice(requestIndex, 1);
            }

            if (passenger) {
                const newNotification = {
                    id: Date.now(),
                    userId: passenger.id,
                    text: `<strong>Ваш запит прийнято!</strong> Водій <strong>${currentUser.name}</strong> погодився на поїздку.`,
                    type: 'trip_confirmed',
                    isRead: false
                };
                notifications_database.push(newNotification);
                saveState();
                
                const passengerBadge = document.getElementById('passenger-notification-badge-home');
                if (passengerBadge) {
                   passengerBadge.classList.remove('hidden'); 
                }
            }
            
            alert('Запит прийнято! Поїздка з\'явиться у розділі "Мої замовлення".');
            updateHomeScreenView('driver'); 
            displayVhRequests();
            navigateTo('driver-home-screen');
        }
    });
}

// Ініціалізуємо всі наші лічильники
setupSeatCounter('vh-pass-minus-btn', 'vh-pass-plus-btn', 'vh-pass-seats-display');
setupSeatCounter('custom-trip-minus-btn', 'custom-trip-plus-btn', 'custom-trip-seats-display');
setupSeatCounter('vh-driver-minus-btn', 'vh-driver-plus-btn', 'vh-driver-seats-display');

// == ЛОГІКА ВИДАЛЕННЯ АКАУНТУ (REAL) ==
const deleteAccountBtns = [
    document.getElementById('show-driver-settings-delete-btn'),
    document.getElementById('show-passenger-settings-delete-btn')
];

deleteAccountBtns.forEach(btn => {
    btn?.addEventListener('click', () => {
        if (confirm("Ви точно хочете видалити свій профіль? Всі ваші дані та рейтинг будуть втрачені назавжди.")) {
            if (!currentUser) return;

            db.ref('users/' + currentUser.id).remove()
                .then(() => {
                    console.log("User deleted from Firebase");
                    currentUser = null;
                    alert("Ваш профіль видалено. Для повторної реєстрації перезапустіть бота.");
                    window.location.reload(); 
                })
                .catch((error) => {
                    console.error("Delete error:", error);
                    alert("Помилка видалення: " + error.message);
                });
        }
    });
}); 
}); // Кінець DOMContentLoaded
