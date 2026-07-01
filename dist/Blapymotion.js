/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : BlapyMotion
 * Optional animation module for Blapy (standalone browser build).
 * Load with <script src="dist/BlapyMotion.js"> to enable data-blapy-update="fadeInOut"/"rightOutIn".
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2026
 * @see {@link https://github.com/intersel/blapy2}
 * @version 2.1.2
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
var BlapyMotionBundle=function(){"use strict";/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Blapymotion.js
 * Animation extensions for Blapy V2
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2026
 * @fileoverview Provides animation functions for content transitions in Blapy V2.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.0
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */class l{constructor(){this.fadeInOut=this.fadeInOut.bind(this),this.rightOutIn=this.rightOutIn.bind(this)}fadeInOut(s,t){const e=parseInt(t.dataset.blapyFadeoutDelay??"")||1500,i=parseInt(t.dataset.blapyFadeinDelay??"")||1500;this._fadeOut(s,e,()=>{t.style.opacity=String(0),s.replaceWith(t),this._fadeIn(t,i)})}rightOutIn(s,t){const e=parseInt(t.dataset.blapyFadeoutDelay??"")||1500,i=parseInt(t.dataset.blapyFadeinDelay??"")||1500,a=s.getBoundingClientRect().left,y=document.documentElement.clientWidth;s.style.position="relative",s.style.overflow="hidden",s.style.left=`${a}px`,this._slideOutRight(s,y,e,()=>{t.style.opacity=String(0),t.style.overflow="hidden",t.style.position="relative",t.style.left=`${y}px`,s.replaceWith(t),this._slideInFromRight(t,a,i,()=>{t.style.position="static",t.style.left="0px"})})}_fadeOut(s,t,e){s.style.transition=`opacity ${t}ms ease`,s.style.opacity=String(0),setTimeout(()=>e?.(),t)}_fadeIn(s,t,e){s.style.transition=`opacity ${t}ms ease`,s.style.opacity=String(1),setTimeout(()=>e?.(),t)}_slideOutRight(s,t,e,i){s.style.transition=`left ${e}ms ease, opacity ${e}ms ease`,s.style.left=`${t}px`,s.style.opacity=String(0),setTimeout(()=>i?.(),e)}_slideInFromRight(s,t,e,i){s.style.transition=`left ${e}ms ease, opacity ${e}ms ease`,s.style.left=`${t}px`,s.style.opacity=String(1),setTimeout(()=>i?.(),e)}}return globalThis.Blapymotion=l,l}();
