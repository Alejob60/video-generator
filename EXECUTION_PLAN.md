# 🚀 EXECUTION PLAN - FLUX Image Generation Testing

## ⚡ IMMEDIATE ACTION PLAN

### Current Status
- **Docker Build:** 95% complete (~2-3 minutes remaining)
- **Code:** ✅ 100% ready
- **Test Scripts:** ✅ Ready to execute
- **Environment:** ✅ Configured

---

## 📋 STEP-BY-STEP EXECUTION

### Step 1: Verify Build Complete ✅ (2 min)
```powershell
# Check if image exists
docker images video-converter:local
```

**Expected Output:**
```
REPOSITORY          TAG       SIZE
video-converter     local     ~1.2GB
```

---

### Step 2: Start Container & Auto-Test ✅ (5 min)
```powershell
.\start-and-test.ps1
```

**What it does:**
1. ✅ Stops any existing test container
2. ✅ Starts new container on port 4000
3. ✅ Waits 30 seconds for service startup
4. ✅ Checks health endpoint
5. ✅ Automatically runs `test-local-3-modes.ps1`

---

### Step 3: Verify Test Results ✅ (Manual verification)

**Expected Successful Output:**

```
============================================
  TEST 1: DALL-E ONLY (useFlux: false)
============================================
✅ SUCCESS!
   Image URL: https://realculturestorage.blob.core.windows.net/images/promo_xxx.png

============================================
  TEST 2: FLUX ONLY (useFlux: true)
============================================
✅ SUCCESS!
   Image URL: https://realculturestorage.blob.core.windows.net/images/flux-image-xxx.png

============================================
  TEST 3: DUAL (DALL-E + FLUX Kontext Pro)
============================================
✅ SUCCESS!
   DALL-E URL (promo): https://...dall-e...
   FLUX URL (flux): https://...flux-kontext...

🎯 VALIDATION: ✅ Both URLs present!

============================================
  TEST 4: SIMPLE FLUX 2 PRO
============================================
✅ SUCCESS!
   Image URL: https://realculturestorage.blob.core.windows.net/images/flux-2-pro-xxx.png
```

---

## ✅ SUCCESS CRITERIA (ALL MUST PASS)

### Critical Tests:
- [ ] **DALL-E mode** returns valid imageUrl
- [ ] **FLUX mode** returns valid imageUrl  
- [ ] **Dual mode** returns BOTH URLs in JSON
- [ ] **FLUX 2 Pro** returns valid imageUrl

### JSON Format Validation:
```json
// Standard endpoints
{
  "success": true,
  "data": {
    "imageUrl": "https://..."
  }
}

// Dual endpoint
{
  "promo": "https://...dall-e...",
  "flux": "https://...flux-kontext..."
}
```

---

## 🔧 IF TESTS FAIL

### Scenario 1: Container won't start
```powershell
# Check logs
docker logs video-converter-test

# Common fix: Missing env vars
docker run -d --name video-converter-test -p 4000:8080 --env-file .env video-converter:local
```

### Scenario 2: Service not responding
```powershell
# Wait longer
Start-Sleep -Seconds 60

# Check again
curl http://localhost:4000/health
```

### Scenario 3: Endpoint returns error
```powershell
# Check detailed logs
docker logs -f video-converter-test

# Look for specific errors:
# - Environment variables missing
# - API key invalid
# - Network timeout
```

---

## 🎯 POST-TEST ACTIONS

### If ALL tests pass ✅:
1. Deploy to Azure immediately:
   ```powershell
   .\deploy-flux-update.ps1
   ```

2. Verify Azure deployment:
   ```powershell
   .\test-azure-quick.ps1
   ```

3. Monitor logs:
   ```powershell
   az webapp log tail --name video-converter --resource-group realculture-rg
   ```

### If SOME tests fail ❌:
1. Review error logs
2. Fix identified issues
3. Rebuild and retest:
   ```powershell
   docker build -t video-converter:local .
   .\start-and-test.ps1
   ```

---

## ⏱️ ESTIMATED TIMELINE

| Phase | Duration | Status |
|-------|----------|--------|
| Docker Build | 10 min | 🔄 95% complete |
| Container Startup | 1 min | ⏳ Pending |
| Service Initialization | 30 sec | ⏳ Pending |
| Test Execution | 2-3 min | ⏳ Pending |
| **TOTAL** | **~15 min** | **In Progress** |

---

## 📞 COMMUNICATION PROTOCOL

### For Stakeholders:
**Status Update:** "Multi-mode image generation system completing local validation. All services implemented. Docker build finalizing. Automated test suite ready for execution. Deployment to production imminent."

### Technical Team:
**Current Phase:** T-3 (Testing phase 3 of 4)
- T-1: Code implementation ✅ COMPLETE
- T-2: Docker build ✅ 95% COMPLETE  
- T-3: Local testing ⏳ IN PROGRESS
- T-4: Azure deployment ⏳ PENDING

---

## 🎯 READY-TO-RUN COMMANDS

### Quick Start (After build completes):
```powershell
# One command to do everything
.\start-and-test.ps1
```

### Manual Step-by-Step:
```powershell
# 1. Build (if needed)
docker build -t video-converter:local .

# 2. Run container
docker run -d --name video-converter-test -p 4000:8080 --env-file .env video-converter:local

# 3. Wait 30 seconds
Start-Sleep -Seconds 30

# 4. Test
.\test-local-3-modes.ps1

# 5. Check results
docker logs -f video-converter-test
```

---

**Last Updated:** 2026-03-08  
**Status:** 🔄 EXECUTING  
**Next Action:** Execute `.\start-and-test.ps1` when build completes
