// ==UserScript==
// @name         Survev.io UI
// @namespace    survev ui
// @version      2.6
// @description  Best survev ui
// @match        https://survev.io/*
// @run-at       document-end
// ==/UserScript==

//NOTES
//The gradients are pulled by default, and others are added by user's, there are none set to pull from individually


(async function() {
    'use strict';
    const cssUrl = 'Custom Github Raw File';
    try {
        const response = await fetch(cssUrl);
        if (!response.ok) throw new Error(`Failed to load CSS: ${response.status}`);
        const css = await response.text();
        const cleanedCss = css.replace(/@-moz-document[^{]+\{([\s\S]*)\}$/m, '$1');
        const styleEl = document.createElement('style');
        styleEl.textContent = cleanedCss;
        document.head.appendChild(styleEl);
        console.log('%c[Custom CSS loaded from GitHub]', 'color: #00f7ff');
    } catch (err) {
        console.error('[Error loading CSS]', err);
    }
    const overrideCSS = `
        html body .surviv-shirts {
        background: linear-gradient(180deg, rgba(15,20,25,0.25) 0%, rgba(10,12,15,0.25) 100%) !important;
        color: #fff !important;
        font-family: "Poppins", "Roboto", sans-serif !important;
        z-index: 10 !important;
        }

        html body .survev-stats-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
        color: rgba(255, 255, 255, 0.9) !important;
        margin-top: 10px;
        }
        html body .survev-stats-card h3 {
        font-size: 20px;
        color: #00f7ff !important;
        text-shadow: 0 0 3px #00f7ff88;
        }
        html body .totals {
        display: flex;
        justify-content: center;
        gap: 12px;
        }
        html body .totals b { color: #00f7ff !important; font-size: 14px; }
        html body .totals span { color: #aaa !important; font-size: 10px; }

        html body .modes {
        display: flex;
        justify-content: space-evenly;
        gap: 5px;
        width: 100%;
        margin-top: 6px;
        }
        html body .mode {
        background: rgba(255,255,255,0.07) !important;
        border-radius: 6px;
        padding: 4px 6px;
        flex: 1;
        font-size: 16px;
        }
        html body .mode strong {
        color: #00f7ff !important;
        display: block;
        font-size: 16px;
        }
        html body .mode small {
        color: #ffff00 !important;
        font-size: 12px;
        }
    `;
    const overrideStyle = document.createElement('style');
    overrideStyle.textContent = overrideCSS;
    document.head.appendChild(overrideStyle);
    console.log('%c[Overrides loaded]', 'color:#ff66cc');

    function reapplyDynamicElements() {
        const av = document.querySelector('.account-details-user .account-avatar');
        const avUrl = localStorage.getItem('customAvatar');
        if (av && avUrl) {
            av.style.backgroundImage = `url("${avUrl}")`;
            av.style.backgroundSize = 'cover';
            av.style.backgroundPosition = 'center';
        }

        const bg = document.querySelector('#background');
        const bgUrl = localStorage.getItem('customBG');
        if (bg && bgUrl) {
            bg.style.backgroundImage = `url("${bgUrl}")`;
            bg.style.backgroundSize = 'cover';
            bg.style.backgroundPosition = 'center';
        }
    }

    const observer = new MutationObserver(reapplyDynamicElements);
    ['background', 'account-details-user'].forEach(id => {
        const el = document.getElementById(id) || document.querySelector(`.${id}`);
        if (el) {
            observer.observe(el, {
                childList: true,
                subtree: true
            });
        }

    });

    reapplyDynamicElements();
})();

(async function() {
        'use strict';

        async function getUserProfile() {
            const res = await fetch('https://api.survev.io/api/user/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: '{}',
                credentials: 'include',
            });
            const data = await res.json();
            return data.profile;
        }

        async function getUserStats(slug) {
            const body = JSON.stringify({
                slug,
                interval: 'alltime',
                mapIdFilter: '-1'
            });
            const res = await fetch('https://api.survev.io/api/user_stats', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body,
                credentials: 'include',
            });
            return res.json();
        }

        function buildStatsHTML(data) {
            return `
        <div class="survev-stats-card fade-in">
            <h3>${data.username}</h3>
            <div class="totals">
            <div><b>${data.games}</b><br><span>Games</span></div>
            <div><b>${data.wins}</b><br><span>Wins</span></div>
            <div><b>${data.kills}</b><br><span>Kills</span></div>
            <div><b>${data.kpg}</b><br><span>KPG</span></div>
            </div>
            <div class="modes">
            ${data.modes.map(m => `
                <div class="mode">
                <strong>${m.teamMode === 1 ? 'Solo' : m.teamMode === 2 ? 'Duo' : 'Squad'}</strong>
                <div>${m.wins} Wins • ${m.kills} Kills • ${m.games} Games</div>
                <small>${m.winPct}% • ${m.kpg} KPG</small>
                </div>`).join('')}
            </div>
        </div>`;
    }

    const interval = setInterval(async () => {
        const shirt = document.querySelector('#ad-block-left .surviv-shirts');
        if (!shirt) return;
        clearInterval(interval);
        try {
            const profile = await getUserProfile();
            const stats = await getUserStats(profile.slug);
            shirt.innerHTML = buildStatsHTML(stats);
            console.log(`[Survev.io Stats Loaded for ${profile.username}]`);
        } catch (err) {
            console.error('[Stats Load Error]', err);
            shirt.innerHTML = `<p style="color:red;">Could not load your stats</p>`;
        }
    }, 1000);
})();
/* <---------- Default Gradients ----------> */
(function() {
    'use strict';
    const defaultBG = 'https://m.media-amazon.com/images/I/81yrz+uGqpL.jpg';
    const defaultAvatar = 'https://yt3.googleusercontent.com/H6H4wfEryyWmbYHXKECfPsauv5Wup26HpUFrDjCnuq32waY43Xatq1DrCtJ0Vm7hX-LVDwGo=s900-c-k-c0x00ffffff-no-rj';
    const defaults = {
        youKilled: {
            direction: 'to right',
            stops: [{
                    color: '#04ff00',
                    pos: 0
                },
                {
                    color: '#9bf984',
                    pos: 50
                },
                {
                    color: '#ffffff',
                    pos: 100
                },
            ],
        },
        youGotKilled: {
            direction: 'to right',
            stops: [{
                    color: '#80d177',
                    pos: 0
                },
                {
                    color: '#8aff9c',
                    pos: 50
                },
                {
                    color: '#ffffff',
                    pos: 100
                },
            ],
        },
        unified: {
            direction: 'to right',
            stops: [{
                    color: '#6a6803',
                    pos: 0
                },
                {
                    color: '#d0db06',
                    pos: 40
                },
                {
                    color: '#f7f984',
                    pos: 70
                },
                {
                    color: '#fffec1',
                    pos: 100
                },
            ],
        },
    };
/* <---------- Entire box ----------> */
    const style = document.createElement('style');
    style.textContent = `
        #customBox {
        position: fixed;
        top: 18%;
        left: 25px;
        width: 320px;
        max-height: 80vh;
        overflow-y: auto;
        background: rgba(10,15,20,0.88);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(0,255,255,0.15);
        border-left: 3px solid #00f7ff;
        border-radius: 12px;

        color: #d0faff;
        font-family: "Poppins", "Roboto", sans-serif;
        padding: 14px;
        z-index: 9999;
        }
        #customBox h3 {
        text-align: center;
        color: #00f7ff;
        text-shadow: 0 0 8px #00f7ff80;
        margin-bottom: 10px;
        font-weight: 600;
        font-size: 18px;
        }
        .gradient-block {
        border: 1px solid rgba(0,255,255,0.2);
        border-radius: 8px;
        margin-bottom: 10px;
        padding: 8px;
        }
        .gradient-block h4 {
        margin: 4px 0;
        font-size: 14px;
        color: #80f7ff;
        }
        .stop-row {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
        }
        .stop-row input[type=color] {
        width: 38px;
        height: 26px;
        border: none;
        cursor: pointer;
        background: transparent;
        }
        .stop-row input[type=number] {
        width: 55px;
        background: rgba(255,255,255,0.07);
        border: none;
        border-radius: 4px;
        padding: 3px;
        color: #d0faff;
        }
        .preview-bar {
        height: 22px;
        border-radius: 4px;
        margin-top: 5px;
        }
        select.gradient-dir {
        background: rgba(255,255,255,0.07);
        border: none;
        border-radius: 4px;
        color: #d0faff;
        font-size: 12px;
        padding: 3px;
        }
        #customBox button {
        background: #00f7ff;
        border: none;
        border-radius: 6px;
        padding: 5px 10px;
        margin: 3px;
        cursor: pointer;
        color: #000;
        font-weight: 600;
        font-size: 13px;
        }
        #customBox button:hover { background: #00a8cc; }
        #customBox small {
        display: block;
        text-align: center;
        color: rgba(200,255,255,0.6);
        font-size: 11px;
        margin-top: 4px;
        }
        .custom-header {
        cursor: move;
        user-select: none;
        }
        .header-left {
        display: flex;
        align-items: center;
        gap: 6px;
        }
        .title {
        font-size: 15px;
        font-weight: 600;
        color: #f5f5f5;
        }
        .version {
        font-size: 11px;
        color: rgba(200,200,200,0.6);
        }
        .header-sub {
        font-size: 11px;
        color: rgba(180,180,180,0.5);
        margin-top: 2px;
        }
        .tab-row {
        display: flex;
        gap: 4px;
        margin-top: 4px;
        margin-bottom: 6px;
        }
        .tabBtn {
        flex: 1;
        border: none;
        border-radius: 6px;
        padding: 4px 0;
        font-size: 13px;
        color: rgba(230,230,230,0.85);
        background: rgba(255,255,255,0.04);
        cursor: pointer;
        transition: all 0.15s ease;
        }
        .tabBtn:hover {
        background: rgba(255,255,255,0.08);
        }
        .tabBtn.active {
        background: rgba(255,255,255,0.14);
        color: #fff;
        }
        .divider {
        border: none;
        border-bottom: 1px solid rgba(255,255,255,0.08);
        margin: 6px 0 10px 0;
        }

    `;
    document.head.appendChild(style);
    const box = document.createElement('div');
    box.id = 'customBox';
    box.innerHTML = `
        <div class="custom-header">
        <div class="header-left">
            <span class="title">Customizer</span>
            <span class="version">v0.1</span>
        </div>
        </div>

        <div class="tab-row">
        <button class="tabBtn active" data-tab="images">Images</button>
        <button class="tabBtn" data-tab="colors">Colors</button>
        </div>

        <hr class="divider">
        <div id="tab-images" class="tabSection">
            <label>Background URL</label>
            <input id="bgInput" type="text" style="width:95%;border:none;border-radius:6px;padding:7px;background:rgba(255,255,255,0.08);color:#e8ffff;" value="">
            <label>Avatar URL</label>
            <input id="avInput" type="text" style="width:95%;border:none;border-radius:6px;padding:7px;background:rgba(255,255,255,0.08);color:#e8ffff;" value="">
        </div>
        <div id="tab-colors" class="tabSection" style="display:none;">
            <div id="gradientEditors"></div>
        </div>

        <hr style="border-color:rgba(0,255,255,0.2);margin:8px 0;">
        <div id="imageButtons" style="text-align:center;margin-top:6px;">
        <button id="applyImageBtn">Apply Image</button>
        <button id="resetImageBtn">Reset Image</button>
        </div>
        <div id="colorButtons" style="text-align:center;margin-top:6px;display:none;">
        <button id="applyColorBtn">Apply Colors</button>
        <button id="resetColorBtn">Reset Colors</button>
        </div>

        <small>Press SHIFT to show/hide</small>

        `;
    box.addEventListener('click', (e) => {
        if (e.target.classList.contains('tabBtn')) {
            const tab = e.target.dataset.tab;
            box.querySelectorAll('.tabBtn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            box.querySelectorAll('.tabSection').forEach(sec => {
                sec.style.display = 'none';
            });

            box.querySelector(`#tab-${tab}`).style.display = 'block';
            box.querySelector('#imageButtons').style.display = (tab === 'images') ? 'block' : 'none';
            box.querySelector('#colorButtons').style.display = (tab === 'colors') ? 'block' : 'none';

        }
    });

    document.body.appendChild(box);
    // === Make the customizer box draggable ===
const header = box.querySelector('.custom-header');
if (header) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let startLeft = 0, startTop = 0;

    // Ensure box is positioned for dragging
    box.style.position = 'fixed';
    if (!box.style.left) box.style.left = box.offsetLeft + 'px';
    if (!box.style.top) box.style.top = box.offsetTop + 'px';
    box.style.right = 'auto';
    box.style.bottom = 'auto';

    header.style.cursor = 'move';

    header.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(box.style.left, 10);
        startTop = parseInt(box.style.top, 10);
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        box.style.left = `${startLeft + dx}px`;
        box.style.top = `${startTop + dy}px`;
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });
}

    window._survevGradientDefaults = defaults;
    window._survevBox = box;
    window._survevStyleEl = style;
    window._survevDefaultBG = defaultBG;
    window._survevDefaultAvatar = defaultAvatar;
