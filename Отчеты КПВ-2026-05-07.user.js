// ==UserScript==
// @name         Отчеты КПВ
// @namespace    http://tampermonkey.net/
// @version      2026-05-07
// @description  Автоматическое заполнение отчётов
// @match        https://*.catwar.su/blog*
// @match        https://*.catwar.net/blog*
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

function masking(catID, maskStr) {
    return maskStr.replace(/%ID%/g, catID);
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

    if ($('#cws_blog_remember_id').is(':checked')) {

        localStorage.setItem(
            'cw_my_id',
            id
        );
    }
}

    function rememberMyZU(id) {

    if ($('#cws_blog_remember_zu').is(':checked')) {

        localStorage.setItem(
            'cw_my_zu',
            id
        );
    }
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
    <div id="cws_color_editor" style="margin-top:20px;padding:10px;border:1px solid #fff;border-radius:10px;">
        <h3>🎨 Цвета дежурств</h3>

        <label>Фон блока:</label><br>
        <input type="color" id="cws_bg" value="#2b2b2b"><br><br>

        <label>Кнопки:</label><br>
        <input type="color" id="cws_btn" value="#34576D"><br><br>

        <label>Рамка:</label><br>
        <input type="color" id="cws_border" value="#ffffff"><br><br>

        <button id="cws_save_colors" class="inp-button">Сохранить</button>
    </div>
    `;

    $('body').append(html);

    // загрузка сохранённых
    const saved = JSON.parse(localStorage.getItem("cws_colors") || "{}");

    if (saved.bg) $("#cws_bg").val(saved.bg);
    if (saved.btn) $("#cws_btn").val(saved.btn);
    if (saved.border) $("#cws_border").val(saved.border);

    // сохранение
    $(document).on("click", "#cws_save_colors", function () {
        const colors = {
            bg: $("#cws_bg").val(),
            btn: $("#cws_btn").val(),
            border: $("#cws_border").val()
        };

        localStorage.setItem("cws_colors", JSON.stringify(colors));
        alert("Цвета сохранены!");
    });
}

/* =========================
   ОСНОВНОЙ КОД
========================= */

function blog() {

    const colors = JSON.parse(localStorage.getItem("cws_colors") || "{}");

const UI = {
    bg: colors.bg || "#2b2b2b",
    btn: colors.btn || "#34576D",
    border: colors.border || "#ffffff"
};
    //ДИЗАЙН//
  const style = `
/* ===== ТВОЙ БЛОК ===== */
#send_comment .cws_doz_wrapper {
    background: #98ACB8;
    border: 1px solid #ffffff;
    border-radius: 12px;
    padding: 15px;
    margin-top: 10px;
}

/* ===== КНОПКИ ВНУТРИ ТВОЕГО БЛОКА ===== */
#send_comment .cws_doz_wrapper button.inp-button,
#send_comment .cws_doz_wrapper #kpv_check_doz,
#send_comment .cws_doz_wrapper #kpv_doz1,
#send_comment .cws_doz_wrapper #kpv_doz2 {
    background: #34576D;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
    transition: 0.2s;
}
#send_comment .cws_tabs_caption li {
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
}

/* активная вкладка */
#send_comment .cws_tabs_caption li.active {
    border-radius: 10px;
}
#send_comment .cws_tabs_caption {
    display: flex;
    gap: 6px;
}

#send_comment .cws_tabs_caption li {
    background: #34576D;
    color: #fff;
    transition: 0.2s;
}

#send_comment .cws_tabs_caption li:hover {
    background: #537890;
}

#send_comment .cws_tabs_caption li.active {
    background: #537890;
}
/* hover эффект */
#send_comment .cws_doz_wrapper button.inp-button:hover,
#send_comment .cws_doz_wrapper #kpv_check_doz:hover,
#send_comment .cws_doz_wrapper #kpv_doz1:hover,
#send_comment .cws_doz_wrapper #kpv_doz2:hover {
    background: #537890;
}

