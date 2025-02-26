import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { Listing } from './listing.entity'

@Entity('listings_logs')
export class ListingLog {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty()
  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @ApiProperty()
  @Column('decimal')
  price: number

  @ApiProperty()
  @ManyToOne(() => Listing, (listing) => listing.logs)
  listing: Listing
}
