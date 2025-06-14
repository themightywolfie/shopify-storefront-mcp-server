import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getCollectionByHandle
const GetCollectionByHandleInputSchema = z.object({
  handle: z.string().min(1),
  productsFirst: z.number().default(10).optional()
});

export { GetCollectionByHandleInputSchema };

type GetCollectionByHandleInput = z.infer<typeof GetCollectionByHandleInputSchema>;

// Will be initialized in index.ts
let storefrontClient: GraphQLClient;

const getCollectionByHandle = {
  name: "get-collection-by-handle",
  description: "Get a specific collection by its handle",
  schema: GetCollectionByHandleInputSchema,

  // Add initialize method to set up the GraphQL client
  initialize(client: GraphQLClient) {
    storefrontClient = client;
  },
  execute: async (input: GetCollectionByHandleInput) => {
    try {
      const { handle, productsFirst = 10 } = input;

      // Check if we have an access token for authenticated features like tags
      const hasAccessToken = !!process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

      const query = gql`
        query GetCollectionByHandle($handle: String!, $productsFirst: Int!) {
          collectionByHandle(handle: $handle) {
            id
            handle
            title
            description
            descriptionHtml
            updatedAt
            onlineStoreUrl
            seo {
              title
              description
            }
            image {
              id
              url
              altText
              width
              height
            }
            products(first: $productsFirst) {
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
                  variants(first: 3) {
                    edges {
                      node {
                        id
                        title
                        availableForSale
                        price {
                          amount
                          currencyCode
                        }
                        compareAtPrice {
                          amount
                          currencyCode
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `;      const variables = {
        handle,
        productsFirst
      };

      const data = (await storefrontClient.request(query, variables)) as {
        collectionByHandle: any;
      };

      if (!data.collectionByHandle) {
        throw new Error(`Collection with handle "${handle}" not found`);
      }

      // Extract and format collection data
      const collection = data.collectionByHandle;

      // Format products
      const products = collection.products.edges.map((productEdge: any) => {
        const product = productEdge.node;

        // Format variants
        const variants = product.variants.edges.map((variantEdge: any) => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          availableForSale: variantEdge.node.availableForSale,
          price: variantEdge.node.price,
          compareAtPrice: variantEdge.node.compareAtPrice
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
          variants
        };
      });

      const formattedCollection = {
        id: collection.id,
        handle: collection.handle,
        title: collection.title,
        description: collection.description,
        descriptionHtml: collection.descriptionHtml,
        updatedAt: collection.updatedAt,
        onlineStoreUrl: collection.onlineStoreUrl,
        seo: collection.seo,
        image: collection.image,
        products
      };

      return { collection: formattedCollection };
    } catch (error) {
      console.error("Error fetching collection by handle:", error);
      throw new Error(
        `Failed to fetch collection: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getCollectionByHandle };
