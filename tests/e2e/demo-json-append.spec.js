import { test, expect } from '@playwright/test'

test.describe('Blapy2 Task List', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost/blapy2-final/blapy2/demos/demo-json-append/', {
            waitUntil: 'networkidle'
        })
    })

    test('should add single task', async ({ page }) => {
        await page.click('#addTask')

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(1)

        await expect(page.locator('.task-title').first()).toContainText('Task #1')
    })

    test('should add multiple tasks at once', async ({ page }) => {
        await page.click('#addMultiple')

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(3)
    })

    test('should not exceed maximum of 10 tasks', async ({ page }) => {
        for (let i = 0; i < 5; i++) {
            await page.click('#addMultiple')
        }

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(10)
    })

    test('should add new tasks at the start', async ({ page }) => {
        await page.click('#addTask')
        await page.waitForTimeout(100)

        const firstTaskTitle = await page.locator('.task-title').first().textContent()

        await page.click('#addTask')
        await page.waitForTimeout(100)

        const newFirstTaskTitle = await page.locator('.task-title').first().textContent()

        expect(newFirstTaskTitle).not.toBe(firstTaskTitle)
    })

    test('should reset with 10 new tasks', async ({ page }) => {
        await page.click('#addTask')
        await page.click('#clearTasks')

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(10)

        await expect(page.locator('.task-title').first()).toContainText('Reset Task #1')
    })

    test('should show empty state initially', async ({ page }) => {
        await expect(page.locator('.empty-state')).toHaveText('No tasks for now')

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(0)
    })

    test('should maintain max limit when adding after reset', async ({ page }) => {
        await page.click('#clearTasks')
        await page.click('#addMultiple')

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(10)
    })

    test('should have proper task structure', async ({ page }) => {
        await page.click('#addTask')

        const task = page.locator('.task').first()
        await expect(task.locator('.task-title')).toBeVisible()
        await expect(task.locator('.task-time')).toBeVisible()
        await expect(task.locator('.task-time')).toContainText('Added at')
    })

    test('should handle rapid clicking without exceeding limit', async ({ page }) => {
        await page.waitForSelector('#addTask')
        await page.locator('#addTask').waitFor({ state: 'visible' })

        const addButton = page.locator('#addTask')

        for (let i = 0; i < 10; i++) {
            await addButton.click()
            await page.waitForTimeout(50)
        }

        await page.waitForTimeout(500)

        const tasks = page.locator('.task')
        await expect(tasks).toHaveCount(10)
    })

    test('should update task counter correctly', async ({ page }) => {
        await page.click('#addTask')
        await page.click('#addTask')

        const titles = await page.locator('.task-title').allTextContents()
        expect(titles).toContain('Task #1')
        expect(titles).toContain('Task #2')
    })
})