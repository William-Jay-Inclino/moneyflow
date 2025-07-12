import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserAccountsService } from './user-accounts.service';
import { CreateUserAccountDto } from './dto/create-user-account.dto';
import { UpdateUserAccountDto } from './dto/update-user-account.dto';
import { UserAccountQueryDto } from './dto/user-account-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('user-accounts')
@UseGuards(JwtAuthGuard)
export class UserAccountsController {
  constructor(private readonly userAccountsService: UserAccountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Request() req, @Body() createUserAccountDto: CreateUserAccountDto) {
    return this.userAccountsService.create(req.user.id, createUserAccountDto);
  }

  @Get()
  findAll(@Request() req, @Query() query: UserAccountQueryDto) {
    return this.userAccountsService.findAll(req.user.id, query);
  }

  @Get('total-balance')
  getTotalBalance(@Request() req) {
    return this.userAccountsService.getTotalBalance(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.userAccountsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserAccountDto: UpdateUserAccountDto,
  ) {
    return this.userAccountsService.update(req.user.id, id, updateUserAccountDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.userAccountsService.remove(req.user.id, id);
  }

  @Patch(':id/balance/add')
  addToBalance(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ) {
    return this.userAccountsService.updateBalance(req.user.id, id, amount, 'add');
  }

  @Patch(':id/balance/subtract')
  subtractFromBalance(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('amount') amount: number,
  ) {
    return this.userAccountsService.updateBalance(req.user.id, id, amount, 'subtract');
  }
}
