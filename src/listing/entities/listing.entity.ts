import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm'

import { OriginWebsite } from 'src/types/originWebsites.enum'
import { updateFrequency } from 'src/types/updateFrequency.enum'
import { UserListing } from './user-listing.entity'
import { ListingLog } from './listing-log.entity'

@Entity('listings')
export class Listing {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text', { unique: true })
  @ApiProperty()
  url: string

  @Column('enum', { enum: OriginWebsite })
  @ApiProperty({ enum: OriginWebsite })
  website: OriginWebsite

  @ApiProperty()
  @Column('text', { nullable: true })
  imgUrl: string

  @ApiProperty()
  @Column('text', { nullable: true })
  productTitle: string

  // @Column('enum', { enum: updateFrequency, default: updateFrequency['24HRS'] })
  // @ApiProperty({ enum: updateFrequency })
  // updateFrequency: updateFrequency
  // TODO: use enum and fix error in select used in cron job
  @Column('integer', { default: 24 })
  @ApiProperty()
  updateFrequency: number

  @Column('timestamp', {
    default: () => "DATE_TRUNC('hour', NOW() + INTERVAL '30 minutes')",
  })
  @ApiProperty()
  lastUpdate: Date

  @ApiProperty()
  @OneToMany(() => UserListing, (userListing) => userListing.listing)
  userListings: UserListing[]

  @ApiProperty()
  @OneToMany(() => ListingLog, (log) => log.listing)
  logs: ListingLog[]
}
