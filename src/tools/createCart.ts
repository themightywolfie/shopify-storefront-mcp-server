import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const cartCreateSchema = z.object({
  lines: z.array(z.object({
    merchandiseId: z.string().describe('Product variant ID (e.g., "gid://shopify/ProductVariant/123")'),
    quantity: z.number().min(1).describe('Quantity of the item'),
    attributes: z.array(z.object({
      key: z.string(),
      value: z.string()
    })).optional().describe('Custom attributes for the line item'),
    sellingPlanId: z.string().optional().describe('Selling plan ID for subscriptions')
  })).optional().describe('Initial cart lines'),
  attributes: z.array(z.object({
    key: z.string(),
    value: z.string()
  })).optional().describe('Cart-level custom attributes'),
  note: z.string().optional().describe('Note for the cart'),
  buyerIdentity: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    countryCode: z.string().optional().describe('Country code (e.g., "US", "CA")'),
    customerAccessToken: z.string().optional().describe('Customer access token for authenticated users'),
    deliveryAddressPreferences: z.array(z.object({
      address1: z.string().optional(),
      address2: z.string().optional(),
      city: z.string().optional(),
      provinceCode: z.string().optional(),
      countryCode: z.string().optional(),
      zip: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      company: z.string().optional(),
      phone: z.string().optional()
    })).optional()
  }).optional().describe('Buyer identity information'),
  customerAccessToken: z.string().optional().describe('Customer access token (can also be set via environment variable)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type CartCreateInput = z.infer<typeof cartCreateSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: CartCreateInput,
  client: GraphQLClient
): Promise<any> {
  // Determine customer access token - parameter takes precedence over environment
  const customerAccessToken = input.customerAccessToken || 
    input.buyerIdentity?.customerAccessToken || 
    process.env.SHOPIFY_CUSTOMER_ACCESS_TOKEN;

  const query = `
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
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

  // Build input object
  const cartInput: any = {};

  if (input.lines) {
    cartInput.lines = input.lines.map(line => ({
      quantity: line.quantity,
      merchandiseId: line.merchandiseId,
      ...(line.attributes && { attributes: line.attributes }),
      ...(line.sellingPlanId && { sellingPlanId: line.sellingPlanId })
    }));
  }

  if (input.attributes) {
    cartInput.attributes = input.attributes;
  }

  if (input.note) {
    cartInput.note = input.note;
  }

  if (input.buyerIdentity) {
    cartInput.buyerIdentity = { ...input.buyerIdentity };
    
    // Add customer access token to buyer identity if available
    if (customerAccessToken) {
      cartInput.buyerIdentity.customerAccessToken = customerAccessToken;
    }
  } else if (customerAccessToken) {
    // Create buyer identity with just the customer access token
    cartInput.buyerIdentity = {
      customerAccessToken: customerAccessToken
    };
  }

  const variables = { input: cartInput };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to create cart: ${error.message}`);
  }
}
