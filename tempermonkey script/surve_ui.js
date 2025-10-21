// ==UserScript==
// @name         Survev.io UI
// @namespace    survev ui
// @version      3.0
// @description  Optimized survev.io UI customizer
// @match        https://survev.io/*
// @match        http://185.126.158.61/*
// @match        http://66.179.254.36/*
// @match        https://zurviv.io/*
// @match        https://cursev.io/*
// @match        https://resurviv.biz/*
// @run-at       document-end
// ==/UserScript==

(function() {
        'use strict';

        // ===== This is for the constants =====
        const CONFIG = {
            cssUrl: 'https://raw.githubusercontent.com/NAMERIO/Survev.io-CSS-Script/main/Individual%20Style%20CSS/Namerio%20Commison.css',
            defaultBG: 'https://m.media-amazon.com/images/I/81yrz+uGqpL.jpg',
            defaultAvatar: 'https://yt3.googleusercontent.com/H6H4wfEryyWmbYHXKECfPsauv5Wup26HpUFrDjCnuq32waY43Xatq1DrCtJ0Vm7hX-LVDwGo=s900-c-k-c0x00ffffff-no-rj',
            apiUrl: 'https://api.survev.io/api',
            toggleKey: 'h',
            version: '3.0'
        };

        const GRADIENT_DEFAULTS = {
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
                    }
                ]
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
                    }
                ]
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
                    }
                ]
            }
        };

        // ===== This is for the utility functions =====
        const Utils = {
            log: (msg, color = '#00f7ff') => console.log(`%c${msg}`, `color: ${color}`),

            createStyle: (css) => {
                const style = document.createElement('style');
                style.textContent = css;
                document.head.appendChild(style);
                return style;
            },

            waitForElement: (selector, callback, maxAttempts = 20) => {
                const check = () => {
                    const el = document.querySelector(selector);
                    if (el) {
                        callback(el);
                        return true;
                    }
                    return false;
                };

                if (!check()) {
                    let attempts = 0;
                    const interval = setInterval(() => {
                        attempts++;
                        if (check() || attempts >= maxAttempts) {
                            clearInterval(interval);
                        }
                    }, 500);
                }
            }
        };

        // ===== This load the css from the github repository =====
        const CSSLoader = {
            async loadExternal() {
                try {
                    const response = await fetch(CONFIG.cssUrl);
                    if (!response.ok) throw new Error(`Failed to load CSS: ${response.status}`);
                    const css = await response.text();
                    const cleanedCss = css.replace(/@-moz-document[^{]+\{([\s\S]*)\}$/m, '$1');
                    Utils.createStyle(cleanedCss);
                    Utils.log('[Custom CSS loaded from GitHub]');
                } catch (err) {
                    console.error('[Error loading CSS]', err);
                }
            },

            loadOverrides() {
                const css = `
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
                Utils.createStyle(css);
                Utils.log('[Overrides loaded]', '#ff66cc');
            }
        };

        // ===== This is for stats display =====
        const API = {
            async getUserProfile() {
                const res = await fetch(`${CONFIG.apiUrl}/user/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: '{}',
                    credentials: 'include'
                });
                const data = await res.json();
                return data.profile;
            },

            async getUserStats(slug) {
                const body = JSON.stringify({
                    slug,
                    interval: 'alltime',
                    mapIdFilter: '-1'
                });
                const res = await fetch(`${CONFIG.apiUrl}/user_stats`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body,
                    credentials: 'include'
                });
                return res.json();
            }
        };

        const StatsDisplay = {
                buildHTML(data) {
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
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        },

        async load() {
            Utils.waitForElement('#ad-block-left .surviv-shirts', async (shirt) => {
                try {
                    const profile = await API.getUserProfile();
                    const stats = await API.getUserStats(profile.slug);
                    shirt.innerHTML = this.buildHTML(stats);
                    Utils.log(`[Stats loaded for ${profile.username}]`);
                } catch (err) {
                    console.error('[Stats Load Error]', err);
                    shirt.innerHTML = `<p style="color:red;">Could not load your stats</p>`;
                }
            });
        }
    };

    // ===== This is for the image manager =====
    const ImageManager = {
        applyBackground(url) {
            Utils.waitForElement('#background', (bg) => {
                bg.style.setProperty('background-image', `url("${url}")`, 'important');
                bg.style.setProperty('background-size', 'cover', 'important');
                bg.style.setProperty('background-position', 'center', 'important');
                bg.style.setProperty('background-repeat', 'no-repeat', 'important');
            });
        },

        applyAvatar(url) {
            Utils.waitForElement('.account-details-user .account-avatar', (av) => {
                av.style.setProperty('background-image', `url("${url}")`, 'important');
                av.style.setProperty('background-size', 'cover', 'important');
                av.style.setProperty('background-position', 'center', 'important');
                av.style.setProperty('background-repeat', 'no-repeat', 'important');
            });
        },

        observeChanges() {
            const observer = new MutationObserver(() => {
                const bgUrl = localStorage.getItem('customBG');
                const avUrl = localStorage.getItem('customAvatar');
                if (bgUrl) this.applyBackground(bgUrl);
                if (avUrl) this.applyAvatar(avUrl);
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        },

        init() {
            const savedBG = localStorage.getItem('customBG') || CONFIG.defaultBG;
            const savedAV = localStorage.getItem('customAvatar') || CONFIG.defaultAvatar;
            this.applyBackground(savedBG);
            this.applyAvatar(savedAV);
            this.observeChanges();
        }
    };

    // ===== This is for the gradient manager =====
    const GradientManager = {
        load() {
            const stored = JSON.parse(localStorage.getItem('killfeedGradients') || '{}');
            const gradients = {};
            for (const key in GRADIENT_DEFAULTS) {
                gradients[key] = stored[key] || GRADIENT_DEFAULTS[key];
            }
            return gradients;
        },

        save(obj) {
            localStorage.setItem('killfeedGradients', JSON.stringify(obj));
        },

        toCSS(obj) {
            const parts = obj.stops.map(s => `${s.color} ${s.pos}%`);
            return `linear-gradient(${obj.direction}, ${parts.join(', ')})`;
        },

        apply() {
            const data = this.load();
            const css1 = this.toCSS(data.youKilled);
            const css2 = this.toCSS(data.youGotKilled);
            const css3 = this.toCSS(data.unified);

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
                #ui-killfeed-5 .killfeed-text {
                    background: ${css3} !important;
                    color: transparent !important;
                    -webkit-background-clip: text !important;
                    -webkit-text-fill-color: transparent !important;
                    font-weight: bold !important;
                }
            `;
            document.head.appendChild(style);
        }
    };

    // ===== This is for the killfeed manager =====
    const UIManager = {
        box: null,
        gradientTypes: [{
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
            }
        ],

        createStyles() {
            const css = `
                #customBox {
                    opacity: 0;
                    pointer-events: none;
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transition: opacity 0.25s ease;
                    width: 360px;
                    max-height: 70vh;
                    overflow: hidden;
                    background: linear-gradient(135deg, rgba(8,12,16,0.95) 0%, rgba(12,18,24,0.95) 100%);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(0,247,255,0.3);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0,247,255,0.15), 0 0 80px rgba(0,247,255,0.05);
                    color: #e0f7ff;
                    font-family: "Poppins", "Roboto", sans-serif;
                    z-index: 9999;
                }
                #customBox.ready {
                    opacity: 1;
                    pointer-events: auto;
                }
                #customBox.animated {
                    animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translate(-50%, -45%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }
                .custom-header {
                    cursor: move;
                    user-select: none;
                    position: relative;
                    padding: 12px 16px;
                    background: linear-gradient(90deg, rgba(0,247,255,0.1) 0%, rgba(0,150,200,0.05) 100%);
                    border-bottom: 1px solid rgba(0,247,255,0.2);
                    border-radius: 16px 16px 0 0;
                }
                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .title {
                    font-size: 17px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #00f7ff 0%, #00d4ff 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: none;
                }
                .version {
                    font-size: 10px;
                    color: rgba(0,247,255,0.5);
                    background: rgba(0,247,255,0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-weight: 600;
                }
                .close-btn {
                    position: absolute;
                    top: 14px;
                    right: 16px;
                    background: rgba(255,80,80,0.1) !important;
                    border: 1px solid rgba(255,80,80,0.3) !important;
                    color: #ff5050 !important;
                    font-size: 16px;
                    cursor: pointer;
                    padding: 4px 8px !important;
                    margin: 0 !important;
                    border-radius: 6px !important;
                    transition: all 0.2s ease;
                    font-weight: 700;
                }
                .close-btn:hover {
                    background: rgba(255,80,80,0.2) !important;
                    border-color: rgba(255,80,80,0.5) !important;
                }
                .tab-row {
                    display: flex;
                    gap: 0;
                    padding: 0;
                    background: linear-gradient(135deg, rgba(0,247,255,0.08) 0%, rgba(0,150,200,0.05) 100%);
                    border-bottom: 1px solid rgba(0,247,255,0.2);
                    border-radius: 0;
                    position: relative;
                }
                .tabBtn {
                    flex: 1;
                    background: transparent;
                    border: none;
                    border-radius: 0;
                    padding: 12px 8px;
                    font-weight: 600;
                    font-size: 13px;
                    color: rgba(0, 113, 117, 0.6);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid transparent;
                }
                .tabBtn:hover {
                    background: rgba(0,247,255,0.05);
                    color: rgba(0, 81, 83, 0.8);
                }
                .tabBtn.active {
                    background: rgba(0,247,255,0.1);
                    color: #004f52ff;
                }
                .tabBtn.active::before {
                    content: '';
                    position: absolute;
                    bottom: 0;     /* was top: 0 */
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: linear-gradient(90deg, #004042ff 0%, #006a80ff 100%);
                }
                .tabBtn:not(:last-child)::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: 20%;
                    bottom: 20%;
                    width: 1px;
                    background: rgba(0,247,255,0.15);
                }
                .tabBtn:hover::after {
                    background: rgba(0,247,255,0.25);
                }
                .tabSection {
                    padding: 12px;
                    max-height: calc(70vh - 180px);
                    overflow-y: auto;
                    animation: fadeIn 0.3s ease;
                }
                .tabSection::-webkit-scrollbar {
                    width: 6px;
                }
                .tabSection::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.2);
                    border-radius: 4px;
                }
                .tabSection::-webkit-scrollbar-thumb {
                    background: rgba(0,247,255,0.3);
                    border-radius: 4px;
                }
                .tabSection::-webkit-scrollbar-thumb:hover {
                    background: rgba(0,247,255,0.5);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .input-group {
                    margin-bottom: 12px;
                }
                #customBox label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(0,247,255,0.8);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                #customBox input[type=text] {
                    width: 100%;
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 8px;
                    padding: 8px 10px;
                    background: rgba(0,0,0,0.3);
                    color: #e8ffff;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                }
                #customBox input[type=color] {
                    width: 100%;
                    height: 40px;
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 8px;
                    background: rgba(0,0,0,0.3);
                    cursor: pointer;
                    padding: 4px;
                }
                #customBox input[type=color]::-webkit-color-swatch-wrapper {
                    padding: 2px;
                }
                #customBox input[type=color]::-webkit-color-swatch {
                    border: none;
                    border-radius: 6px;
                }
                #customBox input[type=text]:focus {
                    outline: none;
                    border-color: #00f7ff;
                    background: rgba(0,247,255,0.05);
                    box-shadow: 0 0 0 3px rgba(0,247,255,0.1);
                }
                .slider-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .transparency-slider {
                    flex: 1;
                    height: 6px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 3px;
                    outline: none;
                    -webkit-appearance: none;
                    appearance: none;
                }
                .transparency-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(135deg, #00f7ff 0%, #00b8cc 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,247,255,0.3);
                    transition: all 0.2s ease;
                }
                .transparency-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,247,255,0.4);
                }
                .transparency-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    background: linear-gradient(135deg, #00f7ff 0%, #00b8cc 100%);
                    border-radius: 50%;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 2px 6px rgba(0,247,255,0.3);
                }
                #transparencyValue {
                    font-size: 11px;
                    font-weight: 600;
                    color: #00f7ff;
                    min-width: 35px;
                    text-align: center;
                }
                #customBox select {
                    width: 100%;
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 8px;
                    padding: 8px 10px;
                    background: rgba(0,0,0,0.3);
                    color: #e8ffff;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    cursor: pointer;
                }
                #customBox select:focus {
                    outline: none;
                    border-color: #00f7ff;
                    background: rgba(0,247,255,0.05);
                    box-shadow: 0 0 0 3px rgba(0,247,255,0.1);
                }
                .shortcut-display {
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 8px;
                    padding: 8px 10px;
                    text-align: center;
                }
                #currentShortcut {
                    font-size: 12px;
                    font-weight: 600;
                    color: #00f7ff;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .gradient-block {
                    background: rgba(0,0,0,0.25);
                    border: 1px solid rgba(0,247,255,0.15);
                    border-radius: 10px;
                    margin-bottom: 10px;
                    padding: 10px;
                    transition: all 0.2s ease;
                }
                .gradient-block:hover {
                    border-color: rgba(0,247,255,0.3);
                    background: rgba(0,0,0,0.35);
                }
                .gradient-block h4 {
                    margin: 0 0 10px 0;
                    font-size: 13px;
                    font-weight: 600;
                    color: #00f7ff;
                }
                .gradient-controls {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                    margin-bottom: 10px;
                    flex-wrap: wrap;
                }
                .gradient-controls label {
                    margin: 0;
                    font-size: 11px;
                }
                select.gradient-dir {
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 6px;
                    color: #d0faff;
                    font-size: 12px;
                    padding: 5px 8px;
                    cursor: pointer;
                    flex: 1;
                }
                select.gradient-dir:focus {
                    outline: none;
                    border-color: #00f7ff;
                }
                .stop-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 6px 0;
                    padding: 6px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                }
                .stop-row input[type=color] {
                    width: 36px;
                    height: 36px;
                    border: 2px solid rgba(0,247,255,0.3);
                    border-radius: 6px;
                    cursor: pointer;
                    background: transparent;
                }
                .stop-row input[type=color]::-webkit-color-swatch-wrapper {
                    padding: 2px;
                }
                .stop-row input[type=color]::-webkit-color-swatch {
                    border: none;
                    border-radius: 4px;
                }
                .stop-row input[type=number] {
                    width: 60px;
                    background: rgba(0,0,0,0.4);
                    border: 1px solid rgba(0,247,255,0.2);
                    border-radius: 6px;
                    padding: 6px;
                    color: #d0faff;
                    font-size: 12px;
                    text-align: center;
                }
                .stop-row input[type=number]:focus {
                    outline: none;
                    border-color: #00f7ff;
                }
                .stop-row .delStop {
                    background: rgba(255,80,80,0.2) !important;
                    border: 1px solid rgba(255,80,80,0.3) !important;
                    color: #ff5050 !important;
                    padding: 4px 8px !important;
                    margin: 0 !important;
                    min-width: auto !important;
                }
                .stop-row .delStop:hover {
                    background: rgba(255,80,80,0.3) !important;
                }
                .preview-bar {
                    height: 32px;
                    border-radius: 8px;
                    margin-top: 8px;
                    border: 1px solid rgba(0,247,255,0.2);
                }
                #customBox button {
                    background: linear-gradient(135deg, #003b3fb2 0%);
                    border: none;
                    border-radius: 4px;
                    padding: 8px 14px;
                    margin: 4px;
                    cursor: pointer;
                    color: #ffffffff;
                    font-weight: 700;
                    font-size: 12px;
                    transition: all 0.2s ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                #customBox button:hover {
                    transform: translateY(-1px);
                }
                #customBox button:active {
                    transform: translateY(0);
                }
                .addStop {
                    background: rgba(0,247,255,0.15) !important;
                    color: #00f7ff !important;
                    border: 1px solid rgba(0,247,255,0.3) !important;
                    padding: 6px 10px !important;
                    font-size: 12px !important;
                    box-shadow: none !important;
                }
                .addStop:hover {
                    background: rgba(0,247,255,0.25) !important;
                }
                .button-row {
                    display: flex;
                    gap: 8px;
                    padding: 10px 12px;
                    background: rgba(0,0,0,0.2);
                    border-top: 1px solid rgba(0,247,255,0.15);
                    border-radius: 0 0 16px 16px;
                }
                .button-row button {
                    flex: 1;
                    margin: 0;
                }
                .reset-btn {
                    background: rgba(255,255,255,0.05) !important;
                    color: rgba(255,255,255,0.7) !important;
                    border: 1px solid rgba(255,255,255,0.15) !important;
                    box-shadow: none !important;
                }
                .reset-btn:hover {
                    background: rgba(255,255,255,0.1) !important;
                    color: #fff !important;
                }
                #customBox small {
                    display: block;
                    text-align: center;
                    color: rgba(0,247,255,0.4);
                    font-size: 9px;
                    padding: 6px;
                    background: rgba(0,0,0,0.2);
                }
            `;
            Utils.createStyle(css);
        },

        createBox() {
            this.box = document.createElement('div');
            this.box.id = 'customBox';
            this.box.innerHTML = `
                <div class="custom-header">
                    <div class="header-left">
                        <span class="title">Customizer</span>
                        <span class="version">v${CONFIG.version}</span>
                    </div>
                    <button class="close-btn">✕</button>
                </div>

                <div class="tab-row">
                    <button class="tabBtn active" data-tab="images">Images</button>
                    <button class="tabBtn" data-tab="colors">Killfeed</button>
                    <button class="tabBtn" data-tab="button">Button</button>
                    <button class="tabBtn" data-tab="settings">Settings</button>
                </div>

                <div id="tab-images" class="tabSection">
                    <div class="input-group">
                        <label>Background</label>
                        <input id="bgInput" type="text" placeholder="Enter image URL">
                    </div>
                    <div class="input-group">
                        <label>Avatar</label>
                        <input id="avInput" type="text" placeholder="Enter image URL">
                    </div>
                </div>

                <div id="tab-colors" class="tabSection" style="display:none;">
                    <div id="gradientEditors"></div>
                </div>

                <div id="tab-button" class="tabSection" style="display:none;">
                    <div class="input-group">
                        <label>Button Color</label>
                        <input id="buttonColorInput" type="color" value="#ba4141">
                    </div>
                    <div class="input-group">
                        <label>Transparency</label>
                        <div class="slider-container">
                            <input id="buttonTransparencyInput" type="range" min="0" max="100" value="100" class="transparency-slider">
                            <span id="transparencyValue">100%</span>
                        </div>
                    </div>
                </div>

                <div id="tab-settings" class="tabSection" style="display:none;">
                    <div class="input-group">
                        <label>Keyboard Shortcut</label>
                        <button id="setShortcutBtn">Set Key</button>
                    </div>
                    <div class="input-group">
                        <label>Current Shortcut</label>
                        <div class="shortcut-display">
                            <span id="currentShortcut">Shift + H</span>
                        </div>
                    </div>
                </div>

                <div id="imageButtons" class="button-row">
                    <button id="applyImageBtn">Apply</button>
                    <button id="resetImageBtn" class="reset-btn">Reset</button>
                </div>

                <div id="colorButtons" class="button-row" style="display:none;">
                    <button id="applyColorBtn">Apply</button>
                    <button id="resetColorBtn" class="reset-btn">Reset</button>
                </div>

                <div id="buttonButtons" class="button-row" style="display:none;">
                    <button id="applyButtonBtn">Apply</button>
                    <button id="resetButtonBtn" class="reset-btn">Reset</button>
                </div>

                <div id="settingsButtons" class="button-row" style="display:none;">
                    <button id="applySettingsBtn">Apply</button>
                    <button id="resetSettingsBtn" class="reset-btn">Reset</button>
                </div>

                <small id="shortcutHelp">Press Shift+H to toggle</small>
            `;

            this.box.style.left = '-9999px';
            this.box.style.top = '-9999px';
            this.box.style.visibility = 'hidden';
            document.body.appendChild(this.box);
            this.setupEventListeners();
            this.setupDragging();
            this.initializeInputs();
            this.initializeGradients();
            this.restorePosition();
            requestAnimationFrame(() => {
                this.box.style.visibility = 'visible';
                this.box.classList.add('ready');
                const savedPosition = localStorage.getItem('customBoxPosition');
                if (!savedPosition) {
                    this.box.classList.add('animated');
                }
            });

        },

        setupEventListeners() {
            this.box.addEventListener('click', (e) => {
                if (e.target.classList.contains('tabBtn')) {
                    const tab = e.target.dataset.tab;
                    this.box.querySelectorAll('.tabBtn').forEach(btn => btn.classList.remove('active'));
                    e.target.classList.add('active');

                    this.box.querySelectorAll('.tabSection').forEach(sec => sec.style.display = 'none');
                    this.box.querySelector(`#tab-${tab}`).style.display = 'block';

                    this.box.querySelector('#imageButtons').style.display = (tab === 'images') ? 'flex' : 'none';
                    this.box.querySelector('#colorButtons').style.display = (tab === 'colors') ? 'flex' : 'none';
                    this.box.querySelector('#buttonButtons').style.display = (tab === 'button') ? 'flex' : 'none';
                    this.box.querySelector('#settingsButtons').style.display = (tab === 'settings') ? 'flex' : 'none';
                }
            });

            this.box.querySelector('.close-btn').addEventListener('click', () => {
                this.box.style.display = 'none';
            });

            this.box.querySelector('#applyImageBtn').addEventListener('click', () => this.applyImages());
            this.box.querySelector('#resetImageBtn').addEventListener('click', () => this.resetImages());

            this.box.querySelector('#applyColorBtn').addEventListener('click', () => this.applyColors());
            this.box.querySelector('#resetColorBtn').addEventListener('click', () => this.resetColors());

            this.box.querySelector('#applyButtonBtn').addEventListener('click', () => this.applyButtonColor());
            this.box.querySelector('#resetButtonBtn').addEventListener('click', () => this.resetButtonColor());

            this.box.querySelector('#applySettingsBtn').addEventListener('click', () => this.applySettings());
            this.box.querySelector('#resetSettingsBtn').addEventListener('click', () => this.resetSettings());

            document.addEventListener('keydown', (e) => {
                const currentShortcut = localStorage.getItem('customShortcut') || CONFIG.toggleKey;
                const pressed = e.key.toLowerCase();
                if (pressed === currentShortcut) {
                    this.box.style.display = (this.box.style.display === 'none') ? 'block' : 'none';
                }
            });
        },

        setupDragging() {
            const header = this.box.querySelector('.custom-header');
            let isDragging = false;
            let offsetX = 0,
                offsetY = 0;

            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('close-btn')) return;
                isDragging = true;

                const rect = this.box.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                document.body.style.userSelect = 'none';
            });

            document.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const newLeft = e.clientX - offsetX;
                const newTop = e.clientY - offsetY;

                this.box.style.left = newLeft + 'px';
                this.box.style.top = newTop + 'px';
                this.box.style.transform = 'none';
            });

            document.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    document.body.style.userSelect = '';
                    const rect = this.box.getBoundingClientRect();
                    const position = {
                        left: rect.left,
                        top: rect.top
                    };
                    localStorage.setItem('customBoxPosition', JSON.stringify(position));
                }
            });
        },

        restorePosition() {
            const savedPosition = localStorage.getItem('customBoxPosition');
            if (savedPosition) {
                try {
                    const position = JSON.parse(savedPosition);
                    this.box.style.left = position.left + 'px';
                    this.box.style.top = position.top + 'px';
                    this.box.style.transform = 'none';
                } catch (e) {
                    console.warn('Failed to restore position', e);
                }
            } else {
                this.box.style.left = '50%';
                this.box.style.top = '50%';
                this.box.style.transform = 'translate(-50%, -50%)';
            }
        },

        initializeInputs() {
            const bgInput = this.box.querySelector('#bgInput');
            const avInput = this.box.querySelector('#avInput');
            const buttonColorInput = this.box.querySelector('#buttonColorInput');
            const buttonTransparencyInput = this.box.querySelector('#buttonTransparencyInput');
            const transparencyValue = this.box.querySelector('#transparencyValue');

            bgInput.value = localStorage.getItem('customBG') || CONFIG.defaultBG;
            avInput.value = localStorage.getItem('customAvatar') || CONFIG.defaultAvatar;
            buttonColorInput.value = localStorage.getItem('customButtonColor') || '#ba4141';

            const savedTransparency = localStorage.getItem('customButtonTransparency') || '100';
            buttonTransparencyInput.value = savedTransparency;
            transparencyValue.textContent = savedTransparency + '%';

            const savedButtonColor = localStorage.getItem('customButtonColor');
            const savedButtonTransparency = localStorage.getItem('customButtonTransparency');
            if (savedButtonColor) {
                this.updateButtonColorCSS(savedButtonColor, savedButtonTransparency);
            }

            buttonTransparencyInput.addEventListener('input', () => {
                const value = buttonTransparencyInput.value;
                transparencyValue.textContent = value + '%';
                this.updateButtonColorCSS(buttonColorInput.value, value);
            });

            buttonColorInput.addEventListener('input', () => {
                this.updateButtonColorCSS(buttonColorInput.value, buttonTransparencyInput.value);
            });

            const setShortcutBtn = this.box.querySelector('#setShortcutBtn');
            const savedShortcut = localStorage.getItem('customShortcut') || CONFIG.toggleKey;
            this.updateShortcutDisplay(savedShortcut);

            setShortcutBtn.addEventListener('click', () => {
                alert('Press any key to set as your toggle key...');
                const handleKey = (e) => {
                    e.preventDefault();
                    const newKey = e.key.toLowerCase();
                    localStorage.setItem('customShortcut', newKey);
                    this.updateShortcutDisplay(newKey);
                    alert(`Shortcut set to "${newKey.toUpperCase()}"`);
                    document.removeEventListener('keydown', handleKey);
                };
                document.addEventListener('keydown', handleKey);
            });
        },

        initializeGradients() {
            const container = this.box.querySelector('#gradientEditors');
            const current = GradientManager.load();

            this.gradientTypes.forEach(type => {
                const block = this.createGradientBlock(type, current[type.key]);
                container.appendChild(block);
                this.updatePreview(type.key);
            });
        },

        createGradientBlock(type, data) {
            const div = document.createElement('div');
            div.className = 'gradient-block';
            div.dataset.key = type.key;
            div.innerHTML = `
                <h4>${type.label}</h4>
                <div class="gradient-controls">
                    <select class="gradient-dir">
                        <option value="to right">→ Right</option>
                        <option value="to left">← Left</option>
                        <option value="to bottom">↓ Down</option>
                        <option value="to top">↑ Up</option>
                        <option value="to bottom right">↘ Diagonal</option>
                        <option value="to top left">↖ Diagonal</option>
                    </select>
                    <button class="addStop">+ Stop</button>
                </div>
                <div class="stops"></div>
                <div class="preview-bar"></div>
            `;

            const stopContainer = div.querySelector('.stops');
            const sortedStops = [...data.stops].sort((a, b) => a.pos - b.pos);
            sortedStops.forEach((s) => stopContainer.appendChild(this.createStopRow(type.key, s)));

            div.querySelector('.gradient-dir').value = data.direction;
            div.querySelector('.gradient-dir').addEventListener('change', () => this.updatePreview(type.key));

            div.querySelector('.addStop').addEventListener('click', () => {
                if (stopContainer.children.length >= 4) {
                    alert('Max 4 color stops!');
                    return;
                }

                const existingStops = Array.from(stopContainer.querySelectorAll('.stop-row')).map(row => {
                    return parseInt(row.querySelector('input[type=number]').value) || 0;
                }).sort((a, b) => a - b);

                let newPos = 50;
                if (existingStops.length > 0) {
                    let maxGap = 0;
                    let bestPos = 50;
                    if (existingStops[0] > 20) {
                        maxGap = existingStops[0];
                        bestPos = Math.floor(existingStops[0] / 2);
                    }

                    for (let i = 0; i < existingStops.length - 1; i++) {
                        const gap = existingStops[i + 1] - existingStops[i];
                        if (gap > maxGap && gap > 20) {
                            maxGap = gap;
                            bestPos = existingStops[i] + Math.floor(gap / 2);
                        }
                    }

                    if (existingStops[existingStops.length - 1] < 80) {
                        const endGap = 100 - existingStops[existingStops.length - 1];
                        if (endGap > maxGap) {
                            bestPos = existingStops[existingStops.length - 1] + Math.floor(endGap / 2);
                        }
                    }

                    newPos = bestPos;
                }

                const newStop = {
                    color: '#ffffff',
                    pos: newPos
                };
                stopContainer.appendChild(this.createStopRow(type.key, newStop));
                this.updatePreview(type.key);
                this.reorderStopsByPosition(type.key);
            });

            return div;
        },

        createStopRow(gKey, stop) {
            const div = document.createElement('div');
            div.className = 'stop-row';
            div.innerHTML = `
                <input type="color" value="${stop.color}">
                <input type="number" min="0" max="100" value="${stop.pos}" title="Position (%)">
                <button class="delStop">✕</button>
            `;

            div.querySelector('.delStop').addEventListener('click', () => {
                const block = this.box.querySelector(`.gradient-block[data-key="${gKey}"]`);
                const stopsContainer = block.querySelector('.stops');

                if (stopsContainer.children.length <= 1) {
                    alert('Need at least 1 color stop!');
                    return;
                }

                div.remove();
                this.updatePreview(gKey);
                this.reorderStopsByPosition(gKey);
            });

            div.querySelector('input[type=color]').addEventListener('input', () => this.updatePreview(gKey));
            div.querySelector('input[type=number]').addEventListener('input', () => {
                this.updatePreview(gKey);
                this.reorderStopsByPosition(gKey);
            });

            return div;
        },

        reorderStopsByPosition(gKey) {
            const block = this.box.querySelector(`.gradient-block[data-key="${gKey}"]`);
            if (!block) return;

            const stopContainer = block.querySelector('.stops');
            const stopRows = Array.from(stopContainer.querySelectorAll('.stop-row'));

            const stopsWithPositions = stopRows.map(row => {
                const posInput = row.querySelector('input[type=number]');
                const position = parseInt(posInput.value) || 0;
                return {
                    row,
                    position
                };
            });

            stopsWithPositions.sort((a, b) => a.position - b.position);

            stopContainer.innerHTML = '';
            stopsWithPositions.forEach(({
                row
            }) => {
                stopContainer.appendChild(row);
            });
        },

        collectGradientData(gKey) {
            const block = this.box.querySelector(`.gradient-block[data-key="${gKey}"]`);
            if (!block) return null;

            const dir = block.querySelector('.gradient-dir').value;
            const stopRows = block.querySelectorAll('.stop-row');

            let stops = Array.from(stopRows).map(r => {
                const colorInput = r.querySelector('input[type=color]');
                const posInput = r.querySelector('input[type=number]');

                if (!colorInput || !posInput) return null;

                return {
                    color: colorInput.value,
                    pos: Math.max(0, Math.min(100, parseInt(posInput.value) || 0))
                };
            }).filter(stop => stop !== null);

            stops.sort((a, b) => a.pos - b.pos);

            if (stops.length === 0) {
                stops = [{
                        color: '#ffffff',
                        pos: 0
                    },
                    {
                        color: '#ffffff',
                        pos: 100
                    }
                ];
            } else if (stops.length === 1) {
                const existingPos = stops[0].pos;
                if (existingPos <= 50) {
                    stops.push({
                        color: stops[0].color,
                        pos: 100
                    });
                } else {
                    stops.unshift({
                        color: stops[0].color,
                        pos: 0
                    });
                }
            }

            const uniqueStops = [];
            const usedPositions = new Set();

            stops.forEach(stop => {
                let pos = stop.pos;
                while (usedPositions.has(pos) && pos < 100) {
                    pos++;
                }
                if (pos > 100) pos = 100;

                uniqueStops.push({
                    color: stop.color,
                    pos
                });
                usedPositions.add(pos);
            });

            return {
                direction: dir,
                stops: uniqueStops
            };
        },

        updatePreview(gKey) {
            const data = this.collectGradientData(gKey);
            if (!data) return;

            const css = GradientManager.toCSS(data);
            const block = this.box.querySelector(`.gradient-block[data-key="${gKey}"]`);
            if (block && block.querySelector('.preview-bar')) {
                block.querySelector('.preview-bar').style.background = css;
            }

            const currentGradients = GradientManager.load();
            currentGradients[gKey] = data;
            GradientManager.save(currentGradients);
            GradientManager.apply();
        },

        applyImages() {
            const bgInput = this.box.querySelector('#bgInput');
            const avInput = this.box.querySelector('#avInput');
            const bg = bgInput.value.trim();
            const av = avInput.value.trim();

            if (bg) {
                localStorage.setItem('customBG', bg);
                ImageManager.applyBackground(bg);
            }
            if (av) {
                localStorage.setItem('customAvatar', av);
                ImageManager.applyAvatar(av);
            }
        },

        resetImages() {
            localStorage.removeItem('customBG');
            localStorage.removeItem('customAvatar');

            const bgInput = this.box.querySelector('#bgInput');
            const avInput = this.box.querySelector('#avInput');
            bgInput.value = CONFIG.defaultBG;
            avInput.value = CONFIG.defaultAvatar;

            ImageManager.applyBackground(CONFIG.defaultBG);
            ImageManager.applyAvatar(CONFIG.defaultAvatar);
        },

        applyColors() {
            const newGradients = {};
            this.gradientTypes.forEach(t => {
                newGradients[t.key] = this.collectGradientData(t.key);
            });
            GradientManager.save(newGradients);
            GradientManager.apply();
        },

        resetColors() {
            localStorage.removeItem('killfeedGradients');
            GradientManager.save(GRADIENT_DEFAULTS);
            GradientManager.apply();

            const container = this.box.querySelector('#gradientEditors');
            container.innerHTML = '';

            this.gradientTypes.forEach(t => {
                const block = this.createGradientBlock(t, GRADIENT_DEFAULTS[t.key]);
                container.appendChild(block);
                this.updatePreview(t.key);
            });
        },

        applyButtonColor() {
            const colorInput = this.box.querySelector('#buttonColorInput');
            const transparencyInput = this.box.querySelector('#buttonTransparencyInput');
            const color = colorInput.value;
            const transparency = transparencyInput.value;
            localStorage.setItem('customButtonColor', color);
            localStorage.setItem('customButtonTransparency', transparency);
            this.updateButtonColorCSS(color, transparency);
        },

        resetButtonColor() {
            localStorage.removeItem('customButtonColor');
            localStorage.removeItem('customButtonTransparency');
            const colorInput = this.box.querySelector('#buttonColorInput');
            const transparencyInput = this.box.querySelector('#buttonTransparencyInput');
            const transparencyValue = this.box.querySelector('#transparencyValue');
            colorInput.value = '#ba4141';
            transparencyInput.value = '100';
            transparencyValue.textContent = '100%';
            this.updateButtonColorCSS('#ba4141', '100');
        },

        updateButtonColorCSS(color, transparency = '100') {
            let style = document.getElementById('customButtonStyle');
            if (!style) {
                style = document.createElement('style');
                style.id = 'customButtonStyle';
                document.head.appendChild(style);
            }

            const hexToRgba = (hex, alpha) => {
                const r = parseInt(hex.slice(1, 3), 16);
                const g = parseInt(hex.slice(3, 5), 16);
                const b = parseInt(hex.slice(5, 7), 16);
                return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
            };

            const alpha = parseInt(transparency) / 100;
            const rgbaColor = hexToRgba(color, parseInt(transparency));
            const hoverAlpha = Math.min(1, alpha + 0.1);
            const hoverRgbaColor = hexToRgba(color, Math.round(hoverAlpha * 100));

            style.textContent = `
                #btn-customize,
                .btn-green,
                .btn-team-option,
                .account-details-button-wrapper,
                #btn-pass-locked {
                    border-bottom: 0 !important;
                    background: ${rgbaColor} !important;
                    color: #fff !important;
                    box-shadow: inset 0 -2px rgba(0, 0, 0, 0) !important;
                    border: 1px solid rgba(255, 255, 255, ${alpha * 0.4}) !important;
                    transition: all 0.2s ease !important;
                }
                #btn-customize:hover,
                .btn-green:hover,
                .btn-team-option:hover,
                .account-details-button-wrapper:hover,
                #btn-pass-locked:hover {
                    background: ${hoverRgbaColor} !important;
                    border-color: rgba(255, 255, 255, ${alpha * 0.6}) !important;
                    transform: translateY(-1px) !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, ${alpha * 0.3}) !important;
                }
            `;
        },

        updateShortcutDisplay(shortcut) {
            const currentShortcut = this.box.querySelector('#currentShortcut');
            const shortcutHelp = this.box.querySelector('#shortcutHelp');
            const displayKey = shortcut.length === 1 ? shortcut.toUpperCase() : shortcut;
            currentShortcut.textContent = `Key: ${displayKey}`;
            shortcutHelp.textContent = `Press ${displayKey} to toggle`;
        },

        applySettings() {
            const savedShortcut = localStorage.getItem('customShortcut') || CONFIG.toggleKey;
            this.updateShortcutDisplay(savedShortcut);
            Utils.log(`[Shortcut reapplied: ${savedShortcut}]`);
        },

        resetSettings() {
            localStorage.removeItem('customShortcut');
            const defaultKey = CONFIG.toggleKey;
            this.updateShortcutDisplay(defaultKey);
        },

    };

    async function init() {
        await CSSLoader.loadExternal();
        CSSLoader.loadOverrides();
        StatsDisplay.load();
        ImageManager.init();
        GradientManager.apply();
        window.addEventListener('load', () => {
            setTimeout(() => {
                UIManager.createStyles();
                UIManager.createBox();
            }, 200);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();