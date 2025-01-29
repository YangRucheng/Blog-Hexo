---
title: 把 NoneBot 接入微信公众号 —— 写一个 Adapter
tags: 
  - Python
  - NoneBot
  - QQ Bot
cover: 'https://api.anosu.top/img/?sort=furry&_=2'
abbrlink: 63023
date: 2024-12-20 00:00:00
---

> 本篇记录写一个 [NoneBot2 Adapter for 微信公众平台](https://github.com/YangRucheng/nonebot-adapter-wxmp) 学到的语法

阅读前，默认您已经了解 [NoneBot 的构成](https://nonebot.dev/docs/tutorial/fundamentals) 并熟悉事件处理流程。
本文均以 微信公众平台使用的 WebHook 方式推送事件为例。

## 如何写一个 adapter ？

参考 [编写适配器](https://nonebot.dev/docs/developer/adapter-writing)

```
nonebot-adapter-wxmp
├── nonebot
│   ├── adapters
│   │   ├── wxmp
│   │   │   ├── __init__.py
│   │   │   ├── adapter.py
│   │   │   ├── bot.py
│   │   │   ├── config.py
│   │   │   ├── event.py
│   │   │   ├── util.py
│   │   │   ├── exception.py
│   │   │   └── message.py
├── pyproject.toml
└── README.md
```

adapter 的结果在官方文档中已有详细介绍，不在此赘述。

### adapter 中的处理流程

1. 首先由 `adapter.py` 中注册的 POST 请求处理函数 `handle_http` 处理原始请求。`handle_http` 进行验签（解密）。
2. `parse_body` 负责将 body 转为 dict。
3. `payload_to_event` 将 dict 使用 pydantic 的 model_validate 转为 `Event` 的派生类。
4. `dispatch_event` 负责分发事件，调用 `bot.handle_event(event=event)` 处理事件。如果是公众号，需要等待用户 `send` 后再返回 Response。


## 学到了什么？

### 抽象类

nonebot 实现了一个 `Bot` 抽象类，adapter 开发者应该继承基类实现平台 API。

```python
class Bot(abc.ABC):
    """Bot 基类。

    用于处理上报消息，并提供 API 调用接口。
    """
```
```python
from nonebot.adapters import Bot as BaseBot

class Bot(BaseBot):
    adapter: "Adapter"
```

如果直接实例化抽象类，将会：
```
Can't instantiate abstract class Bot with abstract method send
```
原因：Python 在尝试实例化抽象类时，会检查类中是否有未实现的抽象方法。

### 事件回调

[公众号被动回复](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Passive_user_reply_message.html)

需求场景：当使用者调用 `bot.send` 方法时，需要将 `Message` “发送” 给 `handle_http` 方法响应微信请求，而它们之间通过 NoneBot 的 handle_event 传递事件，没有直接调用关系。

方案一：定义一个全局字典，`send` 的参数写入字典，`handle_http` 轮询字典获得数据。（耗性能，高延迟）

方案二：使用 asyncio
```python
class OfficialReplyResponse:
    def __init__(self) -> None:
        self._futures: dict[int, asyncio.Future] = {}

    def set_resp(self, event_id: str, resp: Response) -> None:
        """ 设置响应 """
        if future := self._futures.get(event_id):
            future.set_result(resp)
        else:
            raise OfficialReplyError()

    async def get_resp(self, event_id: str, timeout: float) -> Response:
        """ 获取响应 """
        future = asyncio.get_event_loop().create_future()
        self._futures[event_id] = future
        try:
            return await asyncio.wait_for(future, timeout)
        finally:
            del self._futures[event_id]
```
说明：
`future = asyncio.get_event_loop().create_future()` 将创建一个 Future 对象，相当于一个“占位符”，它等待某个异步操作完成并返回结果。
当使用 `future.set_result(resp)` 时，`asyncio.wait_for(future, timeout)` 才会返回结果，否则一直 await。

### getattr 魔法函数

#### 异步函数

```python
class _ApiCall(Protocol):
    async def __call__(self, **kwargs: Any) -> Any: ...

class TestClass:
    async def call_api(self, api: str, **kwargs: Any) -> Any:
        print(f"调用 {api} 异步接口", kwargs)

    def __getattr__(self, name: str) -> "_ApiCall":
        return partial(self.call_api, name)

async def test():
    o = TestClass()
```
此时 `await o.any_func(a=1)` 与 `await o.call_api(api="any_func", a=1)` 等价

#### 同步函数

```python
class _ApiCall:
    def __call__(self, **kwargs: Any) -> Any: ...

class TestClass:
    def call_api(self, api: str, **kwargs: Any) -> Any:
        print(f"调用 {api} 同步接口", kwargs)

    def __getattr__(self, name: str) -> _ApiCall:
        def api_call(**kwargs: Any):
            return self.call_api(name, **kwargs)
        return api_call

def test():
    o = TestClass()
```
此时 `o.any_func(a=1)` 与 `o.call_api(api="any_func", a=1)` 等价
