// frontend/app.js
console.log("Frontend App Loaded");

// Optional: a simple in-memory "coupon store" so the frontend works standalone.
// When you later connect to a backend API, replace this logic with fetch() calls.
const sampleCoupons = {
  'DISCOUNT10': { amount: 10, used: false },
  'SAVE50': { amount: 50, used: false }
};

const resultEl = document.getElementById('result');
const inputEl = document.getElementById('couponInput');
const btn = document.getElementById('applyBtn');

btn.addEventListener('click', applyCoupon);
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') applyCoupon(); });

function show(msg, isError = false) {
  resultEl.innerText = msg;
  resultEl.style.color = isError ? 'crimson' : 'green';
}

function applyCoupon() {
  const code = (inputEl.value || '').trim().toUpperCase();
  if (!code) {
    show('⚠️ Please enter a coupon code.', true);
    return;
  }

  // --- Frontend-only validation (works without backend) ---
  const coupon = sampleCoupons[code];
  if (!coupon) {
    show('❌ Invalid coupon code.', true);
    return;
  }
  if (coupon.used) {
    show('⚠️ This coupon has already been used.', true);
    return;
  }

  // mark used locally and show success
  coupon.used = true;
  show(`🎉 Coupon applied! You saved ₹${coupon.amount}. (Code: ${code})`);

  // --- If you have the backend (/apply-coupon), use this fetch instead:
  /*
  fetch('/apply-coupon', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
    .then(r => r.json())
    .then(data => {
      if (!data.success) show('❌ ' + (data.message || 'Failed'), true);
      else show(`🎉 ${data.message}. You saved ₹${data.amount}.`);
    })
    .catch(() => show('⚠️ Network error. Try again.', true));
  */
}
