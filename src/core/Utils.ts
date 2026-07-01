export class Utils {
  public atou(b64: string) : string {
    return decodeURIComponent(
      atob(b64).split('').map(c => '%' + c.codePointAt(0)!.toString(16).padStart(2, '0')).join('')
    )
  }

  public utoa(data: string): string {
    return btoa(
      encodeURIComponent(data).replace(/%([0-9A-F]{2})/gi, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      )
    )
  }

}