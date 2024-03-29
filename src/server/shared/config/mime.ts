import { PresignedPost } from "aws-sdk/clients/s3";

export const MIME_CONFIG = {
    contentType: 'content-type',
    json: 'application/json',
};

export const getExtension = (mimeType: string) :string =>{
    switch (mimeType){
        case 'image/pgn':
            return 'pgn';
        case 'image/jpeg':
            return 'jpeg';
        case 'image/gif':
            return 'gif';
        case 'image/bmp':
            return 'bmp';
        case 'video/mp4':
            return 'mp4';
        default: 
            return '';
    }
}