---
title: BNEP协议小结
tags: [protocol,BNEP]
cover: /images/image-20240513205946689.png
date: 2024-05-14 00:00:00
type: tech
references:
  - '[Bluetooth Network Encapsulation Protocol 1.0](https://www.bluetooth.org/docman/handlers/DownloadDoc.ashx?doc_id=6552)' 
---

## BNEP 概述

使用面向连接的 L2CAP 信道实现

![Stack Overview](/images/image-20240513205946689.png)



## 数据包封装

BNEP 删除Ethernet Header并将其替换为 BNEPHeader。其提供的功能类似于以太网（EthernetII/DIXFraming /IEEE 802.3）提供的功能。

![BNEP with an Ethernet Packet payload sent using L2CAP](/images/image-20240513210529592.png)



### BNEP报头格式

所有 BNEP 标头都采用以下格式:

![BNEP Header Format](/images/image-20240513210943381.png)

**BNEP Type:**	7Bits

| 值(0x00-0x7F) | BNEP数据包类型                                |
| ------------- | --------------------------------------------- |
| 0x00          | BNEP_GENERAL_ETHERNET                         |
| 0x01          | BNEP_CONTROL                                  |
| 0x02          | BNEP_COMPRESSED_ETHERNET                      |
| 0x03          | BNEP_COMPRESSED_ETHERNET_SOURCE_ONLY          |
| 0x04          | BNEP_COMPRESSED_ETHERNET_DEST_ONLY            |
| 0x05-0x7E     | 保留                                          |
| 0x7F          | 保留用于 IEEE 802.15.1 WG 的 802.2 LLC 数据包 |

**Extension Flag (E):**	1Bits

