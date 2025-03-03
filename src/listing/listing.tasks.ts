import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ListingLog } from './entities/listing-log.entity'
import { Listing } from './entities/listing.entity'
import { ListingService } from './listing.service'

@Injectable()
export class ListingTasks {
  constructor(
    @InjectRepository(ListingLog)
    private readonly listingLogRepository: Repository<ListingLog>,
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    private readonly listingService: ListingService,
  ) {}

  private readonly logger = new Logger(ListingTasks.name)

  @Cron('0 * * * *')
  async handleCron() {
    const listings = await this.listingRepository
      .createQueryBuilder('listing')
      .where("listing.lastUpdate + INTERVAL '1 hour' * listing.updateFrequency <= NOW()")
      .getMany()

    listings.forEach(async (listing) => {
      const { price } = await this.listingService.scrappeAmazonProduct(listing.url)
      await this.listingRepository.save({
        ...listing,
        lastUpdate: new Date(),
      })
      await this.listingLogRepository.save({ price, listing })
    })

    this.logger.debug('LISTINGS UPDATED: ' + listings.length)
  }
}
