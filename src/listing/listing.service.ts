import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { launch } from 'puppeteer'

import { CreateListingDto } from './dto/create-listing.dto'
import { UpdateListingDto } from './dto/update-listing.dto'
import { Listing } from './entities/listing.entity'
import { UserListing } from './entities/user-listing.entity'
import { User } from 'src/auth/entities/user.entity'
import { ListingLog } from './entities/listing-log.entity'

@Injectable()
export class ListingService {
  constructor(
    @InjectRepository(Listing)
    private readonly listingRepository: Repository<Listing>,
    @InjectRepository(UserListing)
    private readonly userListingRepository: Repository<UserListing>,
    @InjectRepository(ListingLog)
    private readonly listingLogRepository: Repository<ListingLog>,
  ) {}

  async create(createListingDto: CreateListingDto, user: User) {
    // TODO: validate accesible url
    let existingListing = await this.listingRepository.findOne({
      where: { url: createListingDto.url },
    })

    if (existingListing) {
      await this.registerUserListing(existingListing, user, createListingDto)
    } else {
      const { imgUrl, productTitle, price } = await this.scrappeAmazonProduct(
        createListingDto.url,
      )
      existingListing = await this.listingRepository.save({
        ...createListingDto,
        imgUrl,
        productTitle,
      })
      await this.listingLogRepository.save({ price, listing: existingListing })
    }

    return this.userListingRepository.save({
      listing: existingListing,
      user,
      updateFrequency: createListingDto.updateFrequency,
    })
  }

  async scrappeAmazonProduct(url: string): Promise<{
    imgUrl: string
    productTitle: string
    price: number
  }> {
    const browser = await launch({})
    const page = await browser.newPage()
    await page.goto(url)

    const getImgUrl = async () => {
      const img = await page.locator('#landingImage').waitHandle()
      const imgUrl = await img?.evaluate((el) => el.getAttribute('src'))
      return imgUrl
    }

    const getProductTitle = async () => {
      const productTitleElement = await page.locator('#productTitle').waitHandle()
      const productTitle = (
        await productTitleElement?.evaluate((el) => el.textContent)
      ).trim()
      return productTitle
    }

    const getPriceNumber = async () => {
      const priceElement = await page.locator('.a-price-whole').waitHandle()
      const priceText = await priceElement?.evaluate((el) => el.textContent)
      const price = parseFloat(
        priceText.replace('$', '').replace('.', '').replace(',', ''),
      )
      return price
    }

    const [imgUrl, productTitle, price] = await Promise.all([
      getImgUrl(),
      getProductTitle(),
      getPriceNumber(),
    ])

    await browser.close()

    return {
      imgUrl,
      productTitle,
      price,
    }
  }

  async registerUserListing(existingListing, user, createListingDto) {
    const existingUserListing = await this.userListingRepository.findOne({
      where: { listing: { id: existingListing.id }, user: { id: user.id } },
    })

    if (existingUserListing) {
      throw new BadRequestException('Listing already exists')
    } else if (existingListing.updateFrequency > createListingDto.updateFrequency) {
      existingListing.updateFrequency = createListingDto.updateFrequency
      await this.listingRepository.save(existingListing)
    }
  }

  findAllListingsByUser(user: User) {
    return this.userListingRepository.find({
      where: { user: { id: user.id } },
      relations: ['listing'],
    })
  }

  findOne(id: number) {
    return `This action returns a #${id} listing`
  }

  update(id: number, updateListingDto: UpdateListingDto) {
    return `This action updates a #${id} listing`
  }

  async remove(id: string, user: User) {
    const listing = await this.userListingRepository.findOneBy({
      id,
      user: { id: user.id },
    })

    if (!listing) {
      throw new BadRequestException('No listing found with ID: ' + id)
    }

    await this.userListingRepository.remove(listing)

    return { message: 'Listing deleted' }
  }
}
