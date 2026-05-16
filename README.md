# 🌿 Smart Recycling AI

AI-powered waste classification and segmentation system with a FastAPI backend.

## Project Structure

```
Waste Managment/
├── config/config.yaml              # All hyperparameters & paths
├── data/                           # Datasets (auto-downloaded)
│   ├── raw/                        #   TrashNet raw images
│   ├── processed/                  #   Split into train/val/test
│   └── taco/                       #   TACO segmentation dataset
├── model/
│   ├── weights/                    #   Trained model weights
│   ├── training/                   #   Classification training
│   │   ├── augmentations.py        #     Albumentations pipelines
│   │   ├── dataset.py              #     PyTorch Dataset + DataLoader
│   │   └── train.py                #     EfficientNet-B2 training loop
│   ├── inference/                  #   Prediction modules
│   │   ├── labels.py               #     Class → guidance mapping
│   │   ├── predictor.py            #     Single-item classifier
│   │   └── seg_predictor.py        #     Multi-item segmenter
│   └── segmentation/               #   YOLOv8-seg training
│       ├── train_seg.py            #     YOLO training script
│       └── export_onnx.py          #     ONNX export for deployment
├── scripts/                        # Data preparation
│   ├── download_data.py            #   Download TrashNet from Kaggle
│   ├── prepare_dataset.py          #   Map labels & split dataset
│   └── prepare_taco_yolo.py        #   Download & prepare TACO
├── tests/                          # Test scripts for the API
│   ├── test_api.py                 #   Test /classify endpoint
│   ├── test_segmentation.py        #   Test /segment endpoint
│   └── visualize_results.py        #   Generate HTML report
├── train_colab.ipynb               # Colab notebook for EfficientNet
├── train_seg_colab.ipynb           # Colab notebook for YOLOv8
├── main.py                         # FastAPI server
├── requirements.txt                # Python dependencies
└── .gitignore
```

## Two Models, One API

| Model | Endpoint | Purpose |
|---|---|---|
| EfficientNet-B2 | `POST /classify` | Single clean item → class + confidence |
| YOLOv8m-seg | `POST /segment` | Mixed photo → per-item masks + guidance |

## Quick Start

```bash
# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Download & prepare datasets
python scripts/download_data.py
python scripts/prepare_dataset.py
python scripts/prepare_taco_yolo.py

# 4. Train classification model
python model/training/train.py

# 5. Train segmentation model
python model/segmentation/train_seg.py

# 6. Run the API server
python main.py
```

API docs available at: **http://localhost:8000/docs**

## Waste Classes

| Class | Bin Color | Reward Points |
|---|---|---|
| Plastic | 🟡 Yellow | 10 |
| Paper | 🔵 Blue | 8 |
| Glass | 🟢 Green | 12 |
| Metal | ⚫ Grey | 15 |
| Organic | 🟤 Brown | 5 |
| E-Waste | 🔴 Red | 25 |
