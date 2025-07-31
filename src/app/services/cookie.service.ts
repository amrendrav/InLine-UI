import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  
  setCookie(name: string, value: string, days: number = 7, secure: boolean = false, sameSite: 'Strict' | 'Lax' | 'None' = 'Lax'): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    
    const secureFlag = secure ? '; Secure' : '';
    const sameSiteFlag = '; SameSite=' + sameSite;
    const httpOnlyFlag = ''; // Note: HttpOnly can't be set from JavaScript for security reasons
    
    // Encode the value to handle special characters
    const encodedValue = encodeURIComponent(value);
    
    document.cookie = `${name}=${encodedValue}${expires}; path=/${secureFlag}${sameSiteFlag}${httpOnlyFlag}`;
  }

  getCookie(name: string): string | null {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        // Decode the value that was encoded when setting
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  deleteCookie(name: string): void {
    this.setCookie(name, '', -1);
  }

  clearAllCookies(): void {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      this.deleteCookie(name.trim());
    }
  }
}
