#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { GraphQLClient } from "graphql-request";
import minimist from "minimist";
import { z } from "zod";

// Import tools
import { getProducts, GetProductsInputSchema } from "./tools/getProducts.js";
import { getProductByHandle, GetProductByHandleInputSchema } from "./tools/getProductByHandle.js";
import { getCollections, GetCollectionsInputSchema } from "./tools/getCollections.js";
import { getCollectionByHandle, GetCollectionByHandleInputSchema } from "./tools/getCollectionByHandle.js";
import { searchProducts, SearchProductsInputSchema } from "./tools/searchProducts.js";
import * as createCart from "./tools/createCart.js";
import * as getCart from "./tools/getCart.js";
import * as addCartLines from "./tools/addCartLines.js";
import * as updateCartLines from "./tools/updateCartLines.js";
import * as removeCartLines from "./tools/removeCartLines.js";
import * as getCustomer from "./tools/getCustomer.js";

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Load environment variables from .env file (if it exists)
dotenv.config();

// Define environment variables - from command line or .env file
const SHOPIFY_STOREFRONT_ACCESS_TOKEN =
  argv.storefrontAccessToken || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const SHOPIFY_STORE_DOMAIN = argv.storeDomain || process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_CUSTOMER_ACCESS_TOKEN = 
  argv.customerAccessToken || process.env.SHOPIFY_CUSTOMER_ACCESS_TOKEN;

// Store in process.env for backwards compatibility
process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN = SHOPIFY_STOREFRONT_ACCESS_TOKEN;
process.env.SHOPIFY_STORE_DOMAIN = SHOPIFY_STORE_DOMAIN;
process.env.SHOPIFY_CUSTOMER_ACCESS_TOKEN = SHOPIFY_CUSTOMER_ACCESS_TOKEN;

// Validate required environment variables
// Note: Storefront access token is optional for tokenless access to products, collections, search, and carts
if (!SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  console.warn("Warning: No SHOPIFY_STOREFRONT_ACCESS_TOKEN provided.");
  console.warn("Running in tokenless mode with limited features:");
  console.warn("  ✓ Products and Collections");
  console.warn("  ✓ Search");
  console.warn("  ✓ Pages, Blogs, and Articles");
  console.warn("  ✓ Cart operations");
  console.warn("  ✗ Product Tags, Metaobjects, Metafields, Menu, Customers");
  console.warn("  ✗ Query complexity limited to 1,000 points");
  console.warn("For full functionality, provide a Storefront API access token.");
}

if (!SHOPIFY_STORE_DOMAIN) {
  console.error("Error: SHOPIFY_STORE_DOMAIN is required.");
  console.error("Please provide it via command line argument or .env file.");
  console.error("  Command line: --storeDomain=your-store.myshopify.com");
  process.exit(1);
}

// Create Shopify GraphQL client for Storefront API
// Support both authenticated and tokenless access
const shopifyClient = new GraphQLClient(
  `https://${SHOPIFY_STORE_DOMAIN}/api/2024-10/graphql.json`,
  {
    headers: {
      ...(SHOPIFY_STOREFRONT_ACCESS_TOKEN && {
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_ACCESS_TOKEN
      }),
      "Content-Type": "application/json"
    }
  }
);

// Initialize tools with shopifyClient
getProducts.initialize(shopifyClient);
getProductByHandle.initialize(shopifyClient);
getCollections.initialize(shopifyClient);
getCollectionByHandle.initialize(shopifyClient);
searchProducts.initialize(shopifyClient);
createCart.initialize();
getCart.initialize();
addCartLines.initialize();
updateCartLines.initialize();
removeCartLines.initialize();
getCustomer.initialize();

// Set up MCP server
const server = new McpServer({
  name: "shopify-storefront",
  version: "1.1.0",
  description:
    "MCP Server for Shopify Storefront API, supporting both authenticated and tokenless access to store data and cart operations through GraphQL API"
});

// Add tools individually, using their schemas directly
server.tool(
  "get-products",
  GetProductsInputSchema.shape,
  async (args) => {
    const result = await getProducts.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "get-product-by-handle",
  GetProductByHandleInputSchema.shape,
  async (args) => {
    const result = await getProductByHandle.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "get-collections",
  GetCollectionsInputSchema.shape,
  async (args) => {
    const result = await getCollections.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "get-collection-by-handle",
  GetCollectionByHandleInputSchema.shape,
  async (args) => {
    const result = await getCollectionByHandle.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "search-products",
  SearchProductsInputSchema.shape,
  async (args) => {
    const result = await searchProducts.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "create-cart",
  createCart.cartCreateSchema.shape,
  async (args) => {
    const result = await createCart.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "get-cart",
  getCart.getCartSchema.shape,
  async (args) => {
    const result = await getCart.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "add-cart-lines",
  addCartLines.addCartLinesSchema.shape,
  async (args) => {
    const result = await addCartLines.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "update-cart-lines",
  updateCartLines.updateCartLinesSchema.shape,
  async (args) => {
    const result = await updateCartLines.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "remove-cart-lines",
  removeCartLines.removeCartLinesSchema.shape,
  async (args) => {
    const result = await removeCartLines.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

server.tool(
  "get-customer",
  getCustomer.getCustomerSchema.shape,
  async (args) => {
    const result = await getCustomer.execute(args, shopifyClient);
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {})
  .catch((error: unknown) => {
    console.error("Failed to start Shopify Storefront MCP Server:", error);
  });
