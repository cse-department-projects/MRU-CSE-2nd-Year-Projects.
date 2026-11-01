from io import BytesIO
from pathlib import Path
from uuid import uuid4

from PIL import Image, UnidentifiedImageError, features

FORMAT_DETAILS = {
    'JPEG': ('image/jpeg', '.jpg'),
    'PNG': ('image/png', '.png'),
    'WEBP': ('image/webp', '.webp'),
}


class UploadError(Exception):
    def __init__(self, code, message, status=400):
        super().__init__(message)
        self.code = code
        self.status = status


def validate_image(file_storage, max_bytes):
    if not file_storage or not file_storage.filename:
        raise UploadError('missing_file', 'Choose a JPG, PNG, or WEBP prescription image.')
    content = file_storage.stream.read(max_bytes + 1)
    if len(content) > max_bytes:
        raise UploadError('file_too_large', f'The image exceeds the {max_bytes // (1024 * 1024)} MB limit.', 413)
    if not content:
        raise UploadError('empty_file', 'The uploaded file is empty.')
    try:
        with Image.open(BytesIO(content)) as image:
            image_format = image.format
            image.verify()
        with Image.open(BytesIO(content)) as image:
            image.load()
            if image.width < 1 or image.height < 1:
                raise UploadError('invalid_image', 'The image has invalid dimensions.')
    except UploadError:
        raise
    except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError) as error:
        raise UploadError('invalid_image', 'The file content is not a valid supported image.') from error
    if image_format not in FORMAT_DETAILS:
        raise UploadError('unsupported_image', 'Only JPG/JPEG, PNG, and WEBP images are accepted.')
    if image_format == 'WEBP' and not features.check('webp'):
        raise UploadError('unsupported_image', 'WEBP is not supported by this server. Use JPG or PNG.')
    mime_type, extension = FORMAT_DETAILS[image_format]
    return content, mime_type, extension


def store_image(content, extension, upload_dir):
    directory = Path(upload_dir)
    directory.mkdir(parents=True, exist_ok=True)
    filename = f'{uuid4().hex}{extension}'
    (directory / filename).write_bytes(content)
    return filename
