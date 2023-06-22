import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path'
import { CreateDirDto } from './dto/create-dir.dto';

@Injectable()
export class FileService {
    constructor(@InjectModel(File.name) private fileModel: Model<File>) { }

    async createDir(dto: CreateDirDto, userId: string) {
        const file = await this.fileModel.create({ ...dto, user_id: userId, type: 'dir' })
        const parent = await this.fileModel.findOne({ _id: dto.parent })

        if (!parent) {
            file.path = dto.name
            await this.fsCreateDir(file)
        } else {
            file.path = `${parent.path}\\${dto.name}`
            await this.fsCreateDir(file)
            file.parent_id = parent.id
            parent.childs.push(file)
            await parent.save()
        }

        await file.save()
        return file

    }


    async getFiles(userId: string, parentId: string) {
        try {
            const files = await this.fileModel.find({user_id: userId, parent_id: parentId})
            if (!files) {
                throw new HttpException('Files not found', HttpStatus.NOT_FOUND)
            }
            return files
        } catch (e) {
            throw new HttpException('Getting error', HttpStatus.BAD_REQUEST)
        }
    }

    async fsCreateDir(file: File) {
        try {
            const filePath = path.resolve(__dirname, '..', 'static', `${file.user_id}\\${file.path}`)
            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, {recursive: true})
                return { message: 'File was created!' }
            } else {
                throw new HttpException(`File already exists`, HttpStatus.BAD_REQUEST)
            }
        } catch (e) {
            throw new HttpException(`${e} file saving error`, HttpStatus.BAD_REQUEST)
        }
    }
}
