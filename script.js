const products = [
    { id: 1, name: "iPhone 15 Pro", price: 45000, type: "iphone", desc: "Корпус із авіаційного титану та процесор A17 Pro.", sale: "Hot", img: "images/iphone-15-pro-blk-01-1600x1600.webp" },
    { id: 2, name: "iPhone 13",     price: 22000, type: "iphone", desc: "Надійний смартфон із чудовою автономністю.", sale: "", img: "images/250318170022513675.webp" },
    { id: 3, name: "Samsung S24",   price: 38000, type: "android", desc: "Інтелектуальні функції Galaxy AI та неймовірна камера.", sale: "-10%", img: "images/samsung-s24-s921-grey-01-1600x1600.webp" },
    { id: 4, name: "iPhone 15",     price: 32000, type: "iphone", desc: "Яскравий дизайн та роз'єм USB-C.", sale: "", img: "images/iphone15-blue.webp" }
];

const news = [
    { title: "Відкриття нового магазину", status: "urgent",    text: "Чекаємо вас у ТЦ Technovate о 10:00!", date: "2026-05-07 10:00" },
    { title: "Нова поставка iPhone",      status: "important", text: "Всі кольори iPhone 15 вже в наявності.", date: "2026-05-06 14:30" },
    { title: "Знижки на Samsung",         status: "normal",    text: "До кінця тижня діють спеціальні ціни.", date: "2026-05-05 16:00" },
    { title: "Новий сервіс доставки",     status: "important", text: "Доставка тепер працює по всій Україні.", date: "2026-05-04 12:00" }
];

let displayedNewsCount = 2;
let lastResult = [...products];
let cart = [];

// Стан авторизації
let currentUser = null; // null = не залогінений; { login, email } = залогінений


// ====================== TOAST ======================

let toastTimer = null;

/**
 * Показує сповіщення знизу екрана
 * @param {string} message
 * @param {'success'|'error'|'info'} type
 */
function showToast(message, type = "info") {
    const toast   = document.getElementById("toast");
    const icon    = document.getElementById("toastIcon");
    const msg     = document.getElementById("toastMsg");

    const icons = { success: "✅", error: "❌", info: "ℹ️" };

    toast.className = `toast toast--${type}`;
    icon.textContent = icons[type] || "";
    msg.textContent  = message;

    // форсуємо reflow для перезапуску анімації
    void toast.offsetWidth;
    toast.classList.add("show");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.classList.add("hidden"), 300);
    }, 3500);
}


// ====================== PRODUCTS ======================

