import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from './modules/router/router.module';

@Module({
  imports: [RouterModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
