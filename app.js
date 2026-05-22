/* =============================================================
   SALES KIT — app.js
   Replikasi 100% dari arsitektur React + TanStack Router
   Seluruh logika aplikasi dalam 1 file vanilla JS
   ============================================================= */

'use strict';

// ── GLOBAL STATE ──────────────────────────────────────────────
let DB = {};          // data dari data.json
let currentRole = 'marketing';
let currentPage = '';
let homeTab = 'Aktif';
let inputStep = 0;
let gpsLocked = false;
let checkinStates = JSON.parse(localStorage.getItem('absensi_state') || '{}');
let clockInterval = null;
let selectedDetail = null; // customer yang sedang dilihat
let sheetChoice = null;
let sheetCustomer = null;
let sheetTargets = [];
let lbPeriod = 'Bulan';

const ROLE_KEY = 'saleskit.role';

// ── ICON SVG STRINGS (inline, dari folder icon/) ──────────────
const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#ih)"><path d="M12 18V15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.07 2.81985L3.14002 8.36985C2.36002 8.98985 1.86002 10.2998 2.03002 11.2798L3.36002 19.2398C3.60002 20.6598 4.96002 21.8098 6.40002 21.8098H17.6C19.03 21.8098 20.4 20.6498 20.64 19.2398L21.97 11.2798C22.13 10.2998 21.63 8.98985 20.86 8.36985L13.93 2.82985C12.86 1.96985 11.13 1.96985 10.07 2.81985Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="ih"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  trophy: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#clip0_4418_9480)"><path d="M4.26001 11.0195V15.9895C4.26001 17.8095 4.26001 17.8095 5.98001 18.9695L10.71 21.6995C11.42 22.1095 12.58 22.1095 13.29 21.6995L18.02 18.9695C19.74 17.8095 19.74 17.8095 19.74 15.9895V11.0195C19.74 9.19945 19.74 9.19945 18.02 8.03945L13.29 5.30945C12.58 4.89945 11.42 4.89945 10.71 5.30945L5.98001 8.03945C4.26001 9.19945 4.26001 9.19945 4.26001 11.0195Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.5 7.63V5C17.5 3 16.5 2 14.5 2H9.5C7.5 2 6.5 3 6.5 5V7.56" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.63 10.9909L13.2 11.8809C13.29 12.0209 13.49 12.1609 13.64 12.2009L14.66 12.4609C15.29 12.6209 15.46 13.1609 15.05 13.6609L14.38 14.4709C14.28 14.6009 14.2 14.8309 14.21 14.9909L14.27 16.0409C14.31 16.6909 13.85 17.0209 13.25 16.7809L12.27 16.3909C12.12 16.3309 11.87 16.3309 11.72 16.3909L10.74 16.7809C10.14 17.0209 9.68002 16.6809 9.72002 16.0409L9.78002 14.9909C9.79002 14.8309 9.71002 14.5909 9.61002 14.4709L8.94002 13.6609C8.53002 13.1609 8.70002 12.6209 9.33002 12.4609L10.35 12.2009C10.51 12.1609 10.71 12.0109 10.79 11.8809L11.36 10.9909C11.72 10.4509 12.28 10.4509 12.63 10.9909Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_4418_9480"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  users: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#ius)"><path d="M9.16006 10.87C9.06006 10.86 8.94006 10.86 8.83006 10.87C6.45006 10.79 4.56006 8.84 4.56006 6.44C4.56006 3.99 6.54006 2 9.00006 2C11.4501 2 13.4401 3.99 13.4401 6.44C13.4301 8.84 11.5401 10.79 9.16006 10.87Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.41 4C18.35 4 19.91 5.57 19.91 7.5C19.91 9.39 18.41 10.93 16.54 11C16.46 10.99 16.37 10.99 16.28 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.16006 14.56C1.74006 16.18 1.74006 18.82 4.16006 20.43C6.91006 22.27 11.4201 22.27 14.1701 20.43C16.5901 18.81 16.5901 16.17 14.1701 14.56C11.4301 12.73 6.92006 12.73 4.16006 14.56Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18.34 20C19.06 19.85 19.74 19.56 20.3 19.13C21.86 17.96 21.86 16.03 20.3 14.86C19.75 14.44 19.08 14.16 18.37 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="ius"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#ick)"><path d="M22 12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C17.52 2 22 6.48 22 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.71 15.1798L12.61 13.3298C12.07 13.0098 11.63 12.2398 11.63 11.6098V7.50977" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="ick"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  user: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#iusr)"><path d="M12.1601 10.87C12.0601 10.86 11.9401 10.86 11.8301 10.87C9.45009 10.79 7.56009 8.84 7.56009 6.44C7.56009 3.99 9.54009 2 12.0001 2C14.4501 2 16.4401 3.99 16.4401 6.44C16.4301 8.84 14.5401 10.79 12.1601 10.87Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.16009 14.56C4.74009 16.18 4.74009 18.82 7.16009 20.43C9.91009 22.27 14.4201 22.27 17.1701 20.43C19.5901 18.81 19.5901 16.17 17.1701 14.56C14.4301 12.73 9.92009 12.73 7.16009 14.56Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="iusr"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  inbox: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#inbx)"><path d="M12 2V8L14 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8L10 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 12C3 12 3 13.79 3 16V17C3 19.76 3 22 8 22H16C20 22 21 19.76 21 17V16C21 13.79 21 12 17 12C16 12 15.72 12.21 15.2 12.6L14.18 13.68C13 14.94 11 14.94 9.81 13.68L8.8 12.6C8.28 12.21 8 12 7 12Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 11.9991V7.99906C5 5.98906 5 4.32906 8 4.03906" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 11.9991V7.99906C19 5.98906 19 4.32906 16 4.03906" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="inbx"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  plus: `<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="none"><path d="M5 12H19" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 19V5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  mail: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M9 22H15C20 22 22 20 22 15V9C22 4 20 2 15 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13.0002H5.76C6.52 13.0002 7.21 13.4302 7.55 14.1102L8.44 15.9002C9 17.0002 10 17.0002 10.24 17.0002H13.77C14.53 17.0002 15.22 16.5702 15.56 15.8902L16.45 14.1002C16.79 13.4202 17.48 12.9902 18.24 12.9902H21.98" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  phone_icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M21.97 18.33C21.97 18.69 21.89 19.06 21.72 19.42C21.55 19.78 21.33 20.12 21.04 20.44C20.55 20.98 20.01 21.37 19.4 21.62C18.8 21.87 18.15 22 17.45 22C16.43 22 15.34 21.76 14.19 21.27C13.04 20.78 11.89 20.12 10.75 19.29C9.6 18.45 8.51 17.52 7.47 16.49C6.44 15.45 5.51 14.36 4.68 13.22C3.86 12.08 3.2 10.94 2.72 9.81C2.24 8.67 2 7.58 2 6.54C2 5.86 2.12 5.21 2.36 4.61C2.6 4 2.98 3.44 3.51 2.94C4.15 2.31 4.85 2 5.59 2C5.87 2 6.15 2.06 6.4 2.18C6.66 2.3 6.89 2.48 7.07 2.74L9.39 6.01C9.57 6.26 9.7 6.49 9.79 6.71C9.88 6.92 9.93 7.13 9.93 7.32C9.93 7.56 9.86 7.8 9.72 8.03C9.59 8.26 9.4 8.5 9.16 8.74L8.4 9.53C8.29 9.64 8.24 9.77 8.24 9.93C8.24 10.01 8.25 10.08 8.27 10.16C8.3 10.24 8.33 10.3 8.35 10.36C8.53 10.69 8.84 11.12 9.28 11.64C9.73 12.16 10.21 12.69 10.73 13.22C11.27 13.75 11.79 14.24 12.32 14.69C12.84 15.13 13.27 15.43 13.61 15.61C13.66 15.63 13.72 15.66 13.79 15.69C13.87 15.72 13.95 15.73 14.04 15.73C14.21 15.73 14.34 15.67 14.45 15.56L15.21 14.81C15.46 14.56 15.7 14.37 15.93 14.25C16.16 14.11 16.39 14.04 16.64 14.04C16.83 14.04 17.03 14.08 17.25 14.17C17.47 14.26 17.7 14.39 17.95 14.56L21.26 16.91C21.52 17.09 21.7 17.3 21.81 17.55C21.91 17.8 21.97 18.05 21.97 18.33Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10"/></svg>`,
  chevron_right: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M8.9101 20.6695C8.7201 20.6695 8.5301 20.5995 8.3801 20.4495C8.0901 20.1595 8.0901 19.6795 8.3801 19.3895L14.9001 12.8695C15.3801 12.3895 15.3801 11.6095 14.9001 11.1295L8.3801 4.60953C8.0901 4.31953 8.0901 3.83953 8.3801 3.54953C8.6701 3.25953 9.1501 3.25953 9.4401 3.54953L15.9601 10.0695C16.4701 10.5795 16.7601 11.2695 16.7601 11.9995C16.7601 12.7295 16.4801 13.4195 15.9601 13.9295L9.4401 20.4495C9.2901 20.5895 9.1001 20.6695 8.9101 20.6695Z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="none"><path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="none"><g clip-path="url(#icr)"><path d="M16.7 18.9794H7.29995C6.87995 18.9794 6.40995 18.6494 6.26995 18.2494L2.12995 6.66938C1.53996 5.00938 2.22996 4.49938 3.64996 5.51938L7.54995 8.30938C8.19995 8.75938 8.93995 8.52938 9.21995 7.79938L10.98 3.10938C11.54 1.60938 12.47 1.60938 13.03 3.10938L14.79 7.79938C15.07 8.52938 15.81 8.75938 16.45 8.30938L20.11 5.69937C21.67 4.57937 22.42 5.14938 21.78 6.95938L17.74 18.2694C17.59 18.6494 17.12 18.9794 16.7 18.9794Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="icr"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  trophy_sm: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="none"><g clip-path="url(#itrs)"><path d="M12 15.2V17.56" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.68994 22H15.3099C16.9999 22 17.6099 21.44 17.6099 19.82V17.56H6.38994V19.82C6.38994 21.44 6.99994 22 8.68994 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.39 2H17.61L18.14 9.26C18.35 12.17 16.22 14.9 13.31 15.13C12.44 15.2 11.56 15.2 10.69 15.13C7.78 14.9 5.65 12.17 5.86 9.26L6.39 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="itrs"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  medal: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><g clip-path="url(#imed)"><path d="M12 15.75C7.86 15.75 4.5 12.5 4.5 8.5C4.5 4.5 7.86 1.25 12 1.25C16.14 1.25 19.5 4.5 19.5 8.5C19.5 12.5 16.14 15.75 12 15.75ZM12 2.75C8.69 2.75 6 5.33 6 8.5C6 11.67 8.69 14.25 12 14.25C15.31 14.25 18 11.67 18 8.5C18 5.33 15.31 2.75 12 2.75Z"/><path d="M15.62 22.7501C15.34 22.7501 15.06 22.6801 14.77 22.5501L12.08 21.2801C12.05 21.2701 11.94 21.2701 11.9 21.2801L9.23002 22.5401C8.64002 22.8201 8.02001 22.8101 7.54001 22.5001C7.04001 22.1801 6.75002 21.5901 6.76002 20.8901L6.77 13.5101C6.77 13.1001 7.09 12.7401 7.52 12.7601C7.93 12.7601 8.27 13.1001 8.27 13.5101L8.26002 20.8901C8.26002 21.1101 8.32001 21.2201 8.35001 21.2301C8.37001 21.2401 8.46001 21.2501 8.60001 21.1801L11.28 19.9101C11.71 19.7101 12.3 19.7101 12.73 19.9101L15.42 21.1801C15.56 21.2501 15.65 21.2401 15.67 21.2301C15.7 21.2101 15.76 21.1001 15.76 20.8901V13.3301C15.76 12.9201 16.1 12.5801 16.51 12.5801C16.92 12.5801 17.26 12.9201 17.26 13.3301V20.8901C17.26 21.6001 16.97 22.1801 16.47 22.5001C16.21 22.6701 15.92 22.7501 15.62 22.7501Z"/></g><defs><clipPath id="imed"><rect width="24" height="24" fill="currentColor"/></clipPath></defs></svg>`,
  trending_up: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><g clip-path="url(#itu)"><path d="M22 6.75H17C16.59 6.75 16.25 6.41 16.25 6C16.25 5.59 16.59 5.25 17 5.25H22C22.41 5.25 22.75 5.59 22.75 6C22.75 6.41 22.41 6.75 22 6.75Z" fill="currentColor"/><path d="M22 11.75H17C16.59 11.75 16.25 11.41 16.25 11C16.25 10.59 16.59 10.25 17 10.25H22C22.41 10.25 22.75 10.59 22.75 11C22.75 11.41 22.41 11.75 22 11.75Z" fill="currentColor"/><path d="M19 16.75H17C16.59 16.75 16.25 16.41 16.25 16C16.25 15.59 16.59 15.25 17 15.25H19C19.41 15.25 19.75 15.59 19.75 16C19.75 16.41 19.41 16.75 19 16.75Z" fill="currentColor"/><path d="M6.28995 15.1802L2.99995 11.8902L6.28995 8.60016" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 11.8901H3" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="itu"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`,
  wallet: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="none"><path d="M22 12.5V16.5C22 20 20 22 16.5 22H7.5C4 22 2 20 2 16.5V7.5C2 4 4 2 7.5 2H11.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 12.5H19C17.9 12.5 17 11.6 17 10.5C17 9.4 17.9 8.5 19 8.5H22" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 7H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  alert_circle: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 8V13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.9945 16H12.0035" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M11.4 22.75H7.6C3.21 22.75 1.25 20.79 1.25 16.4V12.6C1.25 8.21 3.21 6.25 7.6 6.25H10.6C11.01 6.25 11.35 6.59 11.35 7C11.35 7.41 11.01 7.75 10.6 7.75H7.6C4.02 7.75 2.75 9.02 2.75 12.6V16.4C2.75 19.98 4.02 21.25 7.6 21.25H11.4C14.98 21.25 16.25 19.98 16.25 16.4V13.4C16.25 12.99 16.59 12.65 17 12.65C17.41 12.65 17.75 12.99 17.75 13.4V16.4C17.75 20.79 15.79 22.75 11.4 22.75Z"/><path d="M17.0001 14.1505H13.8001C10.9901 14.1505 9.8501 13.0105 9.8501 10.2005V7.00048C9.8501 6.70048 10.0301 6.42048 10.3101 6.31048C10.5901 6.19048 10.9101 6.26048 11.1301 6.47048L17.5301 12.8705C17.7401 13.0805 17.8101 13.4105 17.6901 13.6905C17.5801 13.9705 17.3001 14.1505 17.0001 14.1505Z"/><path d="M22 8.75048H19C16.34 8.75048 15.25 7.66048 15.25 5.00048V2.00048C15.25 1.70048 15.43 1.42048 15.71 1.31048C15.99 1.19048 16.31 1.26048 16.53 1.47048L22.53 7.47048C22.74 7.68048 22.81 8.01048 22.69 8.29048C22.58 8.57048 22.3 8.75048 22 8.75048Z"/></svg>`,
  pencil: `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="none"><path d="M5.53999 19.5196C4.92999 19.5196 4.35999 19.3096 3.94999 18.9196C3.42999 18.4296 3.17999 17.6896 3.26999 16.8896L3.63999 13.6496C3.70999 13.0396 4.07999 12.2296 4.50999 11.7896L12.72 3.09956C14.77 0.929561 16.91 0.869561 19.08 2.91956C21.25 4.96956 21.31 7.10956 19.26 9.27956L11.05 17.9696C10.63 18.4196 9.84999 18.8396 9.23999 18.9396L6.01999 19.4896C5.84999 19.4996 5.69999 19.5196 5.53999 19.5196Z"/><path d="M21 22.75H3C2.59 22.75 2.25 22.41 2.25 22C2.25 21.59 2.59 21.25 3 21.25H21C21.41 21.25 21.75 21.59 21.75 22C21.75 22.41 21.41 22.75 21 22.75Z"/></svg>`,
  map_pin_sm: `<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="none"><path d="M12 13.4295C13.7231 13.4295 15.12 12.0326 15.12 10.3095C15.12 8.58633 13.7231 7.18945 12 7.18945C10.2769 7.18945 8.88 8.58633 8.88 10.3095C8.88 12.0326 10.2769 13.4295 12 13.4295Z" stroke="currentColor" stroke-width="1.5"/><path d="M3.61995 8.49C5.58995-0.169998 18.42-0.159997 20.38 8.5C21.53 13.58 18.37 17.88 15.6 20.54C13.59 22.48 10.41 22.48 8.38995 20.54C5.62995 17.88 2.46995 13.57 3.61995 8.49Z" stroke="currentColor" stroke-width="1.5"/></svg>`,
  nav_icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M14.2199 21.6293C13.0399 21.6293 11.3699 20.7993 10.0499 16.8293L9.32988 14.6693L7.16988 13.9493C3.20988 12.6293 2.37988 10.9593 2.37988 9.77934C2.37988 8.60934 3.20988 6.92934 7.16988 5.59934L15.6599 2.76934C17.7799 2.05934 19.5499 2.26934 20.6399 3.34934C21.7299 4.42934 21.9399 6.20934 21.2299 8.32934L18.3999 16.8193C17.0699 20.7993 15.3999 21.6293 14.2199 21.6293Z"/><path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"/></svg>`,
};

