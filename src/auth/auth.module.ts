import { Module, forwardRef } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UserModule } from "src/user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { FileModule } from "src/file/file.module";


@Module({
    providers: [AuthService],
    controllers: [AuthController],
    imports: [
        UserModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret',
            signOptions: {expiresIn: '24h'}
        }),
        forwardRef(() => FileModule)
    ],
    exports: [JwtModule]
})

export class AuthModule {}