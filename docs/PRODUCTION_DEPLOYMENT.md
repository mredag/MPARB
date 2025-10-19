# Production Deployment Checklist

**System Status**: ✅ **READY FOR PRODUCTION DEPLOYMENT**
**Last Updated**: October 19, 2025

---

## 🎯 Pre-Deployment Verification

### ✅ **Completed Requirements**
- ✅ All 8 workflows imported and activated
- ✅ Database schema created and validated
- ✅ Environment variables configured
- ✅ Webhook POST method configuration resolved
- ✅ End-to-end message flow tested (7/8 tests passing)
- ✅ Turkish language standards implemented
- ✅ Correlation ID tracking functional
- ✅ Error handling and logging operational

### ⚠️ **Pre-Deployment Actions Required**
1. **Resolve Processor Response Issue**
   - Investigate OpenAI API connectivity
   - Verify processor workflow execution
   - Test response generation

2. **Add Correlation ID Tracking to Senders**
   - Update sender workflows with correlation logging
   - Validate complete audit trail

---

## 🚀 Production Deployment Steps

### **Phase 1: Infrastructure Setup**

#### 1.1 Server Provisioning
- [ ] **Choose hosting platform** (VPS, AWS, DigitalOcean, etc.)
- [ ] **Minimum requirements**: 2 CPU cores, 4GB RAM, 20GB storage
- [ ] **Operating system**: Ubuntu 20.04+ or similar Linux distribution
- [ ] **Install Docker and Docker Compose**