// ── DATA LOADER ────────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch('data.json');
    DB = await res.json();
  } catch(e) {
    console.error('Gagal load data.json', e);
    DB = { customers:[], salesTrend:[], teamSalesTrend:[], leaderboard:[],
           attendanceHistory:[], lateRecap:[], teamStats:{},
           roleProfiles:{}, roleMeta:{} };
  }
}

// ── ROLE MANAGEMENT ───────────────────────────────────────────
function getRole() {
  return localStorage.getItem(ROLE_KEY) || null;
}
function setRoleLS(r) {
  localStorage.setItem(ROLE_KEY, r);
  currentRole = r;
}
function clearRoleLS() {
  localStorage.removeItem(ROLE_KEY);
  currentRole = 'marketing';
}

// ── SPA NAVIGATION ────────────────────────────────────────────
const PAGES = ['onboarding','login','home','leaderboard','absensi','profile','input','detail'];

// Safe helper for inline HTML onclick (avoids object literal quoting issues)
function navigateTab(tab) { navigate('home', { tab }); }
function navigateId(id)  { navigate('detail', { id }); }
function navigatePending() { navigate('home', { tab: 'Pending' }); }

function navigate(page, opts = {}) {
  // Stop clock if leaving absensi
  if (page !== 'absensi' && clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  // Hide all
  PAGES.forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) { el.classList.remove('active'); el.style.display = ''; }
  });

  // Update title
  const titles = {
    onboarding: 'Sales Kit — Pendataan Pelanggan Lapangan',
    login: 'Login — Sales Kit',
    home: 'Beranda — Sales Kit',
    leaderboard: 'Leaderboard — Sales Kit',
    absensi: 'Absensi — Sales Kit',
    profile: 'Profil — Sales Kit',
    input: 'Input Pelanggan — Sales Kit',
    detail: 'Detail Pelanggan — Sales Kit',
  };
  document.title = titles[page] || 'Sales Kit';

  currentPage = page;

  const el = document.getElementById('page-' + page);
  if (el) { el.classList.add('active'); el.style.display = 'flex'; }

  // Re-render dynamic pages
  if (page === 'home') renderHome(opts);
  if (page === 'leaderboard') renderLeaderboard();
  if (page === 'absensi') renderAbsensi();
  if (page === 'profile') renderProfile();
  if (page === 'input') renderInput(0);
  if (page === 'detail' && opts.id) renderDetail(opts.id);

  window.scrollTo(0, 0);
}

