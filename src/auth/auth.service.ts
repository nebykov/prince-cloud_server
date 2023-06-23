import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import { FileService } from 'src/file/file.service';
import { File } from 'src/file/schemas/file.schema';


@Injectable()
export class AuthService {
   constructor(
      private userService: UserService,
      private jwtService: JwtService,
      private fileService: FileService,
      @InjectModel(File.name) private fileModel: Model<File>,
      @InjectModel(User.name) private userModel: Model<User>
   ) { }


   async registration(dto: CreateUserDto) {
      try {
         const candidate = await this.userModel.findOne({email: dto.email})
         if (candidate) {
            throw new HttpException('User already exists', HttpStatus.BAD_REQUEST)
         }
         const hashedPassword = await bcrypt.hash(dto.password, 8)
         const user = await this.userService.createUser({ email: dto.email, password: hashedPassword })

         if (user) {
            const file = await this.fileModel.create({ user_id: user._id, name: 'Home', type: 'dir' })
            await this.fileService.fsCreateDir(file)
         }
         const token = await this.generateToken(user)
         return {
            token,
            user
         }
      } catch (e) {
         throw new HttpException('Registration error', HttpStatus.BAD_REQUEST)
      }
   }


   async login(dto: CreateUserDto) {
      const user = await this.userService.getByEmail(dto.email)
      if (!user) {
         throw new HttpException('User Not Found', HttpStatus.NOT_FOUND)
      }
      const isValidPassword = await bcrypt.compare(dto.password, user.password)
      if (!isValidPassword) {
         throw new HttpException('Password is not Valid', HttpStatus.BAD_REQUEST)
      }

      const token = await this.generateToken(user)

      return {
         token,
         user
      }
   }


   async auth(userId: string) {
      const user = await this.userService.getById(userId)
      const token = await this.generateToken(user)

      return {
         token,
         user
      }
   }

   private generateToken(user: UserDocument) {
      const payload = { id: user._id }
      const token = this.jwtService.signAsync(payload)
      return token
   }
}