import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for searchProducts
const SearchProductsInputSchema = z.object({
  query: z.string().min(1),
  first: z.number().max(250).default(10),
  sortKey: z.enum([
    "RELEVANCE",
    "PRICE",
    "CREATED_AT",
    "UPDATED_AT",
    "TITLE",
    "BEST_SELLING"
  ]).default("RELEVANCE"),
  reverse: z.boolean().default(false),
  productFilters: z.object({
    available: z.boolean().optional(),
    price: z.object({
      min: z.number().optional(),
      max: z.number().optional()
    }).optional(),
    productType: z.string().optional(),
    vendor: z.string().optional(),
    tag: z.string().optional()
  }).optional()
});

export { SearchProductsInputSchema };

type SearchProductsInput = z.infer<typeof SearchProductsInputSchema>;

// Will be initialized in index.ts
let storefrontClient: GraphQLClient;

const searchProducts = {
  name: "search-products",
  description: "Perform full-text search across products with filters",
  schema: SearchProductsInputSchema,

  // Add initialize method to set up the GraphQL client
  initialize(client: GraphQLClient) {
    storefrontClient = client;
  },
  execute: async (input: SearchProductsInput) => {
    try {
      const { query: searchQuery, first, sortKey, reverse, productFilters } = input;

      // Build search query string
      let queryString = searchQuery;
      
      if (productFilters) {
        const filters: string[] = [];
        
        if (productFilters.available !== undefined) {
          filters.push(`available:${productFilters.available}`);
        }
        
        if (productFilters.price) {
          if (productFilters.price.min !== undefined) {
            filters.push(`price:>=${productFilters.price.min}`);
          }
          if (productFilters.price.max !== undefined) {
            filters.push(`price:<=${productFilters.price.max}`);
          }
        }
        
        if (productFilters.productType) {
          filters.push(`product_type:"${productFilters.productType}"`);
        }
        
        if (productFilters.vendor) {
          filters.push(`vendor:"${productFilters.vendor}"`);
        }
        
        if (productFilters.tag) {
          filters.push(`tag:"${productFilters.tag}"`);
        }
        
        if (filters.length > 0) {
          queryString = `${searchQuery} ${filters.join(' ')}`;
        }
      }

      const query = gql`
        query SearchProducts($first: Int!, $query: String!, $sortKey: ProductSortKeys!, $reverse: Boolean!) {
          products(first: $first, query: $query, sortKey: $sortKey, reverse: $reverse) {
            edges {
              node {
                id
                handle
                title
                description
                productType
                vendor
                tags
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
                images(first: 3) {
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
                variants(first: 5) {
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
              }
            }
          }
        }
      `;

      const variables = {
        first: first,
        query: queryString,
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

        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          description: product.description,
          productType: product.productType,
          vendor: product.vendor,
          tags: product.tags,
          availableForSale: product.availableForSale,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
          priceRange: product.priceRange,
          compareAtPriceRange: product.compareAtPriceRange,
          featuredImage: product.featuredImage,
          images,
          variants
        };
      });

      return { 
        products,
        searchQuery: queryString,
        resultCount: products.length
      };
    } catch (error) {
      console.error("Error searching products:", error);
      throw new Error(
        `Failed to search products: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { searchProducts };
