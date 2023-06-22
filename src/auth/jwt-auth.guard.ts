import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";


@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService
    ) { }
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        try {
            const auhorization = request.headers.authorization
            const bearer = auhorization.split(' ')[0]
            const token = auhorization.split(' ')[1]

            if (!bearer || !token) {
                throw new UnauthorizedException('Auth Error')
            }

            const user = this.jwtService.verify(token)
            request.user = user

            return true
        } catch (e) {
            throw new HttpException('Auth exception', HttpStatus.BAD_REQUEST)
        }
    }
}