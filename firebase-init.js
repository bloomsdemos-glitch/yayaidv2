// firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAvgDO3ZB7FChDFuXgx5lErIVhui-nkW-s",
  authDomain: "yayidu-d743d.firebaseapp.com",
  databaseURL: "https://yayidu-d743d-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yayidu-d743d",
  storageBucket: "yayidu-d743d.firebasestorage.app",
  messagingSenderId: "330892131306",
  appId: "1:330892131306:web:9b8f63ec738177c06e5093"
};

// Ініціалізуємо
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

console.log("🔥 Firebase Module: Connected!");

// Експортуємо базу, щоб інші файли могли нею користуватись
export { db, app };
