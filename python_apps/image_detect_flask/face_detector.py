import os
import numpy as np
import cv2


class FaceDetector:

    def __init__(self):
        cascade_path = os.path.join(
            cv2.data.haarcascades, 'haarcascade_frontalface_alt.xml')
        self.face_cascade = cv2.CascadeClassifier(cascade_path)

    def detect_face_and_zoom(self, frame: cv2.Mat):
        image_gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.__try_to_detect_face(image_gray)
        if len(faces) > 0:
            face = faces[0]
            if len(faces) > 1:
                print("More than one face found")
                face = self.__try_to_get_one_face_from_many(faces)
                if face is None:
                    print("Could not get one face from many")
                    return None
            zoomedFace = self.__extract_face_from_frame(frame, face)
            return zoomedFace
        else:
            return None

    def __extract_face_from_frame(self, frame: cv2.Mat, face: cv2.Mat):
        x, y, w, h = face
        # Set some extra space around the face
        y_offset = int((y * 0.4) / 1.5)
        x_offset = int((x * 0.4) / 2)
        h = h + int(y_offset / 3)
        w = w + int(x_offset / 3)
        zoomedFace = frame[y - y_offset:y + h, x - x_offset:x + w]
        return zoomedFace

    def __try_to_detect_face(self, image_gray: cv2.Mat):
        scale_factor = 1.37
        min_neighbors = 8
        faces: np.ndarray = self.__cascade_detect(
            image_gray, scale_factor, min_neighbors)
        while len(faces) < 1:
            if min_neighbors > 4:
                min_neighbors -= 1
            elif scale_factor > 1.14:
                scale_factor -= 0.01
            else:
                break
            faces: np.ndarray = self.__cascade_detect(
                image_gray, scale_factor, min_neighbors)
        return faces

    def __try_to_get_one_face_from_many(self, faces:  np.ndarray):
        for i, (x, y, w, h) in faces:
            if w > 100 and h > 100:
                return faces[i]
        return None

    def __cascade_detect(self, image_gray: cv2.Mat, scale_factor: float, min_neighbors: int):
        faces: np.ndarray = self.face_cascade.detectMultiScale(
            image_gray, scaleFactor=scale_factor, minNeighbors=min_neighbors, minSize=(60, 60))
        return faces
