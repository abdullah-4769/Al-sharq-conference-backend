import { Injectable, InternalServerErrorException } from '@nestjs/common'
import * as AWS from 'aws-sdk'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class SpacesService {
  private s3: AWS.S3
  private bucketName: string

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('SPACES_BUCKET_NAME') || ''

    this.s3 = new AWS.S3({
      endpoint: new AWS.Endpoint(this.configService.get<string>('SPACES_ENDPOINT') || ''),
      accessKeyId: this.configService.get<string>('SPACES_KEY') || '',
      secretAccessKey: this.configService.get<string>('SPACES_SECRET') || '',
    })
  }

  async uploadFile(fileName: string, fileBuffer: Buffer, contentType: string) {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'public-read',
      }

      const data = await this.s3.upload(params).promise()
      return { url: data.Location }
    } catch (err) {
      throw new InternalServerErrorException('File upload failed')
    }
  }

  async getFile(fileName: string) {
    try {
      const params = { Bucket: this.bucketName, Key: fileName }
      const data = await this.s3.getObject(params).promise()
      return data.Body
    } catch (err) {
      throw new InternalServerErrorException('File fetch failed')
    }
  }
}
