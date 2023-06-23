import { Get, HttpException, HttpStatus, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Body, Controller, Post } from '@nestjs/common';
import { FileService } from './file.service';
import { CreateDirDto } from './dto/create-dir.dto';
import { AuthGuard } from 'src/auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('file')
export class FileController {
    constructor(private fileService: FileService) { }

    @UseGuards(AuthGuard)
    @Post('create')
    createDir(@Body() dto: CreateDirDto, @Req() req) {
        return this.fileService.createDir(dto, req.user.id)
    }

    @UseGuards(AuthGuard)
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Req() req, @Body('parent') parentId, @UploadedFile() file: Express.Multer.File) {
        return this.fileService.uploadFile(req.user.id, parentId, file)
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