// ── BOTTOM NAV BUILDER ────────────────────────────────────────
function buildBottomNav(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const role = currentRole;

  const left = [
    { page: 'home',        label: 'Home',        icon: ICONS.home },
    role === 'manager'
      ? { page: 'leaderboard', label: 'Tim',         icon: ICONS.users }
      : { page: 'leaderboard', label: 'Leaderboard', icon: ICONS.trophy },
  ];
  const right = [
    { page: 'absensi', label: 'Absensi', icon: ICONS.clock },
    { page: 'profile', label: 'Profil',  icon: ICONS.user },
  ];

  const navItemHTML = (item) => {
    const active = currentPage === item.page;
    return `<button class="nav-item ${active ? 'active' : ''}" onclick="navigate('${item.page}')">
      ${item.icon}
      <span>${item.label}</span>
    </button>`;
  };

  let fabHTML = '';
  if (role === 'marketing') {
    fabHTML = `
      <div class="nav-fab-spacer"></div>
      <button class="nav-fab" onclick="navigate('input')" aria-label="Input Pelanggan Baru">${ICONS.plus}</button>`;
  } else if (role === 'admin') {
    fabHTML = `
      <div class="nav-fab-spacer"></div>
      <button class="nav-fab warning" onclick="navigatePending()" aria-label="Pending Konfirmasi">
        ${ICONS.inbox}
      </button>`;
  } else {
    fabHTML = `
      <div class="nav-fab-spacer"></div>
      <div style="position:absolute;left:50%;transform:translateX(-50%);top:-0.75rem;width:3.5rem;height:3.5rem;border-radius:50%;background:var(--gradient-brand);color:var(--primary-fg);display:flex;align-items:center;justify-content:center;font-size:0.625rem;font-weight:700;letter-spacing:0.075em;outline:4px solid var(--background);">MGR</div>`;
  }

  el.innerHTML = `<nav class="bottom-nav"><div class="bottom-nav-inner">
    ${left.map(navItemHTML).join('')}
    ${fabHTML}
    ${right.map(navItemHTML).join('')}
  </div></nav>`;
}

