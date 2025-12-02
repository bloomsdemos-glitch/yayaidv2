// auth.js
import { db } from "./firebase-init.js"; // беремо базу
import { ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js"; // беремо функції бази
import { state, setTempTelegramUser, tempTelegramUser } from "./state.js"; // беремо стейт

// УВАГА: Ці функції (navigateTo, updateHeader...) поки що не існують в цьому модулі.
// Ми їх пізніше підключимо з ui.js. Поки що код буде "чекати" їх.

export function initApp() {
    const tg = window.Telegram.WebApp;
    tg.expand(); 
    tg.ready();

    if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
        setTempTelegramUser(tg.initDataUnsafe.user);
        console.log("📲 Telegram User Detected:", tempTelegramUser);
    } else {
        // Для тестування на компі можна розкоментувати це:
        // setTempTelegramUser({ id: 12345, first_name: "Test", last_name: "User" });
        alert("Помилка: Відкрийте додаток через Telegram!");
        return; 
    }

    const userId = tempTelegramUser.id.toString();
    const userRef = ref(db, 'users/' + userId);

    get(userRef).then((snapshot) => {
        if (snapshot.exists()) {
            console.log("✅ Auto-login...");
            state.currentUser = snapshot.val();
            updateUserInfoIfNeeded(userId, tempTelegramUser);
            
            // ТУТ БУДЕ ВИКЛИК ФУНКЦІЇ МАРШРУТИЗАЦІЇ (пізніше)
            // routeUserToScreen(); 
            // startLiveUpdates();
            console.log("Юзер залогінений:", state.currentUser);
            // Тимчасова милиця, поки не перенесли UI:
            document.dispatchEvent(new CustomEvent('user-logged-in')); 
        } else {
            console.log("🆕 New User. Waiting for registration...");
            document.getElementById('home-screen').classList.remove('hidden');
        }
    });
}

function updateUserInfoIfNeeded(userId, tgData) {
    // ... логіка оновлення ...
    // Поки скоротимо для тесту, бо треба імпортувати update
}

// Експортуємо, щоб можна було викликати з головного файлу
export { registerUser }; 

function registerUser(selectedRole) {
    // ... сюди перенесемо логіку реєстрації пізніше, коли перевіримо initApp ...
}
