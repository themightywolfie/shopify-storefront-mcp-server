import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const removeCartLinesSchema = z.object({
  cartId: z.string().describe('Cart ID (e.g., "gid://shopify/Cart/123")'),
  lineIds: z.array(z.string()).describe('Cart line IDs to remove from cart'),
  customerAccessToken: z.string().optional().describe('Customer access token for authenticated access (can also be set via environment variable)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type RemoveCartLinesInput = z.infer<typeof removeCartLinesSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: RemoveCartLinesInput,
  client: GraphQLClient
): Promise<any> {
  const query = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          updatedAt
          totalQuantity
          lines(first: 250) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    product {
                      id
                      title
                      handle
                      featuredImage {
                        url
                        altText
                      }
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
                attributes {
                  key
                  value
                }
              }
            }
          }
          cost {
            totalAmount {
              amount
              currencyCode
            }
            subtotalAmount {
              amount
              currencyCode
            }
            totalTaxAmount {
              amount
              currencyCode
            }
            totalDutyAmount {
              amount
              currencyCode
            }
          }
        }
        userErrors {
          field
          message
        }
        warnings {
          code
          target
          message
        }
      }
    }
  `;

  const variables = { cartId: input.cartId, lineIds: input.lineIds };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to remove cart lines: ${error.message}`);
  }
}
