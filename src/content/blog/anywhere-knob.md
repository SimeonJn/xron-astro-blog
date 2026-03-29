---
title: anywhere-knob 基于视觉的隔空旋钮
tags: [knob, project]
cover: /images/image-20240720181610191.png
date: 2024-07-20 13:24:27
references:
  - '[手部特征点检测指南](https://ai.google.dev/edge/mediapipe/solutions/vision/hand_landmarker?hl=zh-cn#models)'
  - '[项目演示视频 - Bilibili](https://www.bilibili.com/video/BV1Um8ge1Ed1/)'
  - '[项目链接 - Github](https://github.com/SimeonJn/Anywhere-Knob-Demo)'
type: tech
---

前几天洗完手，手动甩干的时候，想起[憨豆大指挥家](https://www.bilibili.com/video/BV16x411a7ks/?share_source=copy_web&vd_source=47acea7336f7a6befaace953ceacec83&t=265)里的一个小笑点，通过手指的捏合，旋转，达到控制乐团播放音量大小的效果。(演奏家此刻: 发出尖锐的爆鸣声)

<!-- more -->

{% video bilibili:BV16x411a7ks %}

想法有了，开始实现。我在本科的时候其实制作过一款基于传感器的手语识别系统，但是呢，这套系统又比较的臃肿，你得有对应的手套(上面绑了5个弯曲传感器用于检测弯曲度，一个陀螺仪用于检测方位角和加速度)和一台一直待命的服务器，才能实现这个功能。再加上这套系统的硬件成本较高，平均监测每根手指的成本是100元左右，最后我放弃了使用软硬协同的方案，改为探索利用纯软件来实现这个功能.

我向同学[伊諭刍](https://space.bilibili.com/65190719)请教了基于视觉的人体骨骼识别技术，他给我推荐了两个框架:

其中一个是[openpose](https://github.com/CMU-Perceptual-Computing-Lab/openpose)，但是据说安装等操作比较麻烦。另外一个是谷歌的[mediapipe](https://github.com/google/mediapipe)框架，操作方便些，而且可以在网页上体验这个框架的效果。

人生苦短，我选mediapipe。下面是一些实现的小细节:

## 项目框架

- Project Anywhere Knob
  - anywhere_knob.py
  - multi_dimensions_ring_buffer.py
  - test_multi_dimensional_ring_buffer.py

## 状态机设计

{%image /images/image-20240720257065678.svg %}

## 项目演示

{% video bilibili:BV1Um8ge1Ed1%}

