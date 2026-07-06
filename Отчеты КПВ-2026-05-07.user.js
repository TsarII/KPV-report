// ==UserScript==
// @name         KPV-report
// @namespace    http://tampermonkey.net/
// @author       Цари / Ритуал [1241910]
// @version      2.7
// @description  Автоматическое заполнение отчётов
// @match        https://*.catwar.su/blog*
// @match        https://*.catwar.net/blog*
// @updateURL    https://raw.githubusercontent.com/TsarII/KPV-report/main/Отчеты%20КПВ-2026-05-07.user.js
// @downloadURL  https://raw.githubusercontent.com/TsarII/KPV-report/main/Отчеты%20КПВ-2026-05-07.user.js
// @grant        none
// ==/UserScript==

(function () {

'use strict';

const $ = window.jQuery;

const pageurl = window.location.href;

const isBlog =
    /^https:\/\/\w*\.?catwar\.(su|net)\/blog\d+/.test(pageurl);

if (!isBlog) return;



/* =========================
   ЗАВИСИМОСТИ
========================= */

function leadZero(num) {
    return (num < 10) ? '0' + num : num;
}

function masking(id, mask) {
    return mask
        .replace(/%ID%/g, id)
        .replace(/\[cat%ID%\]/g, `[cat${id}]`);
}

function splitDateStr(datestr) {

    if (!datestr) return false;

    let dt = {};
    let arr = datestr.split('-');

    dt.shortYear = arr[0].substring(2);
    dt.year = arr[0];
    dt.month = arr[1];
    dt.day = arr[2];

    return dt;
}

function strToArr(str, delimiter = ',') {

    const a =
        str.replace(/\n/g, delimiter)
        .trim()
        .split(delimiter);

    return (a.length == 1 && a[0] == '')
        ? []
        : a.map(v => v.trim());
}

function rememberMyID(id) {
    if ($('#kpo_blog_remember_id').prop('checked')) {
        localStorage.setItem('cw_my_id', id);
    }
}

    function rememberMyZU(id) {

    if ($('#kpo_blog_remember_zu').is(':checked')) {

        localStorage.setItem(
            'cw_my_zu',
            id
        );
    }
}

     //**ДЛЯ БЛОГА НАГРАД**//
const rewards = [
    // =======================
    // Медали
    // =======================
    { type: "medal", id: "839", name: "Азартный игрок", img: "https://catwar.net/medal/839.png" },
    { type: "medal", id: "161", name: "Активный патрульный", img: "https://catwar.net/medal/161.png" },
    { type: "medal", id: "162", name: "Альтруистичный травник", img: "https://catwar.net/medal/162.png" },
    { type: "medal", id: "664", name: "Вдохновленный творец", img: "https://catwar.net/medal/664.png" },
    { type: "medal", id: "5027", name: "Вдохновляющий пример", img: "https://catwar.net/medal/5027.png" },
    { type: "medal", id: "2656", name: "Вор мха", img: "https://catwar.net/medal/2656.png" },
    { type: "medal", id: "2655", name: "Вор паутины", img: "https://catwar.net/medal/2655.png" },
    { type: "medal", id: "665", name: "Гордость небосвода", img: "https://catwar.net/medal/665.png" },
    { type: "medal", id: "167", name: "Грозный ловец нарушителей", img: "https://catwar.net/medal/167.png" },
    { type: "medal", id: "168", name: "Доверенный наставник", img: "https://catwar.net/medal/168.png" },
    { type: "medal", id: "663", name: "За особые заслуги перед кланом Падающей Воды", img: "https://catwar.net/medal/663.png" },
    { type: "medal", id: "932", name: "Зачинщик веселья", img: "https://catwar.net/medal/932.png" },
    { type: "medal", id: "166", name: "Зоркий следящий", img: "https://catwar.net/medal/166.png" },
    { type: "medal", id: "2762", name: "Искусный боец", img: "https://catwar.net/medal/2762.png" },
    { type: "medal", id: "157", name: "Искусный игровик", img: "https://catwar.net/medal/157.png" },
    { type: "medal", id: "160", name: "Ловкий охотник", img: "https://catwar.net/medal/160.png" },
    { type: "medal", id: "1020", name: "Лучший лектор", img: "https://catwar.net/medal/1020.png" },
    { type: "medal", id: "155", name: "Малыш-отличник", img: "https://catwar.net/medal/155.png" },
    { type: "medal", id: "154", name: "Малыш-ударник", img: "https://catwar.net/medal/154.png" },
    { type: "medal", id: "422", name: "Неунывающий затейник", img: "https://catwar.net/medal/422.png" },
    { type: "medal", id: "668", name: "Неутомимый ловец", img: "https://catwar.net/medal/668.png" },
    { type: "medal", id: "2780", name: "Никто не в силах разделить нас, пока свет указывает путь", img: "https://catwar.net/medal/2780.png" },
    { type: "medal", id: "251", name: "Опытный пловец", img: "https://catwar.net/medal/251.png" },
    { type: "medal", id: "252", name: "Отважный воин", img: "https://catwar.net/medal/252.png" },
    { type: "medal", id: "2878", name: "Ответственный за свое дело", img: "https://catwar.net/medal/2878.png" },
    { type: "medal", id: "666", name: "Ответственный звездочёт", img: "https://catwar.net/medal/666.png" },
    { type: "medal", id: "3350", name: "Прыткий скалолаз", img: "https://catwar.net/medal/3350.png" },
    { type: "medal", id: "667", name: "Рьяный дежурный", img: "https://catwar.net/medal/667.png" },
    { type: "medal", id: "164", name: "Смелый искатель", img: "https://catwar.net/medal/164.png" },
    { type: "medal", id: "3483", name: "Смелый путеводитель", img: "https://catwar.net/medal/3483.png" },
    { type: "medal", id: "894", name: "Смышлёный боец", img: "https://catwar.net/medal/894.png" },
    { type: "medal", id: "2644", name: "Стойкий экзаменатор", img: "https://catwar.net/medal/2644.png" },
    { type: "medal", id: "163", name: "Трудолюбивый чистильщик", img: "https://catwar.net/medal/163.png" },
    { type: "medal", id: "280", name: "Умелый воспитатель", img: "https://catwar.net/medal/280.png" },
    { type: "medal", id: "178", name: "Усердный тренер", img: "https://catwar.net/medal/178.png" },
    { type: "medal", id: "1097", name: "Хранитель клана", img: "https://catwar.net/medal/1097.png" },

    // =======================
    // Предметы
    // =======================
    { type: "item", name: "Властелин всех двух стихий" },
    { type: "item", name: "Отколовшаяся сосулька" },
    { type: "item", name: "Окроплённое перо" },
    { type: "item", name: "Льдинка с отпечатком лапы" },
    { type: "item", name: "Визитка" },
    { type: "item", name: "Сверкающая чешуйка" },
    { type: "item", name: "Тот, кто держал остриё" },
    { type: "item", name: "Разбитое зеркало" },
    { type: "item", name: "Ягодный след" },
    { type: "item", name: "Старый кулон" },
    { type: "item", name: "Маска" },
    { type: "item", name: "Меч и курочка" },
    { type: "item", name: "Тлеющий уголёк" },
    { type: "item", name: "Деревянный солдатик" },
    { type: "item", name: "Хранитель Очага" },
    { type: "item", name: "Окаменелое гнездо" },
    { type: "item", name: "Подарок" },
    { type: "item", name: "Конверт" },
    { type: "item", name: "Падение" },
    { type: "item", name: "Гнилое яблочко" },
    { type: "item", name: "Тьма багрового прошлого" },
    { type: "item", name: "История о принце" },
    { type: "item", name: "Цилиндр Щелкунчика" },
    { type: "item", name: "Та, кто держала остриё" },
    { type: "item", name: "В чём смысл жизни?" },
    { type: "item", name: "Вестник новостей" },
    { type: "item", name: "Спаситель от жажды" },
    { type: "item", name: "Всезнайка" },
    { type: "item", name: "Резное перышко" },
    { type: "item", name: "Чудной камушек" },
    { type: "item", name: "Меховый друг" },
    { type: "item", name: "Командный дух!" },
    { type: "item", name: "Воспоминания о работе" },
    { type: "item", name: "Перо сойки" },
    { type: "item", name: "Расколотый молнией" },
    { type: "item", name: "Замёрзший клочок меха" },
    { type: "item", name: "Свинка-копилка" },
    { type: "item", name: "Странная рыба" },
    { type: "item", name: "Клыки стихии" },
    { type: "item", name: "Пылающее перо" },
    { type: "item", name: "Ледяной череп" },
    { type: "item", name: "Искатель приключений" },
    { type: "item", name: "Всё ещё ребенок" },
    { type: "item", name: "Истинный лидер" },
    { type: "item", name: "Знающий себя" },
    { type: "item", name: "Создатель чудес" },
    { type: "item", name: "Окрылённый страхом" },
    { type: "item", name: "Бесстрашный туннелер" },
    { type: "item", name: "Горьковато-пряный корень" },
    { type: "item", name: "Чудной трофей" },
    { type: "item", name: "Прошедший через пекло" },
    { type: "item", name: "Я люблю скалы!" },
    { type: "item", name: "Орлиный глаз" },
    { type: "item", name: "Точно-Не-Речной" },
    { type: "item", name: "Ах, жизнь моя жестянка!" },
    { type: "item", name: "Паучий враг" },
    { type: "item", name: "Вдохновитель юных" },
    { type: "item", name: "После стольких лун" },
    { type: "item", name: "Бросивший вызов Духам" },
    { type: "item", name: "Первый учитель" },
    { type: "item", name: "Подарок вод" },
    { type: "item", name: "Хранитель очага" },
    { type: "item", name: "Благодетель" },
    { type: "item", name: "Не чувствующий лап" },
    { type: "item", name: "Тишину, пожалуйста!" },
    { type: "item", name: "Где моя зарплата?" },
    { type: "item", name: "Сладко естся, плохо спится" },
    { type: "item", name: "Что такое сон?" }
];

    function fillRewardList(){

    const list = $("#reward_list");

    list.empty();

    rewards
        .sort((a,b)=>a.name.localeCompare(b.name,'ru'))
        .forEach(r=>{

            list.append(
                `<option value="${r.name}">`
            );

        });

}

function getHiddenRewards() {
    return JSON.parse(
        localStorage.getItem("kpo_hidden_rewards") || "[]"
    );
}

function saveHiddenRewards(arr) {
    localStorage.setItem(
        "kpo_hidden_rewards",
        JSON.stringify(arr)
    );
}

async function renderRewards() {

    const medals = $("#reward_medals");
    const items = $("#reward_items");

    medals.empty();
    items.empty();

    const hidden = JSON.parse(
        localStorage.getItem("kpo_hidden_rewards") || "[]"
    );

    const hideSelected = $("#reward_hide_selected").prop("checked");

    rewards.forEach(r => {

        const key = r.type === "medal"
            ? String(r.id)
            : r.name;

        const isHidden = hidden.includes(key);

        if (hideSelected && isHidden) {
            return;
        }

        const img = r.img
            ? `<img src="${r.img}">`
            : `<div style="width:72px;height:72px;"></div>`;

        const row = $(`
<div class="reward-row"
     data-type="${r.type}"
     data-id="${r.id || ""}"
     data-name="${r.name}">

    ${img}

    <div class="reward-name">${r.name}</div>

    <button class="reward-toggle" type="button">
        ${isHidden ? "Вернуть" : "Скрыть"}
    </button>

</div>
`);

        if (r.type === "medal") {
    medals.append(row);
} else {
    items.append(row);
}
    });

}


function countCleanCats(history) {
    if (!history || typeof history !== "string") return 0;

    let total = 0;

    // ===== 1. ГРУППОВОЙ ФОРМАТ =====
    const groupMatches = history.matchAll(/Проверен и поднят\s*\[(.*?)\]/gs);

    for (const match of groupMatches) {
        const inside = match[1];

        // разделяем только по запятой
        const items = inside
            .split(",")
            .map(x => x.trim())
            .filter(Boolean);

        total += items.length;
    }

    // ===== 2. ОДИНОЧНЫЕ ПОДЪЁМЫ =====
    const singleMatches = history.matchAll(
        /Поднял(?:а|о|и)?\s+[^.]*?по имени\s+([^(.\n]+)/g
    );

    for (const match of singleMatches) {
        const name = match[1]?.trim();
        if (name) total += 1;
    }

    return total;
}

function nameToID(name, async = false) {

    let result = name;

    $.ajax({
        type: "POST",
        url: "/ajax/top_cat",
        data: {name},
        async,
        success: function (data) {

            const id =
                parseInt(data, 10);

            result =
                (isNaN(id))
                ? name
                : id;
        }
    });

    return result;
}

if (window.location.href.includes("/settings")) {



    const html = `
    <div id="kpo_color_editor" style="margin-top:20px;padding:10px;border:1px solid #fff;border-radius:10px;">
        <h3>🎨 Цвета дежурств</h3>

        <label>Фон блока:</label><br>
        <input type="color" id="kpo_bg" value="#2b2b2b"><br><br>

        <label>Кнопки:</label><br>
        <input type="color" id="kpo_btn" value="#34576D"><br><br>

        <label>Рамка:</label><br>
        <input type="color" id="kpo_border" value="#ffffff"><br><br>

        <button id="kpo_save_colors" class="inp-button">Сохранить</button>
    </div>
    `;

    $('body').append(html);

    // загрузка сохранённых
    const saved = JSON.parse(localStorage.getItem("kpo_colors") || "{}");

    if (saved.bg) $("#kpo_bg").val(saved.bg);
    if (saved.btn) $("#kpo_btn").val(saved.btn);
    if (saved.border) $("#kpo_border").val(saved.border);

    // сохранение
    $(document).on("click", "#kpo_save_colors", function () {
        const colors = {
            bg: $("#kpo_bg").val(),
            btn: $("#kpo_btn").val(),
            border: $("#kpo_border").val()
        };

        localStorage.setItem("kpo_colors", JSON.stringify(colors));
        alert("Цвета сохранены!");
    });
}

/* =========================
   ОСНОВНОЙ КОД
========================= */

function blog() {

    const colors = JSON.parse(localStorage.getItem("kpo_colors") || "{}");

const UI = {
    bg: colors.bg || "#2b2b2b",
    btn: colors.btn || "#34576D",
    border: colors.border || "#ffffff"
};
    //ДИЗАЙН//
  const style = `
/* ===== БЛОК ===== */
#send_comment .kpo_doz_wrapper {
    background: #98ACB8;
    border: 1px solid #ffffff;
    border-radius: 12px;
    padding: 15px;
    margin-top: 10px;
}

/* Цвет текста во всём блоке */
#send_comment .kpo_doz_wrapper,
#send_comment .kpo_doz_wrapper *,
#send_comment .kpo_doz_wrapper label,
#send_comment .kpo_doz_wrapper span,
#send_comment .kpo_doz_wrapper div,
#send_comment .kpo_doz_wrapper td,
#send_comment .kpo_doz_wrapper h3,
#send_comment .kpo_doz_wrapper b {
    color: #000 !important;
}

.kpo_tabs_caption {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex; 
}

.kpo_tabs_caption li {
    list-style: none;
}

#send_comment .kpo_tabs_caption li,
#send_comment .kpo_tabs_caption li:hover,
#send_comment .kpo_tabs_caption li.active {
    color: #fff !important;
}

.kpo-input {
    padding: 4px 6px;
    border-radius: 8px;
    border: 1px solid rgba(255,255,255,.2);
}

/* ===== КНОПКИ ВНУТРИ БЛОКА ===== */
#send_comment .kpo_doz_wrapper button.inp-button,
#send_comment .kpo_doz_wrapper #kpv_check_doz,
#send_comment .kpo_doz_wrapper #kpv_doz1,
#send_comment .kpo_doz_wrapper #kpv_doz2 {
    background: #34576D;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
    transition: 0.2s;
}

#send_comment .kpo_doz_wrapper input,
#send_comment .kpo_doz_wrapper textarea,
#send_comment .kpo_doz_wrapper select {
    color: #fff !important;
}


#send_comment .kpo_doz_wrapper button,
#send_comment .kpo_doz_wrapper button * {
    color: #fff !important;
}

#send_comment .kpo_tabs_caption li {
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
}

/* активная вкладка */
#send_comment .kpo_tabs_caption li.active {
    border-radius: 10px;
}
#send_comment .kpo_tabs_caption {
    display: flex;
    gap: 6px;
}

#send_comment .kpo_tabs_caption li {
    background: #34576D;
    color: #fff;
    transition: 0.2s;
}

#send_comment .kpo_tabs_caption li:hover {
    background: #537890;
}

#send_comment .kpo_tabs_caption li.active {
    background: #537890;
}
/* hover эффект */
#send_comment .kpo_doz_wrapper button.inp-button:hover,
#send_comment .kpo_doz_wrapper #kpv_check_doz:hover,
#send_comment .kpo_doz_wrapper #kpv_doz1:hover,
#send_comment .kpo_doz_wrapper #kpv_doz2:hover {
    background: #537890;
}

/* фокус */
#send_comment .kpo_doz_wrapper button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
}
/* ===== ПОДПИСИ ПОЛЕЙ ===== */
#send_comment .kpo_doz_wrapper table td:first-child {
    color: #000000;
    font-weight: 500;
    padding-right: 10px;
    white-space: nowrap;
}

/* ===== ПОЛЯ ВНУТРИ БЛОКА ===== */
#send_comment .kpo_doz_wrapper input,
#send_comment .kpo_doz_wrapper select,
#send_comment .kpo_doz_wrapper textarea {
    background: #34576D;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 4px 6px;
}

/* placeholder */
#send_comment .kpo_doz_wrapper input::placeholder,
#send_comment .kpo_doz_wrapper textarea::placeholder {
    color: rgba(255,255,255,0.6);
}

/* фокус */
#send_comment .kpo_doz_wrapper input:focus,
#send_comment .kpo_doz_wrapper select:focus,
#send_comment .kpo_doz_wrapper textarea:focus {
    outline: none;
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.15);
}
.kpv_res_row {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    gap: 8px;
}

.kpv_res_row span {
    display: inline-block;
    width: 150px; /* одинаковая ширина текста */
}

.kpv_res_row input {
    width: 60px;
}`;

$('<style>').text(style).appendTo('head');
$('<style>').text(style).appendTo('head');
    const blogID =
        +pageurl.match(/blog(\d+)/)[1];

    let date = new Date(
    new Date().toLocaleString("en-US", {
        timeZone: "Europe/Moscow"
    })
);

    const date_str =
        date.getFullYear() + '-' +
        leadZero(date.getMonth() + 1) + '-' +
        leadZero(date.getDate());

const my_id_div = `
<div>
    Ваш ID:
    <input type="number" class="kpo-input" id="kpo_blog_myid">
    <label>
        <input type="checkbox" id="kpo_blog_remember_id">
        запомнить
    </label>
</div>`;

const my_id_zu_div = `
<div>
    Ваш ID:
    <input type="number" class="kpo-input" id="kpo_blog_myid">
    <label>
        <input type="checkbox" id="kpo_blog_remember_id">
        запомнить
    </label>
    <br><br>
</div>`;

if (blogID == 57858) {

    const savedZU = localStorage.getItem('cw_my_zu');

    if (savedZU) {
        $('#kpo_blog_myzu').val(savedZU);
        $('#kpo_blog_remember_zu').prop('checked', true);
    }

    $(document).on('change', '#kpo_blog_remember_zu', function () {
        if (this.checked) {
            localStorage.setItem('cw_my_zu', $('#kpo_blog_myzu').val());
        }
    });
}


        if (blogID == 338540) { // Дежурства
          let patr_time = 9,
            patr_date = new Date(date),
            doz_date = new Date(date);
         const moscow = new Date(
    new Date().toLocaleString("en-US", {
        timeZone: "Europe/Moscow"
    })
);

let hour = moscow.getHours(),
    minute = moscow.getMinutes();

date = moscow;
          let doz_time = leadZero(hour) + ':' + leadZero(minute);
         
          const doz_options = `<option value="Водопад">Водопад</option>
<option value="Горный перевал">Горный перевал</option>
<option value="Обрушенная вершина">Обрушенная вершина</option>
<option value="Плато диких ветров">Плато диких ветров</option>
<option value="1 маршрут">1 маршрут</option>
<option value="2 маршрут">2 маршрут</option>
<option value="3 маршрут">3 маршрут</option>
<option value="4 маршрут">4 маршрут</option>`;
        $('#send_comment').append(`
<div class="kpo_doz_wrapper">
<hr>
<b>Смотрим дежурящих</b><br><br>
<button class="inp-button" id="kpv_check_doz">Проверить, кто сейчас дежурит</button>
<p id="kpv_checked_doz">Пока что кнопочку не нажимали...</p>
<hr>
<h3>Автоматическое заполнение отчётов</h3>
<hr>
${my_id_div}
<hr>
<div class="kpo_tabs">
  <ul class="kpo_tabs_caption">
    <li class="active">Начало дежурства</li>
    <li>Конец дежурства</li>
  </ul>

  <div id="kpv_doz_block" class="kpo_tabs_content active">
    <p class="view-title">Начало дежурства</p>
    <table>
        <tr><td>Дата начала:</td><td><input type="date" class="kpo-input" id="kpv_doz1_date" required value="${date_str}"></td></tr>
        <tr><td>Время начала:</td><td><input type="time" class="kpo-input" id="kpv_doz1_time" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Место дежурства:</td><td><select id="kpv_doz1_place">${doz_options}</select></td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz1">Заполнить отчет</button>
  </div>

  <div id="kpv_doz_block" class="kpo_tabs_content" style="display:none;">
    <p class="view-title">Конец дежурства</p>
    <table>
        <tr><td>Дата начала:</td><td><input type="date" class="kpo-input" id="kpv_doz2_date" required value="${date_str}"></td></tr>
        <tr><td>Время начала:</td><td><input type="time" class="kpo-input" id="kpv_doz2_time" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Дата конца:</td><td><input type="date" class="kpo-input" id="kpv_doz2_date_end" required value="${date_str}"></td></tr>
        <tr><td>Время конца:</td><td><input type="time" class="kpo-input" id="kpv_doz2_time_end" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Место дежурства:</td><td><select id="kpv_doz2_place">${doz_options}</select></td><td></td></tr>
        <tr><td>Пойманные нарушители:
        <textarea style="width:95%;resize:none;" class="kpo-input" id="kpo_patr_members" placeholder="[имя|ID], принадлежность.
При отстуствии оставьте поле пустым."></textarea>
    </td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz2">Заполнить отчет</button>
  </div>`);

            $(document).on(
    'input change',
    '#kpo_blog_myid, #kpo_blog_remember_id',
    function () {

        if ($('#kpo_blog_remember_id').prop('checked')) {
            localStorage.setItem(
                'cw_my_id',
                $('#kpo_blog_myid').val().trim()
            );
        } else {
            localStorage.removeItem('cw_my_id');
        }
    }
);

            const savedID =
    localStorage.getItem('cw_my_id');

if (savedID) {

    $('#kpo_blog_myid').val(savedID);
$('#kpo_blog_remember_id').prop('checked', true);

}

$(document).on('click', '.kpo_tabs_caption li', function () {
    const $tabs = $(this).closest('.kpo_tabs');

    $(this)
        .addClass('active')
        .siblings()
        .removeClass('active');

    $tabs.find('.kpo_tabs_content')
        .removeClass('active')
        .hide()
        .eq($(this).index())
        .addClass('active')
        .show();
});

                $(document).on('click', '#kpv_check_doz', function() {

    const authors = {};

   $('.view-comment').each(function(index) {

    // Игнорируем первые 3 комментария
    if (index < 3) {
        return true;
    }

        const text = $(this).find('.comment-text .parsed').text().trim();

        const textLower = text.toLowerCase();


        // начало дежурства
        const isDozStart = textLower.includes('дежурит:');

        // конец дежурства
        const isDozEnd =
            textLower.includes('локация/маршрут:') ||
            textLower.includes('дата и время:');

        if (isDozStart) {

            const match = text.match(
                /(\d{1,2}\s+\S+,\s+\d{1,2}:\d{2})[\s\S]*?Дежурит:\s*\[([^\]]+)\]\s*[—-]\s*\[([^\]]+)\]/iu
            );

            if (match) {

                const date = match[1].trim();
                const cat = match[2].trim();
                const place = match[3].trim();

                authors[cat] = {
                    place,
                    date
                };
            }

        } else if (isDozEnd) {

            // снимаем дежурство
            const endMatch = text.match(/Дежурил:\s*\[([^\]|]+)/iu);

            if (endMatch) {
                const cat = endMatch[1].trim();
                authors[cat] = null;
            }
        }
    });

    const result = {};

    for (let [cat, data] of Object.entries(authors)) {

        if (data === null) continue;

        const place = data.place.toLowerCase();

        if (!result[place]) {
            result[place] = [];
        }

        result[place].push({
            cat,
            date: data.date
        });
    }

    for (const value in result) {

        result[value] = result[value]
            .map(({cat, date}) => `${cat} (с ${date})`)
            .join(', ');
    }

    const places = [
        'Водопад',
        'Горный перевал',
        'Обрушенная вершина',
        'Плато диких ветров',
        '1 маршрут',
        '2 маршрут',
        '3 маршрут',
        '4 маршрут'
    ];

    let text = '';

    for (const place of places) {

        const placeLower = place.toLowerCase();

        if (result[placeLower]) {

            if (text) {
                text += '<br>';
            }

            text += place + ' - ' + result[placeLower];
        }
    }

    if (!text) {
        text = 'Никто не дежурит!';
    }

    $('#kpv_checked_doz').html(text);
});
          $('#kpv_doz1_place, #kpv_doz2_place').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_place > option[value="${val}"`).prop('selected', true);
          });
          $('#kpv_doz1_time, #kpv_doz2_time').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_time`).val(val);
          });
          $('#kpv_doz1_date, #kpv_doz2_date').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_date`).val(val);
          });
            /*НАЧАЛО ДЕЖУРСТВА*/
          $('#kpv_doz1').on('click', function (e) {
              //МЕСЯЦЫ//
const months = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря"
];

             const my_id = parseInt($('#kpo_blog_myid').val());
              rememberMyID(my_id);
              let date = splitDateStr($("#kpv_doz1_date").val());
             let day = parseInt(date.day, 10);
let monthName = months[parseInt(date.month, 10) - 1];

let text = `[b]${day} ${monthName}, ` + $("#kpv_doz1_time").val() + `.[/b]`;
              text += `\n[b]Дежурит:[/b] ${masking(my_id, '[[cat%ID%]]')} — [` + $("#kpv_doz1_place").val() + `].`;
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
           $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
          });
               /*КОНЕЦ ДЕЖУРСТВА*/
          $('#kpv_doz2').on('click', function (e) {
                      //ВРЕМЯ//
              let startDateStr = $("#kpv_doz1_date").val();
let endDateStr = $("#kpv_doz2_date_end").val();

let startTime = $("#kpv_doz1_time").val();
let endTime = $("#kpv_doz2_time_end").val();

function toDate(str, time) {
    let [y, m, d] = str.split('-').map(Number);
    let [h, min] = time.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
}

let startDate = toDate(startDateStr, startTime);
let endDate = toDate(endDateStr, endTime);

let diffHours = (endDate - startDate) / 3600000;
diffHours = Math.round(diffHours * 2) / 2;

if (isNaN(diffHours)) diffHours = 0;
              const my_id = parseInt($('#kpo_blog_myid').val());
              rememberMyID(my_id);
              let date = splitDateStr($("#kpv_doz1_date").val());
              let date2 = splitDateStr($("#kpv_doz2_date_end").val());
              let text = `[b]Дата и время:[/b] ${date2.day}.${date2.month}.${date2.year}, ` + $("#kpv_doz2_time").val() + `-` + $("#kpv_doz2_time_end").val() +`.`
              text += `\n[b]Количество проведённых в дежурстве часов:[/b] ${diffHours}.`;
              text += `\n[b]Дежурил:[/b] ${masking(my_id, '[[cat%ID%]|%ID%]')}.`;
              text += `\n[b]Локация/маршрут:[/b] ` + $("#kpv_doz2_place").val() + `.`;
              const narText = $('#kpo_patr_members').val().trim();

text += `\n[b]Пойманные нарушители:[/b] ${narText ? narText : 'отсутствуют'}.`;
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
            $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
              });
          $('#kpv_doz_nar').on('click', function (e) {
            let date = splitDateStr($("#kpv_doz_nar_date").val()),
              hr = parseInt($("#kpv_doz_nar_time").val().split(":")[0]),
              next_hr = (hr == 23) ? 0 : hr + 1,
              txt = '[u][b]Дозор[/b][/u]\n[b]Дата:[/b] ' + date.day + '.' + date.month + ';\n[b]Время:[/b] ' + leadZero(hr) + ':00-' + leadZero(next_hr) + ':00';
            let free_arr = [],
              nar_arr = [];
            $('.kpv-doz-nar-free-wrap').each(function () {
              let free = $(this).find($('input.kpv-doz-nar-free')).val();
              if (free) {
                let insideMatch = free.match(/\(.*\)/);
                let postfix = insideMatch ? ' ' + insideMatch[0].trim() : "";
                free = free.replace(/\(.*\)/, "").trim();
                if (isNaN(parseInt(free))) {
                  free = nameToID(free.trim());
                }
                free = masking(free, '[cat%ID%] [%ID%]');
                free_arr.push(free + postfix);
              }
            });
            $('.kpv-doz-nar-wrap').each(function () {
              let name = $(this).find($('input.kpv-doz-nar-narname')).val(),
                reason = $(this).find($('select.kpv-doz-nar-narreas')).val();
              if (name) {
                let insideMatch = name.match(/\(.*\)/);
                let postfix = insideMatch ? ' ' + insideMatch[0].trim() : "";
                name = name.replace(/\(.*\)/, "").trim();
                if (isNaN(parseInt(name))) {
                  name = nameToID(name.trim());
                }
                name = masking(name, '[cat%ID%] [%ID%]');
                nar_arr.push(name + postfix + ' (' + reason + ')');
              }
            });
            if (free_arr.length) {
              txt += ';\n[b]Освобождены:[/b] ' + free_arr.join(', ');
            }
            if (nar_arr.length) {
              txt += ';\n[b]Нарушения:[/b] ' + nar_arr.join(', ');
            }
            txt += '.';
            let val = $('#comment').val();
            if (val) {
              val += "\n\n";
            }
            $('#comment').val(val + txt).scrollintoview();
            // $("#comment").scrollintoview();
          });
          $('#kpv_doz_nar_block').on('click', '.add-field', function (e) {
            let max_children = 5;
            let data_id = $(this).data('id'),
              template = $('#' + data_id)[0];
            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            if ($fields.length < max_children) {
              let clone = document.importNode(template.content, true);
              let add = $(clone).insertAfter(last_e);
              $(last_e).find($('.add-field')).css('display', 'none');
            }
          });
          $('#kpv_doz_nar_block').on('click', '.del-field', function (e) {
            let data_id = $(this).data('id');
            $(this).closest($('.' + data_id)).remove();

            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            $(last_e).find($('.add-field')).css('display', 'inline-block');
          });
        }

          if (blogID == 57858) { // Плавалки
          let patr_time = 9,
            patr_date = new Date(date),
            doz_date = new Date(date);
         const moscow = new Date(
    new Date().toLocaleString("en-US", {
        timeZone: "Europe/Moscow"
    })
);

let hour = moscow.getHours(),
    minute = moscow.getMinutes();

date = moscow;
          let doz_time = leadZero(hour) + ':' + leadZero(minute);

        $('#send_comment').append(`
<div class="kpo_doz_wrapper">
<hr>
<h3>Автоматическое заполнение отчётов</h3>
<hr>
${my_id_zu_div}
<hr>
<div class="kpo_tabs">
  <ul class="kpo_tabs_caption">
    <li class="active">Плавательный заплыв</li>
    <li>Ресурс со дна</li>
  </ul>

  <div id="kpv_doz_block" class="kpo_tabs_content active">
    <p class="view-title">Плавательный заплыв</p>
    <table>
        <tr><td>Дата и время:</td><td><input type="date" class="kpo-input" id="kpv_doz1_date" required value="${date_str}"></td><td><input type="time" class="kpo-input" id="kpv_doz1_time" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr>
    <td>Страховал:</td>
    <td>
        <input type="number"
               class="kpo-input"
               id="kpv_swim_guard"
               placeholder="ID ДН">
    </td>
    <td></td>
    <td></td>
</tr>
       <tr>
    <td>Плавание организовал:</td>

    <td>
        <input type="number"
               class="kpo-input"
               id="kpv_swim_org"
               placeholder="ID организатора">
    </td>

    <td>
        <input type="number"
               class="kpo-input"
               id="kpv_swim_org_zu"
               placeholder="ЗУ"
               min="7"
               max="9"
               style="width:60px;">
    </td>

    <td style="white-space:nowrap;">
        <label>
            <input type="checkbox" id="kpv_remember_swim_org">
            Запомнить
        </label>
    </td>
</tr>
        <tr><td>Участники заплыва:</td><td><textarea class="kpo-input" id="kpv_swim_members"
                  placeholder="ID участников через запятую: 123,456,789. ЗУ указывается рядом через пробел."></textarea></td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz1">Заполнить отчет</button>
  </div>

  <div id="kpv_doz_block" class="kpo_tabs_content" style="display:none;">
    <p class="view-title">Ресурс со дна</p>
    <table>

<tr>
    <td>Количество и вид:</td>
    <td>
<div class="kpv_res_row">
    <span>Ракушка:</span>
    <input type="number" class="kpo-input" id="res_shell" value="0" min="0">
</div>

<div class="kpv_res_row">
    <span>Крепкая ветка:</span>
    <input type="number" class="kpo-input" id="res_branch" value="0" min="0">
</div>

<div class="kpv_res_row">
    <span>Мох:</span>
    <input type="number" class="kpo-input" id="res_moss" value="0" min="0">
</div>

<div class="kpv_res_row">
    <span>Плотная водоросль:</span>
    <input type="number" class="kpo-input" id="res_dense" value="0" min="0">
</div>

<div class="kpv_res_row">
    <span>Целебная водоросль:</span>
    <input type="number" class="kpo-input" id="res_heal" value="0" min="0">
</div>
    </td>
</tr>

<tr>
    <td>Уникальный ID:</td>
    <td>
        <input type="text"
               class="kpo-input"
               id="kpv_unique_id"
               placeholder="12345, 67890">
    </td>
</tr>

<tr>
    <td>Хочу сдать:</td>
    <td>
        <select id="kpv_swim_store" class="kpo-input">
            <option value="нет">Нет ракушек</option>
            <option value="в казну">В казну</option>
            <option value="в хранилище">В хранилище</option>
        </select>
    </td>
</tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz2">Заполнить отчет</button>
  </div>`);
    const savedOrg = localStorage.getItem('kpo_swim_org');
const savedOrgZU = localStorage.getItem('kpo_swim_org_zu');

if (savedOrg) {
    $('#kpv_swim_org').val(savedOrg);
    $('#kpv_remember_swim_org').prop('checked', true);
}

if (savedOrgZU) {
    $('#kpv_swim_org_zu').val(savedOrgZU);
}

              if ($('#kpv_remember_swim_org').is(':checked')) {
    localStorage.setItem('kpo_swim_org', $('#kpv_swim_org').val());
    localStorage.setItem('kpo_swim_org_zu', $('#kpv_swim_org_zu').val());
} else {
    localStorage.removeItem('kpo_swim_org');
    localStorage.removeItem('kpo_swim_org_zu');
}

            $(document).on(
    'input change',
    '#kpv_swim_org, #kpv_swim_org_zu, #kpv_remember_swim_org',
    function () {

        if ($('#kpv_remember_swim_org').prop('checked')) {

            localStorage.setItem(
                'kpo_swim_org',
                $('#kpv_swim_org').val().trim()
            );

            localStorage.setItem(
                'kpo_swim_org_zu',
                $('#kpv_swim_org_zu').val().trim()
            );

        } else {

            localStorage.removeItem('kpo_swim_org');
            localStorage.removeItem('kpo_swim_org_zu');
        }
    }
);

              $(document).on('click', '.kpo_tabs_caption li', function () {
    const $tabs = $(this).closest('.kpo_tabs');

    $(this)
        .addClass('active')
        .siblings()
        .removeClass('active');

    $tabs.find('.kpo_tabs_content')
        .removeClass('active')
        .hide()
        .eq($(this).index())
        .addClass('active')
        .show();
});

              $(document).on('input', '#kpv_swim_org', function () {
    localStorage.setItem(
        'kpo_swim_org',
        $(this).val().trim()
    );
});

$(document).on('input', '#kpv_swim_org_zu', function () {
    localStorage.setItem(
        'kpo_swim_org_zu',
        $(this).val().trim()
    );
});

              $('#kpv_swim_id').val(
    localStorage.getItem('cw_my_id') || ''
);
            const savedID =
    localStorage.getItem('cw_my_id');
    localStorage.getItem('cw_my_zu');
              // Организатор плавания
$('#kpv_swim_org').val(
    localStorage.getItem('kpo_swim_org') || ''
);

$('#kpv_swim_org_zu').val(
    localStorage.getItem('kpo_swim_org_zu') || ''
);

if (savedID) {

    $('#kpo_blog_myid').val(savedID);
$('#kpo_blog_remember_id').prop('checked', true);

}

                $(document).on('click', '#kpv_check_doz', function() {

    const authors = {};

   $('.view-comment').each(function(index) {

    // Игнорируем первые 3 комментария
    if (index < 3) {
        return true;
    }

        const text = $(this).find('.comment-text .parsed').text().trim();

        const textLower = text.toLowerCase();


        // начало дежурства
        const isDozStart = textLower.includes('дежурит:');

        // конец дежурства
        const isDozEnd =
            textLower.includes('локация/маршрут:') ||
            textLower.includes('дата и время:');

        if (isDozStart) {

            const match = text.match(
                /(\d{1,2}\s+\S+,\s+\d{1,2}:\d{2})[\s\S]*?Дежурит:\s*\[([^\]]+)\]\s*[—-]\s*\[([^\]]+)\]/iu
            );

            if (match) {

                const date = match[1].trim();
                const cat = match[2].trim();
                const place = match[3].trim();

                authors[cat] = {
                    place,
                    date
                };
            }

        } else if (isDozEnd) {

            // снимаем дежурство
            const endMatch = text.match(/Дежурил:\s*\[([^\]|]+)/iu);

            if (endMatch) {
                const cat = endMatch[1].trim();
                authors[cat] = null;
            }
        }
    });

    const result = {};

    for (let [cat, data] of Object.entries(authors)) {

        if (data === null) continue;

        const place = data.place.toLowerCase();

        if (!result[place]) {
            result[place] = [];
        }

        result[place].push({
            cat,
            date: data.date
        });
    }

    for (const value in result) {

        result[value] = result[value]
            .map(({cat, date}) => `${cat} (с ${date})`)
            .join(', ');
    }

    const places = [
        'Водопад',
        'Горный перевал',
        'Обрушенная вершина',
        'Плато диких ветров',
        '1 маршрут',
        '2 маршрут',
        '3 маршрут',
        '4 маршрут'
    ];

    let text = '';

    for (const place of places) {

        const placeLower = place.toLowerCase();

        if (result[placeLower]) {

            if (text) {
                text += '<br>';
            }

            text += place + ' - ' + result[placeLower];
        }
    }

    if (!text) {
        text = 'Никто не дежурит!';
    }

    $('#kpv_checked_doz').html(text);
});
          $('#kpv_doz1_place, #kpv_doz2_place').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_place > option[value="${val}"`).prop('selected', true);
          });
          $('#kpv_doz1_time, #kpv_doz2_time').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_time`).val(val);
          });
          $('#kpv_doz1_date, #kpv_doz2_date').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_date`).val(val);
          });
            /*ЗАПЛЫВ*/
          $('#kpv_doz1').on('click', function (e) {



              const my_id = parseInt($('#kpo_blog_myid').val());
              rememberMyID(my_id);


let date = splitDateStr($("#kpv_doz1_date").val());

let text = `[b]Дата и время:[/b] ${date.day}.${date.month}, ${$("#kpv_doz1_time").val()}`;
          const guardID = $('#kpv_swim_guard').val().trim();

if (guardID) {
    text += `\n[b]Страховал:[/b] ${masking(guardID, '[cat%ID%]|%ID%')}`;
}
             const orgID = $('#kpv_swim_org').val().trim();
const orgZU = parseInt($('#kpv_swim_org_zu').val());

if (orgID) {
    let orgText = masking(orgID, '[cat%ID%]|%ID%');

    if ([7, 8, 9].includes(orgZU)) {
        orgText += ` (${orgZU})`;
    }

    text += `\n[b]Плавание организовал:[/b] ${orgText}`;
}
 const members = $('#kpv_swim_members').val().trim();

if (members) {
    const membersText = members
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
        .map(item => {
            const parts = item.split(/\s+/);

            const id = parts[0];
            const zu = parseInt(parts[1]);

            let member = masking(id, '[cat%ID%]|%ID%');

            if ([7, 8, 9].includes(zu)) {
                member += ` (${zu})`;
            }

            return member;
        })
        .join(', ');

    text += `\n[b]Участники заплыва:[/b] ${membersText}`;
}
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
           $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
              });
          /*РЕСУРСЫ*/
