# Vegas Ski & Snowboarding Shuttle — Website Rebuild

A complete lightweight responsive static website for VegasSkiShuttle.com.

## What's included

- `index.html` — fully redesigned conversion-focused single-page website with Lee Canyon and custom destinations.
- `style.css` — responsive styles for mobile, tablet, and desktop.
- `script.js` — mobile navigation; trip quote estimates; date validation; availability inquiry prepared in visitor's email app; copy-message fallback.
- `privacy.html`, `terms.html` — transparent starter notices for a pre-booking inquiry site (review for legal and business accuracy before publishing).
- `assets/favicon.svg` — original vector logo mark.
- `sitemap.xml`, `robots.txt` — SEO basics.

## Preview locally

Open `index.html` in Chrome/Edge, or serve this folder (`python -m http.server 8000`) and visit `http://localhost:8000`.

## Critical before publishing

1. **Verify operations and insurance**: This is a booking-INQUIRY site, not an automated paid booking system. Do not treat inquiries as paid, accepted or guaranteed reservations. Confirm operating authority, vehicle, safety, pickup arrangements and any required transportation regulatory compliance before selling rides.
2. **Verify contact**: Previous `booking@vegasskishuttle.com` mail reportedly bounced. The form currently uses the working `unitedpaintersww@gmail.com` Gmail as a fallback; update `BOOKING_EMAIL` in `script.js`, and the `mailto` links in HTML, only after testing branded inbox delivery. Verify the prior business number `(702) 508-8110` is still active.
3. **Resolve promotion**: The brand tagline and $50-back promotional concept are shown, but the offer's qualifying terms are unknown. Publish written eligibility and redemption terms before taking payments; do not represent $50 back as automatically guaranteed. Consider gambling/sweepstakes legal review if the promotion uses chance or paid entry.
4. **Confirm itinerary**: Lee Canyon 8 AM departure and 5 PM mountain departure are the business plan; confirm meeting point, actual trip availability and season opening before accepting reservations.
5. **Resort tickets**: The price is for transportation only in this rebuild; current/previous live website listed lunch, tracking, etc., but these services are intentionally NOT promised here absent confirmation. Brian Head and Arizona Snowbowl are offered as quote requests because the standard Lee Canyon schedule cannot apply to those longer distances.
6. **Hosting**: Existing website appears to be WordPress. Uploading these files as a ZIP to WordPress media will not replace a live homepage. Deploy the folder to static hosting, or replace the site root using hosting FTP/file manager (after backing up your old WordPress install and reviewing DNS). For GitHub Pages, a repository with these files supports static preview, but custom domain DNS must be configured separately.
7. **Email workflow**: A visitor must SEND the generated email draft. Some browsers will not have an email app configured. The site provides a copy fallback; to capture direct form submissions without a user's email app, connect an approved server-side backend or verified hosted forms provider, secure consent, and add abuse/spam controls.
8. **Visual assets**: Background images load from Unsplash and fonts from Google Fonts. Web connectivity is required for these assets. Photos are from Unsplash under the [Unsplash License](https://unsplash.com/license); images depict generic alpine scenery, not necessarily Lee Canyon, Brian Head, or Arizona Snowbowl. Replace with permissioned authentic photos before large marketing campaigns if preferred.

## Test checklist

- Desktop and mobile navigation / links
- Booking form required fields, date restrictions, quote estimate, copy request, and mailto draft on the target device
- Call phone number / verify email inbox can receive messages
- Accessibility keyboard navigation, alt descriptions and contrast
- Resort/weather policy, refund and promotional terms
- Independent operator branding and no misleading claims of affiliated status

## Public sources consulted

- Existing live site: https://vegasskishuttle.com/
- Lee Canyon: https://www.leecanyonlv.com/ and https://www.leecanyonlv.com/skiing-snowboarding-faq/
- Image pages: https://unsplash.com/photos/ski-lift-over-snowy-mountain-and-trees-91UgLh4bexY and https://unsplash.com/photos/snowy-mountain-landscape-with-ski-slopes-and-ski-lifts-Fpoo3KyPcIc and https://unsplash.com/photos/snowy-mountain-landscape-with-ski-lift-and-skiers-rw0fpKnyslg

Copyright 2026 Vegas Ski & Snowboarding Shuttle. Site design and text generated for the user. External imagery and fonts retain their respective licenses.


## Destination and attraction photography

The site now shows 8 local attraction cards and real location imagery for Lee Canyon, Brian Head and Arizona Snowbowl. Photo credits and each license/source link are published in `photo-credits.html`. Images are externally loaded from Wikimedia Commons thumbnails and the built-in local mountain SVG is retained as a network-error fallback. Attractions in the gallery are informational, not claimed shuttle stops.
