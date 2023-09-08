from pathlib import Path
import os
import numpy as np
import cv2
from numpy.typing import NDArray
from face_detector import FaceDetector

epsilon = 1e-8


class ImageProcessor:

    def __init__(self) -> None:
        self.face_detector = FaceDetector()

    def process_image(self, file_bytes: NDArray[np.uint], filename: str):
        """
        Detect face and zoom it, then convert it to 1D power spectrum

        file_bytes: Image file bytes
        filename: The name of the image file (with extension)
        """
        # Convert file bytes to image (cv2.Mat)
        image: cv2.Mat = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        zoomedImage = self.face_detector.detect_face_and_zoom(image)
        if zoomedImage is None:
            raise Exception("No face detected")
        psd1D = self.convert_image_to_1Dspectrum(zoomedImage)
        # Normalize the 1D power spectrum to 0-1.
        psd1D = psd1D / 179
        return psd1D, zoomedImage

    def convert_image_to_1Dspectrum(self, image: cv2.Mat):
        image_gray = self.__convert_image_to_grayscale(image)
        f = np.fft.fft2(image_gray)
        fshift = np.fft.fftshift(f)
        fshift += epsilon
        magnitude_spectrum = 20*np.log(np.abs(fshift))
        magnitude_spectrum = cv2.resize(magnitude_spectrum, (256, 256))
        psd1D: np.ndarray = azimuthalAverage(magnitude_spectrum)
        print(psd1D.shape)
        print(22)
        return psd1D

    def save_image_in_upload_folder(self, image: cv2.Mat, filename: str, upload_folder: str):
        if upload_folder == "":
                raise Exception("UPLOAD_FOLDER is not set")
        save_path = os.path.join(upload_folder, "after_zoom")
        os.makedirs(save_path, exist_ok=True)
        file_path = Path(filename)
        zoomed_image_name = file_path.stem + "_zoomed" + file_path.suffix
        path = os.path.join(save_path, f"{zoomed_image_name}")
        cv2.imwrite(path, image, [int(cv2.IMWRITE_JPEG_QUALITY), 120])
        return path

    def __convert_image_to_grayscale(self, image: cv2.Mat):
        image_gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        image_gray = cv2.imencode(
            '.jpg', image_gray, [int(cv2.IMWRITE_JPEG_QUALITY), 120])[1]
        image_gray: np.ndarray = cv2.imdecode(image_gray, cv2.IMREAD_GRAYSCALE)
        return image_gray


# from https://www.astrobetter.com/blog/2010/03/03/fourier-transforms-of-images-in-python/
def azimuthalAverage(image, center=None):
    """
    Calculate the azimuthally averaged radial profile.

    image - The 2D image
    center - The [x,y] pixel coordinates used as the center. The default is
             None, which then uses the center of the image (including
             fracitonal pixels).

    """
    # Calculate the indices from the image
    y, x = np.indices(image.shape)

    if not center:
        center = np.array(
            [(x.max()-x.min())/2.0, (y.max()-y.min())/2.0])

    r = np.hypot(x - center[0], y - center[1])

    # Get sorted radii
    ind = np.argsort(r.flat)
    r_sorted = r.flat[ind]
    i_sorted = image.flat[ind]

    # Get the integer part of the radii (bin size = 1)
    r_int = r_sorted.astype(int)

    # Find all pixels that fall within each radial bin.
    deltar = r_int[1:] - r_int[:-1]  # Assumes all radii represented
    rind = np.where(deltar)[0]       # location of changed radius
    nr = rind[1:] - rind[:-1]        # number of radius bin

    # Cumulative sum to figure out sums for each radius bin
    csim = np.cumsum(i_sorted, dtype=float)
    tbin = csim[rind[1:]] - csim[rind[:-1]]

    radial_prof = tbin / nr

    return radial_prof
