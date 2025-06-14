import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const updateCartLinesSchema = z.object({
  cartId: z.string().describe('Cart ID (e.g., "gid://shopify/Cart/123")'),
  lines: z.array(z.object({
    id: z.string().describe('Cart line ID to update'),
    quantity: z.number().min(0).describe('New quantity (set to 0 to remove)'),
    attributes: z.array(z.object({
      key: z.string(),
      value: z.string()
    })).optional().describe('Updated custom attributes for the line item'),
    merchandiseId: z.string().optional().describe('New merchandise ID to replace current item'),
    sellingPlanId: z.string().optional().describe('New selling plan ID for subscriptions')
  })).describe('Items to update in the cart'),
  customerAccessToken: z.string().optional().describe('Customer access token for authenticated access (can also be set via environment variable)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type UpdateCartLinesInput = z.infer<typeof updateCartLinesSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: UpdateCartLinesInput,
  client: GraphQLClient
): Promise<any> {
  const query = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
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

  // Build lines input - only include non-undefined fields
  const linesInput = input.lines.map(line => {
    const lineInput: any = {
      id: line.id,
      quantity: line.quantity
    };

    if (line.attributes) {
      lineInput.attributes = line.attributes;
    }
    if (line.merchandiseId) {
      lineInput.merchandiseId = line.merchandiseId;
    }
    if (line.sellingPlanId) {
      lineInput.sellingPlanId = line.sellingPlanId;
    }

    return lineInput;
  });

  const variables = { cartId: input.cartId, lines: linesInput };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to update cart lines: ${error.message}`);
  }
}
