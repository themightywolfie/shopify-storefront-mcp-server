import { z } from 'zod';
import { GraphQLClient } from 'graphql-request';

export const getCustomerSchema = z.object({
  customerAccessToken: z.string().describe('Customer access token (required for customer queries)'),
  country: z.string().optional().describe('Country code for context (e.g., "US", "CA")'),
  language: z.string().optional().describe('Language code for context (e.g., "EN", "FR")')
});

export type GetCustomerInput = z.infer<typeof getCustomerSchema>;

export async function initialize() {
  // No initialization needed for this tool
}

export async function execute(
  input: GetCustomerInput,
  client: GraphQLClient
): Promise<any> {
  const query = `
    query GetCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        displayName
        email
        phone
        acceptsMarketing
        createdAt
        updatedAt
        tags
        numberOfOrders
        defaultAddress {
          id
          firstName
          lastName
          company
          address1
          address2
          city
          province
          country
          zip
          phone
          provinceCode
          countryCodeV2
        }
        addresses(first: 10) {
          edges {
            node {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              country
              zip
              phone
              provinceCode
              countryCodeV2
            }
          }
        }
        orders(first: 10) {
          edges {
            node {
              id
              orderNumber
              name
              processedAt
              financialStatus
              fulfillmentStatus
              totalPrice {
                amount
                currencyCode
              }
              subtotalPrice {
                amount
                currencyCode
              }
              totalTax {
                amount
                currencyCode
              }
              totalShippingPrice {
                amount
                currencyCode
              }
              currentTotalPrice {
                amount
                currencyCode
              }
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    quantity
                    variant {
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
                      }
                    }
                  }
                }
              }
              shippingAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              billingAddress {
                firstName
                lastName
                company
                address1
                address2
                city
                province
                country
                zip
                phone
              }
            }
          }
        }
      }
    }
  `;

  const variables = { customerAccessToken: input.customerAccessToken };

  try {
    const result = await client.request(query, variables);
    return result;
  } catch (error: any) {
    throw new Error(`Failed to get customer information: ${error.message}`);
  }
}
