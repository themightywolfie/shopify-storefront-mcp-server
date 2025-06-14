import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getProducts
const GetProductsInputSchema = z.object({
  query: z.string().optional(),
  first: z.number().max(250).default(10),
  sortKey: z.enum([
    "TITLE",
    "PRICE", 
    "CREATED_AT",
    "UPDATED_AT",
    "ID",
    "PRODUCT_TYPE",
    "VENDOR",
    "BEST_SELLING",
    "RELEVANCE"
  ]).default("CREATED_AT"),
  reverse: z.boolean().default(false)
});

export { GetProductsInputSchema };

type GetProductsInput = z.infer<typeof GetProductsInputSchema>;

// Will be initialized in index.ts
let storefrontClient: GraphQLClient;

const getProducts = {
  name: "get-products",
  description: "Get products from the storefront with optional search and sorting",
  schema: GetProductsInputSchema,

  // Add initialize method to set up the GraphQL client
  initialize(client: GraphQLClient) {
    storefrontClient = client;
  },
  execute: async (input: GetProductsInput) => {
    try {
      const { query: searchQuery, first, sortKey, reverse } = input;      // Check if we have an access token for authenticated features like tags
      const hasAccessToken = !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

      const query = gql`
        query GetProducts($first: Int!, $query: String, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
          products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                id
                handle
                title
                description
                productType
                vendor
                ${hasAccessToken ? 'tags' : ''}
                availableForSale
                createdAt
                updatedAt
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
                images(first: 5) {
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
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      quantityAvailable
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
                    }
                  }
                }
                collections(first: 5) {
                  edges {
                    node {
                      id
                      handle
                      title
                    }
                  }
                }
              }
            }
          }
        }
      `;

      const variables = {
        first: first,
        query: searchQuery,
        sortKey,
        reverse
      };

      const data = (await storefrontClient.request(query, variables)) as {
        products: any;
      };

      // Extract and format product data
      const products = data.products.edges.map((edge: any) => {
        const product = edge.node;

        // Format variants
        const variants = product.variants.edges.map((variantEdge: any) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          availableForSale: variantEdge.node.availableForSale,
          quantityAvailable: variantEdge.node.quantityAvailable,
          price: variantEdge.node.price,
          compareAtPrice: variantEdge.node.compareAtPrice,
          selectedOptions: variantEdge.node.selectedOptions
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
          title: collectionEdge.node.title
        }));        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          description: product.description,
          productType: product.productType,
          vendor: product.vendor,
          ...(hasAccessToken && { tags: product.tags }),
          availableForSale: product.availableForSale,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          priceRange: product.priceRange,
          compareAtPriceRange: product.compareAtPriceRange,
          featuredImage: product.featuredImage,
          images,
          variants,
          collections
        };
      });

      return { products };
    } catch (error) {
      console.error("Error fetching products:", error);
      throw new Error(
        `Failed to fetch products: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getProducts };
