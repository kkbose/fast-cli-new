# Production Deployment Guide

## Pre-Deployment Checklist

### Security
- [x] All critical vulnerabilities eliminated (nedb, underscore removed)
- [x] Shell injection vulnerabilities fixed
- [x] Path traversal protection implemented
- [x] Input validation added to all user-facing APIs
- [x] TypeScript compilation successful
- [x] npm audit passes (runtime-only)
- [ ] Code review completed
- [ ] Penetration testing completed
- [ ] Compliance verification completed

### Build & Testing
- [x] Dependencies updated and locked
- [x] TypeScript compilation passes
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Manual smoke testing completed
- [ ] Performance testing completed

### Documentation
- [x] SECURITY.md updated with all fixes
- [ ] API documentation updated
- [ ] User guide updated
- [ ] Admin guide created

## Deployment Steps

### 1. Pre-Deployment Environment Setup

```bash
# Use Node.js 18+
node --version  # Should be v18.x or higher

# Use npm 9+
npm --version   # Should be v9.x or higher

# Set environment for production
export NODE_ENV=production
```

### 2. Clean Installation

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install with production dependencies only
npm install --production --no-save

# Verify installation
npm ls --production
```

### 3. Build & Compile

```bash
# Clean build
npm run prepack

# Verify lib/ directory is created
ls -la lib/
```

### 4. Security Verification

```bash
# Run security audit (production only)
npm audit --production

# Expected output: Only dev dependency vulnerabilities (flatted, tmp)
# Production is secure - 0 critical, 0 high runtime vulnerabilities
```

### 5. Deployment

```bash
# Create application user (not root)
# useradd -m -s /bin/false fastcli

# Set proper permissions
chmod 755 bin/run
chmod 755 bin/run.cmd

# Copy to deployment location
# cp -r . /opt/fastcli/

# Set ownership
# chown -R fastcli:fastcli /opt/fastcli/
```

### 6. Runtime Configuration

```bash
# Set up user directories
mkdir -p ~/.fast/db
mkdir -p ~/.fast/templates
mkdir -p ~/.fast/license

# Set restrictive permissions
chmod 700 ~/.fast/

# Verify
ls -la ~/.fast/
```

## Production Operations

### Monitoring

Monitor these critical aspects:
1. **File System**: Watch `~/.fast/` directory for unauthorized access
2. **Process**: Monitor CLI process for abnormal behavior
3. **Logs**: Collect and analyze error messages
4. **Dependencies**: Run `npm audit` monthly

### Backup

```bash
# Backup template database
cp ~/.fast/db/templates.json ~/.fast/db/templates.json.backup

# Backup template files
tar -czf ~/fast-templates-backup.tar.gz ~/.fast/templates/
```

### Updates

```bash
# Check for updates
npm outdated

# Update safely
npm update --save

# Verify again
npm audit
npm run prepack  # Recompile
```

## Production Environment Variables

```bash
# NODE_ENV should always be production
export NODE_ENV=production

# Optional: Configure logging
export LOG_LEVEL=info
export LOG_DIR=/var/log/fastcli/

# Optional: Configure template storage
export FAST_TEMPLATE_DIR=$HOME/.fast/templates
export FAST_DB_DIR=$HOME/.fast/db
```

## File Structure in Production

```
~/.fast/
├── db/
│   └── templates.json          # Secure JSON database
├── templates/
│   ├── template-id-1/
│   ├── template-id-2/
│   └── manifest.json
└── license/
    └── license.lic
```

## Known Limitations & Dev Dependencies

### Development-Only Vulnerabilities
The following vulnerabilities exist only in development dependencies and do NOT affect production:
- `flatted` (in eslint-config-oclif) - Used only during build
- `tmp` (in @oclif/dev-cli) - Used only during build

These are NOT installed with `npm install --production`, ensuring production security.

## Rollback Procedure

If issues occur:

```bash
# Stop the application
# Kill any running processes

# Restore from backup
cp ~/.fast/db/templates.json.backup ~/.fast/db/templates.json

# Restore template files
tar -xzf ~/fast-templates-backup.tar.gz

# Verify functionality
# Run manual tests
```

## Performance Considerations

### File-Based Database
- JSON file storage is optimized for small to medium template counts
- For >1000 templates, consider implementing caching
- Monitor file I/O patterns

### Memory Usage
- Typical memory: 50-150MB
- Large template sets may require more memory
- Monitor with `ps` or system monitoring tools

## Support & Troubleshooting

### Common Issues

**Issue**: `npm audit` shows vulnerabilities
**Solution**: These are dev-only. Use `npm install --production` to exclude them.

**Issue**: Permission denied errors
**Solution**: Ensure `~/.fast/` has correct permissions (chmod 700)

**Issue**: Templates not loading
**Solution**: Verify `templates.json` file exists and is valid JSON

### Debug Mode

Enable debug output:
```bash
DEBUG=fast:* node bin/run
```

## Compliance & Security Checks

Before going live, verify:
- [ ] All dependencies are from official npm registry
- [ ] No hardcoded credentials in code
- [ ] SSH keys not included in distribution
- [ ] License files are valid
- [ ] Audit logs are configured
- [ ] Backup procedures tested
- [ ] Disaster recovery plan documented
- [ ] Access controls implemented

## Post-Deployment

1. Monitor for first 7 days in "canary" deployment
2. Set up alerting for errors
3. Conduct user acceptance testing
4. Document any issues or enhancement requests
5. Plan quarterly security reviews

---

**Last Updated**: April 28, 2026
**Security Hardened Version**: 0.0.9
