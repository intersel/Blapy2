import { test, expect } from '@playwright/test'

test('See if all blapy block are loaded', async ({ page }) => {
  await page.goto('http://localhost/blapy2-final/blapy2/demos/bootstrap-four-column-gallery/')

  await page.waitForLoadState('networkidle')

  await autoScroll(page)

  const containers = await page.$$('[data-blapy-container]')

  expect(containers.length).toBe(11);
})

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0
      const distance = 100
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight
        window.scrollBy(0, distance)
        totalHeight += distance

        if (totalHeight >= scrollHeight) {
          clearInterval(timer)
          resolve()
        }
      }, 100)
    })
  })
}
