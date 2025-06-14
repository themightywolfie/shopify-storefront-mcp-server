import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getProductByHandle
const GetProductByHandleInputSchema = z.object({
  handle: z.string().min(1)
});

export { GetProductByHandleInputSchema };

type GetProductByHandleInput = z.infer<typeof GetProductByHandleInputSchema>;

// Will be initialized in index.ts
let storefrontClient: GraphQLClient;

const getProductByHandle = {
  name: "get-product-by-handle",
  description: "Get a specific product by its handle",
  schema: GetProductByHandleInputSchema,

  // Add initialize method to set up the GraphQL client
  initialize(client: GraphQLClient) {
    storefrontClient = client;
  },
  execute: async (input: GetProductByHandleInput) => {
    try {
      const { handle } = input;

      // Check if we have an access token for authenticated features like tags
      const hasAccessToken = !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

      const query = gql`
        query GetProductByHandle($handle: String!) {
          productByHandle(handle: $handle) {
            id
            handle
            title
            description
            descriptionHtml
            productType
            vendor
            ${hasAccessToken ? 'tags' : ''}
            availableForSale
            createdAt
            updatedAt
            publishedAt
            onlineStoreUrl
            seo {
              title
              description
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            featuredImage {
              id
              url
              altText
              width
              height
            }
            images(first: 20) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 50) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  quantityAvailable
                  sku
                  barcode
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
            options {
              id
              name
              values
            }
            collections(first: 10) {
              edges {
                node {
                  id
                  handle
                  title
                  description
                }
              }
            }
          }
        }
      `;

      const variables = {
        handle
      };

      const data = (await storefrontClient.request(query, variables)) as {
        productByHandle: any;
      };

      if (!data.productByHandle) {
        throw new Error(`Product with handle "${handle}" not found`);
      }

      // Extract and format product data
      const product = data.productByHandle;

      // Format variants
      const variants = product.variants.edges.map((variantEdge: any) => ({
        id: variantEdge.node.id,
        title: variantEdge.node.title,
        availableForSale: variantEdge.node.availableForSale,
        quantityAvailable: variantEdge.node.quantityAvailable,
        sku: variantEdge.node.sku,
        barcode: variantEdge.node.barcode,
        price: variantEdge.node.price,
        compareAtPrice: variantEdge.node.compareAtPrice,
        selectedOptions: variantEdge.node.selectedOptions,
        image: variantEdge.node.image
      }));

      // Format images
      const images = product.images.edges.map((imageEdge: any) => ({
        id: imageEdge.node.id,
        url: imageEdge.node.url,
        altText: imageEdge.node.altText,
        width: imageEdge.node.width,
        height: imageEdge.node.height
      }));

      // Format collections
      const collections = product.collections.edges.map((collectionEdge: any) => ({
        id: collectionEdge.node.id,
        handle: collectionEdge.node.handle,
        title: collectionEdge.node.title,
        description: collectionEdge.node.description
      }));      const formattedProduct = {
        id: product.id,
        handle: product.handle,
        title: product.title,
        description: product.description,
        descriptionHtml: product.descriptionHtml,
        productType: product.productType,
        vendor: product.vendor,
        ...(hasAccessToken && { tags: product.tags }),
        availableForSale: product.availableForSale,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        publishedAt: product.publishedAt,
        onlineStoreUrl: product.onlineStoreUrl,
        seo: product.seo,
        priceRange: product.priceRange,
        compareAtPriceRange: product.compareAtPriceRange,
        featuredImage: product.featuredImage,
        images,
        variants,
        options: product.options,
        collections
      };

      return { product: formattedProduct };
    } catch (error) {
      console.error("Error fetching product by handle:", error);
      throw new Error(
        `Failed to fetch product: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getProductByHandle };
