# Rate Limiting Documentation

This document explains how to use the rate limiting system implemented in this Express application.

## Overview

The application uses `express-rate-limit` middleware to prevent abuse and ensure fair usage of the API. Different types of endpoints have different rate limiting rules based on their sensitivity and expected usage patterns.

## Rate Limiting Configuration

### Available Rate Limiters

1. **General Limiter** - Applied to all routes
   - Production: 100 requests per 15 minutes
   - Development: 1000 requests per 15 minutes

2. **Auth Limiter** - Applied to authentication routes
   - Production: 5 requests per 15 minutes
   - Development: 50 requests per 15 minutes

3. **API Limiter** - Applied to general API routes
   - Production: 200 requests per 15 minutes
   - Development: 2000 requests per 15 minutes

4. **Strict Limiter** - Applied to sensitive operations (login, register, password change)
   - Production: 3 requests per hour
   - Development: 30 requests per hour

5. **Upload Limiter** - For file upload operations
   - Production: 10 requests per hour
   - Development: 100 requests per hour

6. **Email Limiter** - For email sending operations
   - Production: 5 requests per hour
   - Development: 50 requests per hour

7. **Password Reset Limiter** - For password reset operations
   - Production: 3 requests per hour
   - Development: 30 requests per hour

## Usage Examples

### Basic Usage

```javascript
import rateLimiter from '../middleware/rateLimiter.js';

// Apply general rate limiting to a route
app.use('/api', rateLimiter.general);

// Apply auth rate limiting to authentication routes
app.use('/api/auth', rateLimiter.auth);

// Apply strict rate limiting to sensitive operations
app.post('/api/auth/login', rateLimiter.strict, loginController);
```

### Custom Rate Limiter

```javascript
import { createCustomLimiter } from '../middleware/rateLimiter.js';

// Create a custom rate limiter
const customLimiter = createCustomLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 50, // 50 requests per 30 minutes
  message: {
    error: 'Custom rate limit exceeded',
    retryAfter: '30 minutes'
  }
});

app.use('/api/custom', customLimiter);
```

### Specific Route Protection

```javascript
import { strictLimiter, emailLimiter } from '../middleware/rateLimiter.js';

// Protect sensitive routes
router.post('/login', strictLimiter, loginController);
router.post('/register', strictLimiter, registerController);
router.post('/change-password', strictLimiter, changePasswordController);

// Protect email routes
router.post('/send-email', emailLimiter, sendEmailController);
router.post('/forgot-password', emailLimiter, forgotPasswordController);
```

## Configuration

### Environment-based Settings

The rate limiting configuration automatically adjusts based on the environment:

- **Production**: Strict limits for security
- **Development**: More lenient limits for easier development
- **Test**: Rate limiting is disabled

### Customizing Limits

To modify rate limiting settings, edit `config/rateLimitConfig.js`:

```javascript
// Example: Modify the general rate limiter
general: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.NODE_ENV === 'production' ? 100 : 1000,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  }
}
```

### Trusted IPs

You can configure trusted IPs that bypass rate limiting:

```javascript
// In config/rateLimitConfig.js
const trustedIPs = [
  '127.0.0.1', // localhost
  '192.168.1.100', // trusted server
];
```

## Response Format

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": "15 minutes",
  "limit": 100,
  "windowMs": 900000
}
```

## Headers

Rate limiting information is included in response headers:

- `RateLimit-Limit`: The rate limit ceiling for that given endpoint
- `RateLimit-Remaining`: The number of requests left for the time window
- `RateLimit-Reset`: The time at which the rate limit resets, in UTC epoch seconds

## Best Practices

### 1. Layer Rate Limiting

Apply multiple layers of rate limiting:

```javascript
// General rate limiting for all routes
app.use(rateLimiter.general);

// Specific rate limiting for API routes
app.use('/api', rateLimiter.api);

// Strict rate limiting for sensitive operations
app.use('/api/auth/login', rateLimiter.strict);
```

### 2. Different Limits for Different Operations

Use appropriate limits based on the operation:

- **Read operations**: Higher limits (200-1000 per hour)
- **Write operations**: Medium limits (50-200 per hour)
- **Sensitive operations**: Low limits (3-10 per hour)

### 3. Monitor and Adjust

Monitor rate limiting metrics and adjust limits based on:

- Normal usage patterns
- Attack patterns
- Server capacity
- User experience

### 4. Error Handling

Implement proper error handling for rate limit exceeded responses:

```javascript
// Client-side handling
if (response.status === 429) {
  const retryAfter = response.headers['retry-after'];
  console.log(`Rate limit exceeded. Retry after: ${retryAfter}`);
}
```

## Troubleshooting

### Common Issues

1. **Rate limit too strict**: Users getting blocked during normal usage
   - Solution: Increase the limit or window size
   - Check if the limit is appropriate for the endpoint

2. **Rate limit too lenient**: Still experiencing abuse
   - Solution: Decrease the limit or window size
   - Consider implementing additional security measures

3. **Development issues**: Rate limiting interfering with development
   - Solution: Use environment-based configuration
   - Add your development IP to trusted IPs list

### Debugging

Enable logging to debug rate limiting issues:

```javascript
// Add logging to rate limit handler
handler: (req, res) => {
  console.log(`Rate limit exceeded for IP: ${req.ip}, Route: ${req.path}`);
  res.status(429).json({
    success: false,
    message: config.message.error,
    retryAfter: config.message.retryAfter
  });
}
```

## Security Considerations

1. **IP Spoofing**: Be aware that IP addresses can be spoofed
2. **Distributed Attacks**: Consider using a distributed rate limiting solution for multiple servers
3. **Bypass Attempts**: Monitor for attempts to bypass rate limiting
4. **Legitimate Traffic**: Ensure legitimate users aren't affected by rate limiting

## Performance Impact

Rate limiting has minimal performance impact:

- Memory usage scales with the number of unique IPs
- CPU overhead is negligible
- Consider using Redis for distributed applications

## Integration with Other Security Measures

Rate limiting works best when combined with:

- Input validation
- Authentication and authorization
- HTTPS enforcement
- CORS configuration
- Security headers
- Request logging and monitoring