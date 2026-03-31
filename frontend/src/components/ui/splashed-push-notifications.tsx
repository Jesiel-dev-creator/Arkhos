import React, { useImperativeHandle, forwardRef, useRef, useEffect } from 'react';

export type NotificationType = 'help' | 'success' | 'warning' | 'error';

export interface SplashedPushNotificationsHandle {
  createNotification: (type: NotificationType, title: string, content: string) => void;
}

export interface SplashedPushNotificationsProps {
  timerColor?: string;
  timerBgColor?: string;
}

const ICON_SVGS: Record<NotificationType, string> = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 7 17l-5-5"/><path d="m22 10-7.5 7.5L13 16"/></svg>`,
  help: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m14.5 9.5-5 5"/><path d="m9.5 9.5 5 5"/></svg>`,
};

export const SplashedPushNotifications = forwardRef<SplashedPushNotificationsHandle, SplashedPushNotificationsProps>(
  ({ timerColor, timerBgColor }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      if (document.getElementById('splashed-toast-css')) return;
      const style = document.createElement('style');
      style.id = 'splashed-toast-css';
      style.innerHTML = `
        .notificationContainer { display: flex; flex-direction: column; align-items: flex-end; position: fixed; bottom: 10px; right: 10px; max-width: 355px; z-index: 999999; }
        .toast { color: #f5f5f5; padding: 1rem 2rem 1.5rem 6rem; position: relative; margin: 1.75rem 0 1rem; overflow: visible; border-radius: 0.4rem; }
        .timer { position: absolute; bottom: 0; left: 10%; right: 10%; width: 80%; height: 4px; background: var(--splashed-toast-timer-bg, rgba(255,255,255,0.3)); border-radius: 2px; overflow: hidden; }
        .timerLeft, .timerRight { position: absolute; top: 0; height: 100%; left: 0; background-color: var(--splashed-toast-timer, rgba(255,255,255,0.8)); }
        .toast:after { content: ""; position: absolute; width: 3.5rem; height: 3.5rem; background: var(--clr); top: -1.75rem; left: 2rem; border-radius: 3rem; display: flex; align-items: center; justify-content: center; }
        .toast h3 { font-size: 1.35rem; margin: 0; position: relative; }
        .toast p { position: relative; font-size: 0.95rem; z-index: 1; margin: 0.25rem 0 0; }
        .toast.help { --clr: #05478a; background: #0070e0; }
        .toast.success { --clr: #005e38; background: #03a65a; }
        .toast.warning { --clr: #c24914; background: #fc8621; }
        .toast.error { --clr: #851d41; background: #db3056; }
        .closeButton { position:absolute; top:0.4rem; right:0.4rem; height: 34px; width: 34px; cursor: pointer; border-radius: 0.4rem; background: #fff; border: 0; color: #242424; display: flex; align-items: center; justify-content: center; }
        .toast .icon-center { position: absolute; width: 3.5rem; height: 3.5rem; top: -1.75rem; left: 2rem; display: flex; align-items: center; justify-content: center; z-index: 2; }
        @keyframes slideInWithBounce { 0% { transform: translateX(150%); opacity: 0; } 60% { transform: translateX(-12%); opacity: 1; } 100% { transform: translateX(0); opacity: 1; } }
        @keyframes slideOutWithBounce { 0% { transform: translateX(0); opacity: 1; } 100% { transform: translateX(150%); opacity: 0; } }
      `;
      document.head.appendChild(style);
    }, []);

    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      if (timerColor) el.style.setProperty('--splashed-toast-timer', timerColor);
      if (timerBgColor) el.style.setProperty('--splashed-toast-timer-bg', timerBgColor);
    }, [timerColor, timerBgColor]);

    const removeNotification = (notif: HTMLElement) => {
      notif.style.animation = 'slideOutWithBounce 0.6s ease forwards';
      setTimeout(() => { notif.remove(); }, 600);
    };

    const createNotification = (type: NotificationType, title: string, content: string) => {
      if (!containerRef.current) return;
      const notif = document.createElement('div');
      notif.classList.add('toast', type);
      const iconDiv = document.createElement('div');
      iconDiv.className = 'icon-center';
      iconDiv.innerHTML = ICON_SVGS[type];
      const h3 = document.createElement('h3'); h3.textContent = title;
      const p = document.createElement('p'); p.textContent = content;
      const timerContainer = document.createElement('div'); timerContainer.classList.add('timer');
      const closeButton = document.createElement('button'); closeButton.classList.add('closeButton');
      closeButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
      closeButton.onclick = () => { removeNotification(notif); };
      notif.appendChild(iconDiv); notif.appendChild(closeButton); notif.appendChild(h3); notif.appendChild(p); notif.appendChild(timerContainer);
      const timerLeft = document.createElement('div'); timerLeft.classList.add('timerLeft');
      const timerRight = document.createElement('div'); timerRight.classList.add('timerRight');
      timerContainer.appendChild(timerRight); timerContainer.appendChild(timerLeft);
      containerRef.current.appendChild(notif);
      notif.style.animation = 'slideInWithBounce 0.6s ease forwards';
      const duration = 5000;
      const uniqueId = Date.now();
      const stylesheet = document.createElement('style');
      stylesheet.innerHTML = `@keyframes timerShrink-${uniqueId} { from { width: 100%; } to { width: 0; } }`;
      document.head.appendChild(stylesheet);
      timerLeft.style.animation = `timerShrink-${uniqueId} ${duration}ms linear forwards`;
      timerRight.style.animation = `timerShrink-${uniqueId} ${duration}ms linear forwards`;
      setTimeout(() => removeNotification(notif), duration);
    };

    useImperativeHandle(ref, () => ({ createNotification }));
    return <div ref={containerRef} className="notificationContainer" />;
  }
);

SplashedPushNotifications.displayName = 'SplashedPushNotifications';
export default SplashedPushNotifications;
