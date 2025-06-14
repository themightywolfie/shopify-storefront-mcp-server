import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getCollections
const GetCollectionsInputSchema = z.object({
  query: z.string().optional(),
  first: z.number().max(250).default(10),
  sortKey: z.enum([
    "TITLE",
    "UPDATED_AT",
    "ID",
    "RELEVANCE"
  ]).default("UPDATED_AT"),
  reverse: z.boolean().default(false)
});

export { GetCollectionsInputSchema };

type GetCollectionsInput = z.infer<typeof GetCollectionsInputSchema>;

// Will be initialized in index.ts
let storefrontClient: GraphQLClient;

const getCollections = {
  name: "get-collections",
  description: "Get collections from the storefront with optional search and sorting",
  schema: GetCollectionsInputSchema,

  // Add initialize method to set up the GraphQL client
  initialize(client: GraphQLClient) {
    storefrontClient = client;
  },

  execute: async (input: GetCollectionsInput) => {
    try {
      const { query: searchQuery, first, sortKey, reverse } = input;

      const query = gql`
        query GetCollections($first: Int!, $query: String, $sortKey: CollectionSortKeys!, $reverse: Boolean!) {
          collections(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
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
                products(first: 5) {
                  edges {
                    node {
                      id
                      handle
                      title
                      availableForSale
                      priceRange {
                        minVariantPrice {
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
        collections: any;
      };

      // Extract and format collection data
      const collections = data.collections.edges.map((edge: any) => {
        const collection = edge.node;

        // Format preview products
        const products = collection.products.edges.map((productEdge: any) => ({
          id: productEdge.node.id,
          handle: productEdge.node.handle,
          title: productEdge.node.title,
          availableForSale: productEdge.node.availableForSale,
          priceRange: productEdge.node.priceRange,
          featuredImage: productEdge.node.featuredImage
        }));

        return {
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
      });

      return { collections };
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw new Error(
        `Failed to fetch collections: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getCollections };
