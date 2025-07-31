# Cookie-Based Authentication Implementation

This document explains the cookie-based authentication system implemented in the inLine frontend application.

## Overview

The authentication system has been updated to store JWT tokens in cookies instead of localStorage for enhanced security.

## Security Benefits

### Why Cookies over localStorage?

1. **XSS Protection**: Cookies can be configured with security flags that localStorage cannot
2. **Automatic Management**: Cookies are automatically handled by the browser
3. **SameSite Protection**: Prevents CSRF attacks when properly configured
4. **Secure Flag**: Ensures cookies are only sent over HTTPS in production
5. **Expiration**: Built-in expiration mechanism

## Implementation Details

### Cookie Configuration

- **Token Cookie**: `inLine_auth_token`
  - Contains the JWT authentication token
  - Set with `Secure` flag in production (HTTPS only)
  - `SameSite=Lax` for CSRF protection
  - 7-day expiration

- **Vendor Data Cookie**: `inLine_vendor_data`
  - Contains non-sensitive vendor information
  - Not marked as secure (contains no sensitive data)
  - `SameSite=Lax` for CSRF protection
  - 7-day expiration

### Services

#### CookieService
```typescript
setCookie(name, value, days, secure, sameSite)
getCookie(name)
deleteCookie(name)
clearAllCookies()
```

#### AuthService Updates
- `storeAuthData()`: Stores token and vendor data in cookies
- `clearAuthData()`: Removes authentication cookies
- `getToken()`: Retrieves token from cookies
- Constructor: Initializes from existing cookies

### HTTP Interceptor

The `AuthInterceptor` automatically adds Bearer tokens to all API requests:
- Reads token from cookies via `AuthService.getToken()`
- Adds `Authorization: Bearer <token>` header
- Only applies to API requests (matching `environment.apiUrl`)

## Security Features

1. **Encoding**: Cookie values are URL-encoded to handle special characters
2. **Production Security**: Secure flag enabled only in production environment
3. **SameSite Protection**: Prevents cross-site request forgery
4. **Automatic Cleanup**: Invalid tokens are automatically cleared
5. **Error Handling**: Graceful handling of corrupted cookie data

## Usage

### Login/Register
```typescript
// Automatically stores token in secure cookies
this.authService.login(credentials).subscribe(response => {
  // Token is now stored in cookies
});
```

### API Calls
```typescript
// HTTP interceptor automatically adds auth headers
this.http.get('/api/assets/vendor/1').subscribe(data => {
  // Request includes: Authorization: Bearer <token>
});
```

### Logout
```typescript
// Automatically clears all authentication cookies
this.authService.logout();
```

## Migration from localStorage

The system automatically handles migration:
1. New logins store data in cookies
2. Existing localStorage data is ignored
3. Users will need to re-authenticate once

## Production Considerations

1. **HTTPS Required**: Secure cookies only work over HTTPS in production
2. **Domain Configuration**: Ensure cookies are set for the correct domain
3. **Expiration**: Tokens expire after 7 days (configurable)
4. **Server Configuration**: Backend must handle CORS with credentials

## Development vs Production

- **Development**: Cookies work over HTTP (Secure=false)
- **Production**: Cookies require HTTPS (Secure=true)
- Environment detection is automatic based on `environment.production`
