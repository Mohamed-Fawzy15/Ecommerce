import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './module/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    UserModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ConfigModule.forRoot({
      envFilePath: './config/.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URL as string, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () =>
          console.log('db connected successfully 👍'),
        );
        return connection;
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
