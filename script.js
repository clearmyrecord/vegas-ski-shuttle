'use strict';
// This static site intentionally takes no payment, does not store personal information,
// and does not claim to provide live inventory. Email drafts are composed on the visitor's device.
const BOOKING_EMAIL = 'unitedpaintersww@gmail.com'; // Active connected account; update to branded booking address only after mailbox verification.
const $ = id => document.getElementById(id);
const menuToggle = $('menuToggle');
const mobileNav = $('mobileNav');
const bookingForm = $('bookingForm');
const rateEstimate = $('rateEstimate');
const feedback = $('formFeedback');
const copyBtn = $('copyRequest');

const localTodayISO = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`; };
const openingDate = '2026-11-20';
const dateMin = [localTodayISO(), openingDate].sort().at(-1);
$('tripDate').min = dateMin;
$('quickDate').min = dateMin;
$('year').textContent = new Date().getFullYear();

menuToggle.addEventListener('click', () => {
 const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
 menuToggle.setAttribute('aria-expanded', String(!expanded));
 mobileNav.hidden = expanded;
 menuToggle.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
 mobileNav.hidden = true;
 menuToggle.setAttribute('aria-expanded','false');
 menuToggle.setAttribute('aria-label','Open menu');
}));

const updateEstimate = () => {
 const dest = $('destination').value, riders = $('riders').value;
 if(dest === 'Lee Canyon') {
 const total = Number(riders);
 rateEstimate.innerHTML = `<span>LEE CANYON · ROUND TRIP</span><strong>${Number.isFinite(total) ? `$${(total*200).toLocaleString('en-US')}` : 'GROUP RATE'} <small>${Number.isFinite(total) ? `for ${riders} rider${total===1?'':'s'} · $200 each` : 'inquire for 6+ riders'}</small></strong>`;
 } else {
 rateEstimate.innerHTML = `<span>${dest.toUpperCase()} · LONGER-DISTANCE TRIP</span><strong>REQUEST A CUSTOM QUOTE</strong>`;
 }
};
$('destination').addEventListener('change',updateEstimate);
$('riders').addEventListener('change',updateEstimate);
updateEstimate();

$('quickForm').addEventListener('submit', e => {
 e.preventDefault();
 $('destination').value = $('quickDestination').value;
 $('riders').value = $('quickRiders').value;
 if ($('quickDate').value) $('tripDate').value = $('quickDate').value;
 updateEstimate();
 $('booking').scrollIntoView({behavior:'smooth',block:'start'});
 setTimeout(() => $('name').focus({preventScroll:true}), 450);
});
document.querySelectorAll('[data-destination]').forEach(btn => btn.addEventListener('click', () => {
 $('destination').value = btn.dataset.destination;
 updateEstimate();
 $('booking').scrollIntoView({behavior:'smooth',block:'start'});
}));

function getRequestText(){
 const data = new FormData(bookingForm);
 const val = name => String(data.get(name) || '').trim();
 const dateLabel = val('tripDate') ? new Date(`${val('tripDate')}T12:00:00`).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}) : '(not selected)';
 return `Hello Vegas Ski & Snowboarding Shuttle,\n\nI'd like to request availability for a mountain shuttle trip.\n\nName: ${val('name')}\nEmail: ${val('email')}\nPhone: ${val('phone')}\nDestination: ${val('destination')}\nPreferred travel date: ${dateLabel}\nNumber of riders: ${val('riders')}\nPreferred pickup area: ${val('pickup')}\nBringing skis / boards: ${val('gear')}\nAdditional details: ${val('message') || 'None'}\n\nPlease confirm availability, pickup details, full pricing, and applicable cancellation and promotion terms before any payment.\n\nThank you.`;
}
function validateBooking(){
 const required = ['name','email','phone','tripDate'];
 for(const id of required) {
 const el = $(id);
 if (!el.value.trim() || !el.checkValidity()) { el.focus(); el.reportValidity(); feedback.textContent = 'Please complete the required information before continuing.'; feedback.classList.add('error'); return false; }
 }
 if ($('tripDate').value < dateMin) { $('tripDate').focus(); feedback.textContent='Please select a future winter travel date.'; feedback.classList.add('error'); return false; }
 if (!$('consent').checked){ $('consent').focus(); $('consent').reportValidity(); feedback.textContent='Please acknowledge this is an inquiry rather than a confirmed booking.';feedback.classList.add('error');return false; }
 feedback.classList.remove('error');return true;
}
bookingForm.addEventListener('submit', e => {
 e.preventDefault();
 if(!validateBooking())return;
 const subject = `Vegas Ski Shuttle availability request — ${$('destination').value} — ${$('tripDate').value}`;
 const href = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(getRequestText())}`;
 feedback.textContent = 'Your email app should open with a prefilled request. Please send the email to finish your inquiry. No reservation has been confirmed.';
 window.location.href = href;
});
copyBtn.addEventListener('click', async () => {
 if(!validateBooking())return;
 const msg = getRequestText();
 try {
 await navigator.clipboard.writeText(msg);
 feedback.textContent = `Copied! Paste the details into an email addressed to ${BOOKING_EMAIL}. Your request is not submitted until you send it.`;
 } catch(e) {
 const t = document.createElement('textarea');t.value=msg;document.body.appendChild(t);t.select();try{document.execCommand('copy');feedback.textContent = `Request copied. Email it to ${BOOKING_EMAIL}.`;}catch(e2){feedback.textContent = `Copy failed. Please use your email app or call (702) 508-8110.`;}t.remove();
 }
});
