"""
This script is used to train SVC, LogisticRegression and NN models.
It loads the data from the pickle file (pkl), split it into train and test sets, train the models and save them.
"""

from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
import numpy as np
import pickle
from numpy.typing import NDArray
from joblib import dump
import tensorflow as tf
from tensorflow.python.keras import models, layers, losses, activations

# Load data from pickle file
pkl_file_name = 'dataset_48000.pkl'
pkl = open(pkl_file_name, 'rb')
data = pickle.load(pkl)
pkl.close()

# Convert data to numpy array and normalize
X: NDArray[np.float32] = data["data"] / 179.0
y: NDArray[np.float32] = data["label"]

# Print data info and check if data is balanced
number_of_fake_images = len(y[y == 1])
number_of_real_images = len(y[y == 0])
print(f"X shape: {X.shape}")
print(f"number of fake images: {number_of_fake_images}")
print(f"number of real images: {number_of_real_images}")
if number_of_fake_images != number_of_real_images:
    print("Data is not balanced. Please check")
    exit()

# Split data to train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train SVC and LogisticRegression models


def train_svc_and_logistic_regression(save_model=False):
    svclassifier = SVC(kernel='linear')
    svclassifier.fit(X_train, y_train)
    logreg = LogisticRegression(solver='liblinear', max_iter=1000)
    logreg.fit(X_train, y_train)
    print(f"SVC score: {svclassifier.score(X_test, y_test)}")
    print(f"LogisticRegression score: {logreg.score(X_test, y_test)}")
    if save_model:
        dump(svclassifier, f'saved_model/svc_{pkl_file_name[:-4]}.joblib')
        dump(logreg, f'saved_model/logreg_{pkl_file_name[:-4]}.joblib')
    return logreg, svclassifier


# Train NN model
def train_nn(save_model=False):
    X_train_expand = tf.expand_dims(X_train, axis=-1)
    X_test_expand = tf.expand_dims(X_test, axis=-1)
    model = models.Sequential()
    model.add(layers.Conv1D(32, 4, activation=activations.tanh,
              input_shape=X_train_expand[0].shape))
    model.add(layers.Flatten())
    model.add(layers.Dense(1, activation=activations.sigmoid))
    model.compile(optimizer="adam",
                  loss=losses.BinaryCrossentropy(from_logits=False),
                  metrics=["accuracy"])
    model.fit(X_train_expand, y_train, epochs=100, batch_size=64,
              validation_data=(X_test_expand, y_test))
    test_loss, test_acc = model.evaluate(X_test_expand,  y_test, verbose=2)
    print(f"Test accuracy: {test_acc}")
    if save_model:
        model.save(f'saved_model/nn_sigmod_100epochs_{pkl_file_name[:-4]}')
    return model


train_svc_and_logistic_regression(save_model=True)
train_nn(save_model=True)
