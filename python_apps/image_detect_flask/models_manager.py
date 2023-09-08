import os
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from joblib import load
import tensorflow as tf
from keras.models import Sequential, load_model
from numpy.typing import NDArray


class Models_Manager:
    def __init__(self):
        self.__load_models()

    # get the models from the disk
    def __load_models(self):
        models_path = os.path.join(
            os.path.dirname(__file__), 'trained_models')
        models_names = {
            'svc': 'svc_dataset_48000.joblib',
            'logreg': 'logreg_dataset_48000.joblib',
            'neural_net': 'nn_sigmod_100epochs_dataset_48000'
        }
        self.svclassifier: SVC = load(
            os.path.join(models_path, models_names['svc']))
        self.logreg: LogisticRegression = load(
            os.path.join(models_path, models_names['logreg']))
        self.neural_net_model: Sequential = load_model(os.path.join(
            models_path, models_names['neural_net']))  # type: ignore

        if self.svclassifier is None or self.logreg is None or self.neural_net_model is None:
            raise Exception('Failed to load models')

    # get predictions(1 or 0 per model) from all models for the given data
    def get_predictions(self, data: NDArray):
        psd1D = self.__process_data_for_neural_net_model__(data)
        svclassifier_pred = self.svclassifier.predict(data)
        logreg_pred = self.logreg.predict(data)
        neural_net_pred = self.neural_net_model.predict(psd1D)
        predicitons = {'svclassifier_pred': round(svclassifier_pred[0]),
                       'logreg_pred': round(logreg_pred[0]), 'neural_net_pred': round(neural_net_pred[0][0])}
        return predicitons

    # get scores from all models for the given data and the true labels (1 or 0)
    def get_pred_score(self, data: NDArray, true_labels: NDArray):
        psd1D = self.__process_data_for_neural_net_model__(data)
        svclassifier_score = self.svclassifier.score(X=data, y=true_labels)
        logreg_score = self.logreg.score(X=data, y=true_labels)
        neural_net_score = self.neural_net_model.evaluate(
            x=psd1D, y=np.array(true_labels), verbose='0')[1]
        scores = {'svclassifier_score': svclassifier_score,
                  'logreg_score': logreg_score, 'neural_net_score': neural_net_score}
        return scores

    def __process_data_for_neural_net_model__(self, data:  np.ndarray):
        psd1D = tf.expand_dims(data, axis=-1)
        return psd1D
