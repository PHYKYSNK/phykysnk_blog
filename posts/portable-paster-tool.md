# 随地大小粘：一个绕过「禁止粘贴」的键盘模拟小工具

> 交作业最烦的是什么？不是写代码，是把写好的代码贴进学习通时，发现输入框弹出一句「禁止粘贴」。

[下载 随地大小粘（免安装便携版）](assets/files/suididaxiaoZhan-portable.zip){download size="11.99 MB" note="Windows · 解压即用"}

> **使用说明**：下载后解压，双击文件夹里的 `随地大小粘.exe` 直接运行。绿色免安装，不写注册表，不需要管理员权限，可以放进 U 盘随身携带。

---

## 一、起因：一个真实的痛点

很多在线作业平台（学习通、某些 OJ 系统、问卷平台）会通过 JavaScript 拦截 `paste` 事件，禁止学生直接把代码粘贴进输入框。对已经在本机 IDE 里写完、调试好的代码来说，这意味着只能重新手敲一遍——既浪费时间，又容易敲错。

这个项目就是为解决这个问题而生的：**把要粘贴的内容交给工具，工具在操作系统底层把它「逐字敲」进目标窗口**，对网页而言，这就是一次正常的键盘输入。

## 二、原理：为什么能绕过限制

关键在于理解「禁止粘贴」到底禁的是什么。

网页禁止粘贴，本质是前端脚本监听了 `paste` 事件（也就是 `Ctrl + V`），并在事件触发时调用 `preventDefault()` 把内容拦下来。它的拦截对象是**「粘贴」这一种特定的输入通道**。

而模拟键盘走的是另一条完全不同的通道：

```
用户按下按键 → 键盘驱动 → 操作系统消息队列 → 应用接收 WM_CHAR → 网页 input 事件
```

在这条链路里，网页根本无从区分「这个按键是真人敲的，还是程序模拟的」。它看到的只是一个普通的 `input` 事件。因此，只要我们能从操作系统层注入按键，就能绕过前端的一切拦截。

## 三、技术选型：为什么不直接用现成的库

模拟键盘输入，常见的第三方方案有三个：

| 方案 | 问题 |
|------|------|
| `pynput` | 对非 ASCII 字符（中文等）支持不稳，部分特殊符号需额外处理 |
| `keyboard` | 全局热键需要管理员权限，且 2020 年后更新停滞 |
| `pyautogui` | 依赖 Pillow 等重库，打包体积大，核心仍是转调 SendInput |

而本项目选择了**零第三方依赖**的方案：直接用 Python 标准库自带的 `ctypes` 调用 Windows 原生 API。这样做有三个明确收益：

1. **无需安装任何运行依赖**，打包后即插即用；
2. **打包体积可控**，整个成品约 28 MB；
3. **行为可控**，不会引入未知的底层实现。

整个 GUI 用 Python 内置的 `tkinter`，键盘模拟用 Win32 的 `SendInput`，没有任何外部库。

## 四、核心实现：KEYEVENTF_UNICODE 的妙用

`SendInput` 是 Windows 提供的最底层输入注入 API。它通过一个 `INPUT` 结构体描述「注入什么输入」。结构体里有个关键字段组合：`wVk`（虚拟键码）、`wScan`（扫描码）和 `dwFlags`（标志位）。

常规的字符模拟，需要查虚拟键码表、处理 Shift 组合键（比如 `{` 是 `Shift + [`），碰到中文还得走输入法，实现繁琐且容易出错。

而 `SendInput` 提供了一个被很多人忽略的标志位：**`KEYEVENTF_UNICODE`**。设置它之后，`wScan` 字段可以直接填入字符的 Unicode 码点，系统会把这个字符**直接注入目标窗口**，完全绕开键盘布局和输入法。

核心代码只有 30 行：

```python
def send_unicode_char(char):
    """发送任意 Unicode 字符（包括中文、emoji 等）"""
    code = ord(char)

    # Key Down
    inp_down = INPUT()
    inp_down.type = INPUT_KEYBOARD
    inp_down.ki.wVk = 0
    inp_down.ki.wScan = code                    # 直接填 Unicode 码点
    inp_down.ki.dwFlags = KEYEVENTF_UNICODE     # 关键标志位
    ctypes.windll.user32.SendInput(
        1, ctypes.byref(inp_down), ctypes.sizeof(inp_down))

    # Key Up
    inp_up = INPUT()
    inp_up.type = INPUT_KEYBOARD
    inp_up.ki.wVk = 0
    inp_up.ki.wScan = code
    inp_up.ki.dwFlags = KEYEVENTF_UNICODE | KEYEVENTF_KEYUP
    ctypes.windll.user32.SendInput(
        1, ctypes.byref(inp_up), ctypes.sizeof(inp_up))
```

这一个小小的标志位，解决了一个大问题：**中文、英文、代码里的各种特殊符号（`{`、`}`、`[]`、`<>`、`;` 等）全部用同一条代码路径处理**，不需要为键盘布局操心。

控制键（回车、Tab）则单独用虚拟键码处理：

```python
VK_RETURN = 0x0D   # 回车
VK_TAB    = 0x09   # 制表符

def press_key(vk_code):
    _send_key(vk_code, key_up=False)
    time.sleep(0.005)
    _send_key(vk_code, key_up=True)
```

