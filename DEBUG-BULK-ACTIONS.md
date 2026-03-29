# Bulk Actions Debugging Guide

## Issues Fixed

### 1. Missing Service Methods ✅
Added to `CloudinaryAdminService.php`:
- `deleteAssets()` - Delete multiple assets at once
- `renameAsset()` - Rename/move assets to folders
- `replaceTags()` - Replace all tags on assets

### 2. Service Reference Issue
The `BulkActionsController` was calling `cloudinary_admin.admin` but should call `cloudinary_admin.service`.

## Testing Steps

### Manual Browser Test

1. **Navigate to Asset Browser**
   ```
   https://cloudinary-test-d11.ddev.site/admin/content/cloudinary/assets
   ```

2. **Open Browser Console** (F12)
   - Check for JavaScript errors
   - Monitor network requests

3. **Test Checkbox Selection**
   - Hover over an asset card
   - Checkbox should appear in top-left corner
   - Click checkbox
   - Toolbar should slide down from top

4. **Test Bulk Actions**
   - Select 2-3 assets
   - Click "Add Tags" button
   - Enter tags in prompt: `test,debug`
   - Check console for AJAX request
   - Look for success/error toast

### Common Errors to Check

1. **JavaScript Errors**
   - `drupalSettings.cloudinary_admin is undefined`
   - `Cannot read property 'csrf_token'`
   - `fetch is not defined`

2. **AJAX Errors**
   - 404: Route not found
   - 403: Permission denied
   - 500: Server error (check PHP logs)

3. **Service Errors**
   - Method not found
   - Invalid Cloudinary credentials
   - API rate limits

### Debug Commands

```bash
# Check PHP error logs
ddev logs | grep -i error

# Check if route exists
ddev drush route:debug cloudinary_admin.bulk_action

# Test service directly
ddev drush php-eval "\\Drupal::service('cloudinary_admin.service')->addTags(['test'], ['debug-tag']);"

# Clear cache
ddev drush cr
```

### Expected Network Request

When clicking "Add Tags":

**Request:**
```
POST /admin/content/cloudinary/bulk-action
Content-Type: application/json

{
  "operation": "add_tags",
  "public_ids": ["asset1", "asset2"],
  "tags": ["test", "debug"]
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully added tags to 2 asset(s)",
  "count": 2
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Next Steps

1. Fix service reference in BulkActionsController
2. Test each bulk action individually
3. Add error handling for edge cases
4. Test with actual Cloudinary assets
