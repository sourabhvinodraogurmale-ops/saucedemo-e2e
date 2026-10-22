# SauceDemo E2E – Purchase Flow (Playwright)

Automates: **Login → add product → cart → checkout info → overview totals → finish → confirmation**
against https://www.saucedemo.com using `standard_user`.

## Setup
```bash
npm install
npx playwright install chromium
```

## Run
```bash
npx playwright test            # headless
npx playwright test --headed   # watch it run
npx playwright show-report     # HTML report (traces/screenshots on failure)
```

## Design notes
- Locators use the app's stable `data-test` attributes via `getByTestId` (configured in `playwright.config.js`).
- No hard-coded waits: Playwright auto-waiting + web-first assertions only.
- Each test gets a fresh browser context, so cart state (stored in localStorage) never leaks between tests.
- Assertions cover cart contents, price, tax/total arithmetic, confirmation text, and that the cart is emptied.
- Includes one negative test (missing first name blocks checkout).

## Limitations
- Runs against a public shared site (network dependent, no control over its data).
- Only `standard_user` / Chromium covered; no cross-browser matrix.
- Tax rate is not hard-coded (checks subtotal + tax = total), so a wrong tax *rate* would not be caught.
- Does not assert the known defects (see report); those are documented, not encoded as tests.
