import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UserService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async createUser(dto: CreateUserDto) {
         const user = await this.userModel.create(dto)
         return user
    }

    async getByEmail (email: string) {
          const user = await this.userModel.findOne({email})
          if (!user) {
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
          }
          return user
    }

    async getById (id: string) {
           const user = await this.userModel.findById(id)
           if (!user) {
            throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
          }
          return user
    }
}
