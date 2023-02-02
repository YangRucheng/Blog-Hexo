---
title: 动手学深度学习树叶图片分类实战
tags: cnn
cover: https://cloud.micono.xyz/api/v3/file/source/417/75353822_p0.jpg?sign=PrLXjNYjJ0IOLsmh8S63LQxJ--vy1b-sCzp_wIqGS1I%3D%3A0
katex: false
---



## 1.思路讲解

李沐的《动手学深度学习》的[树叶分类](https://www.kaggle.com/competitions/classify-leaves/leaderboard)实战部分。

先放张排名图，因为比赛时间截止了，只有自己的得分，在私榜排名67/165

![{YD2LU09(PCH{RQV)9H6E)H.png](https://tva1.sinaimg.cn/large/008mlEnHgy1h88dpabjguj31590490ub.jpg)

基于resnet50微调，没有设置验证集因此没有对超参数进行过多调整。因此还有优化的空间，可将此代码作为baseline。

## 2.代码部分

先下载数据集，注意此处需要使用kaggle的api，此处不再详细解释。[具体使用可参见](https://www.kaggle.com/competitions/classify-leaves/leaderboard)

```python
!kaggle competitions download -c classify-leaves 
```

```python
!unzip classify-leaves.zip #解压文件
```

### 1.导入需要的包

```python
import numpy as np
import pandas as pd
import torch
import tqdm
import os
import shutil
from tqdm.auto import tqdm
```


```python
import torch.nn as nn
import torchvision.transforms as transforms
from torch.utils.data import  DataLoader
from torchvision.datasets import DatasetFolder,ImageFolder
# This is for the progress bar.
from tqdm import tqdm
```

### 2.数据集处理

在这篇代码中我并没有自己重构一个dataset，而是使用ImageFolder来加载数据集。

![09DE9EJQW$KY%J_`~)DPK96.png](https://tva1.sinaimg.cn/large/008mlEnHgy1h887cdwv2ej30sl08mdjj.jpg)


```python
def read_csv(csv_file):
    with open(csv_file, 'r') as f:
        lines = f.readlines()[1:]
    if csv_file == test_path:
    	token = [l.rstrip() for l in lines]
    	for img_path in token:
        	os.makedirs('./data/leaves/test/unkown',exist_ok=True)
        	shutil.copy(os.path.join('./data/leaves', img_path),'./data/leaves/test/unkown')
    else:
        token = [l.rstrip().split(',') for l in lines]
    	for img_path,target in token:
        	os.makedirs(os.path.join('./train',target),exist_ok=True)
        	shutil.copy(img_path,os.path.join('./train',target))
read_csv(train_path)
read_csv(test_path)
```


```python
#对图片进行增广处理，值得注意的是该题应尽量只采用旋转的方法，其他增广方法都有可能降低正确率
train_tfm = transforms.Compose([
    # Resize the image into a fixed shape (height = width = 224)
    transforms.Resize((224, 224)),
    transforms.ColorJitter(0.3, 0.3, 0.2),
    transforms.RandomRotation(10),
    transforms.RandomHorizontalFlip(p=0.5),   #随机水平翻转
    transforms.RandomVerticalFlip(p=0.5),
    # You may add some transforms here.
    # ToTensor() should be the last one of the transforms.
    transforms.ToTensor(),
    transforms.Normalize([0.4914, 0.4822, 0.4465],
                         [0.2023, 0.1994, 0.2010])
])

# We don't need augmentations in testing and validation.
# All we need here is to resize the PIL image and transform it into Tensor.
test_tfm = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.4914, 0.4822, 0.4465],
                         [0.2023, 0.1994, 0.2010])
])
```


```python
batch_size = 64
#批量处理尺寸可根据显卡显存自行修改
# Construct datasets.
# The argument "loader" tells how torchvision reads the data.
train_set = ImageFolder("./data/leaves/train",  transform=train_tfm)
test_set = ImageFolder("./data/leaves/test",  transform=test_tfm)

# Construct data loaders.
train_loader = DataLoader(train_set, batch_size=batch_size, shuffle=True, num_workers=8)
test_loader = DataLoader(test_set, batch_size=batch_size, shuffle=False, num_workers=8)
```

### 3.模型定义及具体训练过程

```python
import torchvision.models as models
```

定义模型


```python
class Classifier(nn.Module):
    def __init__(self):
        super(Classifier, self).__init__()
     	# 使用resnet50模型
        # input image size: [3, 128, 128]
        self.cnn_layers = models.resnet50(pretrained = True)
        self.fc_layers = nn.Sequential(
            nn.Linear(1000, 512),
            nn.Dropout(0.2),
            nn.ReLU(),
            nn.Linear(512, 256),
            nn.Linear(256,176)
        )
		#对已经训练好的模型进行微调时，注意不要在最后添加过多全连接层，以及最后一层前避免使用dropout
    def forward(self, x):
        # input (x): [batch_size, 3, 128, 128]
        # output: [batch_size, 11]

        # Extract features by convolutional layers.
        x = self.cnn_layers(x)

        # The extracted feature map must be flatten before going to fully-connected layers.
        #x = x.flatten(1)

        # The features are transformed by fully-connected layers to obtain the final logits.
        x = self.fc_layers(x)
        return x
```


```python
# "cuda" only when GPUs are available.
device = "cuda" if torch.cuda.is_available() else "cpu"

# Initialize a model, and put it on the device specified.
model = Classifier().to(device)
model.device = device

# For the classification task, we use cross-entropy as the measurement of performance.
criterion = nn.CrossEntropyLoss()

# Initialize optimizer, you may fine-tune some hyperparameters such as learning rate on your own.
optimizer = torch.optim.Adam(model.parameters(), lr=1e-4, weight_decay=1e-3)

# The number of training epochs.
n_epochs = 30

# Whether to do semi-supervised learning.

for epoch in range(n_epochs):
    model.train()

    # These are used to record information in training.
    train_loss = []
    train_accs = []

    # Iterate the training set by batches.
    for batch in tqdm(train_loader):

        # A batch consists of image data and corresponding labels.
        imgs, labels = batch

        # Forward the data. (Make sure data and model are on the same device.)
        logits = model(imgs.to(device))

        # Calculate the cross-entropy loss.
        # We don't need to apply softmax before computing cross-entropy as it is done automatically.
        loss = criterion(logits, labels.to(device))

        # Gradients stored in the parameters in the previous step should be cleared out first.
        optimizer.zero_grad()

        # Compute the gradients for parameters.
        loss.backward()

        # Clip the gradient norms for stable training.
        grad_norm = nn.utils.clip_grad_norm_(model.parameters(), max_norm=10)

        # Update the parameters with computed gradients.
        optimizer.step()

        # Compute the accuracy for current batch.
        acc = (logits.argmax(dim=-1) == labels.to(device)).float().mean()

        # Record the loss and accuracy.
        train_loss.append(loss.item())
        train_accs.append(acc)

    # The average loss and accuracy of the training set is the average of the recorded values.
    train_loss = sum(train_loss) / len(train_loss)
    train_acc = sum(train_accs) / len(train_accs)

    # Print the information.
    print(f"[ Train | {epoch + 1:03d}/{n_epochs:03d} ] loss = {train_loss:.5f}, acc = {train_acc:.5f}")
```

### 4.将预测结果输出成csv文件


```python
preds = []#此处要注意label与文件名之间的对应关系
model.eval()
for X, _ in test_loader:
    y_hat = model(X.to(device))
    preds.extend(y_hat.argmax(dim=1).type(torch.int32).cpu().numpy())
sorted_ids = os.listdir('./data/leaves/test/unkown')
sorted_ids.sort(key=lambda x: str(x))
df = pd.DataFrame({'image': sorted_ids, 'label': preds})
df['label'] = df['label'].apply(lambda x: train_set.classes[x])
df.to_csv('submission.csv', index=False)
```
