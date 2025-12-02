// auth.js
import { db } from "./firebase-init.js";
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";
import { state, setTempTelegramUser, tempTelegramUser } from "./state.js";
import { navigateTo } from './ui.js';

// === ГОЛОВНА ФУНКЦІЯ ЗАПУСКУ ===
export function initApp() {
    const tg = window.Telegram.WebApp;
    tg.expand(); 
    tg.ready();

    // 1. Отримуємо дані з Телеграм
    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTempTelegramUser(tg.initDataUnsafe.user);
        console.log("📲 Telegram User Detected:", tempTelegramUser);
    } else {
        // Для тестів на ПК можна розкоментувати:
        // setTempTelegramUser({ id: 999999, first_name: "Test", last_name: "User", username: "test_user" });
        // console.warn("⚠️ Використовую тестового юзера!");
        
        if (!tempTelegramUser) {
            alert("Помилка: Відкрийте додаток через Telegram!");
            return; 
        }
    }

    // 2. Перевіряємо, чи є юзер в базі
    const userId = tempTelegramUser.id.toString();
    const userRef = ref(db, 'users/' + userId);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("✅ Auto-login...");
            state.currentUser = snapshot.val();
            
            // Оновлюємо дані, якщо в Телеграмі щось змінилось (ім'я/фото)
            updateUserInfoIfNeeded(userId, tempTelegramUser);
            
            // Запускаємо додаток для цього юзера
            routeUserToScreen();
            
            console.log("Юзер залогінений:", state.currentUser);
        } else {
            console.log("🆕 New User. Waiting for registration...");
            // Показуємо екран вибору (Водій/Пасажир)
            document.getElementById('home-screen').classList.remove('hidden');
        }
    }).catch(error => {
        console.error("Firebase Error:", error);
        alert("Помилка з'єднання з базою даних.");
    });
}

// === РЕЄСТРАЦІЯ НОВОГО ЮЗЕРА ===
export function registerUser(selectedRole) {
    if (!tempTelegramUser) {
        alert("Помилка: Немає даних Telegram!");
        return;
    }

    const userId = tempTelegramUser.id.toString();
    const userRef = ref(db, 'users/' + userId);

    const newUser = {
        id: userId,
        name: [tempTelegramUser.first_name, tempTelegramUser.last_name].join(' ').trim() || "Користувач",
        username: tempTelegramUser.username || "",
        photoUrl: tempTelegramUser.photo_url || null,
        phone: "Не вказано",
        role: selectedRole,
        rating: 5.0,
        trips: 0,
        registrationDate: new Date().toISOString()
    };

    // Зберігаємо в базу
    set(userRef, newUser).then(() => {
        state.currentUser = newUser;
        routeUserToScreen(); // Перекидаємо на головну
    }).catch(error => {
        console.error("Registration Error:", error);
        alert("Помилка реєстрації. Спробуйте ще раз.");
    });
}

// === МАРШРУТИЗАЦІЯ (КУДИ ЙТИ ПІСЛЯ ВХОДУ) ===
function routeUserToScreen() {
    // 1. Ховаємо екрани входу
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('login-screen-driver').classList.add('hidden');
    document.getElementById('login-screen-passenger').classList.add('hidden');

    // 2. Дивимось роль і відкриваємо потрібний екран
    if (state.currentUser.role === 'driver') {
        navigateTo('driver-home-screen');
        document.getElementById('driver-tab-bar').classList.remove('hidden');
        updateHeaderWithAvatar('driver-home-screen');
    } else {
        navigateTo('passenger-home-screen');
        document.getElementById('passenger-tab-bar').classList.remove('hidden');
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

// === UI ХЕЛПЕРИ (Щоб не лазити в ui.js зайвий раз) ===
function updateHeaderWithAvatar(screenId) {
    const screen = document.getElementById(screenId);
    if (!screen) return;

    const nameEl = screen.querySelector('h3');
    if (nameEl) nameEl.textContent = state.currentUser.name;

    const avatarContainer = screen.querySelector('.avatar-convex');
    if (avatarContainer) {
        if (state.currentUser.photoUrl) {
            avatarContainer.innerHTML = `<img src="${state.currentUser.photoUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            avatarContainer.style.background = 'none';
        } else {
            // Генерація аватарки з ініціалів
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
