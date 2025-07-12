import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserAccountDto } from './dto/create-user-account.dto';
import { UpdateUserAccountDto } from './dto/update-user-account.dto';
import { UserAccountQueryDto } from './dto/user-account-query.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class UserAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createUserAccountDto: CreateUserAccountDto) {
    try {
      return await this.prisma.userAccount.create({
        data: {
          user_id: userId,
          name: createUserAccountDto.name,
          balance: createUserAccountDto.balance ? new Decimal(createUserAccountDto.balance) : new Decimal(0),
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create user account');
    }
  }

  async findAll(userId: string, query: UserAccountQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    try {
      const [accounts, total] = await Promise.all([
        this.prisma.userAccount.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            created_at: 'desc',
          },
          include: {
            user: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.userAccount.count({ where }),
      ]);

      return {
        data: accounts,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to retrieve user accounts');
    }
  }

  async findOne(userId: string, id: string) {
    try {
      const account = await this.prisma.userAccount.findFirst({
        where: {
          id,
          user_id: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      if (!account) {
        throw new NotFoundException('User account not found');
      }

      return account;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user account');
    }
  }

  async update(userId: string, id: string, updateUserAccountDto: UpdateUserAccountDto) {
    // Verify account exists and belongs to user
    await this.findOne(userId, id);

    try {
      const updateData: any = {
        ...updateUserAccountDto,
      };

      if (updateUserAccountDto.balance !== undefined) {
        updateData.balance = new Decimal(updateUserAccountDto.balance);
      }

      return await this.prisma.userAccount.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update user account');
    }
  }

  async remove(userId: string, id: string) {
    // Verify account exists and belongs to user
    await this.findOne(userId, id);

    try {
      return await this.prisma.userAccount.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete user account');
    }
  }

  async updateBalance(userId: string, id: string, amount: number, operation: 'add' | 'subtract') {
    const account = await this.findOne(userId, id);
    const amountDecimal = new Decimal(amount);
    
    const newBalance = operation === 'add' 
      ? account.balance.add(amountDecimal)
      : account.balance.sub(amountDecimal);

    if (newBalance.isNegative()) {
      throw new BadRequestException('Insufficient balance');
    }

    try {
      return await this.prisma.userAccount.update({
        where: { id },
        data: { balance: newBalance },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to update account balance');
    }
  }

  async getTotalBalance(userId: string): Promise<Decimal> {
    try {
      const result = await this.prisma.userAccount.aggregate({
        where: { user_id: userId },
        _sum: { balance: true },
      });
      
      return result._sum.balance || new Decimal(0);
    } catch (error) {
      throw new BadRequestException('Failed to calculate total balance');
    }
  }
}