$('#kpv_doz2').on('click', function (e) {

    const my_id = parseInt($('#kpo_blog_myid').val());
    rememberMyID(my_id);

    let text = `[b]ID:[/b] ${masking(my_id, '%ID%')}`;

    function declension(number, one, two, five) {
    number = Math.abs(number) % 100;
    const n1 = number % 10;

    if (number > 10 && number < 20) return five;
    if (n1 > 1 && n1 < 5) return two;
    if (n1 === 1) return one;

    return five;
}

    // Количество и вид
let resources = [];

[
    ['res_shell', 'ракушка', 'ракушки', 'ракушек'],
    ['res_branch', 'крепкая ветка', 'крепкие ветки', 'крепких веток'],
    ['res_moss', 'мох', 'мха', 'мха'],
    ['res_dense', 'плотная водоросль', 'плотные водоросли', 'плотных водорослей'],
    ['res_heal', 'целебная водоросль', 'целебные водоросли', 'целебных водорослей']
].forEach(([id, one, two, five]) => {
    const count = parseInt($('#' + id).val()) || 0;

    if (count > 0) {
        resources.push(
            `${count} ${declension(count, one, two, five)}`
        );
    }
});

    if (resources.length) {
        text += `\n[b]Количество и вид:[/b] ${resources.join(', ')}`;
    }

    // Уникальный ID
    const uniqueID = $('#kpv_unique_id').val().trim();

    if (uniqueID) {
        text += `\n[b]Уникальный ID:[/b] ${uniqueID}`;
    }

    // Хочу сдать
    const store = $('#kpv_swim_store').val();

    if (store !== 'нет') {
        text += `\n[b]Хочу сдать:[/b] ${store}`;
    }

    let val = $('#comment').val();

    if (val) {
        val += "\n\n";
    }

   $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
    });
          $('#kpv_doz_nar_block').on('click', '.add-field', function (e) {
            let max_children = 5;
            let data_id = $(this).data('id'),
              template = $('#' + data_id)[0];
            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            if ($fields.length < max_children) {
              let clone = document.importNode(template.content, true);
              let add = $(clone).insertAfter(last_e);
              $(last_e).find($('.add-field')).css('display', 'none');
            }
          });
          $('#kpv_doz_nar_block').on('click', '.del-field', function (e) {
            let data_id = $(this).data('id');
            $(this).closest($('.' + data_id)).remove();

            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            $(last_e).find($('.add-field')).css('display', 'inline-block');
          });
        }

             if (blogID == 22401) { // Чистка
          let patr_time = 9,
            patr_date = new Date(date),
            doz_date = new Date(date);
          const moscow = new Date(
    new Date().toLocaleString("en-US", {
        timeZone: "Europe/Moscow"
    })
);

let hour = moscow.getHours(),
    minute = moscow.getMinutes();

date = moscow;
          let doz_time = leadZero(hour) + ':' + leadZero(minute);
          if (hour < 8 || hour == 8 && minute < 55) {
            patr_date.setDate(patr_date.getDate() - 1);
          } // yesterday
          if (hour >= 9 || hour == 8 && minute >= 55) {
            patr_time = 9;
          }
          if (hour >= 11 || hour == 10 && minute >= 55) {
            patr_time = 11;
          }
          if (hour >= 15 || hour == 14 && minute >= 55) {
            patr_time = 15;
          }
          if (hour >= 18 || hour == 17 && minute >= 55) {
            patr_time = 18;
          }
          if (hour >= 21 || hour == 20 && minute >= 55) {
            patr_time = 21;
          }
          if (hour >= 23 || hour == 22 && minute >= 55) {
            patr_time = 23;
          }
          patr_time = leadZero(patr_time);
          const patr_date_str = patr_date.getFullYear() + '-' + leadZero(patr_date.getMonth() + 1) + '-' + leadZero(patr_date.getDate());
          const doz_options = `<option value="Водопад">Водопад</option>
<option value="Горный перевал">Горный перевал</option>
<option value="Обрушенная вершина">Обрушенная вершина</option>
<option value="Плато диких ветров">Плато диких ветров</option>
<option value="1 маршрут">1 маршрут</option>
<option value="2 маршрут">2 маршрут</option>
<option value="3 маршрут">3 маршрут</option>
<option value="4 маршрут">4 маршрут</option>`;
$('#send_comment').append(`
<hr>
<div class="kpo_doz_wrapper">
<h3>Чистка</h3>
<hr>

${my_id_zu_div}
<hr>

<table>

<tr>
    <td>Игроки в боевой стойке:</td>
    <td>
        <input type="number"
               class="kpo-input"
               id="kpv_fight_players"
               placeholder="Количество игроков">
    </td>
</tr>

<tr>
    <td>История:</td>
    <td>
        <textarea class="kpo-input"
                  id="kpv_clean_history"
                  placeholder="Вставьте текст истории..."></textarea>
    </td>
</tr>

</table>

<div style="margin-top:10px;">
    <button class="inp-button" id="kpv_clean_send">
        Заполнить отчет
    </button>
</div>
`);
    const savedOrg = localStorage.getItem('kpo_swim_org');
const savedOrgZU = localStorage.getItem('kpo_swim_org_zu');

if (savedOrg) {
    $('#kpv_swim_org').val(savedOrg);
    $('#kpv_remember_swim_org').prop('checked', true);
}

if (savedOrgZU) {
    $('#kpv_swim_org_zu').val(savedOrgZU);
}

              if ($('#kpv_remember_swim_org').is(':checked')) {
    localStorage.setItem('kpo_swim_org', $('#kpv_swim_org').val());
    localStorage.setItem('kpo_swim_org_zu', $('#kpv_swim_org_zu').val());
} else {
    localStorage.removeItem('kpo_swim_org');
    localStorage.removeItem('kpo_swim_org_zu');
}

            $(document).on(
    'input change',
    '#kpv_swim_org, #kpv_swim_org_zu, #kpv_remember_swim_org',
    function () {

        if ($('#kpv_remember_swim_org').prop('checked')) {

            localStorage.setItem(
                'kpo_swim_org',
                $('#kpv_swim_org').val().trim()
            );

            localStorage.setItem(
                'kpo_swim_org_zu',
                $('#kpv_swim_org_zu').val().trim()
            );

        } else {

            localStorage.removeItem('kpo_swim_org');
            localStorage.removeItem('kpo_swim_org_zu');
        }
    }
);
              $(document).on('input', '#kpv_swim_org', function () {
    localStorage.setItem(
        'kpo_swim_org',
        $(this).val().trim()
    );
});

$(document).on('input', '#kpv_swim_org_zu', function () {
    localStorage.setItem(
        'kpo_swim_org_zu',
        $(this).val().trim()
    );
});

              $('#kpv_swim_id').val(
    localStorage.getItem('cw_my_id') || ''
);
            const savedID =
    localStorage.getItem('cw_my_id');
    localStorage.getItem('cw_my_zu');
              // Организатор плавания
$('#kpv_swim_org').val(
    localStorage.getItem('kpo_swim_org') || ''
);

$('#kpv_swim_org_zu').val(
    localStorage.getItem('kpo_swim_org_zu') || ''
);

if (savedID) {

    $('#kpo_blog_myid').val(savedID);
$('#kpo_blog_remember_id').prop('checked', true);

}

                 $(document).on('click', '.kpo_tabs_caption li', function () {
    const $tabs = $(this).closest('.kpo_tabs');

    $(this)
        .addClass('active')
        .siblings()
        .removeClass('active');

    $tabs.find('.kpo_tabs_content')
        .removeClass('active')
        .hide()
        .eq($(this).index())
        .addClass('active')
        .show();
});

                $(document).on('click', '#kpv_check_doz', function() {

    const authors = {};

   $('.view-comment').each(function(index) {

    // Игнорируем первые 3 комментария
    if (index < 3) {
        return true;
    }

        const text = $(this).find('.comment-text .parsed').text().trim();

        const textLower = text.toLowerCase();


        // начало дежурства
        const isDozStart = textLower.includes('дежурит:');

        // конец дежурства
        const isDozEnd =
            textLower.includes('локация/маршрут:') ||
            textLower.includes('дата и время:');

        if (isDozStart) {

            const match = text.match(
                /(\d{1,2}\s+\S+,\s+\d{1,2}:\d{2})[\s\S]*?Дежурит:\s*\[([^\]]+)\]\s*[—-]\s*\[([^\]]+)\]/iu
            );

            if (match) {

                const date = match[1].trim();
                const cat = match[2].trim();
                const place = match[3].trim();

                authors[cat] = {
                    place,
                    date
                };
            }

        } else if (isDozEnd) {

            // снимаем дежурство
            const endMatch = text.match(/Дежурил:\s*\[([^\]|]+)/iu);

            if (endMatch) {
                const cat = endMatch[1].trim();
                authors[cat] = null;
            }
        }
    });

    const result = {};

    for (let [cat, data] of Object.entries(authors)) {

        if (data === null) continue;

        const place = data.place.toLowerCase();

        if (!result[place]) {
            result[place] = [];
        }

        result[place].push({
            cat,
            date: data.date
        });
    }

    for (const value in result) {

        result[value] = result[value]
            .map(({cat, date}) => `${cat} (с ${date})`)
            .join(', ');
    }

    const places = [
        'Водопад',
        'Горный перевал',
        'Обрушенная вершина',
        'Плато диких ветров',
        '1 маршрут',
        '2 маршрут',
        '3 маршрут',
        '4 маршрут'
    ];

    let text = '';

    for (const place of places) {

        const placeLower = place.toLowerCase();

        if (result[placeLower]) {

            if (text) {
                text += '<br>';
            }

            text += place + ' - ' + result[placeLower];
        }
    }

    if (!text) {
        text = 'Никто не дежурит!';
    }

    $('#kpv_checked_doz').html(text);
});
          $('#kpv_doz1_place, #kpv_doz2_place').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_place > option[value="${val}"`).prop('selected', true);
          });
          $('#kpv_doz1_time, #kpv_doz2_time').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_time`).val(val);
          });
          $('#kpv_doz1_date, #kpv_doz2_date').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_date`).val(val);
          });
            /*Чистка?*/

                $(document).on('click', '#kpv_clean_send', function () {

    const my_id = parseInt($('#kpo_blog_myid').val());
    rememberMyID(my_id);

    const history = $('#kpv_clean_history').val().trim();
    const fightPlayers = parseInt($('#kpv_fight_players').val()) || 0;

    const catsCount = history ? countCleanCats(history) : 0;

    let text = '';

    text += `[b]Имя и ID:[/b] ${masking(my_id, '[cat%ID%]|%ID%')}.`;
    text += `\n[b]Количество убранных котов:[/b] ${catsCount}.`;

    if (fightPlayers > 0) {
        text += `\n[b]Игроки в боевой стойке:[/b] ${fightPlayers}.`;
    }

    if (history) {
        text += `\n[b]Подтверждение:[/b] [[header=историячистки]история[/header]]`;
        text += `\n[block=историячистки]${history}[/block]`;
    }

    let val = $('#comment').val();
    if (val) val += "\n\n";

    $('#comment').val(val + text);
    $('#comment')[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

});

$('#kpv_doz1').on('click', function (e) {



              const my_id = parseInt($('#kpo_blog_myid').val());
              rememberMyID(my_id);


let date = splitDateStr($("#kpv_doz1_date").val());

let text = `[b]Дата и время:[/b] ${date.day}.${date.month}, ${$("#kpv_doz1_time").val()}.`;
          const guardID = $('#kpv_swim_guard').val().trim();

if (guardID) {
    text += `\n[b]Страховал:[/b] ${masking(guardID, '[cat%ID%]|%ID%')}.`;
}
             const orgID = $('#kpv_swim_org').val().trim();
const orgZU = parseInt($('#kpv_swim_org_zu').val());

if (orgID) {
    let orgText = masking(orgID, '[cat%ID%]|%ID%');

    if ([7, 8, 9].includes(orgZU)) {
        orgText += ` (${orgZU})`;
    }

    text += `\n[b]Плавание организовал:[/b] ${orgText}.`;
}
 const members = $('#kpv_swim_members').val().trim();

if (members) {
    const membersText = members
        .split(',')
        .map(item => item.trim())
        .filter(item => item)
        .map(item => {
            const parts = item.split(/\s+/);

            const id = parts[0];
            const zu = parseInt(parts[1]);

            let member = masking(id, '[cat%ID%]|%ID%');

            if ([7, 8, 9].includes(zu)) {
                member += ` (${zu})`;
            }

            return member;
        })
        .join(', ');

    text += `\n[b]Участники заплыва:[/b] ${membersText}.`;
}
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
           $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
});
         
   $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});

          $('#kpv_doz_nar_block').on('click', '.add-field', function (e) {
            let max_children = 5;
            let data_id = $(this).data('id'),
              template = $('#' + data_id)[0];
            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            if ($fields.length < max_children) {
              let clone = document.importNode(template.content, true);
              let add = $(clone).insertAfter(last_e);
              $(last_e).find($('.add-field')).css('display', 'none');
            }
          });
          $('#kpv_doz_nar_block').on('click', '.del-field', function (e) {
            let data_id = $(this).data('id');
            $(this).closest($('.' + data_id)).remove();

            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            $(last_e).find($('.add-field')).css('display', 'inline-block');
          });
        }

          if (blogID == 50042) { // Награды
           let patr_time = 9,
            patr_date = new Date(date),
            doz_date = new Date(date);
          const moscow = new Date(
    new Date().toLocaleString("en-US", {
        timeZone: "Europe/Moscow"
    })
);

let hour = moscow.getHours(),
    minute = moscow.getMinutes();

date = moscow;
          let doz_time = leadZero(hour) + ':' + leadZero(minute);
        
        $('#send_comment').append(`
<div class="kpo_doz_wrapper">
<hr>
<h3>Автоматическое заполнение отчётов</h3>
<hr>
${my_id_div}
<hr>
<div class="kpo_tabs">
<h3>Награда</h3>

<input
    type="text"
    id="reward_name"
    class="kpo-input"
    list="reward_list"
    placeholder="Начните вводить название награды">

<datalist id="reward_list"></datalist>
<hr>

<input
    type="text"
    id="reward_screen"
    class="kpo-input"
    placeholder="Ссылка на скриншот">

<button class="inp-button" id="kpv_reward">
    Заполнить
</button>
  </div>`);

              fillRewardList();
console.log("renderRewards");
              $(document).on(
    'change',
    '#reward_hide_selected',
    renderRewards
);

$(document).on(
    'change',
    '#kpo_blog_myid',
    renderRewards
);

$(document).on('click', '.reward-row', function () {

    $('.reward-row').removeClass('selected');

    $(this).addClass('selected');

});




            $(document).on(
    'input change',
    '#kpo_blog_myid, #kpo_blog_remember_id',
    function () {

        if ($('#kpo_blog_remember_id').prop('checked')) {
            localStorage.setItem(
                'cw_my_id',
                $('#kpo_blog_myid').val().trim()
            );
        } else {
            localStorage.removeItem('cw_my_id');
        }
    }
);
$(document).on("click", ".reward-toggle", function(e){
console.log("toggle");
    e.stopPropagation();

    const row = $(this).closest(".reward-row");

    const key = row.data("type") === "medal"
    ? String(row.data("id"))
    : row.data("name");

let hidden = JSON.parse(
    localStorage.getItem("kpo_hidden_rewards") || "[]"
);

console.log("key =", key);
console.log("hidden до =", hidden);

    if (hidden.includes(key)) {
        hidden = hidden.filter(x => x !== key);
    } else {
        hidden.push(key);
    }

    localStorage.setItem(
        "kpo_hidden_rewards",
        JSON.stringify(hidden)
    );
console.log("hidden после =", hidden);

renderRewards();

});
            const savedID =
    localStorage.getItem('cw_my_id');

if (savedID) {

    $('#kpo_blog_myid').val(savedID);
$('#kpo_blog_remember_id').prop('checked', true);

}

              $(document).on('change', 'reward_hide_selected', function () {

    console.log(
        "checkbox",
        $(this).prop('checked')
    );

    renderRewards();

});

           $(document).on("click",".reward-row",function(){

    const type=$(this).data("type");

    if(type==="medal"){
        $("#reward_medals .reward-row").removeClass("selected");
    }else{
        $("#reward_items .reward-row").removeClass("selected");
    }

    $(this).addClass("selected");

});

              $(document).on("click", ".reward-toggle", function(e){

    e.stopPropagation();

    const row = $(this).closest(".reward-row");

    const key =
        row.data("type") === "medal"
            ? String(row.data("id"))
            : row.data("name");

    let hidden = getHiddenRewards();

    if(hidden.includes(key)){
        hidden = hidden.filter(x => x !== key);
    }else{
        hidden.push(key);
    }

    saveHiddenRewards(hidden);

    renderRewards();

});

$(document).on('click', '.kpo_tabs_caption li', function () {
    const $tabs = $(this).closest('.kpo_tabs');

    $(this)
        .addClass('active')
        .siblings()
        .removeClass('active');

    $tabs.find('.kpo_tabs_content')
        .removeClass('active')
        .hide()
        .eq($(this).index())
        .addClass('active')
        .show();
});

              $(document).on('click', '.reward-item', function () {
    $('.reward-item').removeClass('selected');
    $(this).addClass('selected');
});

                $(document).on('click', '#kpv_check_doz', function() {

    const authors = {};

   $('.view-comment').each(function(index) {

    // Игнорируем первые 3 комментария
    if (index < 3) {
        return true;
    }

        const text = $(this).find('.comment-text .parsed').text().trim();

        const textLower = text.toLowerCase();


        // начало дежурства
        const isDozStart = textLower.includes('дежурит:');

        // конец дежурства
        const isDozEnd =
            textLower.includes('локация/маршрут:') ||
            textLower.includes('дата и время:');

        if (isDozStart) {

            const match = text.match(
                /(\d{1,2}\s+\S+,\s+\d{1,2}:\d{2})[\s\S]*?Дежурит:\s*\[([^\]]+)\]\s*[—-]\s*\[([^\]]+)\]/iu
            );

            if (match) {

                const date = match[1].trim();
                const cat = match[2].trim();
                const place = match[3].trim();

                authors[cat] = {
                    place,
                    date
                };
            }

        } else if (isDozEnd) {

            // снимаем дежурство
            const endMatch = text.match(/Дежурил:\s*\[([^\]|]+)/iu);

            if (endMatch) {
                const cat = endMatch[1].trim();
                authors[cat] = null;
            }
        }
    });

    const result = {};

    for (let [cat, data] of Object.entries(authors)) {

        if (data === null) continue;

        const place = data.place.toLowerCase();

        if (!result[place]) {
            result[place] = [];
        }

        result[place].push({
            cat,
            date: data.date
        });
    }

    for (const value in result) {

        result[value] = result[value]
            .map(({cat, date}) => `${cat} (с ${date})`)
            .join(', ');
    }

    const places = [
        'Водопад',
        'Горный перевал',
        'Обрушенная вершина',
        'Плато диких ветров',
        '1 маршрут',
        '2 маршрут',
        '3 маршрут',
        '4 маршрут'
    ];

    let text = '';

    for (const place of places) {

        const placeLower = place.toLowerCase();

        if (result[placeLower]) {

            if (text) {
                text += '<br>';
            }

            text += place + ' - ' + result[placeLower];
        }
    }

    if (!text) {
        text = 'Никто не дежурит!';
    }

    $('#kpv_checked_doz').html(text);
});
          $('#kpv_doz1_place, #kpv_doz2_place').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_place > option[value="${val}"`).prop('selected', true);
          });
          $('#kpv_doz1_time, #kpv_doz2_time').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_time`).val(val);
          });
          $('#kpv_doz1_date, #kpv_doz2_date').on('change', function (e) {
              const val = $(this).val();
              const n = $(this).attr('id').indexOf('doz1') !== -1 ? 2 : 1;
              $(`#kpv_doz${n}_date`).val(val);
          });
            /*НАГРАДЫ*/
