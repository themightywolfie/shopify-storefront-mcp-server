# Shopify Storefront MCP Server

A Model Context Protocol (MCP) server for interacting with the Shopify Storefront API. This server enables seamless integration with Shopify storefronts through GraphQL queries, providing access to products, collections, search functionality, and cart operations with both **authenticated** and **tokenless access** support.

## Features

- **Product Management**: Fetch products with advanced filtering and sorting
- **Collection Management**: Access and browse product collections  
- **Search Functionality**: Powerful product search with filters
- **Cart Operations**: Create, manage, and modify shopping carts
- **Tokenless Access**: Works without API tokens for core features (limited functionality)
- **Authenticated Access**: Full feature set with Storefront API access token
- **Storefront Integration**: Direct integration with Shopify's Storefront API
- **Environment Support**: Works in both local development and remote deployment (Smithery)

## Access Modes

### 🔓 Tokenless Access (No API Token Required)
**Supported Features:**
- ✅ Products and Collections (without tags)
- ✅ Search functionality  
- ✅ Pages, Blogs, and Articles
- ✅ Cart operations (read/write)
- ⚠️ Query complexity limited to 1,000 points

**Limitations:**
- ❌ Product Tags
- ❌ Metaobjects and Metafields
- ❌ Menu (Online Store navigation)
- ❌ Customer data access

### 🔑 Authenticated Access (API Token Required)
**Full Feature Set:**
- ✅ All tokenless features PLUS:
- ✅ Product Tags
- ✅ Metaobjects and Metafields
- ✅ Menu (Online Store navigation)  
- ✅ Customer data access (with customer token)
- ✅ Higher query complexity limits

## Prerequisites

1. Node.js (version 18 or higher)
2. A Shopify store 
3. **Optional**: Storefront API access token (for full functionality)

## Shopify Setup

### Option 1: Tokenless Mode (Quick Start)
No setup required! Just provide your store domain:
```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
```

### Option 2: Authenticated Mode (Full Features)

#### Get Your Storefront API Access Token

1. Go to your Shopify admin panel
2. Navigate to **Apps** > **Develop apps**
3. Click **Create an app** or select an existing app
4. Go to **Configuration** > **Storefront API access**
5. Enable **Storefront API access**
6. Select the required scopes:
   - `unauthenticated_read_product_listings`
   - `unauthenticated_read_product_inventory` 
   - `unauthenticated_read_product_tags`
   - `unauthenticated_read_collection_listings`
   - `unauthenticated_write_checkouts` (for cart operations)
   - `unauthenticated_read_checkouts` (for cart operations)
7. Click **Save** and then **Install app**
8. Copy the **Storefront access token**

## Installation

### Local Development

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. **Quick Setup** (recommended):
   ```bash
   npm run setup
   ```
   This interactive script will help you create the `.env` file.   **Or manually create** a `.env` file with your credentials:
   
   **Tokenless Mode (Core Features):**
   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   ```
   
   **Authenticated Mode (Full Features):**
   ```env
   SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
   SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_storefront_access_token
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the server:
   ```bash
   npm start
   ```

### Claude Desktop Integration

Add this configuration to your Claude Desktop config file:

**Location:**
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

**Configuration:**

**Tokenless Mode:**
```json
{
  "mcpServers": {
    "shopify-storefront": {
      "command": "node",
      "args": [
        "/absolute/path/to/shopify-storefront-mcp-server/dist/index.js",
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
        "/absolute/path/to/shopify-storefront-mcp-server/dist/index.js",
        "--storefrontAccessToken",
        "your_storefront_access_token",
        "--storeDomain", 
        "your-store.myshopify.com"
      ]
    }
  }
}
```

### Remote Deployment (Smithery)

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to your preferred hosting service
3. Configure environment variables:
   - `SHOPIFY_STORE_DOMAIN`
   - `SHOPIFY_STOREFRONT_ACCESS_TOKEN`

## Available Tools

### Product Management

1. **get-products**
   - Fetch multiple products with filtering and sorting
   - Parameters:
     - `first` (optional, default: 10): Number of products to fetch
     - `query` (optional): Search query to filter products
     - `sortKey` (optional): Sort by TITLE, PRICE, CREATED_AT, etc.
     - `reverse` (optional): Reverse sort order

2. **get-product-by-handle**
   - Get detailed information about a specific product
   - Parameters:
     - `handle` (required): Product handle/slug

### Collection Management

3. **get-collections**
   - Fetch multiple collections
   - Parameters:
     - `first` (optional, default: 10): Number of collections to fetch
     - `query` (optional): Search query to filter collections
     - `sortKey` (optional): Sort by TITLE, UPDATED_AT, etc.
     - `reverse` (optional): Reverse sort order

