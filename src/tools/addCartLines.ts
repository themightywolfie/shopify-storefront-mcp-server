import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const addCartLinesSchema = z.object({
  cartId: z.string().describe('Cart ID (e.g., "gid://shopify/Cart/123")'),
  lines: z.array(z.object({
    merchandiseId: z.string().describe('Product variant ID (e.g., "gid://shopify/ProductVariant/123")'),
    quantity: z.number().min(1).describe('Quantity of the item'),
    attributes: z.array(z.object({
      key: z.string(),
      value: z.string()
    })).optional().describe('Custom attributes for the line item'),
    sellingPlanId: z.string().optional().describe('Selling plan ID for subscriptions')
  })).describe('Items to add to cart'),
  customerAccessToken: z.string().optional().describe('Customer access token for authenticated access (can also be set via environment variable)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type AddCartLinesInput = z.infer<typeof addCartLinesSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: AddCartLinesInput,
  client: GraphQLClient
): Promise<any> {
  const query = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
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

  // Build lines input
  const linesInput = input.lines.map(line => ({
    quantity: line.quantity,
    merchandiseId: line.merchandiseId,
    ...(line.attributes && { attributes: line.attributes }),
    ...(line.sellingPlanId && { sellingPlanId: line.sellingPlanId })
  }));

  const variables = { cartId: input.cartId, lines: linesInput };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to add cart lines: ${error.message}`);
  }
}
