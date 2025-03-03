import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ScheduleModule } from '@nestjs/schedule'

import { ListingService } from './listing.service'
import { ListingController } from './listing.controller'
import { Listing } from './entities/listing.entity'
import { AuthModule } from 'src/auth/auth.module'
import { UserListing } from './entities/user-listing.entity'
import { ListingLog } from './entities/listing-log.entity'
import { ListingTasks } from './listing.tasks'

@Module({
  controllers: [ListingController],
  providers: [ListingService, ListingTasks],
  imports: [
    TypeOrmModule.forFeature([Listing, UserListing, ListingLog]),
    AuthModule,
    ScheduleModule.forRoot(),
  ],
})
export class ListingModule {}
