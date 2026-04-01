# EU GDPR Compliance for Generated Websites

## Cookie Consent

No analytics, tracking, or marketing cookies may be set before the user gives explicit consent. This means no Google Analytics, Facebook Pixel, Hotjar, or similar tools loading on page load. Implement a cookie consent banner that appears on first visit with clear options: "Accept all", "Reject all", and "Customize". The reject option must be equally prominent as accept — no dark patterns. Consent must be stored and respected across sessions.

## Privacy Policy

Every generated website must include a link to a privacy policy in the footer. The privacy policy should cover: what data is collected, why it is collected (legal basis), how long it is retained, who it is shared with, and how users can exercise their rights (access, rectification, erasure, portability). For generated sites, include a placeholder privacy policy page or link with clear instructions for the site owner to customize.

## Data in URLs and Forms

Never include personally identifiable information (PII) in URL parameters — it gets logged in server access logs, browser history, and analytics. Form data should be sent via POST, never GET. Contact forms must include a visible notice about data processing: "By submitting this form, you consent to us processing your data to respond to your inquiry. See our Privacy Policy for details."

## Data Residency

For EU-targeted websites, data should be processed and stored within the EU. When recommending third-party services (analytics, fonts, CDNs), prefer EU-based or GDPR-compliant providers. Google Fonts can be self-hosted to avoid sending visitor IPs to Google servers. Mention this as a recommendation in generated projects.

## Rights of Data Subjects

Include a contact email or form for data subject requests in the privacy policy. EU residents have the right to access, correct, delete, and port their data. Response time: 30 days maximum. These requirements apply to any website that processes data of EU residents, regardless of where the business is located.
