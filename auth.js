// auth.js (ВИПРАВЛЕНА ВЕРСІЯ)
import { db } from "./firebase-init.js";
import { ref, get, update } from "firebase/database"; // Залежить від версії Firebase
import { state, setTempTelegramUser, tempTelegramUser } from "./state.js";

// === ГОЛОВНА ФУНКЦІЯ ЗАПУСКУ ===
export function initApp() {
    const tg = window.Telegram.WebApp;
    if (!tg) {
        console.error("Telegram WebApp not found");
        showTelegramError();
        return;
    }
    
    tg.expand(); 
    tg.ready();

    // 1. Отримуємо дані з Телеграм
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTempTelegramUser(tg.initDataUnsafe.user);
        console.log("📲 Telegram User Detected:", tempTelegramUser);
        checkUserInDatabase();
    } else {
        // Для тестів на ПК можна розкоментувати:
        // setTempTelegramUser({ id: 999999, first_name: "Test", last_name: "User", username: "test_user" });
        // checkUserInDatabase();
        // return;
        
        console.error("❌ No Telegram data found. Showing auth request.");
        showTelegramError();
    }
}

function checkUserInDatabase() {
    if (!tempTelegramUser) {
        showTelegramError();
        return;
    }

    const userId = tempTelegramUser.id.toString();
    const userRef = ref(db, 'users/' + userId);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("✅ Auto-login...");
            state.currentUser = snapshot.val();
            
            // Оновлюємо дані, якщо в Телеграмі щось змінилось
            updateUserInfoIfNeeded(userId, tempTelegramUser);
            
            // Запускаємо додаток для цього юзера
            routeUserToScreen();
            
            console.log("Юзер залогінений:", state.currentUser);
        } else {
            console.log("🆕 New User. Waiting for registration...");
            // Показуємо екран вибору (Водій/Пасажир)
            document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
            const homeScreen = document.getElementById('home-screen');
            if (homeScreen) {
                homeScreen.classList.remove('hidden');
            }
        }
    }).catch(error => {
        console.error("Firebase Error:", error);
        alert("Помилка з'єднання з базою даних.");
    });
}

function showTelegramError() {
    // Ховаємо всі екрани
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.add('hidden');
        s.style.display = 'none'; 
    });
    
    // Показуємо екран помилки
    const errorScreen = document.getElementById('telegram-error-screen');
    if (errorScreen) {
        errorScreen.classList.remove('hidden');
        errorScreen.style.display = 'flex'; 
    } else {
        alert("Помилка: Відкрийте додаток через Telegram бот!");
    }
}

// === РЕЄСТРАЦІЯ НОВОГО ЮЗЕРА ===
export function registerUser(selectedRole) {
    if (!tempTelegramUser) {
        alert("Помилка: Немає даних Telegram!");
        return;
    }

    const userId = tempTelegramUser.id.toString();
    const userRef = ref(db, 'users/' + userId);

    // Перевіряємо, чи вже є телефон в базі
    get(userRef).then((snapshot) => {
        let phone = "Не вказано";
        if (snapshot.exists() && snapshot.val().phone) {
            phone = snapshot.val().phone;
        }

        const newUser = {
            id: userId,
            name: [tempTelegramUser.first_name, tempTelegramUser.last_name].join(' ').trim() || "Користувач",
            username: tempTelegramUser.username || "",
            photoUrl: tempTelegramUser.photo_url || null,
            phone: phone,
            role: selectedRole,
            rating: 5.0,
            trips: 0,
            registrationDate: new Date().toISOString()
        };

        // Зберігаємо/Оновлюємо профіль
        update(userRef, newUser).then(() => {
            state.currentUser = newUser;
            routeUserToScreen(); // Перекидаємо на головну
        }).catch(error => {
            console.error("Registration Error:", error);
            alert("Помилка реєстрації. Спробуйте ще раз.");
        });
    });
}

// === МАРШРУТИЗАЦІЯ (КУДИ ЙТИ ПІСЛЯ ВХОДУ) ===
function routeUserToScreen() {
    // 1. Ховаємо екрани входу і помилок
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    const errorScreen = document.getElementById('telegram-error-screen');
    if (errorScreen) errorScreen.style.display = 'none';

    // 2. Дивимось роль і відкриваємо потрібний екран
    if (state.currentUser.role === 'driver') {
        if (typeof navigateTo === 'function') {
            navigateTo('driver-home-screen');
        }
        const driverTabBar = document.getElementById('driver-tab-bar');
        if (driverTabBar) driverTabBar.classList.remove('hidden');
        updateHeaderWithAvatar('driver-home-screen');
    } else {
        if (typeof navigateTo === 'function') {
            navigateTo('passenger-home-screen');
        }
        const passengerTabBar = document.getElementById('passenger-tab-bar');
        if (passengerTabBar) passengerTabBar.classList.remove('hidden');
        updateHeaderWithAvatar('passenger-home-screen');
    }
}

// === ОНОВЛЕННЯ ДАНИХ (SYNC) ===
function updateUserInfoIfNeeded(userId, tgData) {
    const userRef = ref(db, 'users/' + userId);
    let updates = {};
    const actualName = [tgData.first_name, tgData.last_name].join(' ').trim();
    
    if (state.currentUser.name !== actualName) {
        updates.name = actualName;
    }
    if (state.currentUser.photoUrl !== (tgData.photo_url || null)) {
        updates.photoUrl = tgData.photo_url || null;
    }
    
    if (Object.keys(updates).length > 0) {
        update(userRef, updates);
        // Оновлюємо локальний стейт теж
        state.currentUser = { ...state.currentUser, ...updates };
    }
}

// === UI ХЕЛПЕРИ ===
function updateHeaderWithAvatar(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen || !state.currentUser) return;

    const nameEl = screen.querySelector('h3');
    if (nameEl) nameEl.textContent = state.currentUser.name;

    const avatarContainer = screen.querySelector('.avatar-convex');
    if (avatarContainer) {
        if (state.currentUser.photoUrl) {
            avatarContainer.innerHTML = `<img src="${state.currentUser.photoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            avatarContainer.style.background = 'none';
            avatarContainer.style.display = 'flex';
            avatarContainer.style.overflow = 'hidden';
        } else {
            const initials = getInitials(state.currentUser.name);
            const color = getUserColor(state.currentUser.id);
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
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getUserColor(id) {
    const colors = ['#FF5722', '#4CAF50', '#2196F3', '#9C27B0', '#E91E63', '#FF9800'];
    let hash = 0;
    const strId = id.toString();
    for (let i = 0; i < strId.length; i++) {
        hash = strId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

// Експортуємо додаткові функції, якщо потрібно
export { routeUserToScreen, updateHeaderWithAvatar };