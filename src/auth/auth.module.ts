import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";


@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET
        })
    ]
})

export class AuthModule {}