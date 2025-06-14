#!/usr/bin/env node

// Simple test script to validate the MCP server
// This script tests basic functionality without requiring actual Shopify credentials

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

console.log("Testing Shopify Storefront MCP Server...");

// Test 1: Check if we can import the main modules
try {
  await import("./dist/index.js");
  console.log("✓ Server imports successfully");
} catch (error) {
  console.error("✗ Server import failed:", error);
  process.exit(1);
}

// Test 2: Check if tool modules can be imported
try {
  const { getProducts } = await import("./dist/tools/getProducts.js");
  const { getCollections } = await import("./dist/tools/getCollections.js");
  const { searchProducts } = await import("./dist/tools/searchProducts.js");  const createCart = await import("./dist/tools/createCart.js");
  const getCart = await import("./dist/tools/getCart.js");
  const addCartLines = await import("./dist/tools/addCartLines.js");
  const updateCartLines = await import("./dist/tools/updateCartLines.js");
  const removeCartLines = await import("./dist/tools/removeCartLines.js");
  const getCustomer = await import("./dist/tools/getCustomer.js");
  console.log("✓ Tool modules import successfully");
} catch (error) {
  console.error("✗ Tool module import failed:", error);
  process.exit(1);
}

console.log("✓ All basic tests passed!");
console.log("\nTo run the server, make sure to:");
console.log("1. Set up your .env file with SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN");
console.log("2. Run: npm start");
console.log("3. Or use command line args: npm start -- --storeDomain=your-store.myshopify.com --storefrontAccessToken=your_token");
process.exit(0);;