// === Toggle box visibility with SHIFT ===
let boxVisible = true;
document.addEventListener('keydown', (e) => {
    if (e.key === 'Shift') {
        boxVisible = !boxVisible;
        box.style.display = boxVisible ? 'block' : 'none';
    }
});

})();

(function() {
    'use strict';

    const box = window._survevBox;
    const defaults = window._survevGradientDefaults;
    const defaultBG = window._survevDefaultBG;
    const defaultAvatar = window._survevDefaultAvatar;
    const gradientContainer = box.querySelector('#gradientEditors');

    const gradientTypes = [{
            key: 'youKilled',
            label: 'Killfeed – You Killed (Green)'
        },
        {
            key: 'youGotKilled',
            label: 'Killfeed – You Got Killed (Red)'
        },
        {
            key: 'unified',
            label: 'Unified Killfeed (All)'
        },
    ];

    function loadGradients() {
        const stored = JSON.parse(localStorage.getItem('killfeedGradients') || '{}');
        const gradients = {};
        for (const type of gradientTypes) {
            gradients[type.key] = stored[type.key] || defaults[type.key];
        }
        return gradients;
    }

    function saveGradients(obj) {
        localStorage.setItem('killfeedGradients', JSON.stringify(obj));
    }

    function buildStopRow(gKey, idx, stop) {
        const div = document.createElement('div');
        div.className = 'stop-row';
        div.innerHTML = `
      <input type="color" value="${stop.color}">
      <input type="number" min="0" max="100" value="${stop.pos}" title="Position (%)">
      <button class="delStop">✕</button>
    `;
        div.querySelector('.delStop').addEventListener('click', () => {
            div.parentElement.removeChild(div);
            updatePreview(gKey);
        });
        div.querySelector('input[type=color]').addEventListener('input', () => updatePreview(gKey));
        div.querySelector('input[type=number]').addEventListener('input', () => updatePreview(gKey));
        return div;
    }

    function buildGradientBlock(type, data) {
        const div = document.createElement('div');
        div.className = 'gradient-block';
        div.dataset.key = type.key;
        div.innerHTML = `
      <h4>${type.label}</h4>
      <div>Direction:
        <select class="gradient-dir">
          <option value="to right">→ Right</option>
          <option value="to left">← Left</option>
          <option value="to bottom">↓ Down</option>
          <option value="to top">↑ Up</option>
          <option value="to bottom right">↘ Diagonal</option>
          <option value="to top left">↖ Diagonal</option>
        </select>
        <button class="addStop">＋ Stop</button>
      </div>
      <div class="stops"></div>
      <div class="preview-bar"></div>
    `;
        const stopContainer = div.querySelector('.stops');
        data.stops.forEach((s, i) => stopContainer.appendChild(buildStopRow(type.key, i, s)));
        div.querySelector('.gradient-dir').value = data.direction;
        div.querySelector('.addStop').addEventListener('click', () => {
            if (stopContainer.children.length >= 4) return alert('Max 4 color stops!');
            const newStop = {
                color: '#ffffff',
                pos: 100
            };
            stopContainer.appendChild(buildStopRow(type.key, stopContainer.children.length, newStop));
            updatePreview(type.key);
        });
        return div;
    }

    function collectGradientData(gKey) {
        const block = gradientContainer.querySelector(`.gradient-block[data-key="${gKey}"]`);
        const dir = block.querySelector('.gradient-dir').value;
        const stops = Array.from(block.querySelectorAll('.stop-row')).map(r => ({
            color: r.querySelector('input[type=color]').value,
            pos: parseInt(r.querySelector('input[type=number]').value) || 0,
        })).sort((a, b) => a.pos - b.pos);
        return {
            direction: dir,
            stops
        };
    }
/* <---------- Lets user change graident to their choice ----------> */
    function gradientToCSS(obj) {
        const parts = obj.stops.map(s => `${s.color} ${s.pos}%`);
        return `linear-gradient(${obj.direction}, ${parts.join(', ')})`;
    }
/* <---------- Preview Bar ----------> */
    function updatePreview(gKey) {
        const data = collectGradientData(gKey);
        const css = gradientToCSS(data);
        const block = gradientContainer.querySelector(`.gradient-block[data-key="${gKey}"]`);
        block.querySelector('.preview-bar').style.background = css;
    }

    function applyKillfeedGradients() {
        const data = loadGradients();
        const css1 = gradientToCSS(data.youKilled);
        const css2 = gradientToCSS(data.youGotKilled);
        const css3 = gradientToCSS(data.unified);

        const style = document.getElementById('killfeedStyle') || document.createElement('style');
        style.id = 'killfeedStyle';
        style.textContent = `
      #ui-killfeed .killfeed-text[style*="rgb(0, 191, 255)"],
      #ui-killfeed .killfeed-text[style*="#00bfff"] {
        background: ${css1} !important;
        color: transparent !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        font-weight: bold !important;
      }
      #ui-killfeed .killfeed-text[style*="rgb(209, 119, 124)"],
      #ui-killfeed .killfeed-text[style*="#d1777c"] {
        background: ${css2} !important;
        color: transparent !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        font-weight: bold !important;
      }
      #ui-killfeed-0 .killfeed-text,
      #ui-killfeed-1 .killfeed-text,
      #ui-killfeed-2 .killfeed-text,
      #ui-killfeed-3 .killfeed-text,
      #ui-killfeed-4 .killfeed-text,
        background: ${css3} !important;
        color: transparent !important;
        -webkit-background-clip: text !important;
        -webkit-text-fill-color: transparent !important;
        font-weight: bold !important;
      }
      .tabBtn {
         background: rgba(0,255,255,0.15);
         border: 1px solid rgba(0,255,255,0.25);
         border-radius: 8px;
         padding: 4px 10px;
         font-weight: 600;
         font-size: 13px;
         color: #aafaff;
         cursor: pointer;
         transition: all 0.2s ease;
       }
       .tabBtn:hover { background: rgba(0,255,255,0.3); }
       .tabBtn.active {
          background: #00f7ff;
          color: #000;
          border-color: #00f7ff;
       }
       .tabSection {
          animation: fadeIn 0.3s ease;
       }
       @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          o { opacity: 1; transform: translateY(0); }
       }
    `;
        document.head.appendChild(style);
    }
    const current = loadGradients();
    gradientTypes.forEach(t => {
        const block = buildGradientBlock(t, current[t.key]);
        gradientContainer.appendChild(block);
        updatePreview(t.key);
    });
    const bgInput = box.querySelector('#bgInput');
    const avInput = box.querySelector('#avInput');
    bgInput.value = localStorage.getItem('customBG') || defaultBG;
    avInput.value = localStorage.getItem('customAvatar') || defaultAvatar;

    function applyBackground(url) {
        function set() {
            const bg = document.querySelector('#background');
            if (bg) {
                bg.style.setProperty('background-image', `url("${url}")`, 'important');
                bg.style.setProperty('background-size', 'cover', 'important');
                bg.style.setProperty('background-position', 'center', 'important');
                bg.style.setProperty('background-repeat', 'no-repeat', 'important');
            } else {
                setTimeout(set, 500);
            }
        }
        set();
    }

    function applyAvatar(url) {
        function set() {
            const av = document.querySelector('.account-details-user .account-avatar');
            if (av) {
                av.style.setProperty('background-image', `url("${url}")`, 'important');
                av.style.setProperty('background-size', 'cover', 'important');
                av.style.setProperty('background-position', 'center', 'important');
                av.style.setProperty('background-repeat', 'no-repeat', 'important');
            } else {
                setTimeout(set, 500);
            }
        }
        set();
    }

    box.querySelector('#applyImageBtn').addEventListener('click', () => {
        const bg = bgInput.value.trim();
        const av = avInput.value.trim();
        if (bg) {
            localStorage.setItem('customBG', bg);
            applyBackground(bg);
        }
        if (av) {
            localStorage.setItem('customAvatar', av);
            applyAvatar(av);
        }
    });

    box.querySelector('#resetImageBtn').addEventListener('click', () => {
        localStorage.removeItem('customBG');
        localStorage.removeItem('customAvatar');
        bgInput.value = defaultBG;
        avInput.value = defaultAvatar;
        applyBackground(defaultBG);
        applyAvatar(defaultAvatar);
    });

    box.querySelector('#applyColorBtn').addEventListener('click', () => {
        const newGradients = {};
        gradientTypes.forEach(t => {
            newGradients[t.key] = collectGradientData(t.key);
        });
        saveGradients(newGradients);
        applyKillfeedGradients();
    });

    box.querySelector('#resetColorBtn').addEventListener('click', () => {
        localStorage.removeItem('killfeedGradients');
        saveGradients(defaults);
        applyKillfeedGradients();
        gradientContainer.innerHTML = '';
        gradientTypes.forEach(t => {
            const block = buildGradientBlock(t, defaults[t.key]);
            gradientContainer.appendChild(block);
            updatePreview(t.key);
        });
    });

    box.querySelector('#resetBtn').addEventListener('click', () => {
        localStorage.removeItem('customBG');
        localStorage.removeItem('customAvatar');
        localStorage.removeItem('killfeedGradients');
        bgInput.value = defaultBG;
        avInput.value = defaultAvatar;
        applyBackground(defaultBG);
        applyAvatar(defaultAvatar);
        saveGradients(defaults);
        applyKillfeedGradients();
        gradientContainer.innerHTML = '';
        gradientTypes.forEach(t => {
            const block = buildGradientBlock(t, defaults[t.key]);
            gradientContainer.appendChild(block);
            updatePreview(t.key);
        });
    });

    const savedBG = localStorage.getItem('customBG') || defaultBG;
    const savedAV = localStorage.getItem('customAvatar') || defaultAvatar;
    applyBackground(savedBG);
    applyAvatar(savedAV);
    applyKillfeedGradients();
    let shiftDown = false;
    let visible = true;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 'h' && e.shiftKey && !shiftDown) {
            shiftDown = true;
            visible = !visible;
            box.style.display = visible ? 'block' : 'none';
        }
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === 'Shift') shiftDown = false;
    });

    window.addEventListener('load', () => {
        const box = window._survevBox;
        if (!box) return;

        const header = box.querySelector('.custom-header');
        if (!header) return;

        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
    position:absolute; top:6px; right:8px;
    background:none; border:none; color:#00f7ff;
    font-size:16px; cursor:pointer;
  `;
        header.appendChild(closeBtn);

        closeBtn.addEventListener('click', () => {
            box.style.display = 'none';
        });
        box.style.position = 'fixed';
        box.style.zIndex = 9999;

        let drag = false,
            offX = 0,
            offY = 0;

        header.addEventListener('mousedown', e => {
            drag = true;
            offX = e.clientX - box.offsetLeft;
            offY = e.clientY - box.offsetTop;
            document.body.style.userSelect = 'none';
            box.style.zIndex = 10000;
        });

        document.addEventListener('mousemove', e => {
            if (!drag) return;
            box.style.left = (e.clientX - offX) + 'px';
            box.style.top = (e.clientY - offY) + 'px';
        });

        document.addEventListener('mouseup', () => {
            drag = false;
            document.body.style.userSelect = '';
        });
    });

    document.addEventListener('keydown', e => {
        if (e.shiftKey && e.key.toLowerCase() === 'h') {
            box.style.display = (box.style.display === 'none') ? 'block' : 'none';
        }
    });

    const observer = new MutationObserver(() => {
        const savedBG = localStorage.getItem('customBG');
        const savedAV = localStorage.getItem('customAvatar');
        if (savedBG) applyBackground(savedBG);
        if (savedAV) applyAvatar(savedAV);
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();

// ---------------------------
// Added: Ensure box is moveable (only this addition)
// (If the box exists and header is present, add a small protective draggable initializer
//  that won't modify other code or styles.)
// ---------------------------
(function ensureBoxDraggable() {
    try {
        const tryAttach = () => {
            const box = window._survevBox || document.getElementById('customBox');
            if (!box) return false;
            const header = box.querySelector('.custom-header');
            if (!header) return false;
            // Avoid attaching twice
            if (header.dataset._draggable === '1') return true;

            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;

            header.style.cursor = header.style.cursor || 'move';

            const onMouseDown = (e) => {
                isDragging = true;
                // If box is not positioned, ensure it is
                const rect = box.getBoundingClientRect();
                if (!box.style.left) box.style.left = rect.left + 'px';
                if (!box.style.top) box.style.top = rect.top + 'px';
                offsetX = e.clientX - box.offsetLeft;
                offsetY = e.clientY - box.offsetTop;
                document.body.style.userSelect = 'none';
            };

            const onMouseMove = (e) => {
                if (!isDragging) return;
                box.style.left = (e.clientX - offsetX) + 'px';
                box.style.top = (e.clientY - offsetY) + 'px';
            };

            const onMouseUp = () => {
                if (!isDragging) return;
                isDragging = false;
                document.body.style.userSelect = '';
            };

            header.addEventListener('mousedown', onMouseDown);
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);

            header.dataset._draggable = '1';
            return true;
        };

        // Try immediately and a few times in case the box is added later
        if (!tryAttach()) {
            let attempts = 0;
            const maxAttempts = 20;
            const iv = setInterval(() => {
                attempts++;
                if (tryAttach() || attempts >= maxAttempts) clearInterval(iv);
            }, 300);
        }
    } catch (e) {
        // silent fail to avoid interfering with original script
        console.error('Draggable initializer error', e);
    }
})();
