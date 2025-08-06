/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Blapymotion.js
 * Animation extensions for Blapy V2
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview Provides animation functions for content transitions in Blapy V2.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */

class Blapymotion {
  constructor() {
    this.fadeInOut = this.fadeInOut.bind(this)
    this.rightOutIn = this.rightOutIn.bind(this)
  }

  /**
   * Performs a fade-out on the old container, then fades in the new one.
   * @param {HTMLElement} oldContainer - The container currently visible.
   * @param {HTMLElement} newContainer - The container to be displayed.
   */
  fadeInOut(oldContainer, newContainer) {
    const fadeOutDelay = parseInt(newContainer.dataset.blapyFadeoutDelay) || 1500
    const fadeInDelay = parseInt(newContainer.dataset.blapyFadeinDelay) || 1500

    this._fadeOut(oldContainer, fadeOutDelay, () => {
      newContainer.style.opacity = 0
      oldContainer.replaceWith(newContainer)
      this._fadeIn(newContainer, fadeInDelay)
    })
  }

  /**
   * Slides the old container out to the right and brings in the new one from the right.
   * @param {HTMLElement} oldContainer - The container currently visible.
   * @param {HTMLElement} newContainer - The container to be displayed.
   */
  rightOutIn(oldContainer, newContainer) {
    const fadeOutDelay = parseInt(newContainer.dataset.blapyFadeoutDelay) || 1500
    const fadeInDelay = parseInt(newContainer.dataset.blapyFadeinDelay) || 1500

    const originalLeft = oldContainer.getBoundingClientRect().left
    const documentWidth = document.documentElement.clientWidth

    oldContainer.style.position = 'relative'
    oldContainer.style.overflow = 'hidden'
    oldContainer.style.left = `${originalLeft}px`

    this._slideOutRight(oldContainer, documentWidth, fadeOutDelay, () => {
      newContainer.style.opacity = 0
      newContainer.style.overflow = 'hidden'
      newContainer.style.position = 'relative'
      newContainer.style.left = `${documentWidth}px`

      oldContainer.replaceWith(newContainer)

      this._slideInFromRight(newContainer, originalLeft, fadeInDelay, () => {
        newContainer.style.position = 'static'
        newContainer.style.left = '0px'
      })
    })
  }

  // --- Internal utility animation functions ---

  /**
   * Fades out an element.
   * @private
   * @param {HTMLElement} el - The element to fade out.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _fadeOut(el, duration, callback) {
    el.style.transition = `opacity ${duration}ms ease`
    el.style.opacity = 0
    setTimeout(() => callback?.(), duration)
  }

  /**
   * Fades in an element.
   * @private
   * @param {HTMLElement} el - The element to fade in.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _fadeIn(el, duration, callback) {
    el.style.transition = `opacity ${duration}ms ease`
    el.style.opacity = 1
    setTimeout(() => callback?.(), duration)
  }

  /**
   * Slides an element out to the right and fades it out.
   * @private
   * @param {HTMLElement} el - The element to slide out.
   * @param {number} distance - Target left position (usually screen width).
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _slideOutRight(el, distance, duration, callback) {
    el.style.transition = `left ${duration}ms ease, opacity ${duration}ms ease`
    el.style.left = `${distance}px`
    el.style.opacity = 0
    setTimeout(() => callback?.(), duration)
  }

  /**
   * Slides an element in from the right and fades it in.
   * @private
   * @param {HTMLElement} el - The element to slide in.
   * @param {number} targetLeft - Final left position.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _slideInFromRight(el, targetLeft, duration, callback) {
    el.style.transition = `left ${duration}ms ease, opacity ${duration}ms ease`
    el.style.left = `${targetLeft}px`
    el.style.opacity = 1
    setTimeout(() => callback?.(), duration)
  }
}

export default Blapymotion;