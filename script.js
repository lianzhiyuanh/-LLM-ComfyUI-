document.addEventListener('DOMContentLoaded', () => {
  // --- 主要 UI 元素 ---
  const ideaInput = document.getElementById('idea-input');
  const generateBtn = document.getElementById('generate-btn');
  const loadingSpinner = document.getElementById('loading-spinner');

  // --- 结果显示区域 ---
  const descriptionContainer = document.getElementById('description-container');
  const descriptionDisplay = document.getElementById('description-display');
  const promptDisplayContainer = document.getElementById('prompt-display-container');
  const promptDisplay = document.getElementById('prompt-display');
  const imageDisplay = document.getElementById('image-display');

  // --- 设置面板 UI 元素 ---
  const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
  const settingsPanel = document.getElementById('settings-panel');
  const workflowSelect = document.getElementById('workflow-select');
  const modelSelect = document.getElementById('model-select');
  const samplerSelect = document.getElementById('sampler-select');
  const stepsInput = document.getElementById('steps-input');
  const cfgInput = document.getElementById('cfg-input');
  const widthInput = document.getElementById('width-input');
  const heightInput = document.getElementById('height-input');
  const fixedPromptInput = document.getElementById('fixed-prompt-input');
  const negativePromptInput = document.getElementById('negative-prompt-input');

  // --- 预设 UI 元素 ---
  const presetSelect = document.getElementById('preset-select');
  const savePresetBtn = document.getElementById('save-preset-btn');
  const deletePresetBtn = document.getElementById('delete-preset-btn');

  let allPresets = {};

  // --- 事件监听器 ---

  toggleSettingsBtn.addEventListener('click', e => {
    e.preventDefault();
    settingsPanel.classList.toggle('open');
    toggleSettingsBtn.classList.toggle('open');
  });

  generateBtn.addEventListener('click', generateImage);
  savePresetBtn.addEventListener('click', saveCurrentPreset);
  deletePresetBtn.addEventListener('click', deleteSelectedPreset);
  presetSelect.addEventListener('change', applySelectedPreset);

  // --- 核心功能函数 ---

  async function generateImage() {
    const idea = ideaInput.value.trim();
    if (!idea) {
      alert('请输入您的绘画想法！');
      return;
    }
    if (modelSelect.value === 'loading' || modelSelect.value === 'error' || !modelSelect.value) {
      alert('主模型未能成功加载，请检查 ComfyUI 是否正在运行并刷新页面。');
      return;
    }

    const params = getCurrentSettings();
    updateUIBeforeGeneration();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details?.message || errorData.error || '生成失败，请检查后端和ComfyUI的终端输出。');
      }
      const result = await response.json();
      updateUIAfterGeneration(result);
    } catch (error) {
      alert(`发生错误: ${error.message}`);
    } finally {
      resetUIAfterCompletion();
    }
  }

  // --- 预设管理函数 ---

  async function loadPresets() {
    try {
      const response = await fetch('/api/presets');
      allPresets = await response.json();
      populatePresetSelect();
      // 自动应用第一个预设（如果存在）
      if (Object.keys(allPresets).length > 0) {
        presetSelect.dispatchEvent(new Event('change'));
      }
    } catch (error) {
      console.error('加载预设失败:', error);
      alert('加载预设失败，请检查后端服务。');
    }
  }

  function populatePresetSelect() {
    presetSelect.innerHTML = '';
    for (const name in allPresets) {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      presetSelect.appendChild(option);
    }
  }

  function applySelectedPreset() {
    const presetName = presetSelect.value;
    const preset = allPresets[presetName];
    if (!preset) return;

    workflowSelect.value = preset.workflow || 'default';
    stepsInput.value = preset.steps || 25;
    cfgInput.value = preset.cfg || 7.0;
    widthInput.value = preset.width || 1024;
    heightInput.value = preset.height || 1024;
    fixedPromptInput.value = preset.fixed_prompt || '';
    negativePromptInput.value = preset.negative_prompt || '';

    // 等待模型和采样器列表加载后再设置它们的值
    waitForOptions(modelSelect, preset.model);
    waitForOptions(samplerSelect, preset.sampler);
  }

  function waitForOptions(selectElement, valueToSet) {
    if (selectElement.options.length > 1) {
      // 检查是否已加载（>1是因为有 "加载中..." 选项）
      selectElement.value = valueToSet;
    } else {
      setTimeout(() => waitForOptions(selectElement, valueToSet), 100); // 每100ms检查一次
    }
  }

  async function saveCurrentPreset() {
    const name = prompt('请输入预设名称：', '我的预设');
    if (!name) return;

    const values = getCurrentSettings(false); // false表示不包含idea

    try {
      await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, values }),
      });
      await loadPresets(); // 重新加载列表
      presetSelect.value = name; // 选中新保存的预设
      alert(`预设 "${name}" 已保存！`);
    } catch (error) {
      console.error('保存预设失败:', error);
      alert('保存预设失败。');
    }
  }

  async function deleteSelectedPreset() {
    const name = presetSelect.value;
    if (!name) {
      alert('没有可删除的预设。');
      return;
    }
    if (!confirm(`确定要删除预设 "${name}" 吗？`)) return;

    try {
      await fetch('/api/presets', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      await loadPresets(); // 重新加载列表
    } catch (error) {
      console.error('删除预设失败:', error);
      alert('删除预设失败。');
    }
  }

  // --- UI 和数据辅助函数 ---

  function getCurrentSettings(includeIdea = true) {
    const settings = {
      workflow: workflowSelect.value,
      model: modelSelect.value,
      sampler: samplerSelect.value,
      steps: parseInt(stepsInput.value, 10),
      cfg: parseFloat(cfgInput.value),
      width: parseInt(widthInput.value, 10),
      height: parseInt(heightInput.value, 10),
      fixed_prompt: fixedPromptInput.value.trim(),
      negative_prompt: negativePromptInput.value.trim(),
    };
    if (includeIdea) {
      settings.idea = ideaInput.value.trim();
    }
    return settings;
  }

  async function loadComfyUIInfo() {
    // ... (代码不变)
    try {
      const response = await fetch('/api/comfyui-info');
      if (!response.ok) throw new Error('无法连接到后端服务以获取ComfyUI信息。');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      populateSelect(modelSelect, data.models);
      populateSelect(samplerSelect, data.samplers, 'dpmpp_2m_sde');
    } catch (error) {
      console.error('加载 ComfyUI 信息失败:', error);
      modelSelect.innerHTML = `<option value="error">加载模型失败</option>`;
      samplerSelect.innerHTML = `<option value="error">加载采样器失败</option>`;
      alert(error.message);
    }
  }

  function populateSelect(selectElement, options, defaultValue = null) {
    // ... (代码不变)
    selectElement.innerHTML = '';
    if (!options || options.length === 0) {
      selectElement.innerHTML = `<option value="error">无可用选项</option>`;
      return;
    }
    options.forEach(option => {
      const opt = document.createElement('option');
      opt.value = option;
      opt.textContent = option;
      selectElement.appendChild(opt);
    });
    if (defaultValue && options.includes(defaultValue)) {
      selectElement.value = defaultValue;
    }
  }

  function updateUIBeforeGeneration() {
    // ... (代码不变)
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    loadingSpinner.classList.remove('hidden');
    descriptionContainer.classList.add('hidden');
    promptDisplayContainer.classList.add('hidden');
    imageDisplay.innerHTML = '';
  }

  function updateUIAfterGeneration(result) {
    descriptionDisplay.textContent = result.description;
    descriptionContainer.classList.remove('hidden');

    // 现在后端返回的 'prompt' 字段只包含 AI 生成的提示词
    promptDisplay.textContent = result.prompt; 
    promptDisplayContainer.classList.remove('hidden');
    
    const img = document.createElement('img');
    img.src = result.image_url;
    img.alt = '生成的图片';
    imageDisplay.appendChild(img);
  }

  function resetUIAfterCompletion() {
    // ... (代码不变)
    generateBtn.disabled = false;
    generateBtn.textContent = '生成图片';
    loadingSpinner.classList.add('hidden');
  }

  // --- 页面初始化 ---
  async function initializeApp() {
    await loadComfyUIInfo();
    await loadPresets();
  }

  initializeApp();
});
