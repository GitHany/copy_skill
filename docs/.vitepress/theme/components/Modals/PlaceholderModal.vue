<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="placeholder-modal-overlay" @click.self="$emit('close')">
        <div class="placeholder-modal">
          <div class="modal-header">
            <h3>请输入参数</h3>
            <div class="header-actions">
              <button
                v-if="hasAnyExample"
                class="btn-fill-all"
                title="一键填充所有示例值"
                @click="$emit('fill-all')"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
                一键填充
              </button>
              <button class="modal-close" @click="$emit('close')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="modal-body">
            <div v-for="param in params" :key="param.key" class="placeholder-item">
              <!-- 标签行：参数名 + 描述 + 必填标记 -->
              <div class="placeholder-label">
                <label>{{ param.key }}</label>
                <span v-if="param.description" class="param-label-desc">({{ param.description }})</span>
                <span v-if="param.required" class="required-mark">*</span>
              </div>

              <!-- 根据类型渲染不同控件 -->
              <!-- string -> input text -->
              <div v-if="param.type === 'string' || !param.type" class="input-wrapper">
                <input
                  :value="localValues[param.key]"
                  type="text"
                  :placeholder="param.example ? `示例: ${param.example}` : `请输入 ${param.key}`"
                  @input="handleInput(param.key, $event.target.value)"
                  @keydown.enter="handleConfirm"
                />
                <button
                  v-if="param.example"
                  class="btn-example"
                  title="填入示例"
                  @click="handleFillExample(param.key)"
                >填入示例</button>
              </div>

              <!-- number -> input number -->
              <div v-else-if="param.type === 'number'" class="input-wrapper">
                <input
                  :value="localValues[param.key]"
                  type="number"
                  :placeholder="param.example ? `示例: ${param.example}` : '请输入数值'"
                  @input="handleInput(param.key, $event.target.value)"
                  @keydown.enter="handleConfirm"
                />
                <button
                  v-if="param.example"
                  class="btn-example"
                  title="填入示例"
                  @click="handleFillExample(param.key)"
                >填入示例</button>
              </div>

              <!-- boolean -> switch -->
              <div v-else-if="param.type === 'boolean'" class="switch-wrapper">
                <label class="switch">
                  <input
                    :checked="localValues[param.key]"
                    type="checkbox"
                    @change="handleInput(param.key, $event.target.checked)"
                  />
                  <span class="slider"></span>
                </label>
                <span class="switch-label">{{ localValues[param.key] ? '是' : '否' }}</span>
              </div>

              <!-- array -> textarea -->
              <div v-else-if="param.type === 'array'" class="input-wrapper">
                <textarea
                  :value="localValues[param.key]"
                  rows="3"
                  :placeholder="param.example ? `示例: ${param.example}` : '请输入值，逗号分隔'"
                  @input="handleInput(param.key, $event.target.value)"
                ></textarea>
                <button
                  v-if="param.example"
                  class="btn-example"
                  title="填入示例"
                  @click="handleFillExample(param.key)"
                >填入示例</button>
              </div>

              <!-- notes 警示提示 -->
              <div v-if="param.notes" class="param-notes">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>{{ param.notes }}</span>
              </div>
            </div>

            <!-- 实时预览区域 -->
            <div v-if="previewText" class="preview-section">
              <div class="preview-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                预览
              </div>
              <pre class="preview-code">{{ previewText }}</pre>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="$emit('close')">取消</button>
            <button class="btn-confirm" @click="handleConfirm">确认并复制</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  params: {
    type: Array,
    default: () => []
  },
  values: {
    type: Object,
    default: () => ({})
  },
  commandText: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'close',
  'confirm',
  'fill-all',
  'fill-example',
  'update'
])

// 使用本地副本解决响应式同步问题
const localValues = ref({})

// 当弹窗打开或外部 values 变化时，同步到本地
watch(() => props.show, (isShow) => {
  if (isShow) {
    localValues.value = { ...props.values }
  }
}, { immediate: true })

watch(() => props.values, (newValues) => {
  localValues.value = { ...newValues }
}, { deep: true })

const handleInput = (key, value) => {
  localValues.value[key] = value
  emit('update', key, value)
}

const handleFillExample = (key) => {
  const param = props.params.find(p => p.key === key)
  if (param?.example) {
    localValues.value[key] = param.example
    emit('fill-example', key)
  }
}

const handleConfirm = () => {
  // 将本地值传回父组件，确保复制使用的是用户输入的值
  emit('confirm', localValues.value)
}

const hasAnyExample = computed(() => {
  return props.params.some(p => p.example)
})

// 实时预览：替换占位符后的命令文本
const previewText = computed(() => {
  if (!props.commandText) return ''
  return props.commandText.replace(/%\{([^}]+)\}%/g, (match, key) => {
    const val = localValues.value[key]
    return val !== undefined && val !== '' ? val : match
  })
})
</script>

<style scoped>
.placeholder-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  z-index: 10002;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-modal {
  width: 90%;
  max-width: 480px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-fill-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--accent-primary);
  border: none;
  border-radius: 6px;
  color: #0c0c0f;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-fill-all:hover {
  filter: brightness(1.1);
  transform: scale(1.05);
}

.btn-fill-all:active {
  transform: scale(0.95);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s;
}

.modal-close:hover {
  color: var(--text-primary);
  background: var(--bg-hover);
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.placeholder-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  transition: all 0.2s;
}

.placeholder-item:focus-within {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.placeholder-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.placeholder-label label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.required-mark {
  color: #ef4444;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
}

.param-label-desc {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-wrapper input,
.input-wrapper textarea {
  flex: 1;
  padding: 10px 14px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.input-wrapper textarea {
  resize: vertical;
  min-height: 60px;
}

.btn-example {
  padding: 8px 12px;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-example:hover {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: #0c0c0f;
}

.switch-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch .slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 24px;
  transition: 0.3s;
}

.switch .slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 2px;
  bottom: 2px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: 0.3s;
}

.switch input:checked + .slider {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}

.switch input:checked + .slider:before {
  transform: translateX(20px);
  background: #0c0c0f;
}

.switch-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.param-notes {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  padding: 8px 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: var(--accent-primary);
  line-height: 1.4;
}

.param-notes svg {
  flex-shrink: 0;
  margin-top: 1px;
}

.param-notes span {
  color: var(--text-secondary);
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.btn-cancel:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.btn-confirm {
  background: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: #0c0c0f;
}

.btn-confirm:hover {
  filter: brightness(1.1);
}

/* 预览区域样式 */
.preview-section {
  margin-top: 8px;
  padding: 14px;
  background: var(--bg-primary);
  border: 1px solid var(--accent-primary);
  border-radius: 10px;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--accent-primary);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-code {
  margin: 0;
  padding: 12px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-primary);
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
