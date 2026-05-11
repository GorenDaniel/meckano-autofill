/**
--- CREDENTIALS ---
Fill in your Meckano email and password below before using the login function.
*/
const MECKANO_EMAIL = 'daniel@gmail.com'
const MECKANO_PASSWORD = '1234%6789'

/**
--- USAGE ---
Option A — Login + fill in two steps:
  1. Go to https://app.meckano.co.il/login.php#login
  2. Inject this script into the page
  3. Run `await login()`  →  the page will redirect after login
  4. Navigate to your monthly report: https://app.meckano.co.il/#report/21-06-2022/20-07-2022
  5. Inject this script again and run `await fillMonth()`

Option B — Already logged in:
  1. Go to your monthly report: https://app.meckano.co.il/#report/21-06-2022/20-07-2022
  2. Inject this script into the page
  3. Run `await fillMonth()`
*/

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function waitFor(selector, parent = document) {
  let attempts = 10
  while (attempts > 0) {
    const element = parent.querySelector(selector)
    if (element) {
      return element
    }
    await sleep(50)
    attempts--
  }
  throw new Error(`Could not find ${selector}`)
}

async function login() {
  const emailInput = await waitFor('input[name="email"], input[type="email"], #email')
  const passwordInput = await waitFor('input[type="password"], input[name="password"]')
  emailInput.value = MECKANO_EMAIL
  passwordInput.value = MECKANO_PASSWORD
  const submitBtn = await waitFor('button[type="submit"], input[type="submit"], button.login-btn')
  submitBtn.click()
}

function getNonRestDays() {
  return document.querySelectorAll(
    'table.employee-report > tbody > tr[data-report_data_id]:not(.highlightingRestDays)'
  )
}

function getMissingDays(nonRestDays) {
  return Array.from(nonRestDays)
    .filter(tr => tr.querySelector('.missing').innerText === '+')
    .filter(tr => !tr.querySelector('.specialDayDescription').textContent.length)
    .filter(tr => !tr.querySelector('p').innerText.match(/ ה$/))
}

async function submitHours(day) {
  day.querySelector('a.insert-row').click()
  const insertRow = await waitFor('tr.insert-row')
  insertRow.querySelector('input.checkin-str').value = '09:00'
  insertRow.querySelector('input.checkout-str').value = '18:00'
  insertRow.querySelector('button.inline-confirm').click()
  await sleep(1000)
}

async function fillMonth() {
  let nonRestDays = getNonRestDays()
  let missingDays = getMissingDays(nonRestDays)
  while (missingDays.length > 0) {
    await submitHours(missingDays[0])
    nonRestDays = getNonRestDays()
    missingDays = getMissingDays(nonRestDays)
  }
}
