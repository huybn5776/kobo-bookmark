import { Controller, Get, Res, Param, NotFoundException } from '@nestjs/common';
import { Response } from 'express';

@Controller('image-proxy')
export class ImageProxyController {
  @Get('/kobo-book-images/:id')
  async proxyKoboBookImages(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    return this.proxyImageRequest(`https://cdn.kobo.com/book-images/${id}/.jpg`, res);
  }

  @Get('/rakuten-image/*paths')
  async proxyRakutenImage(@Param('paths') paths: string[], @Res() res: Response): Promise<Response> {
    return this.proxyImageRequest(`https://thumbnail.image.rakuten.co.jp/${paths.join('/')}`, res);
  }

  private async proxyImageRequest(url: string, res: Response): Promise<Response> {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new NotFoundException();
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return res.send(buffer);
  }
}
