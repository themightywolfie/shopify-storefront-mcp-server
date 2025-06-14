import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const getCartSchema = z.object({
  cartId: z.string().describe('Cart ID (e.g., "gid://shopify/Cart/123")'),
  customerAccessToken: z.string().optional().describe('Customer access token for authenticated access (can also be set via environment variable)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type GetCartInput = z.infer<typeof getCartSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: GetCartInput,
  client: GraphQLClient
): Promise<any> {
  const query = `
    query GetCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        createdAt
        updatedAt
        checkoutUrl
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
                  sku
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  product {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                  }
                  image {
                    url
                    altText
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
        attributes {
          key
          value
        }
        note
        buyerIdentity {
          email
          phone
          countryCode
          customer {
            id
            email
            firstName
            lastName
          }
          deliveryAddressPreferences {
            ... on MailingAddress {
              address1
              address2
              city
              provinceCode
              countryCodeV2
              zip
              firstName
              lastName
              company
              phone
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
        discountCodes {
          code
          applicable
        }
        discountAllocations {
          discountedAmount {
            amount
            currencyCode
          }
          targetType
        }
      }
    }
  `;

  const variables = { cartId: input.cartId };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to get cart: ${error.message}`);
  }
}
