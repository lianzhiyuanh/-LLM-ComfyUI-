# LLM-ComfyUI: AI 自动绘画应用

这是一个基于 Web 的前端应用，它连接到一个大型语言模型 (LLM) 和 ComfyUI，以实现文生图的功能。用户可以输入一个想法，应用会自动将其丰富为详细的画面描述和专业的绘画提示词，并调用 ComfyUI 生成最终的图像。

## ✨ 功能特性

- **智能提示词生成**：输入一个简单的想法，AI 将自动扩展成详细的场景描述。
- **专业标签提取**：从场景描述中提取出适合 AI 绘画的、专业的英文标签。
- **连接 ComfyUI**：将生成的提示词发送到正在运行的 ComfyUI 后端进行图像生成。
- **预设管理**：保存和加载你喜欢的绘画参数组合（模型、步数、CFG 等）。
- **实时图像预览**：在网页上直接显示生成的图片。

## 📝 使用须知

- **LLM 依赖性**: 生成提示词的质量和完整性高度依赖于您所选择和配置的大型语言模型。部分模型可能会有内容长度限制或安全策略，导致提示词被截断。您可以在应用后端的终端（命令行窗口）中查看完整的原始输出。
- **兼容性**: 本项目已在 Google Gemini 和部分第三方兼容 OpenAI 的接口上测试通过。其他 LLM 服务（如官方 OpenAI API）未经测试，可能需要对代码进行微调。

## 🚀 安装与运行

在开始之前，请确保你已经安装了 Python 3.8 或更高版本。

### 1. 克隆仓库

```bash
git clone https://github.com/YOUR_USERNAME/LLM-ComfyUI.git
cd LLM-ComfyUI
```

### 2. 创建并激活虚拟环境 (推荐)

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 配置应用

1.  将 `config.py.example` 文件复制一份并重命名为 `config.py`。
2.  打开 `config.py` 文件并根据你的需求进行配置：
    - **`LLM_PROVIDER`**: 选择你要使用的 LLM API。支持 `"google"`, `"openai"`, `"third_party"`。
    - **填写 API 凭证**: 根据你选择的 `LLM_PROVIDER`，填写对应的 API 密钥、模型名称等信息。
    - **`COMFYUI_ADDRESS`**: 你的 ComfyUI 服务器地址 (例如, `"127.0.0.1:8188"`)。

**重要**: `config.py` 文件包含了你的私密信息，并且已被 `.gitignore` 忽略，请不要将它提交到你的 Git 仓库中。

### 5. 启动服务

1.  **启动 ComfyUI**: 确保你的 ComfyUI 服务器正在后台运行。
2.  **启动本应用**: 在项目根目录运行 `start_app.bat` (Windows) 或手动执行以下命令：

    ```bash
    python server.py
    ```
3.  **访问应用**: 打开你的浏览器并访问 `http://127.0.0.1:5000`。

## 📜 免责声明 (Disclaimer)

本工具仅供技术学习和交流使用，请勿用于任何非法用途或生成有害内容。

用户通过本工具生成的任何内容，其责任由用户本人承担。开发者不对任何用户生成的内容及其可能产生的后果负责。

请在遵守您当地法律法规的前提下使用本工具。
