import { Get, HttpException, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateDirDto } from './dto/create-dir.dto';
import { AuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('file')
export class FileController {
    constructor(private fileService: FileService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    createDir(@Body() dto: CreateDirDto, @Req() req) {
        return this.fileService.createDir(dto, req.user.id)
    }

    @UseGuards(AuthGuard)
    @Get()
    getFiles(@Req() req, @Query('parent') parent: string) {
        try {
            return this.fileService.getFiles(req.user.id, parent)
        } catch (e) {
            throw new HttpException('Token error', HttpStatus.BAD_REQUEST)
        }
    }
}
