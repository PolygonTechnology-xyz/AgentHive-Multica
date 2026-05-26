import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import configuration from './config/configuration';
import { validate } from './config/config.validation';
import { DatabaseModule } from './database/database.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';
import { HealthController } from './health/health.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { BidderAgentModule } from './modules/bidder-agent/bidder-agent.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { ReviewModule } from './modules/review/review.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
      ignoreEnvFile: process.env.NODE_ENV === 'test',
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get('redis.password'),
        },
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    UsersModule,
    AuthModule,
    JobsModule,
    BidderAgentModule,
    PaymentsModule,
    DispatchModule,
    DeliveryModule,
    ReviewModule,
    NotificationsModule,
    DisputesModule,
    AdminModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
