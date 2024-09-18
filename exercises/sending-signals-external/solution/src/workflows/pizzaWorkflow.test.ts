import { TestWorkflowEnvironment } from '@temporalio/testing';
import { Worker, Runtime, DefaultLogger, LogEntry } from '@temporalio/worker';
import { fulfillOrderSignal, pizzaWorkflow } from './pizzaWorkflow';
import { WorkflowCoverage } from '@temporalio/nyc-test-coverage';
import { createPizzaOrder } from '../createPizzaOrder';
import { Bill, Distance, OrderConfirmation } from '../shared';
import { randomUUID } from 'crypto';

let testEnv: TestWorkflowEnvironment;

const workflowCoverage = new WorkflowCoverage();

beforeAll(async () => {
  // Use console.log instead of console.error to avoid red output
  // Filter INFO log messages for clearer test output
  Runtime.install({
    logger: new DefaultLogger('WARN', (entry: LogEntry) => console.log(`[${entry.level}]`, entry.message)),
  });

  testEnv = await TestWorkflowEnvironment.createLocal();
});

afterAll(async () => {
  await testEnv?.teardown();
});

afterAll(() => {
  workflowCoverage.mergeIntoGlobalCoverage();
});

test('pizzaWorkflow with mock activity', async () => {
  const { client, nativeConnection } = testEnv;
  const order = createPizzaOrder();

  const expectedOrderConfirmation: OrderConfirmation = {
    amount: 12,
    billingTimestamp: Date.now(),
    confirmationNumber: 'conf',
    orderNumber: order.orderNumber,
    status: 'confirmed',
  }

  const worker = await Worker.create(
    workflowCoverage.augmentWorkerOptions({
      connection: nativeConnection,
      taskQueue: 'test',
      workflowsPath: require.resolve('./pizzaWorkflow'),
      activities: {
        getDistance: async (): Promise<Distance> => ({
          kilometers: 25,
        }),
        sendBill: async (args: Bill): Promise<OrderConfirmation> => {
          return expectedOrderConfirmation;
        }
      },
    })
  );

  await worker.runUntil(async () => {
    const handle = await client.workflow.start(pizzaWorkflow, {
      workflowId: randomUUID(),
      taskQueue: 'test',
      args: [
        order,
      ],
    });
    await handle.signal(fulfillOrderSignal, true);
    const result = await handle.result();
    expect(result).toStrictEqual(expectedOrderConfirmation)
  });
});