function renderProducts(data) {
    const grid = document.getElementById("productGrid");
    if (!grid) return;
    grid.innerHTML = "";

    data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            ${item.sale ? `<div class="badge">${item.sale}</div>` : ""}
            <img src="${item.img}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p class="price">${item.price} грн</p>
            <button class="toggle-desc-btn">Деталі</button>
            <p class="desc hidden">${item.desc}</p>
            <button class="buy-btn">Купити</button>
        `;

        card.querySelector(".toggle-desc-btn").addEventListener("click", () => {
            card.querySelector(".desc").classList.toggle("hidden");
        });

        card.querySelector(".buy-btn").addEventListener("click", () => {
            addToCart(item.id);
            drawCharts();
        });

        grid.appendChild(card);
    });
}


// ====================== FILTERS ======================

function applyFilters() {
    const category = document.getElementById("categoryFilter").value;
    const sort     = document.getElementById("sortSelect").value;
    const min      = +document.getElementById("minPrice").value || 0;
    const max      = +document.getElementById("maxPrice").value || Infinity;
    const search   = document.getElementById("searchInput").value.toLowerCase();

    let result = products.filter(item =>
        (category === "all" || item.type === category) &&
        item.price >= min && item.price <= max &&
        item.name.toLowerCase().includes(search)
    );

    if (sort === "name")      result.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "priceAsc")  result.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") result.sort((a, b) => b.price - a.price);

    lastResult = result;
    renderProducts(result);
    drawCharts();
}


// ====================== NEWS ======================

function renderNews() {
    const titlesContainer = document.getElementById("newsTitles");
    if (!titlesContainer) return;
    titlesContainer.innerHTML = "";

    const sortedNews = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
    const newsToShow = sortedNews.slice(0, displayedNewsCount);

    newsToShow.forEach(n => {
        const div = document.createElement("div");
        div.className = `news-title-item ${n.status}`;
        const time = n.date.split(" ")[1];
        div.innerHTML = `<span>${time}</span><div class="title-text">${n.title}</div>`;

        div.onclick = () => {
            document.querySelectorAll(".news-title-item").forEach(el => el.classList.remove("active"));
            div.classList.add("active");
            showNewsBody(n);
        };

        titlesContainer.appendChild(div);
    });

    const loadBtn = document.getElementById("loadMoreNewsBtn");
    if (loadBtn) loadBtn.style.display = displayedNewsCount >= news.length ? "none" : "block";
}

function showNewsBody(newsItem) {
    document.getElementById("newsContent").innerHTML = `
        <h3>${newsItem.title}</h3>
        <p class="news-date">${newsItem.date}</p>
        <hr>
        <p>${newsItem.text}</p>
    `;
}

function loadMoreNews() { displayedNewsCount += 2; renderNews(); }
document.getElementById("loadMoreNewsBtn")?.addEventListener("click", loadMoreNews);


// ====================== CART ======================

function toggleCart() {
    document.getElementById("cart").classList.toggle("hidden");
}

document.getElementById("cartTrigger")?.addEventListener("click", toggleCart);
document.getElementById("closeCart")?.addEventListener("click", toggleCart);

function addToCart(id) {
    const item     = products.find(p => p.id === id);
    const existing = cart.find(i => i.id === id);
    if (existing) { existing.qty += 1; } else { cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 }); }
    renderCart();
}

function renderCart() {
    const container = document.getElementById("cartItems");
    let total = 0;
    container.innerHTML = "";

    cart.forEach((item, index) => {
        const sum = item.price * item.qty;
        total += sum;

        const li = document.createElement("li");
        li.className = "cart-item";
        li.innerHTML = `
            <span class="name">${item.name}</span>
            <span class="price">${item.price} грн ×</span>
            <input type="number" min="1" value="${item.qty}" class="qty-input">
            <span class="sum">${sum} грн</span>
            <button class="remove-btn">✖️</button>
        `;

        li.querySelector(".qty-input").addEventListener("change", (e) => { changeQty(index, e.target.value); });
        li.querySelector(".remove-btn").addEventListener("click", () => { removeFromCart(index); drawCharts(); });
        container.appendChild(li);
    });

    document.getElementById("cartTotal").innerText = `Разом: ${total} грн`;
    document.getElementById("cartCount").innerText = cart.length;

    // Кнопка "Відправити": активна тільки якщо є товари І користувач залогінений
    const checkoutBtn     = document.getElementById("checkoutBtn");
    const cartAuthNotice  = document.getElementById("cartAuthNotice");

    if (!currentUser && cart.length > 0) {
        // є товари, але не авторизований — показуємо попередження
        cartAuthNotice.classList.remove("hidden");
        checkoutBtn.disabled = true;
    } else {
        cartAuthNotice.classList.add("hidden");
        checkoutBtn.disabled = cart.length === 0;
    }
}

function changeQty(index, value) { cart[index].qty = +value; renderCart(); drawCharts(); }
function removeFromCart(index)    { cart.splice(index, 1); renderCart(); }

// Кнопка "Увійти" всередині кошика → відкриваємо модалку авторизації
document.getElementById("cartLoginBtn")?.addEventListener("click", () => {
    document.getElementById("cart").classList.add("hidden");
    document.getElementById("authModal").classList.remove("hidden");
    // перемикаємо на вкладку "Вхід"
    document.getElementById("showLogin").click();
});


// ====================== ORDER ======================

function sendOrder() {
    // Додатковий захист: якщо якось натиснули без авторизації
    if (!currentUser) {
        showToast("Будь ласка, спочатку увійдіть до акаунту.", "error");
        document.getElementById("authModal").classList.remove("hidden");
        return;
    }
    if (cart.length === 0) return;

    const total = document.getElementById("cartTotal").innerText;
    const list  = cart.map(item => `<li>${item.name} — ${item.qty} шт.</li>`).join("");

    document.getElementById("orderInfo").innerHTML = `
        <p>Дякуємо, <strong>${currentUser.login}</strong>!</p>
        <ul>${list}</ul>
        <p><strong>${total}</strong></p>
    `;

    document.getElementById("authModal").classList.add("hidden");
    document.getElementById("orderModal").classList.remove("hidden");

    cart = [];
    renderCart();
}

document.getElementById("checkoutBtn")?.addEventListener("click", sendOrder);

function closeOrderModal() { document.getElementById("orderModal").classList.add("hidden"); }
document.getElementById("closeOrderModal")?.addEventListener("click", closeOrderModal);
document.getElementById("orderOkBtn")?.addEventListener("click", closeOrderModal);


// ====================== AUTH MODAL ======================

const modal = document.getElementById("authModal");

document.getElementById("authBtn")?.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

document.getElementById("closeAuthModal")?.addEventListener("click", () => {
    modal.classList.add("hidden");
});

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.classList.add("hidden");
});

const loginForm    = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const btnShowLogin = document.getElementById("showLogin");
const btnShowReg   = document.getElementById("showRegister");

btnShowReg?.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    btnShowReg.classList.add("active");
    btnShowLogin.classList.remove("active");
    clearAllErrors();
});

btnShowLogin?.addEventListener("click", () => {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    btnShowLogin.classList.add("active");
    btnShowReg.classList.remove("active");
    clearAllErrors();
});

// Показ/приховання пароля
document.querySelectorAll(".toggle-password").forEach(btn => {
    btn.addEventListener("click", () => {
        const input = document.getElementById(btn.dataset.target);
        if (input.type === "password") { input.type = "text";     btn.textContent = "🙈"; }
        else                           { input.type = "password"; btn.textContent = "👁"; }
    });
});


// ====================== ВАЛІДАЦІЙНІ УТИЛІТИ ======================

function showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.add("input-error");
    if (error) error.textContent = message;
}

function clearFieldError(inputId, errorId) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    if (input) input.classList.remove("input-error");
    if (error) error.textContent = "";
}

function clearAllErrors() {
    document.querySelectorAll(".input-error").forEach(el => el.classList.remove("input-error"));
    document.querySelectorAll(".error-text").forEach(el => el.textContent = "");
    document.getElementById("loginErrorBanner")?.classList.add("hidden");
}

function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidLogin(login) { return /^[a-zA-Z0-9_-]{3,}$/.test(login); }
function isValidPhone(phone) { return /^\+380\d{9}$/.test(phone); }

function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8)          score++;
    if (password.length >= 12)         score++;
    if (/[A-Z]/.test(password))        score++;
    if (/[0-9]/.test(password))        score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 2) return "weak";
    if (score <= 3) return "medium";
    return "strong";
}

// Індикатор сили пароля в реальному часі
document.getElementById("regPass")?.addEventListener("input", () => {
    const val   = document.getElementById("regPass").value;
    const fill  = document.getElementById("strengthFill");
    const label = document.getElementById("strengthLabel");

    if (!val) { fill.className = "strength-fill"; label.className = "strength-label"; label.textContent = ""; return; }

    const s = getPasswordStrength(val);
    fill.className  = `strength-fill ${s}`;
    label.className = `strength-label ${s}`;
    label.textContent = s === "weak" ? "Слабкий" : s === "medium" ? "Середній" : "Сильний";
});

// Live-перевірка збігу паролів при наборі
document.getElementById("regPassConfirm")?.addEventListener("input", () => {
    const pass        = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;

    if (passConfirm && pass !== passConfirm) {
        showFieldError("regPassConfirm", "regPassConfirmError", "Паролі не збігаються");
    } else {
        clearFieldError("regPassConfirm", "regPassConfirmError");
    }
});


// ====================== ФОРМА ВХОДУ ======================
// Правило: при невдачі — ТІЛЬКИ загальне повідомлення, без деталей

loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const email    = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Прибираємо попереднє повідомлення
    const banner = document.getElementById("loginErrorBanner");
    banner.classList.add("hidden");

    // Просто перевіряємо: чи взагалі щось введено
    const valid = email !== "" && password !== "";

    if (!valid) {
        // Показуємо загальний банер без уточнень
        banner.classList.remove("hidden");
        return;
    }

    // --- Симуляція перевірки на сервері ---
    // Вважаємо успішним входом будь-який валідний email + пароль ≥ 8 символів
    // (у реальному проєкті тут був би запит до API)
    const serverCheckPassed = isValidEmail(email) && password.length >= 8;

    if (!serverCheckPassed) {
        banner.classList.remove("hidden");
        return;
    }

    // Успішний вхід
    currentUser = { login: email.split("@")[0], email };
    updateAuthButton();
    modal.classList.add("hidden");
    loginForm.reset();
    clearAllErrors();
    renderCart(); // оновити кошик (прибрати блок авторизації)
    showToast(`✅ Вітаємо, ${currentUser.login}! Ви увійшли до акаунту.`, "success");
});


// ====================== ФОРМА РЕЄСТРАЦІЇ ======================
// Правило: при невдачі — детальні повідомлення під кожним полем

registerForm?.addEventListener("submit", (e) => {
    e.preventDefault();

    const login       = document.getElementById("regLogin").value.trim();
    const email       = document.getElementById("regEmail").value.trim();
    const phone       = document.getElementById("regPhone").value.trim();
    const pass        = document.getElementById("regPass").value;
    const passConfirm = document.getElementById("regPassConfirm").value;

    // Скидаємо попередні помилки реєстрації
    clearFieldError("regLogin",       "regLoginError");
    clearFieldError("regEmail",       "regEmailError");
    clearFieldError("regPhone",       "regPhoneError");
    clearFieldError("regPass",        "regPassError");
    clearFieldError("regPassConfirm", "regPassConfirmError");

    let valid = true;

    // --- Логін ---
    if (!login) {
        showFieldError("regLogin", "regLoginError", "Поле обов'язкове для заповнення");
        valid = false;
    } else if (!isValidLogin(login)) {
        showFieldError("regLogin", "regLoginError", "Мінімум 3 символи, лише латиниця, цифри, _ або -");
        valid = false;
    }

    // --- Email ---
    if (!email) {
        showFieldError("regEmail", "regEmailError", "Поле обов'язкове для заповнення");
        valid = false;
    } else if (!isValidEmail(email)) {
        showFieldError("regEmail", "regEmailError", "Введіть коректний email (наприклад, name@mail.com)");
        valid = false;
    }

    // --- Телефон (необов'язково) ---
    if (phone && !isValidPhone(phone)) {
        showFieldError("regPhone", "regPhoneError", "Невірний формат. Використовуйте: +380XXXXXXXXX");
        valid = false;
    }

    // --- Пароль ---
    if (!pass) {
        showFieldError("regPass", "regPassError", "Поле обов'язкове для заповнення");
        valid = false;
    } else if (pass.length < 8) {
        showFieldError("regPass", "regPassError", "Пароль надто короткий — мінімум 8 символів");
        valid = false;
    } else if (!/[A-Z]/.test(pass)) {
        showFieldError("regPass", "regPassError", "Додайте хоча б одну велику літеру (A–Z)");
        valid = false;
    } else if (!/[0-9]/.test(pass)) {
        showFieldError("regPass", "regPassError", "Додайте хоча б одну цифру (0–9)");
        valid = false;
    }

    // --- Підтвердження пароля ---
    if (!passConfirm) {
        showFieldError("regPassConfirm", "regPassConfirmError", "Поле обов'язкове для заповнення");
        valid = false;
    } else if (pass !== passConfirm) {
        showFieldError("regPassConfirm", "regPassConfirmError", "Паролі не збігаються — перевірте введені дані");
        valid = false;
    }

    if (!valid) return;

    // Успішна реєстрація
    // Автоматично логінимо користувача після реєстрації
    currentUser = { login, email };
    updateAuthButton();
    registerForm.reset();

    // Скидаємо індикатор сили пароля
    document.getElementById("strengthFill").className  = "strength-fill";
    document.getElementById("strengthLabel").className = "strength-label";
    document.getElementById("strengthLabel").textContent = "";

    clearAllErrors();
    modal.classList.add("hidden");
    renderCart();
    showToast(`🎉 Реєстрація успішна! Ви увійшли як ${login}.`, "success");
});


// ====================== СТАН АВТОРИЗАЦІЇ ======================

/**
 * Оновлює кнопку у хедері залежно від стану входу
 */
function updateAuthButton() {
    const btn = document.getElementById("authBtn");
    if (!btn) return;

    if (currentUser) {
        btn.textContent = `👤 ${currentUser.login}`;
        btn.title = "Натисніть, щоб вийти";
        btn.onclick = logout;
    } else {
        btn.textContent = "Увійти";
        btn.title = "";
        btn.onclick = () => modal.classList.remove("hidden");
    }
}

function logout() {
    const name = currentUser?.login || "";
    currentUser = null;
    updateAuthButton();
    renderCart();
    showToast(`👋 До побачення, ${name}!`, "info");
}


// ====================== CHARTS ======================

function drawCharts() {
    const canvas = document.getElementById("chartCanvas");
    if (!canvas) return;

    const ctx       = canvas.getContext("2d");
    const chartType = document.getElementById("chartType").value;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let stats = {};
    if (cart.length === 0) { products.forEach(item => { stats[item.name] = 1; }); }
    else                   { cart.forEach(item => { stats[item.name] = item.qty; }); }

    const labels = Object.keys(stats);
    const values = Object.values(stats);

    if (labels.length === 0) { ctx.font = "20px Arial"; ctx.fillText("Немає даних", 220, 200); return; }

    if (chartType === "bar") {
        const max = Math.max(...values);
        labels.forEach((label, i) => {
            const value = values[i], barHeight = (value / max) * 250;
            const x = 70 + i * 130, y = 330 - barHeight;
            ctx.fillStyle = "#222"; ctx.fillRect(x, y, 70, barHeight);
            ctx.fillStyle = "#000"; ctx.font = "bold 16px Arial"; ctx.fillText(value, x + 25, y - 10);
            ctx.font = "12px Arial"; ctx.fillText(label, x - 10, 360);
        });
        ctx.font = "18px Arial"; ctx.fillText("Популярність товарів", 190, 30);
    }

    else if (chartType === "pie") {
        const total = values.reduce((a, b) => a + b, 0);
        const colors = ["#111", "#444", "#777", "#999", "#bbb"];
        let lastAngle = 0;
        labels.forEach((label, i) => {
            const value = values[i], angle = (value / total) * Math.PI * 2;
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath(); ctx.moveTo(300, 200); ctx.arc(300, 200, 130, lastAngle, lastAngle + angle); ctx.fill();
            const middle = lastAngle + angle / 2;
            const tx = 300 + Math.cos(middle) * 180, ty = 200 + Math.sin(middle) * 180;
            const percent = Math.round((value / total) * 100);
            ctx.fillStyle = "#000"; ctx.font = "13px Arial"; ctx.fillText(`${label} ${percent}%`, tx - 30, ty);
            lastAngle += angle;
        });
        ctx.font = "18px Arial"; ctx.fillText("Частка популярності", 200, 30);
    }

    else if (chartType === "line") {
        const max = Math.max(...values);
        ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = "#111";
        labels.forEach((label, i) => {
            const x = 80 + i * 150, y = 330 - (values[i] / max) * 220;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        ctx.stroke();
        labels.forEach((label, i) => {
            const value = values[i], x = 80 + i * 150, y = 330 - (value / max) * 220;
            ctx.beginPath(); ctx.fillStyle = "#222"; ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = "#000"; ctx.font = "14px Arial"; ctx.fillText(value, x - 5, y - 15);
            ctx.font = "12px Arial"; ctx.fillText(label, x - 25, 360);
        });
        ctx.font = "18px Arial"; ctx.fillText("Динаміка популярності", 190, 30);
    }
}

document.getElementById("chartType")?.addEventListener("change", drawCharts);


// ====================== EVENTS ======================

document.getElementById("searchInput")?.addEventListener("input", applyFilters);
document.getElementById("sortSelect")?.addEventListener("change", applyFilters);
document.getElementById("applyFiltersBtn")?.addEventListener("click", applyFilters);


// ====================== INIT ======================

renderProducts(products);
renderNews();
renderCart();
drawCharts();
updateAuthButton();

console.log("PhoneHub успішно завантажено!");