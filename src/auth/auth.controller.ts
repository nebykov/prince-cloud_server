import { Body, Controller, Post, Get, UseGuards, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "src/user/dto/create-user.dto";
import { AuthGuard } from "./jwt-auth.guard";


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('registration')
    registration(@Body() dto: CreateUserDto) {
        return this.authService.registration(dto)
    }

    @Post('login')
    login(@Body() dto: CreateUserDto) {
        return this.authService.login(dto)
    }

    @UseGuards(AuthGuard)
    @Get('auth')
    auth(@Req() req) {
       return this.authService.auth(req.user.id)
    }
}