| 值              | 参数说明                                 |
| --------------- | ---------------------------------------- |
| 0x00 **/** 0x01 | 指示一个或多个扩展标头跟在 BNEP 标头之后 |



### BNEP_GENERAL_ETHERNET 数据包类型报头格式

此数据包类型应用于将以太网数据包传输到蓝牙网络和从蓝牙网络传输

![BNEP_GENERAL_ETHERNET Packet Type Header](/images/image-20240513212331256.png)

**BNEP Type, Extension Flag (E):** 前略

**Destination / Source Address:**	6Bytes

| Value          | 参数说明                                                     |
| -------------- | ------------------------------------------------------------ |
| 0xXXXXXXXXXXXX | 48位蓝牙设备地址/有效负载中包含的BNEP数据包/以太网帧源的IEEE地址 |

> [!NOTE]
>
> 如果实际目标/源是IEEE设备而不是蓝牙设备，则目标地址或源地址可以是IEEE以太网地址。

**Networking Protocol Type:**	2Bytes

| Value  | 参数说明                         |
| ------ | -------------------------------- |
| 0xXXXX | 标识有效负载中包含的网络协议类型 |

### BNEP_ CONTROL数据包类型报头格式

BNEP_CONTROL数据包类型用于交换控制信息。

![BNEP_ CONTROL Packet Type Header](/images/image-20240513213905624.png)

**BNEP Type, Extension Flag (E):** 前略

**BNEP Control Type:**	1Byte

| 值(0x00-0xFF) | BNEP Control 数据包类型             |
| ------------- | ----------------------------------- |
| 0x00          | BNEP_CONTROL_COMMAND_NOT_UNDERSTOOD |
| 0x01          | BNEP_SETUP_CONNECTION_REQUEST_MSG   |
| 0x02          | BNEP_SETUP_CONNECTION_RESPONSE_MSG  |
| 0x03          | BNEP_FILTER_NET_TYPE_SET_MSG        |
| 0x04          | BNEP_FILTER_NET_TYPE_RESPONSE_MSG   |
| 0x05          | BNEP_FILTER_MULTI_ADDR_SET_MSG      |
| 0x06          | BNEP_FILTER_MULTI_ADDR_RESPONSE_MSG |
| 0x07–0xFF     | 保留                                |

#### BNEP_CONTROL_COMMAND_NOT_UNDERSTOOD 数据包

此数据包应用于回复收到的任何控制消息，包含未知的 BNEP 控制类型值。这允许设备响应将来可能使用的新控制消息。

![BNEP_CONTROL_COMMAND_NOT_UNDERSTOOD control message format](/images/image-20240513215134517.png)

**BNEP Type, Extension Flag (E), BNEP Control Type:** 前略

**Unknown Control Type:**	1Byte

| Value | 参数说明                                       |
| ----- | ---------------------------------------------- |
| 0xXX  | 先前收到并导致发送此消息的 BNEP 控制消息的类型 |

#### BNEP_SETUP_CONTROL数据包

此数据包类型应包含用于设置有关 BNEP 连接的初始连接信息的控制消息。

> [!IMPORTANT]
>
> BNEP_SETUP_CONTROL数据包类型应**按接收顺序进行处理**。对于每个连接，只允许有一条未处理的BNEP_SETUP_CONNECTION_REQUEST_MSG消息。
>
> 如果在 Tcrt 时间过后未收到响应消息，则可以假定未处理的BNEP_SETUP_CONNECTION_REQUEST_MSG消息丢失，并且可以重新传输相同的BNEP_SETUP_CONNECTION_REQUEST_MSG消息。



**消息格式**

##### BNEP_SETUP_CONNECTION_REQUEST_MSG: 

![BNEP_SETUP_CONNECTION_REQUEST_MSG control message format](/images/image-20240513222217087.png)

通知对等实体用于此 BNEP 连接的目标和源 SDP 服务 UUID, 为 BNEP 启动 L2CAP 连接的设备应发送此控制消息。


**BNEP Type, Extension Flag (E), BNEP Control Type:** 前略

**UUID Size:**	1Byte

| Value | 参数说明                                                     |
| ----- | ------------------------------------------------------------ |
| 0xXX  | 标识其中一个 SDP 服务的 UUID 长度, 以字节为单位<br/>目标和源的服务 UUID 长度应相同 |

**Destination Service UUID:**	2-16Bytes

| Value | 参数说明                             |
| ----- | ------------------------------------ |
| 0xXX  | 服务源设备正在连接到的 SDP 服务 UUID |

**Source Service UUID:**	2-16Bytes

| Value | 参数说明                                    |
| ----- | ------------------------------------------- |
| 0xXX  | (该服务源设备用于 BNEP 连接的) SDP服务 UUID |



##### BNEP_SETUP_CONNECTION_RESPONSE_MSG: 

用于响应控制消息的每个BNEP_SETUP_CONNECTION_REQUEST_MSG。每条接收到的设置控制消息都应由一条响应消息响应。

**BNEP Type, Extension Flag (E), BNEP Control Type:** 前略

**Response Message:**	2Byte

| Value         | 参数说明                                                     |
| ------------- | ------------------------------------------------------------ |
| 0x0000        | 操作成功                                                     |
| 0x0001        | 操作失败：目标服务 UUID 无效<br />（UUID 不是使用 BNEP 的配置文档定义的服务 UUID） |
| 0x0002        | 操作失败：源服务 UUID 无效<br />（UUID 不是使用 BNEP 的配置文档定义的服务 UUID） |
| 0x0003        | 操作失败：服务 UUID 大小无效                                 |
| 0x0004        | 操作失败：不允许连接                                         |
| 0x0005-0xFFFF | 保留                                                         |

##### BNEP_FILTER_CONTROL 数据包(可选)

BNEP_FILTER_CONTROL数据包类型应按接收顺序进行处理。这允许蓝牙设备确定要过滤哪些类型的数据包以**节省网络带宽**。

对于每个连接，每个过滤器只有一个未完成的BNEP_FILTER_CONTROL_SET消息

(具体细节参考PDF Page:24)

### BNEP_COMPRESSED 数据包

#### BNEP_COMPRESSED_ETHERNET 数据包

此数据包类型应用于使用 BNEP 将以太网数据包传入或传出以 L2CAP 级别直接连接的设备（具有有效的 BNEP L2CAP 信道）。设备不需要在数据包中包含源地址或目标地址，因为目标地址始终是接收数据包的设备地址，而源地址始终是发送数据包的设备地址。

> [!NOTE]
>
>  组播/广播目标地址不得压缩。

![BNEP_COMPRESSED_ETHERNET Packet Type Header](/images/image-20240513231014324.png)

**BNEP Type, Extension Flag (E):** 前略

**Networking Protocol Type:**	2Bytes

| Value  | 参数说明                         |
| ------ | -------------------------------- |
| 0xXXXX | 标识有效负载中包含的网络协议类型 |

#### BNEP_COMPRESSED_ETHERNET_SOURCE_ONLY数据包

用于使用 BNEP 将以太网数据包传输到设备，BNEP 是该数据包的最终目的地。设备不需要在数据包中包含目标地址，因为BNEP数据包的目标地址与发送数据包的L2CAP信道对应的地址相同。

> [!NOTE]
>
>  组播/广播目标地址不得压缩。

![BNEP_COMPRESSED_ETHERNET_SOURCE_ONLY Packet Type Header](/images/image-20240513231817589.png)

**BNEP Type, Extension Flag (E):, Source Address, NetworkingProtocol Type:** 前略



#### BNEP_COMPRESSED_ETHERNET_DEST_ONLY数据包

此数据包类型应用于从使用 BNEP 的设备传输以太网数据包，BNEP 是该数据包的发起方。设备不需要在数据包中包含源地址，因为源地址可以从 L2CAP 连接和哪个设备发送数据包来确定。

![BNEP_COMPRESSED_ETHERNET_DEST_ONLY Packet Type Header](/images/image-20240513232341701.png)

**BNEP Type, Extension Flag (E):, Destination Address, NetworkingProtocol Type:** 前略

## 扩展数据包

通过将 BNEP 报头的扩展标志设置为 1 , 来指示包含在 BNEP 标头之后的扩展标头。如果 一个BNEP 数据包中包含多个扩展标头，则扩展应按扩展类型按升序排序。

![BNEP Extension Header Format](/images/image-20240513233052961.png)

**Extension Type:**	7Bits

| Value(0x00-0x7F) | 参数说明               |
| ---------------- | ---------------------- |
| 0x00             | BNEP_EXTENSION_CONTROL |
| 0x01-0x7F        | 保留                   |

**Extension Flag (E):** 前略

**Extension Length:**	1Byte

| Value     | 参数说明                                                     |
| --------- | ------------------------------------------------------------ |
| 0x00-0xFF | 定义扩展有效负载中包含的字节数<br />此字节计数不包括用于扩展类型或扩展长度的字节。 |

**Extension Payload:**	Extension Length Byte

| Value | 参数说明     |
| ----- | ------------ |
| 0xXX  | 扩展有效负载 |



### BNEP_EXTENSION_CONTROL 数据包类型报头格式

![BNEP_EXTENSION_CONTROL Extension Header](/images/image-20240513234941531.png)

**...:** 前略
