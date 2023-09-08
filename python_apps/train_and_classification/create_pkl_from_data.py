"""
This script is used to create pickle file (pkl) from data.
It sends a request to the server to compute the 1D power spectrum density (PSD) of the real and fake images
in the provided source paths [real_data_zoom_path, fake_data_zoom_path].
When the server finishes computing the PSDs, it sends the PSDs and the corresponding labels (psd1D_total, label_total).
Then, this script saves the PSDs and the labels in a pkl file.
"""

import os
import numpy as np
import requests
import pickle

number_of_images_in_each_folder = 8000
current_dir = os.path.dirname(os.path.abspath(__file__))
data_after_zoom_path = os.path.join(current_dir, 'data', 'after_zoom')
real_data_zoom_path = os.path.join(data_after_zoom_path, 'real')
fake_data_zoom_path = os.path.join(data_after_zoom_path, 'fake')


res = requests.post(
    'http://localhost:5000/process_images_to_1D',
    params={
        'real_data_zoom_path': real_data_zoom_path,
        'fake_data_zoom_path': fake_data_zoom_path,
        'number_of_images_in_each_folder': number_of_images_in_each_folder
    })

if (res.status_code == 200):
    data_from_res = res.json()
    data = {}
    data["data"] = np.asarray(data_from_res['psd1D_total'], dtype=np.float32)
    data["label"] = np.asarray(data_from_res['label_total'], dtype=np.float32)
    print(data["label"].shape)
    output = open('data/dataset_48000.pkl', 'wb')
    pickle.dump(data, output)
    output.close()
    print("Saved to data/dataset_48000.pkl")
else:
    print(f"Error: {res.status_code}"
          f"\n{res.text}")
