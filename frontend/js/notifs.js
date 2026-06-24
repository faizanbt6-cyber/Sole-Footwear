(function() {
  const style = document.createElement('style');
  style.textContent = `
    .sole-alert {
      position: fixed;
      top: 40px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      background: #e8ff47;
      color: #080808;
      padding: 24px 48px;
      border-radius: 8px;
      font-family: 'Syne', sans-serif;
      font-weight: 800;
      font-size: 14px;
      letter-spacing: 2px;
      text-transform: uppercase;
      z-index: 10001;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(232, 255, 71, 0.3);
      opacity: 0;
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      text-align: center;
      min-width: 320px;
    }
    .sole-alert.active {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  `;
  document.head.appendChild(style);

  // Override global alert
  window.alert = function(message) {
    const existing = document.querySelector('.sole-alert');
    if (existing) existing.remove();

    const notif = document.createElement('div');
    notif.className = 'sole-alert';
    notif.textContent = message;
    document.body.appendChild(notif);

    requestAnimationFrame(() => {
      notif.classList.add('active');
    });

    setTimeout(() => {
      notif.classList.remove('active');
      setTimeout(() => notif.remove(), 500);
    }, 3500);
  };

  // Custom Confirm System
  window.soleConfirm = function(message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed; inset: 0; background: rgba(0,0,0,0.8);
        backdrop-filter: blur(8px); z-index: 10002;
        display: flex; align-items: center; justify-content: center;
        opacity: 0; transition: opacity 0.4s;
      `;
      
      const modal = document.createElement('div');
      modal.className = 'sole-alert active';
      modal.style.cssText = `
        position: relative; top: auto; left: auto; transform: none;
        display: flex; flex-direction: column; gap: 24px; padding: 40px;
        pointer-events: auto; opacity: 1;
      `;
      
      modal.innerHTML = `
        <div style="font-size: 16px;">${message}</div>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button id="sole-confirm-cancel" style="background: rgba(0,0,0,0.1); border: 1px solid rgba(0,0,0,0.1); color: inherit; padding: 12px 24px; border-radius: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;">Cancel</button>
          <button id="sole-confirm-ok" style="background: #080808; color: #e8ff47; border: none; padding: 12px 24px; border-radius: 4px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; cursor: pointer;">Confirm</button>
        </div>
      `;
      
      overlay.appendChild(modal);
      document.body.appendChild(overlay);
      
      requestAnimationFrame(() => overlay.style.opacity = '1');
      
      const finish = (result) => {
        overlay.style.opacity = '0';
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 400);
      };
      
      overlay.querySelector('#sole-confirm-ok').onclick = () => finish(true);
      overlay.querySelector('#sole-confirm-cancel').onclick = () => finish(false);
    });
  };

  window.showNotice = window.alert;
})();

