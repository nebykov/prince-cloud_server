import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { File } from './schemas/file.schema';
import { Model } from 'mongoose';
import * as fs from 'fs';
import * as path from 'path'
import { CreateDirDto } from './dto/create-dir.dto';
import { User } from 'src/user/schemas/user.schema';

@Injectable()
export class FileService {
    constructor(
        @InjectModel(File.name) private fileModel: Model<File>,
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async createDir(dto: CreateDirDto, userId: string) {
        const file = await this.fileModel.create({ ...dto, user_id: userId, type: 'dir' })
        const parent = await this.fileModel.findOne({ _id: dto.parent })

        if (!parent) {
            file.path = path.resolve(__dirname, '..', 'static', userId, dto.name)
            await this.fsCreateDir(file)
        } else {
            file.path = path.resolve(__dirname, '..', 'static', userId, parent.path, dto.name)
            await this.fsCreateDir(file)
            file.parent_id = parent.id
            parent.childs.push(file)
            await parent.save()
        }

        await file.save()
        return file

    }

    async uploadFile(userId: string, parentId: string, file: Express.Multer.File) {
        try {
            const user = await this.userModel.findById(userId)
            const parent = await this.fileModel.findOne({ user_id: userId, _id: parentId })

            if (user.usedSpace + file.size > user.diskSpace) {
                throw new HttpException('Storage is full', HttpStatus.BAD_REQUEST)
            }

            user.usedSpace += file.size

            let filePath: string;
            if (parent) {
                filePath = path.resolve(__dirname, '..', 'static', user.id, parent.path)
            } else {
                filePath = path.resolve(__dirname, '..', 'static', user.id)
            }

            if (!fs.existsSync(filePath)) {
                fs.mkdirSync(filePath, { recursive: true })
            }

            fs.writeFileSync(path.resolve(filePath, file.originalname), file.buffer)

            const type = file.originalname.split('.').pop()

            const dbFile = await this.fileModel.create({
                name: file.originalname,
                type,
                size: file.size,
                parent_id: parent?.id,
                path: path.resolve(filePath, file.originalname),
                user_id: user.id
            })

            await user.save()

            return dbFile;
        } catch (e) {
            throw new HttpException(e.response, HttpStatus.BAD_REQUEST)
        }
    }

    async downloadFile(userId: string, fileId: string, res: any) {
        try {
            const file = await this.fileModel.findOne({ user_id: userId, _id: fileId })
            const filePath = path.resolve(__dirname, '..', 'static', file.path)
            if (fs.existsSync(filePath)) {
                res.download(filePath, file.name)
            }
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST)
        }
    }


    async deleteFile(userId: string, fileId: string) {
        try {
            const file = await this.fileModel.findOne({ user_id: userId, _id: fileId })
            const filePath = path.resolve(__dirname, '..', 'static', file.path)
            if (!file) {
                throw new HttpException('File not Found', HttpStatus.NOT_FOUND)
            }

            if (file.type === 'dir' && filePath) {
                fs.rmdirSync(filePath)
            } else {
                fs.unlinkSync(filePath)
            }
            await file.deleteOne()
            return file
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST)
        }
    }

    async searchFiles(userId: string, query: string) {
        try {
             const files = await this.fileModel.find({name: {$regex: new RegExp(query, 'i')}})
             return files;
        } catch (e) {
            throw new HttpException(e, HttpStatus.BAD_REQUEST)
        }
    }


    async getFiles(userId: string, parentId: string, sortBy: string) {
        try {
            let files: any;
            switch (sortBy) {
                case 'name':
                    files = await this.fileModel.find({ user_id: userId, parent_id: parentId }).sort({ name: 1 })
                    break;
                case 'type':
                    files = await this.fileModel.find({ user_id: userId, parent_id: parentId }).sort({ type: 1 })
                    break;
                case 'size':
                    files = await this.fileModel.find({ user_id: userId, parent_id: parentId }).sort({ size: 1 })
                default:
                    files = await this.fileModel.find({ user_id: userId, parent_id: parentId })
            }
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
            if (!fs.existsSync(file.path)) {
                await fs.promises.mkdir(file.path, { recursive: true });
                return { message: 'File was created!' }
            } else {
                throw new HttpException(`File already exists`, HttpStatus.BAD_REQUEST)
            }
        } catch (e) {
            throw new HttpException(`${e} file saving error`, HttpStatus.BAD_REQUEST)
        }
    }
}
