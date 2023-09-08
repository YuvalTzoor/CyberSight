"""
This script is used to prepare data for training.
It sends a request to the server to detect the faces in the provided source paths [real_data_path, fake_data_path]
and to save the zoomed faces in the provided destination paths [real_data_zoom_path, fake_data_zoom_path].
"""

import os
import sys
import requests

number_of_images_in_each_folder = 8000
current_dir = os.path.dirname(os.path.abspath(__file__))
data_before_zoom_path = os.path.join(current_dir, 'data', 'before_zoom')
data_after_zoom_path = os.path.join(current_dir, 'data', 'after_zoom')
real_data_path = os.path.join(data_before_zoom_path, 'real')
fake_data_path = os.path.join(data_before_zoom_path, 'fake')
real_data_zoom_path = os.path.join(data_after_zoom_path, 'real')
fake_data_zoom_path = os.path.join(data_after_zoom_path, 'fake')

if not os.path.exists(real_data_path) or not os.path.exists(fake_data_path):
    print('Error: data not found')
    sys.exit(1)

res = requests.post(
    'http://localhost:5000/detect_faces_and_zoom',
    params={
        'source_data_path_real': real_data_path,
        'source_data_path_fake': fake_data_path,
        'data_after_zoom_path_real': real_data_zoom_path,
        'data_after_zoom_path_fake': fake_data_zoom_path,
        'number_of_images_in_each_folder': number_of_images_in_each_folder
    })
if (res.status_code == 200):
    print('Success')
else:
    print(f"Error: {res.status_code}"
          f"\n{res.text}")