/* фокус */
#send_comment .cws_doz_wrapper button:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.2);
}
/* ===== ПОДПИСИ ПОЛЕЙ ===== */
#send_comment .cws_doz_wrapper table td:first-child {
    color: #000000;
    font-weight: 500;
    padding-right: 10px;
    white-space: nowrap;
}

/* ===== ПОЛЯ ВНУТРИ БЛОКА ===== */
#send_comment .cws_doz_wrapper input,
#send_comment .cws_doz_wrapper select,
#send_comment .cws_doz_wrapper textarea {
    background: #34576D;
    color: #ffffff;
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 8px;
    padding: 4px 6px;
}

/* placeholder */
#send_comment .cws_doz_wrapper input::placeholder,
#send_comment .cws_doz_wrapper textarea::placeholder {
    color: rgba(255,255,255,0.6);
}

/* фокус */
#send_comment .cws_doz_wrapper input:focus,
#send_comment .cws_doz_wrapper select:focus,
#send_comment .cws_doz_wrapper textarea:focus {
    outline: none;
    border-color: #ffffff;
    box-shadow: 0 0 0 2px rgba(255,255,255,0.15);
}
`;

$('<style>').text(style).appendTo('head');
$('<style>').text(style).appendTo('head');
    const blogID =
        +pageurl.match(/blog(\d+)/)[1];

    let date = new Date();

    const date_str =
        date.getFullYear() + '-' +
        leadZero(date.getMonth() + 1) + '-' +
        leadZero(date.getDate());

const my_id_div = `
<div>
    Ваш ID:
    <input type="number" class="cws-input" id="cws_blog_myid">
    <label><input type="checkbox" id="cws_blog_remember_id"> запомнить</label>
</div>
`;

const my_id_zu_div = `
<div>
    Ваш ID:
    <input type="number" class="cws-input" id="cws_blog_myid">
    <label><input type="checkbox" id="cws_blog_remember_id"> запомнить</label>
    <br><br>`;

if (blogID == 57858) {

    const savedZU = localStorage.getItem('cw_my_zu');

    if (savedZU) {
        $('#cws_blog_myzu').val(savedZU);
        $('#cws_blog_remember_zu').prop('checked', true);
    }

    $(document).on('change', '#cws_blog_remember_zu', function () {
        if (this.checked) {
            localStorage.setItem('cw_my_zu', $('#cws_blog_myzu').val());
        }
    });
}


        if (blogID == 338540) { // Дежурства
          let patr_time = 9,
            patr_date = new Date(date),
            doz_date = new Date(date);
          let hour = date.getHours(),
            minute = date.getMinutes();
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
<div class="cws_doz_wrapper">
<hr>
<b>Смотрим дежурящих</b><br><br>
<button class="inp-button" id="kpv_check_doz">Проверить, кто сейчас дежурит</button>
<p id="kpv_checked_doz">Пока что кнопочку не нажимали...</p>
<hr>
<h3>Автоматическое заполнение отчётов</h3>
<hr>
${my_id_div}
<hr>
<div class="cws_tabs">
  <ul class="cws_tabs_caption">
    <li class="active">Начало дежурства</li>
    <li>Конец дежурства</li>
  </ul>

  <div id="kpv_doz_block" class="cws_tabs_content active">
    <p class="view-title">Начало дежурства</p>
    <table>
        <tr><td>Дата начала:</td><td><input type="date" class="cws-input" id="kpv_doz1_date" required value="${date_str}"></td></tr>
        <tr><td>Время начала:</td><td><input type="time" class="cws-input" id="kpv_doz1_time" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Место дежурства:</td><td><select id="kpv_doz1_place">${doz_options}</select></td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz1">Заполнить отчет</button>
  </div>

  <div id="kpv_doz_block" class="cws_tabs_content" style="display:none;">
    <p class="view-title">Конец дежурства</p>
    <table>
        <tr><td>Дата начала:</td><td><input type="date" class="cws-input" id="kpv_doz2_date" required value="${date_str}"></td></tr>
        <tr><td>Время начала:</td><td><input type="time" class="cws-input" id="kpv_doz2_time" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Дата конца:</td><td><input type="date" class="cws-input" id="kpv_doz2_date_end" required value="${date_str}"></td></tr>
        <tr><td>Время конца:</td><td><input type="time" class="cws-input" id="kpv_doz2_time_end" required value="${doz_time}" step="60"></td><td></td></tr>
        <tr><td>Место дежурства:</td><td><select id="kpv_doz2_place">${doz_options}</select></td><td></td></tr>
        <tr><td>Пойманные нарушители:
        <textarea style="width:95%;resize:none;" class="cws-input" id="cws_patr_members" placeholder="[имя|ID], принадлежность.
При отстуствии оставьте поле пустым."></textarea>
    </td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz2">Заполнить отчет</button>
  </div>`);
            const savedID =
    localStorage.getItem('cw_my_id');