## 五、细节设计：如何让它「像真人」

单纯地全速注入字符，理论上可以，但有两个问题：一是极端速度可能触发平台的异常检测，二是观感生硬。

所以工具在逐字输入时加入了**随机延迟**：

```python
base_ms = self.typing_speed.get()          # 用户设定的基准速度
actual_ms = base_ms * random.uniform(0.6, 1.8)   # 60%~180% 随机波动
time.sleep(max(0.003, actual_ms / 1000.0))
```

每个字符的间隔在基准速度的 60%~180% 之间随机抖动，模拟真人打字时快时慢的节奏。用户可以通过滑块在 10ms~200ms 之间调整基准速度。

此外还有两个容易被忽略的字符处理细节：

1. **`\r\n` 与 `\n` 的兼容**：Windows 下复制的文本常带 `\r\n`，如果不处理，会多敲出额外的空行。代码里遇到 `\r` 时判断其后是否紧跟 `\n`，若是则跳过。
2. **Tab 缩进**：代码的缩进必须原样保留，这里用虚拟键码 `VK_TAB` 单独注入，而不是当成普通字符。

## 六、功能特性一览

| 功能 | 实现方式 |
|------|----------|
| 逐字输入 | `SendInput` + `KEYEVENTF_UNICODE` |
| 随机延迟 | 基准速度 60%~180% 随机抖动 |
| 中英文混合 | Unicode 直接注入，无需切输入法 |
| 全局热键 F9 启动 / ESC 停止 | Win32 `RegisterHotKey` + 独立消息循环线程 |
| 倒计时覆盖层 | 屏幕中央半透明大数字，提醒切换窗口 |
| 窗口置顶 | `tkinter` 的 `-topmost` 属性 |
| 窗口位置记忆 | 关闭时把几何信息写入 `.geometry.json` |
| 进度条 | 主线程 `after()` 派发，避免线程安全问题 |

其中「全局热键」值得一提：`tkinter` 的 `bind()` 只能捕获窗口获得焦点时的按键，一旦焦点切到浏览器，快捷键就失效了。要实现真正的全局热键（焦点不在工具上也能触发），必须用 Win32 的 `RegisterHotKey` 注册系统级热键，并在独立线程里跑一个消息循环（`GetMessageW` / `DispatchMessageW`）来接收 `WM_HOTKEY` 消息。

## 七、线程安全：一个容易踩的坑

`tkinter` 不是线程安全的，任何对 UI 控件的操作都必须在主线程执行。而逐字输入是耗时操作，必须放到后台线程，否则界面会卡死。

解决方式是经典的「`after()` 回调」模式：后台线程不直接碰 UI，而是通过 `window.after(0, callback)` 把更新任务派发回主线程的事件循环：

```python
def _update_status(self, message, color=None):
    """后台线程通过 after() 把状态更新安全地派发回主线程"""
    def _set():
        self.status_label.config(text=message, fg=color)
    self.window.after(0, _set)
```

进度条、状态栏文字、倒计时数字，全部走这条路径，杜绝了多线程操作 UI 的竞态问题。

## 八、打包：真正做到 U 盘即插即用

为了让工具能在机房电脑、别人的电脑上直接运行，打包用的是 PyInstaller 的 `--onedir` 模式：

```bash
pyinstaller --onedir --noconsole --name "随地大小粘" --icon icon.ico main.py
```

选 `--onedir` 而非 `--onefile` 的原因：`--onefile` 每次运行都要把程序解压到系统临时目录，而机房电脑的临时目录常常有写入限制；`--onedir` 则直接把所有依赖（Python 解释器、DLL）和 `exe` 放在同一个文件夹里，**运行时不产生任何临时文件**，也不写注册表、不需要管理员权限。

最终成品是一个约 28 MB 的文件夹，拷到 U 盘上，插上任意 Windows 电脑双击 `随地大小粘.exe` 即可使用。

## 九、使用方式

1. 在 IDE 里复制写好的代码（`Ctrl + C`）；
2. 粘贴到工具的文本框；
3. 设置录入速度（默认 50ms/字）；
4. 点击「开始录入」或按全局热键 `F9`；
5. 倒计时期间把光标点进目标平台的输入框；
6. 工具自动逐字输入完成，随时可按 `ESC` 中止。

## 十、写在最后

这个工具的定位很明确：**解决一个具体的、高频的小痛点**。它的代码量不大（约 800 行），但覆盖了几个值得玩味的点——`KEYEVENTF_UNICODE` 这个冷门标志位、`RegisterHotKey` 全局热键、`tkinter` 的线程安全边界、PyInstaller 的便携打包策略。

一个有意思的观察是：最优雅的方案往往不是引入更多依赖，而是**把系统已有的能力吃透**。`ctypes` + `SendInput` 这个组合，从头到尾只用了 Python 标准库，却比引入一整套第三方键盘库更可控、更便携。

如果你也经常被「禁止粘贴」折磨，不妨自己实现一遍——尤其是 `KEYEVENTF_UNICODE` 那一段，理解之后你会对 Windows 的输入注入机制有全新的认识。
