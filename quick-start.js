#!/usr/bin/env node

/**
 * Quick Start Script for Shopify Storefront MCP Server
 * 
 * This script helps you quickly configure and test your MCP server.
 * Run with: node quick-start.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🚀 Shopify Storefront MCP Server - Quick Start');
  console.log('================================================\n');

  // Check if .env already exists
  const envExists = existsSync('.env');
  if (envExists) {
    const overwrite = await question('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('✅ Keeping existing .env file');
      await testConfiguration();
      return;
    }
  }

  console.log('Let\'s set up your Shopify Storefront credentials:\n');

  // Get store domain
  const storeDomain = await question('🏪 Enter your Shopify store domain (e.g., my-store.myshopify.com): ');
  
  // Get storefront access token
  const accessToken = await question('🔑 Enter your Storefront Access Token: ');

  // Create .env file
  const envContent = `# Shopify Storefront MCP Server Configuration
SHOPIFY_STORE_DOMAIN=${storeDomain}
SHOPIFY_STOREFRONT_ACCESS_TOKEN=${accessToken}

# Optional: Set to 'development' for verbose logging
NODE_ENV=production
`;

  writeFileSync('.env', envContent);
  console.log('\n✅ Created .env file successfully!');

  await testConfiguration();
}

async function testConfiguration() {
  console.log('\n🧪 Testing configuration...');
  
  try {
    // Try to load the environment
    const envContent = readFileSync('.env', 'utf8');
    const hasStoreDomain = envContent.includes('SHOPIFY_STORE_DOMAIN=');
    const hasAccessToken = envContent.includes('SHOPIFY_STOREFRONT_ACCESS_TOKEN=');

    if (hasStoreDomain && hasAccessToken) {
      console.log('✅ Environment configuration looks good!');
    } else {
      console.log('⚠️  Environment configuration may be incomplete');
    }

    console.log('\n🚀 Next steps:');
    console.log('1. Build the project: npm run build');
    console.log('2. Start the server: npm start');
    console.log('3. Add to Claude Desktop config (see README.md)');
    console.log('\n📚 For detailed setup instructions, see README.md');

  } catch (error) {
    console.log('❌ Error reading .env file:', error.message);
  }

  rl.close();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Setup cancelled');
  rl.close();
  process.exit(0);
});

main().catch(console.error);
