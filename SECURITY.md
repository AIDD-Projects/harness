# Security Policy

## Supported Versions

| Version | Supported          |
|---------| ------------------ |
| 0.9.x   | :white_check_mark: |
| 0.8.x   | :white_check_mark: |
| < 0.8   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in kode:harness, please report it responsibly:

1. **Do NOT open a public issue.**
2. Email details to the maintainers or use [GitHub Security Advisories](https://github.com/AIDD-Projects/harness/security/advisories/new).
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to provide a fix within 7 days for critical issues.

## Security Design

kode:harness is a **zero-dependency CLI tool** built on harness engineering principles and:
- Generates static markdown files only
- Does not make network requests
- Does not execute user code
- Does not access credentials or secrets
- Runs entirely locally with synchronous file I/O

The attack surface is minimal by design.