#### 1.2 Domain and SSL Configuration
- [ ] **Register domain name** or configure subdomain
- [ ] **Configure DNS A record** pointing to server IP
- [ ] **Install SSL certificate** (Let's Encrypt recommended)
- [ ] **Verify HTTPS access** to domain

#### 1.3 Security Configuration
- [ ] **Configure firewall** (allow ports 80, 443, 22)
- [ ] **Set up SSH key authentication**
- [ ] **Disable password authentication**
- [ ] **Configure fail2ban** for intrusion prevention

### **Phase 2: Application Deployment**

#### 2.1 Code Deployment
```bash
# Clone repository to server
git clone <repository-url> /opt/multi-platform-auto-response
cd /opt/multi-platform-auto-response

# Copy and configure environment
cp .env.example .env
# Edit .env with production values
```

#### 2.2 Environment Configuration
Update `.env` file with production values:
```ini
# Production URLs
N8N_WEBHOOK_URL=https://your-production-domain.com
WEBHOOK_URL=https://your-production-domain.com

# Database (use strong password)
POSTGRES_PASSWORD=your-secure-production-password

# All other API keys remain the same
```

#### 2.3 Application Startup
```bash
# Start services
docker-compose up -d

# Import workflows
docker exec -u node -it multi_platform_n8n n8n import:workflow --separate --input=/app/workflows

# Activate workflows
docker exec -u node -it multi_platform_n8n n8n update:workflow --all --active=true

# Restart n8n
docker-compose restart n8n
```

### **Phase 3: Platform Configuration**

#### 3.1 Meta Developer Console (Instagram & WhatsApp)
- [ ] **Update Instagram webhook URL**: `https://your-domain.com/webhook/instagram-intake`
- [ ] **Update WhatsApp webhook URL**: `https://your-domain.com/webhook/whatsapp-intake`
- [ ] **Verify webhook endpoints** using Meta's webhook tester
- [ ] **Test message flow** with real Instagram/WhatsApp messages

#### 3.2 Google Business Profile (Optional)
- [ ] **Configure service account** if not already done
- [ ] **Test review polling** functionality
- [ ] **Verify response posting** to Google reviews

#### 3.3 Slack Integration (Optional)
- [ ] **Configure Slack webhook URL** in production .env
- [ ] **Test error alerting** functionality

### **Phase 4: Production Validation**

#### 4.1 System Health Checks
```bash
# Run integration validation
node scripts/validate_integration.js

# Run end-to-end tests
node scripts/test_end_to_end.js

# Check all services are running
docker-compose ps
```

#### 4.2 Live Message Testing
- [ ] **Send test Instagram DM** and verify response
- [ ] **Send test WhatsApp message** and verify response
- [ ] **Check database logging** for message records
- [ ] **Verify correlation ID tracking** end-to-end

#### 4.3 Performance Validation
- [ ] **Response time testing** (target: <10 seconds)
- [ ] **Concurrent message testing** (target: 10 concurrent)
- [ ] **Database performance** monitoring
- [ ] **Error handling** validation

---

## 🔧 Production Configuration Templates

### **Nginx Reverse Proxy Configuration**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### **Docker Compose Production Override**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  n8n:
    restart: unless-stopped
    environment:
      - N8N_HOST=your-domain.com
      - N8N_PROTOCOL=https
      - N8N_PORT=443
    
  postgres:
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups

volumes:
  postgres_data:
```

### **Systemd Service Configuration**
```ini
# /etc/systemd/system/multi-platform-auto-response.service
[Unit]
Description=Multi-Platform Auto Response System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/multi-platform-auto-response
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

---

## 📊 Production Monitoring

### **Health Check Endpoints**
- **n8n Health**: `https://your-domain.com/healthz`
- **Database Connection**: Monitor via application logs
- **Webhook Endpoints**: Test via Meta webhook tester

### **Log Monitoring**
```bash
# Application logs
docker-compose logs -f n8n

# Database logs
docker-compose logs -f postgres

# System logs
journalctl -u multi-platform-auto-response -f
```

### **Performance Metrics**
- **Response Time**: Target <10 seconds per message
- **Throughput**: Target 10 concurrent messages
- **Database Performance**: Monitor query execution times
- **Error Rate**: Target <1% error rate

---

## 🚨 Rollback Plan

### **Emergency Rollback Procedure**
1. **Stop current deployment**:
   ```bash
   docker-compose down
   ```

2. **Revert to previous version**:
   ```bash
   git checkout <previous-stable-commit>
   docker-compose up -d
   ```

3. **Restore database backup** if needed:
   ```bash
   docker exec -i multi_platform_postgres psql -U postgres -d multiplatform_auto_response < backup.sql
   ```

4. **Update platform webhooks** to previous URLs if changed

---

## ✅ **Post-Deployment Checklist**

### **Immediate (First 24 Hours)**
- [ ] **Monitor system logs** for errors
- [ ] **Test message processing** with real messages
- [ ] **Verify database logging** is working
- [ ] **Check response times** meet targets
- [ ] **Validate error handling** and alerting

### **Short-term (First Week)**
- [ ] **Performance optimization** based on real usage
- [ ] **Database backup automation** setup
- [ ] **Monitoring dashboard** configuration
- [ ] **Documentation updates** with production URLs

### **Long-term (First Month)**
- [ ] **Analytics and reporting** implementation
- [ ] **Capacity planning** based on usage patterns
- [ ] **Security audit** and hardening
- [ ] **Disaster recovery** testing

---

## 📞 **Support and Maintenance**

### **Regular Maintenance Tasks**
- **Weekly**: Review system logs and performance metrics
- **Monthly**: Update dependencies and security patches
- **Quarterly**: Full system backup and disaster recovery testing

### **Emergency Contacts**
- **System Administrator**: [Contact Information]
- **Development Team**: [Contact Information]
- **Platform Support**: Meta Developer Support, OpenAI Support

### **Documentation References**
- **System Architecture**: `docs/INTEGRATION_SUMMARY.md`
- **Environment Variables**: `docs/ENV_VARS.md`
- **Troubleshooting**: `docs/CURRENT_ISSUES.md`
- **API Documentation**: `docs/PRD.md`

---

**Deployment Checklist Completion**: ___/___
**Deployment Date**: ___________
**Deployed By**: ___________
**Production URL**: ___________