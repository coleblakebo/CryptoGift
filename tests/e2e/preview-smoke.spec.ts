import { expect, test } from '@playwright/test'

test('homepage and create page load', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Send Crypto with a fun twist.' })).toBeVisible()
  await page.getByRole('link', { name: 'Create a Gift' }).click()

  await expect(page.getByRole('heading', { name: 'Create a new gift' })).toBeVisible()
  await expect(page.getByText('KindredCoins Studio')).toBeVisible()
})

test('recipient can create and claim a gift on preview', async ({ page }) => {
  const unique = Date.now().toString()
  const giftId = `e2e-${unique}`
  const recipientName = `Preview Test ${unique}`
  const walletAddress = `bc1qe2e${unique}previewwallet0000000000`

  await page.goto('/create')

  await page.getByLabel('Recipient name').fill(recipientName)
  await page.getByLabel('Recipient email').fill(`recipient-${unique}@example.com`)
  await page.getByLabel('From').fill('KindredCoins QA')
  await page.getByLabel('Sender email').fill(`sender-${unique}@example.com`)
  await page.getByLabel('Holiday / Occasion').selectOption('Birthday')
  await page.getByLabel('Amount display').fill('$10')
  await page.getByLabel('Gift URL slug').fill(giftId)
  await page.getByLabel('Message').fill('Automated preview smoke test')

  await page.getByRole('button', { name: 'Create Gift' }).click()

  await expect(page.getByRole('heading', { name: 'Gift created' })).toBeVisible()
  const shareUrl = await page.locator('input[readonly]').inputValue()

  await page.goto(shareUrl)

  await page.getByRole('button', { name: 'Open gift' }).click()
  await expect(page.getByRole('heading', { name: `A Gift for ${recipientName}` })).toBeVisible()

  await page.getByRole('button', { name: 'Claim My Gift' }).click()
  await page.getByPlaceholder('e.g. wallet address').fill(walletAddress)
  await page.getByRole('button', { name: 'Submit' }).click()

  await expect(page.getByRole('heading', { name: 'All set!' })).toBeVisible()
  await expect(page.getByText(`To: ${walletAddress}`)).toBeVisible()
})
