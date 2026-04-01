# Security Review Checklist

## Critical Issues (Must Fix)

- **No hardcoded secrets**: API keys, tokens, passwords, or connection strings must never appear in source code. Check for patterns like `sk-`, `pk_`, `api_key=`, `password=`, `secret=`. Even placeholder values like `YOUR_API_KEY` are problematic because users may deploy without replacing them.
- **No eval() or Function()**: Dynamic code execution is a direct injection vector. There is no legitimate use case in a landing page.
- **No unsanitized innerHTML**: Using `dangerouslySetInnerHTML` in React or `.innerHTML` in vanilla JS without sanitization enables XSS attacks. If dynamic HTML is unavoidable, use DOMPurify.
- **No SQL string concatenation**: Any database queries must use parameterized statements, never string interpolation or concatenation.

## High Severity Issues

- **External links need rel="noopener noreferrer"**: Links with `target="_blank"` without these attributes expose the page to tabnapping attacks where the opened page can redirect the opener.
- **No sensitive data in localStorage**: Authentication tokens, personal data, and session information should not be stored in localStorage (accessible to any script on the domain). Use httpOnly cookies for auth tokens.
- **No console.log with sensitive data**: Logging user data, tokens, or API responses to the console exposes information in production.
- **No inline event handlers**: `onclick="..."` attributes bypass Content Security Policy protections.

## Medium Severity Issues

- **Content Security Policy**: Generated pages should include CSP meta tags restricting script sources to self and trusted CDNs (Google Fonts, GSAP CDN).
- **X-Frame-Options**: Prevent clickjacking by including `<meta http-equiv="X-Frame-Options" content="DENY">` or using CSP frame-ancestors.
- **Subresource Integrity**: External scripts loaded from CDNs should include `integrity` attributes with SHA-384 hashes.

## GDPR Compliance

Cookie consent must be implemented before any analytics or tracking scripts execute. A privacy policy link must be present in the footer. No personally identifiable information should appear in URL parameters. Contact forms must include a data processing consent notice.
