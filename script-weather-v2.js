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

const tripPrice = riders => 200 + Math.max(0, Number(riders) - 2) * 50;
const updateEstimate = () => {
 const dest = $('destination').value, riders = Number($('riders').value);
 if(dest === 'Lee Canyon') {
 const total = tripPrice(riders);
 rateEstimate.innerHTML = `<span>LEE CANYON · ROUND TRIP · MAX 4 PEOPLE</span><strong>$${total.toLocaleString('en-US')} <small>total for ${riders} passenger${riders===1?'':'s'} · $200 includes up to 2, +$50 each additional</small></strong>`;
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
 return `Hello Vegas Ski & Snowboarding Shuttle,\n\nI'd like to request availability for a mountain shuttle trip.\n\nName: ${val('name')}\nEmail: ${val('email')}\nPhone: ${val('phone')}\nDestination: ${val('destination')}\nPreferred travel date: ${dateLabel}\nNumber of riders: ${val('riders')}\nLee Canyon round-trip estimate (if applicable): ${tripPrice(val('riders'))} total\nPreferred pickup area: ${val('pickup')}\nBringing skis / boards: ${val('gear')}\nAdditional details: ${val('message') || 'None'}\n\nPlease confirm availability, pickup details, full pricing, and applicable cancellation and promotion terms before any payment.\n\nThank you.`;
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


// Official NOAA/NWS point forecasts — no API key, no private location data.
// The initial period represents an upcoming forecast, NOT a weather-station observation.
const FORECAST_POINTS = {
 vegas: [36.1699,-115.1398],
 lee: [36.302,-115.679],
 brian: [37.692,-112.848],
 snowbowl: [35.33,-111.71]
};
const weatherRefresh = document.getElementById('weatherRefresh');
const weatherStatus = document.getElementById('weatherStatus');
const weatherCards = [...document.querySelectorAll('[data-forecast]')];
const WEATHER_CACHE_MS = 15*60*1000;
const symbolForWeather = description => {
 const s = String(description||'').toLowerCase();
 if(/thunder|lightning/.test(s))return '⛈️';
 if(/snow|flurr|blizzard/.test(s))return '❄️';
 if(/sleet|ice|freezing/.test(s))return '🌨️';
 if(/rain|shower|drizzle/.test(s))return '🌧️';
 if(/fog|haze|smoke/.test(s))return '🌫️';
 if(/mostly sunny|partly sunny|partly cloudy/.test(s))return '⛅';
 if(/cloud|overcast/.test(s))return '☁️';
 if(/clear|sun/.test(s))return '☀️';
 return '🌤️';
};
const forecastWeekday = value => {
 try { return new Date(value).toLocaleDateString('en-US',{weekday:'short'}); }
 catch(e) { return ''; }
};
const setWeatherError = (card) => {
 card.querySelector('.weather-icon').textContent='↗';
 card.querySelector('.weather-temp').textContent='--°';
 card.querySelector('.weather-desc').textContent='Forecast service unavailable right now';
 card.querySelector('.weather-wind').textContent='Try refreshing, or open the official NWS forecast below.';
 card.querySelector('.weather-days').replaceChildren();
};
function renderWeather(card,forecast) {
 const periods=forecast?.properties?.periods;
 if(!Array.isArray(periods)||!periods.length)throw new Error('No forecast periods');
 const first=periods[0];
 const degrees = Number(first.temperature);
 card.querySelector('.weather-icon').textContent=symbolForWeather(first.shortForecast);
 card.querySelector('.weather-temp').textContent=Number.isFinite(degrees)?Math.round(degrees)+'°'+(first.temperatureUnit||'F'):'--°';
 card.querySelector('.weather-desc').textContent=first.shortForecast||'Weather details pending';
 card.querySelector('.weather-wind').textContent='Wind: '+(first.windSpeed||'not reported')+(first.windDirection?' '+first.windDirection:'')+' · '+(first.name||'next period');
 const container=card.querySelector('.weather-days');
 container.replaceChildren();
 const days=periods.filter(p=>p.isDaytime).slice(0,3);
 for(const p of days){
  const row=document.createElement('div');
  row.className='weather-day';
  const day=document.createElement('span');
  day.className='weather-day-name';
  day.textContent=forecastWeekday(p.startTime) || p.name || 'Upcoming';
  const detail=document.createElement('span');
  detail.className='weather-day-details';
  const temp=document.createElement('strong');
  temp.textContent=(Number.isFinite(Number(p.temperature))?Math.round(Number(p.temperature))+'°':'--°');
  const condition=document.createElement('span');
  condition.textContent=' · '+(p.shortForecast||'Forecast');
  detail.append(temp,condition);
  row.append(day,detail);
  container.appendChild(row);
 }
 if(!days.length){
  const msg=document.createElement('p');
  msg.className='weather-loading';
  msg.textContent='Daily breakdown not available. Open the detailed forecast.';
  container.appendChild(msg);
 }
}
async function getNwsJson(url){
 const timeout = new AbortController();
 const timeoutId = setTimeout(()=>timeout.abort(), 12000);
 try {
  const response=await fetch(url,{headers:{Accept:'application/geo+json'},signal:timeout.signal,cache:'default'});
  if(!response.ok)throw new Error('NWS '+response.status);
  return await response.json();
 } finally {
  clearTimeout(timeoutId);
 }
}
async function getPointForecast(key,force){
 const coords=FORECAST_POINTS[key];
 if(!coords)throw new Error('Unknown weather point');
 const cacheKey='vss-weather-'+key;
 if(!force){
  try{
   const saved=JSON.parse(sessionStorage.getItem(cacheKey)||'null');
   if(saved && Date.now()-saved.saved<WEATHER_CACHE_MS && saved.data?.properties?.periods?.length)return saved.data;
  }catch(e){/* Private browsing may block storage. Fetch forecast instead. */}
 }
 const point=await getNwsJson('https://api.weather.gov/points/'+coords.join(','));
 const url=point?.properties?.forecast;
 if(typeof url!=='string'||!url.startsWith('https://api.weather.gov/'))throw new Error('Missing official forecast URL');
 const forecast=await getNwsJson(url);
 try{sessionStorage.setItem(cacheKey,JSON.stringify({saved:Date.now(),data:forecast}));}catch(e){/* no storage permission */}
 return forecast;
}
async function loadWeather(force=false) {
 weatherRefresh.disabled=true;
 weatherRefresh.textContent='↻ UPDATING…';
 weatherStatus.textContent='Checking National Weather Service forecasts…';
 const results=await Promise.allSettled(weatherCards.map(async card=>{
  const key=card.dataset.forecast;
  try {
   const data=await getPointForecast(key,force);
   renderWeather(card,data);
   return true;
  } catch(error){
   setWeatherError(card);
   throw error;
  }
 }));
 const ok=results.filter(r=>r.status==='fulfilled').length;
 results.forEach((result,i)=>{if(result.status==='rejected')setWeatherError(weatherCards[i]);});
 const now=new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
 weatherStatus.textContent=ok===weatherCards.length?'Forecasts updated · Checked '+now:ok?'Weather available for '+ok+' of '+weatherCards.length+' destinations · Checked '+now+'. Open NWS links for the others.':'Unable to retrieve live forecasts. Open the official NWS links below or try again.';
 weatherRefresh.disabled=false;
 weatherRefresh.textContent='↻ REFRESH WEATHER';
}
if(weatherRefresh&&weatherStatus&&weatherCards.length){
 weatherRefresh.addEventListener('click',()=>loadWeather(true));
 loadWeather();
}
