import { IsEnum, IsUrl } from 'class-validator'
import { OriginWebsite } from 'src/types/originWebsites.enum'
import { updateFrequency } from 'src/types/updateFrequency.enum'

export class CreateListingDto {
  @IsUrl()
  url: string

  @IsEnum(OriginWebsite)
  website: OriginWebsite

  @IsEnum(updateFrequency)
  updateFrequency: updateFrequency
}
