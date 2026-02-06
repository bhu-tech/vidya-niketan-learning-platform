// Simple sound/animation utility for lobby events
export function playAdmitSound() {
  const audio = new Audio('/sounds/admit.mp3');
  audio.play();
}

export function playDenySound() {
  const audio = new Audio('/sounds/deny.mp3');
  audio.play();
}

export function playNotificationSound() {
  const audio = new Audio('/sounds/notify.mp3');
  audio.play();
}

export function showAdmitAnimation() {
  // Placeholder: could trigger a confetti or checkmark animation
  const el = document.createElement('div');
  el.className = 'admit-animation';
  el.innerText = '🎉 Admitted!';
  Object.assign(el.style, {
    position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%,0)',
    background: '#22c55e', color: '#fff', padding: '18px 32px', borderRadius: '12px', fontSize: '1.5em', zIndex: 9999,
    boxShadow: '0 4px 24px rgba(34,197,94,0.18)', opacity: 0.95
  });
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 1800);
}

export function showDenyAnimation() {
  const el = document.createElement('div');
  el.className = 'deny-animation';
  el.innerText = '❌ Denied';
  Object.assign(el.style, {
    position: 'fixed', left: '50%', top: '30%', transform: 'translate(-50%,0)',
    background: '#ef4444', color: '#fff', padding: '18px 32px', borderRadius: '12px', fontSize: '1.5em', zIndex: 9999,
    boxShadow: '0 4px 24px rgba(239,68,68,0.18)', opacity: 0.95
  });
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 1800);
}
