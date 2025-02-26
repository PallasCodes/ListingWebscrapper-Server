import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ListingService } from './listing.service'
import { ListingController } from './listing.controller'
import { Listing } from './entities/listing.entity'
import { AuthModule } from 'src/auth/auth.module'
import { UserListing } from './entities/user-listing.entity'
import { ListingLog } from './entities/listing-log.entity'

@Module({
  controllers: [ListingController],
  providers: [ListingService],
  imports: [TypeOrmModule.forFeature([Listing, UserListing, ListingLog]), AuthModule],
})
export class ListingModule {}
