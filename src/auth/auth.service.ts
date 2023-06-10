import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserDocument } from 'src/user/schemas/user.schema';
import { UserService } from 'src/user/user.service';


@Injectable()
export class AuthService {
    constructor(private userService: UserService) {}

    async registration(dto: CreateUserDto) {
        
    }

    async generateToken(user: UserDocument) {
         const payload = {id: user._id, email: user.email}
    }
}