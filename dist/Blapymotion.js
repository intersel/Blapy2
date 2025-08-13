/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : Blapymotion.js
 * Blapy2 Animation module for browser usage.
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2025
 * @fileoverview Blapy2 Animation module for browser usage.
 * @see {@link https://github.com/intersel/blapy2}
 * @author Corentin NELHOMME - corentin.nelhomme@intersel.fr
 * @version 1.0.2
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
var Blapymotion=function(){"use strict";return class{constructor(){this.fadeInOut=this.fadeInOut.bind(this),this.rightOutIn=this.rightOutIn.bind(this)}fadeInOut(t,e){const s=parseInt(e.dataset.blapyFadeoutDelay)||1500,i=parseInt(e.dataset.blapyFadeinDelay)||1500;this._fadeOut(t,s,()=>{e.style.opacity=0,t.replaceWith(e),this._fadeIn(e,i)})}rightOutIn(t,e){const s=parseInt(e.dataset.blapyFadeoutDelay)||1500,i=parseInt(e.dataset.blapyFadeinDelay)||1500,a=t.getBoundingClientRect().left,l=document.documentElement.clientWidth;t.style.position="relative",t.style.overflow="hidden",t.style.left=`${a}px`,this._slideOutRight(t,l,s,()=>{e.style.opacity=0,e.style.overflow="hidden",e.style.position="relative",e.style.left=`${l}px`,t.replaceWith(e),this._slideInFromRight(e,a,i,()=>{e.style.position="static",e.style.left="0px"})})}_fadeOut(t,e,s){t.style.transition=`opacity ${e}ms ease`,t.style.opacity=0,setTimeout(()=>s?.(),e)}_fadeIn(t,e,s){t.style.transition=`opacity ${e}ms ease`,t.style.opacity=1,setTimeout(()=>s?.(),e)}_slideOutRight(t,e,s,i){t.style.transition=`left ${s}ms ease, opacity ${s}ms ease`,t.style.left=`${e}px`,t.style.opacity=0,setTimeout(()=>i?.(),s)}_slideInFromRight(t,e,s,i){t.style.transition=`left ${s}ms ease, opacity ${s}ms ease`,t.style.left=`${e}px`,t.style.opacity=1,setTimeout(()=>i?.(),s)}}}();
