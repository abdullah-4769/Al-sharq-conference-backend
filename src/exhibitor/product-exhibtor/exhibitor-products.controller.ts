import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ExhibitorProductsService } from './exhibitor-products.service';
import { CreateExhibitorProductDto } from './dto/create-exhibitor-product.dto';

@Controller('exhibitor-products')
export class ExhibitorProductsController {
  constructor(private readonly service: ExhibitorProductsService) {}

  @Post()
  async create(@Body() dto: CreateExhibitorProductDto) {
    return this.service.createProduct(dto);
  }

  @Get()
  async findAll() {
    return this.service.getAllProducts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.service.getProductById(Number(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: CreateExhibitorProductDto) {
    return this.service.updateProduct(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.deleteProduct(Number(id));
  }
}