// ── HOME PAGE ─────────────────────────────────────────────────
function renderHome(opts = {}) {
  if (opts.tab) homeTab = opts.tab;

  const role = currentRole;
  const profile = DB.roleProfiles[role] || {};
  const meta = DB.roleMeta[role] || {};
  const customers = DB.customers || [];
  const pendingList = customers.filter(c => !c.confirmed);
  const confirmedList = customers.filter(c => c.confirmed);

  // Avatar & header
  document.getElementById('home-avatar').src = profile.avatar || '';
  document.getElementById('home-avatar').alt = profile.name || '';
  const greetings = { manager: 'Hai Manager 👔', admin: 'Halo Admin 🛡️', marketing: 'Hai 👋' };
  document.getElementById('home-greeting').textContent = greetings[role] || 'Hai 👋';
  document.getElementById('home-name').textContent = profile.name || '';
  const subs = { marketing: 'Marketing Lapangan', admin: 'Admin Data', manager: 'Manager' };
  document.getElementById('home-sub').textContent = subs[role] || '';

  // Summary card
  const sc = document.getElementById('home-summary-card');
  if (role === 'manager') {
    const ts = DB.teamStats || {};
    const trendData = DB.teamSalesTrend || [];
    const max = Math.max(...trendData.map(s => s.value));
    const points = trendData.map((s, i) => {
      const x = (i / (trendData.length - 1)) * 100;
      const y = 100 - (s.value / max) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');
    const pct = Math.min(100, Math.round((ts.totalRevenueMonth / ts.targetTeam) * 100));
    sc.innerHTML = `
      <div class="summary-card">
        <div class="summary-card-header">
          <div>
            <p style="font-size:0.75rem;font-weight:500;color:var(--muted-fg);letter-spacing:0.05em;">Tren Penjualan Tim (Agregat)</p>
            <div style="display:flex;align-items:baseline;gap:0.5rem;margin-top:0.25rem;">
              <h2 class="summary-big">Rp ${ts.totalRevenueMonth} Jt</h2>
              <span class="trend-up">${ICONS.trending_up}+${ts.growth}%</span>
            </div>
            <p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.25rem;">${ts.totalDealsMonth} deal · ${ts.activeMarketers} marketing</p>
          </div>
          <div class="badge badge-primary" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0.625rem;">${ICONS.wallet} Tim</div>
        </div>
        <div style="margin-top:0.75rem;position:relative;">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style="width:100%;height:6rem;">
            <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="oklch(0.45 0.22 264)" stop-opacity="0.3"/><stop offset="100%" stop-color="oklch(0.45 0.22 264)" stop-opacity="0"/></linearGradient></defs>
            <polyline fill="none" stroke="oklch(0.45 0.22 264)" stroke-width="2" points="${points}"/>
            <polygon fill="url(#g2)" points="0,60 ${points} 100,60"/>
          </svg>
          <div style="display:flex;justify-content:space-between;margin-top:0.5rem;">
            ${trendData.map(s => `<span style="display:flex;flex-direction:column;align-items:center;gap:0.125rem;font-size:0.625rem;color:var(--muted-fg);"><span style="color:var(--foreground);font-weight:600;">${s.value}</span><span>${s.label}</span></span>`).join('')}
          </div>
        </div>
        <div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border);">
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;margin-bottom:0.375rem;">
            <span style="font-weight:600;">Target Tim Bulan Ini</span>
            <span style="font-weight:700;font-variant-numeric:tabular-nums;">Rp ${ts.totalRevenueMonth} / ${ts.targetTeam} Jt</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>
          <p style="margin-top:0.375rem;font-size:0.6875rem;color:var(--muted-fg);">${pct}% tercapai · sisa Rp ${ts.targetTeam - ts.totalRevenueMonth} Jt</p>
        </div>
      </div>`;
  } else {
    const trendData = DB.salesTrend || [];
    const max = Math.max(...trendData.map(s => s.value));
    const points = trendData.map((s, i) => {
      const x = (i / (trendData.length - 1)) * 100;
      const y = 100 - (s.value / max) * 80 - 10;
      return `${x},${y}`;
    }).join(' ');
    const lastY = 100 - (trendData[trendData.length-1].value / max) * 80 - 10;
    sc.innerHTML = `
      <div class="summary-card">
        <div class="summary-card-header">
          <div>
            <p style="font-size:0.75rem;font-weight:500;color:var(--muted-fg);letter-spacing:0.05em;">Tren Penjualan Pribadi</p>
            <div style="display:flex;align-items:baseline;gap:0.5rem;margin-top:0.25rem;">
              <h2 class="summary-big">Rp 20 Jt</h2>
              <span class="trend-up">${ICONS.trending_up}+2,29%</span>
            </div>
            <p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.25rem;">vs bulan lalu (Rp 19,5 Jt)</p>
          </div>
          <div class="badge badge-primary" style="display:inline-flex;align-items:center;gap:0.25rem;padding:0.25rem 0.625rem;">${ICONS.wallet} 6 bln</div>
        </div>
        <div style="margin-top:0.75rem;position:relative;">
          <svg viewBox="0 0 100 60" preserveAspectRatio="none" style="width:100%;height:6rem;">
            <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="oklch(0.45 0.22 264)" stop-opacity="0.25"/><stop offset="100%" stop-color="oklch(0.45 0.22 264)" stop-opacity="0"/></linearGradient></defs>
            <polyline fill="none" stroke="oklch(0.45 0.22 264)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${points}"/>
            <polygon fill="url(#g1)" points="0,60 ${points} 100,60"/>
            <circle cx="100" cy="${lastY}" r="2.5" fill="oklch(0.45 0.22 264)"/>
          </svg>
          <div style="display:flex;justify-content:space-between;margin-top:0.5rem;">
            ${trendData.map(s => `<span style="display:flex;flex-direction:column;align-items:center;gap:0.125rem;font-size:0.625rem;color:var(--muted-fg);"><span style="color:var(--foreground);font-weight:600;">${s.value}jt</span><span>${s.label}</span></span>`).join('')}
          </div>
        </div>
      </div>`;
  }

  // Mini stats
  const ms = document.getElementById('home-mini-stats');
  const miniCard = (icon, label, value, suffix, tone, pct) => {
    const tones = { primary:'var(--primary-soft)', success:'var(--success-soft)', warning:'var(--warning-soft)' };
    const toneFg = { primary:'var(--primary-deep)', success:'var(--success)', warning:'var(--warning-fg)' };
    return `<div class="card mini-stat-card">
      <div style="width:2.25rem;height:2.25rem;border-radius:0.75rem;background:${tones[tone]};color:${toneFg[tone]};display:inline-flex;align-items:center;justify-content:center;">${icon}</div>
      <p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.5rem;font-weight:500;">${label}</p>
      <p class="mini-stat-value">${value} <span>${suffix}</span></p>
      ${pct !== undefined ? `<div class="progress-bar"><div class="progress-fill" style="width:${pct}%;"></div></div>` : ''}
    </div>`;
  };
  const tgt = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z" stroke="currentColor" stroke-width="1.5"/><path d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z" stroke="currentColor" stroke-width="1.5"/></svg>`;
  if (role === 'manager') {
    const ts = DB.teamStats || {};
    ms.innerHTML = miniCard(ICONS.users,'Marketing Aktif',ts.activeMarketers,'orang','primary') + miniCard(ICONS.trending_up,'Pertumbuhan',`+${ts.growth}%`,'QoQ','success');
  } else if (role === 'admin') {
    ms.innerHTML = miniCard(ICONS.inbox,'Menunggu Konfirmasi',pendingList.length,'data baru','warning') + miniCard(ICONS.alert_circle,'Tervalidasi',confirmedList.length,'pelanggan','success');
  } else {
    ms.innerHTML = miniCard(tgt,'Target Bulan','120','deal','primary',68) + miniCard(ICONS.users,'Pelanggan Baru','34','bulan ini','success');
  }

  // Alert banner (admin only)
  const banner = document.getElementById('home-alert-banner');
  if (role === 'admin' && pendingList.length > 0 && homeTab !== 'Pending') {
    banner.style.display = 'block';
    banner.innerHTML = `<div class="alert-banner" onclick="navigatePending()">
      <div class="alert-icon">${ICONS.alert_circle}</div>
      <div style="flex:1;text-align:left;">
        <p style="font-weight:700;font-size:0.875rem;">${pendingList.length} data baru menunggu konfirmasi</p>
        <p style="font-size:0.6875rem;opacity:0.80;">Tinjau sebelum masuk database utama.</p>
      </div>
      ${ICONS.chevron_right}
    </div>`;
  } else {
    banner.style.display = 'none';
  }

  // Tabs
  const allTabs = ['Aktif','Potensi','Tunda','Cabut'];
  const visibleTabs = role === 'admin' ? ['Pending', ...allTabs] : allTabs;
  if (!visibleTabs.includes(homeTab)) homeTab = role === 'admin' && pendingList.length ? 'Pending' : 'Aktif';

  const tabsEl = document.getElementById('home-tabs');
  tabsEl.innerHTML = visibleTabs.map(t => {
    const count = t === 'Pending' ? pendingList.length : confirmedList.filter(c => c.status === t).length;
    const isPending = t === 'Pending';
    let cls = 'tab-pill';
    if (homeTab === t) cls += isPending ? ' active-warning' : ' active';
    else if (isPending) cls += ' inactive-warning';
    return `<button class="${cls}" onclick="setHomeTab('${t}');renderCustomerList();">${t}<span class="tab-count">${count}</span></button>`;
  }).join('');

  renderCustomerList();
  buildBottomNav('home-bottom-nav');
}

function setHomeTab(t) {
  homeTab = t;
  // Re-render tabs to update active state
  const customers = DB.customers || [];
  const pendingList = customers.filter(c => !c.confirmed);
  const confirmedList = customers.filter(c => c.confirmed);
  const role = currentRole;
  const allTabs = ['Aktif','Potensi','Tunda','Cabut'];
  const visibleTabs = role === 'admin' ? ['Pending', ...allTabs] : allTabs;
  const tabsEl = document.getElementById('home-tabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = visibleTabs.map(tab => {
    const count = tab === 'Pending' ? pendingList.length : confirmedList.filter(c => c.status === tab).length;
    const isPending = tab === 'Pending';
    let cls = 'tab-pill';
    if (homeTab === tab) cls += isPending ? ' active-warning' : ' active';
    else if (isPending) cls += ' inactive-warning';
    return `<button class="${cls}" onclick="setHomeTab('${tab}');renderCustomerList();">${tab}<span class="tab-count">${count}</span></button>`;
  }).join('');
}

function renderCustomerList() {
  const q = (document.getElementById('home-search')?.value || '').toLowerCase();
  const customers = DB.customers || [];
  const pendingList = customers.filter(c => !c.confirmed);
  const confirmedList = customers.filter(c => c.confirmed);
  const base = homeTab === 'Pending' ? pendingList : confirmedList.filter(c => c.status === homeTab);
  const filtered = base.filter(c => c.name.toLowerCase().includes(q));
  const role = currentRole;

  const list = document.getElementById('customer-list');
  if (!list) return;

  if (!filtered.length) {
    list.innerHTML = `<div class="card" style="border-style:dashed;padding:2.5rem 1rem;text-align:center;color:var(--muted-fg);font-size:0.875rem;">Tidak ada pelanggan pada kategori ini.</div>`;
    return;
  }

  list.innerHTML = filtered.map(c => {
    const isPending = !c.confirmed;
    const statusMap = { Aktif:'success', Potensi:'warning', Tunda:'destructive', Cabut:'destructive' };
    const canEdit = role === 'admin';
    const canShift = role === 'admin' && c.status !== 'Aktif';

    let actionBtns = '';
    if (isPending && role === 'admin') {
      actionBtns = `<div class="grid-2" style="margin-top:0.75rem;">
        <button onclick="event.preventDefault();" style="color:var(--destructive);font-weight:600;font-size:0.875rem;padding:0.625rem;border-radius:0.75rem;background:var(--card);border:1px solid color-mix(in oklab,var(--destructive) 30%,transparent);">Tolak</button>
        <button onclick="event.preventDefault();" style="color:#fff;font-weight:600;font-size:0.875rem;padding:0.625rem;border-radius:0.75rem;background:var(--success);">Konfirmasi</button>
      </div>`;
    } else if (!isPending && (canEdit || canShift)) {
      const editBtn = canEdit ? `<a onclick="event.stopPropagation(); navigate('input');" style="display:flex;align-items:center;justify-content:center;gap:0.375rem;color:var(--primary);font-weight:600;font-size:0.875rem;padding:0.625rem;border-radius:0.75rem;background:var(--primary-soft);">${ICONS.pencil} Edit Data</a>` : '';
      const shiftBtn = canShift ? `<button onclick="event.preventDefault();openSheet('${c.id}');" style="color:var(--success);font-weight:600;font-size:0.875rem;padding:0.625rem;border-radius:0.75rem;background:var(--success-soft);border:none;cursor:pointer;">Alihkan Status</button>` : '';
      const deactivateBtn = (!canShift && canEdit && c.status === 'Aktif') ? `<button onclick="event.preventDefault();openSheet('${c.id}');" style="color:var(--destructive);font-weight:600;font-size:0.875rem;padding:0.625rem;border-radius:0.75rem;background:var(--destructive-soft);border:none;cursor:pointer;">Nonaktifkan</button>` : '';
      if (editBtn || shiftBtn || deactivateBtn) {
        actionBtns = `<div class="grid-2" style="margin-top:0.75rem;">${editBtn}${shiftBtn || deactivateBtn}</div>`;
      }
    }

    return `<div class="customer-card${isPending ? ' pending' : ''}" onclick="navigateId('${c.id}')">
      <div class="customer-card-inner">
        ${isPending ? `<div class="pending-label"><span class="pending-dot"></span> Belum Konfirmasi${c.submittedBy ? ` <span style="font-weight:500;text-transform:none;letter-spacing:normal;opacity:0.75;">· dari ${c.submittedBy}</span>` : ''}</div>` : ''}
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:0.75rem;">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:0.5rem;flex-wrap:wrap;">
              <h3 class="customer-name">${c.name}</h3>
              <span class="badge status-${c.status}">${c.status}</span>
            </div>
            <p class="customer-meta">Tempo: ${c.tempo} • ID ${c.id}</p>
          </div>
          <span style="color:var(--muted-fg);flex-shrink:0;">${ICONS.chevron_right}</span>
        </div>
        <div class="info-row" style="margin-top:0.75rem;">
          <span style="color:var(--muted-fg);">Paket</span><span style="font-weight:500;">${c.paket}</span>
          <span style="color:var(--muted-fg);">Alamat</span><span style="font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.alamat}</span>
        </div>
        ${actionBtns}
      </div>
    </div>`;
  }).join('');
}

// ── LEADERBOARD PAGE ──────────────────────────────────────────
function renderLeaderboard() {
  const lb = DB.leaderboard || [];
  const top3 = lb.slice(0, 3);
  const q = (document.getElementById('lb-search')?.value || '').toLowerCase();
  const rest = lb.slice(3).filter(p => p.name.toLowerCase().includes(q));

  // Period switch
  const periods = ['Minggu','Bulan','Tahun'];
  document.getElementById('period-switch').innerHTML = periods.map(p =>
    `<button class="period-btn ${lbPeriod === p ? 'active' : ''}" onclick="lbPeriod='${p}';renderLeaderboard();">${p}</button>`
  ).join('');
  document.getElementById('lb-sub').textContent = `Top marketing periode ${lbPeriod.toLowerCase()} ini`;

  // Podium
  const heights = ['h-20','h-28','h-16'];
  const order = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd
  const places = [2, 1, 3];
  const podiumEl = document.getElementById('podium');
  podiumEl.innerHTML = order.map((p, i) => {
    const place = places[i];
    const isFirst = place === 1;
    const icons = { 1: ICONS.crown, 2: ICONS.trophy_sm, 3: ICONS.medal };
    const badgeCls = place === 1 ? 'background:var(--warning-soft);color:var(--warning-fg);' : place === 2 ? 'background:var(--muted);color:rgba(0,0,0,0.5);' : 'background:var(--warning-soft);color:var(--warning-fg);opacity:0.7;';
    const barHeights = [80, 112, 64];
    return `<div class="podium-item">
      <div class="podium-avatar ${isFirst ? 'highlight' : ''}">
        ${p.name[0]}
        <span class="podium-badge" style="${badgeCls}">${icons[place]}</span>
      </div>
      <p class="podium-name">${p.name}</p>
      <p class="podium-deals">${p.deals} deal</p>
      <div class="podium-bar ${isFirst ? 'highlight' : ''}" style="height:${barHeights[i]}px;">
        <span>#${place}</span>
      </div>
    </div>`;
  }).join('');

  // List
  document.getElementById('lb-list').innerHTML = rest.map(p =>
    `<div class="lb-row">
      <span class="lb-rank">#${p.rank}</span>
      <div class="lb-avatar">${p.name[0]}</div>
      <div style="flex:1;min-width:0;">
        <p style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.name}</p>
        <p style="font-size:0.75rem;color:var(--muted-fg);">${p.deals} deal</p>
      </div>
      <p class="lb-revenue">Rp ${p.revenue} jt</p>
    </div>`
  ).join('');

  buildBottomNav('lb-bottom-nav');
}

// ── ABSENSI PAGE ──────────────────────────────────────────────
function renderAbsensi() {
  const role = currentRole;
  const profile = DB.roleProfiles[role] || {};
  const meta = DB.roleMeta[role] || {};
  document.getElementById('absen-avatar').src = profile.avatar || '';
  document.getElementById('absen-name').textContent = profile.name || '';
  document.getElementById('absen-meta').textContent = `${meta.label} • ID ${profile.id}`;

  startClock();

  const lateRecap = DB.lateRecap || [];
  const attendanceHistory = DB.attendanceHistory || [];
  const totalLate = lateRecap.reduce((s, r) => s + r.lateCount, 0);
  const extra = document.getElementById('absen-extra');

  if (role === 'manager') {
    extra.innerHTML = `<section style="padding:0 1rem;margin-top:1.25rem;">
      <div class="grid-2" style="margin-bottom:1rem;">
        <div class="card" style="padding:1rem;">
          <div style="width:2.25rem;height:2.25rem;border-radius:0.75rem;background:var(--destructive-soft);color:var(--destructive);display:inline-flex;align-items:center;justify-content:center;">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M22 7.03039L13.49 15.5404C13.1 15.9304 12.47 15.9304 12.08 15.5404L8.46 11.9204C8.07 11.5304 7.44 11.5304 7.05 11.9204L2 17.0004" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M18 7H22V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.5rem;font-weight:500;">Total Telat Bulan Ini</p>
          <p style="font-size:1.25rem;font-weight:700;">${totalLate} <span style="font-size:0.75rem;font-weight:500;color:var(--muted-fg);">kejadian</span></p>
        </div>
        <div class="card" style="padding:1rem;">
          <div style="width:2.25rem;height:2.25rem;border-radius:0.75rem;background:var(--warning-soft);color:var(--warning-fg);display:inline-flex;align-items:center;justify-content:center;">${ICONS.users}</div>
          <p style="font-size:0.75rem;color:var(--muted-fg);margin-top:0.5rem;font-weight:500;">Anggota Bermasalah</p>
          <p style="font-size:1.25rem;font-weight:700;">${lateRecap.length} <span style="font-size:0.75rem;font-weight:500;color:var(--muted-fg);">orang</span></p>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
        <h2 style="font-weight:700;">Rekap Keterlambatan Tim</h2>
        <button style="font-size:0.75rem;font-weight:600;color:var(--primary);background:none;border:none;cursor:pointer;">Export</button>
      </div>
      <div class="space-y-3 pb-4">
        ${lateRecap.map(r => {
          const bg = r.lateCount >= 5 ? 'background:var(--destructive);color:#fff;' : r.lateCount >= 3 ? 'background:var(--warning);color:var(--warning-fg);' : 'background:var(--primary-soft);color:var(--primary-deep);';
          const badgeCls = r.lateCount >= 5 ? 'background:var(--destructive-soft);color:var(--destructive);' : r.lateCount >= 3 ? 'background:var(--warning-soft);color:var(--warning-fg);' : 'background:var(--muted);color:var(--muted-fg);';
          return `<div class="late-row">
            <div class="late-initials" style="${bg}">${r.initials}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                <p style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.name}</p>
                <span class="late-badge" style="${badgeCls}">${r.lateCount}× telat</span>
              </div>
              <p class="late-meta">${r.role}</p>
              <div class="late-detail">
                <span style="display:inline-flex;align-items:center;gap:0.25rem;">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" stroke="none"><path d="M12 14.75C11.59 14.75 11.25 14.41 11.25 14V9C11.25 8.59 11.59 8.25 12 8.25C12.41 8.25 12.75 8.59 12.75 9V14C12.75 14.41 12.41 14.75 12 14.75Z"/><path d="M18.06 22.1598H5.93998C3.98998 22.1598 2.49998 21.4498 1.73998 20.1698C0.989976 18.8898 1.08998 17.2398 2.03998 15.5298L8.09998 4.62984C9.09998 2.82984 10.48 1.83984 12 1.83984C13.52 1.83984 14.9 2.82984 15.9 4.62984L21.96 15.5398C22.91 17.2498 23.02 18.8898 22.26 20.1798C21.5 21.4498 20.01 22.1598 18.06 22.1598Z"/></svg>
                  rata-rata +${r.avgMinutes} mnt
                </span>
                <span style="display:inline-flex;align-items:center;gap:0.25rem;">${ICONS.clock} ${r.lastLate}</span>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  } else {
    extra.innerHTML = `<section style="padding:0 1rem;margin-top:1.25rem;padding-bottom:1rem;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.5rem;">
        <h2 style="font-weight:700;">Riwayat Absensi</h2>
        <button style="font-size:0.75rem;font-weight:600;color:var(--primary);background:none;border:none;cursor:pointer;">Lihat Semua</button>
      </div>
      <div class="space-y-3">
        ${attendanceHistory.map(a => `
          <div class="hist-row">
            <div class="hist-icon ${a.type === 'Masuk' ? 'masuk' : 'keluar'}">
              ${a.type === 'Masuk' ? ICONS.inbox : `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><path d="M8.8999 7.56023C9.2099 3.96023 11.0599 2.49023 15.1099 2.49023H15.2399C19.7099 2.49023 21.4999 4.28023 21.4999 8.75023V15.2702C21.4999 19.7402 19.7099 21.5302 15.2399 21.5302H15.1099C11.0899 21.5302 9.2399 20.0802 8.9099 16.5402" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.0001 12H3.62012" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5.85 8.65039L2.5 12.0004L5.85 15.3504" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
                <p style="font-weight:700;">${a.type}</p>
                <span class="badge ${a.status === 'Tepat Waktu' ? 'badge-success' : 'badge-destructive'}">${a.status}</span>
              </div>
              <p style="font-size:0.75rem;color:var(--muted-fg);">${a.date}</p>
              <div style="display:flex;align-items:center;gap:0.75rem;font-size:0.75rem;margin-top:0.25rem;">
                <span style="display:inline-flex;align-items:center;gap:0.25rem;">${ICONS.map_pin_sm} ${a.location}</span>
                <span style="display:inline-flex;align-items:center;gap:0.25rem;">${ICONS.clock} ${a.time}</span>
              </div>
            </div>
          </div>`).join('')}
      </div>
    </section>`;
  }

  buildBottomNav('absen-bottom-nav');
  updateAbsenUI();
}

function startClock() {
  if (clockInterval) clearInterval(clockInterval);
  const updateClock = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });
    const dateStr = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const tc = document.getElementById('absen-clock');
    const td = document.getElementById('absen-date');
    if (tc) tc.textContent = timeStr;
    if (td) td.textContent = dateStr;
  };
  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

function updateAbsenUI() {
  const state = checkinStates[currentRole] || {};
  const inBtn = document.getElementById('checkin-btn');
  const outBtn = document.getElementById('checkout-btn');
  const inTime = document.getElementById('checkin-time');
  const outTime = document.getElementById('checkout-time');
  
  if (state.in) {
    if (inTime) inTime.textContent = state.in;
    if (inBtn) inBtn.disabled = true;
    if (outBtn) outBtn.disabled = !!state.out;
    if (outTime && state.out) outTime.textContent = state.out;
    else if (outTime) outTime.textContent = '--:--:--';
  } else {
    if (inTime) inTime.textContent = '--:--:--';
    if (outTime) outTime.textContent = '--:--:--';
    if (inBtn) inBtn.disabled = false;
    if (outBtn) outBtn.disabled = true;
  }
}

function doCheckinWithPhoto(event) {
  if (event.target.files && event.target.files.length > 0) {
    doCheckin();
  }
}

function doCheckin() {
  const now = new Date().toLocaleTimeString('id-ID', { hour12: false });
  if (!checkinStates[currentRole]) checkinStates[currentRole] = {};
  checkinStates[currentRole].in = now;
  localStorage.setItem('absensi_state', JSON.stringify(checkinStates));
  updateAbsenUI();
}

function doCheckout() {
  const now = new Date().toLocaleTimeString('id-ID', { hour12: false });
  if (!checkinStates[currentRole]) checkinStates[currentRole] = {};
  checkinStates[currentRole].out = now;
  localStorage.setItem('absensi_state', JSON.stringify(checkinStates));
  updateAbsenUI();
}

// ── PROFILE PAGE ──────────────────────────────────────────────
function renderProfile() {
  const role = currentRole;
  const p = DB.roleProfiles[role] || {};
  const meta = DB.roleMeta[role] || {};

  document.getElementById('profile-avatar-img').src = p.avatar || '';
  document.getElementById('profile-name').textContent = p.name || '';
  document.getElementById('profile-id').textContent = `ID ${p.id}`;
  document.getElementById('profile-badge').textContent = meta.label || '';

  // Stats
  const statsMap = {
    manager:   [{l:'Tim',v:'24'}, {l:'Deal Tim',v:'487'}, {l:'Growth',v:'+9.8%'}],
    admin:     [{l:'Validasi',v:'312'}, {l:'Hari Aktif',v:'210'}],
    marketing: [{l:'Deal',v:'92'}, {l:'Hari Aktif',v:'124'}],
  };
  const stats = statsMap[role] || [];
  const statsEl = document.getElementById('profile-stats');
  statsEl.className = `profile-stats cols-${stats.length}`;
  statsEl.innerHTML = stats.map(s => `<div><p class="profile-stat-val">${s.v}</p><p class="profile-stat-lbl">${s.l}</p></div>`).join('');

  // Info card
  const firstName = (p.name || '').split(' ')[0];
  const infoCard = document.getElementById('profile-info-card');
  const infoItem = (icon, label, value) => `<div class="group-item">
    <div class="icon-wrap icon-wrap-sm icon-primary">${icon}</div>
    <div class="group-item-content">
      <p class="group-item-label">${label}</p>
      <p class="group-item-value">${value}</p>
    </div>
  </div>`;
  infoCard.innerHTML =
    infoItem(ICONS.user, 'Username', firstName) +
    infoItem(ICONS.mail, 'Email', p.email || '') +
    infoItem(ICONS.phone_icon, 'Telepon', p.phone || '');

  buildBottomNav('profile-bottom-nav');
}

// ── INPUT (STEPPER) PAGE ──────────────────────────────────────
const STEPS = ['Data Diri','Alamat','Jenis Paket'];

function renderInput(step = 0) {
  if (!document.getElementById('kecamatan-list')) {
    document.body.insertAdjacentHTML('beforeend', `
      <datalist id="kecamatan-list">
        <option value="Surabaya">
        <option value="Sidoarjo">
        <option value="Gresik">
        <option value="Mojokerto">
        <option value="Malang">
        <option value="Pasuruan">
        <option value="Bangkalan">
        <option value="Sampang">
        <option value="Pamekasan">
        <option value="Sumenep">
      </datalist>
    `);
  }
  inputStep = step;
  gpsLocked = false;

  // Stepper
  const stepperEl = document.getElementById('input-stepper');
  stepperEl.innerHTML = STEPS.map((s, i) => `<div class="step-item">
    <div class="step-bar ${i <= step ? 'done' : 'todo'}"></div>
    <p class="step-label ${i === step ? 'active' : 'inactive'}">${i+1}. ${s}</p>
  </div>`).join('');

  // Content
  const content = document.getElementById('input-form-content');
  if (step === 0) {
    content.innerHTML = `<div class="card" style="padding:1.25rem;" class="space-y-4">
      <div><label class="field-label">Nama Lengkap <span class="req">*</span></label><div class="field-wrap"><input class="input" placeholder="Nama lengkap pelanggan" /></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Nomor Telepon <span class="req">*</span></label><div class="field-wrap"><input class="input" placeholder="08xxxxxxxxxx" type="tel" /></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Email (Opsional)</label><div class="field-wrap"><input class="input" placeholder="nama@email.com" type="email" /></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Foto KTP</label><div class="field-wrap">
        <button type="button" class="upload-zone">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><g clip-path="url(#upl)"><path d="M9 17V11L7 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 11L11 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 10V15C22 20 20 22 15 22H9C4 22 2 20 2 15V9C2 4 4 2 9 2H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 10H18C15 10 14 9 14 6V2L22 10Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="upl"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>
          <span>Tap untuk upload foto KTP</span>
        </button>
      </div></div>
    </div>`;
  } else if (step === 1) {
    content.innerHTML = `<div class="card" style="padding:1.25rem;">
      <div id="gps-block" class="gps-block unlocked">
        <div style="display:flex;align-items:flex-start;gap:0.75rem;">
          <div class="gps-icon-wrap unlocked" id="gps-icon-wrap">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none"><path d="M14.2199 21.6293C13.0399 21.6293 11.3699 20.7993 10.0499 16.8293L9.32988 14.6693L7.16988 13.9493C3.20988 12.6293 2.37988 10.9593 2.37988 9.77934C2.37988 8.60934 3.20988 6.92934 7.16988 5.59934L15.6599 2.76934C17.7799 2.05934 19.5499 2.26934 20.6399 3.34934C21.7299 4.42934 21.9399 6.20934 21.2299 8.32934L18.3999 16.8193C17.0699 20.7993 15.3999 21.6293 14.2199 21.6293Z"/><path d="M10.11 14.4C9.92005 14.4 9.73005 14.33 9.58005 14.18C9.29005 13.89 9.29005 13.41 9.58005 13.12L13.16 9.53C13.45 9.24 13.93 9.24 14.22 9.53C14.51 9.82 14.51 10.3 14.22 10.59L10.64 14.18C10.5 14.33 10.3 14.4 10.11 14.4Z"/></svg>
          </div>
          <div style="flex:1;">
            <p id="gps-label" style="font-weight:600;font-size:0.875rem;">Aktifkan GPS</p>
            <p id="gps-sublabel" style="font-size:0.75rem;color:var(--muted-fg);">Wajib untuk validasi data lapangan.</p>
            <div class="gps-bars" id="gps-bars">
              <div class="gps-bar-seg"></div><div class="gps-bar-seg"></div><div class="gps-bar-seg"></div>
              <span style="font-size:0.6875rem;font-weight:600;margin-left:0.25rem;">—</span>
            </div>
          </div>
          <button type="button" id="gps-btn" onclick="lockGPS()" style="font-size:0.75rem;font-weight:600;color:var(--primary);padding:0.375rem 0.75rem;border-radius:0.5rem;background:var(--card);border:1px solid var(--border);cursor:pointer;">Lock</button>
        </div>
      </div>
      <div style="margin-top:1rem;"><label class="field-label">Provinsi <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;"><select class="input" style="appearance:none;padding-right:2.5rem;"><option value="">Pilih Provinsi</option><option>Jawa Timur</option><option>Jawa Tengah</option></select><svg style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 16.7996C11.3 16.7996 10.6 16.5296 10.07 15.9996L3.55002 9.47965C3.26002 9.18965 3.26002 8.70965 3.55002 8.41965C3.84002 8.12965 4.32002 8.12965 4.61002 8.41965L11.13 14.9396C11.61 15.4196 12.39 15.4196 12.87 14.9396L19.39 8.41965C19.68 8.12965 20.16 8.12965 20.45 8.41965C20.74 8.70965 20.74 9.18965 20.45 9.47965L13.93 15.9996C13.4 16.5296 12.7 16.7996 12 16.7996Z"/></svg></div></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Kota / Kecamatan <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;"><input type="text" list="kecamatan-list" class="input" placeholder="Pilih atau Ketik Kota / Kecamatan"></div></div></div>
      <div style="margin-top:1rem;display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;">
        <div><label class="field-label">RT</label><div class="field-wrap"><input class="input" placeholder="00" /></div></div>
        <div><label class="field-label">RW</label><div class="field-wrap"><input class="input" placeholder="00" /></div></div>
      </div>
      <div style="margin-top:1rem;"><label class="field-label">Alamat Patokan</label><div class="field-wrap"><textarea class="input" rows="3" placeholder="Mis. depan minimarket, dekat masjid..."></textarea></div></div>
    </div>`;
  } else {
    content.innerHTML = `<div class="card" style="padding:1.25rem;">
      <div style="margin-bottom:1rem;"><label class="field-label">Jenis Pelanggan <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;"><select class="input" style="appearance:none;padding-right:2.5rem;"><option value="">Personal / Business</option><option>Personal</option><option>Business</option></select><svg style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 16.7996C11.3 16.7996 10.6 16.5296 10.07 15.9996L3.55002 9.47965C3.26002 9.18965 3.26002 8.70965 3.55002 8.41965C3.84002 8.12965 4.32002 8.12965 4.61002 8.41965L11.13 14.9396C11.61 15.4196 12.39 15.4196 12.87 14.9396L19.39 8.41965C19.68 8.12965 20.16 8.12965 20.45 8.41965C20.74 8.70965 20.74 9.18965 20.45 9.47965L13.93 15.9996C13.4 16.5296 12.7 16.7996 12 16.7996Z"/></svg></div></div></div>
      <div style="margin-bottom:1rem;"><label class="field-label">Pilihan Paket <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;"><select class="input" style="appearance:none;padding-right:2.5rem;"><option value="">Pilih paket internet</option><option>Home Light 10Mbps</option><option>Home Advanced 20Mbps</option><option>Home Ultra 50Mbps</option><option>Business Ultra 200Mbps</option></select><svg style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 16.7996C11.3 16.7996 10.6 16.5296 10.07 15.9996L3.55002 9.47965C3.26002 9.18965 3.26002 8.70965 3.55002 8.41965C3.84002 8.12965 4.32002 8.12965 4.61002 8.41965L11.13 14.9396C11.61 15.4196 12.39 15.4196 12.87 14.9396L19.39 8.41965C19.68 8.12965 20.16 8.12965 20.45 8.41965C20.74 8.70965 20.74 9.18965 20.45 9.47965L13.93 15.9996C13.4 16.5296 12.7 16.7996 12 16.7996Z"/></svg></div></div></div>
      <div style="margin-bottom:1rem;"><label class="field-label">Foto Bukti Lokasi</label><div class="field-wrap">
        <div class="photo-zone">
          ${ICONS.map_pin_sm}
          <span>Ambil Foto Lokasi Pelanggan</span>
          <span>Foto akan ditandai dengan koordinat GPS</span>
        </div>
      </div></div>
      <div class="confirm-note">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Pastikan data sudah benar. Setelah Kirim, data akan tersimpan permanen.</span>
      </div>
    </div>`;
  }

  // Actions
  const actions = document.getElementById('input-form-actions');
  actions.innerHTML = (step > 0 ? `<button type="button" class="btn btn-card" style="border-radius:0.75rem;" onclick="renderInput(${step-1})">Kembali</button>` : '') +
    `<button type="button" class="btn btn-primary" style="border-radius:0.75rem;" onclick="${step < 2 ? `renderInput(${step+1})` : `navigate('home')`}">${step === 2 ? 'Kirim' : 'Selanjutnya'}</button>`;
}

function inputBack() {
  if (inputStep === 0) navigate('home');
  else renderInput(inputStep - 1);
}

function lockGPS() {
  gpsLocked = true;
  const block = document.getElementById('gps-block');
  const iconWrap = document.getElementById('gps-icon-wrap');
  const label = document.getElementById('gps-label');
  const sublabel = document.getElementById('gps-sublabel');
  const btn = document.getElementById('gps-btn');
  const bars = document.getElementById('gps-bars');
  if (block) { block.className = 'gps-block locked'; }
  if (iconWrap) { iconWrap.className = 'gps-icon-wrap locked'; iconWrap.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="none"><path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`; }
  if (label) label.textContent = 'Lokasi Terkunci';
  if (sublabel) sublabel.textContent = 'Akurasi: ±5m • -7.405, 111.938';
  if (btn) btn.textContent = 'Refresh';
  if (bars) bars.innerHTML = `<div class="gps-bar-seg on"></div><div class="gps-bar-seg on"></div><div class="gps-bar-seg on"></div><span style="font-size:0.6875rem;font-weight:600;margin-left:0.25rem;color:var(--success);">Akurat</span>`;
}

// ── DETAIL PELANGGAN PAGE ──────────────────────────────────────
function renderDetail(id) {
  const customers = DB.customers || [];
  const c = customers.find(x => x.id === id);
  if (!c) { navigate('home'); return; }
  selectedDetail = c;

  document.title = `${c.name} — Sales Kit`;

  // Edit button (admin only)
  const editBtn = document.getElementById('detail-edit-btn');
  if (currentRole === 'admin') {
    editBtn.innerHTML = `<button onclick="renderEdit('${id}')" style="display:inline-flex;align-items:center;gap:0.375rem;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.20);padding:0.375rem 0.75rem;border-radius:0.5rem;font-size:0.75rem;font-weight:600;color:#fff;cursor:pointer;">${ICONS.pencil} Edit</button>`;
  } else { editBtn.innerHTML = ''; }

  const content = document.getElementById('detail-content');
  content.innerHTML = `
    <div class="card card-xl" style="padding:1.25rem;">
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <div class="detail-avatar">${c.name[0]}</div>
        <div style="flex:1;">
          <h2 style="font-size:1.25rem;font-weight:700;line-height:1.2;">${c.name}</h2>
          <p style="font-size:0.75rem;color:var(--muted-fg);">Pelanggan sejak ${c.registered}</p>
        </div>
      </div>
      <div style="margin-top:1rem;" class="space-y-3">
        ${detailRow('ID Pelanggan', c.id, true)}
        ${detailRow('Nomor Telepon', c.phone, true)}
        ${detailRowLink('Email', c.email, `mailto:${c.email}`)}
        ${detailRow('Tgl Registrasi', c.registered)}
      </div>
      <a href="https://wa.me/${c.phone.replace(/\D/g,'')}" target="_blank" rel="noreferrer"
        style="margin-top:1rem;width:100%;display:flex;align-items:center;justify-content:center;gap:0.5rem;background:var(--success);color:var(--success-fg);font-weight:600;padding:0.875rem;border-radius:0.75rem;box-shadow:var(--shadow-card-hover);">
        ${ICONS.phone_icon} Hubungi via WhatsApp
      </a>
    </div>

    <div class="card card-xl" style="padding:1.25rem;">
      <h3 style="font-weight:700;font-size:1rem;margin-bottom:0.75rem;">Informasi Pelanggan</h3>
      <div class="info-rows">
        <div class="info-row-item"><span>Status</span><span class="badge status-${c.status}">${c.status}</span></div>
        <div class="info-row-item"><span>Alamat Lengkap</span><span style="text-align:right;">${c.alamat}</span></div>
        <div class="info-row-item"><span>RT/RW</span><span>10/0</span></div>
        <div class="info-row-item"><span>Paket Internet</span><span>${c.paket}</span></div>
        <div class="info-row-item"><span>Pembayaran</span><span class="highlight">Rp ${c.amount.toLocaleString('id-ID')}</span></div>
      </div>
    </div>

    <div class="card card-xl" style="padding:1.25rem;">
      <div class="visit-proof-header">
        <h3 style="font-weight:700;font-size:1rem;">Bukti Kunjungan</h3>
        <span class="gps-tag"><span class="gps-tag-dot"></span> GPS Akurat</span>
      </div>
      <div class="visit-meta">
        <div><p>Waktu</p><p>19 Juli 2026, 11:45</p></div>
        <div><p>Koordinat</p><p>-7.405, 111.938</p></div>
      </div>
      <div class="map-placeholder">
        <div class="map-grid"></div>
        <div class="map-pin">
          <div class="map-pin-circle">${ICONS.map_pin_sm}</div>
          <div class="map-label">Lokasi Kunjungan</div>
        </div>
      </div>
      <button style="margin-top:0.75rem;width:100%;display:flex;align-items:center;justify-content:center;gap:0.5rem;background:var(--primary);color:var(--primary-fg);font-weight:600;padding:0.875rem;border-radius:0.75rem;box-shadow:var(--shadow-card-hover);border:none;cursor:pointer;">
        ${ICONS.nav_icon} Buka di Maps
      </button>
    </div>`;
}

function renderEdit(id) {
  const customers = DB.customers || [];
  const c = customers.find(x => x.id === id);
  if (!c) { navigate('home'); return; }
  selectedDetail = c;
  
  if (!document.getElementById('kecamatan-list')) {
    document.body.insertAdjacentHTML('beforeend', `
      <datalist id="kecamatan-list">
        <option value="Surabaya">
        <option value="Sidoarjo">
        <option value="Gresik">
        <option value="Mojokerto">
        <option value="Malang">
        <option value="Pasuruan">
        <option value="Bangkalan">
        <option value="Sampang">
        <option value="Pamekasan">
        <option value="Sumenep">
      </datalist>
    `);
  }

  navigate('edit');
  
  const content = document.getElementById('edit-form-content');
  content.innerHTML = `
    <div class="card" style="padding:1.25rem;">
      <div style="margin-bottom:1rem;"><label class="field-label">Nama Lengkap <span class="req">*</span></label><div class="field-wrap"><input id="edit-name" class="input" placeholder="Mis. Budi Santoso" value="${c.name}" /></div></div>
      <div style="margin-bottom:1rem;"><label class="field-label">Nomor Telepon (WhatsApp) <span class="req">*</span></label><div class="field-wrap"><input id="edit-phone" type="tel" class="input" placeholder="08xxxxxxxxxx" value="${c.phone}" /></div></div>
      <div style="margin-bottom:1rem;"><label class="field-label">Email (Opsional)</label><div class="field-wrap"><input id="edit-email" type="email" class="input" placeholder="budi@email.com" value="${c.email || ''}" /></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Kota / Kecamatan <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;"><input id="edit-kota" type="text" list="kecamatan-list" class="input" placeholder="Pilih atau Ketik Kota / Kecamatan" value="${c.alamat || ''}"></div></div></div>
      <div style="margin-top:1rem;"><label class="field-label">Pilihan Paket <span class="req">*</span></label><div class="field-wrap"><div style="position:relative;">
        <select id="edit-paket" class="input" style="appearance:none;padding-right:2.5rem;">
          <option value="Home Light 10Mbps" ${c.paket === 'Home Light 10Mbps' ? 'selected' : ''}>Home Light 10Mbps</option>
          <option value="Home Advanced 20Mbps" ${c.paket === 'Home Advanced 20Mbps' ? 'selected' : ''}>Home Advanced 20Mbps</option>
          <option value="Home Ultra 50Mbps" ${c.paket === 'Home Ultra 50Mbps' ? 'selected' : ''}>Home Ultra 50Mbps</option>
          <option value="Business Ultra 200Mbps" ${c.paket === 'Business Ultra 200Mbps' ? 'selected' : ''}>Business Ultra 200Mbps</option>
        </select>
        <svg style="position:absolute;right:0.75rem;top:50%;transform:translateY(-50%);pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none"><path d="M12 16.7996C11.3 16.7996 10.6 16.5296 10.07 15.9996L3.55002 9.47965C3.26002 9.18965 3.26002 8.70965 3.55002 8.41965C3.84002 8.12965 4.32002 8.12965 4.61002 8.41965L11.13 14.9396C11.61 15.4196 12.39 15.4196 12.87 14.9396L19.39 8.41965C19.68 8.12965 20.16 8.12965 20.45 8.41965C20.74 8.70965 20.74 9.18965 20.45 9.47965L13.93 15.9996C13.4 16.5296 12.7 16.7996 12 16.7996Z"/></svg>
      </div></div></div>
    </div>
  `;
}

function saveEdit() {
  if (!selectedDetail) return;
  const name = document.getElementById('edit-name').value;
  const phone = document.getElementById('edit-phone').value;
  const email = document.getElementById('edit-email').value;
  const kota = document.getElementById('edit-kota').value;
  const paket = document.getElementById('edit-paket').value;
  
  if (!name || !phone || !kota) {
    alert("Mohon lengkapi field yang wajib!");
    return;
  }
  
  selectedDetail.name = name;
  selectedDetail.phone = phone;
  selectedDetail.email = email;
  selectedDetail.alamat = kota;
  selectedDetail.paket = paket;
  
  navigateId(selectedDetail.id);
}

function detailRow(label, value, canCopy) {
  return `<div class="detail-row">
    <span class="detail-row-label" style="font-size:0.875rem;">${label}</span>
    <div style="display:flex;align-items:center;gap:0.5rem;min-width:0;">
      <span class="detail-row-val">${value}</span>
      ${canCopy ? `<button class="copy-btn" onclick="copyVal('${value}',this)">${ICONS.copy}</button>` : ''}
    </div>
  </div>`;
}
function detailRowLink(label, value, href) {
  return `<div class="detail-row">
    <span class="detail-row-label" style="font-size:0.875rem;">${label}</span>
    <a href="${href}" class="detail-row-val link" style="font-size:0.875rem;">${value}</a>
  </div>`;
}
function copyVal(val, btn) {
  navigator.clipboard?.writeText(val);
  const orig = btn.innerHTML;
  btn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><path d="M7.75 11.9999L10.58 14.8299L16.25 9.16992" stroke="var(--success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  setTimeout(() => { btn.innerHTML = orig; }, 1200);
}

// ── ACTION SHEET ──────────────────────────────────────────────
function openSheet(customerId) {
  const customers = DB.customers || [];
  const c = customers.find(x => x.id === customerId);
  if (!c) return;
  sheetCustomer = c;
  sheetChoice = null;

  const isAdmin = currentRole === 'admin';
  document.getElementById('sheet-title').textContent = `Alihkan Status ${c.name}`;

  if (isAdmin) {
    if (c.status === 'Potensi') {
      document.getElementById('sheet-choices').innerHTML = `
        <button class="choice-btn" onclick="selectChoice('Aktif',this)">Aktifkan</button>
        <button class="choice-btn" style="color:var(--destructive);" onclick="handleSheetHapus()">Hapus Data</button>
      `;
    } else if (c.status === 'Tunda') {
      document.getElementById('sheet-choices').innerHTML = `
        <button class="choice-btn" onclick="selectChoice('Aktif',this)">Aktifkan</button>
        <button class="choice-btn" style="color:var(--destructive);" onclick="handleSheetCabut()">Cabut</button>
      `;
    } else {
      const allStatuses = ['Aktif','Potensi','Tunda','Cabut'].filter(s => s !== c.status);
      document.getElementById('sheet-choices').innerHTML = allStatuses.map(s =>
        `<button class="choice-btn" onclick="selectChoice('${s}',this)">${s}</button>`
      ).join('');
    }
  } else {
    document.getElementById('sheet-choices').innerHTML = `
      <button class="choice-btn" onclick="selectChoice('Tunda',this)">Tunda</button>
    `;
  }

  document.getElementById('sheet-note').textContent = !isAdmin
    ? 'Marketing hanya bisa menandai pelanggan untuk ditinjau admin. Perubahan final akan dilakukan oleh admin.'
    : '';
  const confirmBtn = document.getElementById('sheet-confirm-btn');
  confirmBtn.textContent = 'Konfirmasi Perubahan';
  confirmBtn.disabled = true;
  confirmBtn.style.opacity = '0.5';
  document.getElementById('action-sheet').classList.remove('hidden');
}

function handleSheetHapus() {
  if (confirm(`Apakah Anda yakin ingin menghapus data pelanggan ${sheetCustomer.name}?`)) {
    DB.customers = DB.customers.filter(x => x.id !== sheetCustomer.id);
    closeSheet();
    renderCustomerList();
  }
}

function handleSheetCabut() {
  if (confirm(`Apakah Anda yakin ingin mencabut pelanggan ${sheetCustomer.name}?`)) {
    sheetCustomer.status = 'Cabut';
    closeSheet();
    renderCustomerList();
  }
}

function selectChoice(s, el) {
  sheetChoice = s;
  document.querySelectorAll('.choice-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  const confirmBtn = document.getElementById('sheet-confirm-btn');
  confirmBtn.disabled = false;
  confirmBtn.style.opacity = '1';
}

function confirmSheet() {
  if (!sheetChoice || !sheetCustomer) return;
  if (sheetChoice === 'Aktif' && !document.getElementById('paket-select')) {
    // Tampilkan dropdown paket
    document.getElementById('sheet-choices').innerHTML = `
      <div style="margin-bottom:1rem; text-align:left;">
        <label class="lbl">Pilih Jenis Paket</label>
        <select id="paket-select" class="input" style="margin-top:0.5rem;">
          <option value="Bronze">Bronze</option>
          <option value="Silver">Silver</option>
          <option value="Gold">Gold</option>
          <option value="Platinum">Platinum</option>
        </select>
      </div>
    `;
    document.getElementById('sheet-confirm-btn').textContent = "Simpan & Aktifkan";
    return;
  }

  if (sheetChoice === 'Aktif') {
    sheetCustomer.paket = document.getElementById('paket-select').value;
  }
  
  sheetCustomer.status = sheetChoice;
  closeSheet();
  renderCustomerList();
}
function closeSheet() {
  document.getElementById('action-sheet').classList.add('hidden');
  sheetChoice = null;
  sheetCustomer = null;
}

// ── LOGIN LOGIC ────────────────────────────────────────────────
let selectedRole = 'marketing';

function buildLoginRoles() {
  const roles = [
    { value:'marketing', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><g clip-path="url(#br)"><path d="M7.99995 22H15.9999C20.0199 22 20.7399 20.39 20.9499 18.43L21.6999 10.43C21.9699 7.99 21.2699 6 16.9999 6H6.99995C2.72995 6 2.02995 7.99 2.29995 10.43L3.04995 18.43C3.25995 20.39 3.97995 22 7.99995 22Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V5.2C8 3.43 8 2 11.2 2H12.8C16 2 16 3.43 16 5.2V6" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 13V14C14 14.01 14 14.01 14 14.02C14 15.11 13.99 16 12 16C10.02 16 10 15.12 10 14.03V13C10 12 10 12 11 12H13C14 12 14 12 14 13Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="br"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`, bg:'#3B82F611', iconColor:'#2563EB', label:'Marketing' },
    { value:'admin', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><g clip-path="url(#sh)"><path d="M10.49 2.23019L5.50003 4.11019C4.35003 4.54019 3.41003 5.90019 3.41003 7.12019V14.5502C3.41003 15.7302 4.19003 17.2802 5.14003 17.9902L9.44003 21.2002C10.85 22.2602 13.17 22.2602 14.58 21.2002L18.88 17.9902C19.83 17.2802 20.61 15.7302 20.61 14.5502V7.12019C20.61 5.89019 19.67 4.53019 18.52 4.10019L13.53 2.23019C12.68 1.92019 11.32 1.92019 10.49 2.23019Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.05005 11.87L10.66 13.48L14.96 9.18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="sh"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`, bg:'#10B98111', iconColor:'#059669', label:'Admin' },
    { value:'manager', icon: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="none"><g clip-path="url(#bc)"><path d="M18.32 11.9992C20.92 11.9992 22 10.9992 21.04 7.7192C20.39 5.5092 18.49 3.6092 16.28 2.9592C13 1.9992 12 3.0792 12 5.6792V8.5592C12 10.9992 13 11.9992 15 11.9992H18.32Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.0001 14.6998C19.0701 19.3298 14.6301 22.6898 9.58005 21.8698C5.79005 21.2598 2.74005 18.2098 2.12005 14.4198C1.31005 9.38977 4.65005 4.94977 9.26005 4.00977" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="bc"><rect width="24" height="24" fill="none"/></clipPath></defs></svg>`, bg:'#6366F111', iconColor:'#4F46E5', label:'Manager' },
  ];

  const grid = document.getElementById('role-grid');
  grid.innerHTML = roles.map(r => {
    const active = selectedRole === r.value;
    return `<button type="button" class="role-btn ${active ? 'active' : ''}" onclick="pickLoginRole('${r.value}')">
      ${active ? `<span class="role-check">${ICONS.check}</span>` : ''}
      <div class="role-btn-icon" style="background:${r.bg};color:${r.iconColor};">${r.icon}</div>
      <p>${r.label}</p>
    </button>`;
  }).join('');

  const meta = DB.roleMeta[selectedRole] || {};
  document.getElementById('role-desc').textContent = meta.desc || '';
  document.getElementById('login-email').value = meta.demoEmail || '';
  document.getElementById('login-role-label').textContent = meta.short || selectedRole;
}

function pickLoginRole(r) {
  selectedRole = r;
  // Reset homeTab when role changes
  homeTab = 'Aktif';
  buildLoginRoles();
}

function togglePw() {
  const inp = document.getElementById('login-pw');
  inp.type = inp.type === 'password' ? 'text' : 'password';
}

function doLogin() {
  // Reset tab state for fresh login
  homeTab = 'Aktif';
  setRoleLS(selectedRole);
  navigate('home');
}

function doLogout() {
  homeTab = 'Aktif';
  selectedRole = 'marketing';
  clearRoleLS();
  navigate('login');
  buildLoginRoles();
}

// ── INIT ───────────────────────────────────────────────────────
async function init() {
  await loadData();

  const savedRole = getRole();
  if (savedRole) {
    currentRole = savedRole;
    navigate('home');
  } else {
    navigate('onboarding');
  }

  // Build login roles after data loaded
  buildLoginRoles();
}

init();
