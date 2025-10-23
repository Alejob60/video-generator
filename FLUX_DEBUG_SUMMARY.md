# FLUX Image Generation Service - Debugging Summary

## Correct Payload Format

To use the FLUX image generation endpoint, send a POST request to `/media/flux-image` with the following JSON payload:

```json
{
  "prompt": "Your image description here",
  "plan": "FREE|CREATOR|PRO",
  "size": "1024x1024|1024x768|768x1024"  // Optional
}
```

Example:
```json
{
  "prompt": "A beautiful sunset over the ocean",
  "plan": "PRO",
  "size": "1024x1024"
}
```

## Debugging Enhancements Implemented

The following debugging features have been added to intercept data before it goes to blob storage:

1. **Detailed Request Logging**:
   - Full payload sent to FLUX API
   - Response status and headers from FLUX API

2. **Response Structure Analysis**:
   - Keys in the FLUX API response
   - Presence of URL vs base64 data
   - Length of base64 data when provided

3. **Base64 Data Validation**:
   - Format validation using regex
   - Sample of first 100 characters for inspection
   - Size of decoded buffer

4. **PNG Header Validation**:
   - Verification of PNG file signature
   - Hex dump of header bytes for debugging

5. **File System Verification**:
   - Temporary file creation and size verification
   - File read-back verification
   - Cleanup confirmation

6. **Blob Storage Confirmation**:
   - Upload success confirmation
   - Final blob URL

## Test Results

The endpoint is working correctly with the enhanced logging. The image generation flow:
1. Receives request with prompt
2. Improves prompt with LLM service
3. Sends request to FLUX API
4. Receives base64 data (2.1MB in test case)
5. Validates and processes the data correctly
6. Uploads to Azure Blob Storage successfully
7. Returns the image URL to the client

## Troubleshooting Image Corruption

If images appear corrupted:
1. Check the base64 validation results in logs
2. Verify the PNG header validation
3. Confirm temporary file size matches decoded buffer size
4. Check Azure Blob Storage upload confirmation

The enhanced logging provides visibility into each step of the process to identify where corruption might occur.