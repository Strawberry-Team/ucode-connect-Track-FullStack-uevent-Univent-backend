import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionsController } from '../../../src/models/subscriptions/subscriptions.controller';
import { SubscriptionsService } from '../../../src/models/subscriptions/subscriptions.service';

describe('SubscriptionsController', () => {
  let controller: SubscriptionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionsController],
      providers: [SubscriptionsService],
    }).compile();

    controller = module.get<SubscriptionsController>(SubscriptionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