if (savedID) {

    $('#cws_blog_myid')
        .val(savedID);

    $('#cws_blog_remember_id')
        .prop('checked', true);

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
            /*НАЧАЛО ДЕЖУРСТВА*/
          $('#kpv_doz1').on('click', function (e) {
              //МЕСЯЦЫ//
const months = [
  "января", "февраля", "марта", "апреля",
  "мая", "июня", "июля", "августа",
  "сентября", "октября", "ноября", "декабря"
];
              const my_id = parseInt($('#cws_blog_myid').val());
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
            $('#comment').val(val + text).scrollintoview();
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
              const my_id = parseInt($('#cws_blog_myid').val());
              rememberMyID(my_id);
              let date = splitDateStr($("#kpv_doz1_date").val());
              let date2 = splitDateStr($("#kpv_doz2_date_end").val());
              let text = `[b]Дата и время:[/b] ${date2.day}.${date2.month}.${date2.year}, ` + $("#kpv_doz2_time").val() + `-` + $("#kpv_doz2_time_end").val() +`.`
              text += `\n[b]Количество проведённых в дежурстве часов:[/b] ${diffHours}.`;
              text += `\n[b]Дежурил:[/b] ${masking(my_id, '[[cat%ID%]|%ID%]')}.`;
              text += `\n[b]Локация/маршрут:[/b] ` + $("#kpv_doz2_place").val() + `.`;
              const narText = $('#cws_patr_members').val().trim();

text += `\n[b]Пойманные нарушители:[/b] ${narText ? narText : 'отсутствуют'}.`;
              let val = $('#comment').val();
              if (val) {
                  val += "\n\n";
              }
            $('#comment').val(val + text).scrollintoview();
          })


            ;

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
          let hour = date.getHours(),
            minute = date.getMinutes();
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
<div class="cws_doz_wrapper">
<hr>
<h3>Автоматическое заполнение отчётов</h3>
<hr>
${my_id_zu_div}
<hr>
<div class="cws_tabs">
  <ul class="cws_tabs_caption">
    <li class="active">Плавательный заплыв</li>
    <li>Ресурс со дна</li>
  </ul>

  <div id="kpv_doz_block" class="cws_tabs_content active">
    <p class="view-title">Плавательный заплыв</p>
    <table>
        <tr><td>Дата и время:</td><td><input type="date" class="cws-input" id="kpv_doz1_date" required value="${date_str}"></td><td><input type="time" class="cws-input" id="kpv_doz1_time" required value="${doz_time}" step="60"></td><td></td></tr>
        </tr>
        <tr><td>Страховал:</td><td> <input type="number" class="cws-input" id="kpv_swim_guard"
        placeholder="ID ДН"></td>   <td>
        <input type="number" class="cws-input" id="kpv_swim_guard_zu" placeholder="ЗУ" min="7" max="9" style="width:60px;">
    </td><td></td></tr>
        <tr><td>Плавание организовал:</td><td><input type="number" class="cws-input" id="kpv_swim_org"
        placeholder="ID организатора""></td><td>
        <input type="number" class="cws-input" id="kpv_swim_org_zu" placeholder="ЗУ" min="7" max="9" style="width:60px;">
    </td><td></td></tr>
        <tr><td>Участники заплыва:</td><td><textarea class="cws-input" id="kpv_swim_members"
                  placeholder="ID участников через запятую: 123,456,789. ЗУ указывается рядом через пробел."></textarea></td><td></td></tr>
    </table>
    <div></div>
    <button class="inp-button" id="kpv_doz1">Заполнить отчет</button>
  </div>

  <div id="kpv_doz_block" class="cws_tabs_content" style="display:none;">
    <p class="view-title">Ресурс со дна</p>
    <table>

<tr>
    <td>Количество и вид:</td>
    <td>
        <div>Ракушка:
            <input type="number" class="cws-input" id="res_shell" value="0" min="0" style="width:60px;">
        </div>

        <div>Крепкая ветка:
            <input type="number" class="cws-input" id="res_branch" value="0" min="0" style="width:60px;">
        </div>

        <div>Мох:
            <input type="number" class="cws-input" id="res_moss" value="0" min="0" style="width:60px;">
        </div>

        <div>Плотная водоросль:
            <input type="number" class="cws-input" id="res_dense" value="0" min="0" style="width:60px;">
        </div>

        <div>Целебная водоросль:
            <input type="number" class="cws-input" id="res_heal" value="0" min="0" style="width:60px;">
        </div>
    </td>
</tr>

<tr>
    <td>Уникальный ID:</td>
    <td>
        <input type="text"
               class="cws-input"
               id="kpv_unique_id"
               placeholder="12345, 67890">
    </td>
</tr>

<tr>
    <td>Хочу сдать:</td>
    <td>
        <select id="kpv_swim_store" class="cws-input">
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
              $('#kpv_swim_id').val(
    localStorage.getItem('cw_my_id') || ''
);
            const savedID =
    localStorage.getItem('cw_my_id');
    localStorage.getItem('cw_my_zu');

if (savedID) {

    $('#cws_blog_myid')
        .val(savedID);

    $('#cws_blog_remember_id')
        .prop('checked', true);

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
       
              const my_id = parseInt($('#cws_blog_myid').val());
              rememberMyID(my_id);


let date = splitDateStr($("#kpv_doz1_date").val());

let text = `[b]Дата и время:[/b] ${date.day}.${date.month}, ${$("#kpv_doz1_time").val()}.`;
          const guardID = $('#kpv_swim_guard').val().trim();
const guardZU = parseInt($('#kpv_swim_guard_zu').val());

if (guardID) {
    let guardText = masking(guardID, '[cat%ID%]|%ID%');

    if ([7, 8, 9].includes(guardZU)) {
        guardText += ` (${guardZU})`;
    }

    text += `\n[b]Страховал:[/b] ${guardText}.`;
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
            $('#comment').val(val + text).scrollintoview();
          });
          /*РЕСУРСЫ*/
$('#kpv_doz2').on('click', function (e) {

    const my_id = parseInt($('#cws_blog_myid').val());
    rememberMyID(my_id);

    let text = `[b]ID:[/b] ${masking(my_id, '%ID%')}.`;

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
        text += `\n[b]Количество и вид:[/b] ${resources.join(', ')}.`;
    }

    // Уникальный ID
    const uniqueID = $('#kpv_unique_id').val().trim();

    if (uniqueID) {
        text += `\n[b]Уникальный ID:[/b] ${uniqueID}.`;
    }

    // Хочу сдать
    const store = $('#kpv_swim_store').val();

    if (store !== 'нет') {
        text += `\n[b]Хочу сдать:[/b] ${store}.`;
    }

    let val = $('#comment').val();

    if (val) {
        val += "\n\n";
    }

    $('#comment').val(val + text).scrollintoview();
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