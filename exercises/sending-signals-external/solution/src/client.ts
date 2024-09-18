import { Connection, Client } from '@temporalio/client';
import { pizzaWorkflow, fulfillOrderWorkflow } from './workflows/all-workflows';
import { TASK_QUEUE_NAME } from './shared';
import { createPizzaOrder } from './createPizzaOrder';

async function run() {
  const connection = await Connection.connect({ address: 'localhost:7233' });

  const client = new Client({
    connection,
  });

  const order = createPizzaOrder();

  const pizzaWorkflowHandle = await client.workflow.start(pizzaWorkflow, {
    args: [order],
    taskQueue: TASK_QUEUE_NAME,
    workflowId: `pizza-workflow-order-${order.orderNumber}`,
  });

  const fulfillOrderHandle = await client.workflow.start(fulfillOrderWorkflow, {
    args: [order],
    taskQueue: TASK_QUEUE_NAME,
    workflowId: `signal-fulfilled-order-${order.orderNumber}`,
  });

  // optional: wait for client result
  console.log(await pizzaWorkflowHandle.result());
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});