4. **get-collection-by-handle**
   - Get detailed information about a specific collection
   - Parameters:
     - `handle` (required): Collection handle/slug
     - `productsFirst` (optional, default: 10): Number of products to include

### Search

5. **search-products**
   - Advanced product search with filters
   - Parameters:
     - `query` (required): Search query
     - `first` (optional, default: 10): Number of results
     - `sortKey` (optional): Sort by RELEVANCE, PRICE, etc.
     - `reverse` (optional): Reverse sort order
     - `productFilters` (optional): Additional filters for availability, price range, etc.

### Cart Management

6. **create-cart**
   - Create a new shopping cart
   - Parameters:
     - `lines` (optional): Initial cart lines with merchandise ID and quantity
     - `attributes` (optional): Custom cart attributes
     - `note` (optional): Cart note
     - `buyerIdentity` (optional): Buyer information

7. **get-cart**
   - Retrieve cart details by cart ID
   - Parameters:
     - `cartId` (required): Cart ID (e.g., "gid://shopify/Cart/123")

8. **add-cart-lines**
   - Add items to an existing cart
   - Parameters:
     - `cartId` (required): Cart ID
     - `lines` (required): Array of items to add with merchandise ID and quantity

9. **update-cart-lines**
   - Update existing items in a cart
   - Parameters:
     - `cartId` (required): Cart ID
     - `lines` (required): Array of line updates with line ID and new quantity

10. **remove-cart-lines**
    - Remove items from a cart
    - Parameters:
      - `cartId` (required): Cart ID
      - `lineIds` (required): Array of cart line IDs to remove

### Customer Management

11. **get-customer**
    - Retrieve customer information and order history
    - Parameters:
      - `customerAccessToken` (required): Customer access token
      - `country` (optional): Country code for context
      - `language` (optional): Language code for context

## Configuration Options

### Environment Variables

- `SHOPIFY_STORE_DOMAIN`: Your Shopify store domain
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`: Your Storefront API access token
- `SHOPIFY_CUSTOMER_ACCESS_TOKEN` (optional): Customer access token for authenticated operations

### Command Line Arguments

- `--storeDomain`: Shopify store domain
- `--storefrontAccessToken`: Storefront API access token
- `--customerAccessToken`: Customer access token for authenticated operations

### Customer Access Tokens

Customer access tokens enable personalized cart operations and customer data access. You can provide them in three ways:

1. **Environment Variable**: Set `SHOPIFY_CUSTOMER_ACCESS_TOKEN` in your `.env` file
2. **Command Line**: Use `--customerAccessToken=your_token` when starting the server
3. **Tool Parameter**: Pass `customerAccessToken` directly to cart tools that support it

**Important**: Customer access tokens are **Storefront API specific** tokens obtained through the Shopify Storefront API's customer authentication flow. They are different from:
- Storefront access tokens (app-level authentication)
- Admin API tokens (backend operations)
- Session tokens (temporary authentication)

**How to obtain**: Use the Storefront API's `customerAccessTokenCreate` mutation to generate these tokens after customer login. See the [Shopify documentation](https://shopify.dev/docs/api/storefront/unstable/mutations/customeraccesstokencreate) for implementation details.

**Use cases**: Customer access tokens provide access to customer-specific data and authenticated cart operations, enabling personalized shopping experiences.

## API Differences

This server uses the **Shopify Storefront API**, which is different from the Admin API:

- **Customer-focused**: Designed for customer-facing storefronts and shopping experiences
- **Public data access**: Products, collections, and publicly available store information
- **Cart operations**: Supports cart creation and management mutations
- **Customer authentication**: Uses customer access tokens (not admin tokens)
- **Different GraphQL schema**: Uses Storefront API types and fields optimized for frontend use
- **Rate limits**: Different rate limiting compared to Admin API

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Type Checking
```bash
npm run type-check
```

## Troubleshooting

### Common Issues

1. **Invalid Access Token**
   - Ensure you're using a Storefront API token (not Admin API)
   - Verify the token has the required scopes

2. **Store Domain Issues**
   - Use the format: `your-store.myshopify.com`
   - Don't include `https://` in the domain

3. **Build Errors**
   - Ensure Node.js version 18+
   - Run `npm install` to install all dependencies

### Debug Logs

Check Claude Desktop's MCP logs for detailed error information:

**macOS:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

**Windows:**
```cmd
Get-Content "$env:APPDATA\Claude\Logs\mcp*.log" -Wait
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure tests pass and code builds
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the troubleshooting section above
- Review Shopify's Storefront API documentation
- Open an issue in this repository
