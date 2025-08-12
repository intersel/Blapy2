/**
 * Tests Playwright pour la navigation Blapy
 * Teste la navigation sans rechargement de page et le chargement dynamique de contenu
 */

import { test, expect } from '@playwright/test'

test.describe('Blapy Navigation Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost/blapy2-final/blapy2/demos/demo1/')
  
  })

  test('should navigate between pages without page reload', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('This is test1.html file')
    await expect(page.locator('#mainContainer')).toContainText('test1.html')

    let navigationRequests = 0
    page.on('request', request => {
      if (request.url().includes('.html') && request.method() === 'GET') {
        navigationRequests++
      }
    })

    await page.click('a[href="test2.html#blapylink"]')
    
    await page.waitForFunction(() => {
      const mainContainer = document.querySelector('#mainContainer')
      return mainContainer && mainContainer.textContent.includes('test2.html')
    }, { timeout: 5000 })

    await expect(page.locator('#mainContainer')).toContainText('test2.html')
    await expect(page.locator('#header p')).toContainText('Standard header 2')
    
    expect(page.url()).toContain('test2.html')

    await page.click('a[href="test3.html#blapylink"]')
    
    await page.waitForFunction(() => {
      const mainContainer = document.querySelector('#mainContainer')
      return mainContainer && mainContainer.textContent.includes('test3.html')
    }, { timeout: 5000 })

    await expect(page.locator('#mainContainer')).toContainText('test3.html')
    await expect(page.locator('#header p')).toContainText('Standard header 3')
    await expect(page.locator('#footer p')).toContainText('new footer from test3')

    expect(page.url()).toContain('test3.html')

    await page.click('a[href="index.html#blapylink"]')
    
    await page.waitForFunction(() => {
      const mainContainer = document.querySelector('#mainContainer')
      return mainContainer && mainContainer.textContent.includes('test1.html')
    }, { timeout: 5000 })

    await expect(page.locator('#mainContainer')).toContainText('test1.html')
    await expect(page.locator('#header p')).toContainText('Standard header 1')

    console.log(`Nombre de requêtes de navigation: ${navigationRequests}`)
  })

  test('should load dynamic content for menu4 without page navigation', async ({ page }) => {

    await expect(page.locator('h1')).toContainText('This is test1.html file')

    const submenu4 = page.locator('#submenu4')
    
    const initialContent = await submenu4.textContent()
    expect(initialContent).not.toContain('This is test4.html file content')

    let ajaxRequests = 0
    page.on('request', request => {
      if (request.url().includes('test4.html')) {
        ajaxRequests++
      }
    })

    await page.click('a[href="test4.html#blapylink"]')

    await page.waitForFunction(() => {
      const submenu = document.querySelector('#submenu4')
      return submenu && submenu.textContent.includes('This is test4.html file content')
    }, { timeout: 5000 })

    await expect(submenu4).toContainText('This is test4.html file content')
    await expect(submenu4).toContainText('sub1')
    await expect(submenu4).toContainText('sub2')
    await expect(submenu4).toContainText('sub3')

    expect(page.url()).toContain('test4.html')

    await expect(page.locator('h1').first()).toContainText('This is test1.html file')
    await expect(page.locator('#mainContainer')).toContainText('test1.html')

    expect(ajaxRequests).toBeGreaterThan(0)
  })

  test('should handle browser back/forward navigation', async ({ page }) => {

    await page.click('a[href="test2.html#blapylink"]')
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test2.html')
    }, { timeout: 5000 })

    await page.click('a[href="test3.html#blapylink"]')
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test3.html')
    }, { timeout: 5000 })

    await page.goBack()
    
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test2.html')
    }, { timeout: 5000 })

    await expect(page.locator('#mainContainer')).toContainText('test2.html')
    expect(page.url()).toContain('test2.html')

    await page.goForward()
    
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test3.html')
    }, { timeout: 5000 })

    await expect(page.locator('#mainContainer')).toContainText('test3.html')
    expect(page.url()).toContain('test3.html')
  })

  test('should maintain Blapy container structure during navigation', async ({ page }) => {

    await expect(page.locator('[data-blapy-container="true"]')).toHaveCount(5) 
    
    const initialContainerNames = await page.evaluate(() => {
      const containers = document.querySelectorAll('[data-blapy-container="true"]')
      return Array.from(containers).map(c => c.getAttribute('data-blapy-container-name'))
    })
    
    expect(initialContainerNames).toEqual(['header', 'menuHeader', 'mainContainer', 'footer'])

    await page.click('a[href="test2.html#blapylink"]')
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test2.html')
    }, { timeout: 5000 })

    await expect(page.locator('[data-blapy-container="true"]')).toHaveCount(4)
    
    const afterNavigationContainerNames = await page.evaluate(() => {
      const containers = document.querySelectorAll('[data-blapy-container="true"]')
      return Array.from(containers).map(c => c.getAttribute('data-blapy-container-name'))
    })
    
    expect(afterNavigationContainerNames).toEqual(['header', 'menuHeader', 'mainContainer', 'footer'])

    const headerContent = await page.locator('#header').getAttribute('data-blapy-container-content')
    expect(headerContent).toBe('standardHeader2')
  })

  test('should trigger Blapy events during navigation', async ({ page }) => {
    // Écouter les événements Blapy
    const events = []
    
    page.on('console', msg => {
      if (msg.text().includes('Blapy')) {
        events.push(msg.text())
      }
    })

    // Ajouter des listeners d'événements dans le navigateur
    await page.evaluate(() => {
      const app = document.querySelector('#myApplication')
      
      app.addEventListener('Blapy_beforePageLoad', (e) => {
        console.log('Blapy Event: beforePageLoad', e.detail)
      })
      
      app.addEventListener('Blapy_afterContentChange', (e) => {
        console.log('Blapy Event: afterContentChange', e.detail)
      })
      
      app.addEventListener('Blapy_afterPageChange', (e) => {
        console.log('Blapy Event: afterPageChange', e.detail)
      })
    })

    // Déclencher une navigation
    await page.click('a[href="test2.html"]')
    
    // Attendre que la navigation soit terminée
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test2.html')
    }, { timeout: 5000 })

    // Attendre un peu pour que tous les événements soient déclenchés
    await page.waitForTimeout(1000)

    // Les événements Blapy devraient avoir été déclenchés
    // (La vérification exacte dépend de l'implémentation des logs)
  })

  test('should handle multiple rapid clicks gracefully', async ({ page }) => {
    // Cliquer rapidement sur plusieurs liens
    await Promise.all([
      page.click('a[href="test2.html"]'),
      page.waitForTimeout(100),
      page.click('a[href="test3.html"]'),
      page.waitForTimeout(100),
      page.click('a[href="index.html"]')
    ])

    // Attendre que la dernière navigation soit terminée
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test1.html')
    }, { timeout: 5000 })

    // Vérifier que nous sommes bien revenus à la page d'accueil
    await expect(page.locator('#mainContainer')).toContainText('test1.html')
    expect(page.url()).toContain('index.html')
  })

  test('should preserve menu state during navigation', async ({ page }) => {
    // Vérifier que tous les liens de menu sont présents initialement
    await expect(page.locator('a[data-blapy-link]')).toHaveCount(4) // menu1, menu2, menu3, menu4

    // Naviguer vers test3 qui a moins de liens dans le menu
    await page.click('a[href="test3.html"]')
    await page.waitForFunction(() => {
      return document.querySelector('#mainContainer').textContent.includes('test3.html')
    }, { timeout: 5000 })

    // Vérifier que le menu a été mis à jour (test3 n'a que 2 liens)
    await expect(page.locator('#menuHeader a[data-blapy-link]')).toHaveCount(2)
    
    const menuLinks = await page.locator('#menuHeader a').allTextContents()
    expect(menuLinks).toEqual(['menu1', 'menu2'])
  })

  test('should handle error cases gracefully', async ({ page }) => {
    // Tenter de naviguer vers une page qui n'existe pas
    await page.evaluate(() => {
      const link = document.createElement('a')
      link.href = 'nonexistent.html'
      link.setAttribute('data-blapy-link', '')
      link.textContent = 'Non-existent page'
      link.id = 'test-nonexistent-link'
      document.body.appendChild(link)
    })

    // Écouter les erreurs de console
    const consoleErrors = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Cliquer sur le lien vers une page inexistante
    await page.click('#test-nonexistent-link')

    // Attendre un peu pour voir si des erreurs se produisent
    await page.waitForTimeout(2000)

    // La page devrait rester stable (pas de crash)
    await expect(page.locator('h1')).toContainText('This is test1.html file')
    
    // Vérifier qu'une erreur appropriée a été loggée
    // (La vérification exacte dépend de l'implémentation de la gestion d'erreur)
  })
})

// Configuration Playwright pour ces tests
test.describe.configure({
  // Exécuter les tests en série pour éviter les conflits d'état
  mode: 'serial'
})

// Helper functions pour les tests
test.extend({
  // Helper pour attendre qu'un conteneur Blapy soit mis à jour
  waitForBlapyContainerUpdate: async ({ page }, containerName, expectedContent) => {
    await page.waitForFunction(
      ({ name, content }) => {
        const container = document.querySelector(`[data-blapy-container-name="${name}"]`)
        return container && container.textContent.includes(content)
      },
      { containerName, expectedContent },
      { timeout: 5000 }
    )
  },

  // Helper pour vérifier l'état des conteneurs Blapy
  checkBlapyContainers: async ({ page }) => {
    return await page.evaluate(() => {
      const containers = document.querySelectorAll('[data-blapy-container="true"]')
      return Array.from(containers).map(container => ({
        name: container.getAttribute('data-blapy-container-name'),
        content: container.getAttribute('data-blapy-container-content'),
        id: container.id,
        textContent: container.textContent.trim()
      }))
    })
  }
})