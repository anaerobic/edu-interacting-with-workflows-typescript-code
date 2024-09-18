import { PizzaOrder, Customer, Address, Pizza } from "./shared";

export function createPizzaOrder(): PizzaOrder {
  const customer: Customer = {
    customerID: 12983,
    name: 'María García',
    email: 'maria1985@example.com',
    phone: '415-555-7418',
  };

  const address: Address = {
    line1: '701 Mission Street',
    line2: 'Apartment 9C',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94103',
  };

  const p1: Pizza = {
    description: 'Large, with mushrooms and onions',
    price: 1500,
  };

  const p2: Pizza = {
    description: 'Small, with pepperoni',
    price: 1200,
  };

  const items: Pizza[] = [p1, p2];

  const order: PizzaOrder = {
    orderNumber: 'Z1238',
    customer,
    items,
    address,
    isDelivery: true,
    isFulfilled: false,
  };

  return order;
}
