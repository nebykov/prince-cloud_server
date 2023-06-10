import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async createUser(dto: CreateUserDto) {
         const candidate = await this.userModel.findOne({email: dto.email})
         if (candidate) {
            console.log(candidate)
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
         }
         const hashedPassword = await bcrypt.hash(dto.password, 8)
         const user = await this.userModel.create({email: dto.email, password: hashedPassword})
         return user
    }

    async getByEmail (email: string) {
          const user = await this.userModel.findOne({email})
          if (!user) {
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
          }
          return user
    }
}
