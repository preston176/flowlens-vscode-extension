# Security Policy

FlowLens is being built with privacy and security at the forefront. This document explains how to report vulnerabilities and what to expect.

## Reporting a vulnerability

If you discover a security vulnerability, please **do not** open a public issue. Instead email security@flowlens.example (placeholder) with:

- A clear summary of the issue
- Steps to reproduce
- Impact assessment (what could an attacker access?)
- Any suggested mitigations or fixes

We will acknowledge your report within 3 business days and provide status updates as we investigate.

## What we care about

- Any vector that could leak user code or plaintext context data
- Weak or missing encryption in sync flows
- Privilege escalation or arbitrary code execution

## Disclosure timeline

We will aim to patch critical vulnerabilities promptly. Coordinated disclosure will be handled on a case-by-case basis if requested by the reporter.

## Security considerations

- FlowLens will be local-first. By default snapshots remain on the user's device.
- Optional sync uses client-side encryption; we will document the encryption design before enabling sync in production.
- FlowLens will not upload file contents. Metadata only.

## Contact

Email: security@flowlens.example (placeholder)