$('#kpv_reward').on('click', function () {

    const my_id = parseInt($('#kpo_blog_myid').val());
    rememberMyID(my_id);

    // выбранная награда
const inputRewardName =
    $("#reward_name").val().trim();

const reward = rewards.find(r =>
    r.name.toLowerCase() === inputRewardName.toLowerCase()
);

if (!reward) {
    alert("Такой награды нет в списке.");
    return;
}

const rewardType = reward.type;
const rewardName = reward.name;


    // ссылка на скрин
    const screenshot = $('#reward_screen').val().trim();

    let text='';

text+=`[b]Название ${rewardType==="medal" ? "медали" : "предмета"}:[/b] ${reward.name}`;

text+=`\n[b]Ваш айди:[/b] ${masking(my_id,"%ID%")}`;

text+=`\n[b]Подтверждение:[/b] [header=1]скриншот[/header][block=1][img]${screenshot}[/img][/block]`;

    let val = $('#comment').val();

    if (val) {
        val += "\n\n";
    }
console.log($('#comment').length);
    $('#comment').val(val + text);

    $('#comment')[0].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

});
               /*КОНЕЦ ДЕЖУРСТВА*/
          $('#kpv_doz2').on('click', function (e) {
                      //ВРЕМЯ//
              let startDateStr = $("#kpv_doz1_date").val();
let endDateStr = $("#kpv_doz2_date_end").val();

let startTime = $("#kpv_doz1_time").val();
let endTime = $("#kpv_doz2_time_end").val();

function toDate(str, time) {
    let [y, m, d] = str.split('-').map(Number);
    let [h, min] = time.split(':').map(Number);
    return new Date(y, m - 1, d, h, min);
}

let startDate = toDate(startDateStr, startTime);
let endDate = toDate(endDateStr, endTime);

let diffHours = (endDate - startDate) / 3600000;
diffHours = Math.round(diffHours * 2) / 2;

if (isNaN(diffHours)) diffHours = 0;
              const my_id = parseInt($('#kpo_blog_myid').val());
              rememberMyID(my_id);
              let date = splitDateStr($("#kpv_doz1_date").val());
              let date2 = splitDateStr($("#kpv_doz2_date_end").val());
              let text = `[b]Дата и время:[/b] ${date2.day}.${date2.month}.${date2.year}, ` + $("#kpv_doz2_time").val() + `-` + $("#kpv_doz2_time_end").val() +`.`
              text += `\n[b]Количество проведённых в дежурстве часов:[/b] ${diffHours}.`;
              text += `\n[b]Дежурил:[/b] ${masking(my_id, '[[cat%ID%]|%ID%]')}.`;
              text += `\n[b]Локация/маршрут:[/b] ` + $("#kpv_doz2_place").val() + `.`;
              const narText = $('#kpo_patr_members').val().trim();

text += `\n[b]Пойманные нарушители:[/b] ${narText ? narText : 'отсутствуют'}.`;
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
            $('#comment').val(val + text);
$('#comment')[0].scrollIntoView({
    behavior: 'smooth',
    block: 'center'
});
              });
          $('#kpv_doz_nar').on('click', function (e) {
            let date = splitDateStr($("#kpv_doz_nar_date").val()),
              hr = parseInt($("#kpv_doz_nar_time").val().split(":")[0]),
              next_hr = (hr == 23) ? 0 : hr + 1,
              txt = '[u][b]Дозор[/b][/u]\n[b]Дата:[/b] ' + date.day + '.' + date.month + ';\n[b]Время:[/b] ' + leadZero(hr) + ':00-' + leadZero(next_hr) + ':00';
            let free_arr = [],
              nar_arr = [];
            $('.kpv-doz-nar-free-wrap').each(function () {
              let free = $(this).find($('input.kpv-doz-nar-free')).val();
              if (free) {
                let insideMatch = free.match(/\(.*\)/);
                let postfix = insideMatch ? ' ' + insideMatch[0].trim() : "";
                free = free.replace(/\(.*\)/, "").trim();
                if (isNaN(parseInt(free))) {
                  free = nameToID(free.trim());
                }
                free = masking(free, '[cat%ID%] [%ID%]');
                free_arr.push(free + postfix);
              }
            });
            $('.kpv-doz-nar-wrap').each(function () {
              let name = $(this).find($('input.kpv-doz-nar-narname')).val(),
                reason = $(this).find($('select.kpv-doz-nar-narreas')).val();
              if (name) {
                let insideMatch = name.match(/\(.*\)/);
                let postfix = insideMatch ? ' ' + insideMatch[0].trim() : "";
                name = name.replace(/\(.*\)/, "").trim();
                if (isNaN(parseInt(name))) {
                  name = nameToID(name.trim());
                }
                name = masking(name, '[cat%ID%] [%ID%]');
                nar_arr.push(name + postfix + ' (' + reason + ')');
              }
            });
            if (free_arr.length) {
              txt += ';\n[b]Освобождены:[/b] ' + free_arr.join(', ');
            }
            if (nar_arr.length) {
              txt += ';\n[b]Нарушения:[/b] ' + nar_arr.join(', ');
            }
            txt += '.';
            let val = $('#comment').val();
            if (val) {
              val += "\n\n";
            }
            $('#comment').val(val + txt).scrollintoview();
            // $("#comment").scrollintoview();
          });
          $('#kpv_doz_nar_block').on('click', '.add-field', function (e) {
            let max_children = 5;
            let data_id = $(this).data('id'),
              template = $('#' + data_id)[0];
            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            if ($fields.length < max_children) {
              let clone = document.importNode(template.content, true);
              let add = $(clone).insertAfter(last_e);
              $(last_e).find($('.add-field')).css('display', 'none');
            }
          });
          $('#kpv_doz_nar_block').on('click', '.del-field', function (e) {
            let data_id = $(this).data('id');
            $(this).closest($('.' + data_id)).remove();

            let $fields = $('.' + data_id);
            let last_e = $fields[$fields.length - 1];
            $(last_e).find($('.add-field')).css('display', 'inline-block');
          });
        }
/* ========================================================= */

}

blog();

})();
