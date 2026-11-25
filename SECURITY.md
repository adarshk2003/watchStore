# Security Policy

## Reporting Security Issues

We take the security of Clyro Watches and our users' data seriously. If you discover a security vulnerability, please do not disclose it publicly or open a public issue.

### Contact
Please send vulnerability reports directly to the maintainers or security contact with:
- Detailed steps to reproduce the issue
- Potential impact and affected endpoints
- A proof of concept (if applicable)

### Security Practices
- **Authentication**: JWT-based bearer authentication with cryptographically hashed passwords (`bcryptjs`).
- **Authorization**: Role-based access control protecting customer, seller, and administrator capabilities.
- **Data Protection**: Sensitive environment variables and secrets are kept in isolated runtime configurations and excluded from version control.
