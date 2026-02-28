import { Module } from '@nestjs/common';

import { ImageProxyController } from '@/module/image-proxy/controller/image-proxy.controller';

@Module({
  imports: [],
  controllers: [ImageProxyController],
})
export class ImageProxyModule {}
