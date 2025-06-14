# Shopify Storefront API Tokenless Access Support

## Overview

Based on the official Shopify Storefront API documentation, this MCP server now supports both **tokenless access** and **authenticated access** modes, providing flexibility for different use cases and deployment scenarios.

## Tokenless Access Capabilities

According to the [official Shopify documentation](https://shopify.dev/docs/api/storefront/unstable#authentication), the Storefront API supports tokenless access with the following capabilities:

### ✅ Supported Features (No API Token Required)
- **Products and Collections**: Full access to product catalog and collection data
- **Search**: Complete search functionality across products
- **Selling Plans**: Access to subscription and selling plan information
- **Pages, Blogs, and Articles**: Content management system data
- **Cart Operations**: Full cart management (create, read, update, delete)

### ❌ Restricted Features (Require Authentication)
- **Product Tags**: Accessing product tags requires an access token
- **Metaobjects and Metafields**: Custom fields and objects need authentication
- **Menu**: Online Store navigation menus require tokens
- **Customers**: Customer data access requires customer authentication

### ⚠️ Limitations
- **Query Complexity**: Limited to 1,000 points per query (vs higher limits with tokens)
- **Advanced Features**: Some advanced e-commerce features require authentication

## Implementation Details

### Code Changes Made

1. **Optional Token Validation**: Modified the server initialization to warn instead of exit when no token is provided
2. **Conditional Headers**: GraphQL client now conditionally includes the access token header
3. **Dynamic Queries**: Product-related queries dynamically exclude `tags` field when running in tokenless mode
4. **Response Formatting**: Product response objects conditionally include tags based on authentication status

### Affected Tools

The following tools have been updated to support tokenless access:

- `get-products`: Now works without tokens, excludes tags in tokenless mode
- `get-product-by-handle`: Same as above
- `get-collection-by-handle`: Products within collections exclude tags in tokenless mode
- `search-products`: Fully functional in tokenless mode
- `create-cart`, `get-cart`, `add-cart-lines`, `update-cart-lines`, `remove-cart-lines`: All cart operations work without tokens

### Tools Requiring Authentication

- `get-customer`: Requires customer access token (as documented)

## Usage Examples

### Tokenless Mode Setup
```bash
# Environment setup - only store domain required
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com

# Start server
npm start
```

### Authenticated Mode Setup
```bash
# Environment setup - includes access token
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token

# Start server  
npm start
```

### Claude Desktop Configuration

**Tokenless Mode:**
```json
{
  "mcpServers": {
    "shopify-storefront": {
      "command": "node",
      "args": [
        "/path/to/dist/index.js",
        "--storeDomain", 
        "your-store.myshopify.com"
      ]
    }
  }
}
```

**Authenticated Mode:**
```json
{
  "mcpServers": {
    "shopify-storefront": {
      "command": "node", 
      "args": [
        "/path/to/dist/index.js",
        "--storefrontAccessToken",
        "your_storefront_access_token",
        "--storeDomain",
        "your-store.myshopify.com"
      ]
    }
  }
}
```

## Benefits

### For Developers
- **Rapid Prototyping**: Start building immediately without API token setup
- **Reduced Barriers**: No need for Shopify developer account for basic functionality
- **Testing**: Easy testing and development without authentication overhead

### For Production Use
- **Gradual Migration**: Can start with tokenless access and upgrade to authenticated when needed
- **Feature Segmentation**: Use tokenless for public features, authenticated for advanced functionality
- **Compliance**: Easier compliance for basic catalog browsing vs customer data access

## Documentation References

- [Shopify Storefront API Authentication](https://shopify.dev/docs/api/storefront/unstable#authentication)
- [Building with the Storefront API](https://shopify.dev/storefronts/headless/building-with-the-storefront-api)
- [Shopify API Rate Limits](https://shopify.dev/api/usage/rate-limits#storefront-api-rate-limits)

## Version History

- **v1.0.0**: Initial release with authenticated access only
- **v1.1.0**: Added tokenless access support with feature parity for supported operations
