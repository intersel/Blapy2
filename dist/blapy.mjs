/**
 * -----------------------------------------------------------------------------------------
 * INTERSEL - 4 cité d'Hauteville - 75010 PARIS
 * RCS PARIS 488 379 660 - NAF 721Z
 *
 * File : blapy
 * Klapy runtime (modern TypeScript build, no jQuery).
 *
 * -----------------------------------------------------------------------------------------
 * @copyright Intersel 2015-2026
 * @see {@link https://github.com/intersel/blapy2}
 * @version 2.1.2
 * @license DonationWare - see https://github.com/intersel/blapy2/blob/master/LICENSE
 * -----------------------------------------------------------------------------------------
 */
const PROJECT_NAME = "Klapy";
class Logger {
  debug;
  logLevel;
  alertError;
  constructor(e = {}) {
    const {
      debug: t = !1,
      logLevel: n = 1,
      alertError: r = !1
    } = e;
    this.debug = t, this.logLevel = n, this.alertError = r;
  }
  error(e, t = PROJECT_NAME) {
    this.log(e, t, 1);
  }
  warn(e, t = PROJECT_NAME) {
    this.log(e, t, 2);
  }
  info(e, t = PROJECT_NAME) {
    this.log(e, t, 3);
  }
  log(e, t, n = 3) {
    if (!(n > this.logLevel) && !(n >= 2 && !this.debug) && (globalThis.window !== void 0 && globalThis.console?.log() || typeof console < "u"))
      switch (n) {
        case 1:
          console.log(`%c[${PROJECT_NAME}] %c${e} from ${t}`, "background: red; padding: 2px 8px; margin-right: 10px;", "black");
          break;
        case 2:
          console.log(`%c[${PROJECT_NAME}] %c${e} from ${t}`, "background: orange; padding: 2px 8px; margin-right: 10px;", "black");
          break;
        case 3:
          console.log(`[Klapy] ${e} from ${t}`);
          break;
        default:
          console.log(`[Klapy] ${e} from ${t}`);
          break;
      }
  }
}
var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/, ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/, ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/, unicode = {
  Space_Separator,
  ID_Start,
  ID_Continue
}, util = {
  isSpaceSeparator(a) {
    return typeof a == "string" && unicode.Space_Separator.test(a);
  },
  isIdStartChar(a) {
    return typeof a == "string" && (a >= "a" && a <= "z" || a >= "A" && a <= "Z" || a === "$" || a === "_" || unicode.ID_Start.test(a));
  },
  isIdContinueChar(a) {
    return typeof a == "string" && (a >= "a" && a <= "z" || a >= "A" && a <= "Z" || a >= "0" && a <= "9" || a === "$" || a === "_" || a === "‌" || a === "‍" || unicode.ID_Continue.test(a));
  },
  isDigit(a) {
    return typeof a == "string" && /[0-9]/.test(a);
  },
  isHexDigit(a) {
    return typeof a == "string" && /[0-9A-Fa-f]/.test(a);
  }
};
let source, parseState, stack, pos, line, column, token, key, root;
var parse = function(e, t) {
  source = String(e), parseState = "start", stack = [], pos = 0, line = 1, column = 0, token = void 0, key = void 0, root = void 0;
  do
    token = lex(), parseStates[parseState]();
  while (token.type !== "eof");
  return typeof t == "function" ? internalize({ "": root }, "", t) : root;
};
function internalize(a, e, t) {
  const n = a[e];
  if (n != null && typeof n == "object")
    if (Array.isArray(n))
      for (let r = 0; r < n.length; r++) {
        const u = String(r), s = internalize(n, u, t);
        s === void 0 ? delete n[u] : Object.defineProperty(n, u, {
          value: s,
          writable: !0,
          enumerable: !0,
          configurable: !0
        });
      }
    else
      for (const r in n) {
        const u = internalize(n, r, t);
        u === void 0 ? delete n[r] : Object.defineProperty(n, r, {
          value: u,
          writable: !0,
          enumerable: !0,
          configurable: !0
        });
      }
  return t.call(a, e, n);
}
let lexState, buffer, doubleQuote, sign, c;
function lex() {
  for (lexState = "default", buffer = "", doubleQuote = !1, sign = 1; ; ) {
    c = peek();
    const a = lexStates[lexState]();
    if (a)
      return a;
  }
}
function peek() {
  if (source[pos])
    return String.fromCodePoint(source.codePointAt(pos));
}
function read() {
  const a = peek();
  return a === `
` ? (line++, column = 0) : a ? column += a.length : column++, a && (pos += a.length), a;
}
const lexStates = {
  default() {
    switch (c) {
      case "	":
      case "\v":
      case "\f":
      case " ":
      case " ":
      case "\uFEFF":
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        read();
        return;
      case "/":
        read(), lexState = "comment";
        return;
      case void 0:
        return read(), newToken("eof");
    }
    if (util.isSpaceSeparator(c)) {
      read();
      return;
    }
    return lexStates[parseState]();
  },
  comment() {
    switch (c) {
      case "*":
        read(), lexState = "multiLineComment";
        return;
      case "/":
        read(), lexState = "singleLineComment";
        return;
    }
    throw invalidChar(read());
  },
  multiLineComment() {
    switch (c) {
      case "*":
        read(), lexState = "multiLineCommentAsterisk";
        return;
      case void 0:
        throw invalidChar(read());
    }
    read();
  },
  multiLineCommentAsterisk() {
    switch (c) {
      case "*":
        read();
        return;
      case "/":
        read(), lexState = "default";
        return;
      case void 0:
        throw invalidChar(read());
    }
    read(), lexState = "multiLineComment";
  },
  singleLineComment() {
    switch (c) {
      case `
`:
      case "\r":
      case "\u2028":
      case "\u2029":
        read(), lexState = "default";
        return;
      case void 0:
        return read(), newToken("eof");
    }
    read();
  },
  value() {
    switch (c) {
      case "{":
      case "[":
        return newToken("punctuator", read());
      case "n":
        return read(), literal("ull"), newToken("null", null);
      case "t":
        return read(), literal("rue"), newToken("boolean", !0);
      case "f":
        return read(), literal("alse"), newToken("boolean", !1);
      case "-":
      case "+":
        read() === "-" && (sign = -1), lexState = "sign";
        return;
      case ".":
        buffer = read(), lexState = "decimalPointLeading";
        return;
      case "0":
        buffer = read(), lexState = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        buffer = read(), lexState = "decimalInteger";
        return;
      case "I":
        return read(), literal("nfinity"), newToken("numeric", 1 / 0);
      case "N":
        return read(), literal("aN"), newToken("numeric", NaN);
      case '"':
      case "'":
        doubleQuote = read() === '"', buffer = "", lexState = "string";
        return;
    }
    throw invalidChar(read());
  },
  identifierNameStartEscape() {
    if (c !== "u")
      throw invalidChar(read());
    read();
    const a = unicodeEscape();
    switch (a) {
      case "$":
      case "_":
        break;
      default:
        if (!util.isIdStartChar(a))
          throw invalidIdentifier();
        break;
    }
    buffer += a, lexState = "identifierName";
  },
  identifierName() {
    switch (c) {
      case "$":
      case "_":
      case "‌":
      case "‍":
        buffer += read();
        return;
      case "\\":
        read(), lexState = "identifierNameEscape";
        return;
    }
    if (util.isIdContinueChar(c)) {
      buffer += read();
      return;
    }
    return newToken("identifier", buffer);
  },
  identifierNameEscape() {
    if (c !== "u")
      throw invalidChar(read());
    read();
    const a = unicodeEscape();
    switch (a) {
      case "$":
      case "_":
      case "‌":
      case "‍":
        break;
      default:
        if (!util.isIdContinueChar(a))
          throw invalidIdentifier();
        break;
    }
    buffer += a, lexState = "identifierName";
  },
  sign() {
    switch (c) {
      case ".":
        buffer = read(), lexState = "decimalPointLeading";
        return;
      case "0":
        buffer = read(), lexState = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        buffer = read(), lexState = "decimalInteger";
        return;
      case "I":
        return read(), literal("nfinity"), newToken("numeric", sign * (1 / 0));
      case "N":
        return read(), literal("aN"), newToken("numeric", NaN);
    }
    throw invalidChar(read());
  },
  zero() {
    switch (c) {
      case ".":
        buffer += read(), lexState = "decimalPoint";
        return;
      case "e":
      case "E":
        buffer += read(), lexState = "decimalExponent";
        return;
      case "x":
      case "X":
        buffer += read(), lexState = "hexadecimal";
        return;
    }
    return newToken("numeric", sign * 0);
  },
  decimalInteger() {
    switch (c) {
      case ".":
        buffer += read(), lexState = "decimalPoint";
        return;
      case "e":
      case "E":
        buffer += read(), lexState = "decimalExponent";
        return;
    }
    if (util.isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalPointLeading() {
    if (util.isDigit(c)) {
      buffer += read(), lexState = "decimalFraction";
      return;
    }
    throw invalidChar(read());
  },
  decimalPoint() {
    switch (c) {
      case "e":
      case "E":
        buffer += read(), lexState = "decimalExponent";
        return;
    }
    if (util.isDigit(c)) {
      buffer += read(), lexState = "decimalFraction";
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalFraction() {
    switch (c) {
      case "e":
      case "E":
        buffer += read(), lexState = "decimalExponent";
        return;
    }
    if (util.isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalExponent() {
    switch (c) {
      case "+":
      case "-":
        buffer += read(), lexState = "decimalExponentSign";
        return;
    }
    if (util.isDigit(c)) {
      buffer += read(), lexState = "decimalExponentInteger";
      return;
    }
    throw invalidChar(read());
  },
  decimalExponentSign() {
    if (util.isDigit(c)) {
      buffer += read(), lexState = "decimalExponentInteger";
      return;
    }
    throw invalidChar(read());
  },
  decimalExponentInteger() {
    if (util.isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  hexadecimal() {
    if (util.isHexDigit(c)) {
      buffer += read(), lexState = "hexadecimalInteger";
      return;
    }
    throw invalidChar(read());
  },
  hexadecimalInteger() {
    if (util.isHexDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  string() {
    switch (c) {
      case "\\":
        read(), buffer += escape();
        return;
      case '"':
        if (doubleQuote)
          return read(), newToken("string", buffer);
        buffer += read();
        return;
      case "'":
        if (!doubleQuote)
          return read(), newToken("string", buffer);
        buffer += read();
        return;
      case `
`:
      case "\r":
        throw invalidChar(read());
      case "\u2028":
      case "\u2029":
        separatorChar(c);
        break;
      case void 0:
        throw invalidChar(read());
    }
    buffer += read();
  },
  start() {
    switch (c) {
      case "{":
      case "[":
        return newToken("punctuator", read());
    }
    lexState = "value";
  },
  beforePropertyName() {
    switch (c) {
      case "$":
      case "_":
        buffer = read(), lexState = "identifierName";
        return;
      case "\\":
        read(), lexState = "identifierNameStartEscape";
        return;
      case "}":
        return newToken("punctuator", read());
      case '"':
      case "'":
        doubleQuote = read() === '"', lexState = "string";
        return;
    }
    if (util.isIdStartChar(c)) {
      buffer += read(), lexState = "identifierName";
      return;
    }
    throw invalidChar(read());
  },
  afterPropertyName() {
    if (c === ":")
      return newToken("punctuator", read());
    throw invalidChar(read());
  },
  beforePropertyValue() {
    lexState = "value";
  },
  afterPropertyValue() {
    switch (c) {
      case ",":
      case "}":
        return newToken("punctuator", read());
    }
    throw invalidChar(read());
  },
  beforeArrayValue() {
    if (c === "]")
      return newToken("punctuator", read());
    lexState = "value";
  },
  afterArrayValue() {
    switch (c) {
      case ",":
      case "]":
        return newToken("punctuator", read());
    }
    throw invalidChar(read());
  },
  end() {
    throw invalidChar(read());
  }
};
function newToken(a, e) {
  return {
    type: a,
    value: e,
    line,
    column
  };
}
function literal(a) {
  for (const e of a) {
    if (peek() !== e)
      throw invalidChar(read());
    read();
  }
}
function escape() {
  switch (peek()) {
    case "b":
      return read(), "\b";
    case "f":
      return read(), "\f";
    case "n":
      return read(), `
`;
    case "r":
      return read(), "\r";
    case "t":
      return read(), "	";
    case "v":
      return read(), "\v";
    case "0":
      if (read(), util.isDigit(peek()))
        throw invalidChar(read());
      return "\0";
    case "x":
      return read(), hexEscape();
    case "u":
      return read(), unicodeEscape();
    case `
`:
    case "\u2028":
    case "\u2029":
      return read(), "";
    case "\r":
      return read(), peek() === `
` && read(), "";
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      throw invalidChar(read());
    case void 0:
      throw invalidChar(read());
  }
  return read();
}
function hexEscape() {
  let a = "", e = peek();
  if (!util.isHexDigit(e) || (a += read(), e = peek(), !util.isHexDigit(e)))
    throw invalidChar(read());
  return a += read(), String.fromCodePoint(parseInt(a, 16));
}
function unicodeEscape() {
  let a = "", e = 4;
  for (; e-- > 0; ) {
    const t = peek();
    if (!util.isHexDigit(t))
      throw invalidChar(read());
    a += read();
  }
  return String.fromCodePoint(parseInt(a, 16));
}
const parseStates = {
  start() {
    if (token.type === "eof")
      throw invalidEOF();
    push();
  },
  beforePropertyName() {
    switch (token.type) {
      case "identifier":
      case "string":
        key = token.value, parseState = "afterPropertyName";
        return;
      case "punctuator":
        pop();
        return;
      case "eof":
        throw invalidEOF();
    }
  },
  afterPropertyName() {
    if (token.type === "eof")
      throw invalidEOF();
    parseState = "beforePropertyValue";
  },
  beforePropertyValue() {
    if (token.type === "eof")
      throw invalidEOF();
    push();
  },
  beforeArrayValue() {
    if (token.type === "eof")
      throw invalidEOF();
    if (token.type === "punctuator" && token.value === "]") {
      pop();
      return;
    }
    push();
  },
  afterPropertyValue() {
    if (token.type === "eof")
      throw invalidEOF();
    switch (token.value) {
      case ",":
        parseState = "beforePropertyName";
        return;
      case "}":
        pop();
    }
  },
  afterArrayValue() {
    if (token.type === "eof")
      throw invalidEOF();
    switch (token.value) {
      case ",":
        parseState = "beforeArrayValue";
        return;
      case "]":
        pop();
    }
  },
  end() {
  }
};
function push() {
  let a;
  switch (token.type) {
    case "punctuator":
      switch (token.value) {
        case "{":
          a = {};
          break;
        case "[":
          a = [];
          break;
      }
      break;
    case "null":
    case "boolean":
    case "numeric":
    case "string":
      a = token.value;
      break;
  }
  if (root === void 0)
    root = a;
  else {
    const e = stack[stack.length - 1];
    Array.isArray(e) ? e.push(a) : Object.defineProperty(e, key, {
      value: a,
      writable: !0,
      enumerable: !0,
      configurable: !0
    });
  }
  if (a !== null && typeof a == "object")
    stack.push(a), Array.isArray(a) ? parseState = "beforeArrayValue" : parseState = "beforePropertyName";
  else {
    const e = stack[stack.length - 1];
    e == null ? parseState = "end" : Array.isArray(e) ? parseState = "afterArrayValue" : parseState = "afterPropertyValue";
  }
}
function pop() {
  stack.pop();
  const a = stack[stack.length - 1];
  a == null ? parseState = "end" : Array.isArray(a) ? parseState = "afterArrayValue" : parseState = "afterPropertyValue";
}
function invalidChar(a) {
  return syntaxError(a === void 0 ? `JSON5: invalid end of input at ${line}:${column}` : `JSON5: invalid character '${formatChar(a)}' at ${line}:${column}`);
}
function invalidEOF() {
  return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
}
function invalidIdentifier() {
  return column -= 5, syntaxError(`JSON5: invalid identifier character at ${line}:${column}`);
}
function separatorChar(a) {
  console.warn(`JSON5: '${formatChar(a)}' in strings is not valid ECMAScript; consider escaping`);
}
function formatChar(a) {
  const e = {
    "'": "\\'",
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "	": "\\t",
    "\v": "\\v",
    "\0": "\\0",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029"
  };
  if (e[a])
    return e[a];
  if (a < " ") {
    const t = a.charCodeAt(0).toString(16);
    return "\\x" + ("00" + t).substring(t.length);
  }
  return a;
}
function syntaxError(a) {
  const e = new SyntaxError(a);
  return e.lineNumber = line, e.columnNumber = column, e;
}
var stringify = function(e, t, n) {
  const r = [];
  let u = "", s, l, p = "", m;
  if (t != null && typeof t == "object" && !Array.isArray(t) && (n = t.space, m = t.quote, t = t.replacer), typeof t == "function")
    l = t;
  else if (Array.isArray(t)) {
    s = [];
    for (const f of t) {
      let k;
      typeof f == "string" ? k = f : (typeof f == "number" || f instanceof String || f instanceof Number) && (k = String(f)), k !== void 0 && s.indexOf(k) < 0 && s.push(k);
    }
  }
  return n instanceof Number ? n = Number(n) : n instanceof String && (n = String(n)), typeof n == "number" ? n > 0 && (n = Math.min(10, Math.floor(n)), p = "          ".substr(0, n)) : typeof n == "string" && (p = n.substr(0, 10)), b("", { "": e });
  function b(f, k) {
    let F = k[f];
    switch (F != null && (typeof F.toJSON5 == "function" ? F = F.toJSON5(f) : typeof F.toJSON == "function" && (F = F.toJSON(f))), l && (F = l.call(k, f, F)), F instanceof Number ? F = Number(F) : F instanceof String ? F = String(F) : F instanceof Boolean && (F = F.valueOf()), F) {
      case null:
        return "null";
      case !0:
        return "true";
      case !1:
        return "false";
    }
    if (typeof F == "string")
      return o(F);
    if (typeof F == "number")
      return String(F);
    if (typeof F == "object")
      return Array.isArray(F) ? w(F) : C(F);
  }
  function o(f) {
    const k = {
      "'": 0.1,
      '"': 0.2
    }, F = {
      "'": "\\'",
      '"': '\\"',
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\v": "\\v",
      "\0": "\\0",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    let y = "";
    for (let _ = 0; _ < f.length; _++) {
      const I = f[_];
      switch (I) {
        case "'":
        case '"':
          k[I]++, y += I;
          continue;
        case "\0":
          if (util.isDigit(f[_ + 1])) {
            y += "\\x00";
            continue;
          }
      }
      if (F[I]) {
        y += F[I];
        continue;
      }
      if (I < " ") {
        let i = I.charCodeAt(0).toString(16);
        y += "\\x" + ("00" + i).substring(i.length);
        continue;
      }
      y += I;
    }
    const S = m || Object.keys(k).reduce((_, I) => k[_] < k[I] ? _ : I);
    return y = y.replace(new RegExp(S, "g"), F[S]), S + y + S;
  }
  function C(f) {
    if (r.indexOf(f) >= 0)
      throw TypeError("Converting circular structure to JSON5");
    r.push(f);
    let k = u;
    u = u + p;
    let F = s || Object.keys(f), y = [];
    for (const _ of F) {
      const I = b(_, f);
      if (I !== void 0) {
        let i = E(_) + ":";
        p !== "" && (i += " "), i += I, y.push(i);
      }
    }
    let S;
    if (y.length === 0)
      S = "{}";
    else {
      let _;
      if (p === "")
        _ = y.join(","), S = "{" + _ + "}";
      else {
        let I = `,
` + u;
        _ = y.join(I), S = `{
` + u + _ + `,
` + k + "}";
      }
    }
    return r.pop(), u = k, S;
  }
  function E(f) {
    if (f.length === 0)
      return o(f);
    const k = String.fromCodePoint(f.codePointAt(0));
    if (!util.isIdStartChar(k))
      return o(f);
    for (let F = k.length; F < f.length; F++)
      if (!util.isIdContinueChar(String.fromCodePoint(f.codePointAt(F))))
        return o(f);
    return f;
  }
  function w(f) {
    if (r.indexOf(f) >= 0)
      throw TypeError("Converting circular structure to JSON5");
    r.push(f);
    let k = u;
    u = u + p;
    let F = [];
    for (let S = 0; S < f.length; S++) {
      const _ = b(String(S), f);
      F.push(_ !== void 0 ? _ : "null");
    }
    let y;
    if (F.length === 0)
      y = "[]";
    else if (p === "")
      y = "[" + F.join(",") + "]";
    else {
      let S = `,
` + u, _ = F.join(S);
      y = `[
` + u + _ + `,
` + k + "]";
    }
    return r.pop(), u = k, y;
  }
};
const JSON5 = {
  parse,
  stringify
};
var lib = JSON5;
class AjaxService {
  constructor(e) {
    this.logger = e;
  }
  logger;
  async request(e, t = {}) {
    if (!e)
      throw new Error("URL is required");
    const {
      method: n = "GET",
      body: r = null,
      headers: u = {},
      params: s = null,
      timeout: l = 3e4,
      ...p
    } = t;
    let m = e;
    if (n.toUpperCase() === "GET" && s) {
      const C = new URLSearchParams(s);
      m += (e.includes("?") ? "&" : "?") + C.toString();
    }
    const b = new AbortController(), o = setTimeout(() => b.abort(), l);
    try {
      let C = null;
      if (n.toUpperCase() !== "GET" && r) {
        if (r instanceof FormData || typeof r == "string")
          C = r;
        else if (typeof r == "object") {
          const F = new URLSearchParams();
          Object.entries(r).forEach(([y, S]) => {
            S != null && F.append(y, String(S));
          }), C = F;
        }
      }
      const E = new Request(m, {
        ...p,
        method: n,
        body: C,
        signal: b.signal
      });
      E.headers.set("X-Requested-With", "XMLHttpRequest"), Object.entries(u).forEach(([F, y]) => {
        E.headers.set(F, y);
      });
      const w = await fetch(E);
      if (clearTimeout(o), !w.ok)
        throw new Error(`HTTP ${w.status}`);
      if (w.headers.get("content-type")?.includes("application/json")) {
        const F = await w.json();
        return this.logger?.info(`AJAX Success (JSON): ${n} ${m}`, "AjaxService"), F;
      }
      const k = await w.text();
      return this.logger?.info(`AJAX Success (Text): ${n} ${m}`, lib.stringify({ status: w.status, responseLength: k.length })), k;
    } catch (C) {
      throw clearTimeout(o), C instanceof Error && C.name === "AbortError" ? (this.logger?.error(`AJAX Timeout: ${n} ${m}`), new Error(`Request timeout after ${l}ms`)) : (this.logger?.error(`AJAX Error: ${n} ${m}`), C);
    }
  }
  async get(e, t = {}) {
    return this.request(e, {
      ...t,
      method: "GET"
    });
  }
  async post(e, t, n = {}) {
    return this.request(e, {
      ...n,
      method: "POST",
      body: t
    });
  }
}
class Utils {
  atou(e) {
    return decodeURIComponent(
      atob(e).split("").map((t) => "%" + t.codePointAt(0).toString(16).padStart(2, "0")).join("")
    );
  }
  utoa(e) {
    return btoa(
      encodeURIComponent(e).replace(
        /%([0-9A-F]{2})/gi,
        (t, n) => String.fromCharCode(parseInt(n, 16))
      )
    );
  }
}
var objectToString = Object.prototype.toString, isArray = Array.isArray || function(e) {
  return objectToString.call(e) === "[object Array]";
};
function isFunction$1(a) {
  return typeof a == "function";
}
function typeStr(a) {
  return isArray(a) ? "array" : typeof a;
}
function escapeRegExp(a) {
  return a.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}
function hasProperty(a, e) {
  return a != null && typeof a == "object" && e in a;
}
function primitiveHasOwnProperty(a, e) {
  return a != null && typeof a != "object" && a.hasOwnProperty && a.hasOwnProperty(e);
}
var regExpTest = RegExp.prototype.test;
function testRegExp(a, e) {
  return regExpTest.call(a, e);
}
var nonSpaceRe = /\S/;
function isWhitespace(a) {
  return !testRegExp(nonSpaceRe, a);
}
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;"
};
function escapeHtml(a) {
  return String(a).replace(/[&<>"'`=\/]/g, function(t) {
    return entityMap[t];
  });
}
var whiteRe = /\s*/, spaceRe = /\s+/, equalsRe = /\s*=/, curlyRe = /\s*\}/, tagRe = /#|\^|\/|>|\{|&|=|!/;
function parseTemplate(a, e) {
  if (!a)
    return [];
  var t = !1, n = [], r = [], u = [], s = !1, l = !1, p = "", m = 0;
  function b() {
    if (s && !l)
      for (; u.length; )
        delete r[u.pop()];
    else
      u = [];
    s = !1, l = !1;
  }
  var o, C, E;
  function w(d) {
    if (typeof d == "string" && (d = d.split(spaceRe, 2)), !isArray(d) || d.length !== 2)
      throw new Error("Invalid tags: " + d);
    o = new RegExp(escapeRegExp(d[0]) + "\\s*"), C = new RegExp("\\s*" + escapeRegExp(d[1])), E = new RegExp("\\s*" + escapeRegExp("}" + d[1]));
  }
  w(e || mustache.tags);
  for (var f = new Scanner(a), k, F, y, S, _, I; !f.eos(); ) {
    if (k = f.pos, y = f.scanUntil(o), y)
      for (var i = 0, h = y.length; i < h; ++i)
        S = y.charAt(i), isWhitespace(S) ? (u.push(r.length), p += S) : (l = !0, t = !0, p += " "), r.push(["text", S, k, k + 1]), k += 1, S === `
` && (b(), p = "", m = 0, t = !1);
    if (!f.scan(o))
      break;
    if (s = !0, F = f.scan(tagRe) || "name", f.scan(whiteRe), F === "=" ? (y = f.scanUntil(equalsRe), f.scan(equalsRe), f.scanUntil(C)) : F === "{" ? (y = f.scanUntil(E), f.scan(curlyRe), f.scanUntil(C), F = "&") : y = f.scanUntil(C), !f.scan(C))
      throw new Error("Unclosed tag at " + f.pos);
    if (F == ">" ? _ = [F, y, k, f.pos, p, m, t] : _ = [F, y, k, f.pos], m++, r.push(_), F === "#" || F === "^")
      n.push(_);
    else if (F === "/") {
      if (I = n.pop(), !I)
        throw new Error('Unopened section "' + y + '" at ' + k);
      if (I[1] !== y)
        throw new Error('Unclosed section "' + I[1] + '" at ' + k);
    } else F === "name" || F === "{" || F === "&" ? l = !0 : F === "=" && w(y);
  }
  if (b(), I = n.pop(), I)
    throw new Error('Unclosed section "' + I[1] + '" at ' + f.pos);
  return nestTokens(squashTokens(r));
}
function squashTokens(a) {
  for (var e = [], t, n, r = 0, u = a.length; r < u; ++r)
    t = a[r], t && (t[0] === "text" && n && n[0] === "text" ? (n[1] += t[1], n[3] = t[3]) : (e.push(t), n = t));
  return e;
}
function nestTokens(a) {
  for (var e = [], t = e, n = [], r, u, s = 0, l = a.length; s < l; ++s)
    switch (r = a[s], r[0]) {
      case "#":
      case "^":
        t.push(r), n.push(r), t = r[4] = [];
        break;
      case "/":
        u = n.pop(), u[5] = r[2], t = n.length > 0 ? n[n.length - 1][4] : e;
        break;
      default:
        t.push(r);
    }
  return e;
}
function Scanner(a) {
  this.string = a, this.tail = a, this.pos = 0;
}
Scanner.prototype.eos = function() {
  return this.tail === "";
};
Scanner.prototype.scan = function(e) {
  var t = this.tail.match(e);
  if (!t || t.index !== 0)
    return "";
  var n = t[0];
  return this.tail = this.tail.substring(n.length), this.pos += n.length, n;
};
Scanner.prototype.scanUntil = function(e) {
  var t = this.tail.search(e), n;
  switch (t) {
    case -1:
      n = this.tail, this.tail = "";
      break;
    case 0:
      n = "";
      break;
    default:
      n = this.tail.substring(0, t), this.tail = this.tail.substring(t);
  }
  return this.pos += n.length, n;
};
function Context(a, e) {
  this.view = a, this.cache = { ".": this.view }, this.parent = e;
}
Context.prototype.push = function(e) {
  return new Context(e, this);
};
Context.prototype.lookup = function(e) {
  var t = this.cache, n;
  if (t.hasOwnProperty(e))
    n = t[e];
  else {
    for (var r = this, u, s, l, p = !1; r; ) {
      if (e.indexOf(".") > 0)
        for (u = r.view, s = e.split("."), l = 0; u != null && l < s.length; )
          l === s.length - 1 && (p = hasProperty(u, s[l]) || primitiveHasOwnProperty(u, s[l])), u = u[s[l++]];
      else
        u = r.view[e], p = hasProperty(r.view, e);
      if (p) {
        n = u;
        break;
      }
      r = r.parent;
    }
    t[e] = n;
  }
  return isFunction$1(n) && (n = n.call(this.view)), n;
};
function Writer() {
  this.templateCache = {
    _cache: {},
    set: function(e, t) {
      this._cache[e] = t;
    },
    get: function(e) {
      return this._cache[e];
    },
    clear: function() {
      this._cache = {};
    }
  };
}
Writer.prototype.clearCache = function() {
  typeof this.templateCache < "u" && this.templateCache.clear();
};
Writer.prototype.parse = function(e, t) {
  var n = this.templateCache, r = e + ":" + (t || mustache.tags).join(":"), u = typeof n < "u", s = u ? n.get(r) : void 0;
  return s == null && (s = parseTemplate(e, t), u && n.set(r, s)), s;
};
Writer.prototype.render = function(e, t, n, r) {
  var u = this.getConfigTags(r), s = this.parse(e, u), l = t instanceof Context ? t : new Context(t, void 0);
  return this.renderTokens(s, l, n, e, r);
};
Writer.prototype.renderTokens = function(e, t, n, r, u) {
  for (var s = "", l, p, m, b = 0, o = e.length; b < o; ++b)
    m = void 0, l = e[b], p = l[0], p === "#" ? m = this.renderSection(l, t, n, r, u) : p === "^" ? m = this.renderInverted(l, t, n, r, u) : p === ">" ? m = this.renderPartial(l, t, n, u) : p === "&" ? m = this.unescapedValue(l, t) : p === "name" ? m = this.escapedValue(l, t, u) : p === "text" && (m = this.rawValue(l)), m !== void 0 && (s += m);
  return s;
};
Writer.prototype.renderSection = function(e, t, n, r, u) {
  var s = this, l = "", p = t.lookup(e[1]);
  function m(C) {
    return s.render(C, t, n, u);
  }
  if (p) {
    if (isArray(p))
      for (var b = 0, o = p.length; b < o; ++b)
        l += this.renderTokens(e[4], t.push(p[b]), n, r, u);
    else if (typeof p == "object" || typeof p == "string" || typeof p == "number")
      l += this.renderTokens(e[4], t.push(p), n, r, u);
    else if (isFunction$1(p)) {
      if (typeof r != "string")
        throw new Error("Cannot use higher-order sections without the original template");
      p = p.call(t.view, r.slice(e[3], e[5]), m), p != null && (l += p);
    } else
      l += this.renderTokens(e[4], t, n, r, u);
    return l;
  }
};
Writer.prototype.renderInverted = function(e, t, n, r, u) {
  var s = t.lookup(e[1]);
  if (!s || isArray(s) && s.length === 0)
    return this.renderTokens(e[4], t, n, r, u);
};
Writer.prototype.indentPartial = function(e, t, n) {
  for (var r = t.replace(/[^ \t]/g, ""), u = e.split(`
`), s = 0; s < u.length; s++)
    u[s].length && (s > 0 || !n) && (u[s] = r + u[s]);
  return u.join(`
`);
};
Writer.prototype.renderPartial = function(e, t, n, r) {
  if (n) {
    var u = this.getConfigTags(r), s = isFunction$1(n) ? n(e[1]) : n[e[1]];
    if (s != null) {
      var l = e[6], p = e[5], m = e[4], b = s;
      p == 0 && m && (b = this.indentPartial(s, m, l));
      var o = this.parse(b, u);
      return this.renderTokens(o, t, n, b, r);
    }
  }
};
Writer.prototype.unescapedValue = function(e, t) {
  var n = t.lookup(e[1]);
  if (n != null)
    return n;
};
Writer.prototype.escapedValue = function(e, t, n) {
  var r = this.getConfigEscape(n) || mustache.escape, u = t.lookup(e[1]);
  if (u != null)
    return typeof u == "number" && r === mustache.escape ? String(u) : r(u);
};
Writer.prototype.rawValue = function(e) {
  return e[1];
};
Writer.prototype.getConfigTags = function(e) {
  return isArray(e) ? e : e && typeof e == "object" ? e.tags : void 0;
};
Writer.prototype.getConfigEscape = function(e) {
  if (e && typeof e == "object" && !isArray(e))
    return e.escape;
};
var mustache = {
  name: "mustache.js",
  version: "4.2.0",
  tags: ["{{", "}}"],
  clearCache: void 0,
  escape: void 0,
  parse: void 0,
  render: void 0,
  Scanner: void 0,
  Context: void 0,
  Writer: void 0,
  /**
   * Allows a user to override the default caching strategy, by providing an
   * object with set, get and clear methods. This can also be used to disable
   * the cache by setting it to the literal `undefined`.
   */
  set templateCache(a) {
    defaultWriter.templateCache = a;
  },
  /**
   * Gets the default or overridden caching object from the default writer.
   */
  get templateCache() {
    return defaultWriter.templateCache;
  }
}, defaultWriter = new Writer();
mustache.clearCache = function() {
  return defaultWriter.clearCache();
};
mustache.parse = function(e, t) {
  return defaultWriter.parse(e, t);
};
mustache.render = function(e, t, n, r) {
  if (typeof e != "string")
    throw new TypeError('Invalid template! Template should be a "string" but "' + typeStr(e) + '" was given as the first argument for mustache#render(template, view, partials)');
  return defaultWriter.render(e, t, n, r);
};
mustache.escape = escapeHtml;
mustache.Scanner = Scanner;
mustache.Context = Context;
mustache.Writer = Writer;
var commonjsGlobal = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, json2html$2 = {}, hasRequiredJson2html;
function requireJson2html() {
  return hasRequiredJson2html || (hasRequiredJson2html = 1, (function() {
    let a = typeof self == "object" && self.self === self && self || typeof commonjsGlobal == "object" && commonjsGlobal.global === commonjsGlobal && commonjsGlobal || this || {}, e = {}, t = {};
    const n = {
      tokenization: {
        //Regex for tokenization
        regex: /\${([\w\-\.\,\$\@\s]+)}/
      }
    };
    function r(i) {
      this.type = "iHTML", this.html = i || "", this.events = {}, this.triggers = {};
    }
    r.prototype.append = function(i) {
      return i && i.type === "iHTML" && (this.html += i.html, Object.assign(this.events, i.events), Object.assign(this.triggers, i.triggers)), this;
    }, r.prototype.appendHTML = function(i) {
      this.html += i;
    }, r.prototype.toJSON = function() {
      return {
        html: this.html,
        events: this.events,
        triggers: this.triggers
      };
    }, Object.seal(r);
    function u(i, h) {
      if (!(this instanceof u))
        return new u(i, onEnd, onFound);
      this.tokenizers = i.splice ? i : [i], h && (this.doBuild = h);
    }
    u.prototype.parse = function(i) {
      this.src = i, this.ended = !1, this.tokens = [];
      do
        this.next();
      while (!this.ended);
      return this.tokens;
    }, u.prototype.build = function(i, h) {
      i && this.tokens.push(
        this.doBuild ? this.doBuild(i, h, this.tkn) : i
      );
    }, u.prototype.next = function() {
      let i = this, h;
      i.findMin(), h = i.src.slice(0, i.min), i.build(h, !1), i.src = i.src.slice(i.min).replace(i.tkn, function(d) {
        return i.build(d, !0), "";
      }), i.src || (i.ended = !0);
    }, u.prototype.findMin = function() {
      let i = this, h = 0, d, g;
      for (i.min = -1, i.tkn = ""; (d = i.tokenizers[h++]) !== void 0; )
        g = i.src[d.test ? "search" : "indexOf"](d), g != -1 && (i.min == -1 || g < i.min) && (i.tkn = d, i.min = g);
      i.min == -1 && (i.min = i.src.length);
    }, a.json2html || (a.json2html = /* @__PURE__ */ Object.create(null)), a.json2html.version = "3.3.3", a.json2html.render = function(i, h, d) {
      let g = i;
      if (typeof i == "string")
        try {
          g = JSON.parse(i);
        } catch {
          g = i;
        }
      return i = g, d || (d = {}), d.output || (d.output = "html"), f(h) !== "object" || f(i) !== "object" ? d.output === "ihtml" ? new r("") : "" : (d.props || (d.props = {}), d.output === "ihtml" ? m({
        obj: i,
        props: d.props,
        template: h,
        options: d
      }) : m({
        obj: i,
        props: d.props,
        template: h,
        options: d
      }).html);
    }, a.json2html.component = /* @__PURE__ */ Object.create(null), a.json2html.component.add = function(i, h) {
      switch (f(i, !0)) {
        //Multiple components
        case "object":
          e = Object.assign(e, i);
          break;
        //One component
        case "string":
          e[i] = h;
          break;
      }
    }, a.json2html.component.get = function(i) {
      return e[i];
    }, a.json2html.refresh = function(i, h) {
      if (!i) return;
      let d = t[i];
      if (!d) return;
      let g = [];
      for (let A = 0; A < d.length; A++) {
        let v = d[A], T = v.obj;
        h && (T = h), g.push({
          index: A,
          obj: T,
          trigger: v
        });
      }
      for (let A = 0; A < g.length; A++) {
        let v = g[A];
        document.contains(v.trigger.ele) ? v.trigger.ele.json2html(v.obj, v.trigger.template, { method: "replace", props: v.trigger.props }) : d.splice(v.trigger.index, 1);
      }
      t[i] = d;
    }, a.json2html.trigger = a.json2html.refresh, a.json2html.toText = function(i) {
      return i == null ? "" : i.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/\'/g, "&#39;").replace(/\//g, "&#x2F;");
    }, a.json2html.hydrate = function(i, h, d) {
      let g = i;
      Array.isArray(i) || (g = [i]);
      for (let A = 0; A < g.length; A++) {
        let v = g[A], T = l(v, h);
        for (let L = 0; L < T.length; L++)
          s(T[L], "j2h-ready");
        d && p(v, d);
      }
      return this;
    }, typeof window == "object" && typeof Element == "function" && (Element.prototype.json2html = function(i, h, d) {
      d || (d = {}), d.output = "ihtml";
      let g = json2html.render(i, h, d), A = document.createElement(this.tagName);
      A.innerHTML = g.html;
      let v = this;
      switch (d.method) {
        //Replace
        case "replace":
          v = Array.from(A.childNodes), this.replaceWith(...A.childNodes);
          break;
        //Prepend
        case "prepend":
          this.prepend(...A.childNodes);
          break;
        //Default to append
        default:
          this.append(...A.childNodes);
          break;
      }
      return json2html.hydrate(v, g.events, g.triggers), this;
    }), typeof window == "object" && window.jQuery && (function(i) {
      i.fn.json2html = function(h, d, g) {
        return g || (g = {}), g.output = "ihtml", i(this).each(function() {
          let A = json2html.render(h, d, g), v = i(this);
          switch (g.method) {
            //Replace
            case "replace":
              let T = i("<" + v[0].tagName + ">");
              T.html(A.html), v = T.children(), i.fn.replaceWith.call(i(this), v);
              break;
            //Prepend
            case "prepend":
              i.fn.prepend.call(i(this), A.html);
              break;
            //Default to append
            default:
              i.fn.append.call(i(this), A.html);
              break;
          }
          v.j2hHydrate(A.events, A.triggers);
        });
      }, i.fn.j2hHydrate = function(h, d) {
        return i(this).each(function() {
          json2html.hydrate(this, h, d);
        });
      };
    })(window.jQuery);
    function s(i, h, d) {
      let g;
      document.createEvent ? (g = document.createEvent("HTMLEvents"), g.initEvent(h, !0, !0), g.eventName = h, i.dispatchEvent(g)) : (g = document.createEventObject(), g.eventName = h, g.eventType = h, i.fireEvent("on" + g.eventType, g));
    }
    function l(i, h) {
      let d = [], g = Array.from(i.querySelectorAll("[-j2h-e]"));
      i.getAttribute("-j2h-e") && g.push(i);
      for (let A = 0; A < g.length; A++) {
        let v = g[A], T = v.getAttribute("-j2h-e");
        if (v.removeAttribute("-j2h-e"), T) {
          let L = T.split(" ");
          for (let j = 0; j < L.length; j++)
            ((R) => {
              R && (R.type === "ready" && (d.push(v), R.type = "j2h-ready"), v.addEventListener(R.type, function(H) {
                R.type === "j2h-ready" && H.stopPropagation(), R.data.event = H, f(R.action) === "function" && R.action.call(this, R.data);
              }));
            })(h[L[j]]);
        }
      }
      return d;
    }
    function p(i, h) {
      let d = Array.from(i.querySelectorAll("[-j2h-t]"));
      i.getAttribute("-j2h-t") && d.push(i);
      for (let g = 0; g < d.length; g++) {
        let A = d[g], v = A.getAttribute("-j2h-t");
        if (!v) return;
        let T = v.split(" ");
        for (let L = 0; L < T.length; L++) {
          let j = h[T[L]];
          j && (j.ele = A, t[j.name] || (t[j.name] = []), t[j.name].push(j));
        }
        A.removeAttribute("-j2h-t");
      }
    }
    function m(i) {
      let h = new r();
      switch (f(i.obj, !0)) {
        case "array":
          let d = i.obj.length;
          for (let g = 0; g < d; ++g)
            h.append(b({ ...i, obj: i.obj[g], index: g }));
          break;
        //Don't render for undefined or null objects
        case "undefined":
        case "null":
          break;
        //Make sure to allow for literals as well
        default:
          h.append(b(i));
          break;
      }
      return h;
    }
    function b(i) {
      let h = new r();
      switch (f(i.template, !0)) {
        //Array of templates
        case "array":
          let d = i.template.length;
          for (let v = 0; v < d; ++v)
            h.append(b({ ...i, template: i.template[v], parent: void 0 }));
          break;
        //single template & single object
        case "object":
          let g = i.template["{}"], A;
          switch (f(g)) {
            case "function":
              A = g;
            case "object":
              if (!i.parent) {
                A && (g = A.call(i.obj, i.obj, i.index, i.props)), h.append(m({ ...i, obj: g, parent: i.obj }));
                break;
              }
            default:
              i.template["[]"] ? h.append(I(i)) : h.append(_(i));
              break;
          }
          break;
      }
      return h;
    }
    function o(i, h, d) {
      let g = "", A = h.template[i];
      switch (f(A)) {
        //Get the value from the function
        case "function":
          switch (f(h.obj)) {
            //If this is a json object or array then get the component that we want
            case "object":
              return A.call(h.obj, h.obj, h.index, h.props);
            //NOT SUPPORTED
            case "function":
            case "undefined":
            case "null":
              return "";
            //BOOLEAN, NUMBER, BIGINT, STRING, SYMBOL
            default:
              let v = { value: h.obj, index: h.index, props: h.props };
              return A.call(v, v, h.index, h.props);
          }
          break;
        //Check for short hand ${..} (state) and ${%...} (props)
        case "string":
          g = S(A, (v, T) => C(T, h));
          break;
        //Spit out blank
        case "null":
        case "undefined":
          g = "";
          break;
        //Check for objects and arrays
        case "object":
          d ? g = A : g = "";
          break;
        //Arrays, and other literals
        default:
          g = A.toString();
          break;
      }
      return g;
    }
    function C(i, h) {
      let d = h.obj;
      switch (i.indexOf("@") === 0 && (d = h.props, i = i.slice(1)), f(d)) {
        //If this is an json object then get the value we're looking for
        // properties will always be an object
        case "object":
          return E(i, d);
        //NOT SUPPORTED
        case "function":
        case "undefined":
        case "null":
          return "";
        //For literal arrays (and single objects) of type
        //BOOLEAN, NUMBER, BIGINT, STRING, SYMBOL
        default:
          switch (i) {
            //RESERVED word for literal array value
            case "value":
              return d;
            //RESERVED word for literal array value index
            case "index":
              return h.index === void 0 || h.index === null ? "" : h.index;
          }
          break;
      }
    }
    function E(i, h) {
      let d = i.split("."), g = h, A = d.length;
      for (let v = 0; v < A && !(d[v].length > 0 && (g = g[d[v]], g == null)); ++v)
        ;
      return g ?? "";
    }
    function w(i, h, d) {
      h.split && (h = h.split("."));
      for (var g = 0, A = h.length, v = i, T, L; g < A && (L = h[g++], !(L === "__proto__" || L === "constructor" || L === "prototype")); )
        v = v[L] = g === A ? d : typeof (T = v[L]) == typeof h ? T : h[g] * 0 !== 0 || ~("" + h[g]).indexOf(".") ? {} : [];
    }
    function f(i, h) {
      const d = typeof i;
      if (d === "object") {
        if (i === null) return "null";
        if (h && Array.isArray(i))
          return "array";
      }
      return d;
    }
    function k() {
      return F() + F();
    }
    function F() {
      return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1);
    }
    function y(i) {
      switch (i) {
        //Allow these void elements
        case "area":
        case "base":
        case "br":
        case "col":
        case "command":
        case "embed":
        case "hr":
        case "img":
        case "input":
        case "keygen":
        case "link":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
          return !0;
        //Otherwise we're not void
        default:
          return !1;
      }
    }
    function S(i, h) {
      return new u([
        n.tokenization.regex
      ], (g, A, v) => A ? g.replace(v, h) : g).parse(i).join("");
    }
    function _(i) {
      let h = new r(), d = new r(), g = "<>", A = [], v = [];
      for (let T in i.template)
        switch (T) {
          //HTML element
          case "<>":
            h.name = o(g, { ...i, obj: i.parent || i.obj }), h.appendHTML("<" + h.name);
            break;
          //Object we want to render
          case "{}":
            break;
          //Assign
          case ">>":
            let L = {
              obj: i.obj,
              props: i.props,
              index: i.index,
              //Unique for assign
              var: i.template[T]
            }, j = k();
            switch (i.template["<>"]) {
              //Partial Support
              case "input":
                switch (i.template.type) {
                  //These types of inputs aren't supported
                  case "button":
                  case "submit":
                  case "reset":
                  case "image":
                  case "radio":
                    continue;
                }
                break;
              //Supported
              case "select":
              case "textarea":
                break;
              //All others not supported
              default:
                continue;
            }
            h.events[j] = { type: "change", data: L, action: (P) => {
              let N = P.event.target, $;
              N.type === "checkbox" ? N.checked && ($ = !0) : $ = N.value, w(P.obj, P.var, $);
            } }, A.push(j);
            break;
          //Refresh Id
          case "#":
            let R = k();
            h.triggers[R] = { name: o(T, i), obj: i.obj, props: i.props, template: i.template }, v.push(R);
            break;
          //Encode text
          case "text":
            Array.isArray(i.template[T]) || d.appendHTML(json2html.toText(o(T, i)));
            break;
          //Encode as HTML
          // accepts array of children, functions, string, number, boolean
          case "html":
            switch (f(i.template[T], !0)) {
              case "array":
                d.append(m({ ...i, template: i.template[T], parent: void 0 }));
                break;
              case "function":
                let P = i.template[T].call(i.obj, i.obj, i.index, i.props, i.html);
                switch (f(P, !0)) {
                  //Only returned by json2html.render ()
                  case "object":
                    P.type === "iHTML" && d.append(P);
                    break;
                  //Not supported
                  case "function":
                  case "undefined":
                  case "null":
                    break;
                  //Render the array as a string
                  // append to html
                  case "array":
                    d.appendHTML(P.toString());
                    break;
                  //string, number, boolean, etc..
                  // append to html
                  default:
                    d.appendHTML(P);
                    break;
                }
                break;
              default:
                d.appendHTML(o(T, i));
                break;
            }
            break;
          default:
            let H = !1;
            if (T.length > 2 && T.substring(0, 2).toLowerCase() === "on") {
              if (i.options.output === "ihtml") {
                let P = {
                  obj: i.obj,
                  props: i.props
                };
                switch (f(i.obj)) {
                  //Do nothing for json object
                  case "function":
                  case "undefined":
                  case "null":
                  case "object":
                    break;
                  //BOOLEAN, NUMBER, BIGINT, STRING, SYMBOL
                  default:
                    P.obj = { value: i.obj, index: i.index };
                    break;
                }
                let N = k();
                h.events[N] = { type: T.substring(2), data: P, action: i.template[T] }, A.push(N);
              }
              H = !0;
            }
            if (!H) {
              let P = o(T, i);
              if (P !== void 0) {
                let N;
                typeof P == "string" ? N = '"' + P.replace(/"/g, "&quot;") + '"' : N = P, h.appendHTML(" " + T + "=" + N);
              }
            }
            break;
        }
      return A.length && h.appendHTML(" -j2h-e='" + A.join(" ") + "'"), v.length && h.appendHTML(" -j2h-t='" + v.join(" ") + "'"), h.name ? y(h.name) ? h.appendHTML("/>") : (h.appendHTML(">"), h.append(d), h.appendHTML("</" + h.name + ">")) : h.append(d), h;
    }
    function I(i) {
      let h = new r(), d = {
        template: void 0
      }, g = {}, A;
      for (let v in i.template)
        switch (v) {
          //REQUIRED
          case "[]":
            let T = o(v, { ...i, obj: i.parent || i.obj });
            i.options.components && (d.template = i.options.components[T]), d.template || (d.template = e[T]);
            break;
          //Embed this template within the component
          // if needed
          case "html":
            f(i.template.html) === "object" && (A = m({ ...i, template: i.template.html, parent: void 0 }));
            break;
          //Set the others as properties of this template
          default:
            g[v] = o(v, { ...i, obj: i.parent || i.obj }, !0);
            break;
        }
      return f(d.template) !== "object" || h.append(m({ ...i, template: d.template, props: g, parent: void 0, html: A })), h;
    }
  })()), json2html$2;
}
requireJson2html();
const json2html$1 = globalThis.json2html;
class TemplateManager {
  constructor(a, e, t) {
    this.logger = a, this.ajaxService = e, this.utils = t;
  }
  logger;
  ajaxService;
  utils;
  templates = /* @__PURE__ */ new Map();
  async setBlapyContainerJsonTemplate(a, e, t = !1) {
    this.logger.info("setBlapyContainerJsonTemplate", "template manager"), a.dataset.blapyUpdateRule = "local";
    let n = Array.from(a.children).filter(
      (u) => Object.hasOwn(u.dataset, "blapyContainerTpl")
    ), r = a.innerHTML;
    if (n.length === 0) {
      try {
        const u = document.createElement("div");
        u.innerHTML = r.trim();
        const s = u.firstElementChild;
        s?.tagName === "XMP" && (r = s.innerHTML);
      } catch {
        this.logger.error(
          "htmlTplContent from " + a.id + ` is not html template...?
` + r
        );
      }
      if (r.replaceAll(/(<!--.*?-->)|(<!--[\S\s]+?-->)|(<!--[\S\s]*?$)/g, "").replaceAll(/\s{2,}/g, " ").replaceAll("	", " ").replaceAll(/(\r\n|\n|\r)/g, "").replaceAll(/(\/\*[^*]*\*\/)|(\/\/[^*]*)/g, "").trim() == "") {
        let u = a.dataset.blapyTemplateFile, s = a.dataset.blapyNoblapydata == "1" ? "" : "blapycall=1&blapyaction=loadTpl&blapyobjectid=" + a.getAttribute("id");
        if (u && !this.templates.has(u)) {
          r = await this.ajaxService.get(u, {
            params: s
          }), r = r.replaceAll(/<!--(.*?)-->/gm, "").replaceAll(`

`, `
`).replaceAll("		", "	");
          const l = document.createElement("div");
          l.innerHTML = r.trim(), l.firstElementChild?.tagName.toLowerCase() === "xmp" || (r = '<xmp style="display:none" data-blapy-container-tpl="true">' + r + "</xmp>"), a.innerHTML = r, this.templates.set(u, r), this.initializeJsonBlock(a, e, !1);
        } else u && this.templates.has(u) ? (this.logger.info("The templates use cache memory"), a.innerHTML = this.templates.get(u), this.initializeJsonBlock(a, e, !1)) : this.initializeJsonBlock(a, e, !1);
      } else
        r.replaceAll(/{{(.*?)}}/gm, "").split("script").join("scriptblapy").split("img").join("imgblapy").trim().toLowerCase().startsWith("<xmp") || (r = '<xmp style="display:none" data-blapy-container-tpl="true">' + r + "</xmp>"), a.innerHTML = r, this.initializeJsonBlock(a, e, !1);
    } else t && this.initializeJsonBlock(a, e, !0);
  }
  initializeJsonBlock(a, e, t = !1) {
    if (this.logger.info("initializeJsonBlock", "template manager"), a.dataset.blapyContainerName, a.dataset.blapyTemplateInit, !t && a.dataset.blapyUpdateblockOndisplay && a.dataset.blapyAppear !== "done")
      return;
    let n = a.dataset.blapyTemplateInit;
    if (n) {
      let r = a.dataset.blapyTemplateInitParams;
      r == null ? r = {} : typeof r == "string" && (r = lib.parse(r)), a.dataset.blapyTemplateInitPurejson !== "0" && (r = {
        ...r,
        embeddingBlockId: a.dataset.blapyContainerName
      });
      let s = a.dataset.blapyNoblapydata;
      s ??= "0";
      let l = a.dataset.blapyTemplateInitMethod;
      l ??= "GET", e.myFSM.trigger("postData", {
        aUrl: n,
        params: r,
        method: l,
        noBlapyData: s
      });
    }
    a.id && e.trigger("Blapy_templateReady", { detail: a });
  }
  getObjects(a, e, t) {
    let n = [];
    for (let r in a)
      a.hasOwnProperty(r) && (typeof a[r] == "object" ? n = n.concat(this.getObjects(a[r], e, t)) : r == e && a[r] == t || r == e && t == "" ? n.push(a) : a[r] == t && e == "" && (n.includes(a) || n.push(a)));
    return n;
  }
  async processJsonUpdate(a, e, t, n) {
    try {
      const r = await this.extractAndParseJsonData(
        a,
        t
      ), u = e.dataset.blapyContainerName;
      if (!r) return;
      const s = this.applyDataTransformations(
        r,
        e
      ), l = this.getTemplate(e);
      if (!l) return;
      const p = this.generateHtml(
        s,
        l,
        e
      );
      this.injectFinalHtml(p, e, n, l);
    } catch (r) {
      this.logger.error(
        `Erreur dans processJsonUpdate: ${r instanceof Error ? r.message : String(r)}`,
        "templateManager"
      );
    }
  }
  async extractAndParseJsonData(a, e) {
    this.logger.info("_extractAndParseJsonData", "templateManager");
    let t = a ? this.utils.atou(a.innerHTML) : e.innerHTML;
    t = t.trim().replaceAll(/(\r\n|\n|\r)/g, "");
    try {
      const n = lib.parse(t);
      return this.extractBlapyData(n, e);
    } catch {
      this.logger.warn("Premier parsing échoué, tentative d'extraction HTML", "templateManager");
      try {
        const n = document.createElement("div");
        n.innerHTML = t, t = n.firstElementChild?.innerHTML ?? t;
        const r = t.replaceAll(/(\r\n|\n|\r)/g, ""), u = lib.parse(r);
        return this.extractBlapyData(u, e);
      } catch {
        throw this.logger.error("Parsing impossible même après extraction HTML" + t, "templateManager"), new Error("Parsing JSON impossible");
      }
    }
  }
  extractBlapyData(a, e = null) {
    if (this.logger.info("_extractBlapyData", "templateManager"), a["blapy-data"] && a["blapy-container-name"]) {
      const t = e?.getAttribute?.("data-blapy-container-name");
      return t && a["blapy-container-name"] != t ? (this.logger.warn(
        "blapy-data set: " + JSON.stringify(a) + `
 but not match with containerName ` + t
      ), null) : a["blapy-data"];
    }
    return a;
  }
  applyDataTransformations(a, e) {
    this.logger.info("_applyDataTransformations", "templateManager");
    let t = a;
    return t = this.applyInitFromProperty(t, e), t = this.applyInitSearch(t, e), t = this.applyProcessDataFunctions(
      t,
      e
    ), this.addBlapyIndices(t);
  }
  getTemplate(a) {
    let e = a.querySelectorAll(":scope > [data-blapy-container-tpl]"), t = e, n = "", r = a.dataset.blapyTemplateDefaultId;
    if (r != null && r != "") {
      let u = `:scope > [data-blapy-container-tpl][data-blapy-container-tpl-id='${r}']`;
      t = a.querySelectorAll(u), t.length == 0 && this.logger.error(
        "The json template of id " + r + " was not found for the block " + a.dataset.blapyContainerName + "!",
        "templateManager"
      );
    }
    return t.length == 0 && (t = e), t.length == 0 ? (n = "", this.logger.error(
      "can not find any json template for the block: " + a.dataset.blapyContainerName,
      "templateManager"
    ), null) : (n = t[0].innerHTML, n.length < 3 ? (this.logger.error(
      "Template is void... ? " + a.dataset.blapyContainerName,
      "templateManager"
    ), null) : {
      content: n,
      allTemplates: e
    });
  }
  generateHtml(a, e, t) {
    let n = this.prepareTemplateContent(e.content), r = "", u = !1;
    if (!a)
      return this.logger.warn(
        "jsonDataObj is null... cannot generate html from template and so returning void html",
        "templateManager.generateHtml"
      ), "";
    const s = Object.hasOwn(t.dataset, "blapyTemplateMustacheDelimiterstart") && t.dataset.blapyTemplateMustacheDelimiterstart !== "", l = !s && n.includes("${") && !n.includes("{{");
    if (mustache !== void 0 && !l) {
      let p = "{{", m = "}}", b = "";
      s && (p = t.dataset.blapyTemplateMustacheDelimiterstart ?? "", m = t.dataset.blapyTemplateMustacheDelimiterend ?? "", b = "{{=" + p + " " + m + "=}}"), r = mustache.render(
        b + p + "#." + m + n + p + "/." + m,
        a
      ), u = !0;
    }
    return !u && json2html$1 !== void 0 && (r = json2html$1.render(a, {
      "<>": "void",
      html: n
    }), r = r.replaceAll(/<\/?void>/g, ""), u = !0), u ? r : (this.logger.error(
      "no json parser loaded... need to include json2html or Mustache library! ",
      "templateManager.generateHtml"
    ), alert(
      'no json parser loaded... need to include "json2html" or "Mustache" library!'
    ), "");
  }
  injectFinalHtml(a, e, t, n) {
    let r = a;
    if (Object.hasOwn(e.dataset, "blapyTemplateHeader") && (this.logger.info("Apply data-blapy-template-header"), r = e.dataset.blapyTemplateHeader + r), Object.hasOwn(e.dataset, "blapyTemplateFooter") && (this.logger.info("Apply data-blapy-template-footer"), r = r + e.dataset.blapyTemplateFooter), Object.hasOwn(e.dataset, "blapyTemplateWrap")) {
      this.logger.info("Apply data-blapy-template-wrap");
      const l = e.dataset.blapyTemplateWrap, p = document.createElement("div");
      p.innerHTML = l ?? "";
      const m = p.firstElementChild;
      m && (m.innerHTML = r, r = m.outerHTML);
    }
    let u = "";
    n?.allTemplates && n.allTemplates.forEach((l) => {
      u += l.outerHTML;
    }), e.innerHTML = u + r, e.querySelectorAll("script").forEach((l) => {
      const p = document.createElement("script");
      l.src ? p.src = l.src : p.textContent = l.textContent, l.parentNode?.replaceChild(p, l);
    }), setTimeout(() => {
      const l = e.querySelectorAll('[data-blapy-update="json"]');
      if (l.length > 0) {
        t.myFSM.trigger("blapyJsonTemplatesToSet");
        let p = this;
        (async function() {
          for (const m of l)
            await p.setBlapyContainerJsonTemplate(m, t);
          t.myFSM.trigger("blapyJsonTemplatesIsSet");
        })();
      } else
        t.myFSM.trigger("blapyJsonTemplatesIsSet");
    }, 0);
  }
  applyInitFromProperty(a, e) {
    if (this.logger.info("_applyInitFromProperty", "templateManager"), !Object.hasOwn(e.dataset, "blapyTemplateInitFromproperty") || e.dataset.blapyTemplateInitFromproperty === "")
      return a;
    try {
      this.logger.info(
        "Apply data-blapy-template-init-fromproperty: " + e.dataset.blapyTemplateInitFromproperty
      );
      const t = e.dataset.blapyTemplateInitFromproperty;
      return t ? t.split(".").reduce((r, u) => r[u] === void 0 ? r : r[u], a) : a;
    } catch {
      return this.logger.error(
        "init-search or init-property does not work well on json data of container: " + e.id,
        "templateManager"
      ), a;
    }
  }
  applyInitSearch(a, e) {
    this.logger.info("_applyInitSearch", "templateMnager");
    const t = e.dataset.blapyTemplateInitSearch;
    if (!t || t === "")
      return a;
    try {
      this.logger.info(
        "Apply data-blapy-template-init-search: " + e.dataset.blapyTemplateInitSearch
      );
      let n = JSON.stringify(a);
      return a = t.split(",").map((r) => r.split("==")).reduce((r, u) => {
        const s = this.getObjects(a, u[0], u[1]);
        return s.length ? r.concat(s) : r;
      }, []), a = a.filter((r, u) => u === a.findIndex((s) => JSON.stringify(s) === JSON.stringify(r))), a;
    } catch {
      return this.logger.error(
        "init-search or init-property does not work well on json data of container: " + e.id,
        "templateManager"
      ), a;
    }
  }
  applyProcessDataFunctions(jsonDataObj, myContainer) {
    if (this.logger.info("_applyProcessDataFunctions", "templateManager"), !Object.hasOwn(myContainer.dataset, "blapyTemplateInitProcessdata") || myContainer.dataset.blapyTemplateInitProcessdata === "")
      return jsonDataObj;
    let aJsonDataFunction = myContainer.dataset.blapyTemplateInitProcessdata;
    return aJsonDataFunction && (this.logger.info(
      "Apply data-blapy-template-init-processdata: " + aJsonDataFunction
    ), aJsonDataFunction.split(",").forEach((aFunctionName) => {
      let previousJsonDataObj = lib;
      eval(
        "if (typeof " + aFunctionName + ' === "function")    jsonDataObj=' + aFunctionName + '(jsonDataObj);else     this.logger.error("' + aFunctionName + " does not exist :(! Have a look on the : data-blapy-template-init-processdata of container " + myContainer.id + '", "templateManager");'
      ), typeof jsonDataObj != "object" && (this.logger.error(
        "returned Json Data was not a json structure :(! Perhaps it is due to the processing of this function on them: " + aJsonDataFunction,
        "templateManager"
      ), jsonDataObj = previousJsonDataObj);
    })), jsonDataObj;
  }
  addBlapyIndices(a) {
    if (!a) return a;
    if (a.length)
      for (let e = 0; e < a.length; e++)
        a[e].blapyIndex == null && (a[e].blapyIndex = e + 1), e == 0 && (a[e].blapyFirst = !0), e == a.length - 1 && (a[e].blapyLast = !0);
    else
      a.blapyIndex = 0;
    return a;
  }
  prepareTemplateContent(a) {
    return a.replaceAll(/\|xmp/gi, "xmp").replaceAll(/\|\/xmp/gi, "/xmp").replaceAll(/blapyScriptJS/gi, "script");
  }
}
var PARAMETER_REGEXP = /([:*])(\w+)/g, REPLACE_VARIABLE_REGEXP = "([^/]+)", WILDCARD_REGEXP = /\*/g, REPLACE_WILDCARD = "?(?:.*)", NOT_SURE_REGEXP = /\/\?/g, REPLACE_NOT_SURE = "/?([^/]+|)", START_BY_SLASH_REGEXP = "(?:/^|^)", MATCH_REGEXP_FLAGS = "";
function getCurrentEnvURL(a) {
  return a === void 0 && (a = "/"), windowAvailable() ? location.pathname + location.search + location.hash : a;
}
function clean(a) {
  return a.replace(/\/+$/, "").replace(/^\/+/, "");
}
function isString(a) {
  return typeof a == "string";
}
function isFunction(a) {
  return typeof a == "function";
}
function extractHashFromURL(a) {
  return a && a.indexOf("#") >= 0 && a.split("#").pop() || "";
}
function regExpResultToParams(a, e) {
  return e.length === 0 || !a ? null : a.slice(1, a.length).reduce(function(t, n, r) {
    return t === null && (t = {}), t[e[r]] = decodeURIComponent(n), t;
  }, null);
}
function extractGETParameters(a) {
  var e = clean(a).split(/\?(.*)?$/);
  return [clean(e[0]), e.slice(1).join("")];
}
function parseQuery(a) {
  for (var e = {}, t = a.split("&"), n = 0; n < t.length; n++) {
    var r = t[n].split("=");
    if (r[0] !== "") {
      var u = decodeURIComponent(r[0]);
      e[u] ? (Array.isArray(e[u]) || (e[u] = [e[u]]), e[u].push(decodeURIComponent(r[1] || ""))) : e[u] = decodeURIComponent(r[1] || "");
    }
  }
  return e;
}
function matchRoute(a, e) {
  var t = extractGETParameters(clean(a.currentLocationPath)), n = t[0], r = t[1], u = r === "" ? null : parseQuery(r), s = [], l;
  if (isString(e.path)) {
    if (l = START_BY_SLASH_REGEXP + clean(e.path).replace(PARAMETER_REGEXP, function(o, C, E) {
      return s.push(E), REPLACE_VARIABLE_REGEXP;
    }).replace(WILDCARD_REGEXP, REPLACE_WILDCARD).replace(NOT_SURE_REGEXP, REPLACE_NOT_SURE) + "$", clean(e.path) === "" && clean(n) === "")
      return {
        url: n,
        queryString: r,
        hashString: extractHashFromURL(a.to),
        route: e,
        data: null,
        params: u
      };
  } else
    l = e.path;
  var p = new RegExp(l, MATCH_REGEXP_FLAGS), m = n.match(p);
  if (m) {
    var b = isString(e.path) ? regExpResultToParams(m, s) : m.groups ? m.groups : m.slice(1);
    return {
      url: clean(n.replace(new RegExp("^" + a.instance.root), "")),
      queryString: r,
      hashString: extractHashFromURL(a.to),
      route: e,
      data: b,
      params: u
    };
  }
  return !1;
}
function pushStateAvailable() {
  return !!(typeof window < "u" && window.history && window.history.pushState);
}
function undefinedOrTrue(a, e) {
  return typeof a[e] > "u" || a[e] === !0;
}
function parseNavigateOptions(a) {
  if (!a) return {};
  var e = a.split(","), t = {}, n;
  return e.forEach(function(r) {
    var u = r.split(":").map(function(s) {
      return s.replace(/(^ +| +$)/g, "");
    });
    switch (u[0]) {
      case "historyAPIMethod":
        t.historyAPIMethod = u[1];
        break;
      case "resolveOptionsStrategy":
        n || (n = {}), n.strategy = u[1];
        break;
      case "resolveOptionsHash":
        n || (n = {}), n.hash = u[1] === "true";
        break;
      case "updateBrowserURL":
      case "callHandler":
      case "updateState":
      case "force":
        t[u[0]] = u[1] === "true";
        break;
    }
  }), n && (t.resolveOptions = n), t;
}
function windowAvailable() {
  return typeof window < "u";
}
function accumulateHooks(a, e) {
  return a === void 0 && (a = []), e === void 0 && (e = {}), a.filter(function(t) {
    return t;
  }).forEach(function(t) {
    ["before", "after", "already", "leave"].forEach(function(n) {
      t[n] && (e[n] || (e[n] = []), e[n].push(t[n]));
    });
  }), e;
}
function Q(a, e, t) {
  var n = e || {}, r = 0;
  (function u() {
    if (!a[r]) {
      t && t(n);
      return;
    }
    Array.isArray(a[r]) ? (a.splice.apply(a, [r, 1].concat(a[r][0](n) ? a[r][1] : a[r][2])), u()) : a[r](n, function(s) {
      typeof s > "u" || s === !0 ? (r += 1, u()) : t && t(n);
    });
  })();
}
Q.if = function(a, e, t) {
  return Array.isArray(e) || (e = [e]), Array.isArray(t) || (t = [t]), [a, e, t];
};
function setLocationPath(a, e) {
  typeof a.currentLocationPath > "u" && (a.currentLocationPath = a.to = getCurrentEnvURL(a.instance.root)), a.currentLocationPath = a.instance._checkForAHash(a.currentLocationPath), e();
}
function matchPathToRegisteredRoutes(a, e) {
  for (var t = 0; t < a.instance.routes.length; t++) {
    var n = a.instance.routes[t], r = matchRoute(a, n);
    if (r && (a.matches || (a.matches = []), a.matches.push(r), a.resolveOptions.strategy === "ONE")) {
      e();
      return;
    }
  }
  e();
}
function checkForDeprecationMethods(a, e) {
  a.navigateOptions && (typeof a.navigateOptions.shouldResolve < "u" && console.warn('"shouldResolve" is deprecated. Please check the documentation.'), typeof a.navigateOptions.silent < "u" && console.warn('"silent" is deprecated. Please check the documentation.')), e();
}
function checkForForceOp(a, e) {
  a.navigateOptions.force === !0 ? (a.instance._setCurrent([a.instance._pathToMatchObject(a.to)]), e(!1)) : e();
}
var isWindowAvailable = windowAvailable(), isPushStateAvailable = pushStateAvailable();
function updateBrowserURL(a, e) {
  if (undefinedOrTrue(a.navigateOptions, "updateBrowserURL")) {
    var t = ("/" + a.to).replace(/\/\//g, "/"), n = isWindowAvailable && a.resolveOptions && a.resolveOptions.hash === !0;
    isPushStateAvailable ? (history[a.navigateOptions.historyAPIMethod || "pushState"](a.navigateOptions.stateObj || {}, a.navigateOptions.title || "", n ? "#" + t : t), location && location.hash && (a.instance.__freezeListening = !0, setTimeout(function() {
      if (!n) {
        var r = location.hash;
        location.hash = "", location.hash = r;
      }
      a.instance.__freezeListening = !1;
    }, 1))) : isWindowAvailable && (window.location.href = a.to);
  }
  e();
}
function checkForLeaveHook(a, e) {
  var t = a.instance;
  if (!t.lastResolved()) {
    e();
    return;
  }
  Q(t.lastResolved().map(function(n) {
    return function(r, u) {
      if (!n.route.hooks || !n.route.hooks.leave) {
        u();
        return;
      }
      var s = !1, l = a.instance.matchLocation(n.route.path, a.currentLocationPath, !1);
      if (n.route.path !== "*")
        s = !l;
      else {
        var p = a.matches ? a.matches.find(function(m) {
          return n.route.path === m.route.path;
        }) : !1;
        s = !p;
      }
      if (undefinedOrTrue(a.navigateOptions, "callHooks") && s) {
        Q(n.route.hooks.leave.map(function(m) {
          return function(b, o) {
            return m(function(C) {
              C === !1 ? a.instance.__markAsClean(a) : o();
            }, a.matches && a.matches.length > 0 ? a.matches.length === 1 ? a.matches[0] : a.matches : void 0);
          };
        }).concat([function() {
          return u();
        }]));
        return;
      } else
        u();
    };
  }), {}, function() {
    return e();
  });
}
function checkForBeforeHook(a, e) {
  a.match.route.hooks && a.match.route.hooks.before && undefinedOrTrue(a.navigateOptions, "callHooks") ? Q(a.match.route.hooks.before.map(function(t) {
    return function(r, u) {
      return t(function(s) {
        s === !1 ? a.instance.__markAsClean(a) : u();
      }, a.match);
    };
  }).concat([function() {
    return e();
  }])) : e();
}
function callHandler(a, e) {
  undefinedOrTrue(a.navigateOptions, "callHandler") && a.match.route.handler(a.match), a.instance.updatePageLinks(), e();
}
function checkForAfterHook(a, e) {
  a.match.route.hooks && a.match.route.hooks.after && undefinedOrTrue(a.navigateOptions, "callHooks") && a.match.route.hooks.after.forEach(function(t) {
    return t(a.match);
  }), e();
}
function checkForAlreadyHook(a, e) {
  var t = a.instance.lastResolved();
  if (t && t[0] && t[0].route === a.match.route && t[0].url === a.match.url && t[0].queryString === a.match.queryString) {
    t.forEach(function(n) {
      n.route.hooks && n.route.hooks.already && undefinedOrTrue(a.navigateOptions, "callHooks") && n.route.hooks.already.forEach(function(r) {
        return r(a.match);
      });
    }), e(!1);
    return;
  }
  e();
}
function checkForNotFoundHandler(a, e) {
  var t = a.instance._notFoundRoute;
  if (t) {
    a.notFoundHandled = !0;
    var n = extractGETParameters(a.currentLocationPath), r = n[0], u = n[1], s = extractHashFromURL(a.to);
    t.path = clean(r);
    var l = {
      url: t.path,
      queryString: u,
      hashString: s,
      data: null,
      route: t,
      params: u !== "" ? parseQuery(u) : null
    };
    a.matches = [l], a.match = l;
  }
  e();
}
function errorOut(a, e) {
  (!a.resolveOptions || a.resolveOptions.noMatchWarning === !1 || typeof a.resolveOptions.noMatchWarning > "u") && console.warn('Navigo: "' + a.currentLocationPath + `" didn't match any of the registered routes.`), e();
}
function flushCurrent(a, e) {
  a.instance._setCurrent(null), e();
}
function updateState(a, e) {
  undefinedOrTrue(a.navigateOptions, "updateState") && a.instance._setCurrent(a.matches), e();
}
var foundLifecycle = [checkForAlreadyHook, checkForBeforeHook, callHandler, checkForAfterHook], notFoundLifeCycle = [checkForLeaveHook, checkForNotFoundHandler, Q.if(function(a) {
  var e = a.notFoundHandled;
  return e;
}, foundLifecycle.concat([updateState]), [errorOut, flushCurrent])];
function _extends$1() {
  return _extends$1 = Object.assign || function(a) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (a[n] = t[n]);
    }
    return a;
  }, _extends$1.apply(this, arguments);
}
function processMatches(a, e) {
  var t = 0;
  function n() {
    if (t === a.matches.length) {
      updateState(a, e);
      return;
    }
    Q(foundLifecycle, _extends$1({}, a, {
      match: a.matches[t]
    }), function() {
      t += 1, n();
    });
  }
  checkForLeaveHook(a, n);
}
function waitingList(a) {
  a.instance.__markAsClean(a);
}
function _extends() {
  return _extends = Object.assign || function(a) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var n in t)
        Object.prototype.hasOwnProperty.call(t, n) && (a[n] = t[n]);
    }
    return a;
  }, _extends.apply(this, arguments);
}
var DEFAULT_LINK_SELECTOR = "[data-navigo]";
function Navigo(a, e) {
  var t = e || {
    strategy: "ONE",
    hash: !1,
    noMatchWarning: !1,
    linksSelector: DEFAULT_LINK_SELECTOR
  }, n = this, r = "/", u = null, s = [], l = !1, p, m = pushStateAvailable(), b = windowAvailable();
  a ? r = clean(a) : console.warn('Navigo requires a root path in its constructor. If not provided will use "/" as default.');
  function o(D) {
    return D.indexOf("#") >= 0 && (t.hash === !0 ? D = D.split("#")[1] || "/" : D = D.split("#")[0]), D;
  }
  function C(D) {
    return clean(r + "/" + clean(D));
  }
  function E(D, B, M, x) {
    return D = isString(D) ? C(D) : D, {
      name: x || clean(String(D)),
      path: D,
      handler: B,
      hooks: accumulateHooks(M)
    };
  }
  function w(D, B, M) {
    var x = this;
    return typeof D == "object" && !(D instanceof RegExp) ? (Object.keys(D).forEach(function(O) {
      if (typeof D[O] == "function")
        x.on(O, D[O]);
      else {
        var U = D[O], J = U.uses, W = U.as, q = U.hooks;
        s.push(E(O, J, [p, q], W));
      }
    }), this) : (typeof D == "function" && (M = B, B = D, D = r), s.push(E(D, B, [p, M])), this);
  }
  function f(D, B) {
    if (n.__dirty) {
      n.__waiting.push(function() {
        return n.resolve(D, B);
      });
      return;
    } else
      n.__dirty = !0;
    D = D ? clean(r) + "/" + clean(D) : void 0;
    var M = {
      instance: n,
      to: D,
      currentLocationPath: D,
      navigateOptions: {},
      resolveOptions: _extends({}, t, B)
    };
    return Q([setLocationPath, matchPathToRegisteredRoutes, Q.if(function(x) {
      var O = x.matches;
      return O && O.length > 0;
    }, processMatches, notFoundLifeCycle)], M, waitingList), M.matches ? M.matches : !1;
  }
  function k(D, B) {
    if (n.__dirty) {
      n.__waiting.push(function() {
        return n.navigate(D, B);
      });
      return;
    } else
      n.__dirty = !0;
    D = clean(r) + "/" + clean(D);
    var M = {
      instance: n,
      to: D,
      navigateOptions: B || {},
      resolveOptions: B && B.resolveOptions ? B.resolveOptions : t,
      currentLocationPath: o(D)
    };
    Q([checkForDeprecationMethods, checkForForceOp, matchPathToRegisteredRoutes, Q.if(function(x) {
      var O = x.matches;
      return O && O.length > 0;
    }, processMatches, notFoundLifeCycle), updateBrowserURL, waitingList], M, waitingList);
  }
  function F(D, B, M) {
    var x = v(D, B);
    return x !== null ? (k(x.replace(new RegExp("^/?" + r), ""), M), !0) : !1;
  }
  function y(D) {
    return this.routes = s = s.filter(function(B) {
      return isString(D) ? clean(B.path) !== clean(D) : isFunction(D) ? D !== B.handler : String(B.path) !== String(D);
    }), this;
  }
  function S() {
    m && (this.__popstateListener = function() {
      n.__freezeListening || f();
    }, window.addEventListener("popstate", this.__popstateListener));
  }
  function _() {
    this.routes = s = [], m && window.removeEventListener("popstate", this.__popstateListener), this.destroyed = l = !0;
  }
  function I(D, B) {
    return n._notFoundRoute = E("*", D, [p, B], "__NOT_FOUND__"), this;
  }
  function i() {
    if (b)
      return h().forEach(function(D) {
        if (D.getAttribute("data-navigo") === "false" || D.getAttribute("target") === "_blank") {
          D.hasListenerAttached && D.removeEventListener("click", D.navigoHandler);
          return;
        }
        D.hasListenerAttached || (D.hasListenerAttached = !0, D.navigoHandler = function(B) {
          if ((B.ctrlKey || B.metaKey) && B.target.tagName.toLowerCase() === "a")
            return !1;
          var M = D.getAttribute("href");
          if (typeof M > "u" || M === null)
            return !1;
          if (M.match(/^(http|https)/) && typeof URL < "u")
            try {
              var x = new URL(M);
              M = x.pathname + x.search;
            } catch {
            }
          var O = parseNavigateOptions(D.getAttribute("data-navigo-options"));
          l || (B.preventDefault(), B.stopPropagation(), n.navigate(clean(M), O));
        }, D.addEventListener("click", D.navigoHandler));
      }), n;
  }
  function h() {
    return b ? [].slice.call(document.querySelectorAll(t.linksSelector || DEFAULT_LINK_SELECTOR)) : [];
  }
  function d(D) {
    return "/" + r + "/" + clean(D);
  }
  function g(D) {
    return p = D, this;
  }
  function A() {
    return u;
  }
  function v(D, B, M) {
    var x = s.find(function(J) {
      return J.name === D;
    }), O = null;
    if (x) {
      if (O = x.path, B)
        for (var U in B)
          O = O.replace(":" + U, B[U]);
      O = O.match(/^\//) ? O : "/" + O;
    }
    return O && M && !M.includeRoot && (O = O.replace(new RegExp("^/" + r), "")), O;
  }
  function T(D) {
    return D.getAttribute("href");
  }
  function L(D) {
    var B = extractGETParameters(clean(D)), M = B[0], x = B[1], O = x === "" ? null : parseQuery(x), U = extractHashFromURL(D), J = E(M, function() {
    }, [p], M);
    return {
      url: M,
      queryString: x,
      hashString: U,
      route: J,
      data: null,
      params: O
    };
  }
  function j() {
    return L(clean(getCurrentEnvURL(r)).replace(new RegExp("^" + r), ""));
  }
  function R(D) {
    var B = {
      instance: n,
      currentLocationPath: D,
      to: D,
      resolveOptions: t
    };
    return matchPathToRegisteredRoutes(B, function() {
    }), B.matches ? B.matches : !1;
  }
  function H(D, B, M) {
    typeof B < "u" && (typeof M > "u" || M) && (B = C(B));
    var x = {
      instance: n,
      to: B,
      currentLocationPath: B
    };
    setLocationPath(x, function() {
    }), typeof D == "string" && (D = typeof M > "u" || M ? C(D) : D);
    var O = matchRoute(x, {
      name: String(D),
      path: D,
      handler: function() {
      },
      hooks: {}
    });
    return O || !1;
  }
  function P(D, B, M) {
    return typeof B == "string" && (B = N(B)), B ? (B.hooks[D] || (B.hooks[D] = []), B.hooks[D].push(M), function() {
      B.hooks[D] = B.hooks[D].filter(function(x) {
        return x !== M;
      });
    }) : (console.warn("Route doesn't exists: " + B), function() {
    });
  }
  function N(D) {
    return typeof D == "string" ? s.find(function(B) {
      return B.name === C(D);
    }) : s.find(function(B) {
      return B.handler === D;
    });
  }
  function $(D) {
    D.instance.__dirty = !1, D.instance.__waiting.length > 0 && D.instance.__waiting.shift()();
  }
  this.root = r, this.routes = s, this.destroyed = l, this.current = u, this.__freezeListening = !1, this.__waiting = [], this.__dirty = !1, this.__markAsClean = $, this.on = w, this.off = y, this.resolve = f, this.navigate = k, this.navigateByName = F, this.destroy = _, this.notFound = I, this.updatePageLinks = i, this.link = d, this.hooks = g, this.extractGETParameters = function(D) {
    return extractGETParameters(o(D));
  }, this.lastResolved = A, this.generate = v, this.getLinkPath = T, this.match = R, this.matchLocation = H, this.getCurrentLocation = j, this.addBeforeHook = P.bind(this, "before"), this.addAfterHook = P.bind(this, "after"), this.addAlreadyHook = P.bind(this, "already"), this.addLeaveHook = P.bind(this, "leave"), this.getRoute = N, this._pathToMatchObject = L, this._clean = clean, this._checkForAHash = o, this._setCurrent = function(D) {
    return u = n.current = D;
  }, S.call(this), i.call(this);
}
class Router {
  constructor(e, t, n = {}) {
    this.logger = e, this.blapy = t, this.opts = {
      enableRouter: !1,
      root: "/",
      hash: !1,
      strategy: "ONE",
      noMatchWarning: !1,
      linksSelector: "[data-blapy-link]",
      ...n
    };
  }
  logger;
  blapy;
  router = null;
  isInitialized = !1;
  opts;
  /** Removes every event listener attached by the router in one call (see destroy). */
  abortController = new AbortController();
  init() {
    return this.logger.info("Router initialization starting...", "router"), this.opts.enableRouter ? typeof Navigo != "function" ? (this.logger.error("Navigo is not loaded... can not continue", "router"), alert("Navigo is not loaded... can not continue"), !1) : (this.initNavigoRouter(), !0) : (this.logger.info("Router disabled, using standard event handlers", "router"), this.initStandardHandlers(), !0);
  }
  navigate(e, t = {}) {
    if (!this.isInitialized || !this.router) {
      this.logger.warn("Router not initialized, cannot navigate", "router");
      return;
    }
    this.logger.info(`Navigating to: ${e}`, "router");
    const n = {
      title: t.title,
      stateObj: t.stateObj,
      historyAPIMethod: t.historyAPIMethod || "pushState",
      updateBrowserURL: t.updateBrowserURL !== !1,
      callHandler: t.callHandler !== !1,
      callHooks: t.callHooks !== !1,
      updateState: t.updateState !== !1,
      force: t.force || !1
    };
    this.router.navigate(e, n);
  }
  initStandardHandlers() {
    this.logger.info(
      "Initializing standard event handlers (no routing)",
      "router"
    );
    const e = this.blapy.container;
    e.addEventListener("click", (t) => {
      const n = t.target.closest("a[data-blapy-link]");
      if (!n) return;
      const r = n.dataset.blapyActiveBlapyid;
      if (r && r !== this.blapy.myUIObjectID)
        return;
      t.preventDefault();
      const u = this.extractLinkParams(n), s = n.dataset.blapyEmbeddingBlockid;
      s && (u.embeddingBlockId = s), this.logger.info(`Standard link clicked: ${n.href}`, "router"), this.blapy.myFSM.trigger("postData", {
        aUrl: this.extractUrl(n.href),
        params: u,
        method: n.getAttribute("method") || "GET",
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: n.dataset.blapyNoblapydata
      });
    }, { signal: this.abortController.signal }), e.addEventListener("submit", (t) => {
      const n = t.target;
      if (!n.matches("form[data-blapy-link]")) return;
      const r = n.dataset.blapyActiveBlapyid;
      if (r && r !== this.blapy.myUIObjectID)
        return;
      t.preventDefault(), this.logger.info(`Form submitted: ${n.action}`, "router");
      const u = this.extractFormData(n, t), s = n.dataset.blapyEmbeddingBlockid;
      s && (u.embeddingBlockId = s), this.blapy.myFSM.trigger("postData", {
        aUrl: this.extractUrl(n.action),
        params: u,
        method: n.getAttribute("method") || "POST",
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: n.dataset.blapyNoblapydata
      });
    }, { signal: this.abortController.signal });
  }
  initNavigoRouter() {
    this.logger.info(
      "Initializing simple router (manual history management)",
      "router"
    ), this.interceptBlapyLinks(), globalThis.addEventListener("popstate", () => {
      this.logger.info("Popstate event detected", "router"), this.blapy.myFSM.trigger("loadUrl", {
        aUrl: globalThis.location.pathname + globalThis.location.search,
        params: {},
        aObjectId: this.blapy.myUIObjectID
      });
    }, { signal: this.abortController.signal }), this.isInitialized = !0, this.logger.info("Simple router initialized", "router");
  }
  extractLinkParams(e) {
    const t = e.dataset.blapyParams;
    if (!t) return {};
    try {
      return lib.parse(t);
    } catch {
      return this.logger.warn(`Failed to parse link params: ${t}`, "router"), {};
    }
  }
  extractFormData(e, t) {
    const n = new FormData(e), r = {};
    for (const [u, s] of n.entries())
      r[u] = s;
    if (t.submitter) {
      const u = t.submitter;
      u.name && (r[u.name] = u.value || "");
    }
    return r;
  }
  interceptBlapyLinks() {
    const e = this.blapy.container;
    console.log(e), e.addEventListener("click", (t) => {
      const n = t.target.closest("a[data-blapy-link]");
      if (!n) return;
      const r = n.getAttribute("href");
      if (!r?.includes("#blapylink")) return;
      console.log(n);
      const u = n.dataset.blapyActiveBlapyid;
      if (u && u !== this.blapy.myUIObjectID) return;
      t.preventDefault();
      const s = this.extractLinkParams(n), l = this.extractEmbeddingBlockId(r);
      l && (s.embeddingBlockId = l);
      const p = this.cleanBlapyUrl(r);
      globalThis.history.pushState({ blapy: !0 }, "", p), this.logger.info(`Navigating to: ${p}`, "router"), this.blapy.myFSM.trigger("loadUrl", {
        aUrl: p,
        params: this.filterAttributes(s),
        aObjectId: this.blapy.myUIObjectID,
        noBlapyData: n.dataset.blapyNoblapydata
      });
    }, { signal: this.abortController.signal });
  }
  extractEmbeddingBlockId(e) {
    const n = /#blapylink#(.*)/i.exec(e);
    return n?.[1] ? n[1] : "";
  }
  cleanBlapyUrl(e) {
    return e.replace(/#blapylink.*$/, "");
  }
  filterAttributes(e) {
    const t = {};
    for (const [n, r] of Object.entries(e))
      typeof r != "function" && typeof r != "object" && (t[n] = r);
    return t;
  }
  extractUrl(e) {
    if (!e) return globalThis.location.href;
    const t = e.indexOf("#");
    return t === -1 ? e : e.substring(0, t);
  }
  /**
   * Tears down the router: removes every event listener it attached (via the
   * AbortController) and destroys the underlying navigo instance if any.
   * Mirrors the old Router.destroy().
   */
  destroy() {
    this.abortController.abort(), this.router?.destroy(), this.isInitialized = !1, this.logger.info("Router destroyed", "router");
  }
}
class BlapyBlock {
  constructor(e) {
    this.logger = e, this.logger.info("BlapyBlocks initialized", "blocks");
  }
  logger;
  blocks = /* @__PURE__ */ new Map();
  intervalsSet = /* @__PURE__ */ new Map();
  blapy;
  setBlapyInstance(e) {
    this.blapy = e;
  }
  initializeBlocks(e) {
    this.logger.info("Initializing Blapy blocks", "blocks"), e.querySelectorAll('[data-blapy-container="true"]').forEach((n) => {
      const r = n.dataset.blapyContainerName;
      r ? (this.blocks.set(r, {
        element: n,
        name: r
      }), this.logger.info(`Block registered: ${r}`, "blocks")) : this.logger.warn("Block without container name found", "blocks");
    });
  }
  setBlapyUpdateIntervals() {
    this.logger.info("Setting up update intervals", "blocks"), this.intervalsSet.forEach((n) => clearInterval(n)), this.intervalsSet.clear();
    const e = this.blapy.myUIObject.querySelectorAll("[data-blapy-updateblock-time]");
    let t = 0;
    e.forEach((n) => {
      const r = Number.parseInt(n.dataset.blapyUpdateblockTime ?? ""), u = n.dataset.blapyHref, s = n.dataset.blapyContainerName, l = n.dataset.blapyNoblapydata;
      if (r && u) {
        this.logger.info(`Setting interval for ${s}: ${r}ms`, "blocks");
        const p = u + "?blapyContainerName=" + s, m = setInterval(() => {
          this.logger.info(`Interval triggered for ${s}`, "blocks"), this.blapy.myFSM.trigger("loadUrl", {
            aUrl: p,
            params: {},
            aObjectId: this.blapy.myUIObjectID,
            noBlapyData: l
          });
        }, r);
        this.intervalsSet.set(t, m), t++, this.logger.info(`✅ Interval set for ${s}: ${r}ms (index: ${t - 1})`, "blocks");
      } else
        r || this.logger.warn(`Block ${s} has no update time`, "blocks"), u || this.logger.warn(`Block ${s} has no href`, "blocks");
    }), this.logger.info(`Total intervals set: ${this.intervalsSet.size}`, "blocks");
  }
  /** Clears all update intervals and the block cache. */
  destroy() {
    this.intervalsSet.forEach((e) => clearInterval(e)), this.intervalsSet.clear(), this.blocks.clear(), this.logger.info("BlapyBlocks destroyed", "blocks");
  }
}
let nbFSM = 0;
const iFSMRegistry = {}, timers = {};
function doTimeout(a, e, t, ...n) {
  cancelTimeout(a), timers[a] = setTimeout(() => {
    delete timers[a], t(...n);
  }, e);
}
function cancelTimeout(a) {
  timers[a] !== void 0 && (clearTimeout(timers[a]), delete timers[a]);
}
function deepClone(a, e = /* @__PURE__ */ new WeakMap()) {
  if (a === null || typeof a != "object") return a;
  if (a instanceof Date) return new Date(a);
  if (a instanceof RegExp) return new RegExp(a);
  if (typeof a == "function") return a;
  const t = a;
  if (e.has(t)) return e.get(t);
  const n = Array.isArray(a) ? [] : {};
  e.set(t, n);
  for (const r of Object.keys(t)) {
    const u = t[r];
    n[r] = typeof u == "function" ? u : deepClone(u, e);
  }
  return n;
}
function elMatches(a, e) {
  return !a || !e ? !1 : a === e;
}
function getElId(a) {
  return a === document ? "iFSMDocumentRoot" : isWindowTarget(a) ? "__iFSMWindow__" : a.id || null;
}
function ensureId(a) {
  if (a === document) return "iFSMDocumentRoot";
  if (isWindowTarget(a)) return "__iFSMWindow__";
  const e = a;
  return e.id || (e.id = "iFSM_auto_" + ++nbFSM + "_" + Date.now()), e.id;
}
function isWindowTarget(a) {
  return a === window;
}
function getCss3Prop(a) {
  const e = ["", "-moz-", "-webkit-", "-o-", "-ms-", "-khtml-"], t = document.documentElement, n = (r) => r.replace(/-([a-z])/gi, (u, s) => s.toUpperCase());
  for (const r of e) {
    let u = n(r + a);
    if (u.startsWith("Ms") && (u = "m" + u.slice(1)), u in t.style) return u;
  }
}
function createFSMEvent(a, e, t) {
  return {
    data: t ?? null,
    target: a,
    currentTarget: a,
    type: e,
    stopPropagation() {
    }
  };
}
function launchProcess(a, e, t) {
  a._log("launchProcess:  ---> " + e), a.processEvent(e, t, !0);
}
function dispatch(a, e, t) {
  a.dispatchEvent(new CustomEvent(e, { detail: t, bubbles: !0 }));
}
function evaluateCondition(a, e) {
  return typeof a == "function" ? a.call(e) : new Function("return (" + a + ")").call(e);
}
class FSMManager {
  // ── Public properties ────────────────────────────────────────────────
  FSMName;
  opts;
  currentState;
  lastState;
  currentEvent;
  currentUIEvent;
  receivedEvent;
  EventIteration;
  actualTarget;
  myUIObject;
  rootMachine;
  parentMachine;
  childrenMachine;
  subMachineName;
  _stateDefinition;
  _originalStateDefinition;
  // ── Internal properties ──────────────────────────────────────────────
  pushStateList;
  processEventStatus;
  pushEventList;
  listEvents;
  currentDataEvent;
  returnGeneralEventStatus;
  preventCancelId;
  _boundListeners;
  _mutationObserver;
  _logOffset;
  lastevent;
  // ────────────────────────────────────────────────────────────────────
  constructor(e, t, n) {
    const r = {
      debug: !0,
      LogLevel: 1,
      AlertError: !1,
      maxPushEvent: 100,
      startEvent: "start",
      prefixFsmName: "FSM_",
      logFSM: ""
    };
    nbFSM++, this.opts = { ...r, ...n || {} }, this.FSMName = this.opts.prefixFsmName + nbFSM, this._stateDefinition = deepClone(t), this._originalStateDefinition = t, this.currentState = "", this.lastState = "", this.currentEvent = "", this.EventIteration = 0, this.pushStateList = [], this.processEventStatus = "idle", this.pushEventList = [], this.myUIObject = e, this.listEvents = {}, this.currentDataEvent = [], this.returnGeneralEventStatus = !0, this.preventCancelId = 0, this.subMachineName = null, this._boundListeners = [], this._mutationObserver = null, this._logOffset = "", this.lastevent = "", this.opts.rootMachine || (this.opts.rootMachine = this), this.rootMachine = this.opts.rootMachine, this.opts.nextParent === void 0 ? this.parentMachine = null : this.parentMachine = this.opts.nextParent, this.opts.nextParent = this, this.childrenMachine = [], this.parentMachine && this.parentMachine.childrenMachine.push(this);
    const u = [];
    let s = !1, l = !1, p = !1;
    for (const C in this._stateDefinition) {
      const E = this._stateDefinition[C];
      typeof E == "string" && (this._stateDefinition[C] = this._stateDefinition[E]);
      const w = this._stateDefinition[C];
      if (!(!w || typeof w == "string"))
        for (const f in w)
          typeof w[f] == "string" && (w[f] = w[w[f]]), !this.rootMachine.listEvents[f] && f !== "delegate_machines" && f !== this.opts.startEvent ? (this.listEvents[f] = f, this !== this.rootMachine && (this.rootMachine.listEvents[f] = f)) : f === this.opts.startEvent && (p = !0);
    }
    for (const C in this.listEvents) {
      const E = C.split("_");
      E[0] === "attrchange" && (s = !0, u.push(C), E[1] === "style" && E.length > 2 && (l = !0));
    }
    s && e instanceof Element && this._setupMutationObserver(e, u, l);
    const m = isWindowTarget(e) ? window : e === document ? document : e, b = this.rootMachine, o = Object.keys(this.listEvents);
    for (const C of o) {
      if (C.startsWith("attrchange")) continue;
      const E = (w) => {
        const f = [w, w.detail ?? null];
        return b.returnGeneralEventStatus = !0, b.processEvent(w.type, f), b.returnGeneralEventStatus;
      };
      m.addEventListener(C, E), this._boundListeners.push({ target: m, event: C, handler: E });
    }
    if (p) {
      const C = this, E = (w) => {
        const f = [w, w.detail ?? null];
        C.processEvent(w.type, f);
      };
      m.addEventListener(this.opts.startEvent, E), this._boundListeners.push({ target: m, event: this.opts.startEvent, handler: E });
    }
    this._log("new FSMManager:" + this.FSMName, 2);
  }
  // ── MutationObserver setup ────────────────────────────────────────────
  _setupMutationObserver(e, t, n) {
    this._mutationObserver = new MutationObserver((r) => {
      for (const u of r) {
        if (u.type !== "attributes" || !u.attributeName) continue;
        const s = u.attributeName, l = u.oldValue, p = e.getAttribute(s);
        if (t.includes("attrchange") && dispatch(e, "attrchange", { attributeName: s, oldValue: l, newValue: p }), t.includes("attrchange_" + s) && dispatch(e, "attrchange_" + s, { oldValue: l, newValue: p }), s === "style" && n) {
          const m = (C) => {
            const E = {};
            if (!C) return E;
            for (const w of C.split(";")) {
              const f = w.indexOf(":");
              f > 0 && (E[w.slice(0, f).trim()] = w.slice(f + 1).trim());
            }
            return E;
          }, b = m(p), o = m(l);
          for (const C in b)
            if (!o[C] || o[C] !== b[C]) {
              const w = "attrchange_style_" + (getCss3Prop(C) || C);
              t.includes(w) && dispatch(e, w, { newValue: b[C], oldValue: o[C] });
            }
        }
      }
    }), this._mutationObserver.observe(e, { attributes: !0, attributeOldValue: !0 });
  }
  // ════════════════════════════════════════════════════════════════════
  //  InitManager
  // ════════════════════════════════════════════════════════════════════
  InitManager(e) {
    if (this._log("InitManager"), this.currentState = e || "DefaultState", this._stateDefinition.DefaultState || (this._stateDefinition.DefaultState = {}), !this.parentMachine)
      this.trigger(this.opts.startEvent);
    else {
      const t = [createFSMEvent(this.myUIObject, this.opts.startEvent)];
      this.processEvent(this.opts.startEvent, t, !0);
    }
  }
  // ════════════════════════════════════════════════════════════════════
  //  processEvent
  // ════════════════════════════════════════════════════════════════════
  processEvent(e, t, n) {
    const r = this.currentState, u = t[0];
    this.currentUIEvent = u, this.receivedEvent = e, this.currentDataEvent = t, this.currentEvent = u;
    let s = this.currentState, l = n !== void 0;
    const p = [createFSMEvent(this.myUIObject, "", null)];
    if (p[1] = t[1], p[2] = t[2], this._log(
      "processEvent: " + this.FSMName + ":" + r + ":" + e + "-> START",
      3,
      1
    ), t.length > 1) {
      const y = t[t.length - 1];
      if (y?.targetFSM && y.targetFSM !== this && (y.localMachine || y.targetFSM.rootMachine !== this.rootMachine)) {
        this._log("processEvent: " + this.FSMName + ":" + r + ":" + e + "-> not for this machine", 3), this._log("processEvent: EXIT", 3, -1);
        return;
      }
    }
    if (this.subMachineName && this.parentMachine) {
      const y = this.parentMachine._stateDefinition[this.parentMachine.currentState];
      if (!y?.delegate_machines || !y.delegate_machines[this.subMachineName]) {
        this._log("processEvent: submachine cant run -> exit", 3), this._log("processEvent: EXIT", 3, -1);
        return;
      }
    }
    if (!this._stateDefinition[r]) {
      this._log('processEvent: currentState "' + r + '" does not exist!', 1), this._log("processEvent: EXIT", 3, -1);
      return;
    }
    (e === "enterState" || e === "exitState") && (l = !0);
    const m = u.target, b = u.currentTarget;
    if (!elMatches(this.myUIObject, b) && !elMatches(this.myUIObject, m) && this.myUIObject !== document && !isWindowTarget(b) && !isWindowTarget(m)) {
      this._log("processEvent: not a good target -> exit", 3), this._log("processEvent: EXIT", 3, -1);
      return;
    } else
      this.actualTarget = this.myUIObject === document ? document : b;
    let o = this._stateDefinition[r]?.[e];
    if (!l && this.processEventStatus !== "idle" && (!o?.how_process_event || o.how_process_event.immediate === void 0 && o.how_process_event.delay === void 0)) {
      this.pushEvent(e, t), this._log("processEvent: Event pushed -> exit", 3), this._log("processEvent: EXIT", 3, -1);
      return;
    }
    this.lastevent = r + "-" + e;
    const C = this._stateDefinition[r]?.delegate_machines;
    if (C)
      for (const y in C) {
        this._log("processEvent: delegate to submachine -> " + y, 3);
        const S = C[y];
        if (S.myFSM || (this._log("processEvent: create FSM for submachine " + y, 3), S.myFSM = new FSMManager(this.myUIObject, S.submachine, this.opts), S.myFSM.opts.FSMParent = this, S.myFSM.subMachineName = y), e === "enterState")
          (S.myFSM.currentState === "" || !S.no_reinitialisation) && S.myFSM.InitManager();
        else if (e === "exitState")
          p[0].type = "exitMachine", S.myFSM.processEvent("exitMachine", p, !0), S.myFSM.cancelDelayedProcess();
        else {
          if (S.myFSM.processEvent(e, t), r !== this.currentState) {
            this._log("processEvent: submachine changed environment", 3), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
            return;
          }
          const _ = S.myFSM.currentState, I = S.myFSM._stateDefinition;
          if (I[_]?.[e]?.prevent_bubble || I.DefaultState?.[e]?.prevent_bubble || e === this.opts.startEvent) {
            this._log("processEvent: prevent_bubble -> exit", 3), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
            return;
          }
        }
      }
    if (r === "DefaultState" || o === void 0) {
      if (this._log("processEvent: fallback to DefaultState for " + e, 3), o = this._stateDefinition.DefaultState?.[e], o === void 0 && (["start", "enterState", "exitState", "exitMachine"].includes(e) || (this._log("processEvent: fallback to catchEvent for " + e, 3), o = this._stateDefinition.DefaultState?.catchEvent, o && !this._stateDefinition.DefaultState[e] && (this._stateDefinition.DefaultState[e] = deepClone(o)))), !o) {
        this._log("processEvent: Event " + e + " not found -> exit", 3), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
        return;
      }
      s = "DefaultState";
    }
    if (o.pushpop_state === "PopState" && this.pushStateList.length > 0 && (o.next_state = this.pushStateList[this.pushStateList.length - 1]), o.pushpop_state_if_error === "PopState" && this.pushStateList.length > 0 && (o.next_state_if_error = this.pushStateList[this.pushStateList.length - 1]), !elMatches(this.myUIObject, m) && this.myUIObject !== document && !isWindowTarget(b) && !isWindowTarget(m) && o.process_on_UItarget) {
      this._log("processEvent: wrong UI target (process_on_UItarget) -> exit", 3), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
      return;
    }
    if (o.UI_event_bubble || (u.stopPropagation(), this.returnGeneralEventStatus = !1, this.rootMachine.returnGeneralEventStatus = !1), !l && o.how_process_event?.delay) {
      this._log("processEvent: Event " + e + " delayed -> exit", 3), this.delayProcess(e, o.how_process_event.delay, t), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
      return;
    }
    const E = this._stateDefinition[s]?.[e];
    if (E && (E.EventIteration = (E.EventIteration ?? 0) + 1, this.EventIteration = E.EventIteration), o.process_event_if !== void 0 && !evaluateCondition(o.process_event_if, this)) {
      this._log("processEvent: refused by process_event_if", 3), o.propagate_event_on_refused && this.trigger(
        o.propagate_event_on_refused,
        null,
        o.propagate_event_on_localmachine
      ), this.cleanExitProcess(), this._log("processEvent: EXIT", 3, -1);
      return;
    }
    this._log("processEvent: " + this.FSMName + ":" + r + ":" + e + "-> processing", 2);
    const w = this.processEventStatus;
    this.processEventStatus = "processing";
    let f = !0;
    const k = t[1];
    if (k?.preventCancelSet && delete k.preventCancelSet, o.init_function) {
      const y = [o.properties_init_function, ...t];
      f = o.init_function.apply(this, y), this._log("processEvent: init_function done", 3);
    }
    if (f !== !1 && o.pushpop_state)
      switch (o.pushpop_state) {
        case "PushState":
          this.pushStateList.push(this.currentState);
          break;
        case "PopState":
          this.pushStateList.length > 0 && this.pushStateList.pop();
          break;
      }
    let F;
    if (o.next_state_when !== void 0 && (F = evaluateCondition(o.next_state_when, this)), f !== !1 && o.next_state && r !== o.next_state && (o.next_state_when === void 0 && o.next_state_on_target === void 0 || o.next_state_when !== void 0 && F === !0 || o.next_state_on_target && this.subMachinesRespectTargets(e))) {
      const y = this._stateDefinition[this.currentState];
      if (y) {
        for (const S in y)
          if (S !== "delegate_machines") {
            const _ = y[S];
            _ && typeof _ == "object" && (_.EventIteration = 0);
          }
      }
      this.cancelDelayedProcess(), p[0].type = "exitState", e !== this.opts.startEvent && this.processEvent("exitState", p, !0), this._stateDefinition[o.next_state] ? (this._log("processEvent: Go to " + o.next_state, 3), this.lastState = this.currentState, this.currentState = o.next_state) : (this._log("processEvent: " + o.next_state + " DOES NOT EXIST!", 1), this.lastState = this.currentState), p[0].type = "enterState", this.processEvent("enterState", p, !0), this._propagateEvents(o, e, t);
    } else if (f !== !1 && o.propagate_event !== void 0)
      this._propagateEvents(o, e, t);
    else if (f === !1 && o.next_state_if_error) {
      if (this._log("processEvent: error in init_function", 3), o.pushpop_state_if_error)
        switch (o.pushpop_state_if_error) {
          case "PushState":
            this.pushStateList.push(this.currentState);
            break;
          case "PopState":
            this.pushStateList.length > 0 && this.pushStateList.pop();
            break;
        }
      this._log("processEvent: Go to (error) " + o.next_state_if_error, 3), this.lastState = this.currentState, this.currentState = o.next_state_if_error, p[0].type = "enterState", this.processEvent("enterState", p, !0);
    } else
      this._log("processEvent: nothing to do", 3);
    if (o.out_function) {
      const y = [o.properties_out_function, ...t];
      o.out_function.apply(this, y), this._log("processEvent: out_function done", 3);
    }
    this.processEventStatus = w, this.cleanExitProcess(), this._log("processEvent: " + this.FSMName + ":" + r + ":" + e + "-> EXIT", 3, -1);
  }
  // ── propagate helper ────────────────────────────────────────────────
  _propagateEvents(e, t, n) {
    if (e.propagate_event === void 0) return;
    let r = e.propagate_event;
    Array.isArray(r) || (r = [r]);
    for (const u of r)
      this._log("processEvent: propagate -> " + u, 3), u === !0 ? this.trigger(t, n[1], e.propagate_event_on_localmachine) : this.trigger(u, n[1], e.propagate_event_on_localmachine);
  }
  // ════════════════════════════════════════════════════════════════════
  //  Event queue
  // ════════════════════════════════════════════════════════════════════
  cleanExitProcess() {
    this.pushEventList.length && (this.processEventStatus === "idle" || this.pushEventList.length > this.opts.maxPushEvent) && this.popEvent();
  }
  pushEvent(e, t) {
    if (this._log("pushEvent: -> " + e), this.pushEventList.length > this.opts.maxPushEvent) {
      this._log("pushEvent: too many events -> " + this.pushEventList.length, 2);
      return;
    }
    (!t || !Array.isArray(t) || !t[0]?.type) && (t = [createFSMEvent(this.myUIObject, e), t]), this.pushEventList.push({ anEvent: e, data: t });
  }
  popEvent() {
    if (this._log("popEvent"), this.pushEventList.length > 0) {
      const e = this.pushEventList.shift();
      return e.anEvent ? (this.processEvent(e.anEvent, e.data), !0) : !1;
    }
    return !1;
  }
  // ════════════════════════════════════════════════════════════════════
  //  Delayed events
  // ════════════════════════════════════════════════════════════════════
  delayProcess(e, t, n) {
    this._log("delayProcess: -> " + e), this.preventCancelId++;
    let r = this.currentState, u = getElId(this.myUIObject) + r + e + this.preventCancelId;
    n[1] || (n[1] = {}), this._stateDefinition[this.currentState]?.[e] || (r = "DefaultState");
    const s = this._stateDefinition[r][e];
    if (s.how_process_event.DelayedProcessNames || (s.how_process_event.DelayedProcessNames = {}), s.how_process_event.preventcancel) {
      const l = n[1];
      l.preventCancelSet ? u = l.preventCancelSet : l.preventCancelSet = u;
    }
    s.how_process_event.DelayedProcessNames[u] = u, doTimeout(u, t, launchProcess, this, e, n);
  }
  cancelDelayedProcess() {
    this._log("cancelDelayedProcess");
    for (const e in this._stateDefinition[this.currentState]) {
      let t = this.currentState;
      if (this._stateDefinition[t]?.[e] || (t = "DefaultState"), !this._stateDefinition[t]?.[e]) {
        this._log("cancelDelayedProcess: " + e + " has no definition", 1);
        return;
      }
      const n = this._stateDefinition[t][e];
      if (n.how_process_event && !n.how_process_event.preventcancel && n.how_process_event.DelayedProcessNames) {
        for (const r in n.how_process_event.DelayedProcessNames)
          cancelTimeout(r);
        n.how_process_event.DelayedProcessNames = {};
      }
    }
  }
  // ════════════════════════════════════════════════════════════════════
  //  trigger
  // ════════════════════════════════════════════════════════════════════
  trigger(e, t, n) {
    const r = !!n, u = [createFSMEvent(this.myUIObject, e)];
    u[1] = t, u[2] = { targetFSM: this, localMachine: r }, r ? this.processEvent(e, u) : this.rootMachine.processEvent(e, u);
  }
  // ════════════════════════════════════════════════════════════════════
  //  Sub-machine target checks
  // ════════════════════════════════════════════════════════════════════
  subMachinesRespectTargets(e) {
    this._log("subMachinesRespectTargets");
    const t = this._stateDefinition[this.currentState], r = t[e].next_state_on_target, u = r.condition;
    let s = u !== "||";
    for (const l in r.submachines) {
      const p = r.submachines[l], m = t.delegate_machines;
      let b = p.target_list.indexOf(
        m[l].myFSM.currentState
      ) > -1;
      if (p.condition === "not" && (b = !b), u === "||") {
        if (s = s || b, s) return s;
      } else if (u === "&&") {
        if (s = s && b, !s) return s;
      } else
        return this._log("unknown operator: " + u), s;
    }
    return s;
  }
  // ════════════════════════════════════════════════════════════════════
  //  Utility
  // ════════════════════════════════════════════════════════════════════
  hashCode(e) {
    let t = 0;
    for (let n = 0; n < e.length; n++)
      t = (t << 5) - t + e.charCodeAt(n), t |= 0;
    return t;
  }
  // ════════════════════════════════════════════════════════════════════
  //  Logging
  // ════════════════════════════════════════════════════════════════════
  _log(e, t = 3, n) {
    if (t >= 2 && !this.opts.debug || t > this.opts.LogLevel || this.opts.logFSM && !this.opts.logFSM.includes(this.FSMName)) return;
    n === -1 && (this._logOffset = this._logOffset.replace("  ", ""));
    const r = "[fsm] " + this._logOffset;
    t === 1 ? console.error(r + e) : t === 2 ? console.warn(r + e) : console.log(r + e), t === 1 && this.opts.AlertError && alert(e), n === 1 && (this._logOffset += "  ");
  }
  // ════════════════════════════════════════════════════════════════════
  //  Cleanup
  // ════════════════════════════════════════════════════════════════════
  destroy() {
    for (const { target: t, event: n, handler: r } of this._boundListeners)
      t.removeEventListener(n, r);
    this._boundListeners = [], this._mutationObserver && (this._mutationObserver.disconnect(), this._mutationObserver = null);
    const e = getElId(this.myUIObject);
    e && iFSMRegistry[e] && (iFSMRegistry[e] = iFSMRegistry[e].filter((t) => t !== this));
  }
}
function createFSM(a, e, t) {
  const n = ensureId(a);
  iFSMRegistry[n] || (iFSMRegistry[n] = []);
  const r = e, u = new FSMManager(a, r, t);
  return getFSM(a, r) && console.warn("[warn][fsm] state machine was already set for this definition on " + n), iFSMRegistry[n].push(u), t?.initState !== void 0 ? u.InitManager(t.initState) : u.InitManager(), u;
}
function getFSM(a, e) {
  const t = getElId(a);
  if (!t || !iFSMRegistry[t]) return e ? null : [];
  if (!e) return iFSMRegistry[t];
  for (const n of iFSMRegistry[t])
    if (n._originalStateDefinition === e) return n;
  return null;
}
class Blapy {
  container;
  myUIObject;
  myUIObjectID;
  logger;
  defaults = {};
  opts;
  utils;
  ajaxService;
  templateManager;
  router;
  blapyBlocks;
  myFSM;
  /**
   * Optional animation provider used by data-blapy-update="fadeInOut"/"rightOutIn".
   * Undefined unless an `animation` provider (e.g. Blapymotion) is passed in options.
   */
  animation;
  /**
   * Optional WebSocket service (receive-only). Non-null only when
   * `websocketOptions` is passed AND a global `BlapySocket` class is loaded
   * (via a separate `<script src="dist/BlapySocket.js">`).
   */
  websocket;
  optsIfsm;
  constructor(e, t = {}) {
    if (!e)
      throw new Error("Blapy needs a valid DOM element");
    if (typeof e == "string") {
      const u = document.querySelector(e);
      if (!u)
        throw new Error(`Element not found: ${e}`);
      e = u;
    }
    if (!(e instanceof HTMLElement))
      throw new TypeError("Blapy needs a valid DOM element");
    if (!e.id)
      throw new Error("Blapy needs an element with an ID");
    this.container = e, this.defaults = {
      debug: !1,
      logLevel: 1,
      alertError: !1,
      enableRouter: !1,
      routerRoot: "/",
      routerHash: !1,
      pageLoadedFunction: null,
      pageReadyFunction: null,
      beforePageLoad: null,
      beforeContentChange: null,
      afterContentChange: null,
      afterPageChange: null,
      onErrorOnPageChange: null,
      doCustomChange: null,
      fsmExtension: null,
      LogLevelIfsm: 1,
      debugIfsm: !1,
      theBlapy: this,
      animation: null
    }, this.opts = { ...this.defaults, ...t };
    const n = globalThis.Blapymotion;
    this.animation = this.opts.animation ?? (typeof n == "function" ? new n() : null), this.optsIfsm = {
      ...this.opts,
      debug: this.opts.debugIfsm ?? !1,
      logLevel: this.opts.LogLevelIfsm ?? 1
    }, this.myUIObject = this.container, this.myUIObjectID = this.container.id, this.opts.theBlapy = this, this.utils = new Utils(), this.logger = new Logger(this.opts);
    const r = globalThis.BlapySocket;
    this.websocket = typeof r == "function" && this.opts.websocketOptions && Object.keys(this.opts.websocketOptions).length > 0 ? new r({ ...this.opts.websocketOptions }, this) : null, this.ajaxService = new AjaxService(this.logger), this.templateManager = new TemplateManager(this.logger, this.ajaxService, this.utils), this.router = new Router(this.logger, this, {
      enableRouter: this.opts.enableRouter,
      root: this.opts.routerRoot,
      hash: this.opts.routerHash,
      strategy: "ONE",
      noMatchWarning: !1,
      linksSelector: "[data-blapy-link]"
    }), this.blapyBlocks = new BlapyBlock(this.logger), this.blapyBlocks.initializeBlocks(this.container), this.blapyBlocks.setBlapyInstance(this), this.logger.info(`Blapy instance (#${this.myUIObjectID}) created`, "Blapy2 constructor");
  }
  trigger(e, t = null) {
    this.logger.info(`[Sending event] ${e} - Diffused`);
    const n = new CustomEvent(e, {
      detail: t,
      bubbles: !0
    });
    this.myUIObject.dispatchEvent(n);
  }
  /**
   * Tears down this Blapy instance: destroys the router (removing its event
   * listeners), clears the block update intervals, and detaches the instance
   * reference from the element so it can be re-initialised cleanly.
   */
  destroy() {
    this.logger.info(`Destroying Blapy instance (#${this.myUIObjectID})`, "core"), this.router.destroy(), this.blapyBlocks.destroy(), delete this.myUIObject._blapyInstance;
  }
  createBlapyBlock(e) {
    e["blapy-container-name"] || this.logger.info(`createBlapyBlock: Error on received json where blapy-container-name is not defined!
Perhaps it's pure json not defined as such in Blapy block configuration (cf. data-blapy-template-init-purejson)...
` + JSON.stringify(e));
    const t = document.createElement("div");
    return t.dataset.blapyContainer = "true", t.dataset.blapyContainerName = e["blapy-container-name"], t.dataset.blapyContainerContent = e["blapy-container-content"], t.dataset.blapyUpdate = "json", t.innerHTML = JSON.stringify(e["blapy-data"]), t;
  }
  initApplication() {
    this.logger.info("InitApplication", "core");
    try {
      const e = {
        PageLoaded: {
          enterState: {
            init_function: function() {
              const t = this.opts.theBlapy;
              t.myFSM = this, t.logger.info("Page loaded", "fsm"), t.blapyBlocks.setBlapyUpdateIntervals(), t.opts.pageLoadedFunction && t.opts.pageLoadedFunction(), t.trigger("Blapy_PageLoaded");
            },
            next_state: "PreparePage"
          }
        },
        PreparePage: {
          enterState: {
            init_function: function() {
            },
            propagate_event: "setBlapyUrl"
          },
          setBlapyUrl: {
            init_function: function() {
              this.opts.theBlapy.setBlapyURL();
            },
            next_state: "PreparePage_setBlapyJsonTemplates"
          }
        },
        PreparePage_setBlapyJsonTemplates: {
          enterState: {
            init_function: function() {
              this.opts.theBlapy.setBlapyJsonTemplates();
            },
            next_state: "PreparePage_setBlapyUpdateOnDisplay"
          }
        },
        PreparePage_setBlapyUpdateOnDisplay: {
          blapyJsonTemplatesIsSet: {
            init_function: function() {
              this.opts.theBlapy.setBlapyUpdateOnDisplay();
            },
            next_state: "PageReady"
          },
          reloadBlock: "loadUrl",
          updateBlock: "loadUrl",
          postData: "loadUrl",
          loadUrl: {
            how_process_event: {
              delay: 50,
              preventcancel: !0
            },
            propagate_event: !0
          }
        },
        PageReady: {
          enterState: {
            init_function: function() {
              const t = this.opts.theBlapy;
              t.opts.pageReadyFunction && t.opts.pageReadyFunction(), t.trigger("Blapy_PageReady");
            }
          },
          loadUrl: {
            init_function: function(t, n, r) {
              r.method = "GET", this.trigger("postData", r);
            }
          },
          postData: {
            init_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              u.opts.beforePageLoad && u.opts.beforePageLoad(r), u.trigger("Blapy_beforePageLoad", r);
            },
            out_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              let s = r.aUrl, l = r.aObjectId ? r.aObjectId : n?.currentTarget?.id;
              r.params || (r.params = {});
              let p = lib.parse(lib.stringify(r.params));
              p ? p.blapyaction || (p.blapyaction = "update") : p = { blapyaction: "update" }, "embeddingBlockId" in p && !p.embeddingBlockId && u.logger.error("[postData on " + u.myUIObjectID + "] embeddingBlockId has been set but is undefined!");
              let m = p.embeddingBlockId;
              m && p.templateId && u.myUIObject.querySelectorAll('[data-blapy-container-name="' + m + '"]').forEach((C) => {
                C.dataset.blapyTemplateDefaultId = p.templateId;
              });
              let b = r.method ?? "POST";
              p = Object.assign(p, {
                blapycall: "1",
                blapyaction: p.blapyaction,
                blapyobjectid: l
              });
              const o = { method: b };
              b.toUpperCase() === "GET" ? o.params = p : o.body = p, u.ajaxService.request(s ?? "", o).then((C) => {
                C && (typeof C == "object" && (C = JSON.stringify(C)), m && (C = u.embedHTMLPage(C, m) ?? C), this.trigger("pageLoaded", { htmlPage: C, params: p }));
              }).catch((C) => {
                this.trigger("errorOnLoadingPage", s + ": " + C.toString());
              });
            },
            next_state: "ProcessPageChange"
          },
          updateBlock: {
            init_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              u.opts.beforePageLoad && u.opts.beforePageLoad(r), u.trigger("Blapy_beforePageLoad", r), r?.html || (u.logger.info("updateBlock: no html property found"), this.trigger("errorOnLoadingPage", "updateBlock: no html property found"));
            },
            out_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              if (!r) return;
              r.params || (r.params = {}), "embeddingBlockId" in r.params && !r.params.embeddingBlockId && u.logger.info(`[updateBlock on ${u.myUIObjectID}] embeddingBlockId is undefined!`);
              let s = r.params.embeddingBlockId;
              if (typeof r.html == "object" && (r.html = JSON.stringify(r.html)), s && r.params.templateId) {
                const l = u.myUIObject.querySelector(
                  `[data-blapy-container-name="${s}"]`
                );
                l && (l.dataset.blapyTemplateDefaultId = r.params.templateId);
              }
              s && (r.html = u.embedHTMLPage(r.html ?? "", s)), this.trigger("pageLoaded", { htmlPage: r.html, params: r.params });
            },
            next_state: "ProcessPageChange"
          },
          reloadBlock: {
            init_function: function(t, n, r) {
              const u = this.opts.theBlapy, s = r.params ?? {};
              "embeddingBlockId" in s && !s.embeddingBlockId && u.logger.info("[reloadBlock on " + u.myUIObjectID + "] embeddingBlockId is undefined!"), u.setBlapyJsonTemplates(!0, s.embeddingBlockId, s.templateId), u.setBlapyUpdateOnDisplay();
            }
          }
        },
        ProcessPageChange: {
          enterState: {},
          pageLoaded: {
            init_function: async function(t, n, r) {
              const u = this.opts.theBlapy;
              let s = r.htmlPage;
              const l = r.params ?? {}, p = l.blapyobjectid, m = lib;
              try {
                if (s = m.parse(s), Array.isArray(s)) {
                  const b = document.createDocumentFragment();
                  for (const o of s)
                    b.appendChild(u.createBlapyBlock(o));
                  s = b;
                } else typeof s == "object" ? s = u.createBlapyBlock(s) : u.logger.info("downloaded content is neither html nor json: " + s);
              } catch {
                const b = document.createElement("template");
                b.innerHTML = s, s = b.content;
              }
              switch (l.blapyaction) {
                default:
                  for (const b of u.myUIObject.querySelectorAll("[data-blapy-container]")) {
                    let o = b;
                    const C = o.dataset.blapyContainerName;
                    l["force-update"] || (l["force-update"] = 0);
                    let E = null;
                    try {
                      const y = (s instanceof DocumentFragment, s);
                      y.matches?.(`[data-blapy-container-name="${C}"]`) ? E = y : (E = y.querySelector?.(`[data-blapy-container-name="${C}"]`) ?? null, !E && y instanceof DocumentFragment && (E = y.querySelector(`[data-blapy-container-name="${C}"]`)));
                    } catch (y) {
                      u.logger.error(String(y));
                      continue;
                    }
                    if (!E) continue;
                    const w = E.dataset.blapyApplyon;
                    if (w) {
                      const y = w.split(",");
                      if (y.length > 0 && !y.includes(p)) continue;
                    }
                    o.id || u.logger.warn("A blapy block has no id: " + o.outerHTML.substring(0, 250)), E.id || (E.id = o.id);
                    let f = E.dataset.blapyUpdate, k = !1;
                    (o.dataset.blapyUpdateRule === "local" || f === "json" && o.dataset.blapyUpdate !== "json") && (f = o.dataset.blapyUpdate, k = !0);
                    const F = E.querySelector("xmp.blapybin");
                    if (f !== "json" && F && (E.innerHTML = u.utils.atou(F.innerHTML)), u.opts.beforeContentChange && u.opts.beforeContentChange(o), o.dispatchEvent(new CustomEvent("Blapy_beforeContentChange", {
                      detail: u.myUIObject
                    })), !f || f === "update")
                      (E.dataset.blapyContainerContent !== o.dataset.blapyContainerContent || l["force-update"] == 1) && (k ? o.innerHTML = E.innerHTML : (o.outerHTML = E.outerHTML, o = E));
                    else if (f === "force-update")
                      k ? o.innerHTML = E.innerHTML : (o.outerHTML = E.outerHTML, o = E);
                    else if (f === "append")
                      E.insertAdjacentHTML("afterbegin", o.innerHTML), k ? o.innerHTML = E.innerHTML : (o.outerHTML = E.outerHTML, o = E);
                    else if (f === "prepend")
                      E.insertAdjacentHTML("beforeend", o.innerHTML), k ? o.innerHTML = E.innerHTML : (o.outerHTML = E.outerHTML, o = E);
                    else if (f === "json-append") {
                      const y = o.dataset.blapyJsonData;
                      let S = [];
                      if (y)
                        try {
                          S = m.parse(y), Array.isArray(S) || (S = [S]);
                        } catch {
                          S = [];
                        }
                      let _ = null;
                      if (F)
                        try {
                          _ = m.parse(u.utils.atou(F.innerHTML));
                        } catch {
                          u.logger.error("Failed to decode/parse new JSON data", "json-append");
                          continue;
                        }
                      else
                        try {
                          _ = m.parse(E.innerHTML);
                        } catch {
                          u.logger.error("Failed to parse new JSON data", "json-append");
                          continue;
                        }
                      _?.["blapy-data"] && (_ = _["blapy-data"]);
                      const I = o.dataset.blapyJsonAppendStrategy ?? "end";
                      let i = [];
                      if (I === "start")
                        i = Array.isArray(_) ? [..._, ...S] : [_, ...S];
                      else if (I === "unique") {
                        const g = o.dataset.blapyJsonUniqueKey ?? "id";
                        i = [...S];
                        const A = Array.isArray(_) ? _ : [_];
                        for (const v of A)
                          i.some(
                            (L) => L[g] && v[g] && L[g] === v[g]
                          ) || i.push(v);
                      } else
                        i = Array.isArray(_) ? [...S, ..._] : [...S, _];
                      const h = Number.parseInt(o.dataset.blapyJsonMaxItems ?? "");
                      h > 0 && i.length > h && (i = I === "start" ? i.slice(0, h) : i.slice(-h)), o.dataset.blapyJsonData = JSON.stringify(i);
                      const d = E.cloneNode(!0);
                      d.innerHTML = JSON.stringify(i), await u.templateManager.processJsonUpdate(null, o, d, u), o.dispatchEvent(new CustomEvent("Blapy_jsonAppended", {
                        detail: {
                          newItems: Array.isArray(_) ? _.length : 1,
                          totalItems: i.length,
                          data: i
                        }
                      })), u.logger.info(
                        `JSON Append: added ${Array.isArray(_) ? _.length : 1} items, total: ${i.length}`,
                        "json-append"
                      );
                    } else if (f === "replace")
                      o.innerHTML = E.innerHTML, o = E;
                    else if (f === "custom")
                      (E.dataset.blapyContainerContent !== o.dataset.blapyContainerContent || l["force-update"] == 1) && (u.opts.doCustomChange && u.opts.doCustomChange(o, E), o.dispatchEvent(new CustomEvent("Blapy_doCustomChange", {
                        detail: E
                      })));
                    else if (f === "remove") {
                      const y = o.parentNode;
                      o.remove(), o = y;
                    } else if (f === "json")
                      await u.templateManager.processJsonUpdate(F, o, E, u);
                    else {
                      const y = u.animation?.[f];
                      typeof y == "function" ? (E.dataset.blapyContainerContent !== o.dataset.blapyContainerContent || l["force-update"] == 1 || E.dataset.blapyContainerForceUpdate === "true") && y(o, E) : (u.animation ? u.logger.error(`animation "${f}" does not exist on the animation provider; updating without animation`) : u.logger.warn(`data-blapy-update="${f}" needs the optional Blapymotion module (load <script src="dist/BlapyMotion.js"> or pass an \`animation\` provider); updating without animation`), o.outerHTML = E.outerHTML, o = E);
                    }
                    if (u.blapyBlocks.setBlapyUpdateIntervals(), await u.setBlapyUpdateOnDisplay(), u.setBlapyURL(), u.opts.afterContentChange && u.opts.afterContentChange(o), o.id) {
                      const y = document.getElementById(o.id);
                      y && y.dispatchEvent(new CustomEvent("Blapy_afterContentChange", {
                        detail: o
                      }));
                    }
                  }
                  break;
              }
            },
            out_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              u.opts.afterPageChange && u.opts.afterPageChange(), u.trigger("Blapy_afterPageChange", r);
            },
            next_state: "PageReady"
          },
          errorOnLoadingPage: {
            init_function: function(t, n, r) {
              const u = this.opts.theBlapy;
              u.opts.onErrorOnPageChange && u.opts.onErrorOnPageChange(r), u.trigger("Blapy_ErrorOnPageChange", r);
            },
            next_state: "PageReady"
          },
          reloadBlock: "loadUrl",
          updateBlock: "loadUrl",
          postData: "loadUrl",
          loadUrl: {
            how_process_event: {
              delay: 50,
              preventcancel: !0
            },
            propagate_event: !0
          }
        },
        DefaultState: {
          start: {
            next_state: "PageLoaded"
          }
        }
      };
      return this.opts.fsmExtension && this.deepMerge(e, this.opts.fsmExtension), this.myFSM = createFSM(this.myUIObject, e, {
        ...this.optsIfsm,
        theBlapy: this
      }), this.router.init() ? !0 : (this.logger.error("Failed to initialize router", "core"), !1);
    } catch (e) {
      return this.logger.error(`Failed to initialize application: ${String(e)}`, "core"), !1;
    }
  }
  setBlapyURL() {
    this.logger.info("Set blapyURL", "router"), this.container.querySelectorAll("[data-blapy-link]").forEach((t) => {
      if (this.shouldSkipLink(t)) return;
      let n = this.getHref(t);
      n && (n = this.normalizeHref(n, t), this.updateHref(t, n));
    });
  }
  shouldSkipLink(e) {
    const t = e.dataset.blapyActiveBlapyid;
    return t && t !== this.myUIObjectID;
  }
  getHref(e) {
    switch (e.tagName) {
      case "A":
        return e.getAttribute("href");
      case "FORM":
        return e.getAttribute("action");
      default:
        return e.dataset.blapyHref;
    }
  }
  normalizeHref(e, t) {
    if (!e.includes("#blapylink")) {
      e += "#blapylink";
      const r = t.dataset.blapyEmbeddingBlockid;
      r && (e += `#${r}`);
    }
    if (t.tagName !== "A" && t.tagName !== "FORM" && !e.startsWith("/") && !/^https?:\/\//i.test(e)) {
      const r = document.querySelector("base")?.getAttribute("href");
      e = r ? r + e : globalThis.location.pathname.replace(/[^/]*$/, "") + e;
    }
    return e;
  }
  updateHref(e, t) {
    switch (e.tagName) {
      case "A":
        e.setAttribute("href", t);
        break;
      case "FORM":
        e.setAttribute("action", t);
        break;
      default:
        e.dataset.blapyHref = t, e.addEventListener("click", () => {
          this.myFSM.trigger("loadUrl", {
            aUrl: t,
            params: {},
            aObjectId: this.myUIObjectID
          });
        });
    }
  }
  navigate(e, t = {}) {
    this.opts.enableRouter && this.router.isInitialized ? this.router.navigate(e, t) : this.myFSM.trigger("loadUrl", {
      aUrl: e,
      params: t.params || {},
      aObjectId: this.myUIObjectID,
      noBlapyData: t.noBlapyData
    });
  }
  async setBlapyJsonTemplates(e, t, n) {
    if (this.logger.info("setBlapyJsonTemplates", "core"), e ??= !1, t ? t = `[data-blapy-container-name='${t}']` : t = "", n) {
      const u = '[data-blapy-update="json"]' + t;
      this.container.querySelectorAll(u).forEach((l) => {
        l.dataset.blapyTemplateDefaultId = n;
      });
    }
    let r = this.container.querySelectorAll('[data-blapy-update="json"]' + t);
    if (r.length > 0) {
      for (const u of r)
        await this.templateManager.setBlapyContainerJsonTemplate(u, this, e);
      this.myFSM.trigger("blapyJsonTemplatesIsSet");
    } else
      this.myFSM.trigger("blapyJsonTemplatesIsSet");
  }
  async setBlapyUpdateOnDisplay() {
    this.logger.info("setBlapyUpdateOnDisplay", "core");
    const e = this.myUIObject.querySelectorAll("[data-blapy-updateblock-ondisplay]");
    if (e.length === 0) return;
    if (!("IntersectionObserver" in globalThis)) {
      alert("Blapy: IntersectionObserver is not supported. Need it to process data-blapy-updateblock-ondisplay option");
      return;
    }
    const t = (r, u) => {
      r.forEach((s) => {
        if (s.isIntersecting) {
          const l = s.target;
          if (!Object.hasOwn(l.dataset, "blapyAppear")) {
            if (l.dataset.blapyAppear = "done", this.logger.info(`Element became visible: ${l.dataset.blapyContainerName}`, "setBlapyUpdateOnDisplay"), Object.hasOwn(l.dataset, "blapyHref"))
              this.myFSM.trigger("loadUrl", {
                aUrl: l.dataset.blapyHref,
                params: {},
                aObjectId: this.myUIObjectID,
                noBlapyData: l.dataset.blapyNoblapydata
              });
            else if (Object.hasOwn(l.dataset, "blapyTemplateInit")) {
              const p = l.dataset.blapyContainerName;
              this.myFSM.trigger("reloadBlock", {
                params: { embeddingBlockId: p }
              });
            }
          }
          u.unobserve(l);
        }
      });
    }, n = new IntersectionObserver(t, {
      root: null,
      // viewport
      rootMargin: "0px",
      threshold: 0.1
      // déclenche quand 10% de l'élément est visible
    });
    e.forEach((r) => {
      this.logger.info(`Observing element: ${r.dataset.blapyContainerName}`, "setBlapyUpdateOnDisplay"), n.observe(r);
    });
  }
  embedHTMLPage(e, t) {
    this.logger.info("embedHTML", "core");
    const n = this.myUIObject.querySelector("[data-blapy-container-name='" + t + "']");
    if (!n)
      return this.logger.error(`embedHtmlPage: Error on blapy-container-name... ${t} does not exist!`), "";
    if (n.dataset.blapyUpdate === "json" && n.dataset.blapyTemplateInitPurejson === "0")
      try {
        e instanceof Element && (e = e.innerHTML);
      } catch (m) {
        this.logger.warn(`embedHtmlPage: aHtmlSource is perhaps a pure json after all...?
${e.toString()} ${String(m)}`);
      }
    const r = typeof e == "string" ? e : e.outerHTML, u = '<xmp class="blapybin">' + this.utils.utoa(r) + "</xmp>", s = document.createElement("div");
    s.innerHTML = n.outerHTML;
    const l = s.firstElementChild;
    if (!l) return;
    l.innerHTML = u;
    const p = l.dataset.blapyContainerContent || "";
    return l.dataset.blapyContainerContent = p + "-" + Date.now(), l.removeAttribute("id"), l.outerHTML;
  }
  deepMerge(e, t) {
    for (const n in t)
      t.hasOwnProperty(n) && typeof t[n] == "object" && t[n] !== null && !Array.isArray(t[n]) ? ((!e[n] || typeof e[n] != "object") && (e[n] = {}), this.deepMerge(e[n], t[n])) : e[n] = t[n];
    return e;
  }
}
HTMLElement.prototype.Blapy = function(a = {}) {
  if (this._blapyInstance)
    return this._blapyInstance;
  const e = new Blapy(this, a);
  return e.initApplication(), this._blapyInstance = e, e;
};
class Blapymotion {
  constructor() {
    this.fadeInOut = this.fadeInOut.bind(this), this.rightOutIn = this.rightOutIn.bind(this);
  }
  /**
   * Performs a fade-out on the old container, then fades in the new one.
   * @param {HTMLElement} oldContainer - The container currently visible.
   * @param {HTMLElement} newContainer - The container to be displayed.
   */
  fadeInOut(e, t) {
    const n = parseInt(t.dataset.blapyFadeoutDelay ?? "") || 1500, r = parseInt(t.dataset.blapyFadeinDelay ?? "") || 1500;
    this._fadeOut(e, n, () => {
      t.style.opacity = String(0), e.replaceWith(t), this._fadeIn(t, r);
    });
  }
  /**
   * Slides the old container out to the right and brings in the new one from the right.
   * @param {HTMLElement} oldContainer - The container currently visible.
   * @param {HTMLElement} newContainer - The container to be displayed.
   */
  rightOutIn(e, t) {
    const n = parseInt(t.dataset.blapyFadeoutDelay ?? "") || 1500, r = parseInt(t.dataset.blapyFadeinDelay ?? "") || 1500, u = e.getBoundingClientRect().left, s = document.documentElement.clientWidth;
    e.style.position = "relative", e.style.overflow = "hidden", e.style.left = `${u}px`, this._slideOutRight(e, s, n, () => {
      t.style.opacity = String(0), t.style.overflow = "hidden", t.style.position = "relative", t.style.left = `${s}px`, e.replaceWith(t), this._slideInFromRight(t, u, r, () => {
        t.style.position = "static", t.style.left = "0px";
      });
    });
  }
  // --- Internal utility animation functions ---
  /**
   * Fades out an element.
   * @private
   * @param {HTMLElement} el - The element to fade out.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _fadeOut(e, t, n) {
    e.style.transition = `opacity ${t}ms ease`, e.style.opacity = String(0), setTimeout(() => n?.(), t);
  }
  /**
   * Fades in an element.
   * @private
   * @param {HTMLElement} el - The element to fade in.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _fadeIn(e, t, n) {
    e.style.transition = `opacity ${t}ms ease`, e.style.opacity = String(1), setTimeout(() => n?.(), t);
  }
  /**
   * Slides an element out to the right and fades it out.
   * @private
   * @param {HTMLElement} el - The element to slide out.
   * @param {number} distance - Target left position (usually screen width).
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _slideOutRight(e, t, n, r) {
    e.style.transition = `left ${n}ms ease, opacity ${n}ms ease`, e.style.left = `${t}px`, e.style.opacity = String(0), setTimeout(() => r?.(), n);
  }
  /**
   * Slides an element in from the right and fades it in.
   * @private
   * @param {HTMLElement} el - The element to slide in.
   * @param {number} targetLeft - Final left position.
   * @param {number} duration - Duration in milliseconds.
   * @param {Function} [callback] - Optional callback after animation.
   */
  _slideInFromRight(e, t, n, r) {
    e.style.transition = `left ${n}ms ease, opacity ${n}ms ease`, e.style.left = `${t}px`, e.style.opacity = String(1), setTimeout(() => r?.(), n);
  }
}
class BlapySocket {
  options;
  ws = null;
  isConnected = !1;
  reconnectAttempts = 0;
  reconnectTimer = null;
  blapy;
  callbacks = {
    onOpen: [],
    onClose: [],
    onError: [],
    onMessage: [],
    onReconnect: []
  };
  /**
   * Initialize the WebSocket service for Blapy (Receive Only).
   *
   * @param options - Configuration options for the WebSocket service.
   * @param blapy   - The owning Blapy instance (used for logging and command dispatch).
   */
  constructor(e = {}, t) {
    this.blapy = t, this.options = {
      url: "ws://localhost:8080",
      autoConnect: !1,
      reconnectDelay: 3e3,
      maxReconnectAttempts: 10,
      allowedCommands: ["postData", "updateBlock", "reloadBlock", "loadUrl", "trigger"],
      auth: null,
      clientId: this._generateClientId(),
      ...e
    }, this.options.autoConnect && this.connect(), this.blapy.logger.info("BlapySocket initialized (Receive Only)", "WebSocket");
  }
  connect() {
    return new Promise((e, t) => {
      if (this.isConnected) {
        this.blapy.logger.warn("Already connected to WebSocket", "WebSocket"), e();
        return;
      }
      this.blapy.logger.info(`Connecting to WebSocket: ${this.options.url}`, "WebSocket");
      try {
        this.ws = new WebSocket(this.options.url), this.ws.onopen = (n) => {
          this.isConnected = !0, this.reconnectAttempts = 0, this._clearReconnectTimer(), this._sendIdentification(), this._triggerCallbacks("onOpen", n), e();
        }, this.ws.onclose = (n) => {
          this.isConnected = !1, this.blapy.logger.warn(`WebSocket closed: ${n.code} - ${n.reason}`, "WebSocket"), this._triggerCallbacks("onClose", n), n.code !== 1e3 && this.reconnectAttempts < this.options.maxReconnectAttempts && this._scheduleReconnect();
        }, this.ws.onerror = (n) => {
          this.blapy.logger.error("WebSocket error occurred", "WebSocket"), this._triggerCallbacks("onError", n), this.isConnected || t(new Error("Failed to connect to WebSocket"));
        }, this.ws.onmessage = (n) => {
          this._handleMessage(n);
        };
      } catch (n) {
        this.blapy.logger.error(`Failed to create WebSocket connection: ${this._errorMessage(n)}`, "WebSocket"), t(n instanceof Error ? n : new Error(String(n)));
      }
    });
  }
  /**
   * Disconnect from the WebSocket server.
   *
   * @param code   - Close code.
   * @param reason - Close reason.
   */
  disconnect(e = 1e3, t = "Client disconnect") {
    this._clearReconnectTimer(), this.ws && this.isConnected && this.ws.close(e, t), this.isConnected = !1, this.ws = null;
  }
  /**
   * Add an event listener for WebSocket events.
   *
   * @param event    - Event name (onOpen, onClose, onError, onMessage, onReconnect).
   * @param callback - Callback function.
   */
  on(e, t) {
    this.callbacks[e] ? this.callbacks[e].push(t) : this.blapy.logger.warn(`Unknown event: ${e}`, "WebSocket");
  }
  /**
   * Remove an event listener.
   *
   * @param event    - Event name.
   * @param callback - Callback function to remove.
   */
  off(e, t) {
    if (this.callbacks[e]) {
      const n = this.callbacks[e].indexOf(t);
      n > -1 && this.callbacks[e].splice(n, 1);
    }
  }
  /** Get connection status information. */
  getStatus() {
    return {
      connected: this.isConnected,
      url: this.options.url,
      clientId: this.options.clientId,
      reconnectAttempts: this.reconnectAttempts
    };
  }
  /**
   * Send identification message only (minimal sending).
   * @private
   */
  _sendIdentification() {
    if (this.ws && this.isConnected) {
      const e = {
        type: "identify",
        clientId: this.options.clientId,
        blapyInstance: this.blapy?.myUIObjectID || "unknown",
        timestamp: Date.now()
      };
      this.options.auth && (e.auth = this.options.auth);
      try {
        this.ws.send(JSON.stringify(e));
      } catch (t) {
        this.blapy.logger.error(`Error sending identification: ${this._errorMessage(t)}`, "WebSocket");
      }
    }
  }
  /**
   * Handle incoming WebSocket messages.
   * @private
   */
  _handleMessage(e) {
    try {
      const t = JSON.parse(e.data);
      switch (t.type) {
        case "blapy_command":
          this._handleBlapyCommand(t);
          break;
        case "broadcast":
          this._handleBroadcast(t);
          break;
        default:
          this.blapy.logger.info(`Unhandled message type: ${t.type}`, "WebSocket");
      }
      this._triggerCallbacks("onMessage", t);
    } catch (t) {
      this.blapy.logger.error(`Error parsing message: ${this._errorMessage(t)}`, "WebSocket");
    }
  }
  /**
   * Handle Blapy commands received via WebSocket.
   * @private
   */
  _handleBlapyCommand(e) {
    if (!this.blapy)
      return;
    const { command: t, data: n } = e;
    if (!this.options.allowedCommands.includes(t)) {
      this.blapy.logger.warn(`Command not allowed: ${t}`, "WebSocket");
      return;
    }
    try {
      switch (t) {
        case "postData":
          this.blapy.myFSM.trigger("postData", n);
          break;
        case "updateBlock":
          this.blapy.myFSM.trigger("updateBlock", n);
          break;
        case "reloadBlock":
          this.blapy.myFSM.trigger("reloadBlock", n);
          break;
        case "loadUrl":
          this.blapy.myFSM.trigger("loadUrl", n);
          break;
        case "trigger":
          n.event && this.blapy.trigger && this.blapy.trigger(n.event, n.payload);
          break;
        default:
          this.blapy.logger.warn(`Unknown Blapy command: ${t}`, "WebSocket");
      }
    } catch (r) {
      this.blapy.logger.error(`Error executing command: ${this._errorMessage(r)}`, "WebSocket");
    }
  }
  /**
   * Handle broadcast messages.
   * @private
   */
  _handleBroadcast(e) {
    this.blapy && this.blapy.trigger("BlapySocket_Broadcast", e.data);
  }
  /**
   * Schedule a reconnection attempt.
   * @private
   */
  _scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectAttempts++;
    const e = this.options.reconnectDelay * Math.pow(1.5, this.reconnectAttempts - 1);
    this.blapy.logger.info(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${e}ms`, "WebSocket"), this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null, this.blapy.logger.info(`Reconnection attempt ${this.reconnectAttempts}`, "WebSocket"), this.connect().then(() => {
        this._triggerCallbacks("onReconnect", { attempt: this.reconnectAttempts });
      }).catch((t) => {
        this.blapy.logger.error(`Reconnection attempt ${this.reconnectAttempts} failed: ${this._errorMessage(t)}`, "WebSocket");
      });
    }, e);
  }
  /**
   * Clear the reconnection timer.
   * @private
   */
  _clearReconnectTimer() {
    this.reconnectTimer && (clearTimeout(this.reconnectTimer), this.reconnectTimer = null);
  }
  /**
   * Trigger event callbacks.
   * @private
   */
  _triggerCallbacks(e, t) {
    this.callbacks[e] && this.callbacks[e].forEach((n) => {
      try {
        n(t);
      } catch (r) {
        this.blapy.logger.error(`Error in ${e} callback: ${this._errorMessage(r)}`, "WebSocket");
      }
    });
  }
  /**
   * Generate a unique client ID.
   * @private
   */
  _generateClientId() {
    return "blapy_" + Math.random().toString(36).slice(2, 11) + "_" + Date.now();
  }
  _errorMessage(e) {
    return e instanceof Error ? e.message : String(e);
  }
}
export {
  Blapy,
  BlapySocket,
  Blapymotion
};
