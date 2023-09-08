import base64
import sys
import cv2
from flask import Flask, jsonify, request
import os
from models_manager import Models_Manager
import numpy as np
from images_processor import ImageProcessor, FaceDetector
from werkzeug.utils import secure_filename
from pathlib import Path

app = Flask(__name__)
app.config.from_prefixed_env()  # Load config from environment variables
app.secret_key = os.environ.get('FLASK_SECRET_KEY', 'dev')
workspace_path = Path(app.root_path).parents[1]
imageProcessor = ImageProcessor()
modelManager = Models_Manager()


@app.route('/check_face', methods=['POST'])
def check_face():
    file = request.files['file']
    if file is not None and file.filename is not None:
        filename = secure_filename(file.filename)

        # if the file's type is jfif convert it to jpg
        if filename.split('.')[-1] == 'jfif':
            filename = filename.split('.')[0] + '.jpg'

        if not allowed_file(filename):
            return jsonify({'message': 'File type not supported'}), 400


        file_bytes = np.fromfile(file.stream, np.uint8)
        try:
            psd1D, zoomedImage = imageProcessor.process_image(
                file_bytes, filename)
            if psd1D is None:
                return jsonify({'message': 'No face detected'}), 400
            scores = modelManager.get_predictions(
                data=np.array([psd1D]))
            print(scores)
            buffer = cv2.imencode('.jpg', zoomedImage)[1]
            encoded_image = base64.encodebytes(buffer).decode('utf-8')
            data = {'zoomed_image': encoded_image, 'prediction': scores}
            return jsonify(data), 200

        except Exception as e:
            print(e)
            exc_type, exc_obj, exc_tb = sys.exc_info()
            if exc_tb is not None:
                fname = os.path.split(
                    exc_tb.tb_frame.f_code.co_filename)[1]
                print(exc_type, fname, exc_tb.tb_lineno)
            if str(e) == 'No face detected':
                return jsonify({'message': 'No face detected'}), 400
            return jsonify({'message': 'Error in processing the image'}), 400
    else:
        return jsonify({'message': 'Image not found in the request. Please provide an image with key "file"'}), 400


@app.route('/detect_faces_and_zoom', methods=['POST'])
def detect_face_and_zoom():
    """
    Detects the faces in the provided source paths [real_data_path, fake_data_path]
    and save the zoomed faces in the provided destination paths [real_data_zoom_path, fake_data_zoom_path].
    """
    source_data_path_real = request.args.get('source_data_path_real')
    source_data_path_fake = request.args.get('source_data_path_fake')
    data_after_zoom_path_real = request.args.get('data_after_zoom_path_real')
    data_after_zoom_path_fake = request.args.get('data_after_zoom_path_fake')
    number_of_images_to_process = request.args.get(
        'number_of_images_in_each_folder', default=200, type=int)
    if source_data_path_real is None \
        or source_data_path_fake is None \
            or data_after_zoom_path_real is None \
        or data_after_zoom_path_fake is None:
        return jsonify({'message': 'Please provide source_data_path_real, source_data_path_fake, data_after_zoom_path_real and data_after_zoom_path_fake'}), 400

    try:
        faceDetector = FaceDetector()
        for (parent_folder, real_or_fake) in [(source_data_path_real, 'real'), (source_data_path_fake, 'fake')]:
            print(f"Parent folder: {parent_folder}")
            for folder in os.listdir(parent_folder):
                if real_or_fake == 'real':
                    path = os.path.join(data_after_zoom_path_real, folder)
                else:
                    path = os.path.join(data_after_zoom_path_fake, folder)
                os.makedirs(path, exist_ok=True)
                cont = 0
                for image_name in os.listdir(os.path.join(parent_folder, folder)):
                    image_path = os.path.join(
                        parent_folder, folder, image_name)
                    if not allowed_file(image_name):
                        print(f'Not allowed file {image_name}')
                        continue
                    image = cv2.imread(image_path, cv2.IMREAD_COLOR)
                    zoomed_face = faceDetector.detect_face_and_zoom(image)
                    if zoomed_face is None:
                        print(f'No face detected in {image_name}')
                        continue
                    image_name_secure = secure_filename(image_name)
                    imageProcessor.save_image_in_upload_folder(image=zoomed_face,
                                                               filename=image_name_secure,
                                                               upload_folder=path)
                    cont += 1
                    if cont == number_of_images_to_process:
                        break
        return jsonify({'message': 'Success'}), 200
    except Exception as e:
        print(e)
        exc_type, exc_obj, exc_tb = sys.exc_info()
        if exc_tb is not None:
            fname = os.path.split(
                exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
        return jsonify({'message': 'Error in processing the image'}), 400


@app.route('/process_images_to_1D', methods=['POST'])
def process_images_to_1D():
    """
    Processes the zoomed faces in the provided source paths [real_data_zoom_path, fake_data_zoom_path]
    and returns the list of 1D PSDs and the list of the corresponding labels (0 for real and 1 for fake).
    """
    real_data_zoom_path = request.args.get('real_data_zoom_path')
    fake_data_zoom_path = request.args.get('fake_data_zoom_path')
    number_of_images_to_process = request.args.get(
        'number_of_images_in_each_folder', default=200, type=int)

    if real_data_zoom_path is None or fake_data_zoom_path is None:
        return jsonify({'message': 'Please provide real_data_zoom_path and fake_data_zoom_path'}), 400

    number_of_folders = len(os.listdir(real_data_zoom_path)) + \
        len(os.listdir(fake_data_zoom_path))
    number_iter = number_of_folders * number_of_images_to_process

    print("number_of_folders: ", number_of_folders)
    i_total = 0
    try:
        psd1D_total = np.zeros([number_iter, 179])
        label_total = np.zeros([number_iter])
        # loop folders real and fake
        for (parent_folder, real_or_fake) in [(real_data_zoom_path, 'real'), (fake_data_zoom_path, 'fake')]:
            print(parent_folder)
            label = 0 if real_or_fake == 'real' else 1
            for folder in os.listdir(parent_folder):
                cont = 0
                print(folder)
                for image in os.listdir(os.path.join(parent_folder, folder)):
                    image_path = os.path.join(parent_folder, folder, image)
                    if not allowed_file(image_path):
                        print(f'Not allowed file {image_path}')
                        continue
                    imageA = cv2.imread(image_path, cv2.IMREAD_COLOR)
                    psd1D = imageProcessor.convert_image_to_1Dspectrum(
                        imageA)
                    psd1D_total[i_total, :] = psd1D
                    label_total[i_total] = label

                    cont += 1
                    i_total += 1
                    if cont == number_of_images_to_process:
                        break
        return jsonify({'message': 'Success', 'psd1D_total': psd1D_total.tolist(), 'label_total': label_total.tolist()}), 200

    except Exception as e:
        print(e)
        exc_type, exc_obj, exc_tb = sys.exc_info()
        if exc_tb is not None:
            fname = os.path.split(
                exc_tb.tb_frame.f_code.co_filename)[1]
            print(exc_type, fname, exc_tb.tb_lineno)
        return jsonify({'message': 'Error in processing the image'}), 400


ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'jfif', 'png'}


def allowed_file(filename: str):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
