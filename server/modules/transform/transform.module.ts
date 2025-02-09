import { Module } from '@nestjs/common';
import { TransferController } from './transform.controller';
import { TransferService } from './transform.service';

@Module({
  imports: [